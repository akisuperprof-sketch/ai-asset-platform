const fs = require('fs');
const current = JSON.parse(fs.readFileSync('modified_assets_audit.json', 'utf8'));
const recovery = JSON.parse(fs.readFileSync('recovery_data_with_seo.json', 'utf8'));

let results = {
  db_audit: 0,
  generation_jobs: 0,
  keyword_reconstruction: 0,
  guess: 0,
  unknown: 0
};

for (const asset of current) {
  const r = recovery.find(x => x.asset_id === asset.id);
  if (r && r.sources && r.sources.includes('generation_jobs')) {
    results.generation_jobs++;
  } else {
    results.guess++;
  }
}

console.log(JSON.stringify(results, null, 2));
