import { getAssetById, getAssets } from "@/lib/assets";
import { dummyAssets } from "@/lib/dummy-data";
import { Navbar } from "@/components/layout/Navbar";
import { AssetCard } from "@/components/assets/AssetCard";
import { 
  ShieldCheck, 
  Tag, 
  Clock, 
  Maximize2, 
  Heart,
  FileCode,
  Box,
  Bookmark,
  Zap
} from "lucide-react";
import { DownloadButton } from "@/components/download/DownloadButton";
import { AssetPreviewContainer } from "@/components/assets/AssetPreviewContainer";

import { Metadata } from "next";
import Link from "next/link";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const asset = await getAssetById(id);
  
  if (!asset) return { title: "Asset Not Found" };

  const title = `${asset.title} | Transparent PNG Asset | 背景透過PNG素材｜商用利用OK (Commercial Use) | AssetNinja`;
  const description = asset.description || `Download ${asset.title} high-quality transparent PNG asset. 商用利用可能な日本発のプレミアム素材。背景切り抜き済みでWebデザインや資料作成にすぐ使えます。Commercial use ready, AI-generated illustration.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: asset.imageUrl,
          width: 1000,
          height: 1500, // Pinterest 2:3 aspect ratio recommendation
          alt: title,
        }
      ],
      type: "article", // Pinterest Rich Pin requires article/product
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [asset.imageUrl],
    },
    alternates: {
      canonical: `https://assetninja.jp/items/${id}`,
      languages: {
        "ja": `https://assetninja.jp/items/${id}`,
        "en": `https://assetninja.jp/items/${id}`,
      }
    },
    other: {
      "pinterest:card": "summary_large_image",
      "pinterest:title": title,
      "pinterest:description": description
    }
  };
}

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
  "medical-icon": "医療アイコン"
};

