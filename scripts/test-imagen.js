const { GoogleGenAI } = require('@google/genai');
require('dotenv').config({ path: '.env.local' });

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("No GEMINI_API_KEY found");
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey });
  
  console.log("Testing Google Imagen API...");
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: 'a cute cat',
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/png',
            aspectRatio: '1:1',
        },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      console.log("SUCCESS! Imagen API is back online.");
    } else {
      console.log("FAILED. No images returned.");
    }
  } catch (error) {
    console.error("API ERROR:", error.message);
    if (error.status) {
      console.error("Status:", error.status);
    }
  }
}

main();
