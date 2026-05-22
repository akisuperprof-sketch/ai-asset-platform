import { Navbar } from "@/components/layout/Navbar";
import { AssetCard } from "@/components/assets/AssetCard";
import { ChevronLeft, Filter, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { searchAssets } from "@/lib/assets";
import { Metadata } from "next";

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
    }
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categoryName = decodeURIComponent(slug);
  
  const assets = await searchAssets("", categoryName);

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
          "text": "Yes, all assets in this category are completely free for both personal and commercial use without attribution. (はい、このカテゴリの素材はすべて商用利用含めて完全無料でご利用いただけます。)"
        }
      },
      {
        "@type": "Question",
        "name": `Do the ${categoryName} images have transparent backgrounds? (背景は透過されていますか？)`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all images have been processed with AI to completely remove the background, providing clean transparent PNGs. (はい、すべてAIによって完全に背景が除去された綺麗な透過PNG画像です。)"
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
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <Link href="/" className="text-secondary hover:text-white flex items-center gap-1 text-sm mb-4">
              <ChevronLeft className="w-4 h-4" />
              ホームへ戻る
            </Link>
            <h1 className="text-4xl md:text-5xl font-bold flex items-center gap-4">
              {categoryName}
              <span className="text-lg font-normal text-secondary bg-white/5 px-4 py-1 rounded-full border border-white/10">
                {assets.length} assets
              </span>
            </h1>
            <p className="text-secondary mt-4 max-w-2xl">
              「{categoryName}」に関する高品質な背景透過PNG素材の一覧です。
              AI生成によるクリーンな権利関係の素材を無料でダウンロードいただけます。
            </p>
          </div>

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
            <AssetCard key={asset.id} asset={asset} />
          ))}
        </div>

        {/* SEO Content Section at bottom */}
        <section className="mt-24 p-8 glass rounded-apple border-white/5">
          <h2 className="text-xl font-bold mb-6">「{categoryName}」素材について</h2>
          <div className="grid md:grid-cols-2 gap-10 text-sm text-secondary leading-relaxed">
            <div>
              <p className="mb-4">
                当プラットフォームでは、最新のAI技術を活用して生成された「{categoryName}」の透過PNG画像を豊富に取り揃えています。
                すべての素材は背景が完全に除去されており、デザインの背景色を問わず即座に合成することが可能です。
              </p>
              <p>
                商用利用においても権利関係がクリアな素材のみを厳選しているため、広告、Webデザイン、YouTube動画制作などのプロジェクトでも安心してお使いいただけます。
              </p>
            </div>
            <div>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-ai-purple" />
                  高解像度（最大 4000px）での提供
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-ai-purple" />
                  最新のAIアルゴリズムによる精密なエッジ処理
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-ai-purple" />
                  登録不要・クレジット表記不要の無料ダウンロード
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
