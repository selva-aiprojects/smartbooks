import { Response } from 'express';
import { getProfitLoss, getTrialBalance, getAging } from '../services/report.service';
import { AuthRequest } from '../middleware/auth.middleware';

export async function fetchProfitLoss(req: AuthRequest, res: Response) {
  try {
    const { from, to } = req.query;
    const report = await getProfitLoss(
      req.user.companyId,
      typeof from === 'string' ? from : null,
      typeof to === 'string' ? to : null
    );
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function fetchTrialBalance(req: AuthRequest, res: Response) {
  try {
    const { from, to } = req.query;
    const report = await getTrialBalance(
      req.user.companyId,
      typeof from === 'string' ? from : null,
      typeof to === 'string' ? to : null
    );
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function fetchAging(req: AuthRequest, res: Response) {
  try {
    const report = await getAging(req.user.companyId);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}