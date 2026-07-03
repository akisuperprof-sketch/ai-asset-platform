import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const check = async (table: string) => {
    const { data, error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    if (error) console.log(`Error on ${table}:`, error.message);
    else console.log(`Success on ${table}: count=${count}`);
  }

  await check('growth_engine_runs');
  await check('ceo_reports');
  await check('index_queue');
  await check('revenue_analysis');
  await check('pinterest_posts');
  await check('factory_logs');
  await check('assets');
}

main().catch(console.error);
