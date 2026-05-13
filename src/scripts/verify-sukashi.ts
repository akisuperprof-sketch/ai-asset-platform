import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

/**
 * SUKASHI 疎通確認ツール (Supabase Storage対応版)
 */

async function verify() {
  console.log("🔍 SUKASHI 疎通確認を開始します...");

  // 環境変数ロード後の動的インポート
  const { adminClient } = await import("../lib/supabase");
  const { getDownloadUrl, checkFileExists } = await import("../lib/r2");

  // 1. 環境変数チェック
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ エラー: Supabaseの環境変数が設定されていません。.env.local を作成してください。");
    return;
  }

  const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "sukashi-assets";

  // 2. Supabase 接続確認
  console.log("\n--- Supabase DB 接続確認 ---");
  const { data: asset, error: dbError } = await adminClient!
    .from("assets")
    .select("*")
    .eq("slug", "onigiri-salted-rice-ball-001")
    .single();

  if (dbError) {
    console.error("❌ DB接続またはアセット取得に失敗:", dbError.message);
    console.log("   (先に seed-prod-asset.ts を実行する必要があるかもしれません)");
  } else {
    console.log("✅ DB接続成功");
    console.log(`✅ アセット発見: ${asset.title} (Status: ${asset.review_status})`);
  }

  // 3. Storage 接続確認
  console.log(`\n--- Supabase Storage (${bucketName}) 接続確認 ---`);
  try {
    const storageKey = asset?.storage_key || "food/onigiri-salted-rice-ball-001.png";
    const exists = await checkFileExists(storageKey);
    
    if (exists) {
      console.log(`✅ Storage実ファイル確認成功: ${storageKey}`);
    } else {
      console.warn(`❌ Storageファイルが見つかりません: ${storageKey}`);
      console.log(`   (Supabase Storage のバケット「${bucketName}」内にファイルを配置してください)`);
    }
  } catch (err: any) {
    console.error("❌ Storage接続確認中にエラー:", err.message);
  }

  // 4. ダウンロードURL生成テスト
  console.log("\n--- 署名付きダウンロードURL生成テスト ---");
  try {
    const testKey = asset?.storage_key || "food/onigiri-salted-rice-ball-001.png";
    const url = await getDownloadUrl(testKey);
    console.log("✅ 署名付きURL生成成功");
    console.log(`🔗 テストURL (有効期限内): ${url.substring(0, 100)}...`);
  } catch (err: any) {
    console.error("❌ URL生成失敗:", err.message);
  }

  console.log("\n--- 確認完了 ---");
}

verify();
