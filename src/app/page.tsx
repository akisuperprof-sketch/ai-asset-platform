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

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const { q, cat } = await searchParams;
  const currentCategory = cat || "すべて";
  const allAssets = await getAssets();
  const searchResultAssets = q || cat ? await searchAssets(q || "", currentCategory) : allAssets;

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
    "和の伝統素材": 0,
    "年中行事・祭り": 0,
    "ビジネス": 0,
    "医療・ヘルスケア": 0,
  };

  allAssets.forEach(asset => {
    const catName = asset.category; // Already mapped to Japanese inside mapAsset
    if (categoryCounts[catName] !== undefined) {
      categoryCounts[catName]++;
    } else {
      categoryCounts[catName] = 1;
    }
  });

  const isHome = !q && !cat;

  // Extract the 10 First Premium Assets (All real assets, sorted by latest)
  const premiumAssets = allAssets.filter(a => a.imageUrl).slice(0, 10);
  
  // Extract 6 representative Japanese traditional items for "LATEST FROM JAPAN"
  const latestJapanAssets = allAssets.filter(a => a.imageUrl && (a.category === "和の伝統素材" || a.category === "年中行事・祭り")).slice(0, 6);

  // Extract 6 trending items for "TRENDING PNG"
  const trendingAssets = allAssets.filter(a => a.imageUrl && a.category === "日本の食").slice(0, 6);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-ai-purple/30 relative">
      <Navbar />
      
      <main className="relative z-10">
        
        {/* On home page, HeroSection takes the full viewport. Below it, the scrollable showroom begins. */}
        {isHome ? (
          <div className="relative">
            <HeroSection 
              initialCount={assetCount} 
              todayAdded={todayAdded} 
              categoryCounts={categoryCounts}
            />
            
            {/* 1. NEW PREMIUM ASSETS SECTION */}
            <section className="bg-black py-32 px-6 border-t border-white/5 relative overflow-hidden">
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

                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('show-coming-soon', { detail: { feature: 'Studio Set セット' } }))}
                    className="glass group px-8 py-3.5 rounded-full flex items-center gap-2.5 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all border-white/10 shrink-0 cursor-not-allowed opacity-80"
                    aria-disabled="true"
                  >
                    View Complete Studio Set
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-12 gap-8">
                  {premiumAssets.length > 0 ? (
                    premiumAssets.map((asset) => (
                      <AssetCard key={asset.id} asset={asset} />
                    ))
                  ) : (
                    <div className="col-span-12 py-16 text-center glass rounded-3xl border border-white/5 bg-white/[0.02]">
                      <Sparkles className="w-8 h-8 text-purple-400/50 mx-auto mb-4 animate-pulse" />
                      <p className="text-secondary text-sm">現在、プレミアム素材を準備中です。順次公開されます。</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 2. LATEST FROM JAPAN SECTION */}
            <section className="bg-black py-32 px-6 border-t border-white/5 relative overflow-hidden">
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

                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('show-coming-soon', { detail: { feature: '日本伝統素材の探索' } }))}
                    className="glass group px-8 py-3.5 rounded-full flex items-center gap-2.5 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all border-white/10 shrink-0 cursor-not-allowed opacity-80"
                    aria-disabled="true"
                  >
                    Discover Japan
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-12 gap-8">
                  {latestJapanAssets.length > 0 ? (
                    latestJapanAssets.map((asset) => (
                      <AssetCard key={asset.id} asset={asset} />
                    ))
                  ) : (
                    <div className="col-span-12 py-16 text-center glass rounded-3xl border border-white/5 bg-white/[0.02]">
                      <MapPin className="w-8 h-8 text-cyan-400/50 mx-auto mb-4" />
                      <p className="text-secondary text-sm">日本の伝統文化アセットを準備中です。</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* 3. TRENDING PNG SECTION */}
            <section className="bg-black py-32 px-6 border-t border-white/5 relative overflow-hidden">
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

                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('show-coming-soon', { detail: { feature: 'トレンド素材一覧' } }))}
                    className="glass group px-8 py-3.5 rounded-full flex items-center gap-2.5 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all border-white/10 shrink-0 cursor-not-allowed opacity-80"
                    aria-disabled="true"
                  >
                    See All Trends
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-12 gap-8">
                  {trendingAssets.length > 0 ? (
                    trendingAssets.map((asset) => (
                      <AssetCard key={asset.id} asset={asset} />
                    ))
                  ) : (
                    <div className="col-span-12 py-16 text-center glass rounded-3xl border border-white/5 bg-white/[0.02]">
                      <Flame className="w-8 h-8 text-orange-400/50 mx-auto mb-4" />
                      <p className="text-secondary text-sm">人気のPNG素材を準備中です。</p>
                    </div>
                  )}
                </div>
              </div>
            </section>

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
            <CategorySection />
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
  );
}
