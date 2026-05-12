"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/layout/HeroSection";
import { AssetGrid } from "@/components/assets/AssetGrid";
import { CategorySection } from "@/components/layout/CategorySection";
import { searchAssets } from "@/lib/assets";
import { Asset } from "@/types";

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "すべて");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch assets from Supabase (or fallback)
  useEffect(() => {
    const fetchAssets = async () => {
      setIsLoading(true);
      const data = await searchAssets(searchQuery, selectedCategory);
      setAssets(data);
      setIsLoading(false);
    };

    fetchAssets();
  }, [searchQuery, selectedCategory]);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (searchQuery) {
      params.set("q", searchQuery);
    } else {
      params.delete("q");
    }

    if (selectedCategory !== "すべて") {
      params.set("category", selectedCategory);
    } else {
      params.delete("category");
    }

    const query = params.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    
    router.replace(url, { scroll: false });
  }, [searchQuery, selectedCategory, pathname, router, searchParams]);

  // Handle Tag clicks from other components (if they use standard links)
  useEffect(() => {
    const q = searchParams.get("q") || "";
    const cat = searchParams.get("category") || "すべて";
    setSearchQuery(q);
    setSelectedCategory(cat);
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      <Navbar />
      
      <HeroSection onSearch={setSearchQuery} initialQuery={searchQuery} />
      
      <main className="relative z-10 space-y-10">
        <AssetGrid 
          assets={assets}
          isLoading={isLoading}
          searchQuery={searchQuery} 
          category={selectedCategory} 
          onCategoryChange={setSelectedCategory} 
          onSearchChange={setSearchQuery}
        />
        
        <CategorySection onTagClick={setSearchQuery} />
        
        {/* Ad Placeholder Section (Premium look) */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="w-full h-40 glass border-dashed border-ai-purple/30 rounded-apple flex flex-col items-center justify-center text-secondary text-sm italic group hover:border-ai-purple transition-all">
            <span className="text-[10px] uppercase tracking-[0.2em] mb-2 text-ai-purple/60">Sponsored</span>
            <p className="text-white font-medium not-italic">Premium Creative Tools for Professionals</p>
          </div>
        </section>

        {/* Footer Links (SEO) */}
        <footer className="bg-white/5 border-t border-white/10 pt-20 pb-10 px-4 mt-20">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-10">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-ai-gradient rounded-lg" />
                <span className="font-bold tracking-tighter">SUKASHI</span>
              </div>
              <p className="text-secondary text-sm leading-relaxed max-w-xs">
                日本最大のAI背景透過アセットプラットフォーム。
                クリエイターの想像力を形にするための、最高品質の素材を無料で提供します。
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-sm">カテゴリー</h4>
              <ul className="space-y-4 text-xs text-secondary">
                <li><a href="#" className="hover:text-ai-cyan">日本の食</a></li>
                <li><a href="#" className="hover:text-ai-cyan">医療・歯科</a></li>
                <li><a href="#" className="hover:text-ai-cyan">事務用品</a></li>
                <li><a href="#" className="hover:text-ai-cyan">年中行事</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-sm">プラットフォーム</h4>
              <ul className="space-y-4 text-xs text-secondary">
                <li><a href="#" className="hover:text-ai-cyan">利用規約</a></li>
                <li><a href="#" className="hover:text-ai-cyan">ライセンス</a></li>
                <li><a href="#" className="hover:text-ai-cyan">APIドキュメント</a></li>
                <li><a href="#" className="hover:text-ai-cyan">お問い合わせ</a></li>
              </ul>
            </div>

            <div className="col-span-2">
              <h4 className="font-bold mb-6 text-sm">最新情報を受け取る</h4>
              <p className="text-xs text-secondary mb-4">新着アセットの通知を週に一度お届けします。</p>
              <div className="flex gap-2">
                <input type="email" placeholder="メールアドレス" className="bg-white/5 border border-white/10 rounded-full px-4 py-2 flex-1 text-xs outline-none focus:border-ai-purple transition-colors" />
                <button className="bg-white text-black px-6 py-2 rounded-full text-xs font-bold hover:bg-white/90 transition-all">購読</button>
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] text-secondary">
            <p>© 2026 SUKASHI. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white">Twitter</a>
              <a href="#" className="hover:text-white">Discord</a>
            </div>
          </div>
        </footer>
      </main>

      {/* Global Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-ai-purple/5 blur-[150px] rounded-full animate-pulse-slow" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-ai-blue/5 blur-[150px] rounded-full animate-pulse-slow" />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <HomeContent />
    </Suspense>
  );
}
