const fs = require('fs');
const path = require('path');

const apiDir = path.join(__dirname, '../src/app/api');

function getTsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(getTsFiles(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = getTsFiles(apiDir);

let modifiedCount = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Fix Cron Routes
  if (file.includes('/api/cron/')) {
    if (!content.includes('verifyCronRequest')) {
      content = `import { verifyCronRequest } from '@/lib/server/cron-auth';\n` + content;
    }
    
    // Auto Factory route is particularly broken, fix it explicitly
    if (file.includes('auto-factory/route.ts')) {
      content = content.replace(
        /const authHeader = request.headers.get\('authorization'\);[\s\S]*?if \(process\.env\.NODE_ENV === 'production' && authHeader !== `Bearer \$\{localCronSecret\}`\) \{[\s\S]*?\/\/ return NextResponse.json\(\{ error: 'Unauthorized' \}, \{ status: 401 \}\);[\s\S]*?\}[\s\S]*?\}/,
        `const authResult = verifyCronRequest(request);\n    if (!authResult.ok) return authResult.response;`
      );
      content = content.replace(/const localCronSecret = process.env.CRON_SECRET \|\| 'temp-agent-token-123';/, '');
      content = content.replace(/const localCronSecret = process.env.CRON_SECRET \|\| "temp-agent-token-123";/, '');
    } else {
       // Other cron routes that call other APIs, replacing hardcoded agent token header
       content = content.replace(/process\.env\.AGENT_SECRET_TOKEN \|\| 'temp-agent-token-123'/g, 'process.env.ADMIN_API_SECRET');
       content = content.replace(/'temp-agent-token-123'/g, 'process.env.ADMIN_API_SECRET');
       
       // And they should also verify incoming cron request:
       if (!content.includes('verifyCronRequest(request)')) {
          content = content.replace(
            /export async function (GET|POST)\(request: Request\) \{/,
            `export async function $1(request: Request) {\n  const authResult = verifyCronRequest(request);\n  if (!authResult.ok) return authResult.response;\n`
          );
       }
    }
  }

  // Fix Admin Routes
  if (file.includes('/api/admin/')) {
    if (!content.includes('verifyAdminRequest')) {
      content = `import { verifyAdminRequest } from '@/lib/server/cron-auth';\n` + content;
    }
    
    // Replace old auth logic block
    const isAgentPattern = /const agentToken = request\.headers\.get\('x-agent-token'\);\s*const isAgent = agentToken === 'temp-agent-token-123';/;
    if (isAgentPattern.test(content)) {
      content = content.replace(isAgentPattern, '');
    }

    const adminTokenPattern = /const adminToken = request\.headers\.get\('x-admin-token'\) \|\| request\.headers\.get\('x-agent-token'\);\s*const isValidToken = adminToken === process\.env\.AGENT_SECRET_TOKEN \|\| adminToken === 'temp-agent-token-123';/g;
    if (adminTokenPattern.test(content)) {
       content = content.replace(adminTokenPattern, '');
       content = content.replace(/if \(!isValidToken\) \{[\s\S]*?return NextResponse\.json\(\{ success: false, error: 'Unauthorized' \}, \{ status: 401 \}\);[\s\S]*?\}/, '');
    }

    if (file.includes('generation-jobs/run/route.ts')) {
        content = content.replace(/const agentToken = request.headers.get\('x-agent-token'\);\s*const isAgent = agentToken === 'temp-agent-token-123';[\s\S]*?if \(!isAuthorized\) \{\s*return NextResponse.json\(\{ success: false, error: 'UNAUTHORIZED' \}, \{ status: 401 \}\);\s*\}/, '');
    }
    
    content = content.replace(/\/\/ return NextResponse\.json\(\{ error: 'Unauthorized' \}, \{ status: 401 \}\);/g, "return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });");

    // Replace header values sent to other APIs
    content = content.replace(/process\.env\.CRON_SECRET \|\| 'temp-agent-token-123'/g, 'process.env.ADMIN_API_SECRET');
    content = content.replace(/process\.env\.AGENT_SECRET_TOKEN \|\| 'temp-agent-token-123'/g, 'process.env.ADMIN_API_SECRET');
    content = content.replace(/'temp-agent-token-123'/g, 'process.env.ADMIN_API_SECRET');

    // Add verifyAdminRequest at the top
    if (!content.includes('verifyAdminRequest(request)')) {
        content = content.replace(
          /export async function (GET|POST)\(request: Request\) \{/,
          `export async function $1(request: Request) {\n  const authResult = verifyAdminRequest(request);\n  if (!authResult.ok) return authResult.response;\n`
        );
    }
  }

  // Remove local tokens anywhere else
  content = content.replace(/process\.env\.NEXT_PUBLIC_AGENT_TOKEN \|\| 'temp-agent-token-123'/g, '""');
  content = content.replace(/'temp-agent-token-123'/g, '""');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    modifiedCount++;
    console.log('Modified:', file);
  }
}

console.log('Total files modified:', modifiedCount);
