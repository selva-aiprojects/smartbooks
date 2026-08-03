import { Router } from 'express';
import { 
  fetchBankTransactions, 
  uploadBankTransactions, 
  matchTransactions 
} from '../controllers/reconciliation.controller';

const router = Router();

router.get('/:companyId?', fetchBankTransactions);
router.post('/import', uploadBankTransactions);
router.post('/auto-match', matchTransactions);

export default router;
