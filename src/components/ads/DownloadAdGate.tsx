"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Download, Loader2, Sparkles } from "lucide-react";
import { AdMaxBanner } from "./AdMaxBanner";
import { AdType, injectPopAds, isPopAdsEnabled } from "@/lib/ad-rotation";

declare global {
  interface Window {
    _pop: any[];
  }
}

interface DownloadAdGateProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  adType: AdType;
}

export function DownloadAdGate({
  isOpen,
  onClose,
  onProceed,
  adType
}: DownloadAdGateProps) {
  const [countdown, setCountdown] = useState(3);
  const [isMobile, setIsMobile] = useState(false);
  const [isPopAdsSkipped, setIsPopAdsSkipped] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCountdown(3);
      setIsMobile(window.innerWidth < 768);
      
      const handleResize = () => setIsMobile(window.innerWidth < 768);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && countdown > 0) {
      const timer = setInterval(() => setCountdown(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isOpen, countdown]);

  useEffect(() => {
    if (isOpen && adType === 'popads') {
      const STORAGE_KEY = 'assetninja_popads_last_shown';
      const lastShown = localStorage.getItem(STORAGE_KEY);
      const now = Date.now();
      const isWithin24h = lastShown && (now - parseInt(lastShown, 10)) < 24 * 60 * 60 * 1000;

      if (isWithin24h) {
        console.log('PopAds skipped: already shown within 24h');
        setIsPopAdsSkipped(true);
        return;
      }

      setIsPopAdsSkipped(false);

      if (process.env.NODE_ENV !== 'production') {
        console.log('[AssetNinja Ads] selected adType: popads');
        console.log('[AssetNinja Ads] PopAds enabled:', isPopAdsEnabled());
      }

      const timer = setTimeout(() => {
        injectPopAds();
        localStorage.setItem(STORAGE_KEY, now.toString());
        localStorage.setItem('assetninja_last_ad_type', 'popads');
      }, 100);

      return () => clearTimeout(timer);
    } else if (isOpen && adType === 'admax') {
      if (process.env.NODE_ENV !== 'production') {
        console.log('[AssetNinja Ads] selected adType: admax');
      }
      localStorage.setItem('assetninja_last_ad_type', 'admax');
    }
  }, [isOpen, adType]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
        />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="relative w-full max-w-lg bg-ninja-black/95 border border-white/10 rounded-[2rem] p-6 sm:p-8 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.95)] z-10 text-center"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-ai-cyan/10 rounded-full blur-[25px] pointer-events-none" />

          <button 
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center hover:bg-white/10 transition-all text-white/50 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="mb-4 flex items-center justify-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mb-2">
              <Download className="w-6 h-6 text-white/80" />
            </div>
          </div>

          <h3 className="text-xl font-black text-white tracking-tight mb-2">
            Free PNG Download
          </h3>
          <p className="text-[14px] text-white/90 font-medium leading-relaxed max-w-sm mx-auto mb-1">
            Your free PNG is ready.<br/>
            Please view the sponsor area, then continue your download.
          </p>
          <p className="text-[10px] text-white/40 mb-6">
            スポンサーエリア確認後、ボタンを押すとダウンロードできます。
          </p>

          {/* Ad Area */}
          <div className="w-full flex justify-center mb-6">
            {adType === 'admax' && (
              <AdMaxBanner type={isMobile ? 'sp' : 'pc'} />
            )}
            {adType === 'popads' && !isPopAdsSkipped && (
              <div className="w-full min-h-[4rem] p-4 bg-white/5 border border-white/10 flex items-center justify-center rounded flex-col gap-1 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Sponsor Space</span>
                <span className="text-[11px] text-white/60 font-medium text-center leading-relaxed">
                  Sponsor ad will open in a new tab.<br/>
                  Your PNG download will continue here.
                </span>
              </div>
            )}
            {adType === 'popads' && isPopAdsSkipped && (
              <div className="text-[10px] text-white/20 py-2">
                Sponsored by Ninja Ad Network
              </div>
            )}
          </div>

          <div className="w-full space-y-3">
            <button
              type="button"
              disabled={countdown > 0}
              onClick={onProceed}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg text-[13px] tracking-wide ${
                countdown > 0 
                  ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/5" 
                  : "bg-ai-cyan text-black hover:brightness-110 active:scale-[0.98] shadow-ai-cyan/20"
              }`}
            >
              {countdown > 0 ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Please wait... {countdown}s
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Continue Download
                </>
              )}
            </button>
            
            <div className="flex justify-center items-center gap-1.5 text-[9px] text-white/30 tracking-wider">
              <Sparkles className="w-3 h-3" />
              Quality Verified • Virus Free • Transparent PNG
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
