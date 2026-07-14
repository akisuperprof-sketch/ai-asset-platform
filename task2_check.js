const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayDateStr = today.toISOString().split('T')[0];

  const { data: aiPlan } = await supabase
    .from('daily_ai_plans')
    .select('target_generation_count')
    .eq('date', todayDateStr)
    .single();
    
  console.log("AI Plan target for today:", aiPlan);
}
run();
