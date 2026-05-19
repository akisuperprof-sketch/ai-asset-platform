"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Zap, 
  Sparkles, 
  Cpu, 
  ShieldCheck, 
  Clock, 
  Lock, 
  ExternalLink,
  ChevronRight,
  Loader2
} from "lucide-react";
import { trackEvent } from "@/lib/analytics";

interface RewardDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlockInstant: () => void;
  assetTitle: string;
  assetId: string;
}

export function RewardDownloadModal({
  isOpen,
  onClose,
  onUnlockInstant,
  assetTitle,
  assetId
}: RewardDownloadModalProps) {
  const [countdown, setCountdown] = useState(3);
  const [isReady, setIsReady] = useState(false);
  const [progress, setProgress] = useState(0);

  // Track modal opening
  useEffect(() => {
    if (isOpen) {
      trackEvent("reward_modal_open", { assetId, assetTitle });
      setCountdown(3);
      setIsReady(false);
      setProgress(0);
    }
  }, [isOpen, assetId, assetTitle]);

  // Handle progress bar and countdown
  useEffect(() => {
    if (!isOpen) return;

    // Fast progress ticker for visual fluidity
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.2; // Smooth graduation
      });
    }, 30);

    // Standard second queue
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsReady(true);
          // Wait a split second to ensure progress hits 100%
          setTimeout(() => {
            onUnlockInstant();
          }, 300);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(progressInterval);
      clearInterval(timer);
    };
  }, [isOpen, onUnlockInstant]);

  const handleSponsorClick = (sponsorName: "canva" | "adobe" | "impact" | "pro") => {
    let targetUrl = "";
    
    if (sponsorName === "canva") {
      targetUrl = "https://partner.canva.com/c/assetninja";
      trackEvent("canva_click", { assetId, assetTitle });
    } else if (sponsorName === "adobe") {
      targetUrl = "https://www.adobe.com/express/";
      trackEvent("adobe_click", { assetId, assetTitle });
    } else if (sponsorName === "impact") {
      targetUrl = "https://impact.com/";
      trackEvent("impact_click", { assetId, assetTitle });
    } else if (sponsorName === "pro") {
      targetUrl = "/coming-soon";
      trackEvent("instant_download_unlock", { assetId, assetTitle, method: "pro" });
    }

    if (sponsorName !== "pro") {
      trackEvent("instant_download_unlock", { assetId, assetTitle, method: sponsorName });
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    } else {
      // Direct navigation for inner routes
      window.location.href = targetUrl;
    }

    // Instantly unlock download without waiting
    onUnlockInstant();
  };

  // Safe manual skip close handler
  const handleClose = () => {
    trackEvent("reward_skip_click", { assetId, assetTitle, remainingSeconds: countdown });
    onClose();
  };

  // Generate CSS Monospace block visual progress indicator
  const getProgressBarText = () => {
    const blocksCount = Math.floor(progress / 10);
    const fillBlocks = "█".repeat(blocksCount);
    const emptyBlocks = "░".repeat(10 - blocksCount);
    return `${fillBlocks}${emptyBlocks} ${Math.floor(progress)}%`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Soft elegant glass backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
        />

        {/* Modal Window: Inspired by Linear & Raycast UI */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="relative w-full max-w-xl bg-ninja-black/90 border border-white/10 rounded-[2.5rem] p-8 overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(168,85,247,0.05)] z-10"
        >
          {/* Neon Glow behind the Header */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-12 bg-ai-purple/10 rounded-full blur-[20px] pointer-events-none" />

          {/* Close Button */}
          <button 
            type="button"
            onClick={handleClose}
            className="absolute top-6 right-6 w-8 h-8 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center hover:bg-white/10 hover:border-white/15 transition-all text-white/50 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>

          {/* MONOSCRIPT TRANSPARENCY ENGINE (OS Console Output) */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-ai-cyan animate-pulse shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
              <h3 className="text-[10px] font-black text-white/40 tracking-[0.25em] uppercase font-mono">
                Transparency Engine
              </h3>
            </div>
            
            <div className="bg-black/80 border border-white/5 rounded-2xl p-5 font-mono text-left relative overflow-hidden">
              <div className="absolute top-3 right-3 text-[8px] font-bold text-success/50 uppercase tracking-widest animate-pulse">
                System Active
              </div>
              <div className="text-[11px] text-ai-cyan/90 mb-1.5 flex items-center gap-1.5 font-semibold">
                <Cpu className="w-3.5 h-3.5 text-ai-cyan" /> Preparing transparent layer...
              </div>
              
              {/* ASCII Progress Output */}
              <div className="text-[13px] text-white font-black tracking-widest bg-white/[0.02] py-2 px-3.5 rounded-lg border border-white/[0.03]">
                {getProgressBarText()}
              </div>

              <div className="mt-3.5 flex items-center justify-between text-[9px] text-white/30 border-t border-white/5 pt-2.5">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-success/60" /> Virus Clean: Verified
                </span>
                <span>Format: Lossless PNG</span>
              </div>
            </div>
          </div>

          {/* TIME QUEUE STATUS BAR */}
          <div className="mb-8 flex items-center justify-between bg-white/[0.01] border border-white/5 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                {isReady ? (
                  <Loader2 className="w-5 h-5 animate-spin text-success" />
                ) : (
                  <Clock className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-white/35 uppercase tracking-wider mb-0.5">
                  Queue Priority Status
                </p>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  {isReady ? (
                    <span className="text-success flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-success fill-success/10" /> Download Ready
                    </span>
                  ) : (
                    <span>⏳ Standard Queue: {countdown} sec</span>
                  )}
                </h4>
              </div>
            </div>

            {/* Premium Mono Badge */}
            <div className="text-[10px] font-black text-white/50 tracking-wider bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl font-mono">
              FREE TIER
            </div>
          </div>

          {/* PREMIUM SPONSOR ACCELERATORS (NO WAIT AUTO-BYPASS) */}
          <div className="space-y-4 text-left">
            <div className="flex items-center justify-between px-2">
              <span className="text-[9px] font-black text-white/30 tracking-[0.2em] uppercase">
                ⚡ Accelerate with AI Partner (No Wait)
              </span>
              <span className="text-[9px] font-black text-amber-500/80 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 uppercase tracking-widest">
                Instant Download
              </span>
            </div>

            {/* Accelerator Card 1: Canva AI (Prime Sponsor) */}
            <button
              type="button"
              onClick={() => handleSponsorClick("canva")}
              className="w-full glass-card hover:bg-white/[0.04] active:scale-[0.99] border-white/10 p-4 rounded-3xl flex items-center justify-between group transition-all relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-ai-cyan/5 to-transparent pointer-events-none" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-ai-cyan/10 border border-ai-cyan/20 flex items-center justify-center text-xl font-black text-ai-cyan">
                  Cv
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-ai-cyan transition-colors flex items-center gap-1.5">
                    Continue with Canva AI <Zap className="w-3.5 h-3.5 fill-ai-cyan/20 text-ai-cyan animate-pulse" />
                  </h4>
                  <p className="text-[11px] text-secondary font-medium">
                    CanvaのAI編集ツールを無料体験して即座にDL
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-ai-cyan group-hover:text-black flex items-center justify-center text-white/40 transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* Sponsor Option 2: Adobe Express */}
            <button
              type="button"
              onClick={() => handleSponsorClick("adobe")}
              className="w-full glass-card hover:bg-white/[0.03] active:scale-[0.99] border-white/5 p-4 rounded-3xl flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600/10 border border-red-600/20 flex items-center justify-center text-xl font-black text-red-500">
                  Ad
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">
                    Edit with Adobe Express
                  </h4>
                  <p className="text-[11px] text-secondary font-medium">
                    AdobeのAIクリエイター製品を起動して即座にDL
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-red-500 group-hover:text-white flex items-center justify-center text-white/40 transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* Sponsor Option 3: Impact AI Creator Toolkit */}
            <button
              type="button"
              onClick={() => handleSponsorClick("impact")}
              className="w-full glass-card hover:bg-white/[0.03] active:scale-[0.99] border-white/5 p-4 rounded-3xl flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-ai-purple/10 border border-ai-purple/20 flex items-center justify-center text-xl font-black text-ai-purple">
                  Ip
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-ai-purple transition-colors">
                    AI Creator Toolkit (Impact)
                  </h4>
                  <p className="text-[11px] text-secondary font-medium">
                    次世代クリエイターツールキットを確認して即座にDL
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-ai-purple group-hover:text-white flex items-center justify-center text-white/40 transition-all">
                <ChevronRight className="w-4 h-4" />
              </div>
            </button>

            {/* S-Tier Pro Plan direct CTA */}
            <div className="pt-2 border-t border-white/5 flex items-center justify-between">
              <span className="text-[10px] text-secondary font-medium flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-500/80" /> クリエイター体験をPROプランで無限に
              </span>
              <button
                type="button"
                onClick={() => handleSponsorClick("pro")}
                className="text-[10px] font-black text-amber-500 hover:text-amber-400 transition-colors tracking-widest uppercase flex items-center gap-1.5 border border-amber-500/20 px-3 py-1.5 rounded-xl bg-amber-500/5"
              >
                PRO PLAN 加入
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
