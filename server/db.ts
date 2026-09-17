import { MongoClient, Db } from 'mongodb';
import fs from 'fs';
import path from 'path';

// Storage directories and local fallback paths
const DATA_DIR = path.join(process.cwd(), 'data');
const LOCAL_DB_FILE = path.join(DATA_DIR, 'mongodb_store.json');

// Interface for collection operations to match MongoDB collection subset
export interface IMongoCollection<T = any> {
  findOne(query: any): Promise<T | null>;
  find(query?: any): {
    sort(sortSpec: any): {
      toArray(): Promise<T[]>;
    };
    toArray(): Promise<T[]>;
  };
  insertOne(doc: T): Promise<{ insertedId: string; acknowledged: boolean }>;
  updateOne(filter: any, update: any, options?: any): Promise<{ modifiedCount: number; matchedCount: number }>;
  updateMany(filter: any, update: any): Promise<{ modifiedCount: number; matchedCount: number }>;
  deleteOne(filter: any): Promise<{ deletedCount: number }>;
  countDocuments(query?: any): Promise<number>;
}

// Fallback in-memory and file-persisted Document Store (MongoDB compatible)
class EmbeddedCollection<T extends Record<string, any>> implements IMongoCollection<T> {
  private name: string;
  private getStore: () => Record<string, any[]>;
  private saveStore: () => void;

  constructor(name: string, getStore: () => Record<string, any[]>, saveStore: () => void) {
    this.name = name;
    this.getStore = getStore;
    this.saveStore = saveStore;
  }

  private get items(): T[] {
    const store = this.getStore();
    if (!store[this.name]) {
      store[this.name] = [];
    }
    return store[this.name] as T[];
  }

  private matches(item: any, query: any): boolean {
    if (!query || Object.keys(query).length === 0) return true;
    for (const key of Object.keys(query)) {
      if (key === '$or' && Array.isArray(query.$or)) {
        const orMatch = query.$or.some((subQ: any) => this.matches(item, subQ));
        if (!orMatch) return false;
        continue;
      }
      if (query[key] && typeof query[key] === 'object' && query[key].$ne !== undefined) {
        if (item[key] === query[key].$ne) return false;
        continue;
      }
      if (query[key] && typeof query[key] === 'object' && query[key].$in !== undefined) {
        if (!query[key].$in.includes(item[key])) return false;
        continue;
      }
      if (item[key] !== query[key]) {
        return false;
      }
    }
    return true;
  }

  async findOne(query: any): Promise<T | null> {
    const found = this.items.find((item) => this.matches(item, query));
    return found ? JSON.parse(JSON.stringify(found)) : null;
  }

  find(query: any = {}) {
    const matched = this.items.filter((item) => this.matches(item, query));
    let result = [...matched];

    const sortObj = {
      sort: (sortSpec: Record<string, number>) => {
        const [field, dir] = Object.entries(sortSpec)[0] || [];
        if (field) {
          result.sort((a, b) => {
            if (a[field] < b[field]) return dir === 1 ? -1 : 1;
            if (a[field] > b[field]) return dir === 1 ? 1 : -1;
            return 0;
          });
        }
        return {
          toArray: async () => JSON.parse(JSON.stringify(result)),
        };
      },
      toArray: async () => JSON.parse(JSON.stringify(result)),
    };

    return sortObj;
  }

