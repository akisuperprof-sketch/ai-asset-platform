import { Navbar } from "@/components/layout/Navbar";
import { Zap, Construction } from "lucide-react";
import Link from "next/link";

export default function ComingSoon() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center selection:bg-ai-purple/30">
      <Navbar />
      
      <main className="text-center px-6">
        <div className="w-24 h-24 bg-ai-gradient rounded-[32px] flex items-center justify-center mx-auto mb-12 shadow-2xl shadow-ai-purple/40 animate-pulse">
          <Construction className="w-12 h-12 text-white" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-none">
          UNDER<br />
          <span className="bg-ai-gradient bg-clip-text text-transparent [-webkit-background-clip:text]">DEVELOPMENT</span>
        </h1>
        
        <p className="text-secondary text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-12 font-medium">
          この機能は現在開発中です。より高品質な体験を提供するため、素材忍者が鋭意製作を行っています。
          今しばらくお待ちください。
        </p>
        
        <Link 
          href="/" 
          className="bg-ai-gradient px-12 py-5 rounded-full text-xs font-black uppercase tracking-widest hover:brightness-110 shadow-lg shadow-ai-purple/20 transition-all inline-flex items-center gap-3"
        >
          <Zap className="w-4 h-4" />
          ホームへ戻る
        </Link>
      </main>

      <div className="fixed bottom-12 left-0 right-0 text-center">
        <p className="text-[10px] text-secondary font-black tracking-widest uppercase opacity-30">
          AssetNinja • Phase 3 Implementation
        </p>
      </div>
    </div>
  );
}
