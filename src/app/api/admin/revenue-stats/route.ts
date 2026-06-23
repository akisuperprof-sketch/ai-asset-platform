import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const revalidate = 0; // Disable caching

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data: summary, error: rpcError } = await supabase.rpc('get_revenue_stats_summary');

    if (rpcError) {
      console.error('[API admin/revenue-stats] RPC Error:', rpcError);
      return NextResponse.json({ error: rpcError.message }, { status: 500 });
    }

    // Default RPM
    const ADMAX_RPM = 50;
    const POPADS_RPM = 100;

    const pv = summary?.today_pv || 0;
    const dl = summary?.today_dl || 0;
    const admaxRender = summary?.today_admax_render || 0;
    const popadsTrigger = summary?.today_popads_trigger || 0;
    
    // Revenue Estimation
    const admaxRevenue = (admaxRender / 1000) * ADMAX_RPM;
    const popadsRevenue = (popadsTrigger / 1000) * POPADS_RPM;
    const dailyRevenue = admaxRevenue + popadsRevenue;
    const monthlyRevenue = dailyRevenue * 30; // simple estimation

    const dlRate = pv > 0 ? (dl / pv) * 100 : 0;
    
    // Fetch Top Candidates (dummy logic for now, until we aggregate dynamically)
    // We can just query the assets table joined with counts or use a simpler approach
    // We will do a simple fetch from assets and order by view_count if it existed,
    // but since we don't have it on assets, we'll return an empty list or top by download
    const { data: topAssets } = await supabase
      .from('assets')
      .select('id, title, category, status, published_at')
      .eq('review_status', 'approved')
      .order('published_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      today_pv: pv,
      today_dl: dl,
      today_admax_render: admaxRender,
      today_popads_trigger: popadsTrigger,
      estimated_daily_revenue: dailyRevenue,
      estimated_monthly_revenue: monthlyRevenue,
      dl_rate: dlRate,
      top_revenue_candidates: topAssets || []
    });

  } catch (error: any) {
    console.error('[API admin/revenue-stats] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
