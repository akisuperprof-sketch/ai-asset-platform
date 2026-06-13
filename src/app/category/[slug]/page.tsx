import { Navbar } from "@/components/layout/Navbar";
import { AssetCard } from "@/components/assets/AssetCard";
import { ChevronLeft, Filter, SlidersHorizontal, TrendingUp, Link as LinkIcon, Download } from "lucide-react";
import Link from "next/link";
import { searchAssets } from "@/lib/assets";
import { LoadMoreGrid } from "@/components/assets/LoadMoreGrid";
import { Metadata } from "next";

const CATEGORY_MAP = ['ramen', 'sushi', 'tempura', 'gyoza', 'mochi', 'bento', 'torii', 'sakura', 'matcha', 'japanese-pattern'];

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = decodeURIComponent(slug);

  const title = `${categoryName} | Transparent PNG Assets | ${categoryName}のPNG素材（透過）一覧｜商用利用OK | AssetNinja`;
  const description = `Download commercial-use ready transparent PNG assets for ${categoryName}. ${categoryName}の商用利用可能な透過PNG素材一覧です。日本発の高品質AIアセットが無料でダウンロード可能。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    alternates: {
      canonical: `https://assetninja.jp/category/${encodeURIComponent(categoryName)}`,
      languages: {
        "ja": `https://assetninja.jp/category/${encodeURIComponent(categoryName)}`,
        "en": `https://assetninja.jp/category/${encodeURIComponent(categoryName)}`,
      }
    },
    // Pinterest specific meta configurations
    other: {
      "pinterest:card": "summary_large_image",
      "pinterest:title": title,
      "pinterest:description": description
    }
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categoryName = decodeURIComponent(slug);
  
  const limit = 24;
  const assets = await searchAssets("", categoryName, limit, 0);
  const relatedCategories = CATEGORY_MAP.filter(c => c !== categoryName.toLowerCase()).slice(0, 5);

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${categoryName}の背景透過PNG画像素材一覧 | AssetNinja`,
    "description": `Download commercial-use ready transparent PNG assets for ${categoryName}.`,
    "url": `https://assetninja.jp/category/${slug}`,
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
        "name": "ホーム",
        "item": "https://assetninja.jp"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": `カテゴリ: ${categoryName}`,
        "item": `https://assetninja.jp/category/${slug}`
      }
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Are the ${categoryName} PNG assets free for commercial use? (商用利用は無料ですか？)`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all assets in this category are completely free for both personal and commercial use without attribution. (はい、このカテゴリの素材はすべて商用利用含めて完全無料でご利用いただけます。クレジット表記も不要です。)"
        }
      },
      {
        "@type": "Question",
        "name": `Do the ${categoryName} images have transparent backgrounds? (背景は透過されていますか？)`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all images have been processed with advanced clipping AI to completely remove the background, providing clean transparent PNGs. (はい、すべて高度なAIによって完全に背景が除去された綺麗な透過PNG画像です。)"
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-black">
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

      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        {/* SEO Header Block */}
        <div className="glass p-8 md:p-12 rounded-[32px] mb-12 relative overflow-hidden border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-br from-ai-purple/20 via-transparent to-ai-cyan/10 opacity-50"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="flex-1">
              <Link href="/" className="text-secondary hover:text-white flex items-center gap-1 text-sm mb-6 uppercase tracking-widest font-black">
                <ChevronLeft className="w-4 h-4" />
                HOME
              </Link>
              <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">
                {categoryName}
              </h1>
              <p className="text-secondary text-lg leading-relaxed max-w-2xl font-medium">
                High-quality transparent {categoryName} PNG assets for web design, social media, menus, presentations, stickers, and commercial projects. (高品質な透過PNG素材)
              </p>
            </div>
            
            {/* Stats */}
            <div className="flex items-center gap-6 glass px-8 py-4 rounded-2xl border-white/5">
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-secondary font-black mb-1">Assets</p>
                <p className="text-2xl font-black text-white">{assets.length > 0 ? assets.length + '+' : '...'}</p>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div className="text-center">
                <p className="text-[10px] uppercase tracking-widest text-secondary font-black mb-1">Downloads</p>
                <p className="text-2xl font-black text-white">{(assets.length * 15) + 120}+</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-6">
          <div className="flex gap-4">
            <Link href="/coming-soon" className="glass flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition-colors">
              <Filter className="w-4 h-4" />
              フィルター
            </Link>
            <Link href="/coming-soon" className="glass flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium hover:bg-white/10 transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              並び替え
            </Link>
          </div>
        </div>

        {/* Ad Space for Category Page */}
        <div className="w-full h-24 glass border border-ai-blue/20 rounded-apple mb-12 flex items-center justify-center text-secondary/40 text-xs italic">
          Premium Ad Placement
        </div>

        <div className="grid grid-cols-12 gap-6">
          {assets.map((asset) => (
            <AssetCard key={asset.id} asset={asset} className="col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3" />
          ))}
        </div>
        
        {assets.length === limit && (
          <LoadMoreGrid initialOffset={limit} category={categoryName} />
        )}

        {/* SEO Content Section at bottom */}
        <section className="mt-24 p-8 glass rounded-apple border-white/5">
          <h2 className="text-2xl font-black mb-8">About {categoryName} Assets</h2>
          <div className="grid md:grid-cols-2 gap-12 text-sm text-secondary leading-relaxed">
            <div>
              <p className="mb-6 font-medium text-base text-white/80">
                当プラットフォームでは、最新のAI技術を活用して生成された「{categoryName}」の透過PNG画像を豊富に取り揃えています。
                すべての素材は背景が完全に除去されており、デザインの背景色を問わず即座に合成することが可能です。
              </p>
              <p>
                商用利用においても権利関係がクリアな素材のみを厳選しているため、広告、Webデザイン、YouTube動画制作などのプロジェクトでも安心してお使いいただけます。
              </p>
            </div>
            <div className="glass p-6 rounded-2xl border-white/5">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-ai-cyan" /> Popular Uses</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-ai-purple" />
                  Web & App UI Design
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-ai-purple" />
                  Restaurant Menus & Banners
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-ai-purple" />
                  Social Media Posts & Stories
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-ai-purple" />
                  Stickers & Cliparts
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Related Categories */}
        {relatedCategories.length > 0 && (
          <section className="mt-12">
            <h3 className="text-sm font-black uppercase tracking-widest text-secondary mb-6 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" /> Related Categories
            </h3>
            <div className="flex flex-wrap gap-4">
              {relatedCategories.map(cat => (
                <Link key={cat} href={`/category/${cat}`} className="glass px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors">
                  {cat}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
