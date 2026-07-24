import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

function inferCategory(query: string): string {
  const q = query.toLowerCase();
  if (q.includes('ramen')) return 'ramen';
  if (q.includes('sushi')) return 'sushi';
  if (q.includes('mochi')) return 'mochi';
  if (q.includes('bento')) return 'bento';
  if (q.includes('torii')) return 'torii gate';
  if (q.includes('sakura')) return 'sakura';
  if (q.includes('tempura')) return 'tempura';
  if (q.includes('gyoza')) return 'gyoza';
  return 'uncategorized_demand';
}

function generatePrompt(query: string): string {
  // Simple prompt template
  return `High quality, ultra detailed transparent png of ${query}, isolated on white background, sharp focus, professional studio lighting, 8k resolution`;
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('d_strategy_session');
    
    const envKey = process.env.D_STRATEGY_KEY;
    if (!envKey || !adminSession || adminSession.value !== envKey.trim()) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    if (!adminClient) {
      return NextResponse.json({ success: false, error: 'NO_DB' }, { status: 500 });
    }

    const body = await request.json();
    const items = body.items || [];
    
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'INVALID_INPUT' }, { status: 400 });
    }

    // Safety Limit
    if (items.length > 10) {
      return NextResponse.json({ success: false, error: 'LIMIT_EXCEEDED' }, { status: 400 });
    }

    const results = [];

    for (const item of items) {
      const q = item.query;
      const nq = item.normalized_query || q.toLowerCase().trim();
      const priority = item.priority_score || 0;
      
      // 1. Check if already in generation_jobs
      const { data: existingJobs } = await adminClient
        .from('generation_jobs')
        .select('id')
        .eq('keyword', nq)
        .limit(1);

      if (existingJobs && existingJobs.length > 0) {
        results.push({ query: q, status: 'Already Exists', reason: 'job_exists' });
        continue;
      }

      // 2. Check if already in assets (title matching or tags matching)
      // Since tags is an array, we can use ilike on title
      const { data: existingAssets } = await adminClient
        .from('assets')
        .select('id')
        .ilike('title', `%${nq}%`)
        .limit(1);

      if (existingAssets && existingAssets.length > 0) {
        results.push({ query: q, status: 'Already Exists', reason: 'asset_exists' });
        continue;
      }

      // 3. Insert into generation_jobs
      const cat = inferCategory(nq);
      const prompt = generatePrompt(nq);
      
      const { error: insertError } = await adminClient
        .from('generation_jobs')
        .insert({
          keyword: nq,
          category: cat,
          prompt: prompt,
          negative_prompt: "background, noisy, blurry, low quality, artifacts",
          provider: 'imagen3',
          status: 'queued',
          qa_result: {
            demand_loop: {
              source: "demand_loop",
              original_query: q,
              normalized_query: nq,
              priority_score: priority,
              requested_from: "admin_dashboard"
            }
          }
        });

      if (insertError) {
        results.push({ query: q, status: 'Failed', reason: insertError.message });
      } else {
        results.push({ query: q, status: 'Queued' });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("Queue Demand Error:", err);
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
