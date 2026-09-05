import { Router } from 'express';
import { fetchProfitLoss, fetchTrialBalance, fetchAging } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/profit-loss', fetchProfitLoss);
router.get('/trial-balance', fetchTrialBalance);
router.get('/aging', fetchAging);

export default router;