import { Router } from 'express';
import { 
  fetchBankTransactions, 
  uploadBankTransactions, 
  matchTransactions 
} from '../controllers/reconciliation.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', fetchBankTransactions);
router.post('/import', uploadBankTransactions);
router.post('/auto-match', matchTransactions);

export default router;
