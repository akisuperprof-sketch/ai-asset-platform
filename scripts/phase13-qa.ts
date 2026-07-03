import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminClient = createClient(supabaseUrl, supabaseKey);

async function runQA() {
  console.log("1. Checking DB Tables...");
  const tables = ['search_console_metrics', 'system_health_scores', 'self_repair_logs'];
  for (const table of tables) {
    const { error } = await adminClient.from(table).select('*').limit(1);
    if (error) {
      console.log(`[ERROR] Table ${table}: ${error.message}`);
    } else {
      console.log(`[PASS] Table ${table} verified.`);
    }
  }

  // To test the API, we can use fetch.
  // We need the local server running. Is it running? 
}

runQA();
