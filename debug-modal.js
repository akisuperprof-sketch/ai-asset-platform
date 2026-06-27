const puppeteer = require('puppeteer');
const fs = require('fs');

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const results = {};
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    page.on('console', msg => {
      console.log('PAGE LOG:', msg.text());
    });

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
    
    // Wait for modal to open and AdMax script to execute
    await new Promise(r => setTimeout(r, 4000)); 
    
    // Perform checks
    const data = await page.evaluate(() => {
      const container = document.querySelector('.admax-ads');
      const innerHTML = container ? container.innerHTML : null;
      const height = container ? container.offsetHeight : null;
      const clientHeight = container ? container.clientHeight : null;
      let display = null;
      let visibility = null;
      let opacity = null;
      
      if (container) {
        const style = window.getComputedStyle(container);
        display = style.display;
        visibility = style.visibility;
        opacity = style.opacity;
      }

      return {
        hasContainer: !!container,
        innerHTML,
        height,
        clientHeight,
        display,
        visibility,
        opacity,
        admaxadsLength: window.admaxads ? window.admaxads.length : 0,
        admaxadsContent: window.admaxads,
        hasAdmaxRender: !!window.__admax_render__,
      };
    });

    console.log("=== Debug Results ===");
    console.log(JSON.stringify(data, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

run();
