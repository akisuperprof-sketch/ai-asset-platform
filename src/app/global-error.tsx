"use client";

import { AlertCircle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#020407] text-white antialiased selection:bg-amber-500/30">
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-2xl backdrop-blur-xl">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          
          <h2 className="text-xl md:text-2xl font-black text-white mb-3 uppercase tracking-wider">
            Critical System Failure
          </h2>
          
          <p className="text-white/40 text-xs md:text-sm max-w-md mx-auto leading-relaxed mb-8">
            A fatal error occurred at the root layout level. Our automated systems have been notified.
          </p>

          <button
            onClick={() => reset()}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black rounded-full text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)]"
          >
            Reboot System
          </button>
        </div>
      </body>
    </html>
  );
}
