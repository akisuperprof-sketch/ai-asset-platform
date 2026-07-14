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

    // Fetch up to 100 assets that haven't been scored recently or scored at all
    const { data: assets, error: fetchErr } = await adminClient
      .from('assets')
      .select('id, download_count')
      .order('created_at', { ascending: false })
      .limit(100);

    if (fetchErr) throw new Error(fetchErr.message);

    let scoredCount = 0;

    for (const asset of assets || []) {
      // Calculate a deterministic score based on download_count
      let baseScore = 50;
      
      const viewScore = 0; // Mocked as we don't track views directly in this table yet
      
      // Bonus for downloads (higher weight)
      const dlScore = Math.min(30, (asset.download_count || 0) / 2);
      
      let finalScore = Math.round(baseScore + viewScore + dlScore);
      finalScore = Math.max(1, Math.min(100, finalScore)); // clamp 1-100

      await adminClient.from('assets').update({
        asset_value_score: finalScore
      }).eq('id', asset.id);

      scoredCount++;
    }

    await adminClient.from('factory_logs').insert({
      task: 'asset_value_engine',
      status: 'success',
      details: { scored_assets: scoredCount }
    });

    return NextResponse.json({
      success: true,
      message: `Asset Value Engine evaluated ${scoredCount} assets.`
    });

  } catch (error: any) {
    console.error('Asset Value Engine Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
