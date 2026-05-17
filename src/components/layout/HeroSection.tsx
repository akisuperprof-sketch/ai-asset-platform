"use client";

import { motion } from "framer-motion";
import { Search, Zap, ShieldCheck, Globe, Download, MousePointer2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import Image from "next/image";

export function HeroSection({ onSearch }: { onSearch?: (query: string) => void }) {
  const [query, setQuery] = useState("");
  const [imgError, setImgError] = useState(false);
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

      <div className="relative z-10 flex-1 max-w-7xl mx-auto px-6 w-full flex flex-col justify-between h-full pt-4 lg:pt-8">
        
        {/* Top Half: Typography & Mascot */}
        <div className="flex flex-col lg:flex-row items-center justify-between w-full flex-shrink-0">
          
          {/* Left Content (Typography) */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center pt-8 lg:pt-0">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Badge */}
              <div className="flex items-center gap-3 mb-4 lg:mb-6">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-ai-cyan animate-pulse shadow-[0_0_8px_rgba(0,255,255,0.8)]" />
                  <span className="text-[10px] font-black text-white uppercase tracking-[0.25em]">
                    日本発のAI透過素材プラットフォーム
                  </span>
                </div>
              </div>

              {/* Huge Typography */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-black text-white leading-[0.9] tracking-tighter mb-4 lg:mb-6 drop-shadow-2xl flex flex-col gap-1 lg:gap-2">
                <span className="flex items-center gap-2 lg:gap-4">
                  AI <span className="bg-ai-gradient bg-clip-text text-transparent">ASSETS</span>
                  <span className="text-amber-400 font-serif font-light opacity-90 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">✦</span>
                </span>
                <span>FROM JAPAN</span>
              </h1>

              {/* Description */}
              <p className="text-sm sm:text-base lg:text-lg text-secondary max-w-lg leading-relaxed font-medium">
                日本の日常・文化・食・ビジネスシーンの<br className="hidden sm:block" />
                高品質なPNG素材をAIで生成・収集。商用利用OK。
              </p>
            </motion.div>
          </div>

          {/* Right Content (Ninja Visuals) */}
          <div className="w-full lg:w-1/2 h-[250px] sm:h-[300px] lg:h-[450px] relative flex items-center justify-center mt-6 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="relative w-full h-full flex items-center justify-center pointer-events-none"
            >
              {/* Neon Rings */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute w-[250px] h-[250px] lg:w-[400px] lg:h-[400px] border border-ai-cyan/20 rounded-full border-dashed"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute w-[200px] h-[200px] lg:w-[320px] lg:h-[320px] border-[0.5px] border-ai-purple/30 rounded-full"
              />
              
              {/* Smoke / Gradient Blurs */}
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-[150px] h-[150px] lg:w-[250px] lg:h-[250px] bg-white/5 rounded-full blur-[60px]"
              />

              {/* Shuriken Behind Ninja */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/4 right-1/4 opacity-40 mix-blend-screen"
              >
                <img src="/brand/icon-shuriken.svg" alt="Shuriken" className="w-12 h-12 lg:w-20 lg:h-20" />
              </motion.div>

              {/* Main Ninja Character (Next.js Image) */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative w-full h-full max-w-[90%] max-h-[90%] z-10 flex items-center justify-center drop-shadow-[0_0_50px_rgba(0,255,255,0.3)] opacity-95"
              >
                {!imgError ? (
                  <Image 
                    src="/brand/ninja-mascot.webp"
                    alt="Cyber Ninja Mascot"
                    fill
                    sizes="(max-width: 768px) 80vw, (max-width: 1200px) 50vw, 40vw"
                    className="object-contain"
                    priority
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-4">
                    <img src="/brand/icon-shuriken.svg" alt="Loading" className="w-20 h-20 opacity-30 animate-spin" style={{ animationDuration: '3s' }} />
                    <span className="text-[10px] text-ai-cyan font-black tracking-widest uppercase">Stealth Mode</span>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Half: Search & Categories */}
        <div className="flex flex-col w-full z-20 mt-4 lg:mt-8 pb-8 lg:pb-12">
          
          {/* Centered Search Bar */}
          <div className="w-full max-w-3xl mx-auto mb-4">
            <form onSubmit={handleSearch} className="relative group w-full">
              <div className="absolute -inset-1 bg-ai-gradient rounded-[2rem] opacity-30 group-hover:opacity-60 blur-md transition-opacity duration-500" />
              <div className="relative flex items-center bg-black/60 backdrop-blur-3xl border border-white/20 rounded-[2rem] overflow-hidden shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]">
                <Search className="absolute left-6 w-5 h-5 text-ai-cyan group-focus-within:text-ai-purple transition-colors" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="素材を検索 (例: おにぎり、寿司、ビジネス...)"
                  className="w-full h-14 lg:h-16 bg-transparent px-8 pl-16 text-white placeholder-white/30 focus:outline-none text-sm lg:text-base font-medium"
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
          </div>

          {/* Popular Tags */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-[9px] lg:text-[10px] text-white/40 font-black uppercase tracking-widest mb-8 lg:mb-10">
            <span className="text-ai-cyan">人気検索:</span>
            {["おにぎり", "ラーメン", "桜", "富士山", "寿司", "和食", "ビジネス", "医療"].map(tag => (
              <button 
                key={tag} 
                onClick={() => onSearch ? onSearch(tag) : router.push(`/?q=${encodeURIComponent(tag)}`)} 
                className="hover:text-white transition-colors border border-white/10 rounded-full px-3 py-1 bg-white/5 hover:bg-white/10"
              >
                #{tag}
              </button>
            ))}
          </div>

          {/* Quick Categories Bar (Glass Panel) */}
          <div className="w-full max-w-5xl mx-auto glass rounded-[2rem] border-white/10 shadow-2xl p-4 lg:p-6 mb-6">
            <div className="flex gap-4 lg:gap-8 overflow-x-auto no-scrollbar justify-start md:justify-center items-center px-4 lg:px-0">
              {[
                { name: "Food", label: "おにぎり", icon: "🍙" },
                { name: "Ramen", label: "ラーメン", icon: "🍜" },
                { name: "Nature", label: "桜", icon: "🌸" },
                { name: "Mountain", label: "富士山", icon: "🗻" },
                { name: "Sushi", label: "寿司", icon: "🍣" },
                { name: "Japanese", label: "和食", icon: "🍱" },
                { name: "Business", label: "ビジネス", icon: "💼" },
                { name: "Medical", label: "医療", icon: "🏥" },
                { name: "More", label: "もっと見る", icon: "..." },
              ].map((cat) => (
                <button 
                  key={cat.name}
                  onClick={() => cat.name === "More" ? router.push('/?cat=すべて') : router.push(`/?cat=${encodeURIComponent(cat.name)}`)}
                  className="flex flex-col items-center gap-3 group shrink-0"
                >
                  <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-2xl group-hover:bg-ai-gradient group-hover:border-transparent group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300">
                    <span className="group-hover:scale-110 transition-transform">{cat.icon}</span>
                  </div>
                  <span className="text-[10px] font-black tracking-wider text-secondary group-hover:text-white transition-colors">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Minimal Bottom Footer */}
          <div className="flex justify-center items-center gap-4 text-[9px] font-black tracking-[0.3em] text-white/30">
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-600"></span>MADE IN JAPAN</span>
            <span className="hidden sm:inline">|</span>
            <span className="hidden sm:inline hover:text-ai-purple transition-colors">AI POWERED</span>
            <span className="hidden md:inline">|</span>
            <span className="hidden md:inline hover:text-ai-cyan transition-colors">TRANSPARENT PNG</span>
          </div>

        </div>
    </div>
  );
}
