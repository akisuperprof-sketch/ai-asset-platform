const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const dir = 'import-ready/food';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.png'));

async function process() {
  for (const file of files) {
    const filePath = path.join(dir, file);
    console.log(`Processing ${file}...`);
    
    const image = await Jimp.read(filePath);
    
    // Convert to RGBA
    image.rgba(true);
    
    // Simple background removal: if a pixel is nearly white, make it transparent
    // Threshold: 240
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      const g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      if (r > 245 && g > 245 && b > 245) {
        this.bitmap.data[idx + 3] = 0; // Alpha = 0
      }
    });

    await image.writeAsync(filePath);
    console.log(`✅ Saved ${file} with alpha channel.`);
  }
}

process().catch(console.error);
