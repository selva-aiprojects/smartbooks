import { Request, Response } from 'express';
import {
  getCustomers,
  createCustomer,
  getInvoices,
  createInvoice,
  updateInvoiceStatus,
  recordInvoicePayment,
} from '../services/invoice.service';
import { AuthRequest } from '../middleware/auth.middleware';

export async function fetchCustomers(req: AuthRequest, res: Response) {
  try {
    const customers = await getCustomers(req.user.companyId);
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function addCustomer(req: AuthRequest, res: Response) {
  try {
    const { name, email, phone, address } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Customer name is required' });
    }
    const customer = await createCustomer({
      companyId: req.user.companyId,
      name,
      email,
      phone,
      address
    });
    res.status(201).json(customer);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function fetchInvoices(req: AuthRequest, res: Response) {
  try {
    const invoices = await getInvoices(req.user.companyId);
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function addInvoice(req: AuthRequest, res: Response) {
  try {
    const { customerId, number, issueDate, dueDate, items, isInterState } = req.body;
    const invoice = await createInvoice({
      companyId: req.user.companyId,
      createdById: req.user.userId,
      customerId,
      number,
      issueDate,
      dueDate,
      isInterState,
      items
    });
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function markInvoiceStatus(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const invoice = await updateInvoiceStatus(id, status, req.user.companyId, req.user.userId);
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function addPayment(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { amount, date, method, reference } = req.body;
    const result = await recordInvoicePayment(id, { amount, date, method, reference }, req.user.companyId, req.user.userId);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
