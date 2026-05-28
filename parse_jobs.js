const fs = require('fs');
const jobs = JSON.parse(fs.readFileSync('jobs_dump.json', 'utf8'));

console.log("Total Count:", jobs.length);
const categoryCounts = {};
let lowQualityFound = false;
const lowQualityKeywords = ['abstract', 'geometric', 'monochrome', 'low poly', 'random shape', 'ai art', 'text logo', 'simple icon', 'circle', 'star', 'smoke only'];
const samplePrompts = [];

jobs.forEach((job, index) => {
  if (categoryCounts[job.category]) {
    categoryCounts[job.category]++;
  } else {
    categoryCounts[job.category] = 1;
  }
  
  if (lowQualityKeywords.includes(job.category.toLowerCase())) {
    lowQualityFound = true;
  }
  
  if (index < 5) {
    samplePrompts.push(job.prompt);
  }
});

console.log("Category Counts:");
for (const [key, value] of Object.entries(categoryCounts)) {
    console.log(`- ${key}: ${value}`);
}
console.log("\nLow Quality Categories Found:", lowQualityFound);
console.log("\nSample Prompts:\n" + samplePrompts.map((p, i) => `${i+1}. ${p}`).join('\n\n'));
