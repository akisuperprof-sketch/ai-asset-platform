const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/page.tsx');
let content = fs.readFileSync(file, 'utf-8');

// The trending section loops over trendingAssets
content = content.replace(
  `<AssetCard key={asset.id} asset={asset} />`,
  `<AssetCard key={asset.id} asset={asset} className="col-span-12 sm:col-span-6 lg:col-span-4" />`
);

fs.writeFileSync(file, content);
