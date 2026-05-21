/**
 * AssetNinja Daily Auto-Generation Pipeline Script Model
 * 
 * 毎日100画像を需要キーワードから自動生成し、透過処理、
 * Vision AIによる品質＆商標安全ゲートを通過させて Supabase に draft として保存するスクリプトの実装例です。
 * 
 * 実行方法: npx ts-node generation-pipeline/generate-assets.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""; // 管理者権限キーが必要

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 9重の安全ガードのためのブラックリスト
const KEYWORD_BLACKLIST = [
  "disney", "mickey", "nintendo", "mario", "pokemon", "pikachu", "sony", "apple", "nike",
  "サンリオ", "キティ", "ドラえもん", "ジブリ", "トトロ", "アンパンマン", "鬼滅"
];

interface GenerationJobConfig {
  category: string;
  keyword: string;
  count: number;
}

/**
 * 1. 需要キーワードの自動選定とブラックリスト検証
 */
function validateKeyword(keyword: string): boolean {
  const normalized = keyword.toLowerCase();
  for (const blacklisted of KEYWORD_BLACKLIST) {
    if (normalized.includes(blacklisted)) {
      console.warn(`⚠️ [Safety Guard] Keyword "${keyword}" contains blacklisted word "${blacklisted}". Skipped.`);
      return false;
    }
  }
  return true;
}

/**
 * 2. プロンプト生成 (ネガティブプロンプトガード)
 */
function createPrompt(keyword: string): { prompt: string; negativePrompt: string } {
  return {
    prompt: `highly detailed, professional commercial isolated stock photo of Japanese ${keyword}, clean edges, studio lighting, front dynamic view, 4k resolution, sharp focus`,
    negativePrompt: "ugly, deformed, mutated, text, watermark, signature, blurry, low resolution, trademark, logo, shadow background, cluttered background, border, frame"
  };
}

/**
 * 3. ダミー画像生成 API (実際は Stability AI / OpenAI / Flux API 等をコール)
 */
async function mockGenerateImage(prompt: string): Promise<Buffer> {
  // 本番では fetch("https://api.stability.ai/v1/generation/...") などでBufferを取得
  console.log(`🎨 [AI Generator] Dispatching prompt: "${prompt}"`);
  return Buffer.from("dummy-png-binary-data");
}

/**
 * 4. rembg背景透過処理 (実際は rembg や Cloudinary / Clipdrop 等の透過APIを使用)
 */
async function mockRemoveBackground(imageBuffer: Buffer): Promise<{ transparentBuffer: Buffer; transparencyScore: number }> {
  console.log(`✂️ [Background Remover] Processing transparency masks (rembg)...`);
  return {
    transparentBuffer: imageBuffer,
    transparencyScore: 95 // 自動算出されたエッジ透過率スコア (0-100)
  };
}

/**
 * 5. Vision AIによる品質・商標違反検閲ゲート (GPT-4o Vision API 等を使用)
 */
async function runVisionSafetyAudit(imageBuffer: Buffer, keyword: string): Promise<{
  qualityScore: number;
  rightsScore: number;
  isSafe: boolean;
  rejectReason?: string;
}> {
  console.log(`👁️ [Vision Guardian] Auditing generated image for trademarks, logos, brand markers and artifacts...`);
  
  // 本番では GPT-4o に画像を投げて検閲
  // 例: "Does this image contain any trademarked logos, deformed shapes, or copyright text?"
  
  return {
    qualityScore: 94,
    rightsScore: 100, // 100% クリーン
    isSafe: true
  };
}

/**
 * Main Pipeline Runner
 */
