const fs = require('fs');

const path = 'src/app/api/admin/generation-jobs/stats/route.ts';
let content = fs.readFileSync(path, 'utf8');

// Remove the manual cookie check
content = content.replace(/const\s+cookieStore\s*=\s*await\s+cookies\(\);\s*const\s+authKey\s*=\s*cookieStore\.get\('D_STRATEGY_KEY'\)\?\.value;\s*if\s*\([^\{]+\{\s*return\s+NextResponse\.json\(\{\s*error:\s*'Unauthorized'\s*\},[^;]+;\s*\}/, '');

fs.writeFileSync(path, content);
console.log("Fixed manual auth in stats route");
