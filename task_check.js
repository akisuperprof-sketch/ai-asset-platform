const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.worker.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase
    .from('generation_jobs')
    .select('provider, status');
    
    let counts = {};
    data.forEach(d => {
        let key = `${d.provider} - ${d.status}`;
        counts[key] = (counts[key] || 0) + 1;
    });
    console.log(counts);
}
check();
