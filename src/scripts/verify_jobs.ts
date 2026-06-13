import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars from real production env
dotenv.config({ path: path.resolve(process.cwd(), '.env.production.real') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env.production.real");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  console.log("--- Supabase Verification ---");

  // 1. Total count
  const { count: totalCount, error: err1 } = await supabase
    .from('generation_jobs')
    .select('*', { count: 'exact', head: true });
  
  if (err1) {
    console.error("Error fetching total count:", err1.message);
    return;
  }
  console.log(`1. Total generation_jobs: ${totalCount}`);

  // 2. Count for recent Category Domination
  // We can identify them by checking if qa_result->categoryDomination exists
  const { data: catDomData, error: err2 } = await supabase
    .from('generation_jobs')
    .select('id, category, status, qa_result, keyword');
  
  if (err2) {
    console.error("Error fetching jobs:", err2.message);
    return;
  }

  const categoryDominationJobs = catDomData.filter(job => 
    job.qa_result && job.qa_result.categoryDomination
  );
  console.log(`2. Category Domination jobs count: ${categoryDominationJobs.length}`);

  // 3. By Category
  const categoryCount: Record<string, number> = {};
  categoryDominationJobs.forEach(job => {
    categoryCount[job.category] = (categoryCount[job.category] || 0) + 1;
  });
  console.log(`3. By Category:`, categoryCount);

  // 4. By Status
  const statusCount: Record<string, number> = {};
  categoryDominationJobs.forEach(job => {
    statusCount[job.status] = (statusCount[job.status] || 0) + 1;
  });
  console.log(`4. By Status:`, statusCount);

  // 5. Duplicates
  const keywordCount: Record<string, number> = {};
  let duplicates = 0;
  categoryDominationJobs.forEach(job => {
    if (keywordCount[job.keyword]) {
      duplicates++;
    }
    keywordCount[job.keyword] = (keywordCount[job.keyword] || 0) + 1;
  });
  console.log(`5. Duplicates found: ${duplicates}`);

  // 6. Sample Jobs
  console.log(`6. Sample Jobs (up to 3):`);
  const samples = categoryDominationJobs.slice(0, 3).map(j => ({
    id: j.id,
    category: j.category,
    keyword: j.keyword,
    seoSlug: j.qa_result.categoryDomination.seoSlug,
    relatedGroupId: j.qa_result.categoryDomination.relatedGroupId
  }));
  console.log(JSON.stringify(samples, null, 2));

  // 7. PopAds Env
  console.log(`\n--- Environment Check ---`);
  console.log(`7. NEXT_PUBLIC_POPADS_ENABLED: ${process.env.NEXT_PUBLIC_POPADS_ENABLED || 'undefined'}`);
}

main().catch(console.error);
