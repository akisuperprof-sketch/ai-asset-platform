const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, '../src/lib/assets.ts');
let content = fs.readFileSync(target, 'utf8');

// Patch getAssets
const getAssetsPatch = `
    const mapped = validData.map((d: any) => {
      const asset = mapAsset(d);
      return asset;
    });

    if (offset === 0) {
      return [...dummyAssets, ...mapped].slice(0, limit);
    }
    return mapped;
`;
content = content.replace(/const mapped = validData\.map[\s\S]*?return mapped;/m, getAssetsPatch);

// Patch searchAssets
const searchAssetsPatch = `
    const validData = data.filter(d => !!d.image_url || !!d.storage_key);
    const dbResults = validData.map(mapAsset);

    // Search dummyAssets
    let filteredDummy = dummyAssets;
    if (category !== "すべて") {
      filteredDummy = filteredDummy.filter(a => a.category === category);
    }
    if (query) {
      const synonyms = getSynonyms(query).map(s => s.toLowerCase());
      filteredDummy = filteredDummy.filter(a => {
        const text = (a.title + " " + a.description + " " + (a.tags || []).join(" ")).toLowerCase();
        return synonyms.some(syn => text.includes(syn));
      });
    }

    if (offset === 0) {
      return [...filteredDummy, ...dbResults].slice(0, limit);
    }
    return dbResults;
`;
content = content.replace(/const validData = data\.filter[\s\S]*?return validData\.map\(mapAsset\);/m, searchAssetsPatch);

// Also fix fallback when !supabase
content = content.replace(/console\.log\("⚠️ \[getAssets\] Supabase client is not initialized\. Returning empty array\."\);\n    return \[\];/g, 'console.log("⚠️ [getAssets] Supabase client is not initialized. Returning dummyAssets.");\n    return dummyAssets.slice(offset, offset + limit);');
content = content.replace(/console\.log\("⚠️ \[searchAssets\] Supabase client is not initialized\. Returning empty array\."\);\n    return \[\];/g, 'console.log("⚠️ [searchAssets] Supabase client is not initialized. Returning dummyAssets.");\n    return dummyAssets;');

fs.writeFileSync(target, content, 'utf8');
console.log("Patched src/lib/assets.ts successfully.");
