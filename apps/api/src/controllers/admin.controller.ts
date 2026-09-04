import { Request, Response } from 'express';
import {
  listCompanies,
  getCompany,
  createCompany,
  updateCompany,
  deleteCompany,
  addUser,
  updateUser,
  deleteUser,
  resetUserPassword,
} from '../services/admin.service';

export async function getAllCompanies(_req: Request, res: Response) {
  try {
    const companies = await listCompanies();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function getSingleCompany(req: Request, res: Response) {
  try {
    const company = await getCompany(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
}

export async function provisionCompany(req: Request, res: Response) {
  try {
    const { name, adminName, adminEmail, adminPhone, password, currency, subdomain, plan, seatLimit, gstin } = req.body;
    if (!name || !adminEmail) {
      return res.status(400).json({ error: 'Organization name and admin email are required' });
    }
    const company = await createCompany({
      name,
      adminName,
      adminEmail,
      adminPhone,
      password,
      currency,
      subdomain,
      plan,
      seatLimit,
      gstin,
    });
    res.status(201).json({ message: 'Tenant organization provisioned successfully', company });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function updateCompanyDetails(req: Request, res: Response) {
  try {
    const company = await updateCompany(req.params.id, req.body);
    res.json({ message: 'Subscription updated successfully', company });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function removeCompany(req: Request, res: Response) {
  try {
    await deleteCompany(req.params.id);
    res.json({ message: 'Tenant organization deleted' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function addCompanyUser(req: Request, res: Response) {
  try {
    const { name, email, role, password } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const user = await addUser(req.params.companyId, { name, email, role, password });
    res.status(201).json({ message: 'User invited successfully', user });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function updateCompanyUser(req: Request, res: Response) {
  try {
    const { name, role, status } = req.body;
    const user = await updateUser(req.params.id, { name, role, status });
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function removeCompanyUser(req: Request, res: Response) {
  try {
    await deleteUser(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}

export async function resetPasswordForUser(req: Request, res: Response) {
  try {
    const result = await resetUserPassword(req.params.id);
    res.json({ message: 'Password reset link generated', ...result });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
}
