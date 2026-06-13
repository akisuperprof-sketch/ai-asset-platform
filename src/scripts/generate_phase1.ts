import { createClient } from '@supabase/supabase-js';
import { generateIntentsBatch } from '../lib/intent_generator';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CATEGORIES = [
  'ramen', 'sushi', 'tempura', 'gyoza', 'mochi', 
  'bento', 'torii', 'sakura', 'matcha', 'japanese-pattern'
];

async function main() {
  console.log('Starting Phase 1 Generation Queueing...');
  
  let totalQueued = 0;

  for (const category of CATEGORIES) {
    console.log(`Processing category: ${category}`);
    const intents = generateIntentsBatch(category, 30);
    
    for (const intent of intents) {
      const { data: existing } = await supabase
        .from('generation_jobs')
        .select('id')
        .eq('keyword', intent.slug)
        .limit(1);

      if (existing && existing.length > 0) {
        console.log(`  Skipped (already queued): ${intent.slug}`);
        continue;
      }

      const { error } = await supabase
        .from('generation_jobs')
        .insert({
          keyword: intent.slug,
          category: intent.category,
          prompt: intent.prompt,
          negative_prompt: "background, noisy, blurry, low quality, artifacts, watermark",
          provider: 'DRY_RUN',
          status: 'queued',
          qa_result: {
            categoryDomination: {
              seoSlug: intent.slug,
              tags: [intent.metadata.angle, intent.metadata.style, intent.metadata.objectVariation],
              relatedGroupId: intent.metadata.relatedGroupId
            }
          }
        });

      if (error) {
        console.error(`  Error queuing ${intent.slug}:`, error.message);
      } else {
        totalQueued++;
        console.log(`  Queued: ${intent.slug}`);
      }
    }
  }

  console.log(`\nCompleted! Total jobs queued: ${totalQueued}`);
}

main().catch(console.error);
