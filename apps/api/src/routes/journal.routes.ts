import { Router } from 'express';
import {
  createEntry,
  getEntries,
  getEntry
} from '../controllers/journal.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createEntry);
router.get('/', getEntries);
router.get('/:id', getEntry);

export default router;
