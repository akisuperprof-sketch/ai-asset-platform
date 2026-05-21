"use client";

import { Asset } from "@/types";
import { motion } from "framer-motion";
import { Download, ExternalLink, Zap, ShieldCheck, Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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

  const seoAlt = `${asset.title} - カテゴリ: ${asset.category} (${altMapping[asset.category] || "Japanese Assets"}) - 高品質透過PNG画像素材 | Free Transparent PNG ${asset.title.replace(/\(背景透過画像\)/g, "").trim()}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      className={`glass-card group rounded-3xl overflow-hidden flex flex-col h-[480px] relative border border-white/5 transition-all duration-500 hover:border-purple-500/20 hover:shadow-[0_20px_50px_rgba(168,85,247,0.12)] ${className}`}
      style={{ touchAction: "pan-y" }} // Optimize mobile scrolling/swiping
    >
      <Link href={`/items/${asset.id}`} className="relative flex-1 bg-[#0a0a0a] flex items-center justify-center p-8 overflow-hidden cursor-pointer group/link">
        {/* Checkerboard Pattern */}
        <div className="absolute inset-0 bg-checkerboard opacity-[0.06] transition-opacity group-hover/link:opacity-10" />
        
        {/* Shadow Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent z-10" />
        
        {/* Genuine Skeleton Loader */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-white/[0.02] animate-pulse flex items-center justify-center z-15">
            <div className="w-12 h-12 border-2 border-white/5 border-t-ai-cyan rounded-full animate-spin" style={{ animationDuration: '1.2s' }} />
          </div>
        )}

        <motion.img 
          src={asset.imageUrl} 
          alt={seoAlt}
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          whileHover={{ scale: 1.08 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className={`relative z-20 max-w-[80%] max-h-[80%] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.85)] transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`} 
        />

        {/* Top Badges */}
        <div className="absolute top-5 left-5 z-40 flex items-center gap-2">
          <div className="bg-ai-gradient px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-widest shadow-lg">
            NEW
          </div>
        </div>
        
        <div className="absolute top-5 right-5 z-40">
          <div 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.dispatchEvent(new CustomEvent('show-coming-soon', { detail: { feature: 'お気に入り登録' } }));
            }}
            className="w-10 h-10 glass rounded-xl flex items-center justify-center border border-white/10 hover:bg-white/10 transition-all pointer-events-auto cursor-pointer"
          >
            <Heart className="w-4 h-4 text-white/50 group-hover:text-red-500 transition-colors" />
          </div>
        </div>
      </Link>

      <div className="relative z-20 p-6 bg-ninja-black/90 backdrop-blur-2xl border-t border-white/5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-[9px] text-ai-cyan font-black uppercase tracking-widest mb-1">
              {asset.category} {asset.tags.length > 0 ? `・ ${asset.tags[0]}` : ""}
            </p>
            <h3 className="text-base font-bold text-white group-hover:text-ai-cyan transition-colors line-clamp-1">
              {asset.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div className="flex gap-2">
            <div className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[9px] font-bold text-white/40 uppercase">
              PNG
            </div>
            <div className="bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[9px] font-bold text-white/40 uppercase">
              1024x1024
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-secondary">
            <Heart className="w-3 h-3 text-red-500/80" />
            <span className="text-[10px] font-bold">12</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
