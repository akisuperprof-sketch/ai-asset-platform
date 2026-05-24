import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // 1. Auth check
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('d_strategy_session');
    
    // We assume the cookie value is the actual key as set in /api/admin/auth
    const envKey = process.env.D_STRATEGY_KEY;
    if (!envKey) {
      return NextResponse.json({ success: false, error: 'SERVER_MISCONFIGURED' }, { status: 500 });
    }

    if (!adminSession || adminSession.value !== envKey.trim()) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    // 2. Client setup
    if (!adminClient) {
      return NextResponse.json({ success: false, error: 'DB_CONFIG_ERROR' }, { status: 500 });
    }

    // 3. Payload validation
    const body = await request.json();
    const { id, status, rejectReason, qualityRank, scores } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'INVALID_PAYLOAD' }, { status: 400 });
    }

    // 4. Update the DB
    const updatePayload: any = { 
      review_status: status,
      published_at: status === 'approved' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    };
    
    if (rejectReason !== undefined) {
      updatePayload.reject_reason = rejectReason;
    }
    
    if (qualityRank) {
      updatePayload.quality_rank = qualityRank;
    }
    
    if (scores && typeof scores === 'object') {
      Object.assign(updatePayload, scores);
    }
    
    // Also mark low quality items
    if (status === 'rejected') {
      // Optional logic for low quality
      updatePayload.legal_status = 'rejected';
    } else if (status === 'pending') {
      updatePayload.legal_status = 'review_needed';
    } else if (status === 'approved') {
      updatePayload.legal_status = 'clean';
    }

    const { error } = await adminClient
      .from('assets')
      .update(updatePayload)
      .eq('id', id);

    if (error) {
      console.error('Update status error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('API Error in /api/admin/asset-status:', err);
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
