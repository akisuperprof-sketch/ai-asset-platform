import { adminClient } from "../lib/supabase";
import { S3Client, HeadObjectCommand } from "@aws-sdk/client-s3";

/**
  * SUKASHI 日本の食カテゴリー 10件投入スクリプト (安全チェック付き)
  */

const foodAssets = [
  {
    slug: "tonkotsu-ramen-special-001",
    title: "博多豚骨ラーメン（味玉・チャーシュー増し）",
    description: "濃厚な白濁スープが特徴の博多豚骨ラーメン。トッピングまで精密に再現された、背景透過済みの高品質素材です。",
    category: "日本の食",
    tags: ["ラーメン", "和食", "麺類", "豚骨", "ランチ"],
    image_url: "food/tonkotsu-ramen-special-001.png",
    storage_key: "food/tonkotsu-ramen-special-001.png",
    width: 2048, height: 2048, fileSize: "1.8 MB"
  },
  {
    slug: "tempura-moriawase-gold-001",
    title: "海老と季節野菜の天ぷら盛り合わせ",
    description: "サクサクの衣が美しい天ぷらの盛り合わせ。エビ、カボチャ、大葉など、和食デザインに欠かせない一品です。",
    category: "日本の食",
    tags: ["天ぷら", "和食", "エビ", "和食", "高級"],
    image_url: "food/tempura-moriawase-gold-001.png",
    storage_key: "food/tempura-moriawase-gold-001.png",
    width: 2048, height: 2048, fileSize: "2.1 MB"
  },
  {
    slug: "taiyaki-classic-red-bean-001",
    title: "たい焼き（つぶあん・天然物）",
    description: "日本の定番スイーツ、たい焼き。香ばしい焼き色と立体感のある質感が特徴。食べ歩きや和菓子のデザインに。",
    category: "日本の食",
    tags: ["たい焼き", "和菓子", "スイーツ", "日本", "おやつ"],
    image_url: "food/taiyaki-classic-red-bean-001.png",
    storage_key: "food/taiyaki-classic-red-bean-001.png",
    width: 2048, height: 2048, fileSize: "1.1 MB"
  },
  {
    slug: "miso-soup-tofu-wakame-001",
    title: "お味噌汁（豆腐とわかめ）",
    description: "日本の食卓の象徴、お味噌汁。お椀の質感と湯気が立ち上がるような温かみを感じさせる透過素材です。",
    category: "日本の食",
    tags: ["味噌汁", "和食", "家庭料理", "朝食", "スープ"],
    image_url: "food/miso-soup-tofu-wakame-001.png",
    storage_key: "food/miso-soup-tofu-wakame-001.png",
    width: 2048, height: 2048, fileSize: "0.9 MB"
  },
  {
    slug: "matcha-wagashi-set-001",
    title: "抹茶と季節の練り切りセット",
    description: "茶道の世界を表現した抹茶と和菓子のセット。落ち着いた和の雰囲気を演出するデザインパーツです。",
    category: "日本の食",
    tags: ["抹茶", "和菓子", "茶道", "日本文化", "伝統"],
    image_url: "food/matcha-wagashi-set-001.png",
    storage_key: "food/matcha-wagashi-set-001.png",
    width: 2048, height: 2048, fileSize: "1.3 MB"
  },
  {
    slug: "salmon-nigiri-sushi-pair-001",
    title: "サーモン握り寿司（二貫セット）",
    description: "脂の乗ったサーモンの握り寿司。鮮やかな色合いが食欲をそそる、メニュー作成に最適な透過画像です。",
    category: "日本の食",
    tags: ["寿司", "サーモン", "和食", "魚", "新鮮"],
    image_url: "food/salmon-nigiri-sushi-pair-001.png",
    storage_key: "food/salmon-nigiri-sushi-pair-001.png",
    width: 2048, height: 2048, fileSize: "1.4 MB"
  },
  {
    slug: "takoyaki-osaka-style-8pcs-001",
    title: "大阪名物 たこ焼き（8個入り・ソースマヨ）",
    description: "外はカリッと、中はトロッとしたたこ焼き。青のりや削り節までリアルに再現した、B級グルメの王道素材。",
    category: "日本の食",
    tags: ["たこ焼き", "屋台", "大阪", "B級グルメ", "おやつ"],
    image_url: "food/takoyaki-osaka-style-8pcs-001.png",
    storage_key: "food/takoyaki-osaka-style-8pcs-001.png",
    width: 2048, height: 2048, fileSize: "1.9 MB"
  },
  {
    slug: "gyudon-standard-size-001",
    title: "牛丼（並盛り・紅生姜添え）",
    description: "日本のファストフード、牛丼。甘辛く煮た牛肉とタマネギ、彩りの紅生姜がアクセント。日常的な食のデザインに。",
    category: "日本の食",
    tags: ["牛丼", "和食", "肉料理", "どんぶり", "ランチ"],
    image_url: "food/gyudon-standard-size-001.png",
    storage_key: "food/gyudon-standard-size-001.png",
    width: 2048, height: 2048, fileSize: "1.6 MB"
  },
  {
    slug: "unagi-jyu-premium-001",
    title: "特上 うな重（肝吸い付き）",
    description: "ふっくらと焼き上げたうなぎの蒲焼を贅沢に乗せたうな重。タレの艶感と香ばしさが伝わる最高級素材です。",
    category: "日本の食",
    tags: ["うなぎ", "和食", "高級", "スタミナ", "どんぶり"],
    image_url: "food/unagi-jyu-premium-001.png",
    storage_key: "food/unagi-jyu-premium-001.png",
    width: 2048, height: 2048, fileSize: "2.3 MB"
  },
  {
    slug: "yakitori-moriawase-5pcs-001",
    title: "焼き鳥 盛り合わせ（5本・タレと塩）",
    description: "居酒屋の定番、焼き鳥の盛り合わせ。ねぎま、つくね、レバーなど。お酒の席や日本の夜の文化を象徴するパーツ。",
    category: "日本の食",
    tags: ["焼き鳥", "居酒屋", "和食", "肉料理", "おつまみ"],
    image_url: "food/yakitori-moriawase-5pcs-001.png",
    storage_key: "food/yakitori-moriawase-5pcs-001.png",
    width: 2048, height: 2048, fileSize: "1.7 MB"
  }
];

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT || "",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

