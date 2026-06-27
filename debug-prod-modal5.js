const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.goto('https://assetninja.jp/ad-test', { waitUntil: 'networkidle2' });
    
    const data = await page.evaluate(() => {
      const container = document.querySelector('.admax-ads');
      return {
        innerHTML: container ? container.innerHTML : null,
      };
    });

    console.log("AdTest HTML:", JSON.stringify(data, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}
run();
