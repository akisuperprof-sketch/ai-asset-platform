"use client";

import { Asset } from "@/types";
import { motion } from "framer-motion";
import { Download, Flame, Heart, ArrowDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ComingSoonButton } from "../ui/ComingSoonButton";

const getSeedStats = (id: string) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);
  const favoriteSeed = 5 + (absHash % 16); // 5 to 20
  const downloadSeed = 30 + (absHash % 171); // 30 to 200
  const isTrending = downloadSeed > 150;
  return { favoriteSeed, downloadSeed, isTrending };
};

const altMapping: Record<string, string> = {
  "日本の食": "Japanese Food Illustration",
  "和の伝統素材": "Japanese Traditional Material Cultured Illustration",
  "年中行事・祭り": "Annual Events Cultural Iconic Japanese Illustration",
  "ビジネス": "Office Supplies Business Gadget Illustration",
  "医療・ヘルスケア": "Medical Dental Healthcare Illustration"
};

export function AssetCard({ asset, className = "col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3" }: { asset: Asset; className?: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Guard against empty/missing images
  if (!asset.imageUrl) {
    return null;
  }

  const { favoriteSeed, downloadSeed, isTrending } = getSeedStats(asset.id);

  const seoAlt = `${asset.title} - カテゴリ: ${asset.category} (${altMapping[asset.category] || "Japanese Assets"}) - 高品質透過PNG画像素材 | Free Transparent PNG ${asset.title.replace(/\(背景透過画像\)/g, "").trim()}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      className={`glass-card group rounded-2xl overflow-hidden flex flex-col aspect-[4/5] relative border border-white/5 transition-all duration-500 hover:border-white/10 hover:shadow-[0_0_40px_rgba(255,255,255,0.06)] hover:-translate-y-1 ${className}`}
      style={{ touchAction: "pan-y" }} // Optimize mobile scrolling/swiping
    >
      <Link href={`/items/${asset.id}`} className="relative flex flex-col h-full bg-[#050505] cursor-pointer group/link">
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 z-40 flex items-center gap-2">
          <div className="bg-white/5 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest border border-white/10 shadow-lg">
            NEW
          </div>
        </div>
        
        {/* Image Area - Taking up most space */}
        <div className="relative flex-1 w-full flex items-center justify-center p-6 sm:p-8 overflow-hidden">
          {/* Checkerboard Pattern for transparent PNG feel */}
          <div className="absolute inset-0 bg-checkerboard opacity-[0.02] transition-opacity duration-500 group-hover/link:opacity-[0.05]" />
          
          {/* Subtle Bottom Gradient for Text Readability */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent z-10" />
          
          {/* Genuine Skeleton Loader */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-white/[0.01] animate-pulse flex items-center justify-center z-15">
              <div className="w-8 h-8 border-2 border-white/5 border-t-white/30 rounded-full animate-spin" style={{ animationDuration: '1.2s' }} />
            </div>
          )}

          <motion.img 
            src={asset.imageUrl} 
            alt={seoAlt}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            whileHover={{ scale: 1.06, rotate: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={`relative z-20 w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)] transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`} 
          />
        </div>

        {/* Minimal Text Area */}
        <div className="relative z-20 p-5 pt-0 bg-transparent flex flex-col gap-1.5 justify-end">
          <p className="text-[9px] sm:text-[10px] text-white/40 font-bold uppercase tracking-wider truncate">
            {asset.category} {asset.tags.length > 0 ? `・ ${asset.tags[0]}` : ""}
          </p>
          <h3 className="text-sm sm:text-base font-bold text-white/90 group-hover:text-white transition-colors line-clamp-2 leading-snug drop-shadow-md">
            {asset.title}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}
