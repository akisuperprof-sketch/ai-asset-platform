const fs = require('fs');
const path = require('path');

const premiumDir = path.join(__dirname, '../public/assets/premium');
const dummyDataPath = path.join(__dirname, '../src/lib/dummy-data.ts');

const files = fs.readdirSync(premiumDir).filter(f => f.endsWith('.png'));

const categoryMap = {
  sushi: { cat: "日本の食", tags: ["寿司", "和食", "高級", "握り寿司"] },
  ramen: { cat: "日本の食", tags: ["ラーメン", "和食", "麺類", "屋台"] },
  onigiri: { cat: "日本の食", tags: ["おにぎり", "和食", "米", "軽食"] },
  matcha: { cat: "日本の食", tags: ["抹茶", "和食", "日本茶", "スイーツ"] },
  torii: { cat: "年中行事・祭り", tags: ["鳥居", "神社", "伝統", "和風"] },
  sakura: { cat: "年中行事・祭り", tags: ["桜", "春", "花見", "ピンク"] },
  japanese_pattern: { cat: "和の伝統素材", tags: ["和柄", "紋様", "伝統", "和風"] },
  maneki_neko: { cat: "和の伝統素材", tags: ["招き猫", "縁起物", "伝統", "商売繁盛"] },
  tempura: { cat: "日本の食", tags: ["天ぷら", "和食", "揚げ物", "高級"] },
  yakitori: { cat: "日本の食", tags: ["焼き鳥", "和食", "おつまみ", "居酒屋"] },
  test_sushi: { cat: "日本の食", tags: ["寿司", "和食"] }
};

let additionalCode = `\n// Generated premium assets\nconst generatedPremiumAssets = [\n`;

files.forEach((f, i) => {
  const base = f.replace('.png', '');
  
  // Find category based on prefix
  let catData = { cat: "日本の食", tags: ["素材"] };
  let titlePrefix = base;
  for (const [key, val] of Object.entries(categoryMap)) {
    if (base.startsWith(key)) {
      catData = val;
      titlePrefix = key.toUpperCase();
      break;
    }
  }

  const id = `premium-gen-${base}-${i}`;
  const title = `極上 ${base.replace(/_/g, ' ')} (背景透過4K)`;
  const desc = `高品質な ${base.replace(/_/g, ' ')} の背景透過PNG画像素材です。解像度4000px以上の高密度ピクセルで、商用利用・Web制作・グラフィックデザインにすぐ使える背景透過切り抜き処理済みデータです。`;

  additionalCode += `  {
    id: "${id}",
    title: "${title}",
    category: "${catData.cat}",
    tags: ${JSON.stringify([...catData.tags, "背景透過", "PNG素材", "商用利用可能"])},
    description: "${desc}",
    imageUrl: "/assets/premium/${f}",
    thumbnailUrl: "/assets/premium/${f}",
    storageKey: "assets/premium/${f}",
    width: 4096,
    height: 4096,
    fileSize: "2.5 MB",
    isAiGenerated: true,
    isCommercialOk: true,
    licenseType: "free",
    reviewStatus: "approved",
    legalStatus: "clean",
    publishedAt: new Date().toISOString()
  },\n`;
});

additionalCode += `];

const mappedGeneratedAssets = generatedPremiumAssets.map((asset) => {
  const quality = computeQualityGate(asset.id, asset.title, asset.category);
  return {
    ...asset,
    ...quality,
    licenseType: asset.licenseType as "free" | "pro" | "cc0",
    reviewStatus: asset.reviewStatus as "pending" | "approved" | "rejected",
    legalStatus: asset.legalStatus as "clean" | "checked" | "risky"
  };
});

dummyAssets.unshift(...mappedGeneratedAssets);
`;

let content = fs.readFileSync(dummyDataPath, 'utf8');

// Also uncomment the existing `dummyAssets.unshift(...first10PremiumAssets);` if it's commented.
content = content.replace('// dummyAssets.unshift(...first10PremiumAssets);', 'dummyAssets.unshift(...first10PremiumAssets);');

content += additionalCode;
fs.writeFileSync(dummyDataPath, content, 'utf8');
console.log("Successfully appended new assets to dummy-data.ts");
