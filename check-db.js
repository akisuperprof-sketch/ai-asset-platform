const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!supabaseUrl) {
  console.log("No supabase URL. Simulating results.");
  process.exit(0);
}
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function check() {
  const { count } = await adminClient.from('assets').select('*', { count: 'exact', head: true }).like('storage_key', 'real/%').eq('review_status', 'approved');
  console.log("Total Approved KPI:", count);

  const { data: latest } = await adminClient.from('assets')
    .select('title, slug, review_status, created_at, qa_reasons')
    .order('created_at', { ascending: false })
    .limit(5);
    
  console.log("Latest 5 assets:");
  console.table(latest);
}
check();
