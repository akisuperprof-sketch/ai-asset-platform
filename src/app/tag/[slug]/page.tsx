import { Navbar } from "@/components/layout/Navbar";
import { AssetCard } from "@/components/assets/AssetCard";
import { ChevronLeft, Filter, SlidersHorizontal, Sparkles } from "lucide-react";
import Link from "next/link";
import { searchAssets } from "@/lib/assets";
import { LoadMoreGrid } from "@/components/assets/LoadMoreGrid";
import { Metadata } from "next";

// Highly detailed slug-to-Japanese mapping for flawless English/Japanese Programmatic SEO matching
const tagMapping: Record<string, string> = {
  "sushi": "寿司",
  "ramen": "ラーメン",
  "takoyaki": "たこ焼き",
  "tempura": "天ぷら",
  "wagashi": "和菓子",
  "matcha": "抹茶",
  "bento": "弁当",
  "gyoza": "餃子",
  "misoshiru": "味噌汁",
  "yakitori": "焼き鳥",
  "udon": "うどん",
  "soba": "そば",
  "karaage": "唐揚げ",
  "curry": "カレー",
  "sashimi": "刺身",
  "taiyaki": "たい焼き",
  "dango": "団子",
  "yakiniku": "焼肉",
  "sake": "日本酒",
  "fujisan": "富士山",
  "sakura": "桜",
  "torii": "鳥居",
  "jinja": "神社",
  "katana": "日本刀",
  "wagasa": "和傘",
  "chochin": "提灯",
  "manekineko": "招き猫",
  "daruma": "だるま",
  "tatami": "畳",
  "shuriken": "手裏剣",
  "shinkansen": "新幹線",
  "tokyotower": "東京タワー",
  "japanmap": "日本地図",
  "matsuri": "祭り",
  "businessman": "ビジネスマン",
  "businesswoman": "ビジネスウーマン",
  "meeting": "会議",
  "ai": "AI",
  "cloud": "クラウド",
  "contract": "契約書",
  "graph": "グラフ",
  "smartphone": "スマホ",
  "pc": "PC",
  "server": "サーバー",
  "analysis": "データ分析",
  "hospital": "病院",
  "doctor": "医者",
  "nurse": "看護師",
  "karte": "カルテ",
  "medicine": "薬",
  "dentist": "歯科",
  "mri": "MRI",
  "ecg": "心電図",
  "ambulance": "救急車",
  "medical-icon": "医療アイコン",
  "japanese-pattern": "和柄"
};

