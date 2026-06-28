const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.production.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log("=== DB 確認 ===");
  
  // 1. factory_logs
  const { error: logErr } = await supabase.from('factory_logs').select('*').limit(1);
  if (logErr) console.log(`❌ factory_logs: ${logErr.message}`);
  else console.log(`✅ factory_logs exists.`);

  // 2. assets columns
  const cols = [
    'seo_title', 'seo_description', 'alt_text', 'usage_examples', 
    'faq', 'pinterest_description', 'asset_value_score'
  ];
  const { data: assetData, error: assetErr } = await supabase.from('assets').select(cols.join(',')).limit(1);
  if (assetErr) console.log(`❌ assets columns error: ${assetErr.message}`);
  else console.log(`✅ assets columns exist: ${cols.join(', ')}`);
}

run().catch(console.error);
