const fs = require('fs');
const glob = require('glob');

const files = glob.sync('src/app/api/admin/**/*.ts');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // We want to delete anything that checks cookies and returns UNAUTHORIZED.
  // The simplest way is to use regex or string replacement for the common patterns.
  
  // Pattern 1:
  /*
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('d_strategy_session');
    
    const envKey = process.env.D_STRATEGY_KEY;
    if (!envKey || !adminSession || adminSession.value !== envKey.trim()) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }
  */
  const p1 = /^\s*const\s+cookieStore\s*=\s*(?:await\s+)?cookies\(\);\s*\n\s*const\s+adminSession\s*=\s*cookieStore\.get\('d_strategy_session'\);\s*\n(?:(?!\n\n)[\s\S])*?if\s*\(!envKey\s*\|\|\s*!adminSession\s*\|\|\s*adminSession\.value\s*!==\s*envKey(?:\.trim\(\))?\)\s*\{\s*\n\s*return\s+NextResponse\.json\(\{\s*success:\s*false,\s*error:\s*'UNAUTHORIZED'\s*\},?\s*\{\s*status:\s*401\s*\}\);\s*\n\s*\}\n/gm;
  if (p1.test(content)) {
    content = content.replace(p1, '');
    changed = true;
  }

  // Pattern 2:
  /*
    let isAuthorized = true; // Handled by verifyAdminRequest
    if (!isAuthorized) {
      ...
    }

    if (!isAuthorized) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }
  */
  const p2 = /^\s*let\s+isAuthorized\s*=\s*true;\s*\/\/\s*Handled\s*by\s*verifyAdminRequest\s*\n\s*if\s*\(!isAuthorized\)\s*\{\s*\n(?:(?!\}\n\n)[\s\S])*?\}\n\s*\n\s*if\s*\(!isAuthorized\)\s*\{\s*\n\s*return\s+NextResponse\.json\(\{\s*success:\s*false,\s*error:\s*'UNAUTHORIZED'\s*\},?\s*\{\s*status:\s*401\s*\}\);\s*\n\s*\}\n/gm;
  if (p2.test(content)) {
    content = content.replace(p2, '');
    changed = true;
  }
  
  // Pattern 3 (General catch-all for remaining d_strategy_session checking):
  // Find any block from `const cookieStore` down to `error: 'UNAUTHORIZED'`
  const p3 = /^\s*const\s+cookieStore\s*=\s*(?:await\s+)?cookies\(\);\n[\s\S]*?error:\s*'UNAUTHORIZED'[\s\S]*?\}\n/gm;
  if (p3.test(content)) {
    content = content.replace(p3, '');
    changed = true;
  }

  // Also remove unused import { cookies } from 'next/headers';
  if (changed && !content.includes('cookies()')) {
    content = content.replace(/^import\s*\{\s*cookies\s*\}\s*from\s*'next\/headers';\n/gm, '');
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
