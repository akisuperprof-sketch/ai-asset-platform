"use client";

import { useEffect, useState } from "react";
import { NinjaAntigravitySplash } from "@/components/brand/NinjaAntigravitySplash";

interface SplashWrapperProps {
  children: React.ReactNode;
}

export function SplashWrapper({ children }: SplashWrapperProps) {
  const [showSplash, setShowSplash] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setIsMounted(true);
    
    // Check session storage to see if we should display the splash on this session
    const hasVisitedSession = sessionStorage.getItem("ninja-splash-session-active");
    
    if (!hasVisitedSession) {
      setShowSplash(true);
      sessionStorage.setItem("ninja-splash-session-active", "true");
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // If not mounted yet (SSR phase), render children directly for absolute SEO safety and zero CLS/LCP issues
  if (!isMounted) {
    return <>{children}</>;
  }

  return (
    <>
      {showSplash && (
        <NinjaAntigravitySplash onComplete={handleSplashComplete} />
      )}
      
      <div 
        className={`transition-opacity duration-700 ease-out ${
          showSplash ? "opacity-0 h-screen overflow-hidden pointer-events-none" : "opacity-100"
        }`}
      >
        {children}
      </div>
    </>
  );
}
