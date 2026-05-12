import { Navbar } from "@/components/layout/Navbar";
import { DownloadButton } from "@/components/download/DownloadButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { ChevronLeft, Share2, Heart, Info, Tag, Layers } from "lucide-react";
import Link from "next/link";
import { getAssetById } from "@/lib/assets";
import { redirect } from "next/navigation";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getAssetById(id);

  if (!item) {
    redirect("/");
  }

  // fileSize fallback
  const displaySize = item.fileSize || "1.0 MB";

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <main className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-4 mb-8 text-sm text-secondary">
          <Link href="/" className="hover:text-white flex items-center gap-1">
            <ChevronLeft className="w-4 h-4" />
            トップ
          </Link>
          <span>/</span>
          <Link href={`/category/${item.category}`} className="hover:text-white">
            {item.category}
          </Link>
          <span>/</span>
          <span className="text-white truncate">{item.title}</span>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Left Column: Image Preview */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <GlassCard className="!p-0 h-[600px] flex items-center justify-center bg-[url('/grid-pattern.svg')] bg-repeat relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
              <img 
                src={item.imageUrl} 
                alt={item.title}
                className="max-w-[90%] max-h-[90%] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.8)]" 
              />
              
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-center z-10">
                <div className="flex gap-2">
                  <button className="glass p-3 rounded-full hover:bg-white/10 transition-colors">
                    <Heart className="w-5 h-5 text-white" />
                  </button>
                  <button className="glass p-3 rounded-full hover:bg-white/10 transition-colors">
                    <Share2 className="w-5 h-5 text-white" />
                  </button>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-ai-cyan bg-black/40 px-3 py-1 rounded-full border border-ai-cyan/30">
                  High Resolution Asset
                </div>
              </div>
            </GlassCard>

            <div className="glass p-8 rounded-apple">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-ai-purple" />
                素材について
              </h2>
              <p className="text-secondary leading-relaxed mb-6">
                {item.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {item.tags.map(tag => (
                  <Link key={tag} href={`/search?q=${tag}`} className="text-xs bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-colors">
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Download & Metadata */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="glass p-8 rounded-apple space-y-8 sticky top-32">
              <div>
                <h1 className="text-2xl font-bold mb-2 leading-tight">{item.title}</h1>
                <p className="text-ai-purple text-sm font-medium">{item.category}</p>
              </div>

              <DownloadButton assetId={item.id} title={item.title} />

              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-secondary">
                    <Layers className="w-4 h-4" />
                    ファイルサイズ
                  </div>
                  <span className="font-medium">{displaySize}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-secondary">
                    <Tag className="w-4 h-4" />
                    解像度
                  </div>
                  <span className="font-medium">{item.width} x {item.height} px</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2 text-secondary">
                    <div className="w-4 h-4 rounded-sm bg-success/20 flex items-center justify-center text-[10px] text-success font-bold">L</div>
                    ライセンス
                  </div>
                  <span className="text-success font-medium">商用利用可 (無料)</span>
                </div>
              </div>

              {/* Sidebar Ad Placeholder */}
              <div className="w-full h-40 bg-ai-gradient/5 border border-ai-purple/20 rounded-apple flex flex-col items-center justify-center p-6 text-center group transition-all hover:border-ai-purple/50">
                <p className="text-[10px] text-ai-purple/60 uppercase mb-2">Featured Partner</p>
                <p className="text-xs font-medium group-hover:text-ai-cyan transition-colors">AIデザインツールPro 期間限定 30% OFF</p>
                <button className="mt-4 text-[10px] border border-ai-purple/30 px-4 py-1 rounded-full">詳しく見る</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
