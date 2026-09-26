import { prisma } from '../lib/prisma';

export interface AuditLogInput {
  companyId: string;
  userId?: string | null;
  userEmail?: string | null;
  userName?: string | null;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'STATUS_CHANGE' | 'PAYMENT' | 'EXPORT' | 'RECONCILE' | string;
  entityType: 'INVOICE' | 'BILL' | 'JOURNAL_ENTRY' | 'ACCOUNT' | 'CUSTOMER' | 'VENDOR' | 'TAX_RATE' | 'BANK_TRANSACTION' | 'SETTINGS' | string;
  entityId: string;
  entityRef?: string | null;
  details?: string | null;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string | null;
}

export async function recordAuditLog(input: AuditLogInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        companyId: input.companyId,
        userId: input.userId || null,
        userEmail: input.userEmail || null,
        userName: input.userName || null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        entityRef: input.entityRef || null,
        details: input.details || null,
        oldValues: input.oldValues ? JSON.stringify(input.oldValues) : null,
        newValues: input.newValues ? JSON.stringify(input.newValues) : null,
        ipAddress: input.ipAddress || null,
      },
    });
  } catch (error) {
    console.error('[AuditService] Failed to record audit log:', error);
    return null;
  }
}

export async function getAuditLogs(
  companyId: string,
  filters?: {
    entityType?: string;
    action?: string;
    search?: string;
    limit?: number;
  }
) {
  const where: any = { companyId };
  if (filters?.entityType) where.entityType = filters.entityType;
  if (filters?.action) where.action = filters.action;
  if (filters?.search) {
    where.OR = [
      { entityRef: { contains: filters.search, mode: 'insensitive' } },
      { details: { contains: filters.search, mode: 'insensitive' } },
      { userName: { contains: filters.search, mode: 'insensitive' } },
      { userEmail: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: filters?.limit || 100,
  });
}
