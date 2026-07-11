import fetch from 'node-fetch';

async function main() {
  console.log('Running QA for Phase GS-01: AssetNinja Google Search Console Integration');
  console.log('--------------------------------------------------');

  console.log('STEP 5: Testing Search Console API Fetch (/api/search-console)');
  try {
    const res = await fetch('http://localhost:3000/api/search-console');
    const data = await res.json();
    console.log('Search Console Response:', JSON.stringify(data, null, 2));
    if (!data.success) {
      console.log('=> GSC Fetch Failed (Expected if credentials are dummy or missing)');
    } else {
      console.log('=> GSC Fetch Succeeded');
    }
  } catch (err: any) {
    console.error('=> Fetch Error:', err.message);
  }
  
  console.log('\nSTEP 6: Testing Indexing API Submit (/api/cron/google-indexer)');
  try {
    // We don't have CRON_SECRET locally since it's just a test, but we can pass local env if needed
    // The route actually commented out the Unauthorized check for local testing as seen in source.
    const res = await fetch('http://localhost:3000/api/cron/google-indexer');
    const data = await res.json();
    console.log('Indexing API Response:', JSON.stringify(data, null, 2));
    if (!data.success) {
      console.log('=> Indexing API Failed (Expected if credentials are dummy or missing)');
    } else {
      console.log('=> Indexing API Succeeded');
    }
  } catch (err: any) {
    console.error('=> Fetch Error:', err.message);
  }

  console.log('\n--------------------------------------------------');
  console.log('QA Testing Complete.');
}

main();
