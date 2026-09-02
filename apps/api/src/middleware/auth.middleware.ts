import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../core/config';
import { AuthenticatedUser } from '../types';

export interface AuthRequest extends Request {
  user: AuthenticatedUser;
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.header('Authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, config.jwt_secret_key) as AuthenticatedUser;
    if (!decoded?.userId || !decoded?.companyId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }
    (req as AuthRequest).user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
