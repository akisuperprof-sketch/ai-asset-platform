"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, Sparkles } from "lucide-react";
import { NinjaDownloadSuccess } from "@/components/brand/NinjaDownloadSuccess";
import { RewardDownloadModal } from "@/components/download/RewardDownloadModal";
import { trackEvent } from "@/lib/analytics";
import { DownloadAdGate } from "@/components/ads/DownloadAdGate";
import { getNextAdType, incrementDownloadCount, AdType } from "@/lib/ad-rotation";

export function DownloadButton({ assetId, title }: { assetId: string, title: string }) {
  const [status, setStatus] = useState<"idle" | "downloading" | "done">("idle");
  const [showToast, setShowToast] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showAdGate, setShowAdGate] = useState(false);
  const [adType, setAdType] = useState<AdType>('none');

  useEffect(() => {
    if (status === "done") {
      setShowToast(true);
      const timer = setTimeout(() => {
        setStatus("idle");
        setShowToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleDownload = async () => {
    setStatus("downloading");
    
    incrementDownloadCount();
    try {
      const response = await fetch(`/api/download/${assetId}`);
      const data = await response.json();
      
      if (data.url) {
        // Get raw image as blob to force instant local save (prevents tab-open behavior)
        const imgResponse = await fetch(data.url);
        const blob = await imgResponse.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${data.title || title || 'assetninja-download'}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        
        window.URL.revokeObjectURL(blobUrl);
        trackEvent("download_complete", { assetId, assetTitle: title });
        setStatus("done");
      } else {
        throw new Error("Download URL not found");
      }
    } catch (err) {
      console.error(err);
      alert("ダウンロード中にエラーが発生しました。");
      setStatus("idle");
    }
  };

  const handleAdProceed = () => {
    setShowAdGate(false);
    handleDownload();
  };

  const handleUnlockInstant = () => {
    setShowModal(false);
    handleDownload();
  };

  return (
    <div className="w-full relative">
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.button
            key="idle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => {
              const nextAd = getNextAdType();
              if (nextAd === 'none') {
                setShowModal(true);
              } else {
                setAdType(nextAd);
                setShowAdGate(true);
              }
            }}
            className="w-full bg-ai-gradient hover:opacity-90 text-white font-bold py-4 rounded-apple flex items-center justify-center gap-3 shadow-lg shadow-ai-purple/20 transition-all cursor-pointer"
          >
            <Download className="w-6 h-6 animate-pulse" />
            無料ダウンロードを開始
          </motion.button>
        )}

        {status === "downloading" && (
          <div className="w-full bg-white/5 py-4 rounded-apple flex items-center justify-center gap-3 text-secondary italic">
            <Loader2 className="w-6 h-6 animate-spin text-ai-cyan" />
            ファイルを生成しています...
          </div>
        )}

        {status === "done" && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="w-full text-center p-4"
          >
            <p className="text-success font-bold mb-2">ダウンロード完了！</p>
            <button onClick={() => setStatus("idle")} className="text-xs text-ai-blue hover:underline">
              もう一度ダウンロードする
            </button>
            <NinjaDownloadSuccess />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reward Download OS Console Modal */}
      <RewardDownloadModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onUnlockInstant={handleUnlockInstant}
        assetTitle={title}
        assetId={assetId}
      />

      {/* Ad Gate Modal */}
      <DownloadAdGate
        isOpen={showAdGate}
        onClose={() => setShowAdGate(false)}
        onProceed={handleAdProceed}
        adType={adType}
      />

      {/* Linear-style Premium Notification Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 glass border border-amber-500/30 rounded-2xl p-4 flex items-center gap-4 shadow-[0_25px_50px_rgba(0,0,0,0.8),0_0_35px_rgba(251,191,36,0.15)] max-w-md"
          >
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5 fill-amber-500/10" />
            </div>
            <div className="flex-1 text-left">
              <h5 className="text-[11px] font-black text-white uppercase tracking-wider mb-0.5">
                Download Complete
              </h5>
              <p className="text-[10px] text-secondary font-medium leading-normal">
                {title || 'Asset'} saved successfully.<br />
                <span className="text-amber-400 font-bold">✓ 商用利用OK (クレジット不要)</span>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
