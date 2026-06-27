const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.worker.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase
    .from('generation_jobs')
    .select('keyword, status, commercial_score, ai_artifact_score, metadata, updated_at')
    .eq('status', 'qa_failed')
    .order('updated_at', { ascending: false })
    .limit(5);

  if (error) {
    console.error(error);
  } else {
    data.forEach((row, i) => {
      console.log(`--- [${i+1}] ${row.keyword} ---`);
      console.log(`status: ${row.status}`);
      console.log(`commercial_score: ${row.commercial_score}`);
      console.log(`ai_artifact_score: ${row.ai_artifact_score}`);
      console.log(`metadata keys:`, Object.keys(row.metadata || {}));
      if (row.metadata?.qa_reasons) {
        console.log(`qa_reasons:`, row.metadata.qa_reasons);
      }
      if (row.metadata?.qa_result) {
        console.log(`qa_result: present with score =`, row.metadata.qa_result.commercialScore);
      }
    });
  }
}

check();
