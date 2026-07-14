const fs = require('fs');
const https = require('https');

const current = JSON.parse(fs.readFileSync('modified_assets_audit.json', 'utf8'));

// Promisify https.get
function fetchUrl(url, method = 'HEAD') {
  return new Promise((resolve) => {
    const req = https.request(url, { method, timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, headers: res.headers, body: data });
      });
    });
    req.on('error', (e) => resolve({ status: 0, error: e.message }));
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, error: 'timeout' }); });
    req.end();
  });
}

function parseHTML(html) {
  const matchTag = (regex) => { const m = html.match(regex); return m ? m[1] : null; };
  return {
    canonical: matchTag(/<link rel="canonical" href="([^"]+)"/),
    title: matchTag(/<title>([^<]+)<\/title>/),
    metaDesc: matchTag(/<meta name="description" content="([^"]+)"/),
    jsonLd: matchTag(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  };
}

async function run() {
  const results = [];
  console.log(`Starting audit for ${current.length} assets on production...`);
  
  for (const asset of current) {
    const url = `https://assetninja.jp/items/${asset.slug}`;
    console.log(`Checking ${url}...`);
    // Need GET to parse HTML
    const res = await fetchUrl(url, 'GET');
    
    let parsed = {};
    let imageStatus = 0;
    
    if (res.status === 200 && res.body) {
      parsed = parseHTML(res.body);
      
      // If we got JSON-LD, parse it to find image URL
      if (parsed.jsonLd) {
        try {
          const ld = JSON.parse(parsed.jsonLd);
          const imgUrl = ld.image || (ld.image && ld.image.contentUrl);
          if (imgUrl) {
            const imgRes = await fetchUrl(imgUrl, 'HEAD');
            imageStatus = imgRes.status;
          }
        } catch(e) {}
      }
    }
    
    results.push({
      id: asset.id,
      slug: asset.slug,
      httpStatus: res.status,
      canonical: parsed.canonical || null,
      pageTitle: parsed.title || null,
      metaDesc: parsed.metaDesc || null,
      hasJsonLd: !!parsed.jsonLd,
      imageStatus: imageStatus
    });
    
    // Sleep to prevent overload
    await new Promise(r => setTimeout(r, 1000));
  }
  
  fs.writeFileSync('task4_url_audit.json', JSON.stringify(results, null, 2));
  console.log("Done TASK 4");
}

run();
