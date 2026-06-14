"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function LegalNav() {
  const pathname = usePathname();

  const links = [
    { name: "Terms", href: "/terms" },
    { name: "Privacy", href: "/privacy" },
    { name: "Contact", href: "/contact" },
    { name: "Copyright", href: "/copyright" },
  ];

  return (
    <div className="mb-12 border-b border-white/10 pb-6 text-center">
      <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-purple-400 mb-6">
        AssetNinja Legal Center
      </h2>
      <nav className="flex flex-wrap justify-center gap-4 md:gap-8">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`text-xs font-bold uppercase tracking-widest transition-colors pb-2 border-b-2 ${
                isActive
                  ? "text-white border-white"
                  : "text-zinc-500 border-transparent hover:text-white"
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
