export const SYNONYM_MAP: Record<string, string[]> = {
  "cherry blossom": ["sakura", "さくら", "桜"],
  "sakura": ["cherry blossom", "さくら", "桜"],
  "桜": ["cherry blossom", "sakura", "さくら"],
  "さくら": ["cherry blossom", "sakura", "桜"],
  "rice ball": ["onigiri", "おにぎり"],
  "onigiri": ["rice ball", "おにぎり"],
  "おにぎり": ["rice ball", "onigiri"],
  "dumpling": ["dango", "だんご", "団子"],
  "dango": ["dumpling", "だんご", "団子"],
  "だんご": ["dumpling", "dango", "団子"],
  "団子": ["dumpling", "dango", "だんご"],
  "ramen": ["ラーメン", "らーめん"],
  "ラーメン": ["ramen", "らーめん"],
  "sushi": ["寿司", "すし", "スシ"],
  "寿司": ["sushi", "すし", "スシ"],
  "torii gate": ["torii", "鳥居", "とりい"],
  "torii": ["torii gate", "鳥居", "とりい"],
  "鳥居": ["torii gate", "torii", "とりい"],
  "lucky cat": ["maneki neko", "招き猫", "まねきねこ"],
  "maneki neko": ["lucky cat", "招き猫", "まねきねこ"],
  "招き猫": ["lucky cat", "maneki neko", "まねきねこ"],
  "mount fuji": ["fuji", "富士山", "ふじさん"],
  "fuji": ["mount fuji", "富士山", "ふじさん"],
  "富士山": ["mount fuji", "fuji", "ふじさん"],
  "matcha": ["抹茶", "まっちゃ"],
  "抹茶": ["matcha", "まっちゃ"],
};

/**
 * Normalize the search query by lowercasing and trimming,
 * and return an array of synonyms including the original query.
 */
export function getSynonyms(query: string): string[] {
  if (!query) return [];
  
  // Basic normalization
  const normalizedQuery = query.toLowerCase().trim();
  
  // Set to avoid duplicates
  const results = new Set<string>();
  results.add(normalizedQuery);
  
  // If the exact normalized query has synonyms, add them
  if (SYNONYM_MAP[normalizedQuery]) {
    SYNONYM_MAP[normalizedQuery].forEach(s => results.add(s));
  }
  
  // In a more advanced implementation, we might split by spaces 
  // and search for partial synonym matches, but for now we stick to exact phrasing 
  // or simple single-word mappings as requested for Additive Only.
  
  // Also remove spaces from normalizedQuery as a fallback (e.g. cherryblossom)
  const noSpaceQuery = normalizedQuery.replace(/\s+/g, '');
  if (noSpaceQuery !== normalizedQuery) {
    results.add(noSpaceQuery);
    if (SYNONYM_MAP[noSpaceQuery]) {
      SYNONYM_MAP[noSpaceQuery].forEach(s => results.add(s));
    }
  }

  // Also check if noSpaceQuery is inside the map values
  // e.g. user typed "cherryblossom", we want it to match "cherry blossom"
  for (const [key, synonyms] of Object.entries(SYNONYM_MAP)) {
    if (key.replace(/\s+/g, '') === noSpaceQuery || synonyms.some(s => s.replace(/\s+/g, '') === noSpaceQuery)) {
      results.add(key);
      synonyms.forEach(s => results.add(s));
    }
  }

  return Array.from(results);
}
