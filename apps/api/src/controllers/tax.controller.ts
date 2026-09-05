import { Request, Response } from 'express';
import { getTaxRates, createTaxRate, getTaxSummary } from '../services/tax.service';
import { AuthRequest } from '../middleware/auth.middleware';

export async function fetchRates(req: AuthRequest, res: Response) {
  try {
    const rates = await getTaxRates(req.user.companyId);
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function addRate(req: AuthRequest, res: Response) {
  try {
    const { name, rate } = req.body;
    const created = await createTaxRate(req.user.companyId, name, rate);
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function fetchSummary(req: AuthRequest, res: Response) {
  try {
    const summary = await getTaxSummary(req.user.companyId);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}