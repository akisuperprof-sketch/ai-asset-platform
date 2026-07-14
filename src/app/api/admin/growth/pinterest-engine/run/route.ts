import { verifyAdminRequest } from '@/lib/server/cron-auth';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const authResult = verifyAdminRequest(request);
  if (!authResult.ok) return authResult.response;

  try {
    const adminToken = request.headers.get('x-agent-token');
    const isValidToken = adminToken === process.env.AGENT_SECRET_TOKEN || adminToken === process.env.ADMIN_API_SECRET || '';
    if (!isValidToken && process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get 5 draft pins
    const { data: drafts, error: fetchErr } = await adminClient
      .from('pinterest_posts')
      .select('*')
      .eq('status', 'draft')
      .limit(5);

    if (fetchErr) throw new Error(fetchErr.message);

    let scheduledCount = 0;

    for (const draft of drafts || []) {
      // Transition from draft to scheduled
      // Normally here you would do image processing to 2:3 ratio or upload to Pinterest API
      // Since this is the initial phase of Growth Engine Pinterest logic, we will just mark them as scheduled for today
      
      const scheduledTime = new Date();
      scheduledTime.setHours(scheduledTime.getHours() + 1 + scheduledCount); // Spread out scheduling

      await adminClient.from('pinterest_posts').update({
        status: 'scheduled',
        scheduled_at: scheduledTime.toISOString()
      }).eq('id', draft.id);

      scheduledCount++;
    }

    await adminClient.from('factory_logs').insert({
      task: 'pinterest_engine',
      status: 'success',
      details: { scheduled_pins: scheduledCount }
    });

    return NextResponse.json({
      success: true,
      message: `Pinterest Engine scheduled ${scheduledCount} pins.`
    });

  } catch (error: any) {
    console.error('Pinterest Engine Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
