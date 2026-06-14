import Replicate from "replicate";

/**
 * Removes the background from an image.
 * Attempts to use Replicate's BiRefNet (zhengpeng7/birefnet) if REPLICATE_API_TOKEN is available.
 * Falls back to @imgly/background-removal-node for local, token-less execution.
 */
export async function removeBackgroundBiRefNet(imageBuffer: Buffer, mimeType: string = 'image/png'): Promise<{ buffer: Buffer, provider: string }> {
  const replicateToken = process.env.REPLICATE_API_TOKEN;

  if (replicateToken) {
    try {
      console.log("[BiRefNet] Using Replicate (zhengpeng7/birefnet) for background removal...");
      const replicate = new Replicate({ auth: replicateToken });
      
      const base64Data = imageBuffer.toString('base64');
      const dataUri = `data:${mimeType};base64,${base64Data}`;

      const output = await replicate.run(
        "zhengpeng7/birefnet:ca212726ee82386121f158cdccafcd766db2cc9ca4046101c56cb3c68b753a47",
        {
          input: {
            image: dataUri
          }
        }
      );

      // output is usually a URL string to the processed image
      if (typeof output === 'string') {
        const res = await fetch(output);
        if (!res.ok) throw new Error(`Replicate output fetch failed: ${res.statusText}`);
        const arrayBuffer = await res.arrayBuffer();
        return { buffer: Buffer.from(arrayBuffer), provider: 'replicate-birefnet' };
      } else if (output && typeof (output as any).url === 'function') {
        const url = (output as any).url();
        const res = await fetch(url);
        const arrayBuffer = await res.arrayBuffer();
        return { buffer: Buffer.from(arrayBuffer), provider: 'replicate-birefnet' };
      } else {
        throw new Error("Unexpected Replicate output format.");
      }
    } catch (err: any) {
      console.warn(`[BiRefNet] Replicate failed, falling back to local @imgly. Error: ${err.message}`);
      // Fallthrough to imgly
    }
  } else {
    console.log("[BiRefNet] REPLICATE_API_TOKEN not found. Using local @imgly fallback.");
  }

  // Fallback to local @imgly/background-removal-node
  console.log("[BiRefNet] Running local @imgly background removal...");
  try {
    const { removeBackground } = await import("@imgly/background-removal-node");
    const blob = new Blob([new Uint8Array(imageBuffer)], { type: mimeType });
    const resultBlob = await removeBackground(blob);
    const arrayBuffer = await resultBlob.arrayBuffer();
    return { buffer: Buffer.from(arrayBuffer), provider: 'imgly-local' };
  } catch (err: any) {
    console.error("[BiRefNet] Local @imgly fallback failed (likely Vercel native module issue):", err);
    throw new Error(`Background removal completely failed: ${err.message}`);
  }
}
