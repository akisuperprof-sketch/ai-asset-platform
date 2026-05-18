'use client';

import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="flex flex-col items-center justify-center min-h-[80vh] px-6 text-center">
        <div className="relative mb-12">
          {/* Glitch / Hidden Ninja Effect */}
          <motion.div
            animate={{ opacity: [1, 0, 1, 0.5, 1], x: [0, -5, 5, -2, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
          >
            <img src="/brand/ninja-char-4.png" alt="404" className="w-48 h-48 opacity-30 object-contain" />
          </motion.div>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
        </div>

        <h1 className="text-6xl font-black mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-ai-cyan to-ai-purple">
          404
        </h1>
        <h2 className="text-xl font-bold mb-6">ページは隠れ身中です</h2>
        <p className="text-secondary mb-12 max-w-md">
          お探しの素材やページは、既に移動したか削除された可能性があります。
          煙に巻かれる前に、ホームへ戻りましょう。
        </p>

        <Link 
          href="/" 
          className="glass px-8 py-4 rounded-full font-bold text-sm hover:bg-white hover:text-black transition-all flex items-center gap-3"
        >
          <img src="/brand/icon-shuriken.svg" alt="Home" className="w-4 h-4" />
          アジト（ホーム）へ戻る
        </Link>
      </main>
    </div>
  );
}
