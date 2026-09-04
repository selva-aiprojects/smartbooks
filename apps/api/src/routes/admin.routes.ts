import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import {
  getAllCompanies,
  getSingleCompany,
  provisionCompany,
  updateCompanyDetails,
  removeCompany,
  addCompanyUser,
  updateCompanyUser,
  removeCompanyUser,
  resetPasswordForUser,
} from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, requireAdmin);

router.get('/companies', getAllCompanies);
router.get('/companies/:id', getSingleCompany);
router.post('/companies', provisionCompany);
router.patch('/companies/:id', updateCompanyDetails);
router.delete('/companies/:id', removeCompany);

router.post('/companies/:companyId/users', addCompanyUser);
router.patch('/users/:id', updateCompanyUser);
router.delete('/users/:id', removeCompanyUser);
router.post('/users/:id/reset-password', resetPasswordForUser);

export default router;
