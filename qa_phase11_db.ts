import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.production' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDb() {
  console.log("Checking DB...");
  const tables = ['ceo_reports', 'index_queue', 'revenue_analysis', 'assets'];
  for (const table of tables) {
    const { data: data2, error: err2 } = await supabase.from(table).select('*').limit(1);
    
    if (err2 && err2.code === '42P01') {
      console.log(`❌ Table missing: ${table}`);
    } else {
      console.log(`✅ Table exists: ${table}`);
      if (table === 'assets') {
         // check column
         const asset = data2?.[0];
         if (asset && 'internal_links' in asset) {
            console.log(`✅ Column exists: assets.internal_links`);
         } else {
            console.log(`❌ Column missing or no data: assets.internal_links`);
         }
      }
    }
  }

  // user requested growth_scores table
  const { error: err3 } = await supabase.from('growth_scores').select('*').limit(1);
  if (err3 && err3.code === '42P01') {
    console.log(`❌ Table missing: growth_scores`);
  } else {
    console.log(`✅ Table exists: growth_scores`);
  }
}

checkDb();
