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
    
    // Simulate first open modal
    await page.evaluate(() => {
      window.admaxads = window.admaxads || [];
      window.admaxads.push({admax_id: "40d12e183086a55c7451794352a281c2", type: "banner"});
      const s = document.createElement('script');
      s.src = 'https://adm.shinobi.jp/st/t.js';
      document.body.appendChild(s);
    });
    await new Promise(r => setTimeout(r, 2000));

    // Wait, let's see how many items in admaxads
    const count1 = await page.evaluate(() => window.admaxads.length);
    console.log("First mount admaxads.length:", count1);

    // Simulate closing modal and opening again
    await page.evaluate(() => {
      window.admaxads.push({admax_id: "40d12e183086a55c7451794352a281c2", type: "banner"});
      const s = document.createElement('script');
      s.src = 'https://adm.shinobi.jp/st/t.js';
      document.body.appendChild(s);
    });
    await new Promise(r => setTimeout(r, 2000));

    const count2 = await page.evaluate(() => window.admaxads.length);
    console.log("Second mount admaxads.length:", count2);

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}
run();
