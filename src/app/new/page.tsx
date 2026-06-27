import { Navbar } from "@/components/layout/Navbar";
import { AssetCard } from "@/components/assets/AssetCard";
import { Sparkles, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { getAssets } from "@/lib/assets";
import { Metadata } from "next";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

export const metadata: Metadata = {
  title: "New PNG Assets | AssetNinja",
  description: "Browse the newest transparent PNG assets added to AssetNinja. Daily updates, completely free for commercial use.",
  openGraph: {
    title: "New PNG Assets | AssetNinja",
    description: "Browse the newest transparent PNG assets added to AssetNinja.",
    type: "website",
  },
  alternates: {
    canonical: "https://assetninja.jp/new",
  }
};

export default async function NewPage() {
  const assets = await getAssets(24, 0);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "New PNG Assets | AssetNinja",
    "description": "Browse the newest transparent PNG assets added to AssetNinja.",
    "url": "https://assetninja.jp/new",
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
        "name": "New Releases",
        "item": "https://assetninja.jp/new"
      }
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How often are new PNG assets added?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "New assets are added daily based on AI generation and community requests."
        }
      },
      {
        "@type": "Question",
        "name": "Are the newest PNG assets free for commercial use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all our newly released PNG assets are completely free for commercial use from the moment they are published."
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
          <div className="flex items-center gap-3 text-ai-purple mb-4">
            <Sparkles className="w-6 h-6" />
            <h2 className="text-sm font-bold tracking-widest uppercase">Freshly Generated</h2>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
            New PNG Assets
          </h1>
          
          <p className="text-secondary text-lg max-w-2xl leading-relaxed">
            The absolute newest transparent PNGs in our library. Always free, always high quality.
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
              <LinkIcon className="w-5 h-5 text-ai-purple" />
              Related Collections
            </h3>
            <ul className="space-y-3">
              <li><Link href="/trending" className="text-secondary hover:text-ai-purple transition-colors">Trending Assets</Link></li>
              <li><Link href="/popular" className="text-secondary hover:text-ai-purple transition-colors">Popular Assets</Link></li>
              <li><Link href="/events" className="text-secondary hover:text-ai-purple transition-colors">Event Assets</Link></li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
