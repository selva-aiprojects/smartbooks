import { Request, Response } from 'express';
import { 
  getVendors, 
  createVendor, 
  getBills, 
  createBill, 
  updateBillStatus 
} from '../services/bill.service';

export async function fetchVendors(req: Request, res: Response) {
  try {
    const companyId = req.params.companyId || (req as any).user?.companyId;
    const vendors = await getVendors(companyId);
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function addVendor(req: Request, res: Response) {
  try {
    const vendor = await createVendor(req.body);
    res.status(201).json(vendor);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function fetchBills(req: Request, res: Response) {
  try {
    const companyId = req.params.companyId || (req as any).user?.companyId;
    const bills = await getBills(companyId);
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function addBill(req: Request, res: Response) {
  try {
    const bill = await createBill(req.body);
    res.status(201).json(bill);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function markBillStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const bill = await updateBillStatus(id, status);
    res.json(bill);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
