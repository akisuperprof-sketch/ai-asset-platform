"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, CheckCircle, ShieldCheck, Sparkles } from "lucide-react";
import { NinjaDownloadSuccess } from "@/components/brand/NinjaDownloadSuccess";

export function DownloadButton({ assetId, title }: { assetId: string, title: string }) {
  const [status, setStatus] = useState<"idle" | "preparing" | "ready" | "downloading" | "done">("idle");
  const [countdown, setCountdown] = useState(5);
  const [showToast, setShowToast] = useState(false);

  const startPreparation = () => {
    setStatus("preparing");
    setCountdown(5);
  };

  useEffect(() => {
    if (status === "preparing" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === "preparing" && countdown === 0) {
      setStatus("ready");
    } else if (status === "done") {
      setShowToast(true);
      const timer = setTimeout(() => {
        setStatus("idle");
        setShowToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status, countdown]);

  const handleDownload = async () => {
    setStatus("downloading");
    
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
        setStatus("done");
      } else {
        throw new Error("Download URL not found");
      }
    } catch (err) {
      console.error(err);
      alert("ダウンロード中にエラーが発生しました。");
      setStatus("ready");
    }
  };

  return (
    <div className="w-full relative">
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.button
            key="idle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={startPreparation}
            className="w-full bg-ai-gradient hover:opacity-90 text-white font-bold py-4 rounded-apple flex items-center justify-center gap-3 shadow-lg shadow-ai-purple/20 transition-all cursor-pointer"
          >
            <Download className="w-6 h-6 animate-pulse" />
            無料ダウンロードを開始
          </motion.button>
        )}

        {status === "preparing" && (
          <motion.div
            key="preparing"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="w-full glass p-6 rounded-apple border-ai-purple/30 text-center"
          >
            <p className="text-secondary text-sm mb-2 font-medium">準備中... {countdown}秒後に準備が完了します</p>
            <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-4">
              <motion.div 
                className="bg-ai-gradient h-full"
                initial={{ width: "0%" }}
                animate={{ width: `${(5 - countdown) * 20}%` }}
              />
            </div>
            
            {/* Ad Placeholder within the button flow */}
            <div className="bg-ai-purple/5 border border-ai-purple/20 rounded-lg p-4 mb-4">
              <p className="text-[10px] text-ai-purple/60 uppercase tracking-widest mb-1">Sponsored</p>
              <p className="text-xs text-white">あなたのクリエイティブをAIで次のレベルへ。今すぐ詳細をチェック。</p>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-[10px] text-secondary">
              <ShieldCheck className="w-3 h-3 text-success" />
              ウイルススキャン済み • 安全な接続
            </div>
          </motion.div>
        )}

        {status === "ready" && (
          <motion.button
            key="ready"
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            onClick={handleDownload}
            className="w-full bg-success hover:bg-success/90 text-black font-bold py-4 rounded-apple flex items-center justify-center gap-3 transition-all cursor-pointer shadow-[0_0_20px_rgba(48,209,88,0.3)] animate-pulse"
          >
            <CheckCircle className="w-6 h-6" />
            ダウンロードの準備ができました
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
