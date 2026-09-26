import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';
import { getAuthUserFromRequest } from '../../../lib/server-auth';
import { logAuditEvent } from '../../../lib/server-audit';

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, rows } = await req.json();

    if (!type || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: 'Valid import type and non-empty rows array required' }, { status: 400 });
    }

    const companyId = user.companyId;
    let importedCount = 0;

    if (type === 'accounts') {
      for (const row of rows) {
        const code = String(row.code || row.Code || '').trim();
        const name = String(row.name || row.Name || '').trim();
        const accType = String(row.type || row.Type || 'Expense').trim();
        const balance = parseFloat(String(row.balance || row.Balance || '0').replace(/,/g, '')) || 0;

        if (!code || !name) continue;

        await prisma.account.upsert({
          where: { companyId_code: { companyId, code } },
          update: { name, type: accType, balance },
          create: { companyId, code, name, type: accType, balance },
        });
        importedCount++;
      }
    } else if (type === 'customers') {
      for (const row of rows) {
        const name = String(row.name || row.Name || '').trim();
        if (!name) continue;

        const email = String(row.email || row.Email || '').trim() || null;
        const phone = String(row.phone || row.Phone || '').trim() || null;
        const address = String(row.address || row.Address || '').trim() || null;

        await prisma.customer.create({
          data: {
            companyId,
            name,
            email,
            phone,
            address,
          },
        });
        importedCount++;
      }
    } else if (type === 'vendors') {
      for (const row of rows) {
        const name = String(row.name || row.Name || '').trim();
        if (!name) continue;

        const email = String(row.email || row.Email || '').trim() || null;
        const phone = String(row.phone || row.Phone || '').trim() || null;
        const address = String(row.address || row.Address || '').trim() || null;

        await prisma.vendor.create({
          data: {
            companyId,
            name,
            email,
            phone,
            address,
          },
        });
        importedCount++;
      }
    } else {
      return NextResponse.json({ error: `Unsupported import type: ${type}` }, { status: 400 });
    }

    // Log to Audit Trail
    await logAuditEvent({
      companyId,
      userId: user.userId,
      userEmail: user.email,
      userName: user.name,
      action: 'CREATE',
      entityType: type.toUpperCase(),
      entityId: `IMPORT-${Date.now()}`,
      entityRef: `CSV-${importedCount}`,
      details: `Bulk imported ${importedCount} ${type} via CSV/Excel migration engine`,
      newValues: { importedCount, type },
    });

    return NextResponse.json({
      success: true,
      importedCount,
      message: `Successfully imported ${importedCount} ${type} into company ledger`,
    });
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json({ error: error.message || 'Bulk import failed' }, { status: 500 });
  }
}
