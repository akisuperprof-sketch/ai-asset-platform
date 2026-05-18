import { getAssetById, getAssets } from "@/lib/assets";
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
// ...
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const asset = await getAssetById(id);
  
  if (!asset) return { title: "Asset Not Found" };

  const title = `${asset.title} PNG素材（透過）｜商用利用OK｜AssetNinja`;
  const description = asset.description || `${asset.title}の透過PNG素材です。商用利用可能な日本発の高品質AIアセット。背景切り抜き済みでWebデザインや資料作成にすぐ使えます。`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [asset.imageUrl],
      type: "website",
    },
    alternates: {
      canonical: `https://ai-asset-platform.vercel.app/items/${id}`
    }
  };
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
                  <Link key={tag} href={`/?q=${encodeURIComponent(tag)}`} className="glass px-6 py-3 rounded-xl text-[11px] font-bold hover:bg-white hover:text-black transition-all">
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
              <DownloadButton assetId={asset.id} title={asset.title} />
              <Link href="/coming-soon" className="w-full h-16 glass rounded-[20px] flex items-center justify-center gap-3 text-white/50 font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all border-white/5">
                <Bookmark className="w-4 h-4" />
                コレクションに追加
              </Link>
            </div>

            {/* Rights Clearance Box */}
            <div className="glass p-8 rounded-[32px] border-ai-cyan/20 bg-ai-cyan/5">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-ai-cyan" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-ai-cyan">Rights-Clear PNG</h4>
              </div>
              <p className="text-[11px] text-secondary leading-relaxed font-medium">
                このアセットはSUKASHI AIによって生成され、商用プロジェクトでの自由な利用が保証されています。
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {allAssets
              .filter(a => a.category === asset.category && a.id !== asset.id)
              .slice(0, 4)
              .map((relatedAsset) => (
                <AssetCard key={relatedAsset.id} asset={relatedAsset} />
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
            "acquireLicensePage": `https://ai-asset-platform.vercel.app/items/${id}`,
            "creator": {
              "@type": "Organization",
              "name": "AssetNinja"
            },
            "description": asset.description || `${asset.title}の高品質な背景透過PNG素材です。`,
            "name": `${asset.title}の透過PNG素材`
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
                "item": "https://ai-asset-platform.vercel.app/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": asset.category,
                "item": `https://ai-asset-platform.vercel.app/category/${asset.category}`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": asset.title,
                "item": `https://ai-asset-platform.vercel.app/items/${id}`
              }
            ]
          })
        }}
      />
    </div>
  );
}

