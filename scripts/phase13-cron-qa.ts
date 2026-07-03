async function testCron() {
  const token = 'temp-agent-token-123';
  const cronUrl = 'http://localhost:3000/api/cron/growth-engine-v2';
  console.log(`Testing ${cronUrl}...`);
  // Note: auth is CRON_SECRET, but if it's undefined, we send undefined
  const cronRes = await fetch(cronUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer undefined` }
  });
  console.log(`Status: ${cronRes.status}`);
  const cronData = await cronRes.json();
  console.log(`Response:`, JSON.stringify(cronData).substring(0, 500));
}

testCron();
