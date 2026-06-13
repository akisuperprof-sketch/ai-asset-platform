import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import Jimp from "jimp";
import { loadEnv } from "../lib/env";

// Load environment variables (don't strictly require validation for dry runs)
loadEnv(false);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "sukashi-assets";

const isSupabaseConfigured = !!(supabaseUrl && supabaseServiceKey);
const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseServiceKey) : null;

/**
 * 画像の透明品質を分析し、スコアと警告を返す
 */
async function analyzeImageQuality(fileBuffer: Buffer) {
  const image = await Jimp.read(fileBuffer);
  const { width, height } = image.bitmap;
  
  let transparentPixels = 0;
  let whitePixels = 0;
  let edgeFringes = 0;
  
  // 1. コーナーチェック（4隅が透過しているか）
  const corners = [
    image.getPixelColor(0, 0),
    image.getPixelColor(width - 1, 0),
    image.getPixelColor(0, height - 1),
    image.getPixelColor(width - 1, height - 1)
  ];
  const cornerTransparency = corners.every(c => (c & 0xFF) === 0);
  
  // 2. 全体スキャン（サンプリング）
  const totalPixels = width * height;
  const sampleRate = 10; // 10ピクセルごとに1回チェック
  
  image.scan(0, 0, width, height, (x, y, idx) => {
    if ((x + y) % sampleRate !== 0) return;
    
    const r = image.bitmap.data[idx + 0];
    const g = image.bitmap.data[idx + 1];
    const b = image.bitmap.data[idx + 2];
    const a = image.bitmap.data[idx + 3];
    
    if (a === 0) {
      transparentPixels++;
    } else if (r > 240 && g > 240 && b > 240) {
      whitePixels++;
      // 透過付近の白っぽいピクセルをフリンジとしてカウント
      if (a < 255) edgeFringes++;
    }
  });

  const transparencyRatio = (transparentPixels * sampleRate) / totalPixels;
  const whiteRatio = (whitePixels * sampleRate) / totalPixels;
  
  let score = 100;
  const warnings: string[] = [];
  
  if (!cornerTransparency) {
    score -= 30;
    warnings.push("Corners are not transparent (possible masking failure)");
  }
  
  if (transparencyRatio < 0.05) {
    score -= 40;
    warnings.push(`Low transparency (${(transparencyRatio * 100).toFixed(1)}%) - Image might be mostly opaque`);
  }
  
  if (whiteRatio > 0.1) {
    score -= 20;
    warnings.push("High white pixel ratio - Possible remaining background");
  }

  return { score, transparencyRatio, warnings };
}

// CLI Arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const targetCategory = args.find(arg => arg.startsWith("--category="))?.split("=")[1];

if (!isSupabaseConfigured && !isDryRun) {
  console.error("❌ Missing Supabase environment variables. Cannot proceed with real import.");
  process.exit(1);
}

if (!isSupabaseConfigured && isDryRun) {
  console.log("⚠️  Supabase credentials missing. Entering MOCK DRY RUN MODE.");
}

const IMPORT_ROOT = path.join(process.cwd(), "import-ready");
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

