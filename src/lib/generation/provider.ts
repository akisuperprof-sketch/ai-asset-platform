export interface GenerationParams {
  prompt: string;
  negativePrompt: string;
  width?: number;
  height?: number;
  numOutputs?: number;
}

export interface GenerationResult {
  success: boolean;
  imageUrls?: string[];
  error?: string;
  provider: string;
}

export interface GenerationProvider {
  name: string;
  generate(params: GenerationParams): Promise<GenerationResult>;
}

// Dry Run / Mock Provider
export class DryRunProvider implements GenerationProvider {
  name = "DRY_RUN";

  async generate(params: GenerationParams): Promise<GenerationResult> {
    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    // Return a dummy image URL (e.g. transparent pixel or placeholder)
    return {
      success: true,
      imageUrls: [
        "https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png"
      ],
      provider: this.name,
    };
  }
}

// Example Stability API Provider (To be fully implemented when API key is available)
export class StabilityProvider implements GenerationProvider {
  name = "STABILITY";

  async generate(params: GenerationParams): Promise<GenerationResult> {
    if (!process.env.STABILITY_API_KEY) {
      return { success: false, error: "Missing STABILITY_API_KEY", provider: this.name };
    }
    // Implementation placeholder
    return { success: false, error: "Not implemented yet", provider: this.name };
  }
}

import Replicate from "replicate";
import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";

// Example Replicate Provider (Deprecated)
/** @deprecated Replicate is no longer the primary provider. */
export class ReplicateProvider implements GenerationProvider {
  name = "REPLICATE";

  async generate(params: GenerationParams): Promise<GenerationResult> {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken) {
      return { success: false, error: "Missing REPLICATE_API_TOKEN", provider: this.name };
    }
    
    try {
      const replicate = new Replicate({
        auth: apiToken,
      });

      const model = "black-forest-labs/flux-schnell";
      const input = {
        prompt: params.prompt,
        num_outputs: params.numOutputs || 1,
        output_format: "png",
        output_quality: 100,
        aspect_ratio: "1:1"
      };

      const output = await replicate.run(model, { input }) as unknown as any;
      const imageUrls: string[] = [];
      if (Array.isArray(output)) {
        for (const item of output) {
          if (typeof item === 'string') imageUrls.push(item);
          else if (item && typeof item.url === 'function') imageUrls.push(item.url());
        }
      } else if (typeof output === 'string') {
        imageUrls.push(output);
      } else if (output && typeof output.url === 'function') {
        imageUrls.push(output.url());
      }

      if (imageUrls.length === 0) return { success: false, error: "No images returned", provider: this.name };
      return { success: true, imageUrls, provider: this.name };
    } catch (error: any) {
      return { success: false, error: error.message || "Failed to generate image", provider: this.name };
    }
  }
}

// Google Nano Banana Provider (Gemini API / Imagen 3)
export class GoogleNanoBananaProvider implements GenerationProvider {
  name = "GOOGLE_NANO_BANANA";

  async generate(params: GenerationParams): Promise<GenerationResult> {
    const apiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "Missing GOOGLE_API_KEY", provider: this.name };
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const model = process.env.GOOGLE_IMAGE_MODEL || 'imagen-4.0-generate-001';
      
      const response = await ai.models.generateImages({
        model: model,
        prompt: params.prompt,
        config: {
          numberOfImages: params.numOutputs || 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1'
        }
      });

      const imageUrls: string[] = [];
      if (response.generatedImages && response.generatedImages.length > 0) {
        for (const generatedImage of response.generatedImages) {
          if (generatedImage.image && generatedImage.image.imageBytes) {
            // Convert to data URI for internal fetch usage
            const dataUri = `data:image/png;base64,${generatedImage.image.imageBytes}`;
            imageUrls.push(dataUri);
          }
        }
      }

      if (imageUrls.length === 0) {
        return { success: false, error: "No images returned from Google API", provider: this.name };
      }

      return { success: true, imageUrls, provider: this.name };
    } catch (error: any) {
      console.error("Google API Error:", error);
      return { success: false, error: error.message || "Failed to generate image via Google", provider: this.name };
    }
  }
}

// OpenAI Provider (DALL-E 3)
export class OpenAIProvider implements GenerationProvider {
  name = "OPENAI_IMAGE";

  async generate(params: GenerationParams): Promise<GenerationResult> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return { success: false, error: "Missing OPENAI_API_KEY", provider: this.name };
    }

    try {
      const openai = new OpenAI({ apiKey });
      const response = await openai.images.generate({
        model: "dall-e-3",
        prompt: params.prompt,
        n: 1, // DALL-E 3 only supports n=1
        size: "1024x1024",
        response_format: "b64_json",
      });

      const imageUrls: string[] = [];
      if (response.data && response.data.length > 0) {
        for (const item of response.data) {
          if (item.b64_json) {
            const dataUri = `data:image/png;base64,${item.b64_json}`;
            imageUrls.push(dataUri);
          }
        }
      }

      if (imageUrls.length === 0) {
        return { success: false, error: "No images returned from OpenAI", provider: this.name };
      }

      return { success: true, imageUrls, provider: this.name };
    } catch (error: any) {
      console.error("OpenAI API Error:", error);
      return { success: false, error: error.message || "Failed to generate image via OpenAI", provider: this.name };
    }
  }
}

// Factory to get the active provider
export function getGenerationProvider(): GenerationProvider {
  const targetProvider = process.env.GENERATION_PROVIDER || "DRY_RUN";
  
  switch (targetProvider) {
    case "GOOGLE_NANO_BANANA":
      return new GoogleNanoBananaProvider();
    case "OPENAI_IMAGE":
      return new OpenAIProvider();
    case "STABILITY":
      return new StabilityProvider();
    case "REPLICATE":
      return new ReplicateProvider();
    case "DRY_RUN":
    default:
      return new DryRunProvider();
  }
}
