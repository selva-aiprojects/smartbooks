import { Router } from 'express';
import { categorize, queryAI, streamAI } from '../controllers/ai.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/categorize', categorize);
router.post('/query', queryAI);
router.post('/stream', streamAI);   // NEW: SSE streaming endpoint

export default router;
