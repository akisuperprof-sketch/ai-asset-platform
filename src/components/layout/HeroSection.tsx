"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap, ShieldCheck, Globe, Download, Heart, Compass, Sparkles, Terminal, Cpu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface HeroSectionProps {
  onSearch?: (query: string) => void;
  initialCount?: number;
}

export function HeroSection({ onSearch, initialCount = 31 }: HeroSectionProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  const searchInputRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  // Handle actual query search
  const handleSearch = (searchQuery: string) => {
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      router.push(`/?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      handleSearch(query);
    }
  };

  // Typing simulator effect for OS feeling
  useEffect(() => {
    if (query.length > 0) {
      setIsSearching(true);
      const timer = setTimeout(() => setIsSearching(false), 800);
      return () => clearTimeout(timer);
    } else {
      setIsSearching(false);
    }
  }, [query]);

  // Click outside to close search suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchInputRef.current && !searchInputRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full h-[100dvh] flex flex-col justify-between overflow-hidden bg-black text-white select-none">
      
      {/* Background Animated Atmosphere */}
      <div className="absolute inset-0 bg-grid opacity-5 animate-grid-drift pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.01),transparent_70%)] pointer-events-none" />
      
      {/* Deep Blue/Cyan Smoke Aura Behind */}
      <div className="absolute top-[10%] right-[10%] w-[60vw] h-[55vh] bg-blue-600/5 rounded-full blur-[180px] opacity-45 pointer-events-none animate-aura-pulse" />
      <div className="absolute bottom-[5%] left-[5%] w-[50vw] h-[50vh] bg-ai-cyan/5 rounded-full blur-[160px] opacity-40 pointer-events-none animate-aura-pulse" style={{ animationDelay: "-4s" }} />
      <div className="scanline opacity-10 pointer-events-none" />

      {/* Floating Neon Micro-Dust Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-ai-cyan/30"
            initial={{ 
              x: Math.random() * 1920, 
              y: Math.random() * 1080,
              opacity: 0.1 + Math.random() * 0.4
            }}
            animate={{
              y: [null, Math.random() * -100, Math.random() * -200],
              opacity: [0.1, 0.6, 0.1]
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              filter: "blur(0.5px)"
            }}
          />
        ))}
      </div>

      {/* Main Container: Split into 3 strict stacked layers for Visual focus */}
      <div className="relative z-20 flex-1 max-w-7xl mx-auto px-6 w-full flex flex-col justify-between h-full pt-16 lg:pt-20 pb-2">
        
        {/* ========================================== */}
        {/* LAYER 1: BRAND TITLE & MASCOT (TOP) */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
          
          {/* Typographical Left block */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-3">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-3"
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/[0.02] border border-white/5 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                <span className="text-[9px] font-black text-secondary tracking-[0.25em] uppercase">
                  日本発・最高峰AI透過素材OS
                </span>
              </div>

              {/* Huge Unified Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-[2.6rem] xl:text-[3.2rem] font-black text-white leading-[1.0] tracking-tighter drop-shadow-3xl flex flex-col">
                <span>
                  AI <span className="bg-ai-gradient bg-clip-text text-transparent">ASSETS</span>
                </span>
                <span className="text-amber-500/80 font-serif font-light flex items-center gap-2">
                  FROM JAPAN
                  <span className="text-xl drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">✦</span>
                </span>
              </h1>

              {/* Paragraph Info & Combined Gold Glass Status Card */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                <p className="text-[12px] text-secondary leading-relaxed font-semibold max-w-sm">
                  日本の日常・伝統食・文化・ビジネス・医療シーンの極めて精巧な背景透過PNG素材。
                </p>
                <div className="gold-glass rounded-xl px-3.5 py-2 text-left relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 gold-shimmer pointer-events-none" />
                  <div className="text-[9px] font-black text-amber-500/80 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 fill-amber-500/10" />
                    +20 ASSETS TODAY • FREE COMMERCIAL USE
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Scaled Up Interactive Mascot (Right) */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.1 }}
              className="relative w-full h-[180px] sm:h-[220px] lg:h-[250px] flex items-center justify-center"
            >
              {/* Spinning Neon Rings in the foreground & background */}
              <div className="absolute w-[220px] h-[220px] lg:w-[280px] lg:h-[280px] border border-ai-cyan/15 rounded-full border-dashed animate-slow-spin pointer-events-none z-0" />
              <div className="absolute w-[200px] h-[200px] lg:w-[250px] lg:h-[250px] border-[0.5px] border-ai-purple/20 rounded-full animate-slow-reverse-spin pointer-events-none z-0" />
              
              {/* Head Glow */}
              <div className="absolute w-[160px] h-[160px] lg:w-[200px] lg:h-[200px] bg-amber-500/5 rounded-full blur-[35px] animate-aura-pulse pointer-events-none z-0" />

              {/* Mascot 1.35x Larger and Moved Closer to Center */}
              <motion.div
                whileHover={{ scale: 1.04, rotate: 1 }}
                className="relative w-full h-full max-w-[95%] max-h-[95%] z-20 flex items-center justify-center drop-shadow-[0_0_35px_rgba(245,158,11,0.2)] cursor-pointer animate-float-slow"
              >
                {!imgError ? (
                  <Image 
                    src="/brand/ninja-char-1.png"
                    alt="Cyber Ninja Mascot"
                    fill
                    sizes="(max-width: 768px) 75vw, (max-width: 1200px) 45vw"
                    className="object-contain"
                    priority
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 z-20">
                    <img src="/brand/icon-shuriken.svg" alt="Loading" className="w-10 h-10 opacity-30 animate-spin" style={{ animationDuration: '3s' }} />
                    <span className="text-[9px] text-ai-cyan font-black tracking-widest uppercase">Stealth Mode Active</span>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </div>

        </div>

        {/* ========================================== */}
        {/* LAYER 2: THE MAJESTIC SEARCH OS BAR (CENTER) */}
        {/* ========================================== */}
        <div className="w-full flex flex-col items-center justify-center my-auto py-2">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="w-full max-w-4xl relative"
          >
            {/* Search OS Info Badge */}
            <div className="w-full flex items-center justify-between mb-2.5 px-3">
              <span className="text-[8px] font-black text-white/40 tracking-[0.2em] uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-ai-cyan animate-pulse" /> CENTRAL SEARCH ENGINE OS
              </span>
              <span className="text-[9px] font-black text-amber-500/80 bg-amber-500/5 border border-amber-500/15 px-3 py-0.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.05)]">
                {initialCount}+ TRANSPARENT PNG INDEXED
              </span>
            </div>

            {/* Huge Glow Form Input */}
            <form onSubmit={onSubmit} className="relative group w-full z-40" ref={searchInputRef}>
              <div className="absolute -inset-1.5 bg-ai-gradient rounded-[2.5rem] opacity-30 group-hover:opacity-55 blur-lg transition-opacity duration-500 pointer-events-none" />
              <div className={`relative flex items-center bg-black/80 backdrop-blur-3xl border ${isFocused ? "border-amber-500/50 shadow-[0_0_35px_rgba(245,158,11,0.2)]" : "border-white/15"} rounded-[2.5rem] overflow-hidden transition-all duration-300 h-14 lg:h-16`}>
                <Search className={`absolute left-6 w-5 h-5 ${isFocused ? "text-amber-500/80" : "text-ai-cyan"} transition-colors`} />
                
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  placeholder="おにぎり、寿司、医療を検索"
                  className="w-full h-full bg-transparent px-8 pl-14 lg:pl-16 text-white placeholder-white/30 focus:outline-none text-[14px] lg:text-[15px] font-semibold tracking-wide"
                />

                {query && (
                  <button 
                    type="button" 
                    onClick={() => setQuery("")}
                    className="absolute right-24 text-[9px] text-white/40 hover:text-white uppercase font-black tracking-widest mr-3 transition-colors"
                  >
                    CLEAR
                  </button>
                )}

                <div className="pr-2">
                  <button 
                    type="submit"
                    className="bg-ai-gradient px-7 py-3 rounded-full text-white text-[10px] font-black uppercase tracking-widest hover:brightness-125 hover:shadow-[0_0_20px_rgba(168,85,247,0.7)] active:scale-95 transition-all whitespace-nowrap"
                  >
                    検索 OS 起動
                  </button>
                </div>
              </div>

              {/* Suggestions Popup (Raycast/Vercel inspired UI) */}
              <AnimatePresence>
                {isFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.99 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 right-0 mt-3.5 bg-black/95 border border-white/10 rounded-[1.8rem] p-5 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.95),0_0_50px_rgba(255,255,255,0.02)] overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Section 1: Recent */}
                      <div className="space-y-3">
                        <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.22em] px-1 flex items-center gap-1.5">
                          <Terminal className="w-3 h-3 text-ai-cyan" /> RECENT QUERIES
                        </div>
                        <div className="flex flex-col gap-1">
                          {["おにぎり", "桜", "医療"].map(tag => (
                            <button 
                              type="button"
                              key={tag} 
                              onClick={() => {
                                setQuery(tag);
                                handleSearch(tag);
                                setIsFocused(false);
                              }}
                              className="text-[11px] font-bold text-white/70 hover:text-white text-left transition-colors bg-white/[0.02] hover:bg-white/5 rounded-xl px-3 py-2 border border-white/5"
                            >
                              # {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Section 2: Trending */}
                      <div className="space-y-3">
                        <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.22em] px-1 flex items-center gap-1.5">
                          <Zap className="w-3 h-3 text-amber-500/80 fill-amber-500/10" /> TRENDING NOW
                        </div>
                        <div className="flex flex-col gap-1">
                          {["ラーメン", "富士山", "ビジネス"].map(tag => (
                            <button 
                              type="button"
                              key={tag} 
                              onClick={() => {
                                setQuery(tag);
                                handleSearch(tag);
                                setIsFocused(false);
                              }}
                              className="text-[11px] font-bold text-amber-500/80 hover:text-amber-400 text-left transition-colors bg-amber-500/[0.02] hover:bg-amber-500/[0.05] rounded-xl px-3 py-2 border border-amber-500/10"
                            >
                              ✦ {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Section 3: AI Recommended */}
                      <div className="space-y-3">
                        <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.22em] px-1 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-ai-purple fill-ai-purple/10" /> AI SUGGESTED
                        </div>
                        <div className="flex flex-col gap-1">
                          {["寿司", "お守り", "招き猫"].map(tag => (
                            <button 
                              type="button"
                              key={tag} 
                              onClick={() => {
                                setQuery(tag);
                                handleSearch(tag);
                                setIsFocused(false);
                              }}
                              className="text-[11px] font-bold text-purple-300 hover:text-purple-200 text-left transition-colors bg-purple-500/[0.02] hover:bg-purple-500/[0.05] rounded-xl px-3 py-2 border border-purple-500/10"
                            >
                              ✧ {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Searching Status Indicator */}
            <div className="h-6 mt-3 flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                {isSearching ? (
                  <motion.span
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-[9px] font-black text-ai-cyan tracking-[0.2em] uppercase flex items-center gap-1.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-ai-cyan animate-ping" />
                    SEARCHING NEURAL DATASPACES...
                  </motion.span>
                ) : (
                  <motion.span
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[9px] font-black text-white/20 tracking-[0.2em] uppercase flex items-center gap-1.5"
                  >
                    NEURAL ENGINE CONNECTED <span className="text-[11px] animate-pulse">|</span> READY TO QUERY
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* ========================================== */}
        {/* LAYER 3: CATEGORIES BAR & SYSTEM FOOTER (BOTTOM) */}
        {/* ========================================== */}
        <div className="flex flex-col w-full z-20 mt-auto pb-1">
          
          {/* Quick Categories Bar (High-End Glass Panel) */}
          <div className="w-full max-w-4xl mx-auto glass rounded-[1.5rem] border-white/10 shadow-2xl p-3 mb-3 relative">
            <div className="flex gap-4 overflow-x-auto no-scrollbar justify-start md:justify-center items-center px-4">
              {[
                { name: "Food", label: "おにぎり/和食", icon: "🍙" },
                { name: "Japan", label: "和風/伝統", icon: "🌸" },
                { name: "Medical", label: "医療/クリニック", icon: "🏥" },
                { name: "Business", label: "ビジネス/オフィス", icon: "💼" },
                { name: "Festival", label: "年中行事/お祭り", icon: "🗻" },
                { name: "More", label: "全素材一覧", icon: "✦" },
              ].map((cat) => (
                <button 
                  key={cat.name}
                  onClick={() => cat.name === "More" ? router.push('/?cat=すべて') : router.push(`/?cat=${encodeURIComponent(cat.name)}`)}
                  className="flex flex-col items-center gap-2 group shrink-0 relative"
                >
                  <div className="w-12 h-12 rounded-full bg-black/60 border border-white/10 flex items-center justify-center text-xl group-hover:bg-ai-gradient group-hover:border-transparent group-hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] group-hover:scale-105 active:scale-95 transition-all duration-300">
                    <span className="group-hover:scale-110 transition-transform">{cat.icon}</span>
                  </div>
                  <span className="text-[9px] lg:text-[10px] font-black tracking-wider text-secondary group-hover:text-white transition-colors">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Premium OS Live Status Footer */}
          <div className="flex justify-between items-center w-full max-w-5xl mx-auto border-t border-white/5 pt-2.5 text-[9px] lg:text-[10px] font-black tracking-[0.22em] text-white/35">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_6px_rgba(48,209,88,0.8)]" />
              SYSTEM ONLINE
            </span>
            <span className="hidden sm:inline text-white/15">|</span>
            <span className="hover:text-ai-purple transition-colors uppercase">
              {initialCount} PNGS INDEXED
            </span>
            <span className="hidden sm:inline text-white/15">|</span>
            <span className="hover:text-ai-cyan transition-colors uppercase">
              AI POWERED PLATFORM
            </span>
            <span className="hidden md:inline text-white/15">|</span>
            <span className="flex items-center gap-2 hover:text-white transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
              TOKYO JP EDGE NODE
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
