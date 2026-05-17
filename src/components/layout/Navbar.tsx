"use client";

import { motion } from "framer-motion";
import { Zap, Search, Menu, Globe, MessageCircle } from "lucide-react";
import Link from "next/link";

export function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto glass rounded-full px-6 py-2.5 flex items-center justify-between border-white/10 shadow-2xl backdrop-blur-3xl">
        <div className="flex items-center gap-12">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="hidden sm:block group-hover:opacity-80 transition-opacity">
              <img src="/brand/logo-horizontal.svg" alt="SUKASHI AssetNinja logo" className="h-8 md:h-10 w-auto" />
            </div>
            <div className="block sm:hidden group-hover:opacity-80 transition-opacity">
              <img src="/brand/logo-square.svg" alt="SUKASHI AssetNinja logo" className="h-8 w-auto rounded-lg" />
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            <Link href="/#assets" className="text-[11px] font-black text-secondary hover:text-white uppercase tracking-widest transition-colors">素材を探す</Link>
            <Link href="/#categories" className="text-[11px] font-black text-secondary hover:text-white uppercase tracking-widest transition-colors">カテゴリ</Link>
            <Link href="/coming-soon" className="text-[11px] font-black text-secondary hover:text-white uppercase tracking-widest transition-colors">新着素材</Link>
            <Link href="/coming-soon" className="text-[11px] font-black text-secondary hover:text-white uppercase tracking-widest transition-colors">人気素材</Link>
            <Link href="/coming-soon" className="text-[11px] font-black text-secondary hover:text-white uppercase tracking-widest transition-colors">AI生成について</Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/coming-soon" className="text-secondary hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </Link>
          
          <div className="hidden md:flex items-center gap-4">
            <Link href="/coming-soon" className="text-[11px] font-black text-white uppercase tracking-widest hover:text-ai-cyan transition-colors">
              ログイン
            </Link>
            <Link 
              href="/coming-soon" 
              className="bg-ai-gradient px-8 py-3 rounded-full text-[11px] font-black text-white uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-ai-purple/20"
            >
              無料で登録
            </Link>
          </div>

          <button className="lg:hidden text-white">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
