import { Request, Response } from 'express';
import { loginUser, registerUser, getUserById, switchUserEntity } from '../services/auth.service';

export async function register(req: Request, res: Response) {
  try {
    const { email, password, companyName, currency, subdomain, plan, contactEmail, contactPhone } = req.body;
    const user = await registerUser(email, password, companyName, currency, subdomain, plan, contactEmail, contactPhone);
    res.status(201).json({ message: 'Tenant organization & admin registered successfully', user });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const { token, user } = await loginUser(email, password);
    res.json({ token, user });
  } catch (error) {
    res.status(401).json({ error: (error as Error).message });
  }
}

export async function switchEntity(req: Request, res: Response) {
  try {
    const authenticatedUser = (req as any).user;
    if (!authenticatedUser?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { companyId } = req.body;
    if (!companyId) {
      return res.status(400).json({ error: 'companyId is required' });
    }
    const result = await switchUserEntity(authenticatedUser.userId, companyId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getCurrentUser(req: Request, res: Response) {
  try {
    const authenticatedUser = (req as any).user;
    if (!authenticatedUser?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const user = await getUserById(authenticatedUser.userId);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: 'User not found' });
  }
}
