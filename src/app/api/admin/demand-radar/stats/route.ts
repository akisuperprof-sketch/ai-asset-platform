import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

export async function GET() {
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 1. Today Search Count
    const { count: todaySearchCount } = await supabase
      .from('search_demand_logs')
      .select('*', { count: 'exact', head: true })
      .gte('last_seen_at', today.toISOString());

    // 2. Need Asset Count
    const { count: needAssetCount } = await supabase
      .from('search_demand_logs')
      .select('*', { count: 'exact', head: true })
      .eq('need_asset', true);

    // 3. Auto Gen Candidates (Score > 10, need_asset = true or similar, let's just use top 20 limit as planner does)
    // We'll just count how many have priority_score > 0 and need_asset = true
    const { count: autoGenCandidates } = await supabase
      .from('search_demand_logs')
      .select('*', { count: 'exact', head: true })
      .eq('need_asset', true)
      .gt('priority_score', 0);

    // 4. Total Downloads (Mock or from demand_events)
    const { count: totalDownloads } = await supabase
      .from('demand_events')
      .select('*', { count: 'exact', head: true })
      .eq('event_type', 'download');

    return NextResponse.json({
      success: true,
      todaySearchCount: todaySearchCount || 0,
      needAssetCount: needAssetCount || 0,
      autoGenCandidates: autoGenCandidates || 0,
      totalDownloads: totalDownloads || 0
    });

  } catch (error: any) {
    console.error('Demand Stats Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
