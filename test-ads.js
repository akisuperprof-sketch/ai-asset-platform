const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = '/Users/akihironishi/.gemini/antigravity/brain/3887cc17-cbb1-428c-ba23-7a0c1aae8f5f';

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  
  try {
    const page = await browser.newPage();
    
    // 1. Test PC ad-test
    await page.setViewport({ width: 1280, height: 800 });
    console.log("Navigating to ad-test (PC)...");
    await page.goto('http://localhost:3003/ad-test', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'admax_test_pc.png') });
    console.log("Captured PC AdMax test");

    // 2. Test DownloadAdGate (AdMax Turn)
    console.log("Navigating to item page...");
    await page.goto('http://localhost:3003/items/yagasuri-pattern', { waitUntil: 'networkidle2' });
    
    // Set localStorage so it's AdMax turn (nextCount = 1)
    await page.evaluate(() => {
      localStorage.setItem('assetninja_download_count', '0');
    });
    
    // Click download button
    console.log("Clicking Download button...");
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('無料ダウンロード'));
      if (btn) btn.click();
    });
    
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'admax_gate_pc.png') });
    console.log("Captured AdMax gate");

    // 3. Test PopAds Turn
    await page.evaluate(() => {
      localStorage.setItem('assetninja_download_count', '2'); // next count will be 3 -> PopAds
    });
    
    // Reload and click download
    await page.goto('http://localhost:3003/items/yagasuri-pattern', { waitUntil: 'networkidle2' });
    
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('無料ダウンロード'));
      if (btn) btn.click();
    });
    
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'popads_gate_pc.png') });
    console.log("Captured PopAds gate");

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

run();
