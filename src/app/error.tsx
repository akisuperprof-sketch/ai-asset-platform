"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-2xl backdrop-blur-xl">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      
      <h2 className="text-xl md:text-2xl font-black text-white mb-3 uppercase tracking-wider">
        System Anomaly Detected
      </h2>
      
      <p className="text-white/40 text-xs md:text-sm max-w-md mx-auto leading-relaxed mb-8">
        We encountered an unexpected neural glitch while attempting to render this interface. Our systems have logged the anomaly.
      </p>

      <div className="flex items-center gap-4">
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white text-xs font-bold uppercase tracking-widest transition-all"
        >
          Retry Connection
        </button>
        <Link
          href="/"
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
