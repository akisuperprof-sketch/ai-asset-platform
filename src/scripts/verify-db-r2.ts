import { createClient } from "@supabase/supabase-js";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseBucket = process.env.SUPABASE_STORAGE_BUCKET || "sukashi-assets";

const r2AccountId = process.env.R2_ACCOUNT_ID;
const r2AccessKeyId = process.env.R2_ACCESS_KEY_ID;
const r2SecretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const r2BucketName = process.env.R2_BUCKET_NAME;
const r2Endpoint = process.env.R2_ENDPOINT;

async function checkSupabase() {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 1. Supabase DB & Storage 実機検証");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // 1. assets件数
  const { count: assetsCount, error: countErr } = await supabase
    .from("assets")
    .select("*", { count: "exact", head: true });
  
  if (countErr) {
    console.error("❌ assets件数取得失敗:", countErr.message);
  } else {
    console.log(`✅ [DB] assets テーブル総件数: ${assetsCount} 件`);
  }

  // 2. assetsの最新10件
  const { data: latestAssets, error: selectErr } = await supabase
    .from("assets")
    .select("id, title, image_url, category, created_at, published_at, review_status, legal_status")
    .order("created_at", { ascending: false })
    .limit(10);

  if (selectErr) {
    console.error("❌ assets最新10件取得失敗:", selectErr.message);
  } else if (latestAssets) {
    console.log("\n✅ [DB] assets 最新データ (最大10件):");
    latestAssets.forEach((asset, idx) => {
      console.log(`  [${idx+1}] ID: ${asset.id}`);
      console.log(`      Title: ${asset.title}`);
      console.log(`      Category: ${asset.category}`);
      console.log(`      Image URL: ${asset.image_url}`);
      console.log(`      Review: ${asset.review_status} | Legal: ${asset.legal_status}`);
      console.log(`      Created At: ${asset.created_at}`);
    });
  }

  // 3. download_logs件数
  const { count: logsCount, error: logsErr } = await supabase
    .from("download_logs")
    .select("*", { count: "exact", head: true });

  if (logsErr) {
    console.error("❌ download_logs件数取得失敗:", logsErr.message);
  } else {
    console.log(`\n✅ [DB] download_logs テーブル総件数: ${logsCount} 件`);
  }

  // 4. Supabase Storage 実ファイル確認 (sukashi-assets)
  console.log(`\n--- Supabase Storage (${supabaseBucket}) 内ファイルリスト ---`);
  try {
    const { data: files, error: listErr } = await supabase.storage
      .from(supabaseBucket)
      .list("", { limit: 100 });

    if (listErr) {
      console.error("❌ Storage リスト失敗:", listErr.message);
    } else if (files) {
      console.log(`✅ Storage ルート直下のフォルダ/ファイル数: ${files.length} 件`);
      files.forEach(f => {
        console.log(`  - ${f.name} (${f.metadata ? "Folder/File" : "Item"})`);
      });

      // 各フォルダの中身も確認
      for (const folder of files) {
        if (folder.id === undefined || folder.metadata === null) { // フォルダと判定される場合
          const { data: subFiles } = await supabase.storage
            .from(supabaseBucket)
            .list(folder.name, { limit: 100 });
          if (subFiles) {
            console.log(`    📁 フォルダ「${folder.name}」内: ${subFiles.length} 件`);
            subFiles.forEach(sf => {
              console.log(`      - ${folder.name}/${sf.name} (${sf.metadata ? sf.metadata.size : "unknown"} bytes)`);
            });
          }
        }
      }
    }
  } catch (err: any) {
    console.error("❌ Supabase Storage 検証中にエラー:", err.message);
  }
}

async function checkR2() {
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📦 2. Cloudflare R2 実画像存在確認");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (!r2AccountId || !r2AccessKeyId || !r2SecretAccessKey || !r2BucketName) {
    console.log("⚠️  Cloudflare R2 の環境変数が不完全なため、R2のチェックをスキップします。");
    return;
  }

  try {
    const s3 = new S3Client({
      region: "auto",
      endpoint: r2Endpoint || `https://${r2AccountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: r2AccessKeyId,
        secretAccessKey: r2SecretAccessKey,
      },
    });

    const command = new ListObjectsV2Command({
      Bucket: r2BucketName,
      MaxKeys: 100,
    });

    const response = await s3.send(command);
    const contents = response.Contents || [];
    console.log(`✅ [R2] バケット「${r2BucketName}」内の実ファイル数: ${contents.length} 件`);
    contents.forEach((item, idx) => {
      console.log(`  [${idx+1}] Key: ${item.Key} | Size: ${item.Size} bytes | LastModified: ${item.LastModified}`);
    });
  } catch (err: any) {
    console.error("❌ Cloudflare R2 接続・リスト失敗:", err.message);
  }
}

async function run() {
  await checkSupabase();
  await checkR2();
}

run();
