const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production.real' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing supabase URL or Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { count: jobsCount, error: err1 } = await supabase.from('generation_jobs').select('*', { count: 'exact', head: true });
  console.log("Total generation_jobs:", jobsCount, err1 ? err1.message : "");
  
  const { count: qaPassedJobs } = await supabase.from('generation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'qa_passed');
  console.log("QA passed jobs:", qaPassedJobs);

  const { count: assetsCount, error: err2 } = await supabase.from('assets').select('*', { count: 'exact', head: true });
  console.log("Total assets:", assetsCount, err2 ? err2.message : "");
}
run();
