import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { checkRateLimit, isMaliciousBot, getIp, getUa } from '@/lib/rate-limit';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

function hashUserAgent(userAgent: string, ip: string): string {
  return crypto.createHash('sha256').update(`${userAgent}-${ip}-salt`).digest('hex');
}

export async function POST(request: Request) {
  if (process.env.SEARCH_TRACKING_ENABLED === 'false') {
    return NextResponse.json({ ok: false, error: 'Disabled' }, { status: 200 }); // Do not break UI
  }

  try {
    if (!supabase) {
      return NextResponse.json({ ok: false, error: 'SUPABASE_NOT_CONFIGURED' }, { status: 500 });
    }

    const ip = getIp(request as any);
    const userAgent = getUa(request as any);

    if (isMaliciousBot(userAgent)) {
      return NextResponse.json({ ok: false, error: 'BOT_DETECTED' }, { status: 200 }); // Do not break UI
    }

    if (!checkRateLimit(`search:${ip}`, 20, 60 * 1000)) {
      return NextResponse.json({ ok: false, error: 'RATE_LIMIT_EXCEEDED' }, { status: 429 });
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

    // 1~80 chars
    if (!query || typeof query !== 'string' || query.trim().length === 0 || query.length > 80) {
      return NextResponse.json({ ok: false, error: 'INVALID_QUERY_LENGTH' }, { status: 400 });
    }

    // Dangerous chars
    if (/[<>{}\\]/.test(query)) {
      return NextResponse.json({ ok: false, error: 'INVALID_QUERY_CHARS' }, { status: 400 });
    }

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
