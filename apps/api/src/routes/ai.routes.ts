import { Router } from 'express';
import { categorize, queryAI } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/categorize', categorize);
router.post('/query', queryAI);

export default router;
