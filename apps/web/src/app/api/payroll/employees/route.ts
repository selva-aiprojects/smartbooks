import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { getAuthUserFromRequest } from '../../../../lib/server-auth';
import { logAuditEvent } from '../../../../lib/server-audit';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const employees = await prisma.employee.findMany({
      where: { companyId: user.companyId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(employees);
  } catch (error: any) {
    console.error('Fetch employees error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      employeeCode,
      name,
      email,
      phone,
      designation,
      department,
      pan,
      uan,
      esiNumber,
      bankAccount,
      bankIfsc,
      baseSalary,
    } = body;

    const companyId = user.companyId;

    if (!name || !employeeCode) {
      return NextResponse.json({ error: 'Employee code and name are required' }, { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        companyId,
        employeeCode,
        name,
        email: email || null,
        phone: phone || null,
        designation: designation || 'Associate',
        department: department || 'Operations',
        pan: pan || null,
        uan: uan || null,
        esiNumber: esiNumber || null,
        bankAccount: bankAccount || null,
        bankIfsc: bankIfsc || null,
        baseSalary: Number(baseSalary) || 35000,
        status: 'Active',
      },
    });

    // Log to Audit Trail
    await logAuditEvent({
      companyId,
      userId: user.userId,
      userEmail: user.email,
      userName: user.name,
      action: 'CREATE',
      entityType: 'EMPLOYEE',
      entityId: employee.id,
      entityRef: employee.employeeCode,
      details: `Added new employee ${employee.name} (${employee.employeeCode}) in ${employee.department} with monthly salary ₹${Number(employee.baseSalary).toLocaleString('en-IN')}`,
      newValues: { code: employee.employeeCode, name: employee.name, baseSalary: employee.baseSalary },
    });

    return NextResponse.json({ success: true, employee }, { status: 201 });
  } catch (error: any) {
    console.error('Create employee error:', error);
    return NextResponse.json({ error: error.message || 'Failed to add employee' }, { status: 500 });
  }
}
