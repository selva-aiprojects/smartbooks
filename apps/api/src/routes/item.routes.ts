import { Router } from 'express';
import { fetchItems, addItem, removeItem } from '../controllers/item.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', fetchItems);
router.post('/', addItem);
router.delete('/:id', removeItem);

export default router;