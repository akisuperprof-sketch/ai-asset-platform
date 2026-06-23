import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import { checkRateLimit, isMaliciousBot, getIp, getUa } from '@/lib/rate-limit';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

function hashValue(value: string, ip: string): string {
  return crypto.createHash('sha256').update(`${value}-${ip}-salt`).digest('hex');
}

export async function POST(request: Request) {
  if (process.env.SEARCH_TRACKING_ENABLED === 'false') {
    return NextResponse.json({ ok: false, error: 'Disabled' }, { status: 200 });
  }

  try {
    const ip = getIp(request as any);
    const userAgent = getUa(request as any);

    if (isMaliciousBot(userAgent)) {
      return NextResponse.json({ ok: false, error: 'BOT_DETECTED' }, { status: 200 });
    }

    if (!checkRateLimit(`demand:${ip}`, 50, 60 * 1000)) {
      return NextResponse.json({ ok: false, error: 'RATE_LIMIT_EXCEEDED' }, { status: 429 });
    }

    const body = await request.json();
    const { 
      event_type, 
      query, 
      normalized_query, 
      asset_id, 
      category, 
      source_page, 
      referrer,
      metadata
    } = body;

    const validEventTypes = ['search', 'zero_result', 'asset_click', 'download', 'detail_view', 'dwell_time'];
    if (!validEventTypes.includes(event_type)) {
      return NextResponse.json({ ok: false, error: 'INVALID_EVENT_TYPE' }, { status: 400 });
    }

    const userAgentHash = hashValue(userAgent, ip);
    const sessionHash = hashValue(userAgent + new Date().toISOString().split('T')[0], ip);

    const eventRecord = {
      event_type,
      query: query || null,
      normalized_query: normalized_query || (query ? query.toLowerCase().trim() : null),
      asset_id: asset_id || null,
      category: category || null,
      session_hash: sessionHash,
      source_page: source_page || '/',
      referrer: referrer || null,
      user_agent_hash: userAgentHash,
      metadata: metadata || {}
    };

    let savedToDb = false;
    
    if (supabase) {
      const { error } = await supabase.from('demand_events').insert(eventRecord);
      if (!error) {
        savedToDb = true;
      } else {
        console.warn('Failed to insert into demand_events, falling back to local storage', error);
      }
    }

    // Fallback: If DB is not available or table doesn't exist yet, save to a local JSON line log for local dev
    if (!savedToDb && process.env.NODE_ENV === 'development') {
      try {
        const logPath = path.join(process.cwd(), 'data', 'demand-events-fallback.jsonl');
        const dir = path.dirname(logPath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        
        const logEntry = { ...eventRecord, created_at: new Date().toISOString() };
        fs.appendFileSync(logPath, JSON.stringify(logEntry) + '\n');
      } catch (fallbackErr) {
        console.error('Fallback logging failed', fallbackErr);
      }
    }

    // Call the new RPC for Phase 3 Search Demand Radar
    if (supabase && (event_type === 'search' || event_type === 'zero_result') && query) {
      const p_normalized = normalized_query || query.toLowerCase().trim();
      const p_need_asset = event_type === 'zero_result' || metadata?.userRequested === true;
      
      const { error } = await supabase.rpc('upsert_search_demand_log', {
        p_keyword: query,
        p_normalized_keyword: p_normalized,
        p_need_asset: p_need_asset
      });
      
      if (error) {
        console.warn('Demand Radar RPC failed', error);
        if (error.code === 'PGRST202' || error.message?.includes('cache')) {
          // Fallback if RPC schema cache is stale
          console.log('Using manual fallback for search_demand_logs due to stale RPC cache');
          const { data: existing } = await supabase.from('search_demand_logs').select('search_count, priority_score').eq('normalized_keyword', p_normalized).single();
          if (existing) {
             const newScore = ((existing.search_count + 1) * 2) + 10 + (p_need_asset ? 50 : 0);
             const { error: upErr } = await supabase.from('search_demand_logs').update({
                search_count: existing.search_count + 1,
                last_seen_at: new Date().toISOString(),
                need_asset: p_need_asset,
                priority_score: newScore
             }).eq('normalized_keyword', p_normalized);
             if (upErr) console.error('Fallback update error:', upErr);
          } else {
             const newScore = (1 * 2) + 10 + (p_need_asset ? 50 : 0);
             const { error: inErr } = await supabase.from('search_demand_logs').insert({
                keyword: query,
                normalized_keyword: p_normalized,
                search_count: 1,
                last_seen_at: new Date().toISOString(),
                need_asset: p_need_asset,
                priority_score: newScore
             });
             if (inErr) console.error('Fallback insert error:', inErr);
          }
        }
      }
      
      // Keep old RPC for backward compatibility
      const { error: oldError } = await supabase.rpc('upsert_search_query', {
        p_query: query,
        p_normalized_query: p_normalized,
        p_language_guess: null,
        p_matched_asset_count: event_type === 'zero_result' ? 0 : 1, // rough estimate
        p_has_results: event_type !== 'zero_result',
        p_user_agent_hash: userAgentHash,
        p_source_page: source_page || '/',
        p_suggested_category: category || null
      });
      if (oldError) console.warn('Old RPC failed', oldError);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Error in demand track API:', err);
    return NextResponse.json({ ok: false, error: 'INTERNAL_SERVER_ERROR' }, { status: 200 }); 
  }
}
