import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const adminClient = createClient(supabaseUrl, supabaseKey);

async function verify() {
  const todayDateStr = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  console.log("=== Checking Auto Scaling (daily_ai_plans) ===");
  const { data: plan } = await adminClient.from('daily_ai_plans').select('*').eq('date', tomorrowStr).single();
  console.log("target_generation_count:", plan?.target_generation_count);
  console.log("ai_reasoning:", plan?.ai_reasoning);
}

verify();
