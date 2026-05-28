import { GoogleGenAI, Type } from '@google/genai';

const S_CATEGORIES = [
  'ramen', 'sushi', 'yakitori', 'tempura', 'takoyaki', 
  'matcha', 'onigiri', 'torii gate', 'maneki neko', 
  'mount fuji', 'sakura', 'japanese pattern'
];

const PREMIUM_MODIFIERS = [
  "transparent PNG",
  "isolated object",
  "commercial stock asset",
  "Adobe Stock quality",
  "Canva-ready",
  "Pinterest-friendly",
  "studio lighting",
  "clean edges",
  "no background",
  "no white fringe",
  "high detail",
  "useful for poster, SNS, YouTube, presentation, web"
];

const NEGATIVE_PROMPT = [
  "abstract shape",
  "flat icon",
  "simple circle",
  "simple star",
  "low quality",
  "blur",
  "white background",
  "text",
  "logo",
  "watermark",
  "messy edges",
  "AI artifacts"
].join(", ");

export interface PromptGenerationResult {
  keyword: string;
  category: string;
  prompt: string;
  negativePrompt: string;
}

export class PromptEngine {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  }

  /**
   * Generates a batch of high-quality image generation prompts using Gemini
   * @param count Number of prompts to generate
   */
  async generatePrompts(count: number): Promise<PromptGenerationResult[]> {
    if (!process.env.GEMINI_API_KEY) {
      console.warn("GEMINI_API_KEY is not set. Generating fallback mock prompts.");
      return this.generateMockPrompts(count);
    }

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are an expert AI prompt engineer for a premium stock asset platform.
Generate exactly ${count} unique prompts for generating transparent PNG objects.

Must strictly use ONLY these categories (the subject must belong to one of these):
${S_CATEGORIES.join(", ")}

Guidelines:
- Each item must be an isolated object, perfect for Canva/Adobe Stock.
- No backgrounds.
- Provide a concise but highly descriptive prompt (under 40 words).
- Provide a simple keyword (1-3 words) to identify the asset.`,
        config: {
          temperature: 0.8,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                keyword: {
                  type: Type.STRING,
                  description: "A short 1-3 word identifier for the asset (e.g. 'spicy miso ramen')"
                },
                category: {
                  type: Type.STRING,
                  description: "Must be exactly one of the provided S_CATEGORIES"
                },
                description: {
                  type: Type.STRING,
                  description: "The core descriptive prompt detailing the visual appearance, styling, and lighting"
                }
              },
              required: ["keyword", "category", "description"]
            }
          }
        }
      });

      if (!response.text) {
        throw new Error("Empty response from Gemini");
      }

      const results = JSON.parse(response.text) as Array<{keyword: string, category: string, description: string}>;
      
      return results.map(r => {
        // Enforce S_CATEGORIES
        const safeCategory = S_CATEGORIES.includes(r.category) ? r.category : S_CATEGORIES[Math.floor(Math.random() * S_CATEGORIES.length)];
        
        return {
          keyword: r.keyword,
          category: safeCategory,
          prompt: `${r.description}, ${PREMIUM_MODIFIERS.join(", ")}`,
          negativePrompt: NEGATIVE_PROMPT
        };
      });
      
    } catch (e: any) {
      console.error("Failed to generate prompts via Gemini:", e.message);
      console.warn("Falling back to mock prompts.");
      return this.generateMockPrompts(count);
    }
  }

  private generateMockPrompts(count: number): PromptGenerationResult[] {
    const results: PromptGenerationResult[] = [];
    for (let i = 0; i < count; i++) {
      const cat = S_CATEGORIES[i % S_CATEGORIES.length];
      results.push({
        keyword: `Mock ${cat} ${i}`,
        category: cat,
        prompt: `A beautiful ${cat}, highly detailed, ${PREMIUM_MODIFIERS.join(", ")}`,
        negativePrompt: NEGATIVE_PROMPT
      });
    }
    return results;
  }
}
