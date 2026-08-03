import { Request, Response } from 'express';
import { categorizeTransaction, askAccountingAI } from '../services/ai.service';

export async function categorize(req: Request, res: Response) {
  try {
    const { description, amount } = req.body;
    const result = await categorizeTransaction(description, amount);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function queryAI(req: Request, res: Response) {
  try {
    const { query } = req.body;
    const answer = await askAccountingAI(query);
    res.json({ answer });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
