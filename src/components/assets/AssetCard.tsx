"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "../ui/GlassCard";
import { Download, ExternalLink, ShieldCheck, Sparkles, ImageOff } from "lucide-react";
import { Asset } from "@/types";
import Link from "next/link";
import Image from "next/image";

export function AssetCard({ asset }: { asset: Asset }) {
  const [imageError, setImageError] = useState(false);

  return (
    <GlassCard className="group col-span-12 sm:col-span-6 lg:col-span-4 !p-0 overflow-hidden flex flex-col h-full border-white/5 hover:border-ai-purple/30 transition-all">
      <Link href={`/items/${asset.id}`} className="relative flex-1 bg-[url('/grid-pattern.svg')] bg-repeat min-h-[240px] flex items-center justify-center p-8">
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
        
        {!imageError ? (
          <motion.div
            whileHover={{ scale: 1.05, rotate: 1 }}
            className="relative w-full h-full flex items-center justify-center z-20"
          >
            <Image
              src={asset.thumbnailUrl || asset.imageUrl}
              alt={asset.title}
              fill
              className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)] p-4"
              onError={() => setImageError(true)}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>
        ) : (
          <div className="z-20 flex flex-col items-center justify-center text-secondary">
            <ImageOff className="w-12 h-12 mb-2 opacity-20" />
            <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Image Unavailable</span>
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
          {asset.isAiGenerated && (
            <div className="flex items-center gap-1 text-[9px] bg-ai-purple/90 text-white px-2 py-0.5 rounded-full uppercase tracking-widest font-bold backdrop-blur-md border border-white/10 shadow-lg">
              <Sparkles className="w-2 h-2" />
              AI Generated
            </div>
          )}
          {asset.isCommercialOk && (
            <div className="flex items-center gap-1 text-[9px] bg-success/80 text-black px-2 py-0.5 rounded-full uppercase tracking-widest font-bold backdrop-blur-md border border-white/10 shadow-lg">
              <ShieldCheck className="w-2 h-2" />
              Commercial OK
            </div>
          )}
        </div>
      </Link>

      <div className="p-5 relative z-20 bg-black/40 backdrop-blur-xl border-t border-white/5">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-[10px] text-ai-blue font-bold uppercase tracking-tighter mb-1">{asset.category}</p>
            <h3 className="text-base font-bold text-white group-hover:text-ai-cyan transition-colors line-clamp-1">
              {asset.title}
            </h3>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {asset.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[9px] text-secondary bg-white/5 px-2 py-0.5 rounded-md">
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex gap-2">
          <Link 
            href={`/items/${asset.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white text-xs font-bold py-2.5 rounded-lg border border-white/10 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            詳細
          </Link>
          <button className="flex-1 flex items-center justify-center gap-2 bg-ai-gradient hover:opacity-90 text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-lg shadow-ai-purple/20">
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
