"use client";

import { useEffect, useRef, useState } from "react";

export function AdMaxBanner({ type }: { type: 'pc' | 'sp' }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    // Small delay to ensure the DOM nodes are fully rendered and React has committed them
    const timer = setTimeout(() => {
      // Set up admax object if not exists
      if (typeof window !== 'undefined') {
        (window as any).admaxads = (window as any).admaxads || [];
      }

      // We remove any existing admax script to allow re-execution when modal opens
      const existingScript = document.getElementById('admax-script');
      if (existingScript) {
        existingScript.remove();
      }

      if (type === 'pc') {
        (window as any).admaxads.push({admax_id: "40d12e183086a55c7451794352a281c2",type: "banner"});
      } else {
        (window as any).admaxads.push({admax_id: "35317cead3271f0eeda52a630e9f6aa6",type: "overlay"});
      }

      const script = document.createElement('script');
      script.id = 'admax-script';
      script.type = 'text/javascript';
      script.charset = 'utf-8';
      script.src = 'https://adm.shinobi.jp/st/t.js';
      script.async = true;

      document.body.appendChild(script);
    }, 100);

    return () => {
      clearTimeout(timer);
      const script = document.getElementById('admax-script');
      if (script) {
        script.remove();
      }
    };
  }, [isMounted, type]);

  const width = type === 'sp' ? 320 : 300;
  const height = type === 'sp' ? 50 : 250;

  if (!isMounted) return null;

  if (type === 'sp') {
    return (
      <div className="flex justify-center items-center w-full my-4">
        <div ref={containerRef} className="w-full h-12 bg-white/5 border border-white/10 rounded flex items-center justify-center relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <span className="text-[10px] text-white/30">Loading Sponsor Information...</span>
          <div className="admax-ads" data-admax-id="35317cead3271f0eeda52a630e9f6aa6" style={{ display: 'none' }} />
        </div>
      </div>
    );
  }

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
        <div className="admax-ads z-10" data-admax-id="40d12e183086a55c7451794352a281c2" style={{ display: 'inline-block', width: '300px', height: '250px' }} />
      </div>
    </div>
  );
}
