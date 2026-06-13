import { CATEGORY_INTENTS, CategoryIntent } from './category_intents';

export interface GeneratedIntent {
  slug: string; // The SEO slug / keyword
  prompt: string;
  category: string;
  metadata: {
    angle: string;
    style: string;
    usage: string;
    objectVariation: string;
    relatedGroupId: string; // Used to link similar intents together
  };
}

/**
 * Randomly pick an item from an array
 */
function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generates an intent combination for a specific category
 */
export function generateIntent(categoryName: string): GeneratedIntent | null {
  const intentData = CATEGORY_INTENTS.find(c => c.category === categoryName);
  if (!intentData) return null;

  const angle = pickRandom(intentData.angles);
  const style = pickRandom(intentData.styles);
  const usage = pickRandom(intentData.usages);
  const objectVariation = pickRandom(intentData.objectVariations);

  // Group by object variation to form related clusters
  const relatedGroupId = `intent-${categoryName}-${objectVariation.replace(/\s+/g, '-')}`;

  // Form the search keyword (SEO slug)
  const slug = `${objectVariation} ${categoryName} ${style} ${angle}`.trim();

  // Form the generation prompt (optimizing for transparent PNGs and quality)
  let prompt = `${objectVariation} ${categoryName}, ${style} style, ${angle}, high quality, clear subject.`;
  if (usage.includes('transparent')) {
    prompt += ` isolated on solid white background, clean edges, perfect for clipping.`;
  }
  
  if (style === 'clipart' || style === 'icon' || style === 'flat design') {
    prompt += ` vector art style, flat colors, no shadows on background.`;
  } else if (style === 'realistic' || style === '3d render') {
    prompt += ` highly detailed, photorealistic, cinematic lighting.`;
  }

  return {
    slug,
    prompt,
    category: categoryName,
    metadata: {
      angle,
      style,
      usage,
      objectVariation,
      relatedGroupId
    }
  };
}

/**
 * Generates N unique intents for a given category
 */
export function generateIntentsBatch(categoryName: string, count: number): GeneratedIntent[] {
  const results: GeneratedIntent[] = [];
  const seenSlugs = new Set<string>();
  const MAX_ATTEMPTS = count * 10;
  let attempts = 0;

  while (results.length < count && attempts < MAX_ATTEMPTS) {
    attempts++;
    const intent = generateIntent(categoryName);
    if (intent && !seenSlugs.has(intent.slug)) {
      seenSlugs.add(intent.slug);
      results.push(intent);
    }
  }

  return results;
}
