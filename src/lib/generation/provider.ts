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
        "https://via.placeholder.com/1024x1024.png?text=DRY+RUN+ASSET"
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

// Example Replicate Provider
export class ReplicateProvider implements GenerationProvider {
  name = "REPLICATE";

  async generate(params: GenerationParams): Promise<GenerationResult> {
    if (!process.env.REPLICATE_API_TOKEN) {
      return { success: false, error: "Missing REPLICATE_API_TOKEN", provider: this.name };
    }
    // Implementation placeholder
    return { success: false, error: "Not implemented yet", provider: this.name };
  }
}

// Factory to get the active provider
export function getGenerationProvider(): GenerationProvider {
  // Can be configured via env var, currently hardcoded to DRY_RUN or based on keys
  const targetProvider = process.env.GENERATION_PROVIDER || "DRY_RUN";
  
  switch (targetProvider) {
    case "STABILITY":
      return new StabilityProvider();
    case "REPLICATE":
      return new ReplicateProvider();
    case "DRY_RUN":
    default:
      return new DryRunProvider();
  }
}
