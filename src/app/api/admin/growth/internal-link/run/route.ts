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

    // Fetch up to 20 assets that don't have internal links yet
    const { data: assets, error: fetchErr } = await adminClient
      .from('assets')
      .select('id, title, category, tags')
      .order('created_at', { ascending: false })
      .limit(20);

    if (fetchErr) throw new Error(fetchErr.message);

    let linkedCount = 0;

    for (const asset of assets || []) {
      // Find similar assets by category or tags
      const { data: related } = await adminClient
        .from('assets')
        .select('id, title, slug')
        .eq('category', asset.category)
        .neq('id', asset.id)
        .limit(5);

      if (related && related.length > 0) {
        const internalLinks = related.map(r => ({
          title: r.title,
          url: `/items/${r.slug || r.id}`
        }));

        await adminClient.from('assets').update({
          internal_links: internalLinks
        }).eq('id', asset.id);

        linkedCount++;
      }
    }

    await adminClient.from('factory_logs').insert({
      task: 'internal_link_ai',
      status: 'success',
      details: { linked_assets: linkedCount }
    });

    return NextResponse.json({
      success: true,
      message: `Internal Link AI updated ${linkedCount} assets.`
    });

  } catch (error: any) {
    console.error('Internal Link AI Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
