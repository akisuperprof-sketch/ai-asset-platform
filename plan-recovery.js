const fs = require('fs');
const recoveryData = require('./recovery_data.json');

const plan = {
  totalTarget: 34,
  canRecoverSlug: 0,
  canRecoverTitle: 0,
  canRecoverTags: 0,
  seoTitleNeedsGeneration: 0,
  altTextNeedsGeneration: 0,
  seoGenerationStrategy: "Use category and original keyword to create a clean, natural English SEO title (e.g. 'Matcha Japanese Green Tea Transparent PNG') and descriptive alt text, strictly avoiding internal numbers like 'gate1' or 'variation 41'."
};

recoveryData.forEach(r => {
  if (r.original_slug) plan.canRecoverSlug++;
  if (r.original_title) plan.canRecoverTitle++;
  if (r.original_tags) plan.canRecoverTags++;
  if (!r.original_seo_title) plan.seoTitleNeedsGeneration++;
  if (!r.original_alt_text) plan.altTextNeedsGeneration++;
});

console.log(JSON.stringify(plan, null, 2));
