import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    // 1. Auth check
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('d_strategy_session');
    
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

    const { data: queries, error } = await adminClient
      .from('search_queries')
      .select('*')
      .order('priority_score', { ascending: false })
      .order('updated_at', { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: queries });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
