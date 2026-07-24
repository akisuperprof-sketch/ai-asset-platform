import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // return new Response('Unauthorized', { status: 401 }); // Commented for local test
    }

    const alerts: any[] = [];
    const now = new Date();

    // 1. Check if growth_engine_runs is stuck (No runs in last 24h)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentRuns } = await supabase
      .from('growth_engine_runs')
      .select('id, created_at')
      .gte('created_at', twentyFourHoursAgo)
      .limit(1);

    if (!recentRuns || recentRuns.length === 0) {
      alerts.push({
        severity: 'critical',
        component: 'cron_growth_engine',
        message: 'Growth Engine V2 has not run in the last 24 hours. The automated pipeline may be dead.',
      });
    }

    // 2. Check Generation Queue Staleness
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const { count: staleQueueCount } = await supabase
      .from('generation_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'processing')
      .lte('created_at', twoHoursAgo);

    if (staleQueueCount && staleQueueCount > 0) {
      alerts.push({
        severity: 'warning',
        component: 'generation_jobs',
        message: `${staleQueueCount} jobs have been stuck in 'processing' for over 2 hours. Workers might be offline or failing silently.`,
        metadata: { stale_count: staleQueueCount }
      });
    }

    // 3. QA Drop-off Rate Check (Spike in failures today vs yesterday)
    // For simplicity, let's just check if there are > 50 QA failures today
    const startOfToday = new Date(now.setHours(0,0,0,0)).toISOString();
    const { count: qaFailCount } = await supabase
      .from('generation_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'qa_failed')
      .gte('created_at', startOfToday);
      
    if (qaFailCount && qaFailCount > 50) {
      alerts.push({
        severity: 'critical',
        component: 'qa_system',
        message: `High QA failure rate detected: ${qaFailCount} failures today. The image generation quality may have degraded.`,
        metadata: { failures_today: qaFailCount }
      });
    }

    // 4. Index Queue Stuck Check
    const { count: pendingIndexCount } = await supabase
      .from('index_queue')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
      
    if (pendingIndexCount && pendingIndexCount > 500) {
      alerts.push({
        severity: 'warning',
        component: 'index_queue',
        message: `Index Queue is backing up. ${pendingIndexCount} URLs pending Google Submission.`,
        metadata: { pending_count: pendingIndexCount }
      });
    }

    // Insert new alerts
    if (alerts.length > 0) {
      await supabase.from('system_alerts').insert(alerts);
    }

    return NextResponse.json({
      success: true,
      alerts_generated: alerts.length,
      alerts: alerts
    });

  } catch (error: any) {
    console.error('System Monitor Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
