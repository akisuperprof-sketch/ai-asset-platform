const puppeteer = require('puppeteer');

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    page.on('console', msg => {
      console.log('PAGE LOG:', msg.text());
    });

    console.log("Navigating to production item page...");
    await page.goto('https://assetninja.jp/items/miso-ramen-bowl', { waitUntil: 'networkidle2' });
    
    // Force AdMax turn
    await page.evaluate(() => {
      localStorage.setItem('assetninja_download_count', '0');
    });
    
    console.log("Clicking Download button...");
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('無料ダウンロード'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log("Button clicked?", clicked);

    await new Promise(r => setTimeout(r, 4000)); 
    
    const data = await page.evaluate(() => {
      const container = document.querySelector('.admax-ads');
      const admaxScript = document.getElementById('admax-script-pc');
      
      let display = null;
      let height = null;
      let clientHeight = null;
      
      if (container) {
        const style = window.getComputedStyle(container);
        display = style.display;
        height = container.offsetHeight;
        clientHeight = container.clientHeight;
      }

      return {
        hasContainer: !!container,
        innerHTML: container ? container.innerHTML : null,
        display,
        height,
        clientHeight,
        admaxadsLength: window.admaxads ? window.admaxads.length : 0,
        admaxadsContent: window.admaxads,
        hasAdmaxRender: !!window.__admax_render__,
        hasAdmaxScript: !!admaxScript
      };
    });

    console.log("=== Production Modal Debug Results ===");
    console.log(JSON.stringify(data, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}
run();
