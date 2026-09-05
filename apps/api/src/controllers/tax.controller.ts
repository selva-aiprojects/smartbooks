import { Request, Response } from 'express';
import {
  getTaxRates,
  createTaxRate,
  getTaxSummary,
  updateTaxRate,
  getGstR1,
  getGstR3B,
} from '../services/tax.service';
import { AuthRequest } from '../middleware/auth.middleware';

export async function fetchRates(req: AuthRequest, res: Response) {
  try {
    const includeInactive = (req as Request).query.includeInactive === '1';
    const rates = await getTaxRates(req.user.companyId, includeInactive);
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

export async function patchRate(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, rate, active } = req.body;
    const updated = await updateTaxRate(id, req.user.companyId, { name, rate, active });
    res.json(updated);
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

export async function fetchGstr1(req: AuthRequest, res: Response) {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const defaultFrom = new Date(Date.now() - 40 * 86400000).toISOString().split('T')[0];
    const periodFrom = from || defaultFrom;
    const periodTo = to || new Date().toISOString().split('T')[0];
    const report = await getGstR1(req.user.companyId, periodFrom, periodTo);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function fetchGstr3b(req: AuthRequest, res: Response) {
  try {
    const { from, to } = req.query as { from?: string; to?: string };
    const defaultFrom = new Date(Date.now() - 40 * 86400000).toISOString().split('T')[0];
    const periodFrom = from || defaultFrom;
    const periodTo = to || new Date().toISOString().split('T')[0];
    const report = await getGstR3B(req.user.companyId, periodFrom, periodTo);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}