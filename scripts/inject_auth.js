const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('src/app/api/admin/**/*.ts');

const ignoreFiles = [
  'auth/route.ts',
  'auth/debug/route.ts',
  'health/route.ts',
  'health-check/route.ts',
  'approve/route.ts',
  'asset-rank/route.ts',
  'asset-status/route.ts',
  'bulk-asset-action/route.ts',
  'bulk-planner/run/route.ts'
];

files.forEach(file => {
  // Check if ignored
  if (ignoreFiles.some(ignore => file.includes(ignore))) {
    return;
  }

  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Make sure it imports verifyAdminRequest
  if (!content.includes('verifyAdminRequest')) {
    content = `import { verifyAdminRequest } from '@/lib/server/cron-auth';\n` + content;
    changed = true;
  }

  // Inject into GET
  const getRegex = /export\s+async\s+function\s+GET\(\s*(request\s*:\s*Request)?\s*\)\s*\{/g;
  let match;
  while ((match = getRegex.exec(content)) !== null) {
    const hasRequest = !!match[1];
    const index = match.index;
    const matchLen = match[0].length;
    
    // Check if it already has authResult check right after
    const nextText = content.slice(index + matchLen, index + matchLen + 100);
    if (!nextText.includes('verifyAdminRequest')) {
      const replacement = hasRequest 
        ? `export async function GET(request: Request) {\n  const authResult = verifyAdminRequest(request);\n  if (!authResult.ok) return authResult.response;\n`
        : `export async function GET(request: Request) {\n  const authResult = verifyAdminRequest(request);\n  if (!authResult.ok) return authResult.response;\n`;
      
      content = content.slice(0, index) + replacement + content.slice(index + matchLen);
      changed = true;
      // Reset regex because string changed
      getRegex.lastIndex = 0; 
    }
  }

  // Inject into POST
  const postRegex = /export\s+async\s+function\s+POST\(\s*(request\s*:\s*Request)?\s*\)\s*\{/g;
  while ((match = postRegex.exec(content)) !== null) {
    const hasRequest = !!match[1];
    const index = match.index;
    const matchLen = match[0].length;
    
    // Check if it already has authResult check right after
    const nextText = content.slice(index + matchLen, index + matchLen + 100);
    if (!nextText.includes('verifyAdminRequest')) {
      const replacement = hasRequest 
        ? `export async function POST(request: Request) {\n  const authResult = verifyAdminRequest(request);\n  if (!authResult.ok) return authResult.response;\n`
        : `export async function POST(request: Request) {\n  const authResult = verifyAdminRequest(request);\n  if (!authResult.ok) return authResult.response;\n`;
      
      content = content.slice(0, index) + replacement + content.slice(index + matchLen);
      changed = true;
      // Reset regex because string changed
      postRegex.lastIndex = 0; 
    }
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Injected verifyAdminRequest into ${file}`);
  }
});
