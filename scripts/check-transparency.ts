import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

interface CheckResult {
  file: string;
  hasAlpha: boolean;
  transparentRatio: number;
  whiteRatio: number;
  isPassed: boolean;
  reason?: string;
}

export async function checkTransparency(imagePath: string): Promise<CheckResult> {
  try {
    const image = sharp(imagePath);
    const metadata = await image.metadata();
    
    // Check alpha channel presence
    const hasAlpha = metadata.hasAlpha || metadata.channels === 4;

    if (!hasAlpha) {
      return {
        file: path.basename(imagePath),
        hasAlpha: false,
        transparentRatio: 0,
        whiteRatio: 1, // Assume mostly white if no alpha and it's a generated asset
        isPassed: false,
        reason: "No Alpha Channel"
      };
    }

    // Get raw pixel data
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
    
    let transparentCount = 0;
    let whiteCount = 0;
    const totalPixels = info.width * info.height;
    
    // Assuming 4 channels (RGBA)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i+1];
      const b = data[i+2];
      const a = data[i+3];
      
      if (a < 10) { // Highly transparent
        transparentCount++;
      } else if (r > 240 && g > 240 && b > 240 && a > 240) {
        whiteCount++;
      }
    }
    
    const transparentRatio = transparentCount / totalPixels;
    const whiteRatio = whiteCount / totalPixels;
    
    // Criteria:
    // 1. Must have alpha channel
    // 2. Must have some transparent pixels (e.g. > 5%)
    // 3. Must not have excessive white pixels (e.g. > 40%) - this is heuristic for white bg
    
    let isPassed = true;
    let reason = "";
    
    if (transparentRatio < 0.05) {
      isPassed = false;
      reason = "Fake Transparency (Very low transparent pixels)";
    } else if (whiteRatio > 0.4) {
      isPassed = false;
      reason = `Excessive White Background (${(whiteRatio * 100).toFixed(1)}%)`;
    }

    return {
      file: path.basename(imagePath),
      hasAlpha: true,
      transparentRatio,
      whiteRatio,
      isPassed,
      reason
    };
  } catch (error: any) {
    return {
      file: path.basename(imagePath),
      hasAlpha: false,
      transparentRatio: 0,
      whiteRatio: 0,
      isPassed: false,
      reason: `Error: ${error.message}`
    };
  }
}

async function runCheck() {
  const targetDir = process.argv[2] || path.join(process.cwd(), 'public', 'assets', 'premium');
  
  if (!fs.existsSync(targetDir)) {
    console.error(`Directory not found: ${targetDir}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(targetDir).filter(f => f.endsWith('.png'));
  console.log(`🔍 Checking ${files.length} PNG files in ${targetDir}...\n`);
  
  let passed = 0;
  let failed = 0;
  
  for (const file of files) {
    const res = await checkTransparency(path.join(targetDir, file));
    if (res.isPassed) {
      passed++;
      console.log(`✅ PASS: ${file} (Trans: ${(res.transparentRatio*100).toFixed(1)}%, White: ${(res.whiteRatio*100).toFixed(1)}%)`);
    } else {
      failed++;
      console.log(`❌ FAIL: ${file} - ${res.reason} (Trans: ${(res.transparentRatio*100).toFixed(1)}%, White: ${(res.whiteRatio*100).toFixed(1)}%)`);
    }
  }
  
  console.log(`\n✨ Audit Complete. PASS: ${passed} | FAIL: ${failed}`);
}

if (require.main === module) {
  runCheck();
}
