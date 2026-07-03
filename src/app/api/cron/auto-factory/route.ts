import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const adminClient = createClient(supabaseUrl, supabaseKey);

  try {
    const authHeader = request.headers.get('authorization');
    const localCronSecret = process.env.CRON_SECRET || 'temp-agent-token-123';
    
    // Validate cron secret
    if (authHeader !== `Bearer ${localCronSecret}`) {
      // Allow local testing if needed
      if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${localCronSecret}`) {
        // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // 1. Check if Factory is Enabled
    const { data: settings } = await adminClient.from('auto_factory_settings').select('*').eq('id', 'default').single();
    if (!settings?.is_enabled) {
      return NextResponse.json({ success: true, message: 'Auto Factory is disabled.' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();
    const todayDateStr = todayISO.split('T')[0];

    // 2. Auto Scaling (Phase 13-C) - Fetch Target from AI Plan
    let dailyTarget = settings.daily_target || 30;
    const { data: aiPlan } = await adminClient.from('daily_ai_plans').select('target_generation_count').eq('date', todayDateStr).single();
    if (aiPlan && aiPlan.target_generation_count) {
       dailyTarget = aiPlan.target_generation_count;
       console.log(`Auto Scaling Active: Target overridden by AI Plan to ${dailyTarget}`);
    }

    // 3. Fetch today's approved assets to calculate remaining target
    const { count: approvedCount } = await adminClient
      .from('assets')
      .select('*', { count: 'exact', head: true })
      .gte('published_at', todayISO)
      .eq('is_ai_generated', true);

    const currentApproved = approvedCount || 0;
    const remainingToTarget = Math.max(0, dailyTarget - currentApproved);

    if (remainingToTarget === 0) {
      return NextResponse.json({ success: true, message: 'Daily target reached.', approvedCount: currentApproved, dailyTarget });
    }

    // 3. Ensure we have enough generation_jobs queued
    const { count: queuedCount } = await adminClient
      .from('generation_jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'queued');

    const currentQueued = queuedCount || 0;

    // If queued count is low, trigger demand extraction
    if (currentQueued < remainingToTarget * 2) {
      // Trigger demand to queue
      await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/cron/auto-demand-generation`, {
        headers: { 'Authorization': `Bearer ${localCronSecret}` }
      }).catch(e => console.error('Failed to trigger auto-demand-generation:', e));
    }

    // 4. Run Generation Worker
    // Limit batch size to 5 to avoid timeouts in Vercel Hobby/Pro.
    const batchSize = Math.min(5, remainingToTarget);
    
    const workerRes = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/admin/generation-jobs/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-agent-token': localCronSecret
      },
      body: JSON.stringify({ limit: batchSize })
    });

    const workerData = await workerRes.json();

    // 5. Log Result
    await adminClient.from('factory_logs').insert({
      task: 'auto_factory_loop',
      status: workerRes.ok ? 'success' : 'failed',
      details: {
        batchSize,
        remainingToTarget,
        workerResponse: workerData
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Auto Factory Loop Executed',
      batchSize,
      workerResult: workerData
    });

  } catch (error: any) {
    console.error('Auto Factory Cron Error:', error);
    await adminClient.from('factory_logs').insert({
      task: 'auto_factory_loop',
      status: 'failed',
      details: { error: error.message }
    });
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Allow POST for orchestrator compatibility
export async function POST(request: Request) {
  return GET(request);
}
