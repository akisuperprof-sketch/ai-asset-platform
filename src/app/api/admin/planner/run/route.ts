import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Helper to convert Japanese keywords to slug format if needed
function generateSlugFromKeyword(keyword: string): string {
  // Try to use a base transliteration or just rely on a hash for non-english
  // For simplicity, we just use the keyword as base. The actual slug might be generated differently in generation phase.
  // We'll check exact keyword match in DB.
  return keyword.toLowerCase().trim().replace(/[^a-z0-9\-]/g, '-').replace(/-+/g, '-');
}

export async function POST(request: Request) {
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 500 });
  }

  // Basic Auth
  const authHeader = request.headers.get('authorization') || request.headers.get('x-agent-token');
  if (authHeader !== 'temp-agent-token-123' && authHeader !== `Bearer ${process.env.D_STRATEGY_KEY}`) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let limit = 20;
    try {
      const body = await request.json();
      if (body && typeof body.limit === 'number') {
        limit = body.limit;
      }
    } catch(e) {
      // ignore
    }

    // 1. Fetch top demand keywords
    const { data: demandLogs, error: demandError } = await supabase
      .from('search_demand_logs')
      .select('*')
      .order('priority_score', { ascending: false })
      .limit(limit);

    if (demandError) {
      throw new Error(`Failed to fetch demand logs: ${demandError.message}`);
    }

    if (!demandLogs || demandLogs.length === 0) {
      return NextResponse.json({ success: true, message: 'No demand logs found.', added: 0 });
    }

    const keywords = demandLogs.map((log) => log.keyword);
    
    // Duplicate Prevention v2
    // 2. Check existing generation_jobs (prevent duplicate queue)
    const { data: existingJobs } = await supabase
      .from('generation_jobs')
      .select('keyword')
      .in('keyword', keywords)
      .in('status', ['queued', 'processing', 'retry_pending']); // Exclude failed to allow retry, but exclude active ones

    const activeKeywords = new Set((existingJobs || []).map((job) => job.keyword));

    // 3. Check existing assets (prevent re-generating already approved assets)
    // We check if the keyword exists as a category, or as a substring in title/storage_key.
    const { data: existingAssets } = await supabase
      .from('assets')
      .select('title, storage_key, category')
      .in('review_status', ['approved']);

    const jobsToInsert = [];

    for (const log of demandLogs) {
      const keyword = log.keyword;
      const slugGuess = generateSlugFromKeyword(keyword);

      if (activeKeywords.has(keyword)) {
        continue;
      }
      
      // Rough duplication check against assets
      let isDuplicate = false;
      if (existingAssets) {
        for (const asset of existingAssets) {
          const kwLower = keyword.toLowerCase();
          if (asset.category?.toLowerCase() === kwLower ||
              asset.title?.toLowerCase().includes(kwLower) ||
              asset.storage_key?.toLowerCase().includes(kwLower) ||
              asset.storage_key?.toLowerCase().includes(slugGuess)
          ) {
            isDuplicate = true;
            break;
          }
        }
      }

      if (isDuplicate) {
        continue;
      }

      jobsToInsert.push({
        keyword: keyword,
        category: 'demand', // Use a special category for demand radar generated items
        provider: 'GOOGLE_NANO_BANANA',
        status: 'queued',
        prompt: `High quality, ultra-realistic photograph of ${keyword}, isolated on white background, studio lighting, professional photography, 8k resolution`,
        negative_prompt: `blurry, low quality, distorted, extra limbs, bad lighting, text, watermark, background elements`,
        qa_score: 0,
        commercial_score: 0,
        ai_artifact_score: 0,
        metadata: { source: 'demand_radar', demand_log_id: log.id, priority_score: log.priority_score }
      });
    }

    if (jobsToInsert.length > 0) {
      const { error: insertError } = await supabase.from('generation_jobs').insert(jobsToInsert);
      if (insertError) {
        throw new Error(`Failed to insert generation jobs: ${insertError.message}`);
      }
      
      // Update the generated flag if it existed
      const insertedKeywords = jobsToInsert.map(j => j.keyword);
      await supabase
        .from('search_demand_logs')
        .update({ need_asset: false }) // Reset need_asset
        .in('keyword', insertedKeywords);
        
      return NextResponse.json({ success: true, added: jobsToInsert.length, jobs: insertedKeywords });
    }

    return NextResponse.json({ success: true, added: 0, message: 'All top demands are already queued or exist.' });

  } catch (error: any) {
    console.error('Auto Planner Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
