const fs = require('fs');
const current = JSON.parse(fs.readFileSync('modified_assets_audit.json', 'utf8'));

let audit = {
  seo_title_duplicates: 0,
  alt_text_duplicates: 0,
  title_duplicates: 0,
  gate1_count: 0,
  variation_count: 0,
  random_numbers_count: 0,
  image_mismatch_suspected: 0 // difficult to tell programmatically, but we can check if it's too generic
};

const counts = { seo_title: {}, alt_text: {}, title: {} };

for (const asset of current) {
  counts.seo_title[asset.seo_title] = (counts.seo_title[asset.seo_title] || 0) + 1;
  counts.alt_text[asset.alt_text] = (counts.alt_text[asset.alt_text] || 0) + 1;
  counts.title[asset.title] = (counts.title[asset.title] || 0) + 1;
  
  const allText = `${asset.title} ${asset.slug} ${asset.seo_title} ${asset.alt_text}`.toLowerCase();
  
  if (allText.includes('gate1')) audit.gate1_count++;
  if (allText.includes('variation')) audit.variation_count++;
  if (/\d{2,}/.test(allText)) audit.random_numbers_count++; // strings with 2 or more digits
}

for (const val of Object.values(counts.seo_title)) { if (val > 1) audit.seo_title_duplicates += val; }
for (const val of Object.values(counts.alt_text)) { if (val > 1) audit.alt_text_duplicates += val; }
for (const val of Object.values(counts.title)) { if (val > 1) audit.title_duplicates += val; }

fs.writeFileSync('task5_seo_audit.json', JSON.stringify(audit, null, 2));
console.log("Done TASK 5");
