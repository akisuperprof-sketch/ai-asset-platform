const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.worker.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function slugs() {
  const { data, error } = await supabase
    .from('generation_jobs')
    .select('id, keyword, status')
    .order('updated_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error(error);
  } else {
    console.log("8. Approved slug一覧");
    data.filter(row => row.status === 'qa_passed').forEach(row => {
      console.log(`- ${row.keyword.replace(/\s+/g, '-')}`);
    });
    console.log("\n9. 最新10件のQA結果");
    data.forEach(row => {
      console.log(`- ${row.keyword}: ${row.status}`);
    });
  }
}
slugs();
