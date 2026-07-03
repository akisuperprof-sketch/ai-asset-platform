import { createClient } from '@supabase/supabase-js';
require('dotenv').config({path: '.env.local'});

const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function runLoadTest(concurrency: number, total: number) {
  console.log(`\n🚀 Starting Load Test: ${total} items with concurrency ${concurrency}...`);
  const startTime = Date.now();
  
  let successCount = 0;
  let errorCount = 0;
  let activePromises = 0;
  let completed = 0;
  
  const testData = Array.from({ length: total }, (_, i) => ({
    title: `load_test_asset_${Date.now()}_${i}`,
    category: 'LoadTest',
    slug: `load-test-asset-${Date.now()}-${i}`,
    image_url: 'https://example.com/test.png'
  }));

  return new Promise((resolve) => {
    let index = 0;
    
    const worker = async () => {
      while (index < total) {
        const i = index++;
        const data = testData[i];
        
        try {
          // Simulate the 4 DB operations per asset during generation
          
          // 1. Insert Generation Job
          const { data: job, error: jobErr } = await adminClient.from('generation_jobs').insert({
            prompt: 'test prompt for load test',
            keyword: data.title,
            status: 'qa_passed',
            provider: 'MockProvider'
          }).select('id').single();
          if (jobErr) throw jobErr;

          // 2. Insert Asset
          const { data: asset, error: assetErr } = await adminClient.from('assets').insert({
            title: data.title,
            slug: data.slug,
            category: data.category,
            image_url: data.image_url,
            is_ai_generated: true,
            review_status: 'approved'
          }).select('id').single();
          if (assetErr) throw assetErr;

          // 3. Insert Pinterest
          const { error: pinErr } = await adminClient.from('pinterest_posts').insert({
            asset_id: asset.id,
            title: data.title,
            status: 'draft'
          });
          if (pinErr) throw pinErr;

          // 4. Insert Index Queue
          const { error: idxErr } = await adminClient.from('index_queue').insert({
            url: `https://assetninja.jp/items/${asset.id}?test=${data.slug}`,
            type: 'URL_UPDATED',
            status: 'pending'
          });
          if (idxErr) throw idxErr;

          successCount++;
        } catch (e: any) {
          errorCount++;
          if (errorCount === 1) {
            console.error(`First error encountered: ${e.message}`);
          }
        }
        
        completed++;
        if (completed % 100 === 0) {
          console.log(`Progress: ${completed}/${total}`);
        }
      }
    };

    const workers = [];
    for (let c = 0; c < concurrency; c++) {
      workers.push(worker());
    }
    
    Promise.all(workers).then(() => {
      const duration = (Date.now() - startTime) / 1000;
      console.log(`\n✅ Load Test Complete!`);
      console.log(`Duration: ${duration.toFixed(2)}s`);
      console.log(`Throughput: ${(total / duration).toFixed(2)} ops/sec (x4 queries each)`);
      console.log(`Success: ${successCount}, Errors: ${errorCount}`);
      resolve({ duration, successCount, errorCount });
    });
  });
}

async function main() {
  console.log('--- Phase F: DB & Queue Load Testing ---');
  await runLoadTest(10, 100);
  await new Promise(r => setTimeout(r, 2000));
  await runLoadTest(20, 300);
  await new Promise(r => setTimeout(r, 2000));
  
  // Cleanup
  console.log('\n🧹 Cleaning up load test data...');
  await adminClient.from('assets').delete().eq('category', 'LoadTest');
  await adminClient.from('generation_jobs').delete().eq('provider', 'MockProvider');
  // Cascading deletes should handle pinterest_posts, if not we delete manually
  // But wait, index_queue doesn't have a cascading relation, so we delete by pending status where url like test
  await adminClient.from('index_queue').delete().like('url', '%load-test-asset%');
}

main();
