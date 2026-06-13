const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.worker.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:3003';
const AGENT_TOKEN = 'temp-agent-token-123';

// Parse arguments
const args = process.argv.slice(2);
const getArg = (flag, def) => {
  const idx = args.indexOf(flag);
  return idx !== -1 ? parseInt(args[idx + 1], 10) : def;
};

const TARGET_SESSION_PROCESSED = getArg('--target', 20);
const BATCH_SIZE = getArg('--batch', 2);
const SLEEP_MS = getArg('--sleep', 60) * 1000;
const WAIT_429_MIN_MS = 15 * 60 * 1000;
const WAIT_429_MAX_MS = 30 * 60 * 1000;
let rateLimitRetries = 0;
const MAX_429_RETRIES = 3;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function getStats() {
  const { count: realCount } = await supabase.from('assets').select('*', { count: 'exact', head: true })
    .like('storage_key', 'real/%');
  
  const { count: approvedCount } = await supabase.from('assets').select('*', { count: 'exact', head: true })
    .like('storage_key', 'real/%').eq('review_status', 'approved');

  const { count: queuedCount } = await supabase.from('generation_jobs').select('*', { count: 'exact', head: true })
    .eq('status', 'queued');

  return { realCount: realCount || 0, approvedCount: approvedCount || 0, queuedCount: queuedCount || 0 };
}

async function getGeneratingJobsCount() {
  const { count } = await supabase.from('generation_jobs').select('*', { count: 'exact', head: true })
    .eq('status', 'generating');
  return count || 0;
}

// Graceful shutdown
let isShuttingDown = false;
process.on('SIGINT', () => {
  console.log("\n🛑 Received SIGINT (Ctrl+C). Shutting down gracefully...");
  isShuttingDown = true;
});

