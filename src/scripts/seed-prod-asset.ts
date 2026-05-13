import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

/**
 * SUKASHI 本番用テストアセット (おにぎり) 投入スクリプト
 * 
 * 実行方法:
 * npx tsx src/scripts/seed-prod-asset.ts
 */

const testAsset = {
  slug: "onigiri-salted-rice-ball-001",
  title: "塩おにぎり (背景透過)",
  description: "日本の伝統的なシンプルな塩おにぎり。AI生成による高品質な背景透過素材。",
  category: "日本の食",
  tags: ["おにぎり", "和食", "軽食", "白米"],
  image_url: "", // Storageパスから自動生成されるため空でもOK
  thumbnail_url: "", 
  storage_key: "food/onigiri-salted-rice-ball-001.png",
  file_size: "1.2MB",
  width: 2048,
  height: 2048,
  license_type: "free",
  legal_status: "clean",
  review_status: "approved",
  published_at: new Date().toISOString(),
};

async function seed() {
  console.log("🚀 SUKASHI 本番テストデータの投入を開始します...");
  
  // 動的インポート
  const { adminClient } = await import("../lib/supabase");
  const { checkFileExists } = await import("../lib/r2");

  // 1. ファイル存在確認 (Supabase Storage または R2)
  console.log(`🔍 ストレージ内のファイルを確認中: ${testAsset.storage_key}...`);
  const exists = await checkFileExists(testAsset.storage_key);

  if (!exists) {
    console.error(`❌ エラー: ストレージにファイルが見つかりません。`);
    console.log(`   (Supabase Storage のバケットに 「${testAsset.storage_key}」 をアップロードしてから実行してください)`);
    return;
  }
  console.log("✅ ファイル存在確認 OK");

  // 2. DB 登録
  console.log("📝 データベースに登録中...");
  if (!adminClient) {
    console.error("❌ adminClient が初期化されていません。環境変数を確認してください。");
    return;
  }

  const { data, error } = await adminClient
    .from("assets")
    .upsert([testAsset], { onConflict: "slug" })
    .select();

  if (error) {
    console.error("❌ 登録失敗:", error.message);
  } else {
    console.log("✨ 登録成功!");
    console.log("ID:", data[0].id);
  }
}

seed();
