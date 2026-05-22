"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface NinjaAntigravitySplashProps {
  onComplete: () => void;
}

export function NinjaAntigravitySplash({ onComplete }: NinjaAntigravitySplashProps) {
  const [phase, setPhase] = useState<0 | 1 | 2 | 3>(0);
  const totalDuration = 2200; // 2.2 seconds

  useEffect(() => {
    // Sequence control
    const t1 = setTimeout(() => setPhase(1), 400);   // 0.4s: Lines connect
    const t2 = setTimeout(() => setPhase(2), 1200);  // 1.2s: Logo forms
    const t3 = setTimeout(() => setPhase(3), 1800);  // 1.8s: Ninja smoke fade
    const t4 = setTimeout(() => {
      onComplete();
    }, totalDuration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
      
      {/* 0.0s - 0.4s: Particles Emerge */}
      <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${phase >= 0 ? "opacity-100" : "opacity-0"}`}>
        <div className="relative w-64 h-64">
          {[...Array(6)].map((_, i) => (
            <div
              key={`particle-${i}`}
              className="absolute w-2 h-2 bg-ai-cyan rounded-full filter drop-shadow-[0_0_8px_#06b6d4] blur-[0.5px]"
              style={{
                top: `${50 + 40 * Math.sin((i * Math.PI) / 3)}%`,
                left: `${50 + 40 * Math.cos((i * Math.PI) / 3)}%`,
                animation: `float-particle ${1.5 + i * 0.2}s ease-in-out infinite alternate`,
                animationDelay: `${i * 0.1}s`,
                opacity: phase === 0 ? 0 : 1,
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)"
              }}
            />
          ))}
        </div>
      </div>

      {/* 0.4s - 1.2s: Lines Connect (SVG Paths) */}
      <svg className={`absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-700 ${phase >= 1 ? "opacity-100" : "opacity-0"}`}>
        <defs>
          <linearGradient id="cyan-line" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <circle cx="50%" cy="50%" r="90" fill="none" stroke="url(#cyan-line)" strokeWidth="0.5" className="animate-slow-spin origin-center" strokeDasharray="50 150" />
        <circle cx="50%" cy="50%" r="120" fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="0.5" className="animate-slow-reverse-spin origin-center" strokeDasharray="30 200" />
        {/* Dynamic polygon connecting points */}
        <polygon 
          points="50%,30% 67%,40% 67%,60% 50%,70% 33%,60% 33%,40%" 
          fill="none" 
          stroke="url(#cyan-line)" 
          strokeWidth="0.3" 
          className="animate-pulse"
        />
      </svg>

      {/* 1.2s - 1.8s: Logo Forms */}
      <div className={`absolute flex items-center justify-center transition-all duration-700 ${phase >= 2 ? "opacity-100 scale-100" : "opacity-0 scale-50"}`}>
        <Image
          src="/brand/icon-shuriken.svg"
          alt="AssetNinja Logo"
          width={64}
          height={64}
          className="filter invert drop-shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-slow-spin"
        />
        <div className="absolute inset-0 bg-ai-cyan/20 blur-xl rounded-full animate-aura-pulse pointer-events-none" />
      </div>

      {/* 1.8s - 2.2s: Ninja Smoke Fade (Background shadow) */}
      <div 
        className={`absolute inset-0 flex items-center justify-center pointer-events-none transition-all duration-500 ease-out`}
      >
        <div 
          className="relative w-full h-full max-w-2xl max-h-2xl opacity-0"
          style={{
            animation: phase >= 3 ? "ninja-smoke-out 0.4s forwards cubic-bezier(0.2, 0, 0, 1)" : "none"
          }}
        >
          <Image
            src="/brand/ninja-char-1.png"
            alt="Ninja Silhouette"
            fill
            className="object-contain filter grayscale blur-sm drop-shadow-[0_0_40px_rgba(0,0,0,1)]"
            priority
          />
        </div>
      </div>

      {/* Bottom Loading Progress Text */}
      <div className="absolute bottom-[15vh] flex flex-col items-center justify-center gap-3">
        <div className="text-[10px] font-black text-ai-cyan tracking-[0.4em] uppercase">
          {phase === 0 && "NEURAL SPARK..."}
          {phase === 1 && "CONNECTING NODES..."}
          {phase === 2 && "SYSTEM READY"}
          {phase === 3 && "ENTERING LIVING OS"}
        </div>
        <div className="w-32 h-[1px] bg-white/10 relative overflow-hidden">
          <div 
            className="absolute top-0 bottom-0 left-0 bg-ai-cyan transition-all duration-200"
            style={{ width: `${((phase + 1) / 4) * 100}%` }}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes float-particle {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(10px, -15px) scale(1.5); }
        }
        @keyframes ninja-smoke-out {
          0% {
            transform: scale(0.9) translate3d(20px, 0, 0);
            opacity: 0.8;
            filter: blur(2px) drop-shadow(0 0 20px rgba(6,182,212,0.4));
          }
          100% {
            transform: scale(1.3) translate3d(-30px, -10px, 0);
            opacity: 0;
            filter: blur(30px) drop-shadow(0 0 0px transparent);
          }
        }
      `}</style>
    </div>
  );
}
