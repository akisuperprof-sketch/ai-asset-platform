"use client";

import { Zap, MessageCircle, Camera, Play } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const handleComingSoon = (e: React.MouseEvent, feature: string) => {
    e.preventDefault();
    window.dispatchEvent(
      new CustomEvent("show-coming-soon", { detail: { feature } })
    );
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    window.dispatchEvent(
      new CustomEvent("show-coming-soon", { detail: { feature: "ニュースレター購読" } })
    );
  };

  return (
    <footer className="bg-ninja-black pt-32 pb-12 px-6 border-t border-white/5 relative z-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-12 mb-24">
          <div className="col-span-12 lg:col-span-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-ai-gradient rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white fill-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tighter">ASSET NINJA</span>
                <span className="text-[10px] font-black text-ai-cyan tracking-[0.2em] uppercase">Premium PNG OS</span>
              </div>
            </div>
            <p className="text-secondary text-sm leading-relaxed mb-10 max-w-sm">
              AIで生成された高品質なPNG素材を無料でダウンロードできるプラットフォーム。
              日本の文化とクリエイティビティを世界へ。
            </p>
            <div className="flex gap-6">
              {[
                { icon: MessageCircle, name: "Discord Community" },
                { icon: Camera, name: "Instagram" },
                { icon: Play, name: "YouTube" }
              ].map((social, i) => {
                const Icon = social.icon;
                return (
                  <button
                    key={i}
                    onClick={(e) => handleComingSoon(e, social.name)}
                    className="w-12 h-12 glass rounded-2xl flex items-center justify-center hover:bg-white hover:text-black transition-all border-white/5 cursor-not-allowed opacity-80"
                    aria-disabled="true"
                    title={`${social.name} (Coming Soon)`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="col-span-12 lg:col-span-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">サービス</h4>
                <ul className="space-y-4 text-secondary text-sm font-bold">
                  <li><Link href="/" className="hover:text-white transition-colors">素材を探す</Link></li>
                  <li><Link href="/?cat=すべて" className="hover:text-white transition-colors">カテゴリ一覧</Link></li>
                  <li>
                    <Link 
                      href="/trending" 
                      className="hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      トレンド素材
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/popular" 
                      className="hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      人気素材
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/new" 
                      className="hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      新着素材
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/events" 
                      className="hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      イベント・季節
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/searches" 
                      className="hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      人気の検索
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">サポート</h4>
                <ul className="space-y-4 text-secondary text-sm font-bold">
                  <li>
                    <Link 
                      href="/coming-soon" 
                      onClick={(e) => handleComingSoon(e, "ご利用ガイド")}
                      className="hover:text-white transition-colors flex items-center gap-1.5 cursor-not-allowed opacity-75"
                      aria-disabled="true"
                    >
                      ご利用ガイド
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/coming-soon" 
                      onClick={(e) => handleComingSoon(e, "よくある質問")}
                      className="hover:text-white transition-colors flex items-center gap-1.5 cursor-not-allowed opacity-75"
                      aria-disabled="true"
                    >
                      よくある質問
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/contact" 
                      className="hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      お問い合わせ
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/coming-soon" 
                      onClick={(e) => handleComingSoon(e, "規約・ポリシー")}
                      className="hover:text-white transition-colors flex items-center gap-1.5 cursor-not-allowed opacity-75"
                      aria-disabled="true"
                    >
                      規約・ポリシー
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">会社情報</h4>
                <ul className="space-y-4 text-secondary text-sm font-bold">
                  <li>
                    <Link 
                      href="/coming-soon" 
                      onClick={(e) => handleComingSoon(e, "AssetNinjaについて")}
                      className="hover:text-white transition-colors flex items-center gap-1.5 cursor-not-allowed opacity-75"
                      aria-disabled="true"
                    >
                      AssetNinjaについて
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/privacy" 
                      className="hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      プライバシーポリシー
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/terms" 
                      className="hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      利用規約
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/coming-soon" 
                      onClick={(e) => handleComingSoon(e, "特定商取引法に基づく表記")}
                      className="hover:text-white transition-colors flex items-center gap-1.5 cursor-not-allowed opacity-75"
                      aria-disabled="true"
                    >
                      特定商取引法に基づく表記
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-white mb-8">最新情報を受け取る</h4>
                <p className="text-secondary text-xs mb-6 font-medium">新しい素材や機能のアップデート情報をお届けします。</p>
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input 
                    type="email" 
                    placeholder="メールアドレスを入力" 
                    required 
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-xs focus:outline-none focus:border-ai-purple transition-all" 
                  />
                  <button 
                    type="submit" 
                    className="bg-ai-gradient px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-ai-purple/20 cursor-pointer"
                  >
                    登録する
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] text-secondary font-black tracking-widest uppercase">
            © 2024 AssetNinja. All rights reserved.
          </p>
          <div className="flex gap-8 text-[10px] text-secondary font-black uppercase tracking-widest flex-wrap">
            <Link href="/terms" className="hover:text-white">Terms of Use</Link>
            <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
            <Link href="/contact" className="hover:text-white">Contact</Link>
            <Link href="/copyright" className="hover:text-white">Copyright Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
