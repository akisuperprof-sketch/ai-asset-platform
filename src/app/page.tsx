import { Navbar } from "@/components/layout/Navbar";
import { HeroSection } from "@/components/layout/HeroSection";
import { AssetGrid } from "@/components/assets/AssetGrid";
import { CategorySection } from "@/components/layout/CategorySection";
import { getAssets, searchAssets } from "@/lib/assets";
import { Zap, MessageCircle, Globe, ShieldCheck, Mail, Play, Camera } from "lucide-react";

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const { q, cat } = await searchParams;
  const currentCategory = cat || "すべて";
  const assets = q || cat ? await searchAssets(q || "", currentCategory) : await getAssets();

  return (
    <div className="min-h-screen bg-black text-white selection:bg-ai-purple/30">
      <Navbar />
      
      <main>
        <HeroSection />
        <CategorySection />
        
        <div id="assets">
          <AssetGrid 
            assets={assets} 
            searchQuery={q}
            category={currentCategory}
          />
        </div>
      </main>

      <footer className="bg-ninja-black pt-32 pb-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-12 gap-12 mb-24">
            <div className="col-span-12 lg:col-span-4">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-ai-gradient rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white fill-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tighter">SUKASHI</span>
                  <span className="text-[10px] font-black text-ai-cyan tracking-[0.2em] uppercase">AssetNinja</span>
                </div>
              </div>
              <p className="text-secondary text-sm leading-relaxed mb-10 max-w-sm">
                AIで生成された高品質なPNG素材を無料でダウンロードできるプラットフォーム。
                日本の文化とクリエイティビティを世界へ。
              </p>
              <div className="flex gap-6">
                {[MessageCircle, Camera, Play].map((Icon, i) => (
                  <button key={i} className="w-12 h-12 glass rounded-2xl flex items-center justify-center hover:bg-white hover:text-black transition-all border-white/5">
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            <div className="col-span-12 lg:col-span-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">サービス</h4>
                  <ul className="space-y-4 text-secondary text-sm font-bold">
                    <li><a href="#" className="hover:text-white transition-colors">素材を探す</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">カテゴリ一覧</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">新着素材</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">人気素材</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">サポート</h4>
                  <ul className="space-y-4 text-secondary text-sm font-bold">
                    <li><a href="#" className="hover:text-white transition-colors">ご利用ガイド</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">よくある質問</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">お問い合わせ</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">規約・ポリシー</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">会社情報</h4>
                  <ul className="space-y-4 text-secondary text-sm font-bold">
                    <li><a href="#" className="hover:text-white transition-colors">SUKASHIについて</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">プライバシーポリシー</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">利用規約</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">特定商取引法に基づく表記</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">最新情報を受け取る</h4>
                  <p className="text-secondary text-xs mb-6 font-medium">新しい素材や機能のアップデート情報をお届けします。</p>
                  <div className="flex gap-2">
                    <input type="text" placeholder="メールアドレスを入力" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-ai-purple transition-all" />
                    <button className="bg-ai-gradient px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-ai-purple/20">
                      登録する
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] text-secondary font-black tracking-widest uppercase">
              © 2024 SUKASHI / AssetNinja. All rights reserved.
            </p>
            <div className="flex gap-8 text-[10px] text-secondary font-black uppercase tracking-widest">
              <a href="#" className="hover:text-white">Privacy</a>
              <a href="#" className="hover:text-white">Terms</a>
              <a href="#" className="hover:text-white">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

