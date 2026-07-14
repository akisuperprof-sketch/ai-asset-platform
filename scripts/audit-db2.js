const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env.production.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function runAudit() {
  try {
    const { count: qaPassed } = await supabase.from('generation_jobs').select('*', { count: 'exact', head: true }).eq('qa_passed', true);
    const { count: qaFailed } = await supabase.from('generation_jobs').select('*', { count: 'exact', head: true }).eq('qa_passed', false);
    const { count: failedCount } = await supabase.from('generation_jobs').select('*', { count: 'exact', head: true }).eq('status', 'failed');
    
    // Check Storage
    let storageCount = 0;
    try {
      // Supabase storage api limit is 100, we'll just check if it's there
      // We'll paginate to get total
      let hasMore = true;
      let offset = 0;
      while(hasMore) {
        const { data, error } = await supabase.storage.from('assets').list('', { limit: 1000, offset });
        if(error || !data || data.length === 0) {
           hasMore = false;
        } else {
           storageCount += data.filter(d => !d.name.startsWith('.emptyFolderPlaceholder')).length;
           offset += data.length;
           if(data.length < 1000) hasMore = false;
        }
      }
    } catch(e) {}
    
    console.log(JSON.stringify({ qaPassed, qaFailed, failedCount, storageCount }, null, 2));
  } catch (err) {
    console.error(err);
  }
}
runAudit();
