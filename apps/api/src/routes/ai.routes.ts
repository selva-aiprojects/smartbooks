import { Router } from 'express';
import { categorize, queryAI } from '../controllers/ai.controller';

const router = Router();

router.post('/categorize', categorize);
router.post('/query', queryAI);

export default router;
