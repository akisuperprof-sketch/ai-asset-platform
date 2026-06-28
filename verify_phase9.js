const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.production.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("=== TASK 1: DB Migration 確認 ===");
  const tables = ['auto_factory_settings', 'banned_keywords', 'pinterest_posts', 'social_posts'];
  for (const table of tables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (error && error.code === '42P01') {
      console.log(`❌ Table missing: ${table}`);
    } else if (error) {
      console.log(`⚠️ Error on ${table}: ${error.message}`);
    } else {
      console.log(`✅ Table exists: ${table}`);
    }
  }

  console.log("\n=== TASK 2: assets カラム確認 ===");
  const { data: assetData, error: assetErr } = await supabase.from('assets').select('metadata').limit(1);
  if (assetErr) {
    console.log(`❌ assets metadata error: ${assetErr.message}`);
  } else {
    console.log(`✅ assets.metadata exists (JSONB column handling SEO/Pinterest fields).`);
  }

  console.log("\n=== TASK 3: banned_keywords 確認 ===");
  const { data: bannedData, error: bannedErr } = await supabase.from('banned_keywords').select('keyword, reason').limit(20);
  if (bannedErr) {
    console.log(`❌ banned_keywords error: ${bannedErr.message}`);
  } else {
    console.log(`✅ banned_keywords count: ${bannedData.length}`);
    bannedData.forEach(b => console.log(`  - ${b.keyword} (${b.reason})`));
  }
}

run().catch(console.error);
