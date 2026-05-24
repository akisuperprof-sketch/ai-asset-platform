export const MOTION_TOKENS = {
  fade: "transition-opacity duration-300 ease-out",
  smoke: "animate-in fade-in duration-500 ease-out fill-mode-forwards",
  stealth: "transition-all duration-200 ease-in-out opacity-80 hover:opacity-100",
  hoverSoft: "transition-all duration-300 ease-out hover:bg-white/[0.05]",
  ninjaSlide: "animate-in slide-in-from-bottom-4 fade-in duration-400 ease-out",
  particleFlow: "transition-transform duration-700 ease-out",
} as const;

export const FORBIDDEN_MOTION_CLASSES = [
  "bounce",
  "spin",
  "hover:-translate-y",
  "hover:scale",
  "animate-pulse",
  "duration-75", // Too fast/jerky
  "duration-1000", // Too slow
];
