const puppeteer = require('puppeteer');
const fs = require('fs');

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log("Navigating to item page...");
    await page.goto('http://localhost:3003/items/yagasuri-pattern', { waitUntil: 'networkidle2' });
    
    // Force AdMax turn
    await page.evaluate(() => {
      localStorage.setItem('assetninja_download_count', '0');
    });
    
    console.log("Clicking Download button...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('無料ダウンロード'));
      if (btn) btn.click();
    });
    
    await new Promise(r => setTimeout(r, 4000)); 
    
    await page.screenshot({ path: 'debug-modal-screenshot.png' });
    
    const html = await page.content();
    fs.writeFileSync('debug-modal-content.html', html);
    console.log("Saved debug-modal-screenshot.png and debug-modal-content.html");
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}
run();
