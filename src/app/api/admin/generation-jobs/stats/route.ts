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

    const stats = {
      generatedToday: todaysJobs.length,
      qaPassed: todaysJobs.filter(j => j.status === 'qa_passed').length,
      qaFailed: todaysJobs.filter(j => j.status === 'qa_failed').length,
      pendingRec: todaysJobs.filter(j => j.status === 'qa_passed').length, // In this model, qa_passed equates to pending recommendation
      rejectRec: todaysJobs.filter(j => j.status === 'qa_failed').length,
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
