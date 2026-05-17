import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export function processRembg() {
  console.log("🚀 Starting Rembg Auto-Processing...");
  const rawDir = path.join(process.cwd(), 'generated-assets', '_raw');
  const transparentDir = path.join(process.cwd(), 'generated-assets', '_transparent');
  
  if (!fs.existsSync(rawDir) || fs.readdirSync(rawDir).length === 0) {
    console.error("❌ No raw images found.");
    return;
  }

  // 実際は rembg コマンドや process_rembg.py を呼び出す
  console.log(`Executing rembg on ${rawDir}...`);
  try {
    // execSync(`python3 src/scripts/process_rembg.py --input ${rawDir} --output ${transparentDir}`);
    console.log("  [Mock] Simulated background removal with Alpha Matting...");
    
    // モック: rawのファイルをtransparentにコピーして.pngにする
    const files = fs.readdirSync(rawDir);
    for (const file of files) {
      if (file.endsWith('.jpg')) {
        const base = path.basename(file, '.jpg');
        fs.copyFileSync(path.join(rawDir, file), path.join(transparentDir, `${base}.png`));
      }
    }
    
    console.log(`✅ Processed ${files.length} images.`);
  } catch (error) {
    console.error("❌ Rembg processing failed:", error);
  }
}

if (require.main === module) {
  processRembg();
}
