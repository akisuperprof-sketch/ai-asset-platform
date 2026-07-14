const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const modified = require('./modified_assets.json');
  const recoveryData = [];

  for (const asset of modified) {
    let recovered = {
      asset_id: asset.id,
      original_slug: null,
      original_title: null,
      original_seo_title: null,
      original_alt_text: null,
      original_tags: null,
      category: asset.category,
      sources: []
    };

    // 1. Check index_queue for original URL (which contains slug)
    const { data: iq } = await supabase.from('index_queue').select('*').like('url', `%${asset.id}%`);
    if (iq && iq.length > 0) {
      recovered.sources.push('index_queue');
      // URL looks like https://assetninja.jp/items/uuid ? Wait, index_queue URL is usually `/items/${newAssetId}` or `/items/${slug}`
      // Let's check what it actually logged.
    }

    // 2. Check pinterest_posts for seo_title and description
    const { data: pp } = await supabase.from('pinterest_posts').select('*').eq('asset_id', asset.id);
    if (pp && pp.length > 0) {
      recovered.sources.push('pinterest_posts');
      recovered.original_seo_title = pp[0].title;
      // Note: description is for pinterest, alt_text might be different.
    }

    // 3. Check social_posts
    const { data: sp } = await supabase.from('social_posts').select('*').eq('asset_id', asset.id);
    if (sp && sp.length > 0) {
      recovered.sources.push('social_posts');
      if (!recovered.original_seo_title) recovered.original_seo_title = sp[0].title;
    }

    // 4. Check generation_jobs by image_url
    const { data: gj } = await supabase.from('generation_jobs').select('*').eq('image_url', asset.image_url);
    if (gj && gj.length > 0) {
      recovered.sources.push('generation_jobs');
      const job = gj[0];
      const title = job.metadata?.categoryDomination?.seoSlug || job.keyword;
      recovered.original_title = title;
      recovered.original_slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      recovered.original_tags = [job.keyword, "transparent png", "isolated", ...(job.metadata?.categoryDomination?.tags || [])];
      
      // Auto SEO data might be in factory_logs if logged, but typically we lost seo_title/alt_text unless we check social/pinterest
    }

    recoveryData.push(recovered);
  }

  require('fs').writeFileSync('recovery_data.json', JSON.stringify(recoveryData, null, 2));
  console.log(`Recovered data for ${recoveryData.length} assets.`);
}
run();
