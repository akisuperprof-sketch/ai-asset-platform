import React from 'react';
import { DollarSign } from 'lucide-react';

export default function RevenueAnalyticsPage() {
  return (
    <div className="p-8 space-y-8 font-sans bg-zinc-950 text-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <DollarSign className="w-3.5 h-3.5" />
            Monetization OS
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            収益分析
          </h1>
        </div>
      </div>
      
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden text-center max-w-2xl mx-auto mt-20">
        <h2 className="text-lg font-black text-white mb-2">準備中</h2>
        <p className="text-sm text-zinc-400 mb-8">
          ダウンロード/広告等による収益分析機能は現在準備中です。
        </p>

        <div className="text-left space-y-4 text-sm text-zinc-300">
          <h3 className="text-white font-bold mb-2">将来実装予定の項目:</h3>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong>広告収益 (Ad Revenue):</strong> プログラマティック広告（AdSense等）からの推定収益</li>
            <li><strong>サブスク収益 (Subscription):</strong> プレミアム会員の月額課金状況</li>
            <li><strong>カテゴリ別収益 (Revenue by Category):</strong> どのジャンルが最も収益性が高いかの分析</li>
            <li><strong>ダウンロード単価 (RPM/eCPM):</strong> 1000ダウンロードあたりの平均収益額</li>
            <li><strong>離脱率・直帰率 (Bounce Rate):</strong> ユーザーのエンゲージメント指標と収益の相関</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
