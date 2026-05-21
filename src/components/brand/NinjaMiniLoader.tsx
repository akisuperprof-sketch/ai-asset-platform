"use client";

import Image from "next/image";

interface NinjaMiniLoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function NinjaMiniLoader({ className = "", size = "md" }: NinjaMiniLoaderProps) {
  const dimensions = {
    sm: { wrapper: "w-16 h-16", track: 26, shuriken: 16 },
    md: { wrapper: "w-24 h-24", track: 38, shuriken: 24 },
    lg: { wrapper: "w-36 h-36", track: 56, shuriken: 36 },
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      
      {/* Visual Canvas Wrapper */}
      <div className={`relative ${dimensions.wrapper} flex items-center justify-center`}>
        
        {/* Soft background ambient glooms */}
        <div className="absolute inset-2 rounded-full bg-[#00c8ff]/5 blur-md pointer-events-none animate-pulse" />

        {/* SVG Orbital Track & Nodes */}
        <svg className="absolute w-full h-full transform -rotate-90 pointer-events-none" viewBox="0 0 100 100">
          {/* Main Track */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            className="stroke-[#00c8ff]/10"
            strokeWidth="0.5"
          />
          {/* Active sweeping path (Cyan) */}
          <circle
            cx="50"
            cy="50"
            r="44"
            fill="none"
            className="stroke-[#00c8ff] opacity-80"
            strokeWidth="1.2"
            strokeDasharray="25 150"
            style={{
              animation: "mini-orbit-rotate 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
              transformOrigin: "50% 50%",
            }}
          />

          {/* Node dot (White) */}
          <circle
            cx="94"
            cy="50"
            r="1.8"
            fill="#ffffff"
            className="shadow-glow"
            style={{
              animation: "mini-orbit-rotate 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite",
              transformOrigin: "50% 50%",
            }}
          />
        </svg>

        {/* Central Spinning Shuriken */}
        <div className="absolute flex items-center justify-center pointer-events-none">
          <Image
            src="/brand/icon-shuriken.svg"
            alt="Spinning Shuriken"
            width={dimensions.shuriken}
            height={dimensions.shuriken}
            className="filter invert opacity-75"
            style={{
              animation: "mini-shuriken-spin 1.5s linear infinite",
            }}
          />
        </div>

      </div>

      <style jsx global>{`
        @keyframes mini-orbit-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes mini-shuriken-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .shadow-glow {
          filter: drop-shadow(0 0 3px #ffffff) drop-shadow(0 0 6px #00c8ff);
        }
      `}</style>

    </div>
  );
}
