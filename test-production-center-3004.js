const puppeteer = require('puppeteer');
const fs = require('fs');

async function run() {
  const browser = await puppeteer.launch({ headless: 'new' });
  const results = {
    qaItems: {},
    logs: [],
    finalStats: {}
  };

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1000 });

    console.log("Navigating to local studio page on port 3004...");
    
    await page.goto('http://localhost:3004/admin/studio', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000)); 
    
    // Login if needed
    if (page.url().includes('login')) {
      console.log("Redirected to login. Logging in...");
      await page.type('input[type="password"]', 'd-strategy-2026');
      await Promise.all([
          page.click('button[type="submit"]'),
          page.waitForNavigation({ waitUntil: 'networkidle2' })
      ]);
    }

    console.log("On studio page. URL:", page.url());
    await page.screenshot({ path: '/Users/akihironishi/.gemini/antigravity/brain/3887cc17-cbb1-428c-ba23-7a0c1aae8f5f/qa_ui_initial.png' });
    
    console.log("Checking UI state...");
    const textContent = await page.evaluate(() => document.body.innerText);
    
    results.qaItems['5_10_20_50'] = textContent.includes('5件') && textContent.includes('50件');
    results.qaItems['estimated_time'] = textContent.includes('推定所要時間');
    results.qaItems['predicted_published'] = textContent.includes('予測公開数');
    results.qaItems['total_assets'] = textContent.includes('全体統計');
    results.qaItems['goal_100'] = textContent.includes('目標100件への道標');

    // Find and click "1件"
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

    // Find and click "生成開始"
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('生成開始')) {
        await btn.click();
        console.log("Clicked 生成開始");
        break;
      }
    }

    // Wait until completion
    console.log("Waiting for generation to complete...");
    for (let i = 0; i < 15; i++) {
      await new Promise(r => setTimeout(r, 5000));
      
      const logTexts = await page.evaluate(() => {
        const divs = Array.from(document.querySelectorAll('.font-mono div'));
        return divs.map(d => d.innerText);
      });
      
      console.log(`Poll ${i}: Last log = ${logTexts[logTexts.length - 1] || "none"}`);
      
      if (logTexts.some(t => t.includes('生産センター停止'))) {
        results.logs = logTexts;
        console.log("Generation complete detected!");
        break;
      }
    }

    await page.screenshot({ path: '/Users/akihironishi/.gemini/antigravity/brain/3887cc17-cbb1-428c-ba23-7a0c1aae8f5f/qa_ui_completed.png' });
    
    fs.writeFileSync('/Users/akihironishi/.gemini/antigravity/brain/3887cc17-cbb1-428c-ba23-7a0c1aae8f5f/qa_test_results.json', JSON.stringify(results, null, 2));
    console.log("Test finished.");

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}
run();
