const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data, error } = await supabase
    .from('auto_factory_settings')
    .update({ is_enabled: true })
    .eq('id', 'default')
    .select();

  if (error) {
    console.error("Error enabling Auto Factory:", error);
  } else {
    console.log("Auto Factory Enabled:", data);
  }
}
run();
