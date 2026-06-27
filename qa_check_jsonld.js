const https = require('https');

const baseUrl = 'https://assetninja.jp';
const urlsToCheck = [
  '/category/ramen', // category page -> ItemList, CollectionPage, ImageObject, FAQPage
  '/guide/ramen-png', // guide page -> Article, HowTo, FAQPage, BreadcrumbList
  '/items/25', // item page -> BreadcrumbList, ImageObject, maybe Article (if guide is linked) Wait, item is just a normal item.
];

async function fetchHtml(url) {
  return new Promise((resolve) => {
    https.get(baseUrl + url, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve(data));
    }).on('error', (e) => {
      resolve('');
    });
  });
}

async function run() {
  for (const url of urlsToCheck) {
    console.log(`\n--- Checking ${url} ---`);
    const html = await fetchHtml(url);
    const jsonLdRegex = /<script type="application\/ld\+json">(.*?)<\/script>/gs;
    let match;
    let schemas = [];
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1]);
        if (Array.isArray(data)) {
          data.forEach(d => schemas.push(d['@type']));
        } else {
          schemas.push(data['@type']);
        }
      } catch (e) {
        console.log('Error parsing JSON-LD');
      }
    }
    // Flatten schemas
    schemas = schemas.flat();
    console.log(`Found Schema Types: ${[...new Set(schemas)].join(', ')}`);
  }
}

run();
