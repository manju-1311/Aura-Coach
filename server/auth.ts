import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { dbManager } from './db.js';
import { UserProfile } from '../src/types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'aura_coach_jwt_super_secret_key_change_in_production';

export interface AuthRequest extends Request {
  user?: UserProfile;
}

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function generateToken(user: { id: string; email: string; name: string }): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const usersCol = dbManager.getCollection<any>('users');
    const user = await usersCol.findOne({ id: decoded.id });

    if (!user) {
      res.status(401).json({ error: 'User not found or session expired' });
      return;
    }

    // Exclude passwordHash from user object
    const { passwordHash, ...safeUser } = user;
    req.user = safeUser as UserProfile;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}
