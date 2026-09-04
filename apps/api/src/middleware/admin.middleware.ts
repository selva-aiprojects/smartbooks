import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from './auth.middleware';

function isSuperAdminEmail(email: string): boolean {
  const e = email.toLowerCase();
  return e.includes('superadmin') || e.endsWith('@smartbooks.com') || e.endsWith('@smartbooks.ai');
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as AuthRequest).user;
  if (!user?.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: { email: true },
    });
    if (!dbUser || !isSuperAdminEmail(dbUser.email)) {
      return res.status(403).json({ error: 'Forbidden: Super-admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Admin authorization failed' });
  }
}
