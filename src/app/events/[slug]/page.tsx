import { Navbar } from "@/components/layout/Navbar";
import { AssetCard } from "@/components/assets/AssetCard";
import { ChevronLeft, CalendarDays } from "lucide-react";
import Link from "next/link";
import { searchAssets } from "@/lib/assets";
import { LoadMoreGrid } from "@/components/assets/LoadMoreGrid";
import { Metadata } from "next";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

const EVENTS_MAP: Record<string, { name: string, jp: string, query: string }> = {
  'spring': { name: 'Spring / Sakura', jp: '春・桜', query: 'sakura' },
  'summer': { name: 'Summer Matsuri', jp: '夏・お祭り', query: 'matsuri' },
  'autumn': { name: 'Autumn / Momiji', jp: '秋・紅葉', query: 'momiji' },
  'halloween': { name: 'Halloween', jp: 'ハロウィン', query: 'halloween' },
  'christmas': { name: 'Christmas', jp: 'クリスマス', query: 'christmas' },
  'new-year': { name: 'New Year', jp: 'お正月', query: 'new year' },
  'valentine': { name: 'Valentine\'s Day', jp: 'バレンタイン', query: 'valentine' },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const eventInfo = EVENTS_MAP[slug] || { name: slug, jp: '', query: slug };

  const title = `${eventInfo.name} PNG Assets | ${eventInfo.jp}素材（透過）｜AssetNinja`;
  const description = `Free transparent PNG assets for ${eventInfo.name}. Perfect for your seasonal designs, social media, and commercial projects.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    alternates: {
      canonical: `https://assetninja.jp/events/${encodeURIComponent(slug)}`,
    }
  };
}

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const eventInfo = EVENTS_MAP[slug] || { name: slug, jp: '', query: slug };
  
  const limit = 24;
  // Use the query string to search across title or tags if category isn't perfect
  const assets = await searchAssets(eventInfo.query, "", limit, 0);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${eventInfo.name} Transparent PNG Assets | AssetNinja`,
    "description": `Free transparent PNG assets for ${eventInfo.name}.`,
    "url": `https://assetninja.jp/events/${slug}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": assets.length,
      "itemListElement": assets.map((asset, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://assetninja.jp/items/${asset.id}`,
        "name": asset.title
      }))
    }
  };

  const imagesJsonLd = assets.map(asset => ({
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "contentUrl": asset.imageUrl,
    "license": "https://assetninja.jp/copyright",
    "acquireLicensePage": `https://assetninja.jp/items/${asset.id}`,
    "creditText": "AssetNinja",
    "creator": {
      "@type": "Organization",
      "name": "AssetNinja"
    },
    "copyrightNotice": "Free for commercial use, no attribution required."
  }));

  return (
    <div className="min-h-screen bg-black">
      <PageViewTracker />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(imagesJsonLd) }} />

      <Navbar />

      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        <div className="glass p-8 md:p-12 rounded-[32px] mb-12 relative overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10 opacity-50"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex-1">
              <Link href="/events" className="text-secondary hover:text-white flex items-center gap-1 text-sm mb-6 uppercase tracking-widest font-black">
                <ChevronLeft className="w-4 h-4" />
                ALL EVENTS
              </Link>
              <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter flex items-center gap-4">
                <CalendarDays className="w-12 h-12 text-ai-cyan hidden sm:block" />
                {eventInfo.name}
              </h1>
              <p className="text-secondary text-lg leading-relaxed max-w-2xl font-medium">
                High-quality transparent PNG assets for {eventInfo.name} ({eventInfo.jp}). Perfect for seasonal campaigns, social media, and presentations.
              </p>
            </div>
            
            <div className="flex items-center gap-6 glass px-8 py-4 rounded-2xl border-white/5">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-secondary font-black mb-1">Assets Found</p>
                <p className="text-2xl font-black text-white">{assets.length > 0 ? assets.length + '+' : '...'}</p>
              </div>
            </div>
          </div>
        </div>

        {assets.length === 0 ? (
          <div className="text-center py-20 text-secondary glass rounded-3xl">
            <p className="text-xl font-bold mb-4">No assets found for {eventInfo.name} yet.</p>
            <p>Our AI is generating new seasonal assets based on demand.</p>
            <Link href="/" className="inline-block mt-6 text-ai-cyan hover:underline">
              Browse all categories
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-12 gap-6">
            {assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3" />
            ))}
          </div>
        )}
        
        {assets.length === limit && (
          <LoadMoreGrid initialOffset={limit} query={eventInfo.query} />
        )}

      </main>
    </div>
  );
}
