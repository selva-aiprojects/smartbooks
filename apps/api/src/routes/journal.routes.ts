import { Router } from 'express';
import {
  createEntry,
  getEntries,
  getEntry
} from '../controllers/journal.controller';

const router = Router();

router.post('/', createEntry);
router.get('/', getEntries);
router.get('/company/:companyId', getEntries);
router.get('/:id', getEntry);

export default router;