  async insertOne(doc: T): Promise<{ insertedId: string; acknowledged: boolean }> {
    const id = doc.id || doc._id || `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const newDoc = {
      ...doc,
      _id: id,
      id: doc.id || id,
      createdAt: doc.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.items.push(newDoc as unknown as T);
    this.saveStore();
    return { insertedId: id, acknowledged: true };
  }

  async updateOne(filter: any, update: any, options: any = {}): Promise<{ modifiedCount: number; matchedCount: number }> {
    const index = this.items.findIndex((item) => this.matches(item, filter));
    if (index === -1) {
      if (options.upsert) {
        const newDoc = { ...filter, ...(update.$set || update) };
        await this.insertOne(newDoc as unknown as T);
        return { modifiedCount: 1, matchedCount: 0 };
      }
      return { modifiedCount: 0, matchedCount: 0 };
    }

    const current = this.items[index];
    let updated = { ...current };

    if (update.$set) {
      updated = { ...updated, ...update.$set, updatedAt: new Date().toISOString() };
    } else {
      updated = { ...updated, ...update, updatedAt: new Date().toISOString() };
    }

    if (update.$inc) {
      const record = updated as Record<string, any>;
      for (const [field, incBy] of Object.entries(update.$inc)) {
        record[field] = (Number(record[field]) || 0) + Number(incBy);
      }
    }

    this.items[index] = updated;
    this.saveStore();
    return { modifiedCount: 1, matchedCount: 1 };
  }

  async updateMany(filter: any, update: any): Promise<{ modifiedCount: number; matchedCount: number }> {
    let matchedCount = 0;
    let modifiedCount = 0;

    for (let i = 0; i < this.items.length; i++) {
      if (this.matches(this.items[i], filter)) {
        matchedCount++;
        let updated = { ...this.items[i] };
        if (update.$set) {
          updated = { ...updated, ...update.$set, updatedAt: new Date().toISOString() };
        }
        if (update.$inc) {
          const record = updated as Record<string, any>;
          for (const [field, incBy] of Object.entries(update.$inc)) {
            record[field] = (Number(record[field]) || 0) + Number(incBy);
          }
        }
        this.items[i] = updated;
        modifiedCount++;
      }
    }

    if (modifiedCount > 0) {
      this.saveStore();
    }
    return { modifiedCount, matchedCount };
  }

  async deleteOne(filter: any): Promise<{ deletedCount: number }> {
    const index = this.items.findIndex((item) => this.matches(item, filter));
    if (index === -1) return { deletedCount: 0 };
    this.items.splice(index, 1);
    this.saveStore();
    return { deletedCount: 1 };
  }

  async countDocuments(query: any = {}): Promise<number> {
    return this.items.filter((item) => this.matches(item, query)).length;
  }
}

// Database Connection Manager
class DatabaseManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnectedToRealMongo = false;
  private store: Record<string, any[]> = {};

  constructor() {
    this.initLocalStorage();
  }

  private initLocalStorage() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(LOCAL_DB_FILE)) {
        const raw = fs.readFileSync(LOCAL_DB_FILE, 'utf-8');
        this.store = JSON.parse(raw);
      } else {
        this.store = {
          users: [],
          tasks: [],
          screentime: [],
          focus_sessions: [],
          analytics: [],
        };
        this.persistLocalStorage();
      }
    } catch (err) {
      console.warn('Initializing default in-memory database store:', err);
      this.store = { users: [], tasks: [], screentime: [], focus_sessions: [], analytics: [] };
    }
  }

  private persistLocalStorage() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(LOCAL_DB_FILE, JSON.stringify(this.store, null, 2), 'utf-8');
    } catch (err) {
      console.error('Error saving local database store:', err);
    }
  }

  async connect(): Promise<boolean> {
    const uri = process.env.MONGODB_URI?.trim();
    const remoteMongoDisabled = process.env.DISABLE_REMOTE_MONGO === 'true';

    if (remoteMongoDisabled || !uri) {
      console.log('MongoDB: Remote MongoDB disabled or no MONGODB_URI provided. Running in persistent embedded document mode (Mongo compatible).');
      this.isConnectedToRealMongo = false;
      this.seedDefaultDataIfEmpty();
      return true;
    }

    try {
      console.log('MongoDB: Attempting connection to remote MongoDB instance...');
      this.client = new MongoClient(uri, { serverSelectionTimeoutMS: 4000 });
      await this.client.connect();
      this.db = this.client.db();
      this.isConnectedToRealMongo = true;
      console.log('MongoDB: Successfully connected to MongoDB Database!');
      return true;
    } catch (err: any) {
      console.warn('MongoDB: Could not connect to remote MongoDB URI (' + err.message + '). Falling back to embedded persistent database.');
      this.isConnectedToRealMongo = false;
      this.seedDefaultDataIfEmpty();
      return false;
    }
  }

  getCollection<T extends Record<string, any>>(name: string): IMongoCollection<T> {
    if (this.isConnectedToRealMongo && this.db) {
      const realCol = this.db.collection(name);
      return {
        findOne: async (query) => (await realCol.findOne(query)) as unknown as T | null,
        find: (query = {}) => ({
          sort: (sortSpec: any) => ({
            toArray: async () => (await realCol.find(query).sort(sortSpec).toArray()) as unknown as T[],
          }),
          toArray: async () => (await realCol.find(query).toArray()) as unknown as T[],
        }),
        insertOne: async (doc: any) => {
          const res = await realCol.insertOne(doc);
          return { insertedId: res.insertedId.toString(), acknowledged: res.acknowledged };
        },
        updateOne: async (filter: any, update: any, options: any) => {
          const res = await realCol.updateOne(filter, update, options);
          return { modifiedCount: res.modifiedCount, matchedCount: res.matchedCount };
        },
        updateMany: async (filter: any, update: any) => {
          const res = await realCol.updateMany(filter, update);
          return { modifiedCount: res.modifiedCount, matchedCount: res.matchedCount };
        },
        deleteOne: async (filter: any) => {
          const res = await realCol.deleteOne(filter);
          return { deletedCount: res.deletedCount };
        },
        countDocuments: (query = {}) => realCol.countDocuments(query),
      };
    }

    return new EmbeddedCollection<T>(
      name,
      () => this.store,
      () => this.persistLocalStorage()
    );
  }

  getStatus() {
    return {
      connected: true,
      engine: this.isConnectedToRealMongo ? 'Remote MongoDB (Driver)' : 'Embedded Persistent MongoDB Store',
      storageFile: LOCAL_DB_FILE,
      collections: {
        users: this.store.users?.length || 0,
        tasks: this.store.tasks?.length || 0,
        screentime: this.store.screentime?.length || 0,
        focus_sessions: this.store.focus_sessions?.length || 0,
      },
    };
  }

  private seedDefaultDataIfEmpty() {
    // Seed default student demo account if no users exist
    if (!this.store.users || this.store.users.length === 0) {
      const demoUser = {
        id: 'user_priya_demo',
        name: 'Priya Raman',
        email: 'student@university.edu',
        passwordHash: '$2a$10$wO0G7fN2n8B.ZtX48eQ32O0wW4hU4Y7ZtL9c47Q4C6KkP7O9yB1O2', // password123
        college: 'National Institute of Technology',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Priya',
        streakDays: 4,
        level: 2,
        xp: 450,
        targetMilestone: 'Placement Interview Prep',
        selectedGoals: ['Placement Interviews', 'Semester Exam Prep'],
        dailySocialBudgetMinutes: 45,
        socialTimeUsedMinutes: 20,
        aiProactivity: 'balanced',
        activeTheme: 'nature',
        petCompanionEnabled: true,
        hapticFeedbackEnabled: true,
        offlineCacheEnabled: true,
        notificationsEnabled: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.store.users = [demoUser];

      // Seed 3 starter tasks as specified in the document Screen 6
      this.store.tasks = [
        {
          id: 'task_1',
          userId: 'user_priya_demo',
          title: 'Review Dynamic Programming Trees',
          tag: 'Core Placement',
          durationMinutes: 45,
          status: 'active',
          priority: 'high',
          isMicroTask: false,
          order: 1,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'task_2',
          userId: 'user_priya_demo',
          title: 'Complete OS Assignment 3',
          tag: 'Semester',
          durationMinutes: 30,
          status: 'queued',
          priority: 'medium',
          isMicroTask: false,
          order: 2,
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: 'task_3',
          userId: 'user_priya_demo',
          title: 'Review 5 System Design Flashcards',
          tag: 'Core Placement',
          durationMinutes: 10,
          status: 'queued',
          priority: 'low',
          isMicroTask: true, // micro-task to unlock 15m social time
          order: 3,
          createdAt: new Date().toISOString(),
        },
      ];

      // Screen time default tracker
      this.store.screentime = [
        {
          id: 'st_instagram',
          userId: 'user_priya_demo',
          appName: 'Instagram',
          minutesUsed: 20,
          dailyAllowance: 45,
          unlockedExtraMinutes: 0,
          lastUpdated: new Date().toISOString(),
        },
      ];

      this.persistLocalStorage();
      console.log('MongoDB: Seeded default initial demo student records into database.');
    }
  }
}

export const dbManager = new DatabaseManager();
