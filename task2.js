const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.worker.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { count } = await supabase.from('generation_jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'queued')
    .eq('provider', 'GOOGLE_NANO_BANANA');
  console.log("Queued GOOGLE_NANO_BANANA: ", count);
}
run();
