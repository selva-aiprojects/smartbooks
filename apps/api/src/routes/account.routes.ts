import { Router } from 'express';
import { fetchAccounts, addAccount } from '../controllers/account.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', fetchAccounts);
router.post('/', addAccount);

export default router;
