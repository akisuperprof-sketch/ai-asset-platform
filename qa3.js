const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.worker.local' });
const fetch = require('node-fetch');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const baseUrl = 'http://localhost:3003';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runQA() {
  console.log("=== PHASE 3 QA START ===");

  // 1. Check Migration (Query search_demand_logs)
  console.log("\\n1. Migration Check");
  const { data: logs, error: logError } = await supabase.from('search_demand_logs').select('*').limit(1);
  if (logError) {
    console.error("Migration check failed:", logError);
  } else {
    console.log("Migration check passed: search_demand_logs table exists and accessible.");
  }

  // 2. Need Asset log
  console.log("\\n2. Demand Log: dango png (0 results)");
  const res1 = await fetch(`${baseUrl}/api/demand/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type: 'zero_result', query: 'dango png' })
  });
  console.log("Track API 1 response:", await res1.json());

  // Test RPC directly
  console.log("\\nTesting RPC directly...");
  const rpcRes = await supabase.rpc('upsert_search_demand_log', {
    p_keyword: 'dango png',
    p_normalized_keyword: 'dango png',
    p_need_asset: true,
    p_recency_bonus: 10,
    p_no_asset_bonus: 50
  });
  console.log("RPC direct result:", rpcRes);

  await delay(1000); // wait for RPC to finish

  // Insert dummy row to see what columns exist
  const { data: dTest, error: eTest } = await supabase.from('search_demand_logs').insert({ keyword: 'test', normalized_keyword: 'test' }).select();
  console.log("Insert test:", { dTest, eTest });

  console.log("DB State after 1st query: Insert test results printed above");

  // 3. Same keyword again
  console.log("\\n3. Demand Log: dango png again");
  const res2 = await fetch(`${baseUrl}/api/demand/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type: 'zero_result', query: 'dango png' })
  });
  console.log("Track API 2 response:", await res2.json());

  await delay(1000);

  const { data: dango2 } = await supabase.from('search_demand_logs').select('*').eq('normalized_keyword', 'dango png').single();
  console.log("DB State after 2nd query:", {
    search_count: dango2?.search_count,
    need_asset: dango2?.need_asset,
    priority_score: dango2?.priority_score,
    scoreIncreased: dango2?.priority_score > dango1?.priority_score
  });

  // 4. Covered keyword
  console.log("\\n4. Demand Log: ramen png (5 results)");
  const res3 = await fetch(`${baseUrl}/api/demand/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event_type: 'search', query: 'ramen png' })
  });
  console.log("Track API 3 response:", await res3.json());

  await delay(1000);

  const { data: ramen1 } = await supabase.from('search_demand_logs').select('*').eq('normalized_keyword', 'ramen png').single();
  console.log("DB State after ramen query:", {
    search_count: ramen1?.search_count,
    need_asset: ramen1?.need_asset
  });

  // 5. Planner test
  console.log("\\n6. Auto Planner Test (limit=1)");
  const planRes = await fetch(`${baseUrl}/api/admin/planner/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-agent-token': 'temp-agent-token-123' },
    body: JSON.stringify({ limit: 1 })
  });
  const planData = await planRes.json();
  console.log("Planner Result:", planData);

  // 7. Duplicate check
  console.log("\\n7. Duplicate Prevention Check (Run planner again)");
  const planRes2 = await fetch(`${baseUrl}/api/admin/planner/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-agent-token': 'temp-agent-token-123' },
    body: JSON.stringify({ limit: 1 })
  });
  console.log("Planner Duplicate Check Result:", await planRes2.json());

  // 8. Verify generation_jobs
  console.log("\\n8. Verify generation_jobs");
  const { data: jobs } = await supabase
    .from('generation_jobs')
    .select('keyword, provider, status, metadata')
    .order('created_at', { ascending: false })
    .limit(3);
  console.log("Latest jobs:", jobs);

  // 9. KPI Dashboard Stats
  console.log("\\n9. Demand Radar Stats API");
  const statRes = await fetch(`${baseUrl}/api/admin/demand-radar/stats`);
  console.log("Stats Data:", await statRes.json());
}

runQA();
