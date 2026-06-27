const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  const { count: qaPassedCount } = await supabase.from('generation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'qa_passed');
  console.log("QA passed jobs:", qaPassedCount);
  
  const { count: assetsCount } = await supabase.from('assets').select('*', { count: 'exact', head: true });
  console.log("Total assets:", assetsCount);
}
run();
