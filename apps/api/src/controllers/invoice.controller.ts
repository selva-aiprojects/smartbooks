import { Request, Response } from 'express';
import { 
  getCustomers, 
  createCustomer, 
  getInvoices, 
  createInvoice, 
  updateInvoiceStatus 
} from '../services/invoice.service';

export async function fetchCustomers(req: Request, res: Response) {
  try {
    const companyId = req.params.companyId || (req as any).user?.companyId;
    const customers = await getCustomers(companyId);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function addCustomer(req: Request, res: Response) {
  try {
    const customer = await createCustomer(req.body);
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function fetchInvoices(req: Request, res: Response) {
  try {
    const companyId = req.params.companyId || (req as any).user?.companyId;
    const invoices = await getInvoices(companyId);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function addInvoice(req: Request, res: Response) {
  try {
    const invoice = await createInvoice(req.body);
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function markInvoiceStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const invoice = await updateInvoiceStatus(id, status);
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
