const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function runAudit() {
  const { data, error } = await supabase.from('assets').select('id, slug, review_status, legal_status, published_at').eq('review_status', 'approved');
  if (error) { console.error(error); return; }
  
  let noPublishedAt = 0;
  let noLegalClean = 0;
  data.forEach(d => {
    if (!d.published_at) noPublishedAt++;
    if (d.legal_status !== 'clean') noLegalClean++;
  });
  
  console.log(JSON.stringify({ totalApproved: data.length, noPublishedAt, noLegalClean }, null, 2));
}
runAudit();
