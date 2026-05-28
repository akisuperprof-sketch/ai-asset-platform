"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap, ShieldCheck, Globe, Download, Heart, Compass, Sparkles, Terminal, Cpu, Flame } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

import { Asset } from "@/types";
import { AssetCard } from "@/components/assets/AssetCard";

interface HeroSectionProps {
  onSearch?: (query: string) => void;
  initialCount?: number;
  todayAdded?: number;
  categoryCounts?: Record<string, number>;
  premiumAssets?: Asset[];
}

const formatCountBadge = (count: number) => {
  if (count >= 5000) return "5K+";
  if (count >= 1000) return "1K+";
  if (count >= 500) return "500+";
  if (count >= 100) return "100+";
  return count.toString();
};

export function HeroSection({ 
  onSearch, 
  initialCount = 30, 
  todayAdded = 0, 
  categoryCounts = {},
  premiumAssets = []
}: HeroSectionProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [imgError, setImgError] = useState(false);
  
  // Real-time Stats Engine
  const [realtimeCount, setRealtimeCount] = useState(initialCount);
  const [realtimeTodayAdded, setRealtimeTodayAdded] = useState(todayAdded);
  const [realtimeCategories, setRealtimeCategories] = useState<Record<string, number>>(categoryCounts);
  const [trendingTags, setTrendingTags] = useState<string[]>(["寿司", "ラーメン", "和柄", "富士山", "ビジネス"]);
  
  // Cyber Live simulation engines
  

  

  const searchInputRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  // Fetch real stats on client mount and every 30s
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setRealtimeCount(data.publishedAssets || data.totalAssets || initialCount);
            setRealtimeTodayAdded(data.todayAdded ?? todayAdded);
            if (data.categoryCounts) setRealtimeCategories(data.categoryCounts);
            
            // Extract top tags dynamically for TRENDING SEARCH
            if (data.tagCounts) {
              const sortedTags = Object.entries(data.tagCounts)
                .sort((a: any, b: any) => b[1] - a[1])
                .slice(0, 5)
                .map(t => t[0]);
              if (sortedTags.length > 0) setTrendingTags(sortedTags);
            }
          }
        }
      } catch (err) {
        console.warn("Stats real-time fetch error:", err);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [initialCount, todayAdded]);

  

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
    <div className="relative w-full min-h-[660px] lg:min-h-[720px] xl:min-h-[800px] h-auto flex flex-col justify-between overflow-hidden bg-transparent text-white select-none py-12 md:py-16 lg:py-20">
      
      {/* Cyber Stealth Ninja Overlay (Z-0) - Crosses from right to left */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        <div 
          className="absolute right-[5%] top-[15%] w-[260px] h-[260px] md:w-[360px] md:h-[360px] opacity-0"
          style={{
            animation: "hero-ninja-stealth 9s cubic-bezier(0.25, 1, 0.5, 1) forwards",
          }}
        >
          <Image
            src="/brand/ninja-char-1.png"
            alt="Stealth Ninja Background"
            fill
            className="object-contain"
            style={{
              filter: "brightness(0.7) drop-shadow(0 0 15px rgba(0,200,255,0.1))",
              maskImage: "radial-gradient(circle at center, white 40%, transparent 95%)",
              WebkitMaskImage: "radial-gradient(circle at center, white 40%, transparent 95%)",
            }}
          />
        </div>
      </div>

      {/* Main Container: Split into 3 strict stacked layers for Visual focus */}
      <div className="relative z-20 flex-1 max-w-7xl mx-auto px-4 sm:px-6 w-full flex flex-col justify-between gap-10 pt-4 pb-2">
        
        {/* ========================================== */}
        {/* LAYER 1: BRAND TITLE & MASCOT (TOP) */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
          
          {/* Typographical Left block */}
          <div className="lg:col-span-7 flex flex-col justify-center text-left space-y-3">
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-3"
            >
              {/* Badge - Upgraded to S-Tier Slogan */}
              <div className="inline-flex items-center gap-2 bg-white/[0.01] border border-white/5 px-3.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                <span className="text-[9px] font-black text-secondary tracking-[0.25em] uppercase">
                  THE JAPANESE TRANSPARENT ASSET OS
                </span>
              </div>

              {/* Huge Unified Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-[2.6rem] xl:text-[3.2rem] font-black text-white leading-[1.0] tracking-tighter drop-shadow-3xl flex flex-col">
                <span>
                  TRANSPARENT <span className="inline-block bg-ai-gradient bg-clip-text text-transparent [-webkit-background-clip:text]">ASSETS</span>
                </span>
                <span className="text-amber-500/80 font-serif font-light flex items-center gap-2">
                  FROM JAPAN
                  <span className="text-xl drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">✦</span>
                </span>
              </h1>

              {/* Paragraph Info & Combined Gold Glass Status Card */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-1">
                <p className="text-[12px] text-secondary leading-relaxed font-semibold max-w-sm">
                  Premium PNG materials for creators.<br/>
                  高品質な透過PNG素材を、日本から。
                </p>
                <div className="gold-glass rounded-xl px-3.5 py-2 text-left relative overflow-hidden shrink-0 border border-amber-500/10">
                  <div className="absolute inset-0 gold-shimmer pointer-events-none" />
                  <div className="text-[9px] font-black text-amber-500/80 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 fill-amber-500/10 text-amber-400" />
                    +{realtimeTodayAdded} ADDED TODAY • QUALITY VERIFIED
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Scaled Up Interactive Mascot (Right) */}
          <div className="lg:col-span-5 flex items-center justify-center relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 1.5, delay: 0.1, ease: "easeOut" }}
              className="relative w-full h-[180px] sm:h-[220px] lg:h-[250px] flex items-center justify-center"
            >
              {/* Ghost Silhouette Background Layer (Z-0) */}
              <div className="absolute w-[280px] h-[280px] lg:w-[350px] lg:h-[350px] opacity-[0.035] blur-[1px] pointer-events-none z-0 transform translate-x-[-12%] translate-y-[-6%] select-none">
                <Image 
                  src="/brand/ninja-char-1.png"
                  alt="Ninja Ghost Silhouette"
                  fill
                  className="object-contain filter grayscale scale-125 animate-pulse"
                />
              </div>

              {/* Spinning Neon Rings in the foreground & background - Ultra thin borders */}
              <div className="absolute w-[220px] h-[220px] lg:w-[280px] lg:h-[280px] border border-ai-cyan/10 rounded-full border-dashed animate-slow-spin pointer-events-none z-0" />
              <div className="absolute w-[200px] h-[200px] lg:w-[250px] lg:h-[250px] border-[0.5px] border-ai-purple/10 rounded-full animate-slow-reverse-spin pointer-events-none z-0" />
              
              {/* Head Glow */}
              <div className="absolute w-[160px] h-[160px] lg:w-[200px] lg:h-[200px] bg-amber-500/5 rounded-full blur-[35px] animate-aura-pulse pointer-events-none z-0" />

              {/* Mascot 1.35x Larger and Moved Closer to Center */}
              <motion.div
                whileHover={{ scale: 1.03, rotate: 0.5 }}
                className="relative w-full h-full max-w-[95%] max-h-[95%] z-20 flex items-center justify-center drop-shadow-[0_0_35px_rgba(245,158,11,0.15)] cursor-pointer animate-float-slow"
              >
                {!imgError ? (
                  <Image 
                    src="/brand/ninja-char-1.png"
                    alt="Cyber Ninja Mascot"
                    fill
                    sizes="(max-width: 768px) 75vw, (max-width: 1200px) 45vw"
                    className="object-contain"
                    style={{
                      maskImage: "linear-gradient(to bottom, white 70%, transparent 100%), linear-gradient(to left, white 80%, transparent 100%)",
                      WebkitMaskImage: "linear-gradient(to bottom, white 70%, transparent 100%), linear-gradient(to left, white 80%, transparent 100%)",
                    }}
                    priority
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-3 z-20">
                    <img src="/brand/icon-shuriken.svg" alt="Loading" className="w-10 h-10 opacity-20 animate-spin" style={{ animationDuration: '3s' }} />
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="w-full max-w-4xl relative"
          >
            {/* Search OS Info Badge */}
            <div className="w-full flex items-center justify-between mb-2.5 px-3">
              <span className="text-[8px] font-black text-white/40 tracking-[0.2em] uppercase flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-ai-cyan animate-pulse" /> CENTRAL SEARCH ENGINE OS
              </span>
              <span className="text-[9px] font-black text-amber-500/80 bg-amber-500/5 border border-amber-500/10 px-3 py-0.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.03)]">
                CURATED PREMIUM PNG COLLECTION
              </span>
            </div>

            {/* Huge Glow Form Input - Height increased to 72px (SaaS Luxury OS-002) */}
            <form onSubmit={onSubmit} className="relative group w-full z-40" ref={searchInputRef}>
              <div className="absolute -inset-1.5 bg-ai-gradient rounded-[2.5rem] opacity-20 group-hover:opacity-40 blur-lg transition-opacity duration-500 pointer-events-none" />
              <div className={`relative flex items-center bg-black/90 backdrop-blur-3xl border ${isFocused ? "border-amber-500/30 shadow-[0_0_35px_rgba(245,158,11,0.15)]" : "border-white/5"} rounded-[2.5rem] overflow-hidden transition-all duration-300 h-16 lg:h-[72px]`}>
                <Search className={`absolute left-6 w-5 h-5 ${isFocused ? "text-amber-500/80" : "text-ai-cyan"} transition-colors`} />
                
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  placeholder="Search: sakura / ramen / torii gate / matcha / onigiri ..."
                  className="w-full h-full bg-transparent px-8 pl-14 lg:pl-16 text-white placeholder-white/20 focus:outline-none text-[14px] lg:text-[15px] font-semibold tracking-wide"
                />

                {query && (
                  <button 
                    type="button" 
                    onClick={() => setQuery("")}
                    className="absolute right-28 text-[9px] text-white/40 hover:text-white uppercase font-black tracking-widest mr-3 transition-colors"
                  >
                    CLEAR
                  </button>
                )}

                <div className="pr-2.5">
                  <button 
                    type="submit"
                    className="bg-ai-gradient px-7 py-3.5 rounded-full text-white text-[10px] font-black uppercase tracking-widest hover:brightness-110 hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] active:scale-95 transition-all whitespace-nowrap flex items-center gap-1.5"
                  >
                    検索 OS 起動
                    <span className="text-[8px] opacity-40 px-1 py-0.5 bg-white/10 rounded font-mono">⏎</span>
                  </button>
                </div>
              </div>

              {/* Suggestions Popup (Raycast/Vercel inspired UI) - Thin borders */}
              <AnimatePresence>
                {isFocused && (
                  <motion.div
                    initial={{ opacity: 0, y: 12, scale: 0.995 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.995 }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-0 right-0 mt-3.5 bg-black/95 border border-white/5 rounded-[1.8rem] p-5 backdrop-blur-3xl shadow-[0_30px_60px_rgba(0,0,0,0.95),0_0_50px_rgba(255,255,255,0.01)] overflow-hidden"
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
                              className="text-[11px] font-bold text-white/70 hover:text-white text-left transition-colors bg-white/[0.01] hover:bg-white/5 rounded-xl px-3 py-2 border border-white/5"
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
                              className="text-[11px] font-bold text-amber-500/80 hover:text-amber-400 text-left transition-colors bg-amber-500/[0.01] hover:bg-amber-500/[0.05] rounded-xl px-3 py-2 border border-amber-500/10"
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
                              className="text-[11px] font-bold text-purple-300 hover:text-purple-200 text-left transition-colors bg-purple-500/[0.01] hover:bg-purple-500/[0.05] rounded-xl px-3 py-2 border border-purple-500/10"
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

            {/* Popular Assets Showcase */}
            <div className="mt-4 w-full">
              <AnimatePresence mode="wait">
                {isSearching ? (
                  <div className="h-6 flex items-center justify-center">
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase flex items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-ping" />
                      SEARCHING ASSETS...
                    </motion.span>
                  </div>
                ) : (
                  <>
                    {/* Popular Assets Horizontal Scroll (Premium UX) */}
                    <div className="w-full mt-6 text-left">
                      <div className="flex items-center justify-between mb-4 px-2">
                        <span className="text-[11px] font-black text-white/60 tracking-widest uppercase flex items-center gap-2">
                          <Flame className="w-3.5 h-3.5 text-orange-400" /> POPULAR ASSETS
                        </span>
                      </div>
                      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 px-2 -mx-2 snap-x">
                        {premiumAssets && premiumAssets.slice(0, 5).map(asset => (
                          <div key={asset.id} className="min-w-[200px] sm:min-w-[240px] snap-start">
                            <AssetCard asset={asset} className="!h-[280px]" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* ========================================== */}
        {/* LAYER 3: CATEGORIES BAR & SYSTEM FOOTER (BOTTOM) */}
        {/* ========================================== */}
        <div className="flex flex-col w-full z-20 mt-auto pb-1">
          
          
          {/* Modern Category Cards instead of Dock */}
          <div className="w-full max-w-5xl mx-auto mb-6 px-2">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {[
                { name: "日本の食", label: "Japanese Food", icon: "🍣" },
                { name: "和風・和柄", label: "Traditional", icon: "⛩️" },
                { name: "桜・祭り", label: "Festivals", icon: "🌸" },
                { name: "富士山・自然", label: "Mt. Fuji", icon: "🗻" },
                { name: "医療・ヘルスケア", label: "Medical", icon: "🏥" },
                { name: "ビジネス", label: "Business", icon: "💼" },
              ].map((cat) => (
                <button 
                  key={cat.name}
                  onClick={() => router.push(`/?cat=${encodeURIComponent(cat.name)}`)}
                  className="flex flex-col items-center justify-center gap-2 group bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/20 rounded-2xl p-4 transition-all duration-300"
                >
                  <span className="text-2xl group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-300">{cat.icon}</span>
                  <span className="text-[9px] font-bold tracking-wider text-white/60 group-hover:text-white transition-colors text-center whitespace-nowrap">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SEO & Discoverability Minimal Footer */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 items-center w-full max-w-5xl mx-auto border-t border-white/5 pt-4 pb-2 text-[10px] font-medium tracking-wide text-white/30">
            <span>transparent png</span>
            <span className="hidden sm:inline text-white/5">•</span>
            <span>commercial use png</span>
            <span className="hidden sm:inline text-white/5">•</span>
            <span>japanese png</span>
            <span className="hidden sm:inline text-white/5">•</span>
            <span>png assets</span>
            <span className="hidden sm:inline text-white/5">•</span>
            <span>cutout png</span>
            <span className="hidden sm:inline text-white/5">•</span>
            <span>isolated png</span>
          </div>

        </div>

      </div>
    </div>
  );
}
