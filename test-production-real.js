const puppeteer = require('puppeteer');
const fs = require('fs');

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1000 });

    console.log("Setting cookies...");
    await page.setCookie({
      name: 'D_STRATEGY_KEY',
      value: 'd-strategy-2026',
      domain: 'localhost',
      path: '/'
    });

    console.log("Navigating to local studio page...");
    await page.goto('http://localhost:3000/admin/studio', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000)); 
    
    if (page.url().includes('login')) {
      console.log("Redirected to login. Logging in...");
      await page.type('input[type="password"]', 'd-strategy-2026');
      await page.click('button[type="submit"]');
      await page.waitForFunction('document.body.innerText.includes("Asset Production Center")', { timeout: 15000 });
    }

    console.log("On studio page. URL:", page.url());

    // Click "1件"
    const buttons = await page.$$('button');
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('1件')) {
        await btn.click();
        console.log("Clicked 1件");
        break;
      }
    }
    await new Promise(r => setTimeout(r, 1000));

    // Click "生成開始"
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('生成開始')) {
        await btn.click();
        console.log("Clicked 生成開始");
        break;
      }
    }

    console.log("Waiting for real generation to complete (up to 180s)...");
    for (let i = 0; i < 36; i++) {
      await new Promise(r => setTimeout(r, 5000));
      
      const logTexts = await page.evaluate(() => {
        const spans = Array.from(document.querySelectorAll('.font-mono span, .font-mono div'));
        return spans.map(s => s.innerText);
      });
      
      const allText = logTexts.join(" ");
      console.log(`Poll ${i}: Last log snippet = ${allText.slice(-100).replace(/\n/g, " ")}`);
      
      if (allText.includes('生産センター停止') || allText.includes('PRODUCTION CYCLE COMPLETE') || allText.includes('安全に停止しました')) {
        console.log("Generation complete detected!");
        break;
      }
    }

    await page.screenshot({ path: '/Users/akihironishi/.gemini/antigravity/brain/3887cc17-cbb1-428c-ba23-7a0c1aae8f5f/qa_real_test_completed.png' });
    console.log("Real test script finished.");

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}
run();
