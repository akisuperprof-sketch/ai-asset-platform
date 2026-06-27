const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1000 });

    console.log("Navigating to local studio page...");
    await page.goto('http://localhost:3003/admin/studio', { waitUntil: 'networkidle2' });
    
    await new Promise(r => setTimeout(r, 2000)); 
    
    await page.screenshot({ path: '/Users/akihironishi/.gemini/antigravity/brain/3887cc17-cbb1-428c-ba23-7a0c1aae8f5f/studio_production_center.png' });
    console.log("Took screenshot");

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}
run();
