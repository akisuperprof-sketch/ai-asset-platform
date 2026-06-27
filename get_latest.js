const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.worker.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase
    .from('generation_jobs')
    .select('keyword, status, metadata')
    .eq('provider', 'GOOGLE_NANO_BANANA')
    .order('updated_at', { ascending: false })
    .limit(20);
    
    console.log(data);
}
check();
