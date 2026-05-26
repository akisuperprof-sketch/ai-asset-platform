const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/admin/studio/page.tsx');
let content = fs.readFileSync(file, 'utf-8');

if (content.startsWith('import { Zap, Flame } from "lucide-react";\n"use client";')) {
  content = content.replace('import { Zap, Flame } from "lucide-react";\n"use client";', '"use client";\nimport { Zap, Flame } from "lucide-react";');
  fs.writeFileSync(file, content);
}
