import { Navbar } from "@/components/layout/Navbar";
import { AssetCard } from "@/components/assets/AssetCard";
import { TrendingUp, Download, Link as LinkIcon } from "lucide-react";
import Link from "next/link";
import { getTrendingAssets } from "@/lib/assets";
import { Metadata } from "next";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

export const metadata: Metadata = {
  title: "Trending PNG Assets | AssetNinja",
  description: "Discover the most trending transparent PNG assets right now on AssetNinja. Free for commercial use.",
  openGraph: {
    title: "Trending PNG Assets | AssetNinja",
    description: "Discover the most trending transparent PNG assets.",
    type: "website",
  },
  alternates: {
    canonical: "https://assetninja.jp/trending",
  }
};

export default async function TrendingPage() {
  const assets = await getTrendingAssets(24, 0);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Trending PNG Assets | AssetNinja",
    "description": "Discover the most trending transparent PNG assets.",
    "url": "https://assetninja.jp/trending",
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
        "name": "Trending",
        "item": "https://assetninja.jp/trending"
      }
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Are these trending PNG assets free for commercial use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all assets on AssetNinja are completely free for both personal and commercial use without attribution."
        }
      },
      {
        "@type": "Question",
        "name": "How often is the trending list updated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "The trending list is updated dynamically based on real-time search volume, pageviews, and download trends."
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

      {/* Main Content */}
      <main className="pt-24 pb-20 px-4 md:px-8 max-w-[1600px] mx-auto">
        {/* Header section */}
        <div className="mb-12">
          <div className="flex items-center gap-3 text-ai-cyan mb-4">
            <TrendingUp className="w-6 h-6" />
            <h2 className="text-sm font-bold tracking-widest uppercase">Hot Right Now</h2>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 tracking-tight">
            Trending PNG Assets
          </h1>
          
          <p className="text-secondary text-lg max-w-2xl leading-relaxed">
            Discover the most sought-after transparent PNGs generating buzz right now. All 100% free for commercial use.
          </p>
        </div>

        {/* Asset Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>

        {/* Additional AEO Content */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass p-8 rounded-[32px] border border-white/5">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-ai-cyan" />
              Related Categories
            </h3>
            <ul className="space-y-3">
              <li><Link href="/popular" className="text-secondary hover:text-ai-cyan transition-colors">Popular Assets</Link></li>
              <li><Link href="/new" className="text-secondary hover:text-ai-cyan transition-colors">New Releases</Link></li>
              <li><Link href="/searches" className="text-secondary hover:text-ai-cyan transition-colors">Top Searches</Link></li>
            </ul>
          </div>

          <div className="glass p-8 rounded-[32px] border border-white/5">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-ai-purple" />
              Need Something Else?
            </h3>
            <p className="text-secondary mb-6">
              Can't find the perfect asset in our trending list? Request it on our Demand Radar and our AI will generate it for you.
            </p>
            <Link href="/demand-radar" className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-ai-cyan transition-colors">
              Submit a Request
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
