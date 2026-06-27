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

    console.log("On studio page. URL:", page.url());
    await page.screenshot({ path: '/Users/akihironishi/.gemini/antigravity/brain/3887cc17-cbb1-428c-ba23-7a0c1aae8f5f/qa_ui_initial.png' });
    
    console.log("Checking UI state...");
    const textContent = await page.evaluate(() => document.body.innerText);
    fs.writeFileSync('/Users/akihironishi/.gemini/antigravity/brain/3887cc17-cbb1-428c-ba23-7a0c1aae8f5f/qa_ui_text.txt', textContent);
    
    results.qaItems['5_10_20_50'] = textContent.includes('5件') && textContent.includes('50件');
    results.qaItems['estimated_time'] = textContent.includes('推定所要時間');
    results.qaItems['predicted_published'] = textContent.includes('予測公開数');
    results.qaItems['total_assets'] = textContent.includes('全体統計');
    results.qaItems['goal_100'] = textContent.includes('目標100件への道標');

    // Find and click "1件"
    const buttons = await page.$$('button');
    let clicked1 = false;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('1件') || text.includes('テスト1件')) {
        await btn.click();
        clicked1 = true;
        console.log("Clicked 1件");
        break;
      }
    }

    await new Promise(r => setTimeout(r, 1000));

    // Find and click "生成開始"
    let clickedStart = false;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('生成開始')) {
        await btn.click();
        clickedStart = true;
        console.log("Clicked 生成開始");
        break;
      }
    }

    console.log("Waiting 45 seconds for generation...");
    for(let i=0; i<3; i++) {
        await new Promise(r => setTimeout(r, 15000));
        await page.screenshot({ path: `/Users/akihironishi/.gemini/antigravity/brain/3887cc17-cbb1-428c-ba23-7a0c1aae8f5f/qa_ui_step_${i}.png` });
        console.log("Step", i);
    }

    // Stop button
    for (const btn of await page.$$('button')) {
      const text = await page.evaluate(el => el.innerText, btn);
      if (text.includes('安全に停止')) {
        await btn.click();
        console.log("Clicked 安全に停止");
        break;
      }
    }

    await new Promise(r => setTimeout(r, 5000));
    await page.screenshot({ path: `/Users/akihironishi/.gemini/antigravity/brain/3887cc17-cbb1-428c-ba23-7a0c1aae8f5f/qa_ui_final.png` });
    
    fs.writeFileSync('/Users/akihironishi/.gemini/antigravity/brain/3887cc17-cbb1-428c-ba23-7a0c1aae8f5f/qa_test_results.json', JSON.stringify(results, null, 2));
    console.log("Test finished.");

  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}
run();