async function runWorker() {
  const startedAt = new Date();
  const runId = `worker-${startedAt.toISOString().replace(/[-:T\.]/g, '').slice(0, 14)}`;
  console.log(`🚀 Starting Safe Worker Stage 2 (Run ID: ${runId})...`);
  console.log(`   Session Target: ${TARGET_SESSION_PROCESSED}, Batch: ${BATCH_SIZE}, Sleep: ${SLEEP_MS / 1000}s`);
  
  let totalProcessed = 0;
  let totalApproved = 0;
  let totalRejected = 0;
  let totalRetryPending = 0;
  let total429 = 0;
  let totalTimeouts = 0;

  const approvedSlugs = [];
  const rejectedSlugs = [];
  const errorSummary = {};
  const rawLog = [];

  while (!isShuttingDown) {
    const stats = await getStats();
    console.log(`\n📊 [DB Status] Real Assets (Total): ${stats.realCount} | Approved (Total): ${stats.approvedCount} | Queued: ${stats.queuedCount}`);
    console.log(`📈 [Session] Target: ${TARGET_SESSION_PROCESSED} | Processed: ${totalProcessed} | Approved: ${totalApproved} | Rejected: ${totalRejected} | RetryPending: ${totalRetryPending} | 429 Count: ${total429}`);
    
    if (totalProcessed >= TARGET_SESSION_PROCESSED) {
      console.log(`🎉 Target Reached! ${totalProcessed} >= ${TARGET_SESSION_PROCESSED}. Stopping.`);
      break;
    }

    if (stats.queuedCount === 0) {
      console.log("No more queued jobs. Stopping.");
      break;
    }

    // Check if previous jobs are still generating (in case of timeout)
    let generatingCount = await getGeneratingJobsCount();
    if (generatingCount > 0) {
      console.log(`⏳ Found ${generatingCount} jobs still generating in background. Waiting 30s before proceeding...`);
      await sleep(30000);
      continue;
    }

    const nextBatchSize = Math.min(BATCH_SIZE, TARGET_SESSION_PROCESSED - totalProcessed);
    console.log(`⏱️ Triggering API for batch of ${nextBatchSize} job(s)...`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 mins timeout

    try {
      const res = await fetch(`${BASE_URL}/api/admin/generation-jobs/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-agent-token': AGENT_TOKEN
        },
        body: JSON.stringify({ limit: nextBatchSize }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        console.error("API Error Status:", res.status);
        await sleep(30000);
        continue;
      }

      const data = await res.json();
      
      if (!data.success && data.error === 'RATE_LIMIT_WAIT') {
        total429++;
        rateLimitRetries++;
        if (rateLimitRetries > MAX_429_RETRIES) {
          console.error("❌ Max 429 retries reached. Exiting.");
          break;
        }
        const waitMs = Math.floor(Math.random() * (WAIT_429_MAX_MS - WAIT_429_MIN_MS + 1)) + WAIT_429_MIN_MS;
        console.warn(`⏳ [429 RATE LIMIT] Hit rate limit. Waiting for ${Math.round(waitMs / 60000)} minutes...`);
        await sleep(waitMs);
        continue;
      }

      rateLimitRetries = 0; // reset on success

      if (data.results && data.results.length > 0) {
        totalProcessed += data.results.length;
        data.results.forEach(r => {
          rawLog.push(r);
          let extra = '';
          if (r.bgRemoved !== undefined) {
            extra = ` [hasAlpha: ${r.hasAlpha}, alphaRatio: ${r.alphaRatio?.toFixed(2)}, cutoutScore: ${r.cutoutScore}]`;
          }
          console.log(`  -> Job ${r.id} (${r.keyword}): ${r.status}${r.reason ? ' - ' + r.reason : ''}${extra}`);
          if (r.status === 'qa_passed') {
            totalApproved++;
            if (r.keyword) approvedSlugs.push(r.keyword);
          }
          if (r.status === 'qa_failed' || r.status === 'failed') {
            totalRejected++;
            if (r.keyword) rejectedSlugs.push(r.keyword);
            if (r.reason) {
               errorSummary[r.reason] = (errorSummary[r.reason] || 0) + 1;
            }
          }
          if (r.status === 'retry_pending') totalRetryPending++;
        });
      } else {
        console.log("  No jobs processed this round.");
      }

    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Network or execution error (possible timeout):", err.message);
      totalTimeouts++;
      errorSummary[err.message] = (errorSummary[err.message] || 0) + 1;
      console.log("Will check background generation status on next loop.");
    }

    if (totalProcessed >= TARGET_SESSION_PROCESSED || isShuttingDown) break;

    console.log(`⏱️ Sleeping for ${SLEEP_MS / 1000}s...`);
    await sleep(SLEEP_MS);
  }

  console.log("\n✅ Worker stopped safely.");

  // Save log for nightly batch
  const logDir = path.join(process.cwd(), 'logs');
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  const dateStr = new Date().toISOString().split('T')[0];
  const logPath = path.join(logDir, `worker-nightly-${dateStr}.json`);
  
  const finalStats = await getStats();
  const logData = {
    timestamp: new Date().toISOString(),
    sessionTarget: TARGET_SESSION_PROCESSED,
    processed: totalProcessed,
    approved: totalApproved,
    rejected: totalRejected,
    retryPending: totalRetryPending,
    rateLimitCount: total429,
    finalRealAssets: finalStats.realCount,
    finalApprovedAssets: finalStats.approvedCount
  };
  
  let existingLogs = [];
  if (fs.existsSync(logPath)) {
    try {
      existingLogs = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
    } catch(e) {}
  }
  existingLogs.push(logData);
  fs.writeFileSync(logPath, JSON.stringify(existingLogs, null, 2));
  console.log(`📝 Log saved to ${logPath}`);

  // Supabase logging
  const finishedAt = new Date();
  const durationSeconds = Math.floor((finishedAt - startedAt) / 1000);
  const status = isShuttingDown ? 'interrupted' : 'completed';

  try {
    const { error: insertError } = await supabase.from('worker_logs').insert({
      run_id: runId,
      started_at: startedAt.toISOString(),
      finished_at: finishedAt.toISOString(),
      status: status,
      target_count: TARGET_SESSION_PROCESSED,
      batch_size: BATCH_SIZE,
      sleep_seconds: SLEEP_MS / 1000,
      processed_count: totalProcessed,
      approved_count: totalApproved,
      rejected_count: totalRejected,
      retry_pending_count: totalRetryPending,
      rate_limit_count: total429,
      timeout_count: totalTimeouts,
      real_assets_total: finalStats.realCount,
      approved_assets_total: finalStats.approvedCount,
      duration_seconds: durationSeconds,
      error_summary: errorSummary,
      approved_slugs: approvedSlugs,
      rejected_slugs: rejectedSlugs,
      raw_log: rawLog
    });

    if (insertError) {
      console.error("⚠️ Failed to save log to Supabase:", insertError.message);
    } else {
      console.log(`☁️ Log saved to Supabase worker_logs (${runId})`);
    }
  } catch(e) {
    console.error("⚠️ Exception saving log to Supabase:", e.message);
  }
}

runWorker();
