const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto('https://assetninja.jp/ad-test', { waitUntil: 'networkidle2' });
    
    // Check all window globals related to admax or shinobi
    const api = await page.evaluate(() => {
      return {
        admax_tag_type: typeof window.__admax_tag__,
        admax_tag_keys: window.__admax_tag__ ? Object.keys(window.__admax_tag__) : null,
        admax_render_type: typeof window.__admax_render__,
        admaxads_keys: Object.keys(window.admaxads || {}),
      };
    });

    console.log("AdMax API:", api);

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}
run();
