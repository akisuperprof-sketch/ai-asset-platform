const { execSync } = require('child_process');
const token = process.env.ADMIN_API_SECRET;

const endpoints = [
  'https://assetninja.jp/api/admin/dashboard',
  'https://assetninja.jp/api/admin/demand-stats',
  'https://assetninja.jp/api/admin/generation-jobs/stats'
];

console.log('--- RUNNING REMAINING PROD TESTS ---');

endpoints.forEach(url => {
  console.log(`\nTesting: ${url}`);
  
  try {
    const resAuth = execSync(`curl -s -w "\\n%{http_code}" -H "Authorization: Bearer ${token}" ${url}`).toString();
    const [bodyAuth, statusAuth] = resAuth.trim().split('\n');
    console.log(`Status with token: ${statusAuth}`);
    console.log(`Body with token: ${bodyAuth.slice(0, 100)}...`);
  } catch(e) {
    console.log("Error testing auth:", e.message);
  }

  try {
    const resNoAuth = execSync(`curl -s -w "\\n%{http_code}" ${url}`).toString();
    const [bodyNoAuth, statusNoAuth] = resNoAuth.trim().split('\n');
    console.log(`Status WITHOUT token: ${statusNoAuth}`);
    console.log(`Body WITHOUT token: ${bodyNoAuth.slice(0, 100)}...`);
  } catch(e) {
    console.log("Error testing no auth:", e.message);
  }
});
