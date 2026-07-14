import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';
import { verifyAdminRequest } from '@/lib/server/cron-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!verifyAdminRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, count, error } = await adminClient!
      .from('generation_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'queued');

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
