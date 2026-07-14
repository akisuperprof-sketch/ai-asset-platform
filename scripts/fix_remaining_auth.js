const fs = require('fs');
const files = [
  'src/app/api/admin/asset-status/route.ts',
  'src/app/api/admin/approve/route.ts',
  'src/app/api/admin/bulk-asset-action/route.ts',
  'src/app/api/admin/qa-audit/route.ts',
  'src/app/api/admin/asset-rank/route.ts',
  'src/app/api/admin/planner/run/route.ts'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Inject verifyAdminRequest import
  if (!content.includes('verifyAdminRequest')) {
    content = `import { verifyAdminRequest } from '@/lib/server/cron-auth';\n` + content;
  }

  // Inject into GET
  content = content.replace(/export\s+async\s+function\s+GET\(\s*(request\s*:\s*Request)?\s*\)\s*\{/g, (match, hasRequest) => {
    return hasRequest 
      ? `export async function GET(request: Request) {\n  const authResult = verifyAdminRequest(request);\n  if (!authResult.ok) return authResult.response;\n`
      : `export async function GET(request: Request) {\n  const authResult = verifyAdminRequest(request);\n  if (!authResult.ok) return authResult.response;\n`;
  });

  // Inject into POST
  content = content.replace(/export\s+async\s+function\s+POST\(\s*(request\s*:\s*Request)?\s*\)\s*\{/g, (match, hasRequest) => {
    return hasRequest 
      ? `export async function POST(request: Request) {\n  const authResult = verifyAdminRequest(request);\n  if (!authResult.ok) return authResult.response;\n`
      : `export async function POST(request: Request) {\n  const authResult = verifyAdminRequest(request);\n  if (!authResult.ok) return authResult.response;\n`;
  });

  // Inject into PATCH
  content = content.replace(/export\s+async\s+function\s+PATCH\(\s*(request\s*:\s*Request)?\s*\)\s*\{/g, (match, hasRequest) => {
    return hasRequest 
      ? `export async function PATCH(request: Request) {\n  const authResult = verifyAdminRequest(request);\n  if (!authResult.ok) return authResult.response;\n`
      : `export async function PATCH(request: Request) {\n  const authResult = verifyAdminRequest(request);\n  if (!authResult.ok) return authResult.response;\n`;
  });

  // Remove manual auth logic
  content = content.replace(/const\s+cookieStore\s*=\s*await\s+cookies\(\);\s*const\s+strategyKey\s*=\s*cookieStore\.get\("D_STRATEGY_KEY"\)\?\.value;\s*if\s*\(!strategyKey\s*\|\|\s*strategyKey\s*!==\s*process\.env\.D_STRATEGY_KEY\)\s*\{\s*return\s+NextResponse\.json\(\{\s*(?:success:\s*false,\s*)?error:\s*["']Unauthorized(?: access)?["']\s*\},[^;]+;\s*\}/gm, '');
  
  // Specific fix for planner/run/route.ts
  content = content.replace(/const\s+authHeader\s*=\s*request\.headers\.get\('authorization'\);\s*if\s*\(authHeader\s*!==\s*\(process\.env\.ADMIN_API_SECRET\s*\|\|\s*''\)\s*&&\s*authHeader\s*!==\s*`Bearer\s*\$\{process\.env\.D_STRATEGY_KEY\}`\)\s*\{\s*return\s+NextResponse\.json\(\{\s*error:\s*'Unauthorized'\s*\},[^;]+;\s*\}/gm, '');

  fs.writeFileSync(file, content);
  console.log("Fixed " + file);
});
