const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/types/index.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /qualityRank\?: "S" \| "A" \| "B" \| "C";/,
  `qualityRank?: "S" | "A" | "B" | "C" | "D";`
);
fs.writeFileSync(file, content);
console.log('Fixed types');
