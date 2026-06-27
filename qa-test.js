const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminClient = createClient(supabaseUrl, supabaseServiceKey);

async function runTest() {
  console.log("Adding a test job...");
  const { data: job, error: insertError } = await adminClient.from('generation_jobs').insert({
    keyword: 'test background recovery transparent png',
    category: 'test',
    status: 'queued'
  }).select('id').single();

  if (insertError) {
    console.error("Failed to insert job:", insertError);
    return;
  }

  console.log("Job added:", job.id);
  
  // Get current approved count
  const { count: beforeCount } = await adminClient.from('assets').select('*', { count: 'exact', head: true }).eq('review_status', 'approved');
  console.log("Approved count before:", beforeCount);

  console.log("Triggering /api/admin/generation-jobs/run ...");
  
  // We trigger it via POST. In local, it returns 200 OK. 
  // But we want to see if the asset actually gets created.
  const fetch = require('node-fetch');
  
  const startTime = Date.now();
  const res = await fetch('http://localhost:3000/api/admin/generation-jobs/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-agent-token': 'temp-agent-token-123' },
    body: JSON.stringify({ limit: 1 })
  });

  const status = res.status;
  const text = await res.text();
  console.log(`API returned HTTP ${status} in ${(Date.now() - startTime)/1000}s`);
  console.log("Response text:", text);
  
  // Wait a few seconds
  await new Promise(r => setTimeout(r, 5000));
  
  // Check count again
  const { count: afterCount } = await adminClient.from('assets').select('*', { count: 'exact', head: true }).eq('review_status', 'approved');
  console.log("Approved count after:", afterCount);
  
  // Fetch the latest asset
  const { data: latestAsset } = await adminClient.from('assets').select('title, slug, image_url').order('created_at', { ascending: false }).limit(1).single();
  console.log("Latest asset:", latestAsset);
}

runTest();
