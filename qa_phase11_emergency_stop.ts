import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
async function main() {
  await supabase.from('auto_factory_settings').update({ is_enabled: false }).eq('id', 'default');
  console.log("Set is_enabled = false");

  const res = await fetch("http://localhost:3000/api/cron/growth-engine-v2", {
    method: "GET",
    headers: { "Authorization": `Bearer undefined` }
  });
  console.log("Response:", await res.json());

  await supabase.from('auto_factory_settings').update({ is_enabled: true }).eq('id', 'default');
  console.log("Set is_enabled = true (Resumed)");
}
main().catch(console.error);
