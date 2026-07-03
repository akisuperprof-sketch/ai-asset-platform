import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log("=== PHASE 11 INITIAL STATE ===");
  
  // 1. settings
  const { data: settings } = await supabase.from('auto_factory_settings').select('*').eq('id', 'default').single();
  console.log("Settings:", settings);

  // set target to 3 for safety if not already
  if (settings.daily_target > 3) {
    await supabase.from('auto_factory_settings').update({ daily_target: 3, is_enabled: true }).eq('id', 'default');
    console.log("Temporarily set daily_target to 3");
  } else if (!settings.is_enabled) {
    await supabase.from('auto_factory_settings').update({ is_enabled: true }).eq('id', 'default');
    console.log("Enabled engine");
  }

  // 2. counts
  const { count: approved } = await supabase.from('assets').select('*', { count: 'exact', head: true }).eq('status', 'approved');
  const { count: queued } = await supabase.from('generation_jobs').select('*', { count: 'exact', head: true }).in('status', ['queued', 'processing']);
  console.log("Approved Assets:", approved);
  console.log("Queued/Processing Jobs:", queued);

  // 3. run logs
  const { data: lastRun } = await supabase.from('growth_engine_runs').select('*').order('started_at', { ascending: false }).limit(1);
  console.log("Last Run Log:", lastRun);
}

main().catch(console.error);
