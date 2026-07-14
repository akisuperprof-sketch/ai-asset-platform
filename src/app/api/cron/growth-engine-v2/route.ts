import { verifyCronRequest } from '@/lib/server/cron-auth';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60; // 1 minute max for Pro, 10s for Hobby
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authResult = verifyCronRequest(request);
  if (!authResult.ok) return authResult.response;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const adminClient = createClient(supabaseUrl, supabaseKey);

  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Check Emergency Stop (is_enabled in auto_factory_settings)
    const { data: settings } = await adminClient.from('auto_factory_settings').select('*').eq('id', 'default').single();
    if (!settings?.is_enabled) {
      return NextResponse.json({ success: true, message: 'Growth Engine is disabled (Emergency Stop Active)' });
    }

    // 2. Initialize Run Log
    const { data: runLog, error: logError } = await adminClient.from('growth_engine_runs').insert({
      status: 'running'
    }).select().single();

    if (logError) {
      console.error('Failed to create run log:', logError);
    }
    const runId = runLog?.id;

    const host = request.headers.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Fire & Forget background tasks (Orchestration V2)
    const trigger = async (path: string) => {
      try {
        const res = await fetch(`${baseUrl}${path}`, {
          method: 'POST',
          headers: { 'x-agent-token': process.env.ADMIN_API_SECRET }
        });
        if (!res.ok) {
           console.error(`Error triggering ${path}:`, await res.text());
        }
      } catch (err) {
        console.error(`Failed to trigger ${path}:`, err);
      }
    };

    // --- PHASE 11: Growth Engine V2 (Self Growing AI Company) ---

    const startTime = Date.now();

    // 1. Demand & Trends
    await trigger('/api/admin/growth/trend-hunter/run');

    // 2. Generation & QA & Publish & Sitemap (Auto Factory Core)
    // Note: Demand fetching is part of the factory / bulk planner.
    await trigger('/api/cron/auto-factory');
    
    // 3. SEO & Internal Links & Asset Value
    await trigger('/api/admin/growth/seo-optimizer/run');
    await trigger('/api/admin/growth/internal-link/run');
    await trigger('/api/admin/growth/asset-value/run');

    // 4. Indexing & Social
    await trigger('/api/admin/growth/index-manager/run');
    await trigger('/api/admin/growth/pinterest-engine/run');

    // 5. System Analytics (Phase 13 additions)
    await trigger('/api/admin/growth/search-console/run');
    await trigger('/api/admin/growth/self-repair/run');

    // 6. Revenue & Analytics & Planning
    await trigger('/api/admin/growth/revenue-ai/run');
    await trigger('/api/admin/growth/planner/run');

    // 7. Final CEO Report
    await trigger('/api/admin/growth/ceo-report/run');

    const durationSeconds = Math.floor((Date.now() - startTime) / 1000);

    // 8. Finalize Run Log
    if (runId) {
      // Gather quick stats for today
      const today = new Date();
      today.setHours(0,0,0,0);
      const { count: approvedCount } = await adminClient.from('assets').select('*', { count: 'exact', head: true }).gte('published_at', today.toISOString()).eq('is_ai_generated', true);
      const { count: qaFailedCount } = await adminClient.from('assets').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()).eq('qa_status', 'rejected').eq('is_ai_generated', true);
      
      await adminClient.from('growth_engine_runs').update({
        status: 'success',
        finished_at: new Date().toISOString(),
        duration_seconds: durationSeconds,
        approved_count: approvedCount || 0,
        qa_failed_count: qaFailedCount || 0,
        ceo_report_created: true
      }).eq('id', runId);
    }

    return NextResponse.json({
      success: true,
      message: 'Growth Engine V2 cycle initiated successfully'
    });

  } catch (error: any) {
    console.error('Growth Engine Orchestrator Error:', error);
    
    // Attempt to log failure
    try {
      const authHeader = request.headers.get('authorization');
      if (authHeader === `Bearer ${process.env.CRON_SECRET}`) {
        await adminClient.from('growth_engine_runs').insert({
          status: 'failed',
          errors: { message: error.message },
          finished_at: new Date().toISOString()
        });
      }
    } catch(e) {}

    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
