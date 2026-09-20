import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { prisma } from '../db.js';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_jwt_super_secure_secret_key_2026!';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY;

export interface AuthenticatedUser {
  id: string;
  identityHash: string;
  collegeId: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      rawBody?: Buffer;
    }
  }
}

export class AuthMiddleware {
  /**
   * Generates a signed JWT session token.
   */
  static generateToken(user: AuthenticatedUser): string {
    return jwt.sign(user, JWT_SECRET, { expiresIn: '30d' });
  }

  /**
   * Validates JWT token from Authorization header (Bearer token).
   */
  static requireAuth(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
      req.user = decoded;
      next();
    } catch (err: any) {
      return res.status(401).json({ error: 'INVALID_TOKEN', message: err.message });
    }
  }

  /**
   * Restricts a route to admin reviewers: either a User row flagged isAdmin,
   * or a service caller presenting the X-Admin-Key shared secret.
   */
  static async requireAdmin(req: Request, res: Response, next: NextFunction) {
    const providedKey = req.headers['x-admin-key'];
    if (ADMIN_API_KEY && typeof providedKey === 'string') {
      const expected = Buffer.from(ADMIN_API_KEY, 'utf8');
      const supplied = Buffer.from(providedKey, 'utf8');
      if (expected.length === supplied.length && crypto.timingSafeEqual(expected, supplied)) {
        req.user = req.user || { id: 'service-admin', identityHash: 'service-admin', collegeId: '' };
        return next();
      }
    }

    if (!req.user) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Admin authentication required' });
    }

    const admin = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!admin?.isAdmin) {
      return res.status(403).json({ error: 'FORBIDDEN', message: 'Admin privileges required' });
    }

    return next();
  }

  /** Blocks unverified students from verified-only features. */
  static async requireVerified(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
      return res.status(401).json({ error: 'UNAUTHORIZED' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (user?.verificationStatus !== 'VERIFIED') {
      return res.status(403).json({
        error: 'NOT_VERIFIED',
        message: 'Verify your student status to use this feature',
        verificationStatus: user?.verificationStatus ?? 'UNKNOWN'
      });
    }

    return next();
  }

  /**
   * Simple in-memory sliding-window rate limiter per IP / phone.
   */
  static createRateLimiter(maxRequests: number, windowMs: number) {
    const requestsMap = new Map<string, number[]>();

    return (req: Request, res: Response, next: NextFunction) => {
      const clientKey = req.ip || req.headers['x-forwarded-for'] || 'anonymous';
      const now = Date.now();
      const timestamps = (requestsMap.get(String(clientKey)) || []).filter(
        time => now - time < windowMs
      );

      if (timestamps.length >= maxRequests) {
        return res.status(429).json({
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please slow down.'
        });
      }

      timestamps.push(now);
      requestsMap.set(String(clientKey), timestamps);
      next();
    };
  }
}
