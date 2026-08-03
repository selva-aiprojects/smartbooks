import { Router } from 'express';
import { 
  fetchCustomers, 
  addCustomer, 
  fetchInvoices, 
  addInvoice, 
  markInvoiceStatus 
} from '../controllers/invoice.controller';

const router = Router();

router.get('/customers/:companyId?', fetchCustomers);
router.post('/customers', addCustomer);

router.get('/:companyId?', fetchInvoices);
router.post('/', addInvoice);
router.patch('/:id/status', markInvoiceStatus);

export default router;
