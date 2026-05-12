"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, X } from "lucide-react";

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
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-ai-purple/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-20 left-1/4 w-[300px] h-[300px] bg-ai-blue/10 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-ai-cyan font-bold tracking-widest text-sm mb-4 uppercase">
            SUKASHI - AI Asset Platform
          </h2>
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            未来のクリエイティブを、<br />
            <span className="text-transparent bg-clip-text bg-ai-gradient neon-text">
              透過PNGで加速させる
            </span>
          </h1>
          <p className="text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-12">
            AI生成による高品質な背景透過素材。商用利用可能、権利クリーン。
            日本のニーズに特化したアセットを、瞬時に検索・ダウンロード。
          </p>
        </motion.div>

        {/* Huge Search Bar */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative max-w-3xl mx-auto group"
        >
          <div className="absolute -inset-1 bg-ai-gradient opacity-30 blur-lg group-hover:opacity-50 transition duration-500 rounded-full" />
          <div className="relative flex items-center bg-black/60 border border-white/10 rounded-full px-8 py-5 backdrop-blur-xl">
            <Search className="w-6 h-6 text-ai-purple mr-4" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="食べ物、ビジネス、季節の素材を検索..."
              className="bg-transparent border-none outline-none w-full text-xl text-white placeholder-secondary"
            />
            {query && (
              <button onClick={() => handleSearch("")} className="p-2 hover:bg-white/5 rounded-full mr-2">
                <X className="w-5 h-5 text-secondary" />
              </button>
            )}
            <button className="bg-ai-gradient hover:opacity-90 text-white px-8 py-2 rounded-full font-bold transition-all shadow-lg shadow-ai-purple/20">
              検索
            </button>
          </div>
          
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
            <span className="text-secondary">急上昇:</span>
            {["ラーメン", "寿司", "ビジネス", "桜", "AI生成"].map((tag) => (
              <button key={tag} onClick={() => handleSearch(tag)} className="text-ai-blue hover:text-ai-cyan transition-colors">
                #{tag}
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
