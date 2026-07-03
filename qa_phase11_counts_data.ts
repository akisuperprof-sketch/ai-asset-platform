import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
async function main() {
  const { data: a } = await supabase.from('assets').select('id').eq('status', 'approved');
  console.log("Approved Assets Length:", a?.length);
}
main().catch(console.error);
