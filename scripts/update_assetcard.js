const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/assets/AssetCard.tsx');
let code = fs.readFileSync(filePath, 'utf-8');

// The bottom area of AssetCard looks like this:
/*
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div className="flex gap-2">
            <div className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[9px] font-bold text-white/40 uppercase">
              PNG
            </div>
            <div className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[9px] font-bold text-white/40 uppercase">
              1024x1024
            </div>
          </div>
          <div className="flex items-center gap-3 text-secondary">
*/

const newBottomArea = `
        <div className="flex flex-col gap-2 mt-auto pt-3 border-t border-white/5">
          <div className="flex flex-wrap gap-1.5">
            <div className="bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[8px] font-black text-emerald-400 uppercase tracking-widest">
              Commercial OK
            </div>
            <div className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[8px] font-black text-white/60 uppercase tracking-widest">
              Transparent PNG
            </div>
            <div className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[8px] font-bold text-white/40 uppercase">
              4096×4096
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-1">
            <div className="text-[9px] font-medium text-white/40 truncate flex-1 pr-2">
              Used for: Canva / Poster / Web
            </div>
            <div className="flex items-center gap-2.5 text-secondary shrink-0">
              {isTrending && (
                <div className="flex items-center gap-1 text-orange-400">
                  <Flame className="w-3 h-3" />
                </div>
              )}
              <div className="flex items-center gap-1" title="Downloads">
                <ArrowDown className="w-3 h-3 text-ai-cyan" />
                <span className="text-[10px] font-bold text-white/70">{downloadSeed}</span>
              </div>
              <div className="flex items-center gap-1" title="Favorites">
                <Heart className="w-3 h-3 text-red-500/80" />
                <span className="text-[10px] font-bold text-white/70">{favoriteSeed}</span>
              </div>
            </div>
          </div>
        </div>
`;

code = code.replace(/<div className="flex items-center justify-between mt-auto pt-4 border-t border-white\/5">[\s\S]*?<\/div>\n        <\/div>\n      <\/div>/m, 
  newBottomArea + `      </div>`
);

fs.writeFileSync(filePath, code);
console.log('AssetCard updated.');
