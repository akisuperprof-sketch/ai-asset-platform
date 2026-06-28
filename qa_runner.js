const fetch = require('node-fetch');

async function runQA() {
  console.log("=== Phase 9 QA Runner ===");
  const baseUrl = 'http://localhost:3005';

  // 1. Bulk Planner 20件
  console.log("\n[1] Running Bulk Planner (dog, limit 20)...");
  try {
    const bpRes = await fetch(`${baseUrl}/api/admin/bulk-planner/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: 'dog', limit: 20 })
    });
    const bpData = await bpRes.json();
    console.log("Bulk Planner Result:", bpData);
  } catch (e) {
    console.error("Bulk Planner Error:", e);
  }

  // 2. Guardrail QA
  console.log("\n[2] Running Guardrail QA (Starbucks)...");
  try {
    const grRes = await fetch(`${baseUrl}/api/admin/bulk-planner/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme: 'Starbucks', limit: 5 })
    });
    const grData = await grRes.json();
    console.log("Guardrail Result:", grData);
  } catch (e) {
    console.error("Guardrail Error:", e);
  }

  // 3. Generation Worker 3件
  console.log("\n[3] Running Generation Worker (limit 3)...");
  try {
    const gwRes = await fetch(`${baseUrl}/api/admin/generation-jobs/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 3 })
    });
    const gwData = await gwRes.json();
    console.log("Generation Worker Result:", gwData);
  } catch (e) {
    console.error("Generation Worker Error:", e);
  }

  console.log("\n=== QA Runner Finished ===");
}

runQA();
