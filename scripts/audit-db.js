const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

// Load environment variables for local testing
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.production.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runAudit() {
  try {
    const { count: assetsTotal } = await supabase.from('assets').select('*', { count: 'exact', head: true });
    const { count: approvedCount } = await supabase.from('assets').select('*', { count: 'exact', head: true }).eq('review_status', 'approved');
    const { count: pendingCount } = await supabase.from('assets').select('*', { count: 'exact', head: true }).eq('review_status', 'pending');
    const { count: rejectedCount } = await supabase.from('assets').select('*', { count: 'exact', head: true }).eq('review_status', 'rejected');
    
    // Check if generation_jobs table exists before querying
    let generation_jobs_total = 0;
    const { count: jobsTotal, error: jobsError } = await supabase.from('generation_jobs').select('*', { count: 'exact', head: true });
    if (!jobsError) generation_jobs_total = jobsTotal;
    
    const { count: qaPassed } = await supabase.from('assets').select('*', { count: 'exact', head: true }).eq('review_status', 'approved'); // Wait, QA passed is usually approved?
    const { count: failedCount } = await supabase.from('assets').select('*', { count: 'exact', head: true }).eq('review_status', 'rejected');
    
    // Slugs
    const { data: allSlugs } = await supabase.from('assets').select('slug').eq('review_status', 'approved');
    const slugMap = {};
    let duplicateSlugs = 0;
    allSlugs.forEach(r => {
      if(slugMap[r.slug]) duplicateSlugs++;
      slugMap[r.slug] = true;
    });
    
    console.log(JSON.stringify({
      assetsTotal,
      approvedCount,
      pendingCount,
      rejectedCount,
      generation_jobs_total,
      publishedSlugs: allSlugs.length,
      duplicateSlugs
    }, null, 2));

  } catch (err) {
    console.error(err);
  }
}
runAudit();
