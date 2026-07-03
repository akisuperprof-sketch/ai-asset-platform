"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Maximize2, Heart } from "lucide-react";

interface AssetPreviewContainerProps {
  imageUrl: string;
  title: string;
}

type BgMode = "checkerboard" | "black" | "white" | "photoshop";

export function AssetPreviewContainer({ imageUrl, title }: AssetPreviewContainerProps) {
  const [bgMode, setBgMode] = useState<BgMode>("checkerboard");

  // Define background classes based on mode
  const getBgClass = () => {
    switch (bgMode) {
      case "black":
        return "bg-black transition-colors duration-500";
      case "white":
        return "bg-white transition-colors duration-500";
      case "photoshop":
        return "bg-checkerboard bg-[size:16px_16px] transition-colors duration-500";
      case "checkerboard":
      default:
        return "bg-checkerboard opacity-100 transition-colors duration-500";
    }
  };

  const isLight = bgMode === "white";

  return (
    <div className="relative">
      {/* Main Preview Container */}
      <div className={`aspect-square glass-card rounded-[40px] overflow-hidden flex items-center justify-center p-6 sm:p-12 lg:p-20 relative transition-all duration-500 ${isLight ? 'border-amber-400/30' : 'border-white/5'}`}>
        
        {/* Background Layer according to mode */}
        <div className={`absolute inset-0 z-0 ${getBgClass()}`} />
        
        {bgMode === "checkerboard" && (
          <div className="absolute inset-0 bg-gradient-to-tr from-ai-purple/15 via-transparent to-ai-cyan/15 pointer-events-none z-10" />
        )}

        {/* Photoshop Grid Overlay if selected */}
        {bgMode === "photoshop" && (
          <div 
            className="absolute inset-0 z-0" 
            style={{
              backgroundImage: "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
              backgroundSize: "20px 20px",
              backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
              opacity: 0.15
            }}
          />
        )}

        {/* Floating Photoshop Grid Tag */}
        <div className="absolute top-6 left-6 z-30 flex flex-col gap-2">
          <div className={`backdrop-blur-md border px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg ${
            isLight ? "bg-white/90 border-black/10 text-black" : "bg-black/80 border-white/10 text-white"
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-ai-cyan animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-widest">
              Pixel Perfect Transparency
            </span>
          </div>
          {bgMode === "white" && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/95 border border-amber-400/50 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-xl"
            >
              <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">
                Halo Contrast View
              </span>
            </motion.div>
          )}
        </div>

        {/* Main Image */}
        <motion.img 
          key={bgMode}
          initial={{ opacity: 0.9, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          src={imageUrl} 
          alt={`${title}の透過PNG画像素材 (背景透過クリッピング済み) - Free Transparent PNG ${title} Illustration for Commercial Use`} 
          className="relative z-20 max-w-[85%] max-h-[85%] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.65)]"
          fetchPriority="high"
        />

        {/* Integrated Control Panel (Bottom Center) - Full Responsive and Dynamic Contrast Panel */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-35 w-[calc(100%-2rem)] max-w-md px-2">
          <div className={`p-4 rounded-3xl border flex flex-col gap-3 shadow-2xl backdrop-blur-3xl transition-all duration-300 ${
            isLight 
              ? 'bg-white/95 text-black border-black/10' 
              : 'bg-black/85 text-white border-white/10'
          }`}>
            {/* Row 1: Thumbnails */}
            <div className="flex items-center justify-center gap-3">
              {["checkerboard", "black", "white"].map((mode, i) => (
                <button 
                  type="button"
                  key={i} 
                  onClick={() => setBgMode(mode as BgMode)} 
                  className={`w-10 h-10 rounded-xl border p-0.5 cursor-pointer transition-all flex items-center justify-center ${
                    bgMode === mode 
                      ? "border-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)] scale-105" 
                      : isLight 
                        ? "border-black/10 hover:border-black/20"
                        : "border-white/10 hover:border-white/20"
                  }`}
                  title={`${mode} preview`}
                >
                  <div className={`w-full h-full rounded-lg overflow-hidden relative ${
                    mode === 'checkerboard' 
                      ? 'bg-checkerboard' 
                      : mode === 'white' 
                        ? 'bg-white' 
                        : 'bg-black'
                  }`}>
                    <img src={imageUrl} className="w-full h-full object-contain p-0.5" alt={`thumbnail ${mode}`} />
                  </div>
                </button>
              ))}
            </div>
            
            {/* Divider */}
            <div className={`h-px w-full ${isLight ? "bg-black/5" : "bg-white/10"}`} />

            {/* Row 2: Mode Toggles */}
            <div className="flex items-center justify-center gap-3 text-[10px] font-black uppercase w-full">
              {/* Background Mode Toggles */}
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                <span className={`text-[8px] tracking-wider uppercase mr-1 hidden sm:inline-block ${isLight ? "text-black/40" : "text-white/40"}`}>
                  PREVIEW:
                </span>
                
                <button 
                  type="button"
                  onClick={() => setBgMode("checkerboard")}
                  className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all ${
                    bgMode === "checkerboard" 
                      ? "bg-ai-cyan text-black" 
                      : isLight 
                        ? "bg-black/5 hover:bg-black/10 text-black/70 hover:text-black"
                        : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                  }`}
                >
                  Grid
                </button>

                <button 
                  type="button"
                  onClick={() => setBgMode("black")}
                  className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all ${
                    bgMode === "black" 
                      ? "bg-black text-white shadow-[0_0_10px_rgba(255,255,255,0.1)] border border-white/20" 
                      : isLight 
                        ? "bg-black/5 hover:bg-black/10 text-black/70 hover:text-black"
                        : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                  }`}
                >
                  Dark
                </button>

                <button 
                  type="button"
                  onClick={() => setBgMode("white")}
                  className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all ${
                    bgMode === "white" 
                      ? "bg-amber-500 text-white shadow-lg border-none" 
                      : isLight 
                        ? "bg-black/5 hover:bg-black/10 text-black/70 hover:text-black"
                        : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                  }`}
                >
                  Light
                </button>

                <button 
                  type="button"
                  onClick={() => setBgMode("photoshop")}
                  className={`px-3 py-1.5 rounded-md text-[9px] font-bold uppercase transition-all ${
                    bgMode === "photoshop" 
                      ? "bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.4)] border-none" 
                      : isLight 
                        ? "bg-black/5 hover:bg-black/10 text-black/70 hover:text-black"
                        : "bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                  }`}
                >
                  PS Style
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
