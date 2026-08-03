import { Request, Response } from 'express';
import { 
  getBankTransactions, 
  importBankTransactions, 
  autoMatchBankTransactions 
} from '../services/reconciliation.service';

export async function fetchBankTransactions(req: Request, res: Response) {
  try {
    const companyId = req.params.companyId || (req as any).user?.companyId;
    const txns = await getBankTransactions(companyId);
    res.json(txns);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function uploadBankTransactions(req: Request, res: Response) {
  try {
    const { companyId, transactions } = req.body;
    const created = await importBankTransactions(companyId, transactions);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function matchTransactions(req: Request, res: Response) {
  try {
    const { companyId } = req.body;
    const result = await autoMatchBankTransactions(companyId);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
