"use client";

import { motion } from "framer-motion";
import { Search, Zap, ShieldCheck, Globe, Download, MousePointer2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function HeroSection({ onSearch }: { onSearch?: (query: string) => void }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else {
      router.push(`/?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center pt-32 pb-20 overflow-hidden bg-black">
      {/* Background Cinematic Elements */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-ninja-black via-transparent to-ninja-black z-0" />
      <div className="absolute bottom-0 left-0 right-0 h-[50vh] bg-gradient-to-t from-ai-purple/10 to-transparent blur-[120px]" />
      <div className="scanline" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-12 gap-12 items-center">
          
          {/* Left Content */}
          <div className="col-span-12 lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-ai-cyan animate-pulse" />
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
                    日本発のAI透過素材プラットフォーム
                  </span>
                </div>
              </div>

              <h1 className="text-6xl md:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8">
                AI <span className="bg-ai-gradient bg-clip-text text-transparent [-webkit-background-clip:text]">TRANSPARENT</span><br />
                ASSETS FROM JAPAN
              </h1>

              <p className="text-lg md:text-xl text-secondary max-w-xl leading-relaxed mb-10 font-medium">
                日本の日常・文化・食・ビジネスシーンの<br />
                高品質なPNG素材をAIで生成・収集。商用利用OK。
              </p>

              <form onSubmit={handleSearch} className="relative max-w-xl group mb-8">
                <div className="absolute -inset-1 bg-ai-gradient rounded-full opacity-20 group-hover:opacity-40 blur transition-opacity duration-500" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="素材を検索 (例: おにぎり、寿司、ビジネス...)"
                  className="w-full h-16 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full px-8 pl-14 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-all text-sm"
                />
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <button 
                  type="submit"
                  className="absolute right-2.5 top-2.5 bottom-2.5 bg-ai-gradient px-8 rounded-full text-white text-xs font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-ai-purple/30"
                >
                  検索
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-4 text-[10px] text-white/40 font-black uppercase tracking-widest">
                <span>人気検索:</span>
                {["おにぎり", "ラーメン", "桜", "富士山", "寿司", "和食", "ビジネス", "医療"].map(tag => (
                  <button 
                    key={tag} 
                    onClick={() => onSearch ? onSearch(tag) : router.push(`/?q=${encodeURIComponent(tag)}`)} 
                    className="hover:text-white transition-colors"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Featured Card */}
          <div className="hidden lg:block col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="relative aspect-square"
            >
              <div className="absolute inset-0 bg-ai-gradient rounded-[40px] opacity-20 blur-3xl" />
              <div className="relative h-full glass-card rounded-[40px] p-12 flex flex-col items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-checkerboard opacity-5" />
                <motion.img 
                  src="https://jpbjapaozhwahjaardqn.supabase.co/storage/v1/object/public/sukashi-assets/food/onigiri-salted-rice-ball-001.png"
                  alt="Featured Onigiri"
                  animate={{ y: [0, -15, 0], rotate: [0, 2, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="w-[80%] h-[80%] object-contain drop-shadow-[0_50px_100px_rgba(0,0,0,0.8)] z-10"
                />
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-20">
                  <div>
                    <h3 className="text-2xl font-black text-white mb-1">Onigiri</h3>
                    <p className="text-[10px] text-ai-cyan font-bold tracking-widest uppercase">Salted Rice Ball</p>
                  </div>
                  <div className="flex gap-2">
                    <div className="w-10 h-10 glass rounded-xl flex items-center justify-center border-white/10">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-32">
          {[
            { icon: ShieldCheck, title: "高品質PNG素材", desc: "背景透過の高品質PNGをAIで生成・最適", color: "text-ai-purple" },
            { icon: Globe, title: "日本特化コンテンツ", desc: "日本の日常・文化・食を豊富にラインナップ", color: "text-ai-cyan" },
            { icon: Zap, title: "商用利用OK", desc: "クレジット表記なしで商用利用可能", color: "text-success" },
            { icon: MousePointer2, title: "高速ダウンロード", desc: "ワンクリックですぐにダウンロード", color: "text-ai-blue" },
          ].map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="glass-card p-8 rounded-[32px] group"
            >
              <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${feature.color}`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h4 className="text-white font-bold text-lg mb-2">{feature.title}</h4>
              <p className="text-secondary text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