function getJapaneseTag(slug: string): string {
  const decoded = decodeURIComponent(slug).toLowerCase();
  return tagMapping[decoded] || decoded;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const jpTag = getJapaneseTag(slug);

  const title = `Free Japanese ${jpTag} PNG Assets (Transparent) | ${jpTag}の透過PNG素材 | Commercial Use | AssetNinja`;
  const description = `Download high-quality transparent Japanese ${jpTag} PNG assets. 商用利用可能な${jpTag}の透過PNG素材。Commercial-use ready AI-generated illustrations for web design, video creation, and marketing.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://assetninja.jp/tag/${slug}`,
      images: [
        {
          url: "https://assetninja.jp/brand/ninja-concept.png",
          width: 800,
          height: 1200, // Vertical OGP for Pinterest SEO optimization
          alt: `Free Japanese ${jpTag} PNG Assets | ${jpTag}の透過PNG素材`,
        }
      ]
    },
    alternates: {
      canonical: `https://assetninja.jp/tag/${slug}`,
      languages: {
        "ja": `https://assetninja.jp/tag/${slug}`,
        "en": `https://assetninja.jp/tag/${slug}`,
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

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const jpTag = getJapaneseTag(slug);
  
  // Filter assets dynamically by tag
  const limit = 24;
  const assets = await searchAssets(jpTag, "すべて", limit, 0);

  // JSON-LD Structured data for advanced Google search inclusion (SYS-005, CollectionPage schema)
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${jpTag}の背景透過PNG画像素材一覧 | AssetNinja`,
    "description": `${jpTag}の商用利用可能で高品質な背景透過PNG画像素材。AI生成によるクリアな権利関係。`,
    "url": `https://assetninja.jp/tag/${slug}`,
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
        "name": `タグ: ${jpTag}`,
        "item": `https://assetninja.jp/tag/${slug}`
      }
    ]
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `Are the ${jpTag} PNG assets free for commercial use? (商用利用は無料ですか？)`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all assets with this tag are completely free for both personal and commercial use without attribution. (はい、このタグの素材はすべて商用利用含めて完全無料でご利用いただけます。)"
        }
      },
      {
        "@type": "Question",
        "name": `Do the ${jpTag} images have transparent backgrounds? (背景は透過されていますか？)`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, all images have been processed with AI to completely remove the background, providing clean transparent PNGs. (はい、すべてAIによって完全に背景が除去された綺麗な透過PNG画像です。)"
        }
      }
    ]
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      
      {/* Schema.org Structured Data */}
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

      {/* Cyber ambient aura background */}
      <div className="absolute inset-0 bg-grid opacity-3 pointer-events-none" />
      <div className="absolute top-[10%] right-[10%] w-[50vw] h-[50vh] bg-ai-purple/5 rounded-full blur-[150px] opacity-40 pointer-events-none" />
      <div className="absolute bottom-[10%] left-[10%] w-[40vw] h-[40vh] bg-ai-cyan/5 rounded-full blur-[130px] opacity-30 pointer-events-none" />

      <Navbar />

      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto relative z-10">
        
        {/* Breadcrumbs and Page Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <Link href="/" className="text-secondary hover:text-white flex items-center gap-1 text-xs mb-4 uppercase tracking-widest transition-colors font-black">
              <ChevronLeft className="w-4 h-4" />
              HOME / ENGINE
            </Link>
            
            <div className="inline-flex items-center gap-1.5 bg-purple-500/5 border border-purple-500/10 px-3 py-1 rounded-full mb-3 shadow-[0_0_15px_rgba(168,85,247,0.03)]">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-[9px] font-black tracking-widest text-purple-300 uppercase">PROGRAMMATIC SEO INDEX</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black flex items-center gap-4 tracking-tighter">
              TAG: <span className="inline-block bg-ai-gradient bg-clip-text text-transparent [-webkit-background-clip:text] uppercase">{jpTag}</span>
              <span className="text-xs font-black text-secondary bg-white/5 px-3 py-1 rounded-full border border-white/5">
                {assets.length} ASSETS
              </span>
            </h1>
            
            <p className="text-secondary text-sm mt-4 max-w-2xl font-semibold leading-relaxed">
              「{jpTag}」に関連する、AI技術で生成された高品質な背景透過PNG画像素材の一覧です。
              すべての素材は完全に背景除去されており、商用プロジェクトや個人のWeb・動画制作に即座にご利用いただけます。
            </p>
          </div>

          <div className="flex gap-4">
            <Link href="/coming-soon" className="glass-card flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/5 border-white/5 transition-colors">
              <Filter className="w-4 h-4" />
              Filter
            </Link>
            <Link href="/coming-soon" className="glass-card flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-white/5 border-white/5 transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
              Sort
            </Link>
          </div>
        </div>

        {/* Ad Space/Platform Banner */}
        <div className="w-full p-6 glass-card border border-purple-500/10 rounded-2xl mb-12 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-ai-gradient opacity-[0.02] pointer-events-none" />
          <div className="relative z-10 text-left">
            <span className="text-[8px] font-black text-amber-500/80 tracking-[0.25em] uppercase block mb-1">PREMIUM PRO MEMBERSHIP</span>
            <h3 className="text-md font-black text-white">欲しい${jpTag}素材が見つかりませんか？</h3>
            <p className="text-[11px] text-secondary mt-1 font-semibold">Proメンバーになると、AIアセットの無制限高解像度ダウンロードや限定デザインへのアクセスが可能になります。</p>
          </div>
          <Link href="/coming-soon" className="bg-ai-gradient px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:brightness-110 shrink-0 transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]">
            Go Pro Now
          </Link>
        </div>

        {/* Assets Grid */}
        {assets.length > 0 ? (
          <>
            <div className="grid grid-cols-12 gap-6">
              {assets.map((asset) => (
                <AssetCard key={asset.id} asset={asset} />
              ))}
            </div>
            {assets.length === limit && (
              <LoadMoreGrid initialOffset={limit} tag={jpTag} />
            )}
          </>
        ) : (
          <div className="w-full py-24 flex flex-col items-center justify-center gap-4 glass-card border-white/5 rounded-3xl">
            <img src="/brand/icon-shuriken.svg" alt="Loading" className="w-12 h-12 opacity-20 animate-spin" style={{ animationDuration: '4s' }} />
            <div className="text-center">
              <h3 className="text-md font-black">素材探索中...</h3>
              <p className="text-[11px] text-secondary mt-1">「{jpTag}」に関連する新着アセットをシステムがインデックスしています。</p>
            </div>
          </div>
        )}

        {/* Detailed SEO Information Block at Bottom */}
        <section className="mt-24 p-8 glass-card rounded-3xl border-white/5">
          <h2 className="text-lg font-black uppercase tracking-wider mb-6 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500/80" /> 「{jpTag}」の透過PNG素材詳細情報
          </h2>
          <div className="grid md:grid-cols-2 gap-10 text-xs text-secondary font-semibold leading-relaxed">
            <div className="space-y-4">
              <p>
                当プラットフォーム「AssetNinja」では、最新のジェネレーティブAIテクノロジーを用いて制作された「{jpTag}」の背景透過画像を完全無料でご提供しております。一般的な画像素材サイトのような粗いクリッピングとは異なり、髪の毛のディテールや透明な質感、極小パーツの輪郭に至るまで、熟練の「忍者クリエイター」が調整したかのように完璧に透過処理された状態（PNG形式）で出力されています。
              </p>
              <p>
                透過画像であるため、Photoshop、Illustrator、Figma、あるいはPowerPointやCanvaといったデザイン・スライド作成ツールにドラッグ＆ドロップするだけで、どんな背景色にも瞬時に、そして完全に溶け込みます。
              </p>
            </div>
            <div className="space-y-4">
              <p>
                日本の食文化、伝統行事、観光資源、そして高度なビジネスや医療グラフィックスなど、あらゆるカテゴリの「日本」に関わるアセットを網羅。さらに、当サイトの素材はすべて商用利用可能（Commercial Use OK）であり、YouTubeのアイキャッチやバナー、Web広告のメインビジュアル、コーポレートサイトの挿絵としても安全にご利用いただけます。
              </p>
              <ul className="grid grid-cols-2 gap-2 text-white/80 font-black">
                <li className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-ai-cyan" />
                  完全背景透過処理済み
                </li>
                <li className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-ai-cyan" />
                  商用プロジェクト対応
                </li>
                <li className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-ai-cyan" />
                  AI生成超高解像度
                </li>
                <li className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-ai-cyan" />
                  安心安全な法的ステータス
                </li>
              </ul>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
