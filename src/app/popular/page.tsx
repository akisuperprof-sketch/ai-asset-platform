import { Navbar } from "@/components/layout/Navbar";
import { AssetCard } from "@/components/assets/AssetCard";
import { Star, Download, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { getPopularAssets } from "@/lib/assets";
import { Metadata } from "next";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

export const metadata: Metadata = {
  title: "Popular PNG Assets | AssetNinja",
  description: "Browse the most popular and highly downloaded transparent PNG assets. Free for commercial use without attribution.",
  openGraph: {
    title: "Popular PNG Assets | AssetNinja",
    description: "Browse the most popular and highly downloaded transparent PNG assets.",
    type: "website",
  },
  alternates: {
    canonical: "https://assetninja.jp/popular",
  }
};

export default async function PopularPage() {
  const assets = await getPopularAssets(24, 0);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Popular PNG Assets | AssetNinja",
    "description": "Browse the most popular and highly downloaded transparent PNG assets.",
    "url": "https://assetninja.jp/popular",
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

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://assetninja.jp"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Popular",
        "item": "https://assetninja.jp/popular"
      }
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How is the popular list determined?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The popular list is determined by a combination of total downloads, pageviews, and asset quality score."
        }
      },
      {
        "@type": "Question",
        "name": "Can I use these popular images for commercial projects?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all our popular PNG assets are 100% free for commercial use. No attribution required."
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-black">
      <PageViewTracker />
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Navbar />

      <main className="pt-24 pb-20 px-4 md:px-8 max-w-[1600px] mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 text-yellow-400 mb-4">
            <Star className="w-6 h-6" />
            <h2 className="text-sm font-bold tracking-widest uppercase">All-Time Favorites</h2>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
            Popular PNG Assets
          </h1>
          
          <p className="text-secondary text-lg max-w-2xl leading-relaxed">
            The most downloaded and viewed transparent PNGs in our library. Ready to drop into your next masterpiece.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-[32px] border border-white/5">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-yellow-400" />
              Related Collections
            </h3>
            <ul className="space-y-3">
              <li><Link href="/trending" className="text-secondary hover:text-yellow-400 transition-colors">Trending Assets</Link></li>
              <li><Link href="/new" className="text-secondary hover:text-yellow-400 transition-colors">New Releases</Link></li>
              <li><Link href="/searches" className="text-secondary hover:text-yellow-400 transition-colors">Top Searches</Link></li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
