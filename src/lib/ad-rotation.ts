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
  // HARDCODED FALSE for AdMax Static Approval Mode
  const popadsEnabled = false; // process.env.NEXT_PUBLIC_POPADS_ENABLED === 'true';
  
  if (!adsEnabled) return 'none';

  const countStr = localStorage.getItem("assetninja_download_count") || "0";
  const count = parseInt(countStr, 10);
  const nextCount = count + 1; // The download we are about to make

  // Initial Rules
  // 1st DL: AdMax
  // 2nd DL: none
  // 3rd DL: PopAds (or AdMax if disabled)
  // 4th DL: AdMax
  // 5th+ DL: Alternate PopAds / AdMax

  if (nextCount === 1) return admaxEnabled ? 'admax' : 'none';
  if (nextCount === 2) return 'none';
  if (nextCount === 3) return popadsEnabled ? 'popads' : (admaxEnabled ? 'admax' : 'none');
  if (nextCount === 4) return admaxEnabled ? 'admax' : 'none';

  // 5th and beyond
  if (nextCount % 2 === 1) { // 5, 7, 9...
    return popadsEnabled ? 'popads' : (admaxEnabled ? 'admax' : 'none');
  } else { // 6, 8, 10...
    return admaxEnabled ? 'admax' : 'none';
  }
}

export function incrementDownloadCount(): void {
  if (typeof window === "undefined") return;
  const countStr = localStorage.getItem("assetninja_download_count") || "0";
  const count = parseInt(countStr, 10);
  localStorage.setItem("assetninja_download_count", (count + 1).toString());
}
