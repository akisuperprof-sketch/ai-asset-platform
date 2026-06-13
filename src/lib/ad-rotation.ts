"use client";

// Determines ad type based on download count history
export type AdType = 'admax' | 'popads' | 'none';

export function getNextAdType(): AdType {
  if (typeof window === "undefined") return 'none';

  // Safety: never show ads in admin
  if (window.location.pathname.startsWith('/admin')) return 'none';

  // Extract env config
  const adsEnabled = process.env.NEXT_PUBLIC_ADS_ENABLED !== 'false'; // default true if not set
  const admaxEnabled = process.env.NEXT_PUBLIC_ADMAX_ENABLED !== 'false';
  // Use env var to enable PopAds dynamically
  const popadsEnabled = isPopAdsEnabled();
  
  if (!adsEnabled) return 'none';

  const countStr = localStorage.getItem("assetninja_download_count") || "0";
  const count = parseInt(countStr, 10);
  const nextCount = count + 1; // The download we are about to make

  // Initial Rules
  // 1st DL: AdMax
  // 2nd DL: AdMax
  // 3rd DL: PopAds (or AdMax if disabled)
  // 4th DL: AdMax
  // 5th+ DL: AdMax, PopAds every 5 times

  if (nextCount === 1) return admaxEnabled ? 'admax' : 'none';
  if (nextCount === 2) return admaxEnabled ? 'admax' : 'none';
  if (nextCount === 3) return popadsEnabled ? 'popads' : (admaxEnabled ? 'admax' : 'none');
  if (nextCount === 4) return admaxEnabled ? 'admax' : 'none';

  // 5th and beyond
  if (nextCount % 5 === 0) {
    return popadsEnabled ? 'popads' : (admaxEnabled ? 'admax' : 'none');
  } else {
    return admaxEnabled ? 'admax' : 'none';
  }
}

export function isPopAdsEnabled(): boolean {
  const raw = process.env.NEXT_PUBLIC_POPADS_ENABLED;
  const normalized = String(raw ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .toLowerCase();

  return normalized === "true" || normalized === "1" || normalized === "yes";
}
export function incrementDownloadCount(): void {
  if (typeof window === "undefined") return;
  const countStr = localStorage.getItem("assetninja_download_count") || "0";
  const count = parseInt(countStr, 10);
  localStorage.setItem("assetninja_download_count", (count + 1).toString());
}

export function injectPopAds(): void {
  const isDebug = (typeof window !== "undefined" && (window as any).__ASSETNINJA_POPADS_DEBUG__) || process.env.NODE_ENV !== 'production';
  if (isDebug) console.log("STEP1: injectPopAds called");

  if (typeof window === "undefined") return;
  
  if (isDebug) console.log("[AssetNinja Ads] POPADS ENV RAW:", process.env.NEXT_PUBLIC_POPADS_ENABLED);
  const popadsEnabled = isPopAdsEnabled();
  if (isDebug) console.log("[AssetNinja Ads] POPADS ENV NORMALIZED:", String(process.env.NEXT_PUBLIC_POPADS_ENABLED ?? "").trim().replace(/^["']|["']$/g, "").toLowerCase());
  if (isDebug) console.log("[AssetNinja Ads] POPADS ENABLED:", popadsEnabled);

  if (!popadsEnabled) {
    if (isDebug) console.log("STEP1.5: PopAds is disabled by env var");
    return;
  }

  if (document.getElementById('popads-official-script')) {
    if (isDebug) console.log("STEP1.8: Already injected");
    return; // Already injected
  }

  if (isDebug) console.log('[AssetNinja Ads] PopAds script injected');

  (function(){
    try {
      var x = window as any, w = "daabdbd1085c8eac168fbc1841871760", 
      g = [["siteId", 36*657+269+326+5278822], ["minBid", 0], ["popundersPerIP", "0"], ["delayBetween", 0], ["default", false], ["defaultPerDay", 0], ["topmostLayer", "auto"]], 
      d = ["d3d3LmFudGlhZGJsb2Nrc3lzdGVtcy5jb20vbnRyYWNraW5nLW1pbi5jc3M=", "ZDNjb2Q4MHRobjdxbmQuY2xvdWRmcm9udC5uZXQvVC9kYW1pLm1pbi5qcw=="], 
      f = -1, u: HTMLScriptElement, n: any, 
      k = function(){
        clearTimeout(n);
        f++;
        if(d[f] && !(1806839948000 < (new Date).getTime() && 1 < f)){
          u = x.document.createElement("script");
          u.type = "text/javascript";
          u.async = true;
          u.setAttribute('data-cfasync', 'false');
          u.id = 'popads-official-script';
          if (isDebug) console.log("STEP3: script created", u.src);
          var i = x.document.getElementsByTagName("script")[0];
          u.src = "https://" + atob(d[f]);
          u.crossOrigin = "anonymous";
          u.onerror = function(e) {
            if (isDebug) console.error("POPADS LOAD ERROR", e);
            k();
          };
          u.onload = function(){
            if (isDebug) console.log("STEP6: script onload success");
            clearTimeout(n);
            x[w.slice(0, 16) + w.slice(0, 16)] || k();
          };
          n = setTimeout(k, 5000);
          
          if (isDebug) console.log("STEP4: right before appendChild to", i && i.parentNode ? "parentNode" : "document.head");
          if (i && i.parentNode) {
            i.parentNode.insertBefore(u, i);
          } else {
            x.document.head.appendChild(u);
          }
          if (isDebug) console.log("STEP5: appendChild finished");
        } else {
           if (isDebug) console.log("STEP_END: no more domains in d array or condition failed");
        }
      };
      
      if (!x[w]) {
        try { 
          Object.freeze(x[w] = g); 
          if (isDebug) console.log("STEP2: window property set and frozen");
        } catch(e) {
          if (isDebug) console.error("Caught error in Object.freeze", e);
        }
        k();
      } else {
        if (isDebug) console.log("STEP2 (skip): window property already exists");
        k();
      }
    } catch (e) {
       if (isDebug) console.error("Caught error in main wrapper", e);
    }
  })();
}
