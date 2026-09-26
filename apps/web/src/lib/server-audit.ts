import { prisma } from './prisma';

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

export async function logAuditEvent(input: AuditLogInput) {
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
        oldValues: input.oldValues ? (typeof input.oldValues === 'string' ? input.oldValues : JSON.stringify(input.oldValues)) : null,
        newValues: input.newValues ? (typeof input.newValues === 'string' ? input.newValues : JSON.stringify(input.newValues)) : null,
        ipAddress: input.ipAddress || null,
      },
    });
  } catch (error) {
    console.error('[AuditLog] Failed to log audit event:', error);
    return null;
  }
}

export async function fetchAuditLogs(
  companyId: string,
  options?: {
    entityType?: string;
    action?: string;
    search?: string;
    limit?: number;
  }
) {
  try {
    const where: any = { companyId };
    if (options?.entityType && options.entityType !== 'ALL') {
      where.entityType = options.entityType;
    }
    if (options?.action && options.action !== 'ALL') {
      where.action = options.action;
    }
    if (options?.search) {
      where.OR = [
        { entityRef: { contains: options.search, mode: 'insensitive' } },
        { details: { contains: options.search, mode: 'insensitive' } },
        { userName: { contains: options.search, mode: 'insensitive' } },
        { userEmail: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    return await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: options?.limit || 150,
    });
  } catch (error) {
    console.error('[AuditLog] Error fetching audit logs:', error);
    return [];
  }
}
