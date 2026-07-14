const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function runAudit() {
  const { data } = await supabase.from('generation_jobs').select('status, qa_passed');
  const stats = { total: data.length, status: {}, qa_passed: { true: 0, false: 0, null: 0 } };
  data.forEach(d => {
    stats.status[d.status] = (stats.status[d.status] || 0) + 1;
    stats.qa_passed[d.qa_passed] = (stats.qa_passed[d.qa_passed] || 0) + 1;
  });
  console.log(JSON.stringify(stats, null, 2));
}
runAudit();
