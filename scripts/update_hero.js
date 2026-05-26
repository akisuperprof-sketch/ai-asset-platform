const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/components/layout/HeroSection.tsx');
let content = fs.readFileSync(file, 'utf-8');

// Replace 1: Search OS Info Badge
content = content.replace(
  `{formatCountBadge(realtimeCount)} PREMIUM TRANSPARENT PNG ASSETS`,
  `CURATED PREMIUM PNG COLLECTION`
);

// Replace 2: The background text that also says it
content = content.replace(
  `{formatCountBadge(realtimeCount)} PREMIUM TRANSPARENT PNG ASSETS`,
  `CURATED PREMIUM PNG COLLECTION`
);

fs.writeFileSync(file, content);
