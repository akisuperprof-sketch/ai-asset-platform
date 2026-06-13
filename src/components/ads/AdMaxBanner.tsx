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
      if (typeof window !== 'undefined') {
        if (!(window as any).admaxads) {
          (window as any).admaxads = [];
        } else {
          // Clear previous entries so t.js doesn't get confused by multiple entries mapping to single DOM node
          (window as any).admaxads.splice(0, (window as any).admaxads.length);
        }
      }

      // We remove any existing admax script to allow re-execution when modal opens
      const scriptId = `admax-script-${type}`;
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }
      
      // Also reset shinobi internal state to force re-render
      if ((window as any).__admax_render__) {
        (window as any).__admax_render__ = undefined;
      }

      if (type === 'pc') {
        (window as any).admaxads.push({admax_id: "40d12e183086a55c7451794352a281c2", type: "banner"});
      } else {
        (window as any).admaxads.push({admax_id: "35317cead3271f0eeda52a630e9f6aa6", type: "overlay"});
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.charset = 'utf-8';
      script.src = 'https://adm.shinobi.jp/st/t.js';
      script.async = true;

      document.body.appendChild(script);
    }, 100);

    return () => {
      clearTimeout(timer);
      const scriptId = `admax-script-${type}`;
      const script = document.getElementById(scriptId);
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
        <div className="w-full min-h-[4rem] p-4 bg-white/5 border border-white/10 rounded flex flex-col items-center justify-center relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-1">Sponsor Space</span>
          <span className="text-[11px] text-white/40 font-medium text-center">
            Thank you for supporting free PNG downloads.<br/>
            (Please check the sponsor ad at the bottom of the screen)
          </span>
          <div className="admax-ads" data-admax-id="35317cead3271f0eeda52a630e9f6aa6" style={{ display: 'none' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center w-full my-4 relative">
      <div 
        className="bg-white/5 border border-white/10 rounded-lg overflow-hidden flex items-center justify-center relative shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        style={{ width, height, minWidth: width, minHeight: height }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 z-[0]">
          <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mb-2">
            Sponsor Space
          </span>
          <span className="text-[11px] text-white/40 font-medium">
            Thank you for supporting free PNG downloads.
          </span>
        </div>
        <div className="admax-ads relative z-10" data-admax-id="40d12e183086a55c7451794352a281c2" style={{ display: 'inline-block', width: '300px', height: '250px' }} />
      </div>
    </div>
  );
}
