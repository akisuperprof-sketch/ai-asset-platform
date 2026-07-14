const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  // We identify the 34 assets by fetching those updated recently or from our previous modified_assets.json ids
  const oldModified = JSON.parse(fs.readFileSync('modified_assets.json', 'utf8'));
  const ids = oldModified.map(a => a.id);
  
  const { data: currentAssets, error } = await supabase
    .from('assets')
    .select('id, title, slug, tags, seo_title, seo_description, alt_text, image_url, category, created_at, updated_at, review_status')
    .in('id', ids);

  if (error) {
    console.error(error);
    return;
  }
  
  fs.writeFileSync('modified_assets_audit.json', JSON.stringify(currentAssets, null, 2));
  console.log(`Saved ${currentAssets.length} assets to modified_assets_audit.json`);
}

run();
