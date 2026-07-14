const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log("Stopping Auto Factory...");
  const { error: updateError } = await supabase
    .from('auto_factory_settings')
    .update({ is_enabled: false })
    .eq('id', 'default');
    
  if (updateError) {
    console.error("Failed to stop:", updateError);
    return;
  }
  
  const { data, error: fetchError } = await supabase
    .from('auto_factory_settings')
    .select('is_enabled')
    .eq('id', 'default')
    .single();
    
  if (fetchError) {
    console.error("Failed to fetch:", fetchError);
  } else {
    console.log("Current state:", data);
  }
}
run();
