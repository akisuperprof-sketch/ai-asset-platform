const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: recentAssets } = await supabase.from('assets').select('id, created_at, updated_at, title, slug, tags, seo_title, alt_text, category, image_url')
    .eq('review_status', 'approved')
    .gte('created_at', new Date('2026-07-12T00:00:00Z').toISOString());
    
  // I updated them to have 'variation' in title/slug/tags
  const modified = recentAssets.filter(a => a.slug.includes('variation'));
  console.log(`Found: ${modified.length} assets.`);
  require('fs').writeFileSync('modified_assets.json', JSON.stringify(modified, null, 2));
}
run();
