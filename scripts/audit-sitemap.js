const https = require('https');
const { XMLParser } = require('fast-xml-parser');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const parser = new XMLParser({ ignoreAttributes: false });

const fetchXml = (url) => new Promise((resolve, reject) => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => resolve(data));
  }).on('error', reject);
});

async function run() {
  const indexXml = await fetchXml('https://assetninja.jp/sitemap.xml');
  const sitemap0Xml = await fetchXml('https://assetninja.jp/sitemap/0.xml');
  
  const parsedIndex = parser.parse(indexXml);
  const parsed0 = parser.parse(sitemap0Xml);
  
  const urlsInIndex = Array.isArray(parsedIndex.urlset.url) ? parsedIndex.urlset.url : [parsedIndex.urlset.url];
  const urlsIn0 = parsed0.urlset ? (Array.isArray(parsed0.urlset.url) ? parsed0.urlset.url : [parsed0.urlset.url]) : [];
  
  let webUrlsIndex = 0;
  let imageUrlsIndex = 0;
  const sitemapIndexSlugs = new Set();
  
  urlsInIndex.forEach(u => {
    if (u) {
        webUrlsIndex++;
        if (u['image:image']) {
            const images = Array.isArray(u['image:image']) ? u['image:image'] : [u['image:image']];
            imageUrlsIndex += images.length;
        }
        if (u.loc && u.loc.includes('/items/')) {
            sitemapIndexSlugs.add(u.loc.split('/items/')[1]);
        }
    }
  });
  
  const sitemap0Slugs = new Set();
  urlsIn0.forEach(u => {
    if (u && u.loc && u.loc.includes('/items/')) {
        sitemap0Slugs.add(u.loc.split('/items/')[1]);
    }
  });
  
  let overlap = 0;
  sitemap0Slugs.forEach(s => {
      if (sitemapIndexSlugs.has(s)) overlap++;
  });
  
  const { data: approvedAssets } = await supabase.from('assets').select('slug, image_url').eq('review_status', 'approved');
  
  let unlisted = 0;
  let noImage = 0;
  
  approvedAssets.forEach(a => {
      if (!a.image_url) noImage++;
      if (!sitemapIndexSlugs.has(a.slug) && !sitemap0Slugs.has(a.slug)) {
          unlisted++;
      }
  });
  
  console.log(JSON.stringify({
      webUrlsIndex,
      imageUrlsIndex,
      urlsIn0: urlsIn0.length,
      overlap,
      approvedCount: approvedAssets.length,
      unlisted,
      noImage
  }, null, 2));
}

run();