async function checkFileExists(key: string): Promise<boolean> {
  try {
    const command = new HeadObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });
    await r2Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

async function seedFoodAssets() {
  if (!adminClient || !process.env.R2_ACCESS_KEY_ID) {
    console.error("❌ 環境変数が設定されていません。.env.local を確認してください。");
    return;
  }

  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL || "";
  const missingFiles: string[] = [];
  const validAssets: any[] = [];

  console.log(`🔍 R2上の実ファイル存在チェックを開始します...`);

  for (const asset of foodAssets) {
    const exists = await checkFileExists(asset.storage_key);
    if (exists) {
      validAssets.push({
        ...asset,
        image_url: `${publicBaseUrl}/${asset.image_url}`,
        thumbnail_url: `${publicBaseUrl}/${asset.image_url.replace('.png', '-thumb.webp')}`,
        is_ai_generated: true,
        legal_status: 'clean',
        review_status: 'approved',
        published_at: new Date().toISOString(),
      });
    } else {
      missingFiles.push(asset.storage_key);
    }
  }

  if (missingFiles.length > 0) {
    console.error("❌ 以下のファイルがR2に見つかりません。DB登録を中断します:");
    missingFiles.forEach(f => console.error(`   - ${f}`));
    console.log(`\n💡 ${validAssets.length} 件は準備OKですが、整合性を保つため投入を中止しました。`);
    return;
  }

  console.log(`🚀 「日本の食」カテゴリー ${validAssets.length} 件の登録を開始します...`);

  const { data, error } = await adminClient
    .from("assets")
    .upsert(validAssets, { onConflict: 'slug' })
    .select();

  if (error) {
    console.error("❌ 登録失敗:", error.message);
  } else {
    console.log(`✅ 登録完了！ ${data.length} 件のアセットを投入しました。`);
  }
}

seedFoodAssets();
