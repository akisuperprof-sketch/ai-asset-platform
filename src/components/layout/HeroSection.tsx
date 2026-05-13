"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, X, Sparkles } from "lucide-react";

export function HeroSection({ 
  onSearch, 
  initialQuery = "" 
}: { 
  onSearch: (query: string) => void;
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  const handleSearch = (q: string) => {
    setQuery(q);
    onSearch(q);
  };

  return (
    <section className="relative pt-40 pb-32 px-4 overflow-hidden border-b border-white/5">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="scanline" />
      
      {/* Dynamic Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[600px] bg-ai-purple/15 blur-[140px] rounded-full pointer-events-none animate-pulse-slow" />
      <div className="absolute top-40 left-1/4 w-[400px] h-[400px] bg-ai-blue/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-ai-purple/20 mb-8 animate-bounce-subtle">
            <Sparkles className="w-4 h-4 text-ai-cyan" />
            <span className="text-ai-cyan font-bold tracking-[0.2em] text-[10px] uppercase">
              Next-Gen AI Asset Platform
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-10 leading-[1.05] tracking-tight">
            想像力を、<br />
            <span className="text-transparent bg-clip-text bg-ai-gradient neon-text">
              透過素材で解放する
            </span>
          </h1>
          
          <p className="text-secondary text-lg md:text-2xl max-w-3xl mx-auto mb-16 leading-relaxed">
            AIが生成した高品質な背景透過PNG。
            <span className="text-white"> 日本のクリエイティブに最適化</span>された、
            美しく、権利クリーンなアセット。
          </p>
        </motion.div>

        {/* Search Experience */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-4xl mx-auto group"
        >
          <div className="absolute -inset-2 bg-ai-gradient opacity-10 blur-2xl group-hover:opacity-20 transition duration-700 rounded-[40px]" />
          
          <div className="relative flex items-center bg-white/[0.03] border border-white/10 rounded-[30px] p-2 backdrop-blur-3xl focus-within:border-ai-purple/50 transition-all shadow-2xl">
            <div className="pl-6 pr-4">
              <Search className="w-7 h-7 text-secondary group-focus-within:text-ai-purple transition-colors" />
            </div>
            
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="何をお探しですか？ (例: おにぎり、ビジネス、桜...)"
              className="bg-transparent border-none outline-none flex-1 text-xl md:text-2xl text-white placeholder-secondary/50 py-6"
            />
            
            {query && (
              <button 
                onClick={() => handleSearch("")} 
                className="p-3 hover:bg-white/5 rounded-full mr-2 transition-colors"
              >
                <X className="w-6 h-6 text-secondary" />
              </button>
            )}
            
            <button className="bg-white text-black hover:bg-f5f5f7 px-10 py-5 rounded-[22px] font-bold text-lg transition-all active:scale-95">
              検索
            </button>
          </div>
          
          <div className="mt-10 flex flex-wrap justify-center gap-4 text-sm md:text-base">
            <span className="text-secondary/60">人気のタグ:</span>
            {["ラーメン", "寿司", "ビジネス", "春", "AI生成", "医療"].map((tag) => (
              <button 
                key={tag} 
                onClick={() => handleSearch(tag)} 
                className="px-4 py-1.5 rounded-full glass border-white/5 hover:border-ai-purple hover:text-white transition-all text-secondary"
              >
                #{tag}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
