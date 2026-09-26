import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/server-auth';
import { categorizeTransaction } from '@/lib/server-ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user?.companyId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { description, amount } = await req.json().catch(() => ({}));
  if (!description) {
    return NextResponse.json({ error: 'description is required' }, { status: 400 });
  }

  try {
    const result = await categorizeTransaction(user.companyId, description, Number(amount) || 0);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Categorization failed' },
      { status: 500 }
    );
  }
}
