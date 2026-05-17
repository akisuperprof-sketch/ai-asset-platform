"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, CheckCircle, ShieldCheck } from "lucide-react";
import { NinjaDownloadSuccess } from "@/components/brand/NinjaDownloadSuccess";

export function DownloadButton({ assetId, title }: { assetId: string, title: string }) {
  const [status, setStatus] = useState<"idle" | "preparing" | "ready" | "downloading" | "done">("idle");
  const [countdown, setCountdown] = useState(5);

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
      const timer = setTimeout(() => setStatus("idle"), 3000);
      return () => clearTimeout(timer);
    }
  }, [status, countdown]);

  const handleDownload = async () => {
    setStatus("downloading");
    
    try {
      const response = await fetch(`/api/download/${assetId}`);
      const data = await response.json();
      
      if (data.url) {
        // 実際の画像をBlobとして取得し、確実にダウンロードさせる（別タブ表示を防止）
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
    <div className="w-full">
      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.button
            key="idle"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={startPreparation}
            className="w-full bg-ai-gradient hover:opacity-90 text-white font-bold py-4 rounded-apple flex items-center justify-center gap-3 shadow-lg shadow-ai-purple/20 transition-all"
          >
            <Download className="w-6 h-6" />
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
            className="w-full bg-success hover:bg-success/90 text-black font-bold py-4 rounded-apple flex items-center justify-center gap-3 transition-all"
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
    </div>
  );
}
