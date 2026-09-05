import { Router } from 'express';
import { 
  fetchVendors, 
  addVendor, 
  fetchBills, 
  addBill, 
  recordBillPaymentController,
  markBillStatus 
} from '../controllers/bill.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/vendors', fetchVendors);
router.post('/vendors', addVendor);

router.get('/', fetchBills);
router.post('/', addBill);
router.patch('/:id/status', markBillStatus);
router.post('/:id/payments', recordBillPaymentController);

export default router;
