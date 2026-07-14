import { verifyAdminRequest } from '@/lib/server/cron-auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminClient } from '@/lib/supabase';

export async function GET(request: Request) {
  const authResult = verifyAdminRequest(request);
  if (!authResult.ok) return authResult.response;

  const cookieStore = await cookies();
  const authKey = cookieStore.get('D_STRATEGY_KEY')?.value;
  
  if (authKey !== process.env.D_STRATEGY_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!adminClient) {
      return NextResponse.json({ error: 'Database client not initialized' }, { status: 500 });
    }

    const { data: jobs, error } = await adminClient
      .from('generation_jobs')
      .select('status, created_at, category, provider');

    if (error) throw error;

    const { count: approvedAssetsCount } = await adminClient
      .from('assets')
      .select('*', { count: 'exact', head: true })
      .eq('review_status', 'approved');

    // Calculate today's stats
    const todayStr = new Date().toISOString().split('T')[0];
    const todaysJobs = jobs.filter(j => j.created_at.startsWith(todayStr));

    const totalJobs = todaysJobs.length;
    const actualGenerated = todaysJobs.filter(j => ['generated', 'qa_passed', 'qa_failed'].includes(j.status)).length;
    const qaPassed = todaysJobs.filter(j => j.status === 'qa_passed').length;
    const qaFailed = todaysJobs.filter(j => j.status === 'qa_failed').length;
    const passRate = actualGenerated > 0 ? ((qaPassed / actualGenerated) * 100).toFixed(1) : "0.0";
    
    // Estimate cost (assume 3 yen per image for realistic quality API + 0.5 yen for QA)
    const costEstimateYen = actualGenerated * 3.5; 

    const stats = {
      candidatesToday: totalJobs,
      actualGenerated: actualGenerated,
      qaPassed: qaPassed,
      qaFailed: qaFailed,
      passRate: passRate,
      costEstimateYen: costEstimateYen,
      premiumCandidates: qaPassed, // For UI clarity
      rejectImmediately: qaFailed,
      categoryStats: todaysJobs.reduce((acc: Record<string, number>, curr) => {
        acc[curr.category] = (acc[curr.category] || 0) + 1;
        return acc;
      }, {}),
      globalQueued: jobs.filter(j => j.status === 'queued').length,
      realQueued: jobs.filter(j => j.status === 'queued' && j.provider?.toLowerCase() !== 'dry_run').length,
      dryRunArchived: jobs.filter(j => j.status === 'archived_dry_run').length,
      totalApproved: approvedAssetsCount || 0,
      globalProcessing: jobs.filter(j => j.status === 'generating' || j.status === 'processing').length,
      globalQaPassed: jobs.filter(j => j.status === 'qa_passed').length,
      globalQaFailed: jobs.filter(j => j.status === 'qa_failed').length,
    };

    return NextResponse.json(stats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
