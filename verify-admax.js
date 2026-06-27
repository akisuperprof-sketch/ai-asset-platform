const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/Users/akihironishi/.gemini/antigravity/brain/3887cc17-cbb1-428c-ba23-7a0c1aae8f5f';

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const results = {
    adTest: { network: [], dom: null, adFound: false },
    itemPage: { network: [], dom: null, adFound: false }
  };
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // Track network requests
    page.on('request', request => {
      const url = request.url();
      if (url.includes('shinobi') || url.includes('admax')) {
        // Find which test we're running
        const activeTest = page.url().includes('ad-test') ? results.adTest : results.itemPage;
        activeTest.network.push({ url, status: 'requested' });
      }
    });

    page.on('response', response => {
      const url = response.url();
      if (url.includes('shinobi') || url.includes('admax')) {
        const activeTest = page.url().includes('ad-test') ? results.adTest : results.itemPage;
        const req = activeTest.network.find(r => r.url === url);
        if (req) {
          req.status = response.status();
        }
      }
    });

    console.log("=== 1. Testing /ad-test ===");
    await page.goto('https://assetninja.jp/ad-test', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 4000)); // Wait for ad rendering
    
    // Check DOM inside admax-ads
    results.adTest.dom = await page.evaluate(() => {
      const container = document.querySelector('.admax-ads');
      if (!container) return "No .admax-ads container found";
      return container.innerHTML;
    });
    
    results.adTest.adFound = results.adTest.dom && (results.adTest.dom.includes('<iframe') || results.adTest.dom.includes('<img'));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'prod_admax_test_pc.png') });

    console.log("=== 2. Testing Item Page (miso-ramen-bowl) ===");
    await page.goto('https://assetninja.jp/items/miso-ramen-bowl', { waitUntil: 'networkidle2' });
    
    // Force AdMax turn
    await page.evaluate(() => {
      localStorage.setItem('assetninja_download_count', '0');
    });
    
    // Click Download
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('無料ダウンロード'));
      if (btn) btn.click();
    });
    
    await new Promise(r => setTimeout(r, 4000)); // Wait for modal and ad
    
    results.itemPage.dom = await page.evaluate(() => {
      const container = document.querySelector('.admax-ads');
      if (!container) return "No .admax-ads container found";
      return container.innerHTML;
    });
    
    results.itemPage.adFound = results.itemPage.dom && (results.itemPage.dom.includes('<iframe') || results.itemPage.dom.includes('<img'));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'prod_admax_gate_pc.png') });

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'admax_verify_results.json'), JSON.stringify(results, null, 2));
    console.log("Done.");
  }
}

run();
