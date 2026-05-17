import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs';

export function runAutoImport() {
  console.log("🚀 Starting Auto Import to Supabase...");
  const reviewDir = path.join(process.cwd(), 'generated-assets', '_review');
  const metadataPath = path.join(reviewDir, 'metadata.json');
  
  if (!fs.existsSync(metadataPath)) {
    console.error("❌ metadata.json not found.");
    return;
  }

  // 実際は、このメタデータを利用して src/scripts/import-assets.ts を拡張して呼び出す
  // ここではモックとして、import-ready フォルダへ移動させるだけの処理
  console.log("  [Mock] Moving approved assets to import-ready/...");
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  
  for (const meta of metadata) {
    const categoryDir = path.join(process.cwd(), 'import-ready', meta.category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
    
    fs.copyFileSync(
      path.join(reviewDir, meta.filename),
      path.join(categoryDir, meta.filename)
    );
    console.log(`    🚚 Prepared ${meta.filename} for final import.`);
  }

  console.log("\n✨ Ready for production import.");
  console.log("Run: npx tsx src/scripts/import-assets.ts --category=food");
}

if (require.main === module) {
  runAutoImport();
}
