import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { getAuthUserFromRequest } from '../../../../../lib/server-auth';
import { logAuditEvent } from '../../../../../lib/server-audit';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { challanNo, challanDate, bsrCode } = body;

    const existing = await prisma.tdsEntry.findFirst({
      where: { id, companyId: user.companyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'TDS entry not found' }, { status: 404 });
    }

    const updated = await prisma.tdsEntry.update({
      where: { id },
      data: {
        challanNo: challanNo || `CHL-${Date.now().toString().slice(-8)}`,
        challanDate: challanDate ? new Date(challanDate) : new Date(),
        bsrCode: bsrCode || '0510304',
        status: 'DEPOSITED',
      },
    });

    // Reduce 2025 - TDS Payable balance
    const tdsAcc = await prisma.account.findFirst({
      where: { companyId: user.companyId, code: '2025' },
    });
    if (tdsAcc) {
      await prisma.account.update({
        where: { id: tdsAcc.id },
        data: { balance: Math.max(0, Number(tdsAcc.balance) - Number(existing.tdsAmount)) },
      });
    }

    // Log to Audit Trail
    await logAuditEvent({
      companyId: user.companyId,
      userId: user.userId,
      userEmail: user.email,
      userName: user.name,
      action: 'PAYMENT',
      entityType: 'TDS_CHALLAN',
      entityId: id,
      entityRef: updated.challanNo,
      details: `Deposited statutory TDS ₹${updated.tdsAmount} to Income Tax Dept under Challan ITNS-281 #${updated.challanNo} (BSR ${updated.bsrCode})`,
      newValues: { challanNo: updated.challanNo, status: 'DEPOSITED' },
    });

    return NextResponse.json({ success: true, entry: updated });
  } catch (error: any) {
    console.error('Update TDS Challan error:', error);
    return NextResponse.json({ error: error.message || 'Failed to record Challan' }, { status: 500 });
  }
}
