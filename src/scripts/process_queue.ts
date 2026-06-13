import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const HOST = 'http://localhost:3000'; // Make sure the dev server is running, or we call the API locally
const ADMIN_KEY = process.env.D_STRATEGY_KEY;

async function runWorker(limit: number) {
  try {
    const res = await fetch(`${HOST}/api/admin/generation-jobs/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `d_strategy_session=${ADMIN_KEY}`
      },
      body: JSON.stringify({ limit })
    });
    
    if (!res.ok) {
      console.error('Worker API failed:', res.status, res.statusText);
      const text = await res.text();
      console.error(text);
      return false;
    }

    const data = await res.json();
    console.log('Worker Result:', data);
    return data.results && data.results.length > 0; // Return true if jobs were processed
  } catch (err) {
    console.error('Error calling worker API:', err);
    return false;
  }
}

async function main() {
  console.log('Starting local generation worker loop...');
  let hasMore = true;
  let batchCount = 0;
  
  while (hasMore) {
    batchCount++;
    console.log(`\n--- Processing Batch ${batchCount} ---`);
    hasMore = await runWorker(10); // Process 10 at a time
    if (hasMore) {
      console.log('Waiting 2 seconds before next batch...');
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log('\nAll generation jobs processed or queue is empty.');
}

main().catch(console.error);
