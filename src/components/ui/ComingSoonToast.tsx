"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

export function ComingSoonToast() {
  const [visible, setVisible] = useState(false);
  const [featureName, setFeatureName] = useState("");

  useEffect(() => {
    const handleShow = (e: Event) => {
      const customEvent = e as CustomEvent;
      setFeatureName(customEvent.detail?.feature || "この機能");
      setVisible(true);
    };

    window.addEventListener("show-coming-soon", handleShow);
    return () => window.removeEventListener("show-coming-soon", handleShow);
  }, []);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-[9999] glass border border-amber-500/40 rounded-2xl p-4 flex items-center gap-4 shadow-[0_30px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(251,191,36,0.2)] max-w-sm bg-black/90 backdrop-blur-3xl"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Sparkles className="w-5 h-5 fill-amber-500/10 animate-pulse text-amber-400" />
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
              <h5 className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">
                COMING SOON • 今後追加予定
              </h5>
            </div>
            <p className="text-[11px] text-white font-black mb-0.5">
              「{featureName}」は現在準備中です
            </p>
            <p className="text-[9px] text-white/50 leading-normal font-semibold">
              AssetNinja OSは随時アップデートされます。<br />
              次期ステルスリリースを楽しみにお待ちください。
            </p>
          </div>
          <button 
            type="button"
            onClick={() => setVisible(false)}
            className="text-white/40 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
