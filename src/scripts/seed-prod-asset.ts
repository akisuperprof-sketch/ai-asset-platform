import { adminClient } from "../lib/supabase";

/**
 * SUKASHI 初の実運用アセット登録スクリプト
 * 
 * 実行方法:
 * npx ts-node src/scripts/seed-prod-asset.ts
 */

async function seedFirstAsset() {
  if (!adminClient) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY が設定されていません。");
    return;
  }

  const asset = {
    slug: "onigiri-salted-rice-ball-001",
    title: "塩むすび（三角形・海苔なし）",
    description: "日本の伝統的な塩むすび。シンプルながら米の粒立ちが美しい、AI生成の背景透過素材です。和食のデザインやアイコンに最適です。",
    category: "日本の食",
    tags: ["おにぎり", "和食", "米", "シンプル", "白米"],
    image_url: `${process.env.R2_PUBLIC_BASE_URL}/food/onigiri-salted-rice-ball-001.png`,
    thumbnail_url: `${process.env.R2_PUBLIC_BASE_URL}/food/onigiri-salted-rice-ball-001-thumb.webp`,
    storage_key: "food/onigiri-salted-rice-ball-001.png",
    file_size: "1.2 MB",
    width: 2048,
    height: 2048,
    license_type: "free",
    is_ai_generated: true,
    legal_status: "clean",
    review_status: "approved",
    published_at: new Date().toISOString(),
  };

  console.log("🚀 実運用アセットの登録を開始します...");

  const { data, error } = await adminClient
    .from("assets")
    .upsert(asset, { onConflict: 'slug' })
    .select();

  if (error) {
    console.error("❌ 登録失敗:", error.message);
  } else {
    console.log("✅ 登録成功！");
    console.log("Asset ID:", data[0].id);
    console.log("Title:", data[0].title);
    console.log("Storage Key:", data[0].storage_key);
    console.log("Public URL:", data[0].image_url);
  }
}

seedFirstAsset();
