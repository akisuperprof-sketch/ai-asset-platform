import { verifyAdminRequest } from '@/lib/server/cron-auth';
import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const authResult = verifyAdminRequest(request);
  if (!authResult.ok) return authResult.response;

  try {
    // 1. Auth check

    if (!adminClient) {
      return NextResponse.json({ success: false, error: 'DB_CONFIG_ERROR' }, { status: 500 });
    }

    // Calculate JST start of today
    const now = new Date();
    const jstOffset = 9 * 60 * 60 * 1000;
    const jstDate = new Date(now.getTime() + jstOffset);
    jstDate.setUTCHours(0, 0, 0, 0);
    const startOfTodayJstUTC = new Date(jstDate.getTime() - jstOffset);

    // Fetch assets created today
    const { data: dbAssets, error } = await adminClient
      .from('assets')
      .select('review_status, qa_result')
      .gte('created_at', startOfTodayJstUTC.toISOString());

    if (error) {
      console.error('[Dashboard Error] dbAssets fetch error:', error);
      return NextResponse.json({ success: false, error: error?.message || JSON.stringify(error) || 'UNKNOWN_ERROR' }, { status: 500 });
    }

    const { count: totalApprovedCount, error: countError } = await adminClient
      .from('assets')
      .select('*', { count: 'exact', head: true })
      .eq('review_status', 'approved');

    if (countError) {
      console.error('[Dashboard Error] countError fetch error:', countError);
      return NextResponse.json({ success: false, error: countError?.message || JSON.stringify(countError) || 'UNKNOWN_ERROR' }, { status: 500 });
    }

    let todayGenerated = 0;
    let todayPublished = 0;
    let todayRejected = 0;
    let todayFailed = 0;
    const reasonCounts: Record<string, number> = {};

    for (const asset of dbAssets) {
      if (['approved', 'rejected', 'failed'].includes(asset.review_status)) {
        todayGenerated++;
        if (asset.review_status === 'approved') todayPublished++;
        if (asset.review_status === 'rejected') {
            todayRejected++;
            const reason = asset.qa_result?.reason || '理由不明 (Unknown)';
            reasonCounts[reason] = (reasonCounts[reason] || 0) + 1;
        }
        if (asset.review_status === 'failed') todayFailed++;
      }
    }

    const rejectReasons = Object.entries(reasonCounts)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ 
      success: true, 
      data: {
        todayGenerated,
        todayPublished,
        todayRejected,
        todayFailed,
        rejectReasons,
        totalApproved: totalApprovedCount || 0
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
