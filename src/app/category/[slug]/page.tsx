import { Navbar } from "@/components/layout/Navbar";
import { AssetCard } from "@/components/assets/AssetCard";
import { ChevronLeft, Filter, SlidersHorizontal, TrendingUp, Link as LinkIcon, Download } from "lucide-react";
import Link from "next/link";
import { searchAssets } from "@/lib/assets";
import { LoadMoreGrid } from "@/components/assets/LoadMoreGrid";
import { Metadata } from "next";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";

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
      canonical: `https://assetninja.jp/${encodeURIComponent(categoryName)}-png`,
      languages: {
        "ja": `https://assetninja.jp/${encodeURIComponent(categoryName)}-png`,
        "en": `https://assetninja.jp/${encodeURIComponent(categoryName)}-png`,
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
    "url": `https://assetninja.jp/${slug}-png`,
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
        "item": `https://assetninja.jp/${slug}-png`
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

        {/* GEO / AEO Content Section at bottom */}
        <section className="mt-24 p-8 md:p-12 glass rounded-apple border-white/5 space-y-12">
          
          <div>
            <h2 className="text-3xl font-black mb-6">What is {categoryName} PNG? (定義・概要)</h2>
            <div className="text-secondary leading-relaxed space-y-4">
              <p>
                <strong>{categoryName} PNG</strong> is a highly sought-after digital asset featuring {categoryName} images with completely transparent backgrounds.
                AssetNinja provides ultra-realistic, AI-generated {categoryName} graphics that are ready to be used in any design project without the hassle of background removal.
              </p>
              <p>
                当プラットフォームでは、最新のAI技術を活用して生成された「{categoryName}」の透過PNG画像を豊富に取り揃えています。
                すべての素材は背景が完全に除去されており、WebデザインやSNSの投稿画像、プレゼンテーション資料などに即座に合成することが可能です。
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass p-8 rounded-2xl border-white/5">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-ai-cyan" /> Popular Uses & Applications
              </h3>
              <ul className="space-y-4 text-secondary">
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-ai-purple shrink-0" />
                  <div>
                    <strong className="text-white">Web & App UI Design:</strong>
                    <p className="text-sm mt-1">Enhance user interfaces, landing pages, and hero sections with high-quality {categoryName} visuals.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-ai-purple shrink-0" />
                  <div>
                    <strong className="text-white">Social Media & Marketing:</strong>
                    <p className="text-sm mt-1">Perfect for Instagram stories, YouTube thumbnails, and promotional banners.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-2 rounded-full bg-ai-purple shrink-0" />
                  <div>
                    <strong className="text-white">Canva & Presentation:</strong>
                    <p className="text-sm mt-1">Easily drag and drop into Canva, PowerPoint, or Keynote presentations.</p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="glass p-8 rounded-2xl border-white/5 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Commercial Use Advantages</h3>
                <p className="text-secondary leading-relaxed mb-4">
                  商用利用においても権利関係がクリアな素材のみを厳選しています。広告制作、クライアントワーク、印刷物など、幅広いビジネス要件に安全に対応できます。
                </p>
                <ul className="list-disc list-inside text-secondary space-y-2 mb-6">
                  <li>No attribution required (クレジット表記不要)</li>
                  <li>Royalty-free commercial use (ロイヤリティフリー商用利用可)</li>
                  <li>High-resolution quality (高解像度)</li>
                </ul>
              </div>
              <Link href={`/guide/${slug}-png`} className="inline-flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-white/90 transition-colors">
                Read the {categoryName} Full Guide
              </Link>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <details className="group glass p-6 rounded-2xl cursor-pointer">
                <summary className="font-bold text-lg list-none flex justify-between items-center">
                  Are these {categoryName} PNG assets truly free for commercial use?
                  <span className="text-ai-cyan group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-secondary leading-relaxed">
                  Yes, absolutely. All {categoryName} images available on AssetNinja are completely free for personal and commercial projects. You do not need to provide attribution or pay royalties.
                </p>
              </details>
              <details className="group glass p-6 rounded-2xl cursor-pointer">
                <summary className="font-bold text-lg list-none flex justify-between items-center">
                  How can I use these transparent PNGs in Canva?
                  <span className="text-ai-cyan group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="mt-4 text-secondary leading-relaxed">
                  It's very simple! Just download the {categoryName} PNG file to your device, drag and drop it into your Canva uploads folder, and place it onto your canvas. Since the background is transparent, it will blend perfectly with any design.
                </p>
              </details>
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
