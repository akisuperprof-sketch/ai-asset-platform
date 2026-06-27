const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    console.log("Navigating to production item page...");
    await page.goto('https://assetninja.jp/items/miso-ramen-bowl', { waitUntil: 'networkidle2' });
    
    // Force AdMax turn
    await page.evaluate(() => {
      localStorage.setItem('assetninja_download_count', '0');
    });
    
    // Inject a mutation observer or override push to see if t.js processes it
    await page.evaluate(() => {
      // Clear global state manually BEFORE modal opens
      delete window.__admax_render__;
      window.admaxads = [];
    });
    
    console.log("Clicking Download button...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('無料ダウンロード'));
      if (btn) btn.click();
    });

    await new Promise(r => setTimeout(r, 4000)); 
    
    const data = await page.evaluate(() => {
      const container = document.querySelector('.admax-ads');
      return {
        hasContainer: !!container,
        innerHTML: container ? container.innerHTML : null,
        admaxadsLength: window.admaxads ? window.admaxads.length : 0,
        hasAdmaxRender: !!window.__admax_render__,
      };
    });

    console.log("=== Production Modal Debug Results 2 ===");
    console.log(JSON.stringify(data, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}
run();
