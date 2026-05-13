import { Navbar } from "@/components/layout/Navbar";
import { DownloadButton } from "@/components/download/DownloadButton";
import { ChevronLeft, Share2, Heart, Info, Tag, Layers, ShieldCheck, Zap } from "lucide-react";
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

      <main className="pt-40 pb-32 px-4 max-w-7xl mx-auto">
        {/* Breadcrumbs & Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-4 text-sm text-secondary">
            <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              トップに戻る
            </Link>
            <span className="opacity-20">/</span>
            <span className="text-ai-cyan font-bold uppercase tracking-widest text-[10px]">{item.category}</span>
            <span className="opacity-20">/</span>
            <span className="text-white font-medium truncate max-w-[200px]">{item.title}</span>
          </div>
          
          <div className="flex gap-3">
            <button className="glass px-6 py-2 rounded-full flex items-center gap-2 text-xs font-bold hover:bg-white/10 transition-all">
              <Heart className="w-4 h-4" />
              お気に入り
            </button>
            <button className="glass px-6 py-2 rounded-full flex items-center gap-2 text-xs font-bold hover:bg-white/10 transition-all">
              <Share2 className="w-4 h-4" />
              共有
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-12">
          {/* Left Column: Image Preview Area */}
          <div className="col-span-12 lg:col-span-8 space-y-10">
            <div className="glass-card rounded-[32px] h-[600px] flex items-center justify-center relative overflow-hidden bg-black group">
              {/* Animated Background Elements */}
              <div className="absolute inset-0 bg-checkerboard opacity-[0.05]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 z-10" />
              <div className="scanline opacity-30" />
              
              <img 
                src={item.imageUrl} 
                alt={item.title}
                className="relative z-20 max-w-[85%] max-h-[85%] object-contain drop-shadow-[0_40px_80px_rgba(0,0,0,0.9)] transition-transform duration-700 group-hover:scale-105" 
              />
              
              {/* Transparency Badge */}
              <div className="absolute bottom-10 left-10 z-30 flex items-center gap-3">
                <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 bg-checkerboard border border-white/20 rounded-lg" />
                  <div>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Background</p>
                    <p className="text-sm text-white font-bold">Transparent PNG</p>
                  </div>
                </div>
              </div>

              <div className="absolute top-10 right-10 z-30">
                <div className="flex items-center gap-2 text-[10px] bg-ai-purple text-white px-4 py-2 rounded-full uppercase tracking-[0.2em] font-bold shadow-2xl">
                  <Zap className="w-3 h-3" />
                  Premium AI Asset
                </div>
              </div>
            </div>

            <div className="glass-card p-10 rounded-[32px]">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Info className="w-6 h-6 text-ai-cyan" />
                アセットの詳細
              </h2>
              <p className="text-secondary text-lg leading-relaxed mb-10 max-w-3xl">
                {item.description}
              </p>
              
              <div className="space-y-4">
                <p className="text-xs text-white/40 uppercase tracking-widest font-bold">関連タグ</p>
                <div className="flex flex-wrap gap-3">
                  {item.tags.map(tag => (
                    <Link 
                      key={tag} 
                      href={`/?q=${tag}`} 
                      className="text-sm bg-white/5 hover:bg-white/10 hover:border-white/20 px-6 py-2.5 rounded-full border border-white/5 transition-all text-secondary hover:text-white"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Controls */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="glass-card p-10 rounded-[32px] space-y-10 sticky top-32">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-ai-gradient" />
                  <p className="text-xs text-ai-purple font-bold uppercase tracking-[0.2em]">{item.category}</p>
                </div>
                <h1 className="text-4xl font-bold mb-4 leading-tight tracking-tight">{item.title}</h1>
                <div className="flex items-center gap-2 text-success text-sm font-bold bg-success/5 border border-success/10 px-4 py-2 rounded-xl w-fit">
                  <ShieldCheck className="w-4 h-4" />
                  商用利用ライセンス：無料
                </div>
              </div>

              <div className="space-y-6">
                <DownloadButton assetId={item.id} title={item.title} />
                <p className="text-[10px] text-center text-secondary">
                  ダウンロードすると<a href="#" className="underline hover:text-white">利用規約</a>に同意したことになります。
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-10 border-t border-white/5">
                <div className="glass bg-white/[0.02] p-4 rounded-2xl">
                  <p className="text-[10px] text-secondary uppercase tracking-widest mb-1">形式</p>
                  <p className="text-base font-bold">PNG (背景透過)</p>
                </div>
                <div className="glass bg-white/[0.02] p-4 rounded-2xl">
                  <p className="text-[10px] text-secondary uppercase tracking-widest mb-1">サイズ</p>
                  <p className="text-base font-bold">{displaySize}</p>
                </div>
                <div className="glass bg-white/[0.02] p-4 rounded-2xl col-span-2">
                  <p className="text-[10px] text-secondary uppercase tracking-widest mb-1">解像度</p>
                  <p className="text-base font-bold">{item.width} x {item.height} px</p>
                </div>
              </div>

              {/* Sidebar Ad with Premium Look */}
              <div className="relative overflow-hidden group rounded-[22px] cursor-pointer">
                <div className="absolute inset-0 bg-ai-gradient opacity-10 group-hover:opacity-20 transition-opacity" />
                <div className="relative glass border-white/5 p-6 flex flex-col items-center text-center">
                  <p className="text-[9px] text-ai-purple font-bold uppercase tracking-widest mb-3">Sponsored Partner</p>
                  <p className="text-sm font-bold text-white mb-2 leading-snug">AI背景生成ツールで<br />デザインを次へ</p>
                  <p className="text-[10px] text-secondary mb-4">月額 ¥980 から始められます</p>
                  <button className="w-full py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-bold border border-white/10 transition-all">
                    詳細を見る
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
