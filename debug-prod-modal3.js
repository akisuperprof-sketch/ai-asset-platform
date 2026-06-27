const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto('https://assetninja.jp/ad-test', { waitUntil: 'networkidle2' });
    
    // Check all window globals related to admax or shinobi
    const globals = await page.evaluate(() => {
      return Object.keys(window).filter(k => k.toLowerCase().includes('admax') || k.toLowerCase().includes('shinobi') || k === 'admaxads');
    });

    console.log("Globals on ad-test:", globals);

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}
run();
