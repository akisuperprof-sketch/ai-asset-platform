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
    <div className="relative min-h-[100dvh] lg:h-[100dvh] flex flex-col pt-24 lg:pt-28 pb-8 lg:pb-0 overflow-hidden bg-black text-white">
      {/* Background Cinematic Elements */}
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,255,0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-ai-purple/10 rounded-full blur-[150px] opacity-50 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-ai-cyan/10 rounded-full blur-[150px] opacity-40 pointer-events-none" />
      <div className="scanline opacity-20 pointer-events-none" />

      <div className="relative z-10 flex-1 max-w-7xl mx-auto px-6 w-full flex flex-col">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 flex-1 items-center">
          
          {/* Left Content (Typography & Search) */}
          <div className="col-span-1 lg:col-span-6 xl:col-span-7 flex flex-col justify-center h-full pt-12 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-ai-cyan animate-pulse shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.25em]">
                    日本発のAI透過素材プラットフォーム
                  </span>
                </div>
              </div>

              {/* Huge Typography */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-6 lg:mb-8 drop-shadow-2xl">
                AI <span className="bg-ai-gradient bg-clip-text text-transparent [-webkit-background-clip:text]">TRANSPARENT</span><br />
                ASSETS FROM JAPAN
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base lg:text-lg text-secondary max-w-xl leading-relaxed mb-8 lg:mb-10 font-medium">
                日本の日常・文化・食・ビジネスシーンの<br className="hidden sm:block" />
                高品質なPNG素材をAIで生成・収集。商用利用OK。
              </p>

              {/* Search Bar - Neon Glow */}
              <form onSubmit={handleSearch} className="relative max-w-xl group mb-6 lg:mb-8">
                <div className="absolute -inset-1 bg-ai-gradient rounded-[2rem] opacity-30 group-hover:opacity-60 blur-md transition-opacity duration-500" />
                <div className="relative flex items-center bg-black/40 backdrop-blur-2xl border border-white/20 rounded-[2rem] overflow-hidden shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]">
                  <Search className="absolute left-6 w-5 h-5 text-ai-cyan group-focus-within:text-ai-purple transition-colors" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="素材を検索 (例: おにぎり、寿司...)"
                    className="w-full h-14 lg:h-16 bg-transparent px-8 pl-16 text-white placeholder-white/30 focus:outline-none text-sm font-medium"
                  />
                  <div className="pr-2">
                    <button 
                      type="submit"
                      className="bg-ai-gradient px-6 py-2.5 lg:px-8 lg:py-3 rounded-full text-white text-[10px] lg:text-xs font-black uppercase tracking-widest hover:brightness-125 hover:shadow-[0_0_15px_rgba(168,85,247,0.6)] active:scale-95 transition-all"
                    >
                      検索
                    </button>
                  </div>
                </div>
              </form>

              {/* Popular Tags */}
              <div className="flex flex-wrap items-center gap-3 text-[9px] lg:text-[10px] text-white/40 font-black uppercase tracking-widest mb-8 lg:mb-12">
                <span className="text-ai-cyan">人気検索:</span>
                {["おにぎり", "ビジネス", "医療", "桜"].map(tag => (
                  <button 
                    key={tag} 
                    onClick={() => onSearch ? onSearch(tag) : router.push(`/?q=${encodeURIComponent(tag)}`)} 
                    className="hover:text-white transition-colors border border-white/5 rounded-full px-3 py-1 bg-white/5 hover:bg-white/10"
                  >
                    #{tag}
                  </button>
                ))}
              </div>

              {/* Quick Categories (Horizontal Circular Icons) */}
              <div className="w-full max-w-xl">
                <p className="text-[9px] text-white/50 font-black uppercase tracking-[0.3em] mb-4">Quick Categories</p>
                <div className="flex gap-4 lg:gap-6 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 lg:mx-0 lg:px-0">
                  {[
                    { name: "Food", label: "おにぎり", icon: "🍙" },
                    { name: "Medical", label: "医療", icon: "🏥" },
                    { name: "Business", label: "ビジネス", icon: "💼" },
                    { name: "Nature", label: "桜", icon: "🌸" },
                    { name: "Tech", label: "寿司", icon: "🍣" },
                  ].map((cat) => (
                    <button 
                      key={cat.name}
                      onClick={() => router.push(`/?cat=${encodeURIComponent(cat.name)}`)}
                      className="flex flex-col items-center gap-2 lg:gap-3 group shrink-0"
                    >
                      <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-xl lg:text-2xl group-hover:bg-ai-cyan/10 group-hover:border-ai-cyan group-hover:shadow-[0_0_15px_rgba(0,255,255,0.3)] transition-all duration-300">
                        {cat.icon}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-wider text-secondary group-hover:text-ai-cyan transition-colors">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </motion.div>
          </div>

          {/* Right Content (Ninja Visuals) */}
          <div className="col-span-1 lg:col-span-6 xl:col-span-5 h-[400px] lg:h-full relative flex items-center justify-center mt-12 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="relative w-full h-full max-h-[600px] flex items-center justify-center pointer-events-none"
            >
              {/* Neon Rings */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute w-[300px] h-[300px] lg:w-[450px] lg:h-[450px] border border-ai-cyan/20 rounded-full border-dashed"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute w-[250px] h-[250px] lg:w-[350px] lg:h-[350px] border-[0.5px] border-ai-purple/30 rounded-full"
              />
              
              {/* Smoke / Gradient Blurs */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-[200px] h-[200px] lg:w-[300px] lg:h-[300px] bg-white/5 rounded-full blur-[60px]"
              />

              {/* Shuriken Behind Ninja */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 right-1/4 opacity-40 mix-blend-screen"
              >
                <img src="/brand/icon-shuriken.svg" alt="Shuriken" className="w-16 h-16 lg:w-24 lg:h-24" />
              </motion.div>

              {/* Main Ninja Character */}
              <motion.img 
                src="/brand/ninja-char-1.png"
                alt="AssetNinja Mascot"
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="w-full h-full object-contain max-w-[80%] max-h-[80%] drop-shadow-[0_0_50px_rgba(0,255,255,0.2)] z-10"
              />

              {/* Floating Asset UI Concept */}
              <motion.div
                animate={{ y: [0, 10, 0], opacity: [0, 1, 1, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-1/4 left-10 lg:left-0 glass-card px-4 py-2 rounded-xl border-ai-cyan/30 flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-ai-cyan animate-pulse" />
                <span className="text-[9px] font-black uppercase text-ai-cyan tracking-widest">Alpha Extracted</span>
              </motion.div>

            </motion.div>
          </div>
        </div>

        {/* Bottom Stats Bar (Anchored to bottom on PC, relative on Mobile) */}
        <div className="mt-8 lg:mt-auto mb-8 lg:mb-12 w-full glass rounded-2xl lg:rounded-full px-6 py-4 lg:py-6 border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] border-t border-t-white/10 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ai-gradient flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <span className="text-white font-black text-sm">10k+</span>
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wide">High-Quality Assets</p>
              <p className="text-[9px] text-ai-cyan font-black uppercase tracking-[0.2em]">Ready to Use</p>
            </div>
          </div>

          <div className="w-full lg:w-px h-px lg:h-8 bg-white/10" />

          <div className="flex flex-wrap justify-center gap-6 lg:gap-12">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              <span className="text-xs font-black uppercase tracking-widest text-white">即時ダウンロード</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-ai-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.6)]" />
              <span className="text-xs font-black uppercase tracking-widest text-white">商用利用OK</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-ai-purple drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
              <span className="text-xs font-black uppercase tracking-widest text-white">日本特化品質</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
