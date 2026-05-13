"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, ExternalLink, ShieldCheck, Sparkles, ImageOff } from "lucide-react";
import { Asset } from "@/types";
import Link from "next/link";
import Image from "next/image";

export function AssetCard({ asset }: { asset: Asset }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="glass-card group col-span-12 sm:col-span-6 lg:col-span-4 rounded-apple overflow-hidden flex flex-col h-full">
      <Link href={`/items/${asset.id}`} className="relative flex-1 bg-black min-h-[280px] flex items-center justify-center p-6 overflow-hidden">
        {/* Checkerboard Pattern for Transparency Preview */}
        <div className="absolute inset-0 bg-checkerboard opacity-[0.03]" />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-60" />
        
        {!imageError ? (
          <motion.div
            whileHover={{ scale: 1.08, y: -5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative w-full h-full flex items-center justify-center z-20"
          >
            <Image
              src={asset.thumbnailUrl || asset.imageUrl}
              alt={asset.title}
              fill
              className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-4"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>
        ) : (
          <div className="z-20 flex flex-col items-center justify-center text-secondary">
            <ImageOff className="w-12 h-12 mb-2 opacity-20" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 text-center px-4">Image Unavailable</span>
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
          {asset.isAiGenerated && (
            <div className="flex items-center gap-1.5 text-[9px] bg-ai-purple text-white px-2.5 py-1 rounded-full uppercase tracking-[0.1em] font-bold border border-white/10 shadow-xl">
              <Sparkles className="w-2.5 h-2.5" />
              AI Created
            </div>
          )}
          {asset.isCommercialOk && (
            <div className="flex items-center gap-1.5 text-[9px] bg-white text-black px-2.5 py-1 rounded-full uppercase tracking-[0.1em] font-bold border border-white/10 shadow-xl">
              <ShieldCheck className="w-2.5 h-2.5" />
              Verified
            </div>
          )}
        </div>

        {/* Resolution Badge */}
        <div className="absolute bottom-4 left-4 z-30 text-[8px] text-white/40 uppercase tracking-widest font-medium">
          4K High-Res Clean PNG
        </div>
      </Link>

      <div className="p-6 relative z-20 bg-white/[0.02] backdrop-blur-3xl border-t border-white/5">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-ai-gradient" />
              <p className="text-[10px] text-ai-cyan font-bold uppercase tracking-widest">{asset.category}</p>
            </div>
            <h3 className="text-lg font-bold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-ai-gradient transition-all duration-300 line-clamp-1 leading-snug">
              {asset.title}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {asset.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[10px] text-secondary/80 bg-white/5 px-3 py-1 rounded-full border border-white/5 hover:border-white/20 transition-colors">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex gap-3">
          <Link 
            href={`/items/${asset.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white text-[11px] font-bold py-3 rounded-xl border border-white/10 transition-all active:scale-[0.98]"
          >
            <ExternalLink className="w-4 h-4" />
            詳細を見る
          </Link>
          <button className="flex-1 flex items-center justify-center gap-2 bg-ai-gradient hover:brightness-110 text-white text-[11px] font-bold py-3 rounded-xl transition-all shadow-lg shadow-ai-purple/20 active:scale-[0.98]">
            <Download className="w-4 h-4" />
            DL
          </button>
        </div>
      </div>
    </div>
  );
}
