const puppeteer = require('puppeteer');
async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.goto('http://localhost:3003/items/yagasuri-pattern', { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.setItem('assetninja_download_count', '0'));
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('無料ダウンロード'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 4000)); 
    const html = await page.evaluate(() => {
      const iframe = document.querySelector('.admax-ads iframe');
      return iframe ? { hasIframe: true } : { hasIframe: false };
    });
    console.log(html);
  } finally {
    await browser.close();
  }
}
run();
