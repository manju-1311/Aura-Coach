import { Response } from 'express';
import { SyncEnvelope } from '../src/types.js';

interface ClientConnection {
  userId: string;
  res: Response;
  lastPing: number;
}

class SyncEngine {
  private clients: Map<string, ClientConnection[]> = new Map();

  constructor() {
    // Keep-alive heartbeat every 25 seconds to prevent connection drops in cloud containers
    setInterval(() => {
      this.broadcastHeartbeat();
    }, 25000);
  }

  addClient(userId: string, res: Response) {
    if (!this.clients.has(userId)) {
      this.clients.set(userId, []);
    }
    const userClients = this.clients.get(userId)!;
    const connection: ClientConnection = { userId, res, lastPing: Date.now() };
    userClients.push(connection);

    // Initial handshake
    res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() })}\n\n`);

    // Clean up when client disconnects
    res.on('close', () => {
      const current = this.clients.get(userId) || [];
      this.clients.set(
        userId,
        current.filter((c) => c !== connection)
      );
    });
  }

  broadcastToUser(userId: string, envelope: SyncEnvelope) {
    const userClients = this.clients.get(userId);
    if (!userClients || userClients.length === 0) return;

    const payload = `data: ${JSON.stringify(envelope)}\n\n`;
    for (const client of userClients) {
      try {
        client.res.write(payload);
      } catch (err) {
        console.warn('SyncEngine: Error writing to client connection', err);
      }
    }
  }

  private broadcastHeartbeat() {
    const pingData = `event: ping\ndata: ${JSON.stringify({ time: Date.now() })}\n\n`;
    for (const [userId, clientList] of this.clients.entries()) {
      for (const client of clientList) {
        try {
          client.res.write(pingData);
        } catch {
          // handled on close
        }
      }
    }
  }

  getConnectedCount(userId?: string): number {
    if (userId) {
      return this.clients.get(userId)?.length || 0;
    }
    let total = 0;
    for (const list of this.clients.values()) {
      total += list.length;
    }
    return total;
  }
}

export const syncEngine = new SyncEngine();
