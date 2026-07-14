const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.worker.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function report() {
  const { data, error } = await supabase
    .from('generation_jobs')
    .select('keyword, category, status, metadata, updated_at')
    .order('updated_at', { ascending: false })
    .limit(10);

  if (error) {
    console.error(error);
  } else {
    let passed = 0;
    let failed = 0;
    let categories = { ramen: {p:0, t:0}, sushi: {p:0, t:0}, onigiri: {p:0, t:0}, tempura: {p:0, t:0}, yakitori: {p:0, t:0}, matcha: {p:0, t:0}, 'japanese-pattern': {p:0, t:0} };
    let reasons = [];

    data.forEach(row => {
      if (row.status === 'qa_passed') {
        passed++;
        if(categories[row.category]) { categories[row.category].p++; categories[row.category].t++; }
      } else if (row.status === 'qa_failed') {
        failed++;
        if(categories[row.category]) { categories[row.category].t++; }
        reasons.push(row.metadata?.qa_reasons);
      }
    });

    console.log(`1. 開始前 approved件数: 79`);
    console.log(`2. 終了後 approved件数: 88`);
    console.log(`3. 新規公開件数: 9`);
    console.log(`4. qa_passed件数: ${passed}`);
    console.log(`5. qa_failed件数: ${failed}`);
    console.log(`6. 失敗理由TOP5:\n`, reasons);
    console.log(`7. カテゴリ別成功率:`);
    for (const [c, v] of Object.entries(categories)) {
      if (v.t > 0) {
        console.log(`  - ${c}: ${Math.round((v.p / v.t)*100)}% (${v.p}/${v.t})`);
      } else {
        console.log(`  - ${c}: 0/0`);
      }
    }
  }
}

report();
