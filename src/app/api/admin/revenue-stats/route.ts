import { verifyAdminRequest } from '@/lib/server/cron-auth';
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
    
    const { data: funnelData } = await supabase
      .from('revenue_events')
      .select('event_type, asset_id');
      
    // Ad Funnel Aggregation
    let pvTotal = 0;
    let assetViewTotal = 0;
    let dlStartTotal = 0;
    let adImpressionTotal = 0;
    let dlCompleteTotal = 0;
    
    // Asset Value Score Map
    const assetScores: Record<string, { view: number, dl: number, ad: number }> = {};

    if (funnelData) {
      funnelData.forEach(row => {
        if (row.event_type === 'page_view') pvTotal++;
        if (row.event_type === 'page_view' && row.asset_id) assetViewTotal++;
        if (row.event_type === 'download_start') dlStartTotal++;
        if (row.event_type === 'ad_impression') adImpressionTotal++;
        if (row.event_type === 'download_complete') dlCompleteTotal++;

        if (row.asset_id) {
          if (!assetScores[row.asset_id]) assetScores[row.asset_id] = { view: 0, dl: 0, ad: 0 };
          if (row.event_type === 'page_view') assetScores[row.asset_id].view++;
          if (row.event_type === 'download_complete') assetScores[row.asset_id].dl++;
          if (row.event_type === 'ad_impression') assetScores[row.asset_id].ad++;
        }
      });
    }

    // Top Assets Logic
    // We fetch assets and calculate score
    const { data: assetsData } = await supabase
      .from('assets')
      .select('id, title, category, status, published_at')
      .eq('review_status', 'approved');

    let topAssets: any[] = [];
    if (assetsData) {
      topAssets = assetsData.map(a => {
        const scoreData = assetScores[a.id] || { view: 0, dl: 0, ad: 0 };
        const valueScore = (scoreData.view * 1) + (scoreData.dl * 10) + (scoreData.ad * 0.5);
        return { ...a, valueScore, ...scoreData };
      }).sort((a, b) => b.valueScore - a.valueScore).slice(0, 10);
    }

    return NextResponse.json({
      today_pv: pv,
      today_dl: dl,
      today_ad_impression: summary?.today_ad_impression || 0,
      today_admax_render: admaxRender,
      today_popads_trigger: popadsTrigger,
      estimated_daily_revenue: dailyRevenue,
      estimated_monthly_revenue: monthlyRevenue,
      dl_rate: dlRate,
      funnel: {
        pv: pvTotal,
        asset_view: assetViewTotal,
        download_start: dlStartTotal,
        ad_impression: adImpressionTotal,
        download_complete: dlCompleteTotal
      },
      top_revenue_candidates: topAssets
    });

  } catch (error: any) {
    console.error('[API admin/revenue-stats] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