async function importAssets() {
  console.log("🚀 Starting Asset Import Pipeline...");
  if (isDryRun) console.log("⚠️  DRY RUN MODE ENABLED (No changes will be made)");
  if (targetCategory) console.log(`🎯 Target Category: ${targetCategory}`);

  if (!fs.existsSync(IMPORT_ROOT)) {
    console.error(`❌ Import root not found: ${IMPORT_ROOT}`);
    return;
  }

  const categories = fs.readdirSync(IMPORT_ROOT).filter(f => {
    const isDir = fs.statSync(path.join(IMPORT_ROOT, f)).isDirectory();
    if (targetCategory) return isDir && f === targetCategory;
    return isDir;
  });

  if (categories.length === 0) {
    console.log("ℹ️  No matching categories found.");
    return;
  }

  for (const categoryName of categories) {
    if (categoryName.startsWith("_")) continue; // Skip hidden/backup folders

    const categoryPath = path.join(IMPORT_ROOT, categoryName);
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith(".png"));

    console.log(`\n📂 Processing category: ${categoryName} (${files.length} files)`);

    for (const fileName of files) {
      const filePath = path.join(categoryPath, fileName);
      const stats = fs.statSync(filePath);
      const fileBuffer = fs.readFileSync(filePath);
      
      // 1. Safety Checks
      console.log(`  🔍 Checking: ${fileName}...`);
      
      // Extension check
      if (path.extname(fileName).toLowerCase() !== ".png") {
        console.warn(`    ⚠️  Skipping: Not a PNG file.`);
        continue;
      }

      // PNG Signature Check
      const isPng = fileBuffer[0] === 0x89 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x4E && fileBuffer[3] === 0x47;
      if (!isPng) {
        console.warn(`    ⚠️  Skipping: Not a valid PNG file signature (might be a renamed JPEG).`);
        continue;
      }

      // Alpha Channel Check (PNG Color Type)
      // Offset 25 (0-indexed 25) is the Color Type
      const colorType = fileBuffer[25];
      const hasAlpha = colorType === 4 || colorType === 6;
      if (!hasAlpha) {
        console.warn(`    ⚠️  Warning: File might not have an alpha channel (Color Type: ${colorType}).`);
      } else {
        console.log(`    ✅ Alpha channel detected (Color Type: ${colorType}).`);
      }

      // Quality Analysis
      const quality = await analyzeImageQuality(fileBuffer);
      console.log(`    📊 Quality Score: ${quality.score}/100 (Transparency: ${(quality.transparencyRatio * 100).toFixed(1)}%)`);
      
      if (quality.warnings.length > 0) {
        quality.warnings.forEach(w => console.warn(`      ⚠️  ${w}`));
      }

      if (quality.score < 80 && !isDryRun) {
        console.error(`    ❌ Skipping: Quality too low (${quality.score}/100).`);
        continue;
      }

      // Size check
      if (stats.size > MAX_FILE_SIZE) {
        console.warn(`    ⚠️  Skipping: File too large (${(stats.size / 1024 / 1024).toFixed(2)}MB > 10MB).`);
        continue;
      }

      // Generate Slug & Storage Key
      const baseName = path.parse(fileName).name;
      const slug = `${categoryName}-${baseName}`.toLowerCase().replace(/[^a-z0-9]/g, "-");
      const storageKey = `${categoryName}/${fileName}`;

      // Duplicate Check (Slug)
      if (supabase) {
        const { data: existingAsset } = await supabase
          .from("assets")
          .select("id")
          .eq("slug", slug)
          .single();

        if (existingAsset) {
          console.warn(`    ⚠️  Warning: Slug "${slug}" already exists in DB.`);
        }

        // Duplicate Check (Storage)
        const { data: existingFiles } = await supabase.storage
          .from(bucketName)
          .list(categoryName, { search: fileName });

        const fileExistsInStorage = existingFiles && existingFiles.some(f => f.name === fileName);
        if (fileExistsInStorage) {
          console.warn(`    ⚠️  Warning: File "${storageKey}" already exists in Storage.`);
        }
      } else {
        console.log(`    ℹ️  [MOCK] Skipping DB/Storage duplicate checks (No credentials)`);
      }

      if (isDryRun) {
        console.log(`    ✅ [DRY RUN] Would import: ${slug} (${(stats.size / 1024 / 1024).toFixed(2)}MB)`);
        continue;
      }

      // 2. Upload to Storage
      if (!supabase) {
        console.error("❌ Unexpected state: Supabase client missing during real import.");
        process.exit(1);
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(storageKey, fileBuffer, {
          contentType: "image/png",
          upsert: false // Security: Do not overwrite existing files by default
        });

      if (uploadError) {
        if (uploadError.message.includes("already exists")) {
          console.warn(`    ⚠️  Skipping Upload: File already exists in Storage.`);
        } else {
          console.error(`    ❌ Upload failed: ${uploadError.message}`);
          continue;
        }
      }

      // 3. Register in Database
      const imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${storageKey}`;

      const { error: dbError } = await supabase
        .from("assets")
        .upsert({
          slug,
          title: baseName.replace(/-/g, " "),
          description: `${categoryName} category asset: ${baseName}`,
          category: categoryName,
          tags: [categoryName, ...baseName.split("-")],
          storage_key: storageKey,
          image_url: imageUrl,
          width: 1024,
          height: 1024,
          file_size: `${(stats.size / 1024 / 1024).toFixed(2)} MB`,
          is_ai_generated: true,
          license_type: "free",
          review_status: "approved",
          legal_status: "clean",
          published_at: new Date().toISOString()
        }, {
          onConflict: "slug"
        });

      if (dbError) {
        console.error(`    ❌ DB registration failed: ${dbError.message}`);
      } else {
        console.log(`    ✅ Successfully imported: ${slug}`);
      }
    }
  }

  console.log("\n✨ Import process completed.");
}

importAssets().catch(console.error);
