'use client';

import { motion } from 'framer-motion';

export function NinjaLoading() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-16 h-16">
        {/* Shuriken Rotating */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <img src="/brand/icon-shuriken.svg" alt="Loading..." className="w-10 h-10" />
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
