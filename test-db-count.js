const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { count, error } = await adminClient
    .from('assets')
    .select('*', { count: 'exact', head: true })
    .eq('review_status', 'approved')
    .eq('source', 'real');
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Total Approved Real Assets:', count);
  }
}
main();
