import { Request, Response } from 'express';
import {
  createJournalEntry,
  getJournalEntries,
  getJournalEntryById
} from '../services/journal.service';

export async function createEntry(req: Request, res: Response) {
  try {
    const entry = await createJournalEntry(req.body);
    res.status(201).json(entry);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function getEntries(req: Request, res: Response) {
  try {
    const entries = await getJournalEntries(req.params.companyId);
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function getEntry(req: Request, res: Response) {
  try {
    const entry = await getJournalEntryById(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json(entry);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}
