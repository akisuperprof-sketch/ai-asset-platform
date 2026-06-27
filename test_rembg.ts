import { removeBackground } from '@imgly/background-removal-node';
import fs from 'fs';

async function main() {
  try {
    const buffer = fs.readFileSync('maneki_neko_test.png');
    // Using default options
    const blob = await removeBackground(buffer);
    const arrayBuffer = await blob.arrayBuffer();
    fs.writeFileSync('maneki_neko_test_rembg.png', Buffer.from(arrayBuffer));
    console.log('Background removed and saved.');
  } catch (error) {
    console.error('Error:', error);
  }
}
main();
