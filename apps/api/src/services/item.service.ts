import { prisma } from '../lib/prisma';

export async function getItems(companyId: string) {
  return await prisma.item.findMany({
    where: { companyId, active: true },
    orderBy: { name: 'asc' }
  });
}

export async function createItem(data: {
  companyId: string;
  name: string;
  sku: string;
  category?: string | null;
  hsnCode?: string | null;
  unit?: string;
  rate?: number;
  gstRate?: number;
  stock?: number;
  location?: string | null;
}) {
  const { companyId, name, sku, category, hsnCode, unit, rate, gstRate, stock, location } = data;

  if (!name || !name.trim()) {
    throw new Error('Item name is required');
  }
  if (!sku || !sku.trim()) {
    throw new Error('SKU code is required');
  }
  const gst = Number(gstRate) || 0;
  if (gst < 0 || gst > 100) {
    throw new Error('GST rate must be between 0 and 100%');
  }

  const existing = await prisma.item.findUnique({
    where: { companyId_sku: { companyId, sku: sku.trim().toUpperCase() } }
  });
  if (existing) {
    throw new Error(`SKU "${sku.trim().toUpperCase()}" already exists for this company`);
  }

  return await prisma.item.create({
    data: {
      companyId,
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      category: category || null,
      hsnCode: hsnCode || null,
      unit: unit || 'Nos',
      rate: rate ?? 0,
      gstRate: gst,
      stock: stock ?? 0,
      location: location || null
    }
  });
}

export async function deleteItem(id: string, companyId: string) {
  const existing = await prisma.item.findFirst({ where: { id, companyId } });
  if (!existing) {
    throw new Error('Item not found or does not belong to this company');
  }
  return await prisma.item.update({
    where: { id },
    data: { active: false }
  });
}