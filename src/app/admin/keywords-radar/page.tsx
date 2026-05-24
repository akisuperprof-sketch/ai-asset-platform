import React from 'react';
import { Search } from 'lucide-react';

export default function KeywordsRadarPage() {
  return (
    <div className="p-8 space-y-8 font-sans bg-zinc-950 text-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <Search className="w-3.5 h-3.5" />
            Demand Engine
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            検索需要レーダー
          </h1>
        </div>
      </div>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden text-center max-w-2xl mx-auto mt-20">
        <h2 className="text-lg font-black text-white mb-2">準備中</h2>
        <p className="text-sm text-zinc-400">
          検索需要レーダーのデータ集計基盤は現在構築中です。<br/>
          (001_search_queries.sql によるデータ収集を開始しました)
        </p>
      </div>
    </div>
  );
}
