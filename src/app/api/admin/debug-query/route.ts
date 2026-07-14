import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/server/cron-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, count, error } = await adminClient!
      .from('assets')
      .select('id', { count: 'exact' })
      .eq('review_status', 'approved')
      .eq('source', 'real')
      .limit(0);

  return NextResponse.json({
    errorObj: error,
    errorMessage: error?.message,
    errorDetails: error?.details,
    errorHint: error?.hint,
    errorCode: error?.code,
    count,
    keys: error ? Object.keys(error) : []
  });
}
