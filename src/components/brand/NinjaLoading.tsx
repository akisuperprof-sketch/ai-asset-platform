'use client';

import { motion } from 'framer-motion';

export function NinjaLoading() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        {/* Shuriken Rotating Background */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center opacity-30"
        >
          <img src="/brand/icon-shuriken.svg" alt="Loading..." className="w-16 h-16" />
        </motion.div>

        {/* Ninja Character Floating */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <img src="/brand/ninja-char-3.png" alt="Ninja" className="w-12 h-12 object-contain" />
        </motion.div>

        {/* Smoke Effect Concept */}
        <motion.div
          animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 1.5] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
          className="absolute inset-0 bg-white/10 blur-xl rounded-full"
        />
      </div>
      <motion.p 
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-[10px] font-black text-ai-cyan uppercase tracking-widest"
      >
        素材を探索中...
      </motion.p>
    </div>
  );
}
