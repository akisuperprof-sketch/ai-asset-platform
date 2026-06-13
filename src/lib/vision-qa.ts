import sharp from 'sharp';
import { GoogleGenAI, Type } from '@google/genai';

export interface QAResult {
  visionScore: number;
  commercialScore: number;
  seoScore: number;
  transparencyScore: number;
  subjectClarityScore: number;
  canvaScore: number;
  pinterestScore: number;
  aiArtifactScore: number;
  compositionScore: number;
  adobeStockScore: number;
  thumbnailScore: number;
  riskLevel: string;
  qaRecommendedAction: "approve" | "pending" | "reject";
  qaReasons: string[];
  // Stage 3 specific metrics
  background_removed?: boolean;
  has_alpha?: boolean;
  alpha_ratio?: number;
  cutout_quality_score?: number;
}

/**
 * Runs basic vision QA using sharp to detect single colors, transparency issues, etc.
 */
async function runBasicQA(imageBuffer: Buffer) {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    const stats = await sharp(imageBuffer).stats();

    // Sharp stats provides standard deviation per channel
    const stdDevs = stats.channels.map(c => c.stdev);
    const avgStdDev = stdDevs.slice(0, 3).reduce((a, b) => a + b, 0) / 3;

    // A typical photo has avgStdDev > 40. Simple shapes often have < 20.
    const isPotentiallyMonochrome = avgStdDev < 25;

    let hasAlpha = metadata.hasAlpha || false;
    let alphaStdDev = stats.channels.length > 3 ? stats.channels[3].stdev : 0;
    let alphaMean = stats.channels.length > 3 ? stats.channels[3].mean : 255;
    const isSolidOpaque = !hasAlpha || alphaMean === 255;

    // Accurately calculate alpha ratio
    let alpha_ratio = 0;
    if (hasAlpha) {
      const { data, info } = await sharp(imageBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      let transparentPixelCount = 0;
      const totalPixels = info.width * info.height;
      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 250) { // consider anything not fully opaque as part of the cutout background/soft edge
          transparentPixelCount++;
        }
      }
      alpha_ratio = transparentPixelCount / totalPixels;
    }

    return {
      avgStdDev,
      isPotentiallyMonochrome,
      hasAlpha,
      alphaStdDev,
      isSolidOpaque,
      alpha_ratio,
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
async function runCommercialQA(imageBuffer: Buffer, mimeType: string): Promise<QAResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
  You are an expert Chief Quality Auditor for a premium transparent PNG asset platform.
  Your job is to evaluate this AI-generated transparent PNG asset for COMMERCIAL VIABILITY.
  
  Please analyze the image and score it out of 100 on the following dimensions:
  1. commercial_score (0-100): Commercial utility for designers.
  2. transparency_score (0-100): Edge quality and cutout accuracy.
  3. subject_clarity (0-100): Is the main subject clearly identifiable?
  4. canva_score (0-100): Drag-and-drop usefulness in Canva.
  5. pinterest_score (0-100): Pinterest CTR appeal.
  6. ai_artifact_score (0-100): Obvious AI artifacts (0 = perfect, 100 = melted/broken).
  7. composition_score (0-100): Quality of framing.
  8. thumbnail_score (0-100): SEO thumbnail strength.
  9. cutout_quality_score (0-100): Focus strictly on edge artifacts, halo effects, and preservation of the subject's edges.
  
  Also provide:
  - risk_level: "low", "medium", or "high".
  - recommended_action: "approve", "pending", or "reject". 
    - Rule A: If vision_score (average of commercial, canva, composition) >= 80, MUST return "approve" (commercial_pass).
    - Rule B: If vision_score is 50 to 79, MUST return "pending" (manual_review).
    - Rule C: If vision_score <= 49 or ai_artifact_score > 80, MUST return "reject".
  - reasons: Array of strings in Japanese explaining the evaluation.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
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
          commercial_score: { type: Type.INTEGER },
          transparency_score: { type: Type.INTEGER },
          subject_clarity: { type: Type.INTEGER },
          canva_score: { type: Type.INTEGER },
          pinterest_score: { type: Type.INTEGER },
          ai_artifact_score: { type: Type.INTEGER },
          composition_score: { type: Type.INTEGER },
          thumbnail_score: { type: Type.INTEGER },
          cutout_quality_score: { type: Type.INTEGER },
          risk_level: { type: Type.STRING },
          recommended_action: { type: Type.STRING },
          reasons: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: [
          "commercial_score", "transparency_score", "subject_clarity", "canva_score", "pinterest_score",
          "ai_artifact_score", "composition_score", "thumbnail_score", "cutout_quality_score",
          "risk_level", "recommended_action", "reasons"
        ]
      }
    }
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini API returned empty response");
  }

  const raw = JSON.parse(text);
  const visionScore = Math.floor((raw.commercial_score + raw.canva_score + raw.composition_score) / 3);
  
  return {
    visionScore: visionScore,
    commercialScore: raw.commercial_score,
    seoScore: Math.floor((raw.pinterest_score + raw.thumbnail_score) / 2),
    transparencyScore: raw.transparency_score,
    subjectClarityScore: raw.subject_clarity,
    canvaScore: raw.canva_score,
    pinterestScore: raw.pinterest_score,
    aiArtifactScore: raw.ai_artifact_score,
    compositionScore: raw.composition_score,
    adobeStockScore: 0,
    thumbnailScore: raw.thumbnail_score,
    cutout_quality_score: raw.cutout_quality_score,
    riskLevel: raw.risk_level,
    qaRecommendedAction: raw.recommended_action as any,
    qaReasons: raw.reasons
  };
}

/**
 * Main export: Audits an image URL and returns the QA Result
 */
export async function runVisionQA(imageUrl: string, allowOpaque: boolean = false): Promise<QAResult> {
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
    if (basicInfo) {
      qaResult.has_alpha = basicInfo.hasAlpha;
      qaResult.alpha_ratio = basicInfo.alpha_ratio;
      
      if (basicInfo.isPotentiallyMonochrome) {
        qaResult.qaReasons.push("単色・単純図形の疑いが強い（自動解析）");
        // Severely penalize simple shapes mathematically as a fallback
        qaResult.visionScore = Math.min(qaResult.visionScore, 40);
        qaResult.commercialScore = Math.min(qaResult.commercialScore, 30);
        qaResult.canvaScore = Math.min(qaResult.canvaScore, 20);
        qaResult.adobeStockScore = Math.min(qaResult.adobeStockScore, 20);
        qaResult.qaRecommendedAction = "pending";
      }

      if (!allowOpaque && basicInfo.isSolidOpaque) {
        qaResult.qaReasons.push("アルファチャンネルがない、または背景が白・単色で不透過です");
        qaResult.transparencyScore = 0;
        qaResult.riskLevel = "high";
        qaResult.qaRecommendedAction = "reject";
      }
    }

    return qaResult;
  } catch (error) {
    console.error("[QA] Vision QA Failed:", error);
    // Return a safe fallback if the API fails
    return {
      visionScore: 0,
      commercialScore: 0,
      seoScore: 0,
      transparencyScore: 0,
      subjectClarityScore: 0,
      canvaScore: 0,
      pinterestScore: 0,
      aiArtifactScore: 100, // max artifacts on error to force safety
      compositionScore: 0,
      adobeStockScore: 0,
      thumbnailScore: 0,
      riskLevel: "high",
      qaRecommendedAction: "reject",
      qaReasons: ["AI監査システムへの接続に失敗しました"]
    };
  }
}
