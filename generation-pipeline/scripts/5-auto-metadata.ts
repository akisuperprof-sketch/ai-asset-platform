import fs from 'fs';
import path from 'path';

export function generateMetadata() {
  console.log("🚀 Generating Metadata...");
  const reviewDir = path.join(process.cwd(), 'generated-assets', '_review');
  
  if (!fs.existsSync(reviewDir)) return;

  const files = fs.readdirSync(reviewDir).filter(f => f.endsWith('.png'));
  const metadataList = [];
  
  for (const file of files) {
    const parts = file.replace('.png', '').split('-');
    const category = parts[0];
    const name = parts.slice(1, -1).join(' '); // remove category and ID
    
    const title = `${name} (AI Generated)`;
    const description = `商用利用可能な高品質な${title}の透過PNG素材です。`;
    const tags = [category, name.split(' ')[0], "透過PNG", "商用利用OK"];
    
    const meta = {
      filename: file,
      slug: file.replace('.png', ''),
      category,
      title,
      description,
      tags,
      alt: `${title}の透過PNG素材`,
      isCommercialOk: true,
      licenseType: "free"
    };
    
    metadataList.push(meta);
    console.log(`  📝 Generated metadata for ${file}`);
  }
  
  const outputPath = path.join(reviewDir, 'metadata.json');
  fs.writeFileSync(outputPath, JSON.stringify(metadataList, null, 2));
  console.log(`✅ Saved metadata to ${outputPath}`);
}

if (require.main === module) {
  generateMetadata();
}
