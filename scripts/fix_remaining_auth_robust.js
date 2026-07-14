const fs = require('fs');

const files = [
  'src/app/api/admin/asset-status/route.ts',
  'src/app/api/admin/approve/route.ts',
  'src/app/api/admin/bulk-asset-action/route.ts',
  'src/app/api/admin/qa-audit/route.ts',
  'src/app/api/admin/asset-rank/route.ts',
  'src/app/api/admin/planner/run/route.ts',
  'src/app/api/admin/generation-jobs/run/route.ts',
  'src/app/api/admin/generation-jobs/test-queue/route.ts'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Inject verifyAdminRequest import
  if (!content.includes('verifyAdminRequest')) {
    content = `import { verifyAdminRequest } from '@/lib/server/cron-auth';\n` + content;
  }

  // Inject into GET, POST, PATCH
  content = content.replace(/export\s+async\s+function\s+(GET|POST|PATCH)\(\s*([a-zA-Z0-9_]+)\s*:\s*Request\s*\)\s*\{/g, (match, method, reqName) => {
    return `export async function ${method}(${reqName}: Request) {\n  const authResult = verifyAdminRequest(${reqName});\n  if (!authResult.ok) return authResult.response;\n`;
  });

  // Remove manual auth logic
  content = content.replace(/const\s+cookieStore\s*=\s*await\s+cookies\(\);\s*const\s+strategyKey\s*=\s*cookieStore\.get\([^)]+\)\?\.value;\s*if\s*\([^\{]+\)\s*\{\s*return\s+NextResponse\.json\([^;]+;\s*\}/gm, '');
  content = content.replace(/const\s+cookieStore\s*=\s*await\s+cookies\(\);\s*const\s+authKey\s*=\s*cookieStore\.get\([^)]+\)\?\.value;\s*if\s*\([^\{]+\)\s*\{\s*return\s+NextResponse\.json\([^;]+;\s*\}/gm, '');

  fs.writeFileSync(file, content);
  console.log("Fixed " + file);
});
