"use client";

import { MessageSquare } from "lucide-react";

export function ContactButton() {
  const handleContact = () => {
    window.dispatchEvent(
      new CustomEvent("show-coming-soon", { detail: { feature: "Contact Form" } })
    );
  };

  return (
    <button
      onClick={handleContact}
      className="bg-ai-gradient hover:brightness-110 text-white font-black uppercase tracking-widest px-8 py-4 rounded-2xl flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] mx-auto"
    >
      <MessageSquare className="w-5 h-5" />
      Contact Support
    </button>
  );
}
