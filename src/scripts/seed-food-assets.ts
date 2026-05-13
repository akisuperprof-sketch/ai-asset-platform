import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

/**
 * 日本の食カテゴリー 10件投入スクリプト (Supabase Storage対応)
 */

const foodAssets = [
  {
    slug: "onigiri-salted-rice-ball-001",
    title: "塩おにぎり",
    category: "日本の食",
    storage_key: "food/onigiri-salted-rice-ball-001.png",
    tags: ["おにぎり", "和食"],
    legal_status: "clean",
    review_status: "approved",
    published_at: new Date().toISOString(),
  },
  {
    slug: "sushi-tuna-nigiri-001",
    title: "マグロ握り寿司",
    category: "日本の食",
    storage_key: "food/sushi-tuna-nigiri-001.png",
    tags: ["寿司", "マグロ"],
    legal_status: "clean",
    review_status: "approved",
    published_at: new Date().toISOString(),
  },
  {
    slug: "ramen-shoyu-001",
    title: "醤油ラーメン",
    category: "日本の食",
    storage_key: "food/ramen-shoyu-001.png",
    tags: ["ラーメン", "麺類"],
    legal_status: "clean",
    review_status: "approved",
    published_at: new Date().toISOString(),
  },
  {
    slug: "tempura-shrimp-001",
    title: "海老の天ぷら",
    category: "日本の食",
    storage_key: "food/tempura-shrimp-001.png",
    tags: ["天ぷら", "海老"],
    legal_status: "clean",
    review_status: "approved",
    published_at: new Date().toISOString(),
  },
  {
    slug: "takoyaki-6pcs-001",
    title: "たこ焼き (6個入り)",
    category: "日本の食",
    storage_key: "food/takoyaki-6pcs-001.png",
    tags: ["たこ焼き", "屋台"],
    legal_status: "clean",
    review_status: "approved",
    published_at: new Date().toISOString(),
  },
  {
    slug: "soba-zaru-001",
    title: "ざるそば",
    category: "日本の食",
    storage_key: "food/soba-zaru-001.png",
    tags: ["そば", "和食"],
    legal_status: "clean",
    review_status: "approved",
    published_at: new Date().toISOString(),
  },
  {
    slug: "miso-soup-tofu-001",
    title: "豆腐とわかめの味噌汁",
    category: "日本の食",
    storage_key: "food/miso-soup-tofu-001.png",
    tags: ["味噌汁", "和食"],
    legal_status: "clean",
    review_status: "approved",
    published_at: new Date().toISOString(),
  },
  {
    slug: "yakitori-negima-001",
    title: "焼き鳥 (ねぎま)",
    category: "日本の食",
    storage_key: "food/yakitori-negima-001.png",
    tags: ["焼き鳥", "鶏肉"],
    legal_status: "clean",
    review_status: "approved",
    published_at: new Date().toISOString(),
  },
  {
    slug: "matcha-tea-cup-001",
    title: "お抹茶 (茶碗入り)",
    category: "日本の食",
    storage_key: "food/matcha-tea-cup-001.png",
    tags: ["抹茶", "日本茶"],
    legal_status: "clean",
    review_status: "approved",
    published_at: new Date().toISOString(),
  },
  {
    slug: "dango-three-color-001",
    title: "三色団子",
    category: "日本の食",
    storage_key: "food/dango-three-color-001.png",
    tags: ["団子", "和菓子"],
    legal_status: "clean",
    review_status: "approved",
    published_at: new Date().toISOString(),
  },
];

async function seedBulk() {
  console.log(`🚀 「日本の食」カテゴリー ${foodAssets.length}件の投入を開始します...`);

  // 動的インポート
  const { adminClient } = await import("../lib/supabase");
  const { checkFileExists } = await import("../lib/r2");

  if (!adminClient) {
    console.error("❌ adminClient が初期化されていません。");
    return;
  }

  const results = [];
  for (const asset of foodAssets) {
    console.log(`🔍 チェック中: ${asset.storage_key}`);
    const exists = await checkFileExists(asset.storage_key);
    
    if (exists) {
      const { data, error } = await adminClient
        .from("assets")
        .upsert([asset], { onConflict: "slug" })
        .select();
      
      if (!error) {
        console.log(`✅ 登録完了: ${asset.title}`);
        results.push(data[0]);
      } else {
        console.error(`❌ 失敗: ${asset.title}`, error.message);
      }
    } else {
      console.warn(`⚠️  スキップ (ファイルなし): ${asset.storage_key}`);
    }
  }

  console.log(`\n✨ 投入完了: ${results.length}/${foodAssets.length} 件`);
}

seedBulk();
