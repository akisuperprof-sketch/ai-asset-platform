"use client";

import { useState, useEffect } from "react";
import { injectPopAds, isPopAdsEnabled } from "@/lib/ad-rotation";
import { AdMaxBanner } from "@/components/ads/AdMaxBanner";

export function AdTestClient() {
  const [storageData, setStorageData] = useState<Record<string, string | null>>({});
  const [scriptInjected, setScriptInjected] = useState(false);

  const refreshStorage = () => {
    if (typeof window === "undefined") return;
    setStorageData({
      assetninja_popads_last_shown: localStorage.getItem('assetninja_popads_last_shown'),
      assetninja_download_count: localStorage.getItem('assetninja_download_count'),
      assetninja_last_ad_type: localStorage.getItem('assetninja_last_ad_type'),
    });
    setScriptInjected(!!document.getElementById('popads-official-script'));
  };

  useEffect(() => {
    refreshStorage();
    const interval = setInterval(refreshStorage, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleClearStorage = () => {
    if (typeof window === "undefined") return;
    localStorage.removeItem('assetninja_popads_last_shown');
    localStorage.removeItem('assetninja_download_count');
    localStorage.removeItem('assetninja_last_ad_type');
    refreshStorage();
    console.log('[AssetNinja Ads] localStorage cleared for testing.');
  };

  const handleInjectPopAds = () => {
    if (typeof window === "undefined") return;
    injectPopAds();
    localStorage.setItem('assetninja_popads_last_shown', Date.now().toString());
    localStorage.setItem('assetninja_last_ad_type', 'popads');
    refreshStorage();
    console.log('[AssetNinja Ads] PopAds injection requested via test button.');
  };

  return (
    <div className="space-y-8">
      {/* Test Controls */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Test Controls & Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-white/10 bg-white/5 p-4 rounded-xl space-y-4">
            <h3 className="font-bold text-white">Actions</h3>
            <div className="flex flex-col gap-2">
              <button 
                onClick={handleInjectPopAds}
                className="bg-ai-cyan text-black px-4 py-2 rounded-lg font-bold hover:brightness-110"
              >
                Inject PopAds Script
              </button>
              <button 
                onClick={handleClearStorage}
                className="bg-red-500/20 text-red-400 px-4 py-2 rounded-lg font-bold hover:bg-red-500/30 border border-red-500/30"
              >
                Clear Ad localStorage
              </button>
            </div>
          </div>
          
          <div className="border border-white/10 bg-white/5 p-4 rounded-xl space-y-2">
            <h3 className="font-bold text-white">Local Storage State</h3>
            <div className="text-xs font-mono space-y-1 text-zinc-300 bg-black/50 p-3 rounded-lg overflow-x-auto">
              <p><span className="text-zinc-500">last_shown:</span> {storageData.assetninja_popads_last_shown || 'null'}</p>
              <p><span className="text-zinc-500">dl_count:</span> {storageData.assetninja_download_count || 'null'}</p>
              <p><span className="text-zinc-500">last_ad_type:</span> {storageData.assetninja_last_ad_type || 'null'}</p>
              <div className="pt-2 mt-2 border-t border-white/10">
                <p><span className="text-zinc-500">popads_injected:</span> {scriptInjected ? 'true' : 'false'}</p>
                <p><span className="text-zinc-500">NEXT_PUBLIC_POPADS_ENABLED:</span> {process.env.NEXT_PUBLIC_POPADS_ENABLED || 'undefined'}</p>
                <p><span className="text-zinc-500">isPopAdsEnabled():</span> {String(isPopAdsEnabled())}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AdMax */}
      <div className="space-y-2">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">AdMax PC (300×250)</h2>
        <div className="border border-white/10 bg-white/5 p-4 rounded-xl flex items-center justify-center w-full overflow-hidden">
          <AdMaxBanner type="pc" />
        </div>
      </div>

    </div>
  );
}
