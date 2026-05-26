const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/components/assets/AssetCard.tsx');
let content = fs.readFileSync(file, 'utf-8');

// I need to add some badges to the hover overlay or the bottom part of the card.
content = content.replace(
  `{/* Gradient Background & Glow */}`,
  `{/* Quality Rank Badge */}
        {isTrending && (
          <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
            <span className="bg-amber-500/90 text-black text-[9px] font-black tracking-widest px-2 py-0.5 rounded uppercase shadow-lg backdrop-blur-sm flex items-center gap-1">
              <Flame className="w-3 h-3" /> Popular
            </span>
          </div>
        )}
        <div className="absolute top-2 right-2 z-20">
          <span className="bg-black/60 text-ai-cyan border border-ai-cyan/20 text-[8px] font-black tracking-widest px-2 py-0.5 rounded uppercase shadow-lg backdrop-blur-sm">
            {asset.qualityRank || 'S-Tier'} Premium
          </span>
        </div>

        {/* Gradient Background & Glow */}`
);

// We need to add the uses (Canva, Poster, etc) to the hover overlay
content = content.replace(
  `{/* Overlay Content */}`,
  `{/* Overlay Content */}\n            <div className="absolute top-0 left-0 w-full p-4 transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300 opacity-0 group-hover:opacity-100 flex flex-col gap-1.5">\n              <div className="flex items-center gap-2 text-[10px] text-white/90 font-bold bg-black/40 backdrop-blur-md px-2 py-1 rounded w-fit border border-white/10">\n                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Commercial OK\n              </div>\n              <div className="flex items-center gap-2 text-[10px] text-white/90 font-bold bg-black/40 backdrop-blur-md px-2 py-1 rounded w-fit border border-white/10">\n                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" /> Transparent PNG\n              </div>\n              <div className="mt-1 text-[9px] text-white/60 font-medium line-clamp-2 leading-relaxed">\n                <span className="text-white/80 font-bold">Used for:</span> Canva, Poster, SNS, YouTube, Web\n              </div>\n            </div>`
);

// We need to modify Popular assets on homepage
fs.writeFileSync(file, content);
