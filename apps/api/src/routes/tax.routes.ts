import { Router } from 'express';
import { fetchRates, addRate, fetchSummary } from '../controllers/tax.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/rates', fetchRates);
router.post('/rates', addRate);
router.get('/summary', fetchSummary);

export default router;