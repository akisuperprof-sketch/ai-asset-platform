import { Navbar } from "@/components/layout/Navbar";
import { ChevronRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import { Metadata } from "next";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

export const metadata: Metadata = {
  title: "Seasonal Events & Collections | 商用利用OKの季節イベント向けPNG素材 | AssetNinja",
  description: "Browse high-quality transparent PNG assets curated for seasonal events like Halloween, Christmas, New Year, and more. All free for commercial use.",
  openGraph: {
    title: "Seasonal Events & Collections | AssetNinja",
    description: "Browse high-quality transparent PNG assets curated for seasonal events.",
    type: "website",
  },
  alternates: {
    canonical: "https://assetninja.jp/events",
  }
};

const EVENTS = [
  { id: 'spring', name: 'Spring / Sakura', jp: '春・桜', desc: 'Cherry blossoms, hanami, and spring motifs.' },
  { id: 'summer', name: 'Summer Matsuri', jp: '夏・お祭り', desc: 'Festivals, fireworks, shaved ice, and summer themes.' },
  { id: 'autumn', name: 'Autumn / Momiji', jp: '秋・紅葉', desc: 'Fall leaves, moon viewing, and autumn food.' },
  { id: 'halloween', name: 'Halloween', jp: 'ハロウィン', desc: 'Pumpkins, ghosts, and spooky assets.' },
  { id: 'christmas', name: 'Christmas', jp: 'クリスマス', desc: 'Trees, presents, and holiday designs.' },
  { id: 'new-year', name: 'New Year', jp: 'お正月', desc: 'Kadomatsu, mochitsuki, and Japanese new year items.' },
  { id: 'valentine', name: 'Valentine\'s Day', jp: 'バレンタイン', desc: 'Chocolates, hearts, and romantic designs.' },
];

export default function EventsIndexPage() {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Seasonal Events & Collections | AssetNinja",
    "description": "Browse high-quality transparent PNG assets curated for seasonal events.",
    "url": "https://assetninja.jp/events",
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": EVENTS.map((ev, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://assetninja.jp/events/${ev.id}`,
        "name": ev.name
      }))
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <PageViewTracker />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />

      <Navbar />

      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto space-y-12">
        <header className="text-center space-y-6">
          <CalendarDays className="w-16 h-16 text-ai-cyan mx-auto mb-4" />
          <h1 className="text-5xl md:text-6xl font-black tracking-tight">
            Seasonal Events
          </h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            Discover curated collections of transparent PNG assets for every holiday, season, and major event. 
          </p>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {EVENTS.map((event) => (
            <Link key={event.id} href={`/events/${event.id}`} className="group relative glass p-8 rounded-3xl overflow-hidden border border-white/5 hover:border-ai-cyan/50 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10 space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center justify-between">
                  {event.name}
                  <ChevronRight className="w-5 h-5 text-secondary group-hover:text-ai-cyan transition-colors group-hover:translate-x-1" />
                </h2>
                <div className="text-ai-purple font-medium text-sm tracking-widest">{event.jp}</div>
                <p className="text-secondary">
                  {event.desc}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
