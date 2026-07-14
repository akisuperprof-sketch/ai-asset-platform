import { verifyAdminRequest } from '@/lib/server/cron-auth';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { PromptEngine } from '@/lib/prompt-engine';

export async function POST(request: Request) {
  const authResult = verifyAdminRequest(request);
  if (!authResult.ok) return authResult.response;

  try {
    // 1. Auth check (D_STRATEGY_KEY cookie authentication)

    // 2. Feature flag check
    if (process.env.GENERATION_ENABLED === 'false') {
      return NextResponse.json({ success: false, error: 'GENERATION_DISABLED' }, { status: 403 });
    }

    // 3. Initialize Supabase Admin client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: 'DB_CONFIG_ERROR' }, { status: 500 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // 4. Generate 100 Premium Prompts
    const engine = new PromptEngine();
    const result = await engine.generatePrompts(100);

    if (!result || result.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'PROMPT_GENERATION_FAILED', 
        details: 'No prompts were generated' 
      }, { status: 500 });
    }

    // 5. Transform and Queue Jobs
    // Store as queued (dry_run)
    const jobs = result.map((job: any) => ({
      prompt: job.prompt,
      negative_prompt: job.negative_prompt ?? job.negativePrompt ?? "",
      category: job.category ?? job.target_category ?? job.targetCategory ?? job.keyword ?? "uncategorized",
      keyword: job.keyword ?? job.category ?? "unknown",
      status: "queued",
      provider: "dry_run",
      metadata: {
        source: "test_queue",
        dry_run: true,
        generated_at: new Date().toISOString()
      }
    }));

    // Check DB access (Select)
    const { error: selectError } = await supabaseAdmin.from('generation_jobs').select('id').limit(1);
    if (selectError) {
      return NextResponse.json({
        success: false,
        error: 'DB_SELECT_ERROR',
        details: selectError.message
      }, { status: 500 });
    }

    // 6. Insert into generation_jobs
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('generation_jobs')
      .insert(jobs)
      .select();

    if (insertError) {
      return NextResponse.json({ 
        success: false, 
        error: 'DB_INSERT_ERROR', 
        details: insertError.message 
      }, { status: 500 });
    }

    // 7. Aggregate categories
    const categoryCount: Record<string, number> = {};
    for (const r of result) {
      const cat = r.category || 'other';
      categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      count: inserted?.length || 0,
      categories: categoryCount,
      sample_prompts: result.slice(0, 5).map(r => r.prompt)
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
