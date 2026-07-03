import { createClient } from '@supabase/supabase-js';
require('dotenv').config({path: '.env.local'});

const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function main() {
  console.log('--- Phase A & E: 50 Assets Audit ---');
  const { data: jobs } = await adminClient.from('generation_jobs')
    .select('*')
    .eq('metadata->>source', 'operation_zero_50_run');

  if (!jobs) {
    console.log('No jobs found for the run.');
    return;
  }

  const passedJobs = jobs.filter(j => j.status === 'qa_passed');
  console.log(`Total Jobs: ${jobs.length}, Passed: ${passedJobs.length}`);

  const passedKeywords = passedJobs.map(j => j.keyword);

  // Fetch assets created in the last 2 hours matching keywords
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const { data: assets } = await adminClient.from('assets')
    .select('*')
    .in('title', passedKeywords)
    .gt('created_at', twoHoursAgo);

  console.log(`Matched Assets in DB: ${assets?.length || 0}`);

  if (!assets || assets.length === 0) return;

  // Evaluate SEO, Quality, etc.
  let scores = {
    commercial: 0,
    transparency: 0,
    ai_artifact: 0,
    seo: 0,
    valid_urls: 0,
    has_pinterest: 0,
    has_alt: 0,
    has_description: 0,
  };

  for (const asset of assets) {
    scores.commercial += asset.commercial_score || 0;
    scores.transparency += asset.transparency_score || 0;
    scores.ai_artifact += asset.ai_artifact_score || 0;
    scores.seo += asset.seo_score || 0;

    if (asset.slug) scores.valid_urls++;
    if (asset.pinterest_description) scores.has_pinterest++;
    if (asset.alt_text) scores.has_alt++;
    if (asset.seo_description) scores.has_description++;
  }

  const count = assets.length;
  console.log('\n--- Quality Scores (Avg) ---');
  console.log(`Commercial Score: ${(scores.commercial / count).toFixed(1)} / 100`);
  console.log(`Transparency Quality: ${(scores.transparency / count).toFixed(1)} / 100`);
  console.log(`AI Artifact (Higher is fewer artifacts): ${(scores.ai_artifact / count).toFixed(1)} / 100`);
  console.log(`SEO Score: ${(scores.seo / count).toFixed(1)} / 100`);

  console.log('\n--- Metadata Completion ---');
  console.log(`Valid Slugs & URLs: ${scores.valid_urls} / ${count}`);
  console.log(`Pinterest Desc: ${scores.has_pinterest} / ${count}`);
  console.log(`Alt Text: ${scores.has_alt} / ${count}`);
  console.log(`SEO Desc: ${scores.has_description} / ${count}`);

  console.log('\n--- Next Steps ---');
  console.log('If index_queue and pinterest_posts were missed, they need to be backfilled or the cron needs to catch them.');
}

main();
