import { Request, Response } from 'express';
import {
  createJournalEntry,
  getJournalEntries,
  getJournalEntryById
} from '../services/journal.service';
import { AuthRequest } from '../middleware/auth.middleware';

export async function createEntry(req: AuthRequest, res: Response) {
  try {
    const companyId = req.user.companyId;
    const { date, description, status, lines } = req.body;
    const entry = await createJournalEntry({
      companyId,
      date: date || new Date(),
      description,
      status,
      createdById: req.user.userId,
      lines
    });
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getEntries(req: AuthRequest, res: Response) {
  try {
    const entries = await getJournalEntries(req.user.companyId);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function getEntry(req: AuthRequest, res: Response) {
  try {
    const entry = await getJournalEntryById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    if (entry.companyId !== req.user.companyId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
