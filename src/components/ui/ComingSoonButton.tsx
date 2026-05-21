"use client";

import React from "react";

interface ComingSoonButtonProps {
  feature: string;
  className?: string;
  children: React.ReactNode;
}

export function ComingSoonButton({ feature, className, children }: ComingSoonButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    window.dispatchEvent(
      new CustomEvent("show-coming-soon", { detail: { feature } })
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${className} cursor-pointer hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 relative flex items-center justify-center gap-2 group/soon`}
    >
      {children}
      <span className="text-[7px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/25 px-1.5 py-0.5 rounded uppercase tracking-widest pointer-events-none group-hover/soon:border-amber-400 group-hover/soon:bg-amber-400/20 transition-all shrink-0">
        SOON
      </span>
    </button>
  );
}
