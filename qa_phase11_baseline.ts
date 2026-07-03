import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function countTable(table: string) {
  const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) {
    console.log(`[${table}] Error:`, error.message);
    return null;
  }
  return count;
}

async function main() {
  console.log("=== PGRST205 Resolution Check & Baseline ===");
  const tables = [
    'growth_engine_runs', 'ceo_reports', 'index_queue', 'revenue_analysis', 
    'pinterest_posts', 'factory_logs', 'assets', 'growth_scores'
  ];
  for (const t of tables) {
    const c = await countTable(t);
    console.log(`Table ${t}: ${c !== null ? c + ' rows' : 'Error'}`);
  }
  
  // Baseline for approved / qa_failed
  const { count: approvedCount } = await supabase.from('assets').select('*', { count: 'exact', head: true }).eq('qa_status', 'approved');
  const { count: qaFailedCount } = await supabase.from('assets').select('*', { count: 'exact', head: true }).eq('qa_status', 'qa_failed');
  console.log(`Assets Baseline - Approved: ${approvedCount}, QA Failed: ${qaFailedCount}`);

  // Auto factory settings
  const { data: settings } = await supabase.from('auto_factory_settings').select('*').eq('id', 'default').single();
  console.log("Settings Baseline:", settings);
}

main().catch(console.error);
