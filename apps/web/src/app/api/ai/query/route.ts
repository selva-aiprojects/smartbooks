import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/server-auth';
import { askAccountingAI } from '@/lib/server-ai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const user = await getAuthUser(req);
  if (!user?.companyId) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { query } = await req.json().catch(() => ({}));
  if (!query) {
    return NextResponse.json({ error: 'query is required' }, { status: 400 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { error: 'AI service not configured', detail: 'GEMINI_API_KEY is missing.' },
      { status: 503 }
    );
  }

  try {
    const answer = await askAccountingAI(user.companyId, query);
    return NextResponse.json({ answer });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'AI query failed' },
      { status: 500 }
    );
  }
}
