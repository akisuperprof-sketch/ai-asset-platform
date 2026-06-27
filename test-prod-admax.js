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
    
    console.log("Clicking Download button...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('無料ダウンロード'));
      if (btn) btn.click();
    });

    // Wait for modal to open and AdMax to load
    await new Promise(r => setTimeout(r, 5000)); 
    
    // Take a screenshot of the modal specifically or the whole page
    await page.screenshot({ path: '/Users/akihironishi/.gemini/antigravity/brain/3887cc17-cbb1-428c-ba23-7a0c1aae8f5f/prod-modal-admax.png' });
    
    const data = await page.evaluate(() => {
      const modal = document.querySelector('.fixed.inset-0'); // Simple modal check
      const adIframe = document.querySelector('.admax-ads iframe');
      const continueBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Continue Download'));
      const sponsorSpace = document.querySelector('.admax-ads');

      return {
        hasModal: !!modal,
        hasAdIframe: !!adIframe,
        iframeSrc: adIframe ? adIframe.src : null,
        hasContinueBtn: !!continueBtn,
        hasSponsorSpace: !!sponsorSpace,
      };
    });

    console.log("DOM Verification:", JSON.stringify(data, null, 2));

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}
run();
