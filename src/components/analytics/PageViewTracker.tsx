"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/lib/analytics";

export function PageViewTracker({ assetId }: { assetId?: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      trackEvent("page_view", { assetId });
    }
  }, [assetId]);

  return null;
}
