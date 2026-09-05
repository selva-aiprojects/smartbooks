import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import {
  getCompanySettings,
  updateCompanySettings,
  fetchEntities,
  getUsers,
  inviteUser,
  updateUser,
  removeUser,
  resetUserPassword,
} from '../controllers/me.controller';

const router = Router();

router.use(authenticate);

router.get('/entities', fetchEntities);

router.get('/company', getCompanySettings);
router.patch('/company', updateCompanySettings);

router.get('/company/users', getUsers);
router.post('/company/users', inviteUser);
router.patch('/users/:id', updateUser);
router.delete('/users/:id', removeUser);
router.post('/users/:id/reset-password', resetUserPassword);

export default router;
