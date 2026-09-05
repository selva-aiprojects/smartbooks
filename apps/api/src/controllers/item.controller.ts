import { Request, Response } from 'express';
import { getItems, createItem, deleteItem } from '../services/item.service';
import { AuthRequest } from '../middleware/auth.middleware';

export async function fetchItems(req: AuthRequest, res: Response) {
  try {
    const items = await getItems(req.user.companyId);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function addItem(req: AuthRequest, res: Response) {
  try {
    const { name, sku, category, hsnCode, unit, rate, gstRate, stock, location } = req.body;
    const item = await createItem({
      companyId: req.user.companyId,
      name,
      sku,
      category,
      hsnCode,
      unit,
      rate,
      gstRate,
      stock,
      location
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function removeItem(req: AuthRequest, res: Response) {
  try {
    await deleteItem(req.params.id, req.user.companyId);
    res.json({ ok: true });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}