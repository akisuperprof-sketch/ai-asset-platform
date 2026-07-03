import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
async function main() {
  const { data: jobs } = await supabase.from('generation_jobs').select('*').order('created_at', { ascending: false }).limit(5);
  console.log("Latest Jobs:", jobs);
}
main().catch(console.error);
