"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, Heart, ShieldCheck, Eye, Sparkles } from "lucide-react";
import Link from "next/link";

interface AssetPreviewContainerProps {
  imageUrl: string;
  title: string;
}

type BgMode = "checkerboard" | "black" | "white" | "photoshop";

export function AssetPreviewContainer({ imageUrl, title }: AssetPreviewContainerProps) {
  const [bgMode, setBgMode] = useState<BgMode>("checkerboard");
  const [liked, setLiked] = useState(false);

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

  return (
    <div className="relative">
      {/* Main Preview Container */}
      <div className={`aspect-square glass-card rounded-[40px] overflow-hidden flex items-center justify-center p-12 lg:p-20 relative transition-all duration-500 ${bgMode === 'white' ? 'border-amber-400/20' : 'border-white/5'}`}>
        
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
          <div className="bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-ai-cyan animate-pulse" />
            <span className="text-[9px] font-black text-white uppercase tracking-widest">
              Pixel Perfect Transparency
            </span>
          </div>
          {bgMode === "white" && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} 
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg"
            >
              <span className="text-[8px] font-black text-amber-400 uppercase tracking-widest">
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
          alt={`${title}の透過PNG素材`} 
          className="relative z-20 max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
        />

        {/* Floating View & Mode Controls (Bottom) */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-35 flex flex-col items-center gap-3 w-full px-4">
          <div className="glass px-5 py-2.5 rounded-full flex items-center gap-4 text-[10px] font-black shadow-2xl backdrop-blur-3xl border-white/10 max-w-md">
            
            {/* Background Mode Toggles */}
            <div className="flex items-center gap-2">
              <span className="text-secondary text-[8px] tracking-wider uppercase mr-1">PREVIEW BACKGROUND:</span>
              
              <button 
                type="button"
                onClick={() => setBgMode("checkerboard")}
                className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${bgMode === "checkerboard" ? "bg-ai-cyan text-black" : "bg-white/5 hover:bg-white/10 text-white"}`}
              >
                Grid
              </button>

              <button 
                type="button"
                onClick={() => setBgMode("black")}
                className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${bgMode === "black" ? "bg-white text-black" : "bg-white/5 hover:bg-white/10 text-white"}`}
              >
                Dark
              </button>

              <button 
                type="button"
                onClick={() => setBgMode("white")}
                className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${bgMode === "white" ? "bg-white text-black" : "bg-white/5 hover:bg-white/10 text-white"}`}
              >
                Light
              </button>

              <button 
                type="button"
                onClick={() => setBgMode("photoshop")}
                className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase transition-all ${bgMode === "photoshop" ? "bg-amber-400 text-black shadow-[0_0_10px_rgba(251,191,36,0.4)]" : "bg-white/5 hover:bg-white/10 text-white"}`}
              >
                PS Style
              </button>
            </div>
            
            <div className="w-px h-4 bg-white/15" />

            <Link href="/coming-soon" className="hover:text-ai-cyan transition-colors flex items-center gap-1 uppercase text-[9px] tracking-widest text-secondary font-black">
              <Maximize2 className="w-3.5 h-3.5" /> ZOOM
            </Link>
          </div>
        </div>

        {/* Thumbnails (Floating on the left) */}
        <div className="absolute left-6 bottom-6 hidden sm:flex flex-row gap-2 z-40">
          {["checkerboard", "black", "white"].map((mode, i) => (
            <button 
              type="button"
              key={i} 
              onClick={() => setBgMode(mode as BgMode)} 
              className={`w-12 h-12 glass rounded-xl border p-1 cursor-pointer transition-all bg-black/40 backdrop-blur-xl flex items-center justify-center ${bgMode === mode ? "border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]" : "border-white/10"}`}
            >
              <div className={`w-full h-full rounded-md overflow-hidden relative ${mode === 'checkerboard' ? 'bg-checkerboard' : mode === 'white' ? 'bg-white' : 'bg-black'}`}>
                <img src={imageUrl} className="w-full h-full object-contain p-1" alt="thumb" />
              </div>
            </button>
          ))}
        </div>

        {/* Floating Action (Like) */}
        <div className="absolute right-6 top-6 z-40">
          <button 
            type="button"
            onClick={() => setLiked(!liked)}
            className={`w-12 h-12 glass rounded-2xl border flex items-center justify-center transition-all ${liked ? "border-red-500 bg-red-500/10 text-red-500" : "border-white/10 text-white/40 hover:text-red-500 hover:bg-white/5"}`}
          >
            <Heart className={`w-5 h-5 ${liked ? "fill-red-500" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
