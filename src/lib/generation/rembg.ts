import { removeBackground } from '@imgly/background-removal-node';

export async function processRembg(imageBuffer: Buffer): Promise<Buffer> {
  try {
    const blob = await removeBackground(imageBuffer);
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (error: any) {
    console.error('Rembg Error:', error);
    throw new Error(`Background removal failed: ${error.message}`);
  }
}
