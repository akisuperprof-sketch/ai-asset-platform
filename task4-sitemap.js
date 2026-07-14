const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
  });
}

async function run() {
  const d = require('./task4_url_audit.json');
  const xml = await fetchUrl('https://assetninja.jp/sitemap/1.xml');
  let sitemapCount = 0;
  let imageSitemapCount = 0;

  for (const x of d) {
    if (xml.includes(`https://assetninja.jp/items/${x.slug}`)) {
      sitemapCount++;
    }
    // Check if it has <image:image> nearby
    const parts = xml.split(`https://assetninja.jp/items/${x.slug}`);
    if (parts.length > 1 && parts[1].includes('<image:image>')) {
      // Basic heuristic: if the url block has <image:loc>, it's in the image sitemap.
      // Usually Next.js appends image metadata in the same <url> block.
      // Let's assume Next.js app router doesn't officially support <image:image> out of the box in generateSitemaps, 
      // but let's check if the string exists.
      imageSitemapCount++;
    }
  }
  console.log(`Sitemap: ${sitemapCount}`);
  console.log(`Image Sitemap: ${imageSitemapCount}`);
}

run();
