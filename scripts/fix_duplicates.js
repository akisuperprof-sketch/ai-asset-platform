const fs = require('fs');

const files = [
  'src/app/api/admin/asset-status/route.ts',
  'src/app/api/admin/approve/route.ts',
  'src/app/api/admin/bulk-asset-action/route.ts',
  'src/app/api/admin/qa-audit/route.ts',
  'src/app/api/admin/asset-rank/route.ts',
  'src/app/api/admin/planner/run/route.ts',
  'src/app/api/admin/generation-jobs/run/route.ts',
  'src/app/api/admin/generation-jobs/test-queue/route.ts',
  'src/app/api/admin/dashboard/route.ts',
  'src/app/api/admin/demand-stats/route.ts',
  'src/app/api/admin/generation-jobs/stats/route.ts'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Replace double injects
  content = content.replace(/const\s+authResult\s*=\s*verifyAdminRequest\(request\);\s*if\s*\(!authResult\.ok\)\s*return\s*authResult\.response;\s*const\s+authResult\s*=\s*verifyAdminRequest\(request\);\s*if\s*\(!authResult\.ok\)\s*return\s*authResult\.response;/g, 
    `const authResult = verifyAdminRequest(request);\n  if (!authResult.ok) return authResult.response;`);

  content = content.replace(/const\s+authResult\s*=\s*verifyAdminRequest\(req\);\s*if\s*\(!authResult\.ok\)\s*return\s*authResult\.response;\s*const\s+authResult\s*=\s*verifyAdminRequest\(req\);\s*if\s*\(!authResult\.ok\)\s*return\s*authResult\.response;/g, 
    `const authResult = verifyAdminRequest(req);\n  if (!authResult.ok) return authResult.response;`);

  // Remove duplicate imports
  content = content.replace(/import\s*\{\s*verifyAdminRequest\s*\}\s*from\s*['"]@\/lib\/server\/cron-auth['"];\s*import\s*\{\s*verifyAdminRequest\s*\}\s*from\s*['"]@\/lib\/server\/cron-auth['"];/g,
    `import { verifyAdminRequest } from '@/lib/server/cron-auth';`);

  fs.writeFileSync(file, content);
});
console.log("Fixed duplicates");
