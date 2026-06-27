const https = require('https');
const urls = [
  'https://assetninja.jp/trending',
  'https://assetninja.jp/new',
  'https://assetninja.jp/popular'
];

urls.forEach(url => {
  https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const types = [];
      const regex = /"type":\s*"([^"]+)"|@type":\s*"([^"]+)"/g;
      let match;
      while ((match = regex.exec(data)) !== null) {
        if (match[1]) types.push(match[1]);
        if (match[2]) types.push(match[2]);
      }
      const uniqueTypes = [...new Set(types)];
      console.log(`\n--- Checking ${url} ---`);
      console.log(`Found Schema Types: ${uniqueTypes.join(', ')}`);
    });
  });
});
