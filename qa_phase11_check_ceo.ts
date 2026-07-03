import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
async function main() {
  const { data, error } = await supabase.from('ceo_reports').select('*');
  console.log("ceo_reports:", data);
  if (error) console.log("Error:", error);
}
main().catch(console.error);
