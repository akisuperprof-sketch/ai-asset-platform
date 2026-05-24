export const DESIGN_TOKENS = {
  colors: {
    background: "bg-zinc-950",
    surface: "bg-zinc-900",
    textPrimary: "text-zinc-100",
    textMuted: "text-zinc-400",
    border: "border-white/10",
    glow: "ring-1 ring-white/5",
  },
  spacing: {
    sectionDesktop: "py-32",
    sectionMobile: "py-16",
    cardGap: "gap-6",
    containerPadding: "px-4 md:px-8",
  },
  radius: {
    base: "rounded-xl",
    large: "rounded-2xl",
    full: "rounded-full",
  },
  shadow: {
    soft: "shadow-[0_8px_30px_rgb(0,0,0,0.12)]",
    deep: "shadow-[0_20px_40px_rgba(0,0,0,0.4)]",
  },
  glass: {
    base: "bg-zinc-900/50 backdrop-blur-md border border-white/5",
    heavy: "bg-zinc-950/80 backdrop-blur-xl border border-white/10",
  },
  typography: {
    heading: "tracking-tight font-semibold",
    body: "tracking-wide leading-relaxed font-normal",
  },
  zIndex: {
    header: "z-50",
    modal: "z-[100]",
    overlay: "z-40",
    base: "z-0",
  }
} as const;
