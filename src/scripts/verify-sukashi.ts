import { adminClient } from "../lib/supabase";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getDownloadUrl } from "../lib/r2";

/**
 * SUKASHI 疎通確認ツール (CLI版)
 * 
 * 実行方法:
 * npx ts-node src/scripts/verify-sukashi.ts
 */

async function verify() {
  console.log("🔍 SUKASHI 疎通確認を開始します...");

  // 1. .env.local チェック
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ エラー: Supabaseの環境変数が設定されていません。.env.local を作成してください。");
    return;
  }

  // 2. Supabase 接続確認
  console.log("\n--- Supabase 接続確認 ---");
  const { data: asset, error: dbError } = await adminClient!
    .from("assets")
    .select("*")
    .eq("slug", "onigiri-salted-rice-ball-001")
    .single();

  if (dbError) {
    console.error("❌ DB接続またはアセット取得に失敗:", dbError.message);
  } else {
    console.log("✅ DB接続成功");
    console.log(`✅ アセット発見: ${asset.title} (Status: ${asset.review_status})`);
  }

  // 3. R2 接続確認
  console.log("\n--- Cloudflare R2 接続確認 ---");
  const r2Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT || "",
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
    },
  });

  try {
    if (asset?.storage_key) {
      const headCommand = new HeadObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: asset.storage_key,
      });
      await r2Client.send(headCommand);
      console.log(`✅ R2実ファイル確認成功: ${asset.storage_key}`);
    } else {
      console.log("⚠️ アセット情報がないためR2ファイル確認をスキップします。");
    }
  } catch (err: any) {
    console.error("❌ R2ファイル確認失敗:", err.message);
    if (err.name === "NotFound") {
      console.error("   -> 指定された storage_key がバケット内に見つかりません。");
    }
  }

  // 4. ダウンロードURL生成テスト
  console.log("\n--- ダウンロードURL生成テスト ---");
  try {
    if (asset?.storage_key) {
      const url = await getDownloadUrl(asset.storage_key);
      console.log("✅ 署名付きURL生成成功");
      console.log(`🔗 テストURL (有効期限内): ${url.substring(0, 100)}...`);
    }
  } catch (err: any) {
    console.error("❌ URL生成失敗:", err.message);
  }

  console.log("\n--- 確認完了 ---");
}

verify();
