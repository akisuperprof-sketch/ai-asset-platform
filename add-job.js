const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.production.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function addJob() {
  const { data, error } = await adminClient.from('generation_jobs').insert({
    keyword: 'test 500 error reproduction',
    category: 'test',
    status: 'queued'
  });
  console.log('Added job:', error ? error : 'Success');
}
addJob();
