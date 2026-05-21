"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Search, Zap, ShieldCheck, Globe, Download, Heart, Compass, Sparkles, Terminal, Cpu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface HeroSectionProps {
  onSearch?: (query: string) => void;
  initialCount?: number;
  todayAdded?: number;
  categoryCounts?: Record<string, number>;
}

export function HeroSection({ 
  onSearch, 
  initialCount = 30, 
  todayAdded = 0, 
  categoryCounts = {} 
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
  const [nowGenerating, setNowGenerating] = useState({
    title: "極上うな重セット",
    progress: 12,
    phase: "AI_GENERATING",
    category: "日本の食"
  });

  const [logs, setLogs] = useState<string[]>([
    "STEALTH LINK ESTABLISHED: SECURE CORRIDOR ENGAGED",
    "SCANNING SUPABASE NODE... 30 PNGS DETECTED",
    "R2 CLOUD CACHE STATUS: 100% HEALTHY",
    "READY FOR NEURAL TRANSLATION PROCESS"
  ]);

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

  // NOW GENERATING Simulation loop (Changes target every 6 seconds)
  useEffect(() => {
    const items = [
      { title: "極上うな重セット", cat: "日本の食" },
      { title: "満開の染井吉野", cat: "年中行事・祭り" },
      { title: "伝統的な金屏風", cat: "和の伝統素材" },
      { title: "グローバル商談風景", cat: "ビジネス" },
      { title: "最先端MRI検査機", cat: "医療・ヘルスケア" },
      { title: "特選天ぷら盛り合わせ", cat: "日本の食" },
      { title: "日本庭園の灯篭", cat: "和の伝統素材" }
    ];

    let currentIdx = 0;
    
    // Smooth progress increment simulator
    const progressInterval = setInterval(() => {
      setNowGenerating(prev => {
        if (prev.progress >= 100) {
          // Switch to next item when complete
          currentIdx = (currentIdx + 1) % items.length;
          
          // Log completion in console
          const timeStr = new Date().toLocaleTimeString();
          const target = items[currentIdx];
          
          setLogs(logList => {
            const newLogs = [
              `[${timeStr}] SUCCESS: '${prev.title}' background auto-removal completed (quality_score=94)`,
              `[${timeStr}] SYNCHRONIZED: '${prev.title}' uploaded to Cloudflare R2 Edge`,
              `[${timeStr}] DB_INSERTION: Registered asset securely into public.assets`,
              `[${timeStr}] INITIATED: Generating high-fidelity '${target.title}' via Stability AI`,
              ...logList
            ].slice(0, 15);
            return newLogs;
          });

          return {
            title: target.title,
            progress: 0,
            phase: "AI_GENERATING",
            category: target.cat
          };
        }

        const step = Math.floor(Math.random() * 8) + 4;
        const newProgress = Math.min(100, prev.progress + step);
        
        let phase = "AI_GENERATING";
        if (newProgress > 40 && newProgress < 85) phase = "REMBG_PROCESSING";
        else if (newProgress >= 85) phase = "COMPILER_SEO_QA";

        return {
          ...prev,
          progress: newProgress,
          phase
        };
      });
    }, 450);

    return () => clearInterval(progressInterval);
  }, []);

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
    <div className="relative w-full min-h-[660px] lg:min-h-[720px] xl:min-h-[800px] h-auto flex flex-col justify-between overflow-hidden bg-black text-white select-none py-12 md:py-16 lg:py-20">
      
      {/* Background Animated Atmosphere - Reduced opacity to 3% for luxury quietness */}
      <div className="absolute inset-0 bg-grid opacity-3 animate-grid-drift pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(251,191,36,0.005),transparent_70%)] pointer-events-none" />
      
      {/* Deep Blue/Cyan Smoke Aura Behind - Extremely subtle */}
      <div className="absolute top-[10%] right-[10%] w-[60vw] h-[55vh] bg-blue-600/5 rounded-full blur-[180px] opacity-35 pointer-events-none animate-aura-pulse" />
      <div className="absolute bottom-[5%] left-[5%] w-[50vw] h-[50vh] bg-ai-cyan/5 rounded-full blur-[160px] opacity-30 pointer-events-none animate-aura-pulse" style={{ animationDelay: "-4s" }} />
      <div className="scanline opacity-5 pointer-events-none" />

      {/* Floating Neon Micro-Dust Particles - Reduced count to 3 for Apple/Linear luxury feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-ai-cyan/20"
            initial={{ 
              x: Math.random() * 1920, 
              y: Math.random() * 1080,
              opacity: 0.05 + Math.random() * 0.2
            }}
            animate={{
              y: [null, Math.random() * -100, Math.random() * -200],
              opacity: [0.05, 0.4, 0.05]
            }}
            transition={{
              duration: 12 + Math.random() * 8,
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
      <div className="relative z-20 flex-1 max-w-7xl mx-auto px-6 w-full flex flex-col justify-between gap-10 pt-4 pb-2">
        
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
                  AI <span className="inline-block bg-ai-gradient bg-clip-text text-transparent [-webkit-background-clip:text]">ASSETS</span>
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
                <div className="gold-glass rounded-xl px-3.5 py-2 text-left relative overflow-hidden shrink-0 border border-amber-500/10">
                  <div className="absolute inset-0 gold-shimmer pointer-events-none" />
                  <div className="text-[9px] font-black text-amber-500/80 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 fill-amber-500/10 text-amber-400" />
                    +{realtimeTodayAdded} ADDED TODAY • AI VERIFIED
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
                {realtimeCount} AI GENERATED TRANSPARENT PNG ASSETS
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
                  placeholder="和食、桜、富士山、医療をニューラル検索..."
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

            {/* Searching Status Indicator & Live Asset Engine OS Panel (Phase-002) */}
            <div className="mt-4 w-full">
              <AnimatePresence mode="wait">
                {isSearching ? (
                  <div className="h-6 flex items-center justify-center">
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-[9px] font-black text-ai-cyan tracking-[0.2em] uppercase flex items-center gap-1.5"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-ai-cyan animate-ping" />
                      SEARCHING NEURAL DATASPACES...
                    </motion.span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
                    
                    {/* Panel Left: NOW GENERATING */}
                    <div className="glass border border-white/5 rounded-2xl p-4 bg-black/60 backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-[82px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[8px] font-black text-ai-cyan tracking-[0.2em] uppercase flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-ai-cyan animate-pulse" />
                          NOW GENERATING
                        </span>
                        <span className="text-[8px] font-mono text-white/30 uppercase">
                          {nowGenerating.phase}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-end my-1">
                        <span className="text-[11px] font-bold text-white tracking-wide truncate max-w-[70%]">
                          [{nowGenerating.category}] {nowGenerating.title}
                        </span>
                        <span className="text-[10px] font-black text-ai-cyan font-mono">
                          {nowGenerating.progress}%
                        </span>
                      </div>

                      {/* Micro neon progress bar */}
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden relative">
                        <div 
                          className="h-full bg-ai-gradient rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(0,200,255,0.6)]"
                          style={{ width: `${nowGenerating.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Panel Right: LIVE INDEX STATUS */}
                    <div className="glass border border-white/5 rounded-2xl p-4 bg-black/60 backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-[82px]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[8px] font-black text-amber-500/80 tracking-[0.2em] uppercase flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-amber-500 animate-ping" />
                          LIVE INDEX STATUS
                        </span>
                        <span className="text-[8px] font-mono text-white/30 uppercase">
                          DB_LATENCY: 12ms
                        </span>
                      </div>
                      
                      {/* Scrolling Console log */}
                      <div className="flex-1 overflow-hidden font-mono text-[8px] leading-relaxed text-white/50 flex flex-col gap-0.5 max-h-[46px] select-text">
                        {logs.slice(0, 3).map((log, index) => (
                          <div key={index} className="truncate whitespace-nowrap">
                            <span className="text-[#00ffaa]/80 mr-1">&gt;</span> {log}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* ========================================== */}
        {/* LAYER 3: CATEGORIES BAR & SYSTEM FOOTER (BOTTOM) */}
        {/* ========================================== */}
        <div className="flex flex-col w-full z-20 mt-auto pb-1">
          
          {/* Dock型カテゴリOS - Upgraded to genuine Mac-style Dock with hover expansions DOCK-001/002/003 */}
          <div className="w-full max-w-4xl mx-auto glass-card rounded-[2rem] border-white/5 p-3 mb-3 relative overflow-visible shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <div className="flex gap-4 overflow-x-auto no-scrollbar justify-start md:justify-center items-center px-4 py-1 relative">
              {[
                { name: "日本の食", label: "日本の食", icon: "🍱", count: categoryCounts["日本の食"] || 0 },
                { name: "和の伝統素材", label: "和の伝統素材", icon: "🏮", count: categoryCounts["和の伝統素材"] || 0 },
                { name: "年中行事・祭り", label: "年中行事・祭り", icon: "🌸", count: categoryCounts["年中行事・祭り"] || 0 },
                { name: "ビジネス", label: "ビジネス", icon: "💼", count: categoryCounts["ビジネス"] || 0 },
                { name: "医療・ヘルスケア", label: "医療", icon: "🏥", count: categoryCounts["医療・ヘルスケア"] || categoryCounts["医療"] || 0 },
                { name: "More", label: "全素材一覧", icon: "✦", count: initialCount },
              ].map((cat) => (
                <button 
                  key={cat.name}
                  onClick={() => cat.name === "More" ? router.push('/?cat=すべて') : router.push(`/?cat=${encodeURIComponent(cat.name)}`)}
                  className="flex flex-col items-center gap-1.5 group shrink-0 relative transition-transform duration-300"
                >
                  <motion.div 
                    whileHover={{ scale: 1.12, y: -6 }}
                    className="w-12 h-12 rounded-full bg-black/70 border border-white/10 flex items-center justify-center text-xl group-hover:bg-ai-gradient group-hover:border-transparent group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] active:scale-90 transition-all duration-300 relative"
                  >
                    <span className="transition-transform duration-300 group-hover:scale-105">{cat.icon}</span>
                    
                    {/* Tooltip Count badge */}
                    <span className="absolute -top-1 -right-1 bg-black/90 border border-white/15 px-1.5 py-0.5 rounded-full text-[7px] font-black text-secondary group-hover:text-white group-hover:border-purple-500/50 transition-colors">
                      {cat.count}
                    </span>
                  </motion.div>
                  <span className="text-[9px] font-black tracking-wider text-secondary group-hover:text-white transition-colors">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Premium OS Live Status Footer - Completely aligned with Phase 3 */}
          <div className="flex justify-between items-center w-full max-w-5xl mx-auto border-t border-white/5 pt-2.5 text-[9px] lg:text-[10px] font-black tracking-[0.22em] text-white/35">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_6px_rgba(48,209,88,0.8)]" />
              SYSTEM ONLINE
            </span>
            <span className="hidden sm:inline text-white/10">|</span>
            <span className="hover:text-ai-purple transition-colors uppercase">
              {initialCount} PNGS INDEXED
            </span>
            <span className="hidden sm:inline text-white/10">|</span>
            <span className="hover:text-ai-cyan transition-colors uppercase flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500/80" />
              AI VERIFIED ASSETS
            </span>
            <span className="hidden md:inline text-white/10">|</span>
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
