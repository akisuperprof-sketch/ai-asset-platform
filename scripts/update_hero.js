const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/layout/HeroSection.tsx');
let code = fs.readFileSync(filePath, 'utf-8');

// 1. Add premiumAssets to props
code = code.replace(
  `interface HeroSectionProps {
  onSearch?: (query: string) => void;
  initialCount?: number;
  todayAdded?: number;
  categoryCounts?: Record<string, number>;
}`,
  `import { Asset } from "@/types";
import { AssetCard } from "@/components/assets/AssetCard";

interface HeroSectionProps {
  onSearch?: (query: string) => void;
  initialCount?: number;
  todayAdded?: number;
  categoryCounts?: Record<string, number>;
  premiumAssets?: Asset[];
}`
);

code = code.replace(
  `}: HeroSectionProps) {`,
  `  premiumAssets = []
}: HeroSectionProps) {`
);

// 2. Remove Developer OS state & effects
code = code.replace(/const \[nowGenerating, setNowGenerating\][\s\S]*?\}\);/m, "");
code = code.replace(/const \[logs, setLogs\][\s\S]*?\]\);/m, "");
code = code.replace(/\/\/ NOW GENERATING Simulation loop[\s\S]*?return \(\) => clearInterval\(progressInterval\);\n  \}, \[\]\);/m, "");

// 3. Update Title & Badges
const newTypographyBlock = `
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="inline-flex items-center gap-2 bg-white/[0.02] border border-white/5 px-3.5 py-1.5 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                <span className="text-[10px] font-bold text-white/80 tracking-widest uppercase">
                  Premium Japanese Assets
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3rem] xl:text-[3.6rem] font-black text-white leading-[1.05] tracking-tighter drop-shadow-2xl">
                Premium Transparent <br/>
                <span className="bg-ai-gradient bg-clip-text text-transparent [-webkit-background-clip:text]">PNG Assets</span> for Creators.
              </h1>

              <p className="text-[14px] text-white/70 leading-relaxed font-medium max-w-md">
                High-quality Japanese PNG assets. Commercial use ready. Instant download.
              </p>

              {/* Value Proposition Badges */}
              <div className="flex flex-wrap gap-2 pt-2">
                {[
                  "Commercial Use OK",
                  "Transparent PNG",
                  "Instant Download",
                  "Canva Compatible",
                ].map((badge) => (
                  <div key={badge} className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-bold text-white/90 whitespace-nowrap backdrop-blur-md">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    {badge}
                  </div>
                ))}
              </div>
            </motion.div>
`;

code = code.replace(/<motion\.div[\s\S]*?\{\/\* Typographical Left block \*\/\}\n\s*<div.*?>(?:[\s\S]*?(?=<\/div>\n\n\s*\{\/\* Scaled Up Interactive Mascot))/m, 
  `{/* Typographical Left block */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-3">
${newTypographyBlock}`);

// 4. Update Search Placeholder & Recent/Trending
code = code.replace(/和食、桜、富士山、医療をニューラル検索\.\.\./g, "Search: sakura / ramen / torii gate / matcha / onigiri ...");
code = code.replace(/\{"おにぎり", "桜", "医療"\}/g, '["sakura", "ramen", "torii gate"]');
code = code.replace(/\{"ラーメン", "富士山", "ビジネス"\}/g, '["matcha", "onigiri", "business"]');
code = code.replace(/\{"寿司", "お守り", "招き猫"\}/g, '["sushi", "japanese pattern", "medical"]');

// 5. Remove OS Panels and Add Popular Assets
const popularAssetsBlock = `
                    {/* Popular Assets Horizontal Scroll (Premium UX) */}
                    <div className="w-full mt-6 text-left">
                      <div className="flex items-center justify-between mb-4 px-2">
                        <span className="text-[11px] font-black text-white/60 tracking-widest uppercase flex items-center gap-2">
                          <Flame className="w-3.5 h-3.5 text-orange-400" /> POPULAR ASSETS
                        </span>
                      </div>
                      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2 -mx-2 snap-x">
                        {premiumAssets && premiumAssets.slice(0, 5).map(asset => (
                          <div key={asset.id} className="min-w-[200px] sm:min-w-[240px] snap-start">
                            <AssetCard asset={asset} className="!h-[280px]" />
                          </div>
                        ))}
                      </div>
                    </div>
`;

// Replace the Searching Status Indicator & Live Asset Engine OS Panel block
code = code.replace(/\{\/\* Searching Status Indicator & Live Asset Engine OS Panel \(Phase-002\) \*\/\}[\s\S]*?<\/AnimatePresence>\n\s*<\/div>/m, 
  `{/* Popular Assets Showcase */}
            <div className="mt-4 w-full">
              <AnimatePresence mode="wait">
                {isSearching ? (
                  <div className="h-6 flex items-center justify-center">
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-ping" />
                      SEARCHING ASSETS...
                    </motion.span>
                  </div>
                ) : (
                  ${popularAssetsBlock}
                )}
              </AnimatePresence>
            </div>`
);

// 6. Update Dock to Category Cards
const categoryCardsBlock = `
          {/* Modern Category Cards instead of Dock */}
          <div className="w-full max-w-5xl mx-auto mb-6 px-2">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[
                { name: "日本の食", label: "Japanese Food", icon: "🍜" },
                { name: "和の伝統素材", label: "Traditional", icon: "⛩️" },
                { name: "年中行事・祭り", label: "Seasonal", icon: "🌸" },
                { name: "ビジネス", label: "Business", icon: "💼" },
                { name: "医療・ヘルスケア", label: "Medical", icon: "🏥" },
                { name: "すべて", label: "Patterns & More", icon: "🎨" },
              ].map((cat) => (
                <button 
                  key={cat.name}
                  onClick={() => router.push(\`/?cat=\${encodeURIComponent(cat.name)}\`)}
                  className="flex flex-col items-center justify-center gap-2 group bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/20 rounded-2xl p-4 transition-all duration-300"
                >
                  <span className="text-2xl group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">{cat.icon}</span>
                  <span className="text-[9px] font-bold tracking-wider text-white/60 group-hover:text-white transition-colors text-center whitespace-nowrap">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
`;

code = code.replace(/\{\/\* Dock型カテゴリOS - Upgraded to genuine Mac-style Dock with hover expansions DOCK-001\/002\/003 \*\/\}[\s\S]*?(?=\{\/\* Premium OS Live Status Footer)/m, categoryCardsBlock);

// 7. Remove Developer status footer and replace with minimal SEO tags
const minimalFooterBlock = `
          {/* SEO & Discoverability Minimal Footer */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 items-center w-full max-w-5xl mx-auto border-t border-white/5 pt-4 pb-2 text-[10px] font-medium tracking-wide text-white/30">
            <span>transparent png</span>
            <span className="hidden sm:inline text-white/5">•</span>
            <span>commercial use png</span>
            <span className="hidden sm:inline text-white/5">•</span>
            <span>japanese png</span>
            <span className="hidden sm:inline text-white/5">•</span>
            <span>png assets</span>
            <span className="hidden sm:inline text-white/5">•</span>
            <span>cutout png</span>
            <span className="hidden sm:inline text-white/5">•</span>
            <span>isolated png</span>
          </div>
`;

code = code.replace(/\{\/\* Premium OS Live Status Footer - Completely aligned with Phase 3 \*\/\}[\s\S]*?<\/div>\n\n\s*<\/div>/m, minimalFooterBlock + "\n        </div>");

fs.writeFileSync(filePath, code);
console.log('HeroSection updated.');
