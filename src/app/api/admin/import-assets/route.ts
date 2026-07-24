import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Jimp from "jimp";
import { adminClient } from "@/lib/supabase";

const SECRET = "cyber-ninja-import-2026";
const BUCKET_NAME = process.env.SUPABASE_STORAGE_BUCKET || "sukashi-assets";

/**
 * 画像の透明品質を分析し、スコアと警告を返す
 */
async function analyzeImageQuality(fileBuffer: Buffer) {
  const image = await Jimp.read(fileBuffer);
  const { width, height } = image.bitmap;
  
  let transparentPixels = 0;
  let whitePixels = 0;
  let edgeFringes = 0;
  
  const corners = [
    image.getPixelColor(0, 0),
    image.getPixelColor(width - 1, 0),
    image.getPixelColor(0, height - 1),
    image.getPixelColor(width - 1, height - 1)
  ];
  const cornerTransparency = corners.every(c => (c & 0xFF) === 0);
  
  const totalPixels = width * height;
  const sampleRate = 10;
  
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!adminClient) {
    return NextResponse.json({ error: "Supabase admin client not initialized. Check server env vars." }, { status: 503 });
  }

  const categories = ["food", "japan", "medical", "business", "festival"];
  const report: any[] = [];

  for (const categoryName of categories) {
    const importDir = path.join(process.cwd(), "public", "import-ready", categoryName);

    if (!fs.existsSync(importDir)) {
      report.push({ category: categoryName, status: "skipped", reason: `Directory not found: ${importDir}` });
      continue;
    }

    const files = fs.readdirSync(importDir).filter(f => f.endsWith(".png"));

    for (const fileName of files) {
      try {
        const filePath = path.join(importDir, fileName);
        const stats = fs.statSync(filePath);
        const fileBuffer = fs.readFileSync(filePath);

        // Simple signature and alpha check
        const isPng = fileBuffer[0] === 0x89 && fileBuffer[1] === 0x50 && fileBuffer[2] === 0x4E && fileBuffer[3] === 0x47;
        if (!isPng) {
          report.push({ category: categoryName, fileName, status: "skipped", reason: "Invalid PNG signature" });
          continue;
        }

        // Quality check
        const quality = await analyzeImageQuality(fileBuffer);
        if (quality.score < 50) {
          report.push({ category: categoryName, fileName, status: "skipped", reason: `Quality too low: ${quality.score}/100` });
          continue;
        }

        const baseName = path.parse(fileName).name;
        const slug = `${categoryName}-${baseName}`.toLowerCase().replace(/[^a-z0-9]/g, "-");
        const storageKey = `${categoryName}/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await adminClient.storage
          .from(BUCKET_NAME)
          .upload(storageKey, fileBuffer, {
            contentType: "image/png",
            upsert: true // Upsert to allow clean retries in production
          });

        if (uploadError && !uploadError.message.includes("already exists")) {
          report.push({ category: categoryName, fileName, status: "failed", reason: `Storage upload error: ${uploadError.message}` });
          continue;
        }

        // Register in DB
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const imageUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${storageKey}`;

        const { error: dbError } = await adminClient
          .from("assets")
          .upsert({
            slug,
            title: baseName.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
            description: `${categoryName} category premium asset: ${baseName}`,
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
          report.push({ category: categoryName, fileName, status: "failed", reason: `DB insertion error: ${dbError.message}` });
        } else {
          report.push({ category: categoryName, fileName, status: "success", slug, qualityScore: quality.score });
        }
      } catch (err: any) {
        report.push({ category: categoryName, fileName, status: "error", reason: err.message });
      }
    }
  }

  return NextResponse.json({
    message: "Import process complete",
    results: report
  });
}
