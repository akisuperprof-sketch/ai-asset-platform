import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  const cookieStore = await cookies();
  const authKey = cookieStore.get('D_STRATEGY_KEY')?.value;
  
  if (authKey !== process.env.D_STRATEGY_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: jobs, error } = await supabase
      .from('generation_jobs')
      .select('status, created_at, category');

    if (error) throw error;

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
      }, {})
    };

    return NextResponse.json(stats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
