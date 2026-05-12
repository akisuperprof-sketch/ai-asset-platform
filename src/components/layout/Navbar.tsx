"use client";

import { motion } from "framer-motion";
import { Cpu, Menu, User } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 pt-6">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto glass rounded-full px-6 py-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-ai-gradient rounded-xl flex items-center justify-center shadow-lg shadow-ai-purple/30">
            <Cpu className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tighter text-white">
            SUKASHI
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-secondary">
          <a href="#" className="hover:text-white transition-colors">ホーム</a>
          <a href="#" className="hover:text-white transition-colors">カテゴリー</a>
          <a href="#" className="hover:text-white transition-colors">ランキング</a>
          <a href="#" className="hover:text-white transition-colors">API利用</a>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden md:flex items-center gap-2 text-sm text-secondary hover:text-white transition-colors">
            <User className="w-4 h-4" />
            ログイン
          </button>
          <button className="p-2 md:hidden">
            <Menu className="w-6 h-6 text-white" />
          </button>
          <button className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-white/90 transition-colors">
            無料登録
          </button>
        </div>
      </motion.div>
    </nav>
  );
}
