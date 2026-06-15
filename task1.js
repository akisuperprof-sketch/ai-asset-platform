const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.worker.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase.from('generation_jobs').select('id, provider, status');
  const toArchive = data.filter(r => 
    (r.provider.toLowerCase() === 'dry_run') && 
    (r.status === 'queued' || r.status === 'retry_pending' || r.status === 'failed' || r.status === 'qa_failed')
  );
  
  console.log(`Found ${toArchive.length} extra dry_run jobs to archive.`);
  
  if (toArchive.length > 0) {
    const ids = toArchive.map(r => r.id);
    const { error: updateError } = await supabase
      .from('generation_jobs')
      .update({ status: 'archived_dry_run', updated_at: new Date().toISOString() })
      .in('id', ids);
      
    if (updateError) {
      console.error(updateError);
    } else {
      console.log("Archived successfully.");
    }
  }
}
run();
