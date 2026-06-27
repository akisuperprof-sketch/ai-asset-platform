const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.worker.local' });
const fetch = require('node-fetch');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const baseUrl = 'http://localhost:3003';

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTask1() {
  console.log("=== TASK 1: Input Demand Data ===");
  const keywords = ["dango png", "mochi png", "takoyaki png", "taiyaki png", "dorayaki png"];
  
  for (const kw of keywords) {
    await fetch(`${baseUrl}/api/demand/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'zero_result', query: kw })
    });
    console.log(`Tracked: ${kw}`);
  }

  await delay(2000);

  const { data: logs } = await supabase.from('search_demand_logs')
    .select('keyword, search_count, need_asset, priority_score')
    .in('normalized_keyword', keywords)
    .order('priority_score', { ascending: false });
  console.log("Task 1 Results:", logs);
}

async function runTask2() {
  console.log("\\n=== TASK 2: Auto Planner Run ===");
  const res = await fetch(`${baseUrl}/api/admin/planner/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-agent-token': 'temp-agent-token-123' },
    body: JSON.stringify({ limit: 10 })
  });
  const data = await res.json();
  console.log("Planner Result:", data);

  const { data: jobs } = await supabase.from('generation_jobs')
    .select('keyword, provider, status')
    .in('keyword', ["dango png", "mochi png", "takoyaki png", "taiyaki png", "dorayaki png"]);
  console.log("Created Jobs:", jobs);
}

async function runTask3() {
  console.log("\\n=== TASK 3: Duplicate Prevention ===");
  const existingAssets = ["ramen", "sushi", "matcha"];
  for (const kw of existingAssets) {
    await fetch(`${baseUrl}/api/demand/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: 'zero_result', query: kw })
    });
    console.log(`Tracked existing asset: ${kw}`);
  }

  await delay(2000);

  const res = await fetch(`${baseUrl}/api/admin/planner/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-agent-token': 'temp-agent-token-123' },
    body: JSON.stringify({ limit: 10 })
  });
  const data = await res.json();
  console.log("Duplicate Prevention Planner Result:", data);
}

async function runTask4and5() {
  console.log("\\n=== TASK 4 & 5: Radar & KPI ===");
  const { data: logs } = await supabase.from('search_demand_logs')
    .select('keyword, search_count, need_asset, priority_score')
    .order('priority_score', { ascending: false })
    .limit(20);
  console.log("Top 20 Demand Radar Logs:");
  logs.forEach((l, i) => {
    console.log(`${i+1}. ${l.keyword} | Count: ${l.search_count} | Priority: ${l.priority_score} | Need: ${l.need_asset}`);
  });

  const statRes = await fetch(`${baseUrl}/api/admin/demand-radar/stats`);
  const statData = await statRes.json();
  console.log("\\nKPI Stats:", statData);
}

async function runAll() {
  await runTask1();
  await runTask2();
  await runTask3();
  await runTask4and5();
}

runAll().catch(console.error);
