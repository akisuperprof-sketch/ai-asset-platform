import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminClient = createClient(supabaseUrl, supabaseKey);

async function checkState() {
  console.log("=== PRE-RUN STATE ===");
  
  const { count: approvedCount } = await adminClient.from('assets').select('*', { count: 'exact', head: true }).eq('qa_status', 'approved');
  console.log(`Approved Assets: ${approvedCount}`);

  const { count: queuedCount } = await adminClient.from('generation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'queued');
  console.log(`Queued Jobs: ${queuedCount}`);

  const { count: qaFailedCount } = await adminClient.from('generation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'qa_failed');
  console.log(`QA Failed Jobs: ${qaFailedCount}`);

  const { data: alerts } = await adminClient.from('system_alerts').select('*').order('created_at', { ascending: false }).limit(1);
  console.log(`Latest Alert:`, alerts?.[0] ? alerts[0].message : 'None');

  const { data: logs } = await adminClient.from('factory_logs').select('*').order('created_at', { ascending: false }).limit(1);
  console.log(`Latest Factory Log:`, logs?.[0] ? logs[0].task : 'None');

  const { data: settings } = await adminClient.from('auto_factory_settings').select('*').eq('id', 'default').single();
  console.log(`Auto Factory Enabled:`, settings?.is_enabled);
  console.log(`Daily Target:`, settings?.daily_target);
}

checkState();
