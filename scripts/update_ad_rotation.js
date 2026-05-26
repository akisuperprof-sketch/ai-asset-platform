const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/lib/ad-rotation.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Insert admin check
content = content.replace(
  `  if (typeof window === "undefined") return 'none';`,
  `  if (typeof window === "undefined") return 'none';\n\n  // Safety: never show ads in admin\n  if (window.location.pathname.startsWith('/admin')) return 'none';`
);

fs.writeFileSync(filePath, content);
