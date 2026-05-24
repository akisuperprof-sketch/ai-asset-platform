import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// For calling the RPC securely or if we want to bypass RLS, we can use service key.
// But the RLS allows public inserts, so anon key is fine. 
// However, the RPC is SECURITY DEFINER, so anon key can call it.
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

function hashUserAgent(userAgent: string, ip: string): string {
  return crypto.createHash('sha256').update(`${userAgent}-${ip}-salt`).digest('hex');
}

export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'SUPABASE_NOT_CONFIGURED' }, { status: 500 });
    }

    const body = await request.json();
    const { 
      query, 
      normalizedQuery, 
      languageGuess, 
      matchedAssetCount, 
      hasResults, 
      sourcePage, 
      suggestedCategory 
    } = body;

    if (!query || typeof query !== 'string' || query.trim() === '') {
      return NextResponse.json({ ok: false, error: 'MISSING_QUERY' }, { status: 400 });
    }

    const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const userAgentHash = hashUserAgent(userAgent, ip);

    // Call the RPC function to upsert/increment priority
    const { error } = await supabase.rpc('upsert_search_query', {
      p_query: query,
      p_normalized_query: normalizedQuery || query.toLowerCase().trim(),
      p_language_guess: languageGuess || null,
      p_matched_asset_count: matchedAssetCount || 0,
      p_has_results: hasResults || false,
      p_user_agent_hash: userAgentHash,
      p_source_page: sourcePage || '/',
      p_suggested_category: suggestedCategory || null
    });

    if (error) {
      console.error('Error tracking search query:', error);
      return NextResponse.json({ ok: false, error: 'DB_ERROR' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Error in search track API:', err);
    // Don't break the client if something fails
    return NextResponse.json({ ok: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 200 }); 
  }
}
