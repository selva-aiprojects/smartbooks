import { Request, Response } from 'express';
import { 
  getVendors, 
  createVendor, 
  getBills, 
  createBill, 
  updateBillStatus 
} from '../services/bill.service';
import { AuthRequest } from '../middleware/auth.middleware';

export async function fetchVendors(req: AuthRequest, res: Response) {
  try {
    const vendors = await getVendors(req.user.companyId);
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function addVendor(req: AuthRequest, res: Response) {
  try {
    const { name, email, phone, address } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Vendor name is required' });
    }
    const vendor = await createVendor({
      companyId: req.user.companyId,
      name,
      email,
      phone,
      address
    });
    res.status(201).json(vendor);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function fetchBills(req: AuthRequest, res: Response) {
  try {
    const bills = await getBills(req.user.companyId);
    res.json(bills);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function addBill(req: AuthRequest, res: Response) {
  try {
    const { vendorId, number, billDate, dueDate, items, isInterState } = req.body;
    const bill = await createBill({
      companyId: req.user.companyId,
      createdById: req.user.userId,
      vendorId,
      number,
      billDate,
      dueDate,
      isInterState,
      items
    });
    res.status(201).json(bill);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function markBillStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const bill = await updateBillStatus(id, status, req.user.companyId, req.user.userId);
    res.json(bill);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
