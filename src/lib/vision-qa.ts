import sharp from 'sharp';
import { GoogleGenAI, Type } from '@google/genai';

export interface QAResult {
  visionScore: number;
  commercialScore: number;
  seoScore: number;
  qualityFlags: string[];
  lowQualityReason: string;
}

/**
 * Runs basic vision QA using sharp to detect single colors, transparency issues, etc.
 */
async function runBasicQA(imageBuffer: Buffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const stats = await sharp(imageBuffer).stats();

    // Sharp stats provides standard deviation per channel
    // Low stdDev in RGB channels usually indicates a very "flat" or single-color image
    const stdDevs = stats.channels.map(c => c.stdev);
    const avgStdDev = stdDevs.slice(0, 3).reduce((a, b) => a + b, 0) / 3;

    // A typical photo has avgStdDev > 40. Simple shapes often have < 20.
    const isPotentiallyMonochrome = avgStdDev < 25;

    // Check transparency edge cases by resizing and looking at the alpha channel standard deviation
    let hasAlpha = metadata.hasAlpha;
    let alphaStdDev = stats.channels.length > 3 ? stats.channels[3].stdev : 0;
    
    // If alpha stdev is extremely high or extremely low, it might be a weird cutout
    // We'll leave the complex judgment to Gemini, but collect basic heuristics
    
    return {
      avgStdDev,
      isPotentiallyMonochrome,
      hasAlpha,
      alphaStdDev,
      width: metadata.width,
      height: metadata.height,
    };
  } catch (error) {
    console.error("Basic QA Error:", error);
    return null;
  }
}

/**
 * Runs Commercial and Semantic QA using Gemini Vision
 */
async function runCommercialQA(imageBuffer: Buffer, mimeType: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
  You are an expert Chief Quality Auditor for a premium Stock Photo and UI Asset marketplace (like Adobe Stock or Canva).
  Your job is to rigorously evaluate this AI-generated transparent PNG asset.
  
  Please analyze the image and score it strictly out of 100 on three dimensions:
  1. visionScore (0-100): Visual quality. Deduct points heavily for: single-color shapes (circles, stars, flat vectors), blurred edges, weird AI distortions, white-fringes on transparent edges.
  2. commercialScore (0-100): Utility for designers. Deduct points heavily if: the object is unidentifiable, the use-case is unknown, or it looks "cheap". A simple plain yellow star or red circle is NOT commercially viable (score < 20).
  3. seoScore (0-100): Search value. Is this something people would search for and use? 

  Also, identify any "qualityFlags" (e.g., "単色率高", "図形疑い", "用途不明", "白フチ", "AI崩れ").
  If the image is poor quality, provide a concise "lowQualityReason" in Japanese.

  For example:
  - If it's a simple solid color circle or star: visionScore < 30, commercialScore < 20, flags: ["単色率高", "図形疑い", "用途不明"].
  - If it's a well-rendered ramen bowl with clean transparency: visionScore > 80, commercialScore > 85, flags: [].
  `;

  // Provide the image buffer to Gemini
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash', // Using latest lightweight multimodal model
    contents: [
      { text: prompt },
      { inlineData: { data: imageBuffer.toString("base64"), mimeType } }
    ],
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          visionScore: { type: Type.INTEGER, description: "Vision quality score 0-100" },
          commercialScore: { type: Type.INTEGER, description: "Commercial utility score 0-100" },
          seoScore: { type: Type.INTEGER, description: "SEO and search demand score 0-100" },
          qualityFlags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Array of Japanese flags" },
          lowQualityReason: { type: Type.STRING, description: "Reason for low quality in Japanese, or empty if OK" },
        },
        required: ["visionScore", "commercialScore", "seoScore", "qualityFlags", "lowQualityReason"]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini API returned empty response");
  }

  return JSON.parse(text) as QAResult;
}

/**
 * Main export: Audits an image URL and returns the QA Result
 */
export async function runVisionQA(imageUrl: string): Promise<QAResult> {
  try {
    console.log(`[QA] Fetching image from: ${imageUrl}`);
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
    
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = res.headers.get('content-type') || 'image/png';

    // Phase 1: Basic Heuristics (sharp)
    console.log(`[QA] Running Basic QA with Sharp...`);
    const basicInfo = await runBasicQA(buffer);

    // Phase 2: Commercial QA (Gemini Vision)
    console.log(`[QA] Running Commercial QA with Gemini...`);
    const qaResult = await runCommercialQA(buffer, mimeType);

    // Merge heuristics if necessary
    if (basicInfo && basicInfo.isPotentiallyMonochrome) {
      if (!qaResult.qualityFlags.includes("単色率高")) {
        qaResult.qualityFlags.push("単色率高");
      }
      // Severely penalize simple shapes mathematically as a fallback
      qaResult.visionScore = Math.min(qaResult.visionScore, 40);
      qaResult.commercialScore = Math.min(qaResult.commercialScore, 30);
      qaResult.lowQualityReason = qaResult.lowQualityReason || "単色・単純図形の疑いが強いため自動減点しました";
    }

    return qaResult;
  } catch (error) {
    console.error("[QA] Vision QA Failed:", error);
    // Return a safe fallback if the API fails
    return {
      visionScore: 0,
      commercialScore: 0,
      seoScore: 0,
      qualityFlags: ["QA ERROR"],
      lowQualityReason: "AI監査システムへの接続に失敗しました"
    };
  }
}
