"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface NinjaOrbitSplashProps {
  onComplete: () => void;
}

export function NinjaOrbitSplash({ onComplete }: NinjaOrbitSplashProps) {
  const [step, setStep] = useState(1);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [duration, setDuration] = useState(2400); // Default 2.4s for first visit

  useEffect(() => {
    // Detect reduced motion preference
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefersReduced = mediaQuery.matches;

    // Session storage to detect re-visits
    const hasVisited = sessionStorage.getItem("ninja-splash-shown");
    let calculatedDuration = 2400;

    if (prefersReduced) {
      calculatedDuration = 300; // Super short for reduced motion
    } else if (hasVisited) {
      calculatedDuration = 1000; // 1.0s for re-visits
    }

    setDuration(calculatedDuration);
    sessionStorage.setItem("ninja-splash-shown", "true");

    // Dynamic text sequence steps
    const stepDuration = calculatedDuration / 4;
    
    const t1 = setTimeout(() => setStep(2), stepDuration);
    const t2 = setTimeout(() => setStep(3), stepDuration * 2);
    const t3 = setTimeout(() => setStep(4), stepDuration * 3);
    
    // Start fade out slightly before completion
    const fadeOutStart = calculatedDuration - 300;
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, Math.max(100, fadeOutStart));

    // Cleanup and complete
    const completeTimer = setTimeout(() => {
      onComplete();
    }, calculatedDuration);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  // Dynamic step texts
  const getStepText = () => {
    switch (step) {
      case 1:
        return "STEALTH LINK ESTABLISHED // AI ASSET SYSTEM ONLINE";
      case 2:
        return "SCANNING NEURAL DATASPACES // GENERATING TRANSPARENT PNG";
      case 3:
        return "NINJA TRANSPARENCY PIPELINE ACTIVE // QUALITY GATE AUDIT [OK]";
      case 4:
      default:
        return "ASSET NINJA // JAPANESE TRANSPARENT MATERIAL OS";
    }
  };

  return (
    <div 
      className={`fixed inset-0 z-[99999] flex items-center justify-center select-none overflow-hidden transition-opacity duration-300 bg-[#020407] ${
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        transitionDuration: "300ms",
      }}
    >
      {/* 1. Deep Futuristic Ambient Background Glooms */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-[#355cff]/5 blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-[#00c8ff]/5 blur-[100px] pointer-events-none animate-pulse-slow" style={{ animationDelay: "-2s" }} />

      {/* 2. Main Visual Canvas Wrapper (Using pure CSS & SVGs for absolute light weight) */}
      <div className="relative w-72 h-72 flex items-center justify-center">
        
        {/* Neon Circles Glow Tracks */}
        <div className="absolute inset-0 rounded-full border border-[#355cff]/10 blur-[1px]" />
        <div className="absolute inset-6 rounded-full border border-[#00c8ff]/15 blur-[2px] animate-pulse" />
        <div className="absolute inset-12 rounded-full border border-[#00ffaa]/5 pointer-events-none" />

        {/* SVG Orbital Nodes and Tracks */}
        <svg className="absolute w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 100 100">
          {/* Main Track Cyan */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            className="stroke-[#00c8ff]/10"
            strokeWidth="0.3"
          />
          {/* Active sweeping path (Cyan) */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            className="stroke-[#00c8ff] opacity-80"
            strokeWidth="0.8"
            strokeDasharray="30 200"
            style={{
              animation: `orbit-rotate ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite`,
              transformOrigin: "50% 50%",
            }}
          />

          {/* Inner Track Blue */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            className="stroke-[#355cff]/10"
            strokeWidth="0.2"
          />
          {/* Reverse sweeping path (Blue) */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            className="stroke-[#355cff] opacity-60"
            strokeWidth="0.6"
            strokeDasharray="15 150"
            style={{
              animation: `orbit-rotate-reverse ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite`,
              transformOrigin: "50% 50%",
            }}
          />

          {/* Node dot 1 (White Node) on Cyan track */}
          <circle
            cx="94"
            cy="50"
            r="1.2"
            fill="#ffffff"
            className="shadow-glow"
            style={{
              animation: `orbit-rotate ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite`,
              transformOrigin: "50% 50%",
            }}
          />

          {/* Node dot 2 (Gold Node) on Blue track */}
          <circle
            cx="88"
            cy="50"
            r="0.9"
            fill="#d89a18"
            style={{
              animation: `orbit-rotate-reverse ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite`,
              transformOrigin: "50% 50%",
            }}
          />
        </svg>

        {/* 3. Central Shuriken Spinning Glow */}
        <div className="absolute w-12 h-12 flex items-center justify-center">
          <Image
            src="/brand/icon-shuriken.svg"
            alt="Ninja Shuriken"
            width={32}
            height={32}
            className="filter invert opacity-70"
            style={{
              animation: `shuriken-spin ${duration}ms cubic-bezier(0.25, 1, 0.5, 1) forwards`,
            }}
          />
        </div>

        {/* 4. Background Ninja Mascot Sweep & Shadow mask */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 select-none z-0"
          style={{
            animation: `ninja-stealth-sweep ${duration}ms cubic-bezier(0.25, 1, 0.5, 1) forwards`,
          }}
        >
          <Image
            src="/brand/ninja-char-1.png"
            alt="Stealth Ninja Mascot"
            fill
            className="object-contain"
            style={{
              maskImage: "radial-gradient(circle at 60% 50%, white 30%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.15) 75%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(circle at 60% 50%, white 30%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.15) 75%, transparent 100%)",
            }}
          />
        </div>

      </div>

      {/* 5. Stage Progress Text Status Display */}
      <div className="absolute bottom-[20vh] left-0 right-0 flex flex-col items-center justify-center gap-2">
        <div 
          key={step} // Triggers CSS fade-in-up on change
          className="text-[9px] font-black text-white tracking-[0.35em] uppercase text-center animate-fade-in-up px-6"
          style={{
            fontFamily: "Outfit, Inter, sans-serif",
            color: step === 4 ? "#d89a18" : "#ffffff",
          }}
        >
          {getStepText()}
        </div>
        
        {/* Subtle Cyber Underline */}
        <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-[#00c8ff]/30 to-transparent relative mt-1.5 overflow-hidden">
          <div 
            className="absolute top-0 bottom-0 bg-[#00ffaa] w-4"
            style={{
              animation: `sweep-line ${duration}ms linear infinite`,
            }}
          />
        </div>
      </div>

      {/* Embedded CSS Animations to enforce extreme performance, light weight, and zero library dependency */}
      <style jsx global>{`
        @keyframes orbit-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes orbit-rotate-reverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }
        @keyframes shuriken-spin {
          0% {
            transform: scale(0.6) rotate(0deg);
            opacity: 0;
            filter: blur(4px) drop-shadow(0 0 10px rgba(0, 200, 255, 0));
          }
          15% {
            transform: scale(1.15) rotate(180deg);
            opacity: 0.9;
            filter: blur(0px) drop-shadow(0 0 15px rgba(0, 200, 255, 0.6));
          }
          75% {
            transform: scale(1.0) rotate(720deg);
            opacity: 0.8;
            filter: blur(0px) drop-shadow(0 0 10px rgba(0, 200, 255, 0.4));
          }
          90% {
            transform: scale(1.15) rotate(900deg);
            opacity: 0.6;
            filter: blur(2px) drop-shadow(0 0 15px rgba(0, 255, 170, 0.6));
          }
          100% {
            transform: scale(0) rotate(1080deg);
            opacity: 0;
            filter: blur(8px) drop-shadow(0 0 20px rgba(0, 255, 170, 0));
          }
        }
        @keyframes ninja-stealth-sweep {
          0% {
            opacity: 0;
            transform: scale(0.9) translateX(40px) translateY(10px);
            filter: blur(10px) brightness(0.2);
          }
          15% {
            opacity: 0.15;
            transform: scale(1.0) translateX(20px) translateY(5px);
            filter: blur(6px) brightness(0.4) drop-shadow(0 0 20px rgba(53, 92, 255, 0.2));
          }
          35% {
            opacity: 0.75;
            transform: scale(1.03) translateX(0px) translateY(0px);
            filter: blur(0px) brightness(1.0) drop-shadow(0 0 30px rgba(0, 200, 255, 0.25));
          }
          65% {
            opacity: 0.65;
            transform: scale(1.03) translateX(-15px) translateY(-2px);
            filter: blur(0px) brightness(0.9) drop-shadow(0 0 30px rgba(0, 255, 170, 0.2));
          }
          85% {
            opacity: 0.15;
            transform: scale(1.05) translateX(-50px) translateY(-5px);
            filter: blur(8px) brightness(0.3);
          }
          100% {
            opacity: 0;
            transform: scale(1.1) translateX(-90px) translateY(-10px);
            filter: blur(15px) brightness(0);
          }
        }
        @keyframes animate-pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1.0);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        @keyframes sweep-line {
          0% {
            left: -20%;
          }
          100% {
            left: 120%;
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 350ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .shadow-glow {
          filter: drop-shadow(0 0 4px #ffffff) drop-shadow(0 0 8px #00c8ff);
        }
      `}</style>

    </div>
  );
}
