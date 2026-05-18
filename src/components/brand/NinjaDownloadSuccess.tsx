'use client';

import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export function NinjaDownloadSuccess() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      className="fixed bottom-10 right-10 z-50 glass-card px-8 py-6 rounded-2xl flex items-center gap-4 border-ai-cyan/30"
    >
      <div className="relative">
        <motion.img 
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 12 }}
          src="/brand/ninja-icon-1.png" 
          alt="Success" 
          className="w-12 h-12 object-contain"
        />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 }}
          className="absolute -bottom-1 -right-1 bg-black rounded-full"
        >
          <CheckCircle2 className="w-5 h-5 text-ai-cyan" />
        </motion.div>
      </div>
      
      <div>
        <h4 className="text-white font-bold text-sm">ミッション完了</h4>
        <p className="text-[10px] text-ai-cyan font-black tracking-widest uppercase">Downloaded successfully</p>
      </div>
    </motion.div>
  );
}
