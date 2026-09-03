import { Request, Response } from 'express';
import { getAccounts, createAccount } from '../services/account.service';
import { AuthRequest } from '../middleware/auth.middleware';

export async function fetchAccounts(req: AuthRequest, res: Response) {
  try {
    const accounts = await getAccounts(req.user.companyId);
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function addAccount(req: AuthRequest, res: Response) {
  try {
    const { name, code, type, balance } = req.body;
    const account = await createAccount({
      companyId: req.user.companyId,
      name,
      code,
      type,
      balance
    });
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
