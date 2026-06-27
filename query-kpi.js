const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkKpi() {
  const { data: assets, error } = await supabase
    .from('assets')
    .select('id, slug, review_status, storage_key')
    .like('storage_key', 'real/%')
    .order('created_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error("DB Error:", error);
    process.exit(1);
  }

  const approved = assets.filter(a => a.review_status === 'approved');
  
  // Count total approved
  const { count } = await supabase.from('assets').select('*', { count: 'exact', head: true }).like('storage_key', 'real/%').eq('review_status', 'approved');

  console.log("Total Approved KPI:", count);
  console.log("Latest Slug:", assets[0] ? assets[0].slug : null);
}

checkKpi();
