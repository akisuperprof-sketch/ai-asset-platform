const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.worker.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function run() {
  const { count } = await supabase.from('assets').select('*', { count: 'exact', head: true }).eq('review_status', 'approved');
  console.log("Approved count: ", count);
}
run();
