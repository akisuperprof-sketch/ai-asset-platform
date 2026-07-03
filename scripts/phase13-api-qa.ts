async function test() {
  const token = 'temp-agent-token-123';
  const urls = [
    'http://localhost:3000/api/admin/growth/search-console/run',
    'http://localhost:3000/api/admin/growth/self-repair/run'
  ];

  for (const url of urls) {
    console.log(`\nTesting ${url}...`);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'x-agent-token': token }
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log(`Response:`, JSON.stringify(data).substring(0, 200));
  }

  const cronUrl = 'http://localhost:3000/api/cron/growth-engine-v2';
  console.log(`\nTesting ${cronUrl}...`);
  const cronRes = await fetch(cronUrl, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  console.log(`Status: ${cronRes.status}`);
  const cronData = await cronRes.json();
  console.log(`Response:`, JSON.stringify(cronData).substring(0, 200));
}

test();
