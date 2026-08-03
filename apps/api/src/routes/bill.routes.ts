import { Router } from 'express';
import { 
  fetchVendors, 
  addVendor, 
  fetchBills, 
  addBill, 
  markBillStatus 
} from '../controllers/bill.controller';

const router = Router();

router.get('/vendors/:companyId?', fetchVendors);
router.post('/vendors', addVendor);

router.get('/:companyId?', fetchBills);
router.post('/', addBill);
router.patch('/:id/status', markBillStatus);

export default router;
