import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { config } from '../config/env.js';
import { User, IUser } from '../models/User.js';

interface JwtPayload {
  userId: string;
  role?: string;
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtAccessSecret) as JwtPayload;

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User account not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired access token' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): any => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
  }
  next();
};

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  validate: { xForwardedForHeader: false },
  skip: (req: Request) => {
    return req.path === '/me' || req.path === '/refresh';
  },
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});
