import { verifyCronRequest } from '@/lib/server/cron-auth';
import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';

// Vercel Cron will call this without authentication except for a Cron secret if configured
// For safety, we verify the Authorization header if CRON_SECRET is set
export async function GET(request: Request) {
  const authResult = verifyCronRequest(request);
  if (!authResult.ok) return authResult.response;

  try {
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
      }
    }

    if (!adminClient) {
      return NextResponse.json({ success: false, error: 'NO_DB' }, { status: 500 });
    }

    // 1. Fetch zero-result keywords from last 48 hours that need assets
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    
    const { data: demands, error: fetchError } = await adminClient
      .from('search_demand_logs')
      .select('keyword, normalized_keyword, priority_score, category')
      .eq('need_asset', true)
      .gte('last_seen_at', fortyEightHoursAgo)
      .order('priority_score', { ascending: false })
      .limit(10);

    if (fetchError || !demands || demands.length === 0) {
      return NextResponse.json({ success: true, message: 'No demands to process' });
    }

    // 2. Format the payload for the internal generation-jobs from-demand API
    const items = demands.map(d => ({
      query: d.keyword,
      normalized_query: d.normalized_keyword,
      priority_score: d.priority_score,
      category: d.category
    }));

    // To call our own API, we need the D_STRATEGY_KEY
    const strategyKey = process.env.D_STRATEGY_KEY || '';

    // 3. Call the queue API
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://assetninja.jp';
    const queueRes = await fetch(`${baseUrl}/api/admin/generation-jobs/from-demand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `D_STRATEGY_KEY=${strategyKey}; d_strategy_session=${strategyKey}`
      },
      body: JSON.stringify({ items })
    });

    const queueData = await queueRes.json();

    // 4. Also trigger the worker to run if items were queued
    // We use the temp agent token to trigger the run API
    let runData = null;
    if (queueData.success && queueData.results?.some((r: any) => r.status === 'Queued')) {
       const runRes = await fetch(`${baseUrl}/api/admin/generation-jobs/run`, {
         method: 'POST',
         headers: {
           'Content-Type': 'application/json',
           'x-agent-token': process.env.ADMIN_API_SECRET || ''
         },
         body: JSON.stringify({ limit: 5 })
       });
       runData = await runRes.json();
    }

    return NextResponse.json({
      success: true,
      queued: queueData,
      run: runData
    });

  } catch (err: any) {
    console.error("Cron Demand Gen Error:", err);
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
