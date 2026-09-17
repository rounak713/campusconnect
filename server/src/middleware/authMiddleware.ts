import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'campusconnect_jwt_super_secure_secret_key_2026!';

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
