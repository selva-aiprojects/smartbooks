import { Request, Response } from 'express';
import { categorizeTransaction, askAccountingAI } from '../services/ai.service';
import { AuthRequest } from '../middleware/auth.middleware';

export async function categorize(req: AuthRequest, res: Response) {
  try {
    const { description, amount } = req.body;
    if (!description) {
      return res.status(400).json({ error: 'description is required' });
    }
    const result = await categorizeTransaction(req.user.companyId, description, amount || 0);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function queryAI(req: AuthRequest, res: Response) {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'query is required' });
    }
    const answer = await askAccountingAI(req.user.companyId, query);
    res.json({ answer });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
