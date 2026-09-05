import { Router } from 'express';
import { fetchRates, addRate, patchRate, fetchSummary, fetchGstr1, fetchGstr3b } from '../controllers/tax.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/rates', fetchRates);
router.post('/rates', addRate);
router.patch('/rates/:id', patchRate);
router.get('/summary', fetchSummary);
router.get('/gstr1', fetchGstr1);
router.get('/gstr3b', fetchGstr3b);

export default router;