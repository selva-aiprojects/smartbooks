import { Router } from 'express';
import { 
  fetchCustomers, 
  addCustomer, 
  fetchInvoices, 
  addInvoice, 
  markInvoiceStatus,
  addPayment 
} from '../controllers/invoice.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/customers', fetchCustomers);
router.post('/customers', addCustomer);

router.get('/', fetchInvoices);
router.post('/', addInvoice);
router.patch('/:id/status', markInvoiceStatus);
router.post('/:id/payments', addPayment);

export default router;
