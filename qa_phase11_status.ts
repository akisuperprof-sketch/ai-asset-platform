import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
async function main() {
  const { count: a } = await supabase.from('assets').select('*', { count: 'exact', head: true }).eq('qa_status', 'approved');
  console.log("Approved Assets:", a);
}
main().catch(console.error);
