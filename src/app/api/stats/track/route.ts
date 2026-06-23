import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key';
const supabase = createClient(supabaseUrl, supabaseKey);

function hashString(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex').substring(0, 16);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { event_type, asset_id, page_path, ad_provider, referrer } = body;

    if (!event_type || !page_path) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const userAgent = request.headers.get('user-agent') || 'unknown';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    const userAgentHash = hashString(userAgent);
    const ipHash = hashString(ip);

    const { error } = await supabase.rpc('track_revenue_event', {
      p_event_type: event_type,
      p_asset_id: asset_id || null,
      p_page_path: page_path,
      p_ad_provider: ad_provider || null,
      p_user_agent_hash: userAgentHash,
      p_ip_hash: ipHash,
      p_referrer: referrer || null
    });

    if (error) {
      console.error('[API stats/track] DB Error:', error);
      // Even if DB fails, return 200 so we don't block the client
      return NextResponse.json({ success: false, message: 'DB Tracking failed' }, { status: 200 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    console.error('[API stats/track] Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
