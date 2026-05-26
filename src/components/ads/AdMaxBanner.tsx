"use client";

import { useEffect, useRef } from "react";

export function AdMaxBanner({ type }: { type: 'pc' | 'sp' }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Ensure we don't duplicate scripts
    if (containerRef.current.hasChildNodes()) {
      const children = Array.from(containerRef.current.childNodes);
      const hasScript = children.some(node => node.nodeName.toLowerCase() === 'script');
      if (hasScript) return;
    }

    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = type === 'sp' 
      ? 'https://adm.shinobi.jp/s/35317cead3271f0eeda52a630e9f6aa6' 
      : 'https://adm.shinobi.jp/s/40d12e183086a55c7451794352a281c2';
    script.async = true;

    containerRef.current.appendChild(script);
    
    // Clean up on unmount or re-render
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [type]);

  const width = type === 'sp' ? 320 : 300;
  const height = type === 'sp' ? 50 : 250;

  return (
    <div className="flex justify-center items-center w-full my-4">
      <div 
        ref={containerRef}
        className="bg-white/5 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center relative shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        style={{ width, height, minWidth: width, minHeight: height }}
      >
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white/20 uppercase tracking-[0.2em] pointer-events-none z-[-1]">
          Sponsor
        </span>
      </div>
    </div>
  );
}
