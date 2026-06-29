import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const baseUrl = 'https://assetninja.jp';
const token = process.env.AGENT_SECRET_TOKEN || 'temp-agent-token-123';

async function testApi(path: string, body?: any) {
  console.log(`\nTesting ${path}...`);
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method: body ? 'POST' : 'GET',
      headers: { 
        'x-agent-token': token,
        'authorization': `Bearer ${process.env.CRON_SECRET || 'temp-cron-secret-123'}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });
    
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    try {
       const json = JSON.parse(text);
       console.log('Response:', JSON.stringify(json, null, 2));
    } catch(e) {
       console.log('Response text:', text.substring(0, 200));
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

async function runQa() {
  await testApi('/api/admin/growth/seo-optimizer/run', {});
  await testApi('/api/admin/growth/pinterest-engine/run', {});
  await testApi('/api/admin/growth/revenue-ai/run', {});
  await testApi('/api/admin/growth/index-manager/run', {});
  await testApi('/api/admin/growth/asset-value/run', {});
  await testApi('/api/admin/growth/internal-link/run', {}); // internal-link-ai requested, but it's internal-link
  
  // CEO Report last since it depends on the above
  await testApi('/api/admin/growth/ceo-report/run', {});
}

runQa();
