import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
async function main() {
  const { data: logs } = await supabase.from('factory_logs').select('*').eq('task', 'auto_factory').order('created_at', { ascending: false }).limit(5);
  console.log("Auto Factory Logs:", JSON.stringify(logs, null, 2));
}
main().catch(console.error);
