"use client";

import { motion } from "framer-motion";
import { Zap, Search, Menu, Globe, MessageCircle, Sparkles } from "lucide-react";
import Link from "next/link";

const FEATURES_ENABLED = {
  pro: false,
  login: false,
  aiGeneration: false,
  // New feature flags to minimize nav
  ENABLE_NEW_NAV: false,
  ENABLE_POPULAR_NAV: false,
  ENABLE_DOWNLOAD_CTA: false,
  ENABLE_EXPLORE_NAV: false, // "素材を探す"
  ENABLE_CATEGORY_NAV: false, // "カテゴリ"
  ENABLE_HAMBURGER: false // "ハンバーガーメニュー"
};

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
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden group-hover:scale-105 transition-transform duration-300 relative border border-white/10 shadow-[0_0_15px_rgba(0,255,255,0.2)]">
              <img src="/brand/ninja-icon-1.png" alt="AssetNinja icon" className="w-full h-full object-cover" />
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-[13px] font-black text-white tracking-tighter leading-none">ASSET NINJA</span>
              <span className="text-[8px] font-black text-ai-cyan tracking-[0.2em] uppercase leading-none mt-1">Premium PNG</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {FEATURES_ENABLED.ENABLE_EXPLORE_NAV && (
              <Link href="/#assets" className="text-[11px] font-black text-secondary hover:text-white uppercase tracking-widest transition-colors">素材を探す</Link>
            )}
            {FEATURES_ENABLED.ENABLE_CATEGORY_NAV && (
              <Link href="/#categories" className="text-[11px] font-black text-secondary hover:text-white uppercase tracking-widest transition-colors">カテゴリ</Link>
            )}
            {FEATURES_ENABLED.ENABLE_NEW_NAV && (
              <Link href="/coming-soon" className="text-[11px] font-black text-secondary hover:text-white uppercase tracking-widest transition-colors">新着素材</Link>
            )}
            {FEATURES_ENABLED.ENABLE_POPULAR_NAV && (
              <Link href="/coming-soon" className="text-[11px] font-black text-secondary hover:text-white uppercase tracking-widest transition-colors">人気素材</Link>
            )}
            {FEATURES_ENABLED.aiGeneration && (
              <Link href="/coming-soon" className="text-[11px] font-black text-secondary hover:text-white uppercase tracking-widest transition-colors">AI生成について</Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/coming-soon" className="text-secondary hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </Link>
          
          <div className="hidden md:flex items-center gap-4 select-none">
            {FEATURES_ENABLED.pro && (
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('show-coming-soon', { detail: { feature: 'PRO: Unlimited Downloads / Priority Assets / Commercial Pack' } }))}
                className="bg-white/[0.02] border border-white/5 hover:border-amber-500/30 hover:bg-amber-500/5 px-4 py-2 rounded-full text-[9px] font-black text-amber-400 uppercase tracking-[0.25em] transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.02)] cursor-not-allowed opacity-80"
                aria-disabled="true"
              >
                <Sparkles className="w-3.5 h-3.5 fill-amber-500/10 text-amber-400" />
                PRO
              </button>
            )}
            {FEATURES_ENABLED.login && (
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('show-coming-soon', { detail: { feature: 'ログイン' } }))}
                className="text-[11px] font-black text-white/60 uppercase tracking-widest hover:text-white transition-colors cursor-not-allowed bg-transparent border-none py-1"
                aria-disabled="true"
              >
                ログイン
              </button>
            )}
            {FEATURES_ENABLED.ENABLE_DOWNLOAD_CTA && (
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('show-coming-soon', { detail: { feature: '新規登録' } }))}
                className="bg-ai-gradient px-8 py-3 rounded-full text-[10px] sm:text-[11px] font-black text-white/90 uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-ai-purple/20 cursor-not-allowed opacity-95"
                aria-disabled="true"
              >
                Download Free PNGs
              </button>
            )}
          </div>

          {FEATURES_ENABLED.ENABLE_HAMBURGER && (
            <button className="lg:hidden text-white">
              <Menu className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

