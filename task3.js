const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.worker.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // Check how many real jobs are currently queued
  const { data: realQueued, error } = await supabase
    .from('generation_jobs')
    .select('*')
    .eq('status', 'queued')
    .neq('provider', 'DRY_RUN')
    .neq('provider', 'dry_run');
    
  console.log(`Currently we have ${realQueued.length} REAL queued jobs.`);
  
  if (realQueued.length < 40) {
    const toCreate = 40 - realQueued.length;
    console.log(`Need to create ${toCreate} more jobs.`);
    
    const categories = ['ramen', 'sushi', 'onigiri', 'tempura', 'yakitori', 'matcha', 'japanese-pattern'];
    let jobs = [];
    
    // We will generate simple prompts based on the category
    for (let i = 0; i < toCreate; i++) {
      const cat = categories[i % categories.length];
      jobs.push({
        keyword: `${cat} variation ${i}`,
        category: cat,
        provider: 'GOOGLE_NANO_BANANA',
        status: 'queued',
        prompt: `High quality, ultra-realistic photograph of delicious ${cat}, white background, studio lighting, professional food photography, 8k resolution`,
        negative_prompt: `blurry, low quality, distorted, extra limbs, bad lighting, text, watermark`,
        qa_score: 0,
        commercial_score: 0,
        ai_artifact_score: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
    
    const { error: insertError } = await supabase.from('generation_jobs').insert(jobs);
    if (insertError) {
      console.error("Insert failed:", insertError);
    } else {
      console.log(`Successfully created ${toCreate} new real jobs.`);
    }
  } else {
    console.log("We already have enough real queued jobs.");
  }
}
run();
