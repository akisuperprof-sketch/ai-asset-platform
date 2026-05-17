import fs from 'fs';
import path from 'path';

const CLICK_TRIGGERS = [
  "Free Download",
  "Commercial Use OK",
  "HD Transparent",
  "No Attribution",
  "High Quality"
];

export function optimizeTitleForCTR(baseTitle: string, lang: 'en' | 'ja' = 'en') {
  if (lang === 'ja') {
    return `${baseTitle} PNG素材（透過）｜商用利用OK｜AssetNinja`;
  }
  
  // English format optimized for Google Image Search and Pinterest
  const trigger = CLICK_TRIGGERS[Math.floor(Math.random() * CLICK_TRIGGERS.length)];
  return `${baseTitle} PNG (Transparent) | ${trigger} | AssetNinja`;
}

export function batchOptimizeTitles() {
  console.log("🚀 Running CTR Title Optimization...");
  // In production, this would read from the generated metadata or DB
  const rawTitles = ["Japanese Ramen Bowl", "Sushi Plate", "Matcha Tea"];
  
  rawTitles.forEach(t => {
    console.log(`Original: ${t}`);
    console.log(`Optimized: ${optimizeTitleForCTR(t, 'en')}\n`);
  });
}

if (require.main === module) {
  batchOptimizeTitles();
}
