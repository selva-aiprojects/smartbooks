import { Request, Response } from 'express';
import { 
  getBankTransactions, 
  importBankTransactions, 
  autoMatchBankTransactions 
} from '../services/reconciliation.service';
import { AuthRequest } from '../middleware/auth.middleware';

export async function fetchBankTransactions(req: AuthRequest, res: Response) {
  try {
    const txns = await getBankTransactions(req.user.companyId);
    res.json(txns);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function uploadBankTransactions(req: AuthRequest, res: Response) {
  try {
    const { transactions } = req.body;
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res.status(400).json({ error: 'transactions array is required' });
    }
    const created = await importBankTransactions(req.user.companyId, transactions);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function matchTransactions(req: AuthRequest, res: Response) {
  try {
    const result = await autoMatchBankTransactions(req.user.companyId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
