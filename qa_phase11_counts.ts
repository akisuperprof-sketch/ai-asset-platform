import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
async function main() {
  const { count: a } = await supabase.from('assets').select('*', { count: 'exact', head: true }).eq('status', 'approved');
  const { count: q } = await supabase.from('generation_jobs').select('*', { count: 'exact', head: true }).in('status', ['queued', 'processing']);
  const { count: p } = await supabase.from('pinterest_posts').select('*', { count: 'exact', head: true });
  const { count: f } = await supabase.from('factory_logs').select('*', { count: 'exact', head: true });
  console.log("Approved Assets:", a);
  console.log("Queued/Processing Jobs:", q);
  console.log("Pinterest posts:", p);
  console.log("Factory logs:", f);
}
main().catch(console.error);
