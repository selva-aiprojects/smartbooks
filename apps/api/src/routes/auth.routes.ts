import { Router } from 'express';
import { register, login, getCurrentUser, switchEntity } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/switch-entity', authenticate, switchEntity);
router.get('/me', authenticate, getCurrentUser);

export default router;
