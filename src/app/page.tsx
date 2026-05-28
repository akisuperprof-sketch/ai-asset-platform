export const dynamic = "force-dynamic";
export const revalidate = 0;

import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/layout/HeroSection";
import { Footer } from "@/components/layout/Footer";
import { AssetCard } from "@/components/assets/AssetCard";
import { AssetGrid } from "@/components/assets/AssetGrid";
import { CategorySection } from "@/components/layout/CategorySection";
import { getAssets, searchAssets } from "@/lib/assets";
import { Zap, MessageCircle, Play, Camera, ChevronRight, Sparkles, Flame, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { SplashWrapper } from "@/components/layout/SplashWrapper";
import { ComingSoonButton } from "@/components/ui/ComingSoonButton";

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const { q, cat } = await searchParams;
  const currentCategory = cat || "すべて";
  const allAssets = await getAssets(100, 0); // Need 100 for homepage sections
  const searchResultAssets = q || cat ? await searchAssets(q || "", currentCategory, 24, 0) : allAssets.slice(0, 24);

  // Calculate dynamic metrics on the server side
  const assetCount = allAssets.length;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayAdded = allAssets.filter(asset => {
    if (!asset.publishedAt) return false;
    return new Date(asset.publishedAt) >= startOfToday;
  }).length;

  // Extract category counts dynamically from active published assets
  const categoryCounts: Record<string, number> = {
    "日本の食": 0,
    "和風・和柄": 0,
    "桜・祭り": 0,
    "神社・鳥居": 0,
    "富士山・自然": 0,
    "医療・ヘルスケア": 0,
    "ビジネス": 0,
  };

  allAssets.forEach(asset => {
    const catName = asset.category; // Already mapped to Japanese inside mapAsset
    if (categoryCounts[catName] !== undefined) {
      categoryCounts[catName]++;
    } else {
      categoryCounts[catName] = 1;
    }
  });

  const categoriesList = [
    { id: "1", name: "日本の食", slug: "food", count: categoryCounts["日本の食"] || 0 },
    { id: "2", name: "和風・和柄", slug: "japan", count: categoryCounts["和風・和柄"] || 0 },
    { id: "3", name: "桜・祭り", slug: "festival", count: categoryCounts["桜・祭り"] || 0 },
    { id: "4", name: "神社・鳥居", slug: "torii", count: categoryCounts["神社・鳥居"] || 0 },
    { id: "5", name: "富士山・自然", slug: "nature", count: categoryCounts["富士山・自然"] || 0 },
    { id: "6", name: "医療・ヘルスケア", slug: "medical", count: categoryCounts["医療・ヘルスケア"] || 0 },
    { id: "7", name: "ビジネス", slug: "business", count: categoryCounts["ビジネス"] || 0 },
  ];

  // Extract popular tags dynamically from real assets
  const tagCounts: Record<string, number> = {};
  allAssets.forEach(asset => {
    if (asset.tags) {
      asset.tags.forEach(tag => {
        const ignoreTags = ["背景透過", "PNG素材", "商用利用可能", "無料素材", "透過画像", "AI生成素材", "PNG"];
        if (!ignoreTags.includes(tag)) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      });
    }
  });

  const popularTagsList = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(entry => entry[0]);

  const isHome = !q && !cat;

  // Premium Top Page Strategy: Filter to specific high-quality categories
  const premiumTopKeywords = ["sushi", "ramen", "sakura", "torii", "japanese pattern", "maneki neko"];
  const isPremiumTopMatch = (asset: any) => {
    const raw = (asset.prompt || asset.title || "").toLowerCase();
    return premiumTopKeywords.some(kw => raw.includes(kw)) || premiumTopKeywords.includes(asset.categoryRaw);
  };
  
  // Extract the 10 First Premium Assets (All real assets, sorted by latest, filtered by premium strategy)
  const premiumAssets = allAssets.filter(a => a.imageUrl && isPremiumTopMatch(a)).slice(0, 10);
  // Fallback to latest if not enough premium items
  if (premiumAssets.length < 10) {
    const additional = allAssets.filter(a => a.imageUrl && !premiumAssets.find(p => p.id === a.id)).slice(0, 10 - premiumAssets.length);
    premiumAssets.push(...additional);
  }
  
  // Extract 6 representative Japanese traditional items for "LATEST FROM JAPAN"
  const latestJapanAssets = allAssets.filter(a => a.imageUrl && (a.category === "和風・和柄" || a.category === "桜・祭り" || a.category === "神社・鳥居")).slice(0, 6);

  // Extract 6 trending items for "TRENDING PNG"
  const trendingAssets = allAssets.filter(a => a.imageUrl && a.category === "日本の食").slice(0, 6);

  return (
    <SplashWrapper>
      <div className="min-h-screen bg-black text-white selection:bg-ai-purple/30 relative">
        <Navbar />
        
        <main className="relative z-10">

        
        {/* On home page, HeroSection takes the full viewport. Below it, the scrollable showroom begins. */}
        {isHome ? (
          <div className="relative">
            {/* STATIC ADMAX AD FOR BOT APPROVAL (SSR MUST RENDER THIS) - MOVED TO TOP */}
            <div className="w-full flex flex-col items-center justify-center pt-24 pb-8 gap-4 bg-black relative z-50">
              <span className="text-[10px] text-gray-600 tracking-widest uppercase mb-2">Advertisement</span>
              {/* PC 300x250 */}
              <div className="hidden md:block w-[300px] h-[250px] bg-black"
                dangerouslySetInnerHTML={{ __html: '<script src="https://adm.shinobi.jp/s/40d12e183086a55c7451794352a281c2"></script>' }}
              />
              {/* SP 320x50 */}
              <div className="block md:hidden w-[320px] h-[50px] bg-black"
                dangerouslySetInnerHTML={{ __html: '<script src="https://adm.shinobi.jp/s/35317cead3271f0eeda52a630e9f6aa6"></script>' }}
              />
            </div>

            <HeroSection 
              initialCount={assetCount} 
              todayAdded={todayAdded} 
              categoryCounts={categoryCounts}
              premiumAssets={premiumAssets}
            />

            
            {/* 1. NEW PREMIUM ASSETS SECTION */}
            {premiumAssets.length > 0 && (
              <section className="bg-black py-20 px-6 border-t border-white/5 relative overflow-hidden">
                {/* Background ambient lighting */}
                <div className="absolute top-[10%] right-[10%] w-[350px] h-[350px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[15%] left-[5%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
                
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                        <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">
                          Special Selection
                        </span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none">
                        NEW PREMIUM ASSETS
                      </h2>
                      <p className="text-secondary text-sm mt-3 max-w-xl">
                        日本の伝統と食を4K解像度・フチなし超高精度透過PNGで仕上げた最上級コレクション。Canvaやプロのデザインに完全適合。
                      </p>
                    </div>

                    <ComingSoonButton 
                      feature="Studio Set セット"
                      className="glass group px-8 py-3.5 rounded-full flex items-center gap-2.5 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all border-white/10 shrink-0 opacity-80"
                    >
                      View Complete Studio Set
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </ComingSoonButton>
                  </div>

                  <div className="grid grid-cols-12 gap-8">
                    {premiumAssets.map((asset) => (
                      <AssetCard key={asset.id} asset={asset} className="col-span-12 sm:col-span-6 lg:col-span-4" />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* 2. LATEST FROM JAPAN SECTION */}
            {latestJapanAssets.length > 0 && (
              <section className="bg-black py-20 px-6 border-t border-white/5 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="w-4 h-4 text-cyan-400" />
                        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.3em]">
                          Cultural Aesthetics
                        </span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none">
                        LATEST FROM JAPAN
                      </h2>
                      <p className="text-secondary text-sm mt-3 max-w-xl">
                        お祭り提灯、日本和傘、こけし人形、お寺の梵鐘まで。日本の風情ある日常小物を影を含め完全透過処理したアセット。
                      </p>
                    </div>

                    <ComingSoonButton 
                      feature="日本伝統素材の探索"
                      className="glass group px-8 py-3.5 rounded-full flex items-center gap-2.5 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all border-white/10 shrink-0 opacity-80"
                    >
                      Discover Japan
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </ComingSoonButton>
                  </div>

                  <div className="grid grid-cols-12 gap-8">
                    {latestJapanAssets.map((asset) => (
                      <AssetCard key={asset.id} asset={asset} />
                    ))}
                  </div>
                </div>
              </section>
            )}

             {/* 3. TRENDING PNG SECTION */}
            {trendingAssets.length > 0 && (
              <section className="bg-black py-20 px-6 border-t border-white/5 relative overflow-hidden">
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Flame className="w-4 h-4 text-orange-400" />
                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-[0.3em]">
                          Most Requested
                        </span>
                      </div>
                      <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none">
                        TRENDING PNG
                      </h2>
                      <p className="text-secondary text-sm mt-3 max-w-xl">
                        世界中のデザイナーやCanvaクリエイターから現在最もダウンロードされている和食透過PNGアセット。
                      </p>
                    </div>

                    <ComingSoonButton 
                      feature="トレンド素材一覧"
                      className="glass group px-8 py-3.5 rounded-full flex items-center gap-2.5 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all border-white/10 shrink-0 opacity-80"
                    >
                      See All Trends
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </ComingSoonButton>
                  </div>

                  <div className="grid grid-cols-12 gap-8">
                    {trendingAssets.map((asset) => (
                      <AssetCard key={asset.id} asset={asset} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Dynamic Real-time Category OS Bento Section at Home Bottom */}
            <div className="border-t border-white/5 bg-black/40 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-ai-cyan/15 to-transparent" />
              <CategorySection categories={categoriesList} popularTags={popularTagsList} />
            </div>

          </div>
        ) : (
          <div className="pt-32 px-6 max-w-7xl mx-auto mb-12">
            <h1 className="text-4xl font-black text-white mb-4">
              {q ? `「${q}」の検索結果` : `${cat} の素材`}
            </h1>
            <p className="text-secondary text-sm">
              AIで生成された高品質な背景透過PNG素材
            </p>
          </div>
        )}

        {!isHome && (
          <>
            <CategorySection categories={categoriesList} popularTags={popularTagsList} />
            <div id="assets">
              <AssetGrid 
                assets={searchResultAssets} 
                searchQuery={q}
                category={currentCategory}
              />
            </div>
          </>
        )}

        {/* Brand Concept Section */}
        <section className="max-w-7xl mx-auto px-6 py-24 mb-16 border-t border-white/5">
          <div className="glass-card rounded-[40px] overflow-hidden relative group">
            <div className="absolute inset-0 bg-ai-gradient opacity-10 group-hover:opacity-20 transition-opacity duration-1000" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-12 lg:p-20 relative z-10">
              <div>
                <span className="text-[10px] font-black text-ai-cyan uppercase tracking-[0.4em] mb-4 block">Brand Concept</span>
                <h2 className="text-4xl md:text-5xl font-black text-white leading-tight mb-6">
                  THE NINJA<br />OF DIGITAL ASSETS
                </h2>
                <p className="text-secondary leading-relaxed mb-8">
                  素早く見つけ、影のように自然に溶け込む。<br />
                  日本のクリエイティビティを体現する、高品質なAI透過PNGプラットフォーム。
                  あらゆるクリエイティブワークを加速させる「忍具」を提供します。
                </p>
              </div>
              <div className="flex justify-center">
                <img src="/brand/ninja-char-1.png" alt="AssetNinja Concept" className="w-full max-w-sm drop-shadow-[0_20px_50px_rgba(245,158,11,0.25)] group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
    </SplashWrapper>
  );
}

