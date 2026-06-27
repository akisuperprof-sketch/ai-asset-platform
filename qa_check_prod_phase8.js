const https = require('https');

const baseUrl = 'https://assetninja.jp';
const urls = [
  '/onigiri-png',
  '/tempura-png',
  '/yakitori-png',
  '/matcha-png',
  '/japanese-pattern-png',
  '/guide/ramen-png',
  '/guide/sushi-png',
  '/guide/matcha-png',
  '/events',
  '/trending',
  '/new',
  '/popular',
  '/searches',
  '/llms.txt',
  '/sitemap.xml',
  '/robots.txt'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    https.get(baseUrl + url, (res) => {
      resolve({ url, status: res.statusCode });
    }).on('error', (e) => {
      resolve({ url, status: e.message });
    });
  });
}

async function run() {
  console.log('Testing URLs on', baseUrl);
  for (const url of urls) {
    const result = await checkUrl(url);
    console.log(`[${result.status}] ${url}`);
  }
}

run();
