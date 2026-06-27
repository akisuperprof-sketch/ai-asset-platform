const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.worker.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const { data } = await supabase.from('generation_jobs').select('id').eq('status', 'generating');
  if (data && data.length > 0) {
    await supabase.from('generation_jobs').update({ status: 'queued' }).in('id', data.map(j => j.id));
    console.log("Reset " + data.length + " jobs.");
  }
}
run();
