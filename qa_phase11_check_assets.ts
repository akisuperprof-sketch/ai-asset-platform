import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
async function main() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const { data: assets } = await supabase.from('assets').select('*').gte('created_at', today.toISOString()).eq('is_ai_generated', true);
  console.log("Assets Generated Today:", JSON.stringify(assets, null, 2));
}
main().catch(console.error);
