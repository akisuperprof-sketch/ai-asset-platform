import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log("=== PHASE 11 MANUAL QA VERIFICATION ===");
  
  const { data: runs } = await supabase.from('growth_engine_runs').select('*').order('started_at', { ascending: false }).limit(1);
  console.log("Latest Run:", runs && runs.length > 0 ? runs[0] : null);

  const { count: ceoCount } = await supabase.from('ceo_reports').select('*', { count: 'exact', head: true });
  console.log("CEO Reports Count:", ceoCount);

  const { count: indexCount } = await supabase.from('index_queue').select('*', { count: 'exact', head: true });
  console.log("Index Queue Count:", indexCount);

  const { count: revCount } = await supabase.from('revenue_analysis').select('*', { count: 'exact', head: true });
  console.log("Revenue Analysis Count:", revCount);
  
  const { count: pinterestCount } = await supabase.from('pinterest_posts').select('*', { count: 'exact', head: true });
  console.log("Pinterest Posts Count:", pinterestCount);

  const { count: factoryCount } = await supabase.from('factory_logs').select('*', { count: 'exact', head: true });
  console.log("Factory Logs Count:", factoryCount);

  const { count: approvedCount } = await supabase.from('assets').select('*', { count: 'exact', head: true }).eq('qa_status', 'approved');
  console.log("Approved Assets Count:", approvedCount);

  const { count: qaFailedCount } = await supabase.from('assets').select('*', { count: 'exact', head: true }).eq('qa_status', 'qa_failed');
  console.log("QA Failed Assets Count:", qaFailedCount);

  const { data: qaFailedAssets } = await supabase.from('assets').select('id, qa_reasons').eq('qa_status', 'qa_failed').limit(1);
  if (qaFailedAssets && qaFailedAssets.length > 0) {
    console.log("Sample QA Failed Reasons:", qaFailedAssets[0].qa_reasons);
  }

}

main().catch(console.error);
