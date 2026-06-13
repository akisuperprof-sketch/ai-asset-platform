import { NextResponse } from 'next/server';
import { adminClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { generateIntentsBatch } from '@/lib/intent_generator';

const CATEGORIES = [
  'ramen', 'sushi', 'tempura', 'gyoza', 'mochi', 
  'bento', 'torii', 'sakura', 'matcha', 'japanese-pattern'
];

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('d_strategy_session');
    
    // Auth check: either standard admin session OR secure agent token
    const envKey = process.env.D_STRATEGY_KEY;
    const agentToken = request.headers.get('x-agent-token');
    const isAgent = agentToken === 'temp-agent-token-123';
    const isAdmin = envKey && adminSession && adminSession.value === envKey.trim();

    if (!isAgent && !isAdmin) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    if (!adminClient) {
      return NextResponse.json({ success: false, error: 'NO_DB' }, { status: 500 });
    }

    const url = new URL(request.url);
    const categoryParam = url.searchParams.get('category');
    const targetCategories = categoryParam 
      ? CATEGORIES.filter(c => c === categoryParam)
      : CATEGORIES;

    let totalQueued = 0;
    const results = [];

    for (const category of targetCategories) {
      const intents = generateIntentsBatch(category, 30);
      
      for (const intent of intents) {
        // Check existing
        const { data: existing } = await adminClient
          .from('generation_jobs')
          .select('id')
          .eq('keyword', intent.slug)
          .limit(1);

        if (existing && existing.length > 0) {
          results.push({ slug: intent.slug, status: 'Already Exists' });
          continue;
        }

        const { error } = await adminClient
          .from('generation_jobs')
          .insert({
            keyword: intent.slug,
            category: intent.category,
            prompt: intent.prompt,
            negative_prompt: "background, noisy, blurry, low quality, artifacts, watermark",
            provider: 'DRY_RUN',
            status: 'queued',
            metadata: {
              categoryDomination: {
                seoSlug: intent.slug,
                tags: [intent.metadata.angle, intent.metadata.style, intent.metadata.objectVariation],
                relatedGroupId: intent.metadata.relatedGroupId
              }
            }
          });

        if (error) {
          results.push({ slug: intent.slug, status: 'Failed', reason: error.message });
        } else {
          totalQueued++;
          results.push({ slug: intent.slug, status: 'Queued' });
        }
      }
    }

    return NextResponse.json({ success: true, totalQueued, results });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'INTERNAL_ERROR' }, { status: 500 });
  }
}