function slugifyTag(tag: string): string {
  const entry = Object.entries(tagMapping).find(([_, val]) => val === tag);
  if (entry) return entry[0];
  return encodeURIComponent(tag);
}

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = await getAssetById(id);
  const allAssets = await getAssets();

  if (!asset) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">Asset Not Found</h1>
          <Link href="/" className="text-ai-cyan hover:underline font-bold uppercase tracking-widest text-xs">
            ホームへ戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white selection:bg-ai-purple/30">
      <PageViewTracker assetId={asset.id} />
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32 pb-32">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-secondary mb-12">
          <Link href="/" className="hover:text-white transition-colors">ホーム</Link>
          <span className="text-white/20">/</span>
          <Link href={`/category/${asset.category}`} className="hover:text-white transition-colors">{asset.category}</Link>
          <span className="text-white/20">/</span>
          <span className="text-white">{asset.title}</span>
        </div>

        {/* Robust Layout Container */}
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Left Side: Previews (Main content) */}
          <div className="w-full lg:w-2/3 space-y-8">
            <AssetPreviewContainer imageUrl={asset.imageUrl} title={asset.title} />

            {/* Related Tags */}
            <div className="pt-4">
              <div className="flex items-center gap-3 mb-6">
                <Tag className="w-4 h-4 text-ai-cyan" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-secondary">
                  Associated Senses
                </h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {asset.tags.map(tag => (
                  <Link key={tag} href={`/tag/${slugifyTag(tag)}`} className="glass px-6 py-3 rounded-xl text-[11px] font-bold hover:bg-white hover:text-black transition-all">
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Sidebar Metadata */}
          <div className="w-full lg:w-1/3 space-y-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-ai-purple animate-pulse" />
                <span className="text-[10px] font-black text-ai-purple uppercase tracking-[0.3em]">{asset.category}</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black mb-6 leading-tight tracking-tighter">
                {asset.title}
              </h1>
              <p className="text-secondary text-lg leading-relaxed font-medium">
                {asset.description}
              </p>
            </div>

            {/* Metadata Grid */}
            <div className="glass-card p-8 rounded-[32px] space-y-6">
              {[
                { icon: ShieldCheck, label: "ライセンス", value: asset.isCommercialOk ? "商用利用OK (クレジット不要)" : "限定的利用" },
                { icon: Box, label: "解像度", value: `${asset.width} x ${asset.height} px` },
                { icon: FileCode, label: "ファイル形式", value: "PNG (背景透過済み)" },
                { icon: Bookmark, label: "ファイルサイズ", value: asset.fileSize || "1.2 MB" },
                { icon: Clock, label: "ライセンスタイプ", value: asset.licenseType.toUpperCase() },
              ].map((meta, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-secondary">
                    <meta.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-secondary uppercase tracking-widest mb-1">{meta.label}</p>
                    <p className="text-sm font-bold text-white">{meta.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <DownloadButton 
                assetId={asset.id} 
                title={asset.title} 
                reviewStatus={asset.reviewStatus || 'pending'} 
                publishedAt={asset.publishedAt || null} 
                storageKey={asset.storageKey || null}
                isDummy={dummyAssets.some(a => a.id === asset.id || a.id === id)}
              />
            </div>

            {/* Rights Clearance Box */}
            <div className="glass p-8 rounded-[32px] border-ai-cyan/20 bg-ai-cyan/5">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-ai-cyan" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-ai-cyan">Rights-Clear PNG</h4>
              </div>
              <p className="text-[11px] text-secondary leading-relaxed font-medium">
                このアセットはAssetNinjaによって精密に透過処理されており、商用プロジェクトでの自由な利用が完全に保証されています。
              </p>
            </div>
          </div>
        </div>

        {/* Related Assets Section */}
        <div className="mt-32">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black">関連する透過PNG素材</h2>
            <Link href={`/category/${asset.category}`} className="text-ai-cyan text-sm font-bold hover:underline uppercase tracking-widest">
              もっと見る →
            </Link>
          </div>
          <div className="grid grid-cols-12 gap-6">
            {(() => {
              // Priority 1: Same related group
              let related = allAssets.filter(
                (a) =>
                  a.id !== asset.id &&
                  asset.categoryDomination?.relatedGroupId &&
                  a.categoryDomination?.relatedGroupId === asset.categoryDomination.relatedGroupId
              );

              // Priority 2: Same category fallback
              if (related.length < 4) {
                const categoryFallback = allAssets.filter(
                  (a) =>
                    a.id !== asset.id &&
                    a.category === asset.category &&
                    !related.some((r) => r.id === a.id)
                );
                related = [...related, ...categoryFallback];
              }

              return related
                .slice(0, 4)
                .map((relatedAsset) => (
                  <AssetCard key={relatedAsset.id} asset={relatedAsset} className="col-span-12 sm:col-span-6 md:col-span-3" />
                ));
            })()}
          </div>
        </div>

        {/* Trending / Recently Added Section */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black">急上昇・最新の素材</h2>
          </div>
          <div className="grid grid-cols-12 gap-6">
            {allAssets
              .filter(a => a.id !== asset.id)
              .sort((a, b) => new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime())
              .slice(0, 4)
              .map((recentAsset) => (
                <AssetCard key={recentAsset.id} asset={recentAsset} className="col-span-12 sm:col-span-6 md:col-span-3" />
              ))}
          </div>
        </div>
      </main>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ImageObject",
            "contentUrl": asset.imageUrl,
            "license": "https://creativecommons.org/publicdomain/zero/1.0/",
            "acquireLicensePage": `https://assetninja.jp/items/${id}`,
            "creator": {
              "@type": "Organization",
              "name": "AssetNinja"
            },
            "description": asset.description || `${asset.title}の高品質な背景透過PNG素材です。商用利用可能な日本発のプレミアム素材。 (High-quality transparent PNG of ${asset.title}. Commercial-use ready premium asset from Japan.)`,
            "name": `${asset.title}の透過PNG素材 | Transparent PNG Asset`,
            "width": asset.width || 1024,
            "height": asset.height || 1024,
            "encodingFormat": "image/png"
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "ホーム",
                "item": "https://assetninja.jp/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": asset.category,
                "item": `https://assetninja.jp/category/${asset.category}`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": asset.title,
                "item": `https://assetninja.jp/items/${id}`
              }
            ]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "HowTo",
            "name": `How to download and use ${asset.title} PNG asset`,
            "description": `Step-by-step guide to download and use the transparent PNG asset "${asset.title}" for commercial projects. (商用プロジェクトで「${asset.title}」の透過PNG素材をダウンロードして使用する手順)`,
            "step": [
              {
                "@type": "HowToStep",
                "name": "Download the PNG",
                "text": "Click the 'Free Download / 無料ダウンロード' button on the asset page. The image will be downloaded as a high-resolution PNG file with a transparent background. (ページ上の「Free Download」ボタンをクリックすると、背景透過処理された高解像度PNGがダウンロードされます。)"
              },
              {
                "@type": "HowToStep",
                "name": "Import to Design Tool",
                "text": "Drag and drop the downloaded PNG file into your favorite design tool like Figma, Canva, Photoshop, or PowerPoint. (ダウンロードした画像をFigma、Canva、Photoshopなどのデザインツールにドラッグ＆ドロップします。)"
              },
              {
                "@type": "HowToStep",
                "name": "Use in your project",
                "text": "Since the background is fully transparent, you can place the asset over any color or background in your commercial or personal project. (背景が完全に透過されているため、商用・個人問わずどのような背景やデザインの上にも重ねて使用できます。)"
              }
            ]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": `Is "${asset.title}" free for commercial use? (商用利用は無料ですか？)`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, all assets on AssetNinja, including this one, are completely free for both personal and commercial use without attribution. (はい、AssetNinjaの素材はすべて商用利用含めて完全無料でご利用いただけます。クレジット表記も不要です。)"
                }
              },
              {
                "@type": "Question",
                "name": `Does the PNG have a transparent background? (背景は透過されていますか？)`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Yes, the background has been completely removed using advanced processing, providing a clean transparent PNG ready to drop into any design. (はい、高度な切り抜き処理により完全に背景が除去された綺麗な透過PNG画像としてダウンロードされます。フチの白残り等もありません。)"
                }
              },
              {
                "@type": "Question",
                "name": `Can I use this image in Canva or Figma? (CanvaやFigmaで使えますか？)`,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Absolutely. It is provided in standard PNG format with an alpha channel (transparent background), which is fully supported by Canva, Figma, Adobe Suite, and Office apps. (はい、標準的なアルファチャンネル付きPNG形式のため、CanvaやFigmaをはじめ、Adobe製品やOfficeソフト等でも直接読み込んでご利用いただけます。)"
                }
              }
            ]
          })
        }}
      />
    </div>
  );
}

