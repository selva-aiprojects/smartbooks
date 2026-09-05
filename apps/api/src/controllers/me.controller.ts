import { Request, Response } from 'express';
import {
  getMyCompany,
  updateMyCompany,
  listMyUsers,
  addMyUser,
  updateMyUser,
  deleteMyUser,
  resetMyUserPassword,
  getAccessibleEntities,
} from '../services/me.service';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getCompanySettings(req: Request, res: Response) {
  try {
    const companyId = (req as AuthRequest).user.companyId;
    const company = await getMyCompany(companyId);
    res.json(company);
  } catch (error) {
    res.status(404).json({ error: (error as Error).message });
  }
}

export async function updateCompanySettings(req: Request, res: Response) {
  try {
    const companyId = (req as AuthRequest).user.companyId;
    const company = await updateMyCompany(companyId, req.body);
    res.json({ message: 'Organization settings updated', company });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function fetchEntities(req: Request, res: Response) {
  try {
    const userId = (req as AuthRequest).user.userId;
    const entities = await getAccessibleEntities(userId);
    res.json(entities);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getUsers(req: Request, res: Response) {
  try {
    const companyId = (req as AuthRequest).user.companyId;
    const users = await listMyUsers(companyId);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function inviteUser(req: Request, res: Response) {
  try {
    const companyId = (req as AuthRequest).user.companyId;
    const { name, email, role, password } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const user = await addMyUser(companyId, { name, email, role, password });
    res.status(201).json({ message: 'User invited successfully', user });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const companyId = (req as AuthRequest).user.companyId;
    const { name, role, status } = req.body;
    const user = await updateMyUser(companyId, req.params.id, { name, role, status });
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function removeUser(req: Request, res: Response) {
  try {
    const companyId = (req as AuthRequest).user.companyId;
    await deleteMyUser(companyId, req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function resetUserPassword(req: Request, res: Response) {
  try {
    const companyId = (req as AuthRequest).user.companyId;
    const result = await resetMyUserPassword(companyId, req.params.id);
    res.json({ message: 'Password reset link generated', ...result });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
