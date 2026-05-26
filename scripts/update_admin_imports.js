const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/admin/studio/page.tsx');
let content = fs.readFileSync(file, 'utf-8');

content = content.replace(
  `import { Zap } from "lucide-react";`,
  ``
).replace(
  `import { Flame } from "lucide-react";`,
  ``
);

content = `import { Zap, Flame } from "lucide-react";\n` + content;

fs.writeFileSync(file, content);