export async function runPipeline(jobConfig: GenerationJobConfig) {
  console.log(`🚀 [Pipeline] Starting Daily Auto-Generation Pipeline. Target: ${jobConfig.count} assets for "${jobConfig.keyword}"`);

  if (!validateKeyword(jobConfig.keyword)) {
    console.error("❌ Keyword validation failed. Aborting pipeline.");
    return { success: false, reason: "Keyword Blacklisted" };
  }

  // 1. Create a Run log in DB
  const { data: runRecord, error: runError } = await supabase
    .from("generation_runs")
    .insert({
      status: "running",
      target_count: jobConfig.count,
      generated_count: 0,
      success_count: 0,
      failed_count: 0
    })
    .select()
    .single();

  if (runError) {
    console.error("❌ Failed to create run record in database:", runError.message);
    return { success: false, reason: runError.message };
  }

  const runId = runRecord.id;
  let successCount = 0;
  let failedCount = 0;

  for (let i = 0; i < jobConfig.count; i++) {
    const assetId = `${jobConfig.category}-${jobConfig.keyword.replace(/\s+/g, "-")}-auto-${String(i + 1).padStart(3, "0")}`;
    console.log(`\n📦 [Asset #${i + 1}/${jobConfig.count}] Processing ID: ${assetId}`);

    try {
      // Step A: Prompt & Generation
      const { prompt, negativePrompt } = createPrompt(jobConfig.keyword);
      const rawImage = await mockGenerateImage(prompt);

      // Step B: rembg Background Removal
      const { transparentBuffer, transparencyScore } = await mockRemoveBackground(rawImage);

      // Step C: Vision & Safety Audit
      const audit = await runVisionSafetyAudit(transparentBuffer, jobConfig.keyword);

      if (!audit.isSafe) {
        console.warn(`⚠️ [Safety Audit Failed] Asset failed safety audit: ${audit.rejectReason}. Saving to rejected.`);
        failedCount++;
        continue;
      }

      // Step D: Storage Save (Supabase Storage) - Storage Save FIRST (Safety Guard 4)
      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "sukashi-assets";
      const storagePath = `${jobConfig.category}/${assetId}.png`;

      console.log(`☁️ [Storage] Uploading to bucket "${bucketName}" at path "${storagePath}"...`);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(storagePath, transparentBuffer, {
          contentType: "image/png",
          upsert: true
        });

      if (uploadError) {
        throw new Error(`Storage upload failed: ${uploadError.message}`);
      }

      // Step E: Atomic DB Insert (Only after storage success)
      const publishReadyScore = Math.floor((audit.qualityScore + transparencyScore + audit.rightsScore) / 3);
      const reviewStatus = publishReadyScore >= 90 ? "review" : "draft";

      const assetPayload = {
        id: assetId,
        title: `極上背景透過 ${jobConfig.keyword} イラスト 素材 ${i + 1}`,
        description: `商用利用可能かつ高精度な背景切り抜き済みの「${jobConfig.keyword}」透過PNG素材です。WebデザインやCanva等で影を含め美しく馴染みます。`,
        category: jobConfig.category,
        tags: [jobConfig.keyword, "背景透過", "PNG", "AI生成素材", "和風"],
        storage_key: storagePath,
        image_url: null, // Will be auto-resolved to Storage URL in mapper
        width: 2048,
        height: 2048,
        file_size: "1.2 MB",
        is_ai_generated: true,
        legal_status: audit.rightsScore >= 95 ? "clean" : "flagged",
        review_status: reviewStatus,
        quality_rank: publishReadyScore >= 95 ? "S" : publishReadyScore >= 90 ? "A" : "B",
        quality_score: audit.qualityScore,
        transparency_score: transparencyScore,
        rights_score: audit.rightsScore,
        publish_ready_score: publishReadyScore,
        seo_score: 95
      };

      const { error: dbError } = await supabase
        .from("assets")
        .insert(assetPayload);

      if (dbError) {
        // Rollback Storage file if DB insert fails to maintain consistency
        console.error(`💥 [Database Failure] Insert failed: ${dbError.message}. Rolling back Storage file...`);
        await supabase.storage.from(bucketName).remove([storagePath]);
        throw dbError;
      }

      // Step F: Review details log
      await supabase
        .from("asset_reviews")
        .insert({
          asset_id: assetId,
          run_id: runId,
          quality_feedback: "Auto verified by AI pipeline.",
          rights_feedback: "Trademark cleared.",
          is_safe_for_commercial: true
        });

      console.log(`✅ [Success] Asset successfully archived in Storage & indexed in DB!`);
      successCount++;

    } catch (e: any) {
      console.error(`❌ [Error] Failed to process asset:`, e.message || e);
      failedCount++;
    }
  }

  // Update final run stats in DB
  await supabase
    .from("generation_runs")
    .update({
      status: "completed",
      generated_count: jobConfig.count,
      success_count: successCount,
      failed_count: failedCount
    })
    .eq("id", runId);

  console.log(`\n🎉 [Pipeline Finished] Complete. Success: ${successCount} | Failed: ${failedCount}`);
  return { success: true, successCount, failedCount };
}

// Default run execution for modeling
if (require.main === module) {
  runPipeline({
    category: "food",
    keyword: "てまり寿司",
    count: 3
  }).then(() => {
    console.log("🏁 Pipeline model run finished.");
  });
}
