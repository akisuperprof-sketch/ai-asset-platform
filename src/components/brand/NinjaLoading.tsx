"use client";

import { useEffect, useState } from "react";
import { Sparkles, Cpu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function NinjaLoading() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 4; // Smooth increment
      });
    }, 70);
    return () => clearInterval(timer);
  }, []);

  const getProgressText = () => {
    if (progress < 40) return "NINJA INDEXING...";
    if (progress < 80) return "SCANNING TRANSPARENT ASSETS...";
    return "STEALTH LINK ESTABLISHED";
  };

  // Check if ninja should smoke out/disappear (ends at >= 85%)
  const isSmokeOut = progress >= 85;

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full px-4 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[220px] h-[220px] bg-cyan-500/5 rounded-full blur-[60px] pointer-events-none animate-aura-pulse" />

      {/* Cyber OS Console Panel */}
      <div className="glass border border-white/10 rounded-[28px] p-6 md:p-8 w-full max-w-sm flex flex-col items-center shadow-2xl relative z-10 bg-black/45 backdrop-blur-2xl">
        
        {/* Top bar status */}
        <div className="w-full flex items-center justify-between mb-6 border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-ai-cyan animate-pulse" />
            <span className="text-[8px] font-black text-white/40 tracking-[0.2em] uppercase">SYSTEM.BOOT_OS</span>
          </div>
          <span className="text-[8px] font-black text-amber-500/80 bg-amber-500/5 border border-amber-500/10 px-2 py-0.5 rounded-full">
            STEALTH_ACTIVE
          </span>
        </div>

        {/* Mascot & Shuriken Theater Area */}
        <div className="relative w-28 h-28 mb-5 flex items-center justify-center">
          {/* Cyber Rings */}
          <div className="absolute inset-0 border border-ai-cyan/10 rounded-full border-dashed animate-slow-spin pointer-events-none" />
          <div className="absolute inset-1.5 border border-ai-purple/10 rounded-full animate-reverse-spin pointer-events-none" style={{ animationDuration: '8s' }} />

          {/* Shuriken Rotator (Center background) - Rotating & Scanning (Up-Down motion) */}
          <motion.div 
            animate={{
              rotate: 360,
              y: [-12, 12, -12],
            }}
            transition={{
              rotate: { duration: 3, repeat: Infinity, ease: "linear" },
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="absolute inset-4 flex items-center justify-center opacity-[0.12] pointer-events-none"
          >
            <img src="/brand/icon-shuriken.svg" alt="shuriken" className="w-12 h-12 filter invert" />
          </motion.div>

          {/* Ninja Character Theater Anim - Running & Smoke Out */}
          <div className="absolute inset-0 flex items-center justify-center overflow-visible rounded-full z-10 pointer-events-none">
            <AnimatePresence>
              {!isSmokeOut ? (
                <motion.div
                  key="running-ninja"
                  animate={{
                    x: [-4, 4, -4],
                    y: [-2, 2, -2],
                    skewX: [-3, 3, -3],
                    scale: [0.98, 1.02, 0.98]
                  }}
                  exit={{
                    scale: 1.45,
                    opacity: 0,
                    filter: "blur(16px)",
                    transition: { duration: 0.6, ease: "easeOut" }
                  }}
                  transition={{
                    duration: 0.45,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="w-16 h-16 flex items-center justify-center"
                >
                  <img 
                    src="/brand/ninja-char-3.png" 
                    alt="Stealth Ninja" 
                    className="w-16 h-16 object-contain"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="smoke-cloud"
                  initial={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
                  animate={{ opacity: [0, 0.85, 0], scale: [0.5, 1.5, 1.8], filter: ["blur(10px)", "blur(4px)", "blur(20px)"] }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute w-16 h-16 bg-white/25 rounded-full blur-md"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Smoke Aura Effect */}
          <div className="absolute inset-3 bg-white/5 blur-lg rounded-full animate-pulse" />
        </div>

        {/* Progress Bar (OS Style) */}
        <div className="w-full space-y-2 mb-2">
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
            <div 
              className="h-full bg-ai-gradient rounded-full transition-all duration-75 ease-out shadow-[0_0_8px_rgba(124,58,237,0.4)]" 
              style={{ width: `${progress}%` }}
            />
            {/* Shimmer overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          </div>

          <div className="flex items-center justify-between text-[8px] font-black text-secondary tracking-widest uppercase">
            <motion.span 
              key={getProgressText()}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white/60 font-black"
            >
              {getProgressText()}
            </motion.span>
            <span className="text-ai-cyan font-black">{progress}%</span>
          </div>
        </div>

        {/* Branding */}
        <div className="flex items-center gap-1 mt-4 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-[8px] font-black text-white tracking-[0.25em] uppercase">
            ASSETNINJA LOADING OS
          </span>
        </div>
      </div>
    </div>
  );
}
