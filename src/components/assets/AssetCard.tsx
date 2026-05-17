"use client";

import { Asset } from "@/types";
import { motion } from "framer-motion";
import { Download, ExternalLink, Zap, ShieldCheck, Heart } from "lucide-react";
import Link from "next/link";

export function AssetCard({ asset }: { asset: Asset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass-card group col-span-12 sm:col-span-6 lg:col-span-4 rounded-3xl overflow-hidden flex flex-col h-[480px] relative border-white/5"
    >
      <Link href={`/items/${asset.id}`} className="relative flex-1 bg-[#0a0a0a] flex items-center justify-center p-8 overflow-hidden cursor-pointer">
        {/* Checkerboard Pattern */}
        <div className="absolute inset-0 bg-checkerboard opacity-10" />
        
        {/* Shadow Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent z-10" />
        
        <motion.img 
          src={asset.imageUrl} 
          alt={asset.title}
          whileHover={{ scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative z-20 max-w-[80%] max-h-[80%] object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.9)]" 
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
              window.location.href = "/coming-soon";
            }}
            className="w-10 h-10 glass rounded-xl flex items-center justify-center border-white/10 hover:bg-white/10 transition-all pointer-events-auto"
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
            <Heart className="w-3 h-3" />
            <span className="text-[10px] font-bold">4</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
