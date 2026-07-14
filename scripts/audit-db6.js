const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function runAudit() {
  try {
    const { count: qaPassed } = await supabase.from('generation_jobs').select('*', { count: 'exact', head: true }).eq('qa_passed', true);
    const { count: qaFailed } = await supabase.from('generation_jobs').select('*', { count: 'exact', head: true }).eq('qa_passed', false);
    
    // Fallback if qa_passed doesn't exist
    let passed = qaPassed;
    let failed = qaFailed;
    if (passed === null) {
      const { count: completed } = await supabase.from('generation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'completed');
      const { count: failedStatus } = await supabase.from('generation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'failed');
      passed = completed;
      failed = failedStatus;
    }
    
    const { count: storageCount } = await supabase.from('assets').select('*', { count: 'exact', head: true }).not('image_url', 'is', null);
    
    console.log(JSON.stringify({ qaPassed: passed, qaFailed: failed, storageCount }, null, 2));
  } catch (err) { console.error(err); }
}
runAudit();
