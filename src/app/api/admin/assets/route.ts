import { verifyAdminRequest } from '@/lib/server/cron-auth';
import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // 1. Auth check
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('D_STRATEGY_KEY');
    
    const envKey = process.env.D_STRATEGY_KEY;
    if (!envKey) {
      return NextResponse.json({ success: false, error: 'SERVER_MISCONFIGURED' }, { status: 500 });
    }

    if (!adminSession || adminSession.value !== envKey.trim()) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    if (!adminClient) {
      return NextResponse.json({ success: false, error: 'DB_CONFIG_ERROR' }, { status: 500 });
    }

    // Fetch all assets (up to 1000 for now to prevent memory issues)
    const { data: dbAssets, error } = await adminClient
      .from('assets')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1000);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: dbAssets });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
