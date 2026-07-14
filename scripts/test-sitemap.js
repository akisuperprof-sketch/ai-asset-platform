const { generateSitemaps, default: sitemap } = require('../.next/server/app/sitemap.js');

async function test() {
  const sitemaps = await generateSitemaps();
  console.log("generateSitemaps:", sitemaps);
  
  if (sitemaps.length > 0) {
      const s0 = await sitemap({ id: sitemaps[0].id });
      console.log("sitemap 0 length:", s0.length);
  }
}
test();
