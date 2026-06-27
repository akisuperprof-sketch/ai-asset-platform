import React from 'react';
import { ExternalLink } from 'lucide-react';

const links = [
  {
    title: 'PopAds',
    url: 'https://www.popads.net/users/login',
  },
  {
    title: 'AdMax',
    url: 'https://admax.shinobi.jp/',
  },
  {
    title: 'Google Search Console',
    url: 'https://search.google.com/search-console',
  },
  {
    title: 'Google Analytics',
    url: 'https://analytics.google.com/',
  },
  {
    title: 'Pinterest',
    url: 'https://www.pinterest.jp/',
  },
  {
    title: 'Vercel',
    url: 'https://vercel.com/',
  },
  {
    title: 'Supabase',
    url: 'https://supabase.com/',
  }
];

export function MonetizationLinks() {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-black uppercase tracking-widest text-white mb-4">
        広告管理
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {links.map((link) => (
          <a
            key={link.title}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-purple-500/50 transition-colors group"
          >
            <span className="text-sm font-bold text-white/80 group-hover:text-white truncate pr-2">
              {link.title}
            </span>
            <ExternalLink className="w-4 h-4 text-purple-400 shrink-0" />
          </a>
        ))}
      </div>
    </section>
  );
}
