import fs from 'fs';
import path from 'path';

// カテゴリごとのプロンプトテンプレート
const CATEGORIES = {
  food: [
    "A photorealistic studio shot of {item}, pure white background, soft lighting, 4k resolution, high contrast, perfect for food delivery menu",
    "A clean, commercial photography style shot of Japanese {item}, isolated on white background, sharp focus, 8k"
  ],
  medical: [
    "A clean, modern, minimalist 3d render of {item}, medical context, pure white background, studio lighting",
  ]
};

const TARGET_ITEMS = {
  food: ["Takoyaki", "Matcha Parfait", "Katsudon", "Okonomiyaki", "Tempura Udon"],
  medical: ["Stethoscope", "Syringe", "Pill Bottle", "First Aid Kit"]
};

export async function generatePrompts() {
  console.log("🚀 Generating Prompts...");
  const prompts = [];
  
  for (const [category, items] of Object.entries(TARGET_ITEMS)) {
    const templates = CATEGORIES[category as keyof typeof CATEGORIES];
    for (const item of items) {
      const template = templates[Math.floor(Math.random() * templates.length)];
      const prompt = template.replace("{item}", item);
      prompts.push({ category, item, prompt });
      console.log(`[${category}] ${item} -> ${prompt}`);
    }
  }

  const outputPath = path.join(process.cwd(), 'generation-pipeline', 'generated-prompts.json');
  fs.writeFileSync(outputPath, JSON.stringify(prompts, null, 2));
  console.log(`✅ Saved ${prompts.length} prompts to ${outputPath}`);
}

if (require.main === module) {
  generatePrompts();
}
