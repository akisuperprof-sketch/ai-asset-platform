/**
 * AssetNinja Premium Telemetry & Analytics Tracker
 * Handles monetization and user download engagement events.
 */

export type AnalyticsEvent = 
  | "reward_modal_open"
  | "reward_skip_click"
  | "canva_click"
  | "adobe_click"
  | "impact_click"
  | "instant_download_unlock"
  | "download_complete";

export function trackEvent(event: AnalyticsEvent, metadata?: Record<string, any>) {
  // 1. Premium Console Logger for visual inspection during development
  console.log(`%c[TELEMETRY OS] Event Tracked: ${event}`, "color: #a855f7; font-weight: bold; background: rgba(168, 85, 247, 0.1); padding: 2px 6px; border-radius: 4px;", {
    timestamp: new Date().toISOString(),
    ...metadata
  });

  // 2. Safe Window/GTM/Vercel Analytics dispatch
  if (typeof window !== "undefined") {
    try {
      // Fire custom DOM Event for dynamic telemetry listeners
      const customEvent = new CustomEvent("assetninja_analytics", { 
        detail: { event, metadata, time: Date.now() } 
      });
      window.dispatchEvent(customEvent);

      // Support Vercel Web Analytics custom events if present
      if ((window as any).va) {
        (window as any).va("event", { id: event, ...metadata });
      }

      // Support Google Analytics / GTM dataLayer push
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: `ninja_${event}`,
          ...metadata
        });
      }
    } catch (e) {
      console.warn("[TELEMETRY OS] Failed to dispatch safe tracking payload:", e);
    }
  }
}
