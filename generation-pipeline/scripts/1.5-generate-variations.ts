import fs from 'fs';
import path from 'path';

const CATEGORIES_DOMINATION = [
  { keyword: "bento", count: 10, category: "food" },
  { keyword: "mochi", count: 10, category: "food" },
  { keyword: "tempura", count: 10, category: "food" },
  { keyword: "gyoza", count: 10, category: "food" },
];

const SEARCH_INTENT_CLUSTERS = [
  { intent: "standard object", seoTerms: ["transparent-png", "isolated", "japanese-food"] },
  { intent: "top view", seoTerms: ["transparent-png", "isolated", "japanese-food"] },
  { intent: "side view", seoTerms: ["transparent-png", "isolated"] },
  { intent: "floating isolated", seoTerms: ["transparent-png", "isolated", "clipart"] },
  { intent: "sticker style", seoTerms: ["sticker", "transparent-png", "clipart"] },
  { intent: "icon style", seoTerms: ["icon", "transparent-png", "clipart"] },
  { intent: "banner composition", seoTerms: ["banner", "transparent-png"] },
  { intent: "instagram composition", seoTerms: ["transparent-png", "japanese-food"] },
  { intent: "canva presentation style", seoTerms: ["transparent-png", "clipart", "isolated"] },
  { intent: "ad creative style", seoTerms: ["banner", "transparent-png", "japanese-food"] }
];

export function generateVariations() {
  console.log("🚀 Generating Search Intent Domination Variations...");
  const jobs: any[] = [];
  
  for (const item of CATEGORIES_DOMINATION) {
    const relatedGroupId = `grp_${item.keyword.replace(/\s+/g, "_")}_${Date.now()}`;
    
    // For each intent cluster, generate 1 variation
    for (let i = 0; i < SEARCH_INTENT_CLUSTERS.length; i++) {
      const cluster = SEARCH_INTENT_CLUSTERS[i];
      
      const uuidPart = Math.random().toString(36).substring(2, 8);
      // Combine seoTerms into slug naturally
      const slugTerms = [...new Set([item.keyword.replace(/\s+/g, "-"), ...cluster.seoTerms])];
      const seoSlug = `${slugTerms.join("-")}-${uuidPart}`;
      
      jobs.push({
        base_asset_id: `base_${item.keyword.replace(/\s+/g, "_")}`,
        variation_type: `intent_${i+1}`,
        intent: cluster.intent,
        style: cluster.intent, // Legacy field fallback
        parent_category: item.category,
        seo_slug: seoSlug,
        related_group_id: relatedGroupId,
        keyword: item.keyword,
        category: item.category
      });
    }
  }

  const outputPath = path.join(process.cwd(), 'generation-pipeline', 'variation-jobs.json');
  fs.writeFileSync(outputPath, JSON.stringify(jobs, null, 2));
  console.log(`✅ Saved ${jobs.length} variation jobs to ${outputPath}`);
}

// Execute automatically when run via ts-node
generateVariations();

