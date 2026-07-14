const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function runAudit() {
  const { data, error } = await supabase.from('generation_jobs').select('*');
  if (error) { console.error(error); return; }
  const stats = { total: data.length, status: {} };
  data.forEach(d => {
    stats.status[d.status] = (stats.status[d.status] || 0) + 1;
  });
  console.log(JSON.stringify(stats, null, 2));
}
runAudit();
