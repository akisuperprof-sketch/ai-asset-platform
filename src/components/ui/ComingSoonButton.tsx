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
    window.dispatchEvent(
      new CustomEvent("show-coming-soon", { detail: { feature } })
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${className} cursor-not-allowed`}
      aria-disabled="true"
    >
      {children}
    </button>
  );
}
