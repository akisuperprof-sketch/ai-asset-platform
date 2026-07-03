import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
async function main() {
  const { data: logs } = await supabase.from('factory_logs').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Latest Factory Logs:");
  logs?.forEach(l => console.log(l.action, l.details));
}
main().catch(console.error);
