import React from 'react';
import { DollarSign, TrendingUp, Download, Eye, MousePointer2 } from 'lucide-react';

// Mock data for Category CTR
const mockCategoryStats = [
  { category: "bento", impressions: 14500, clicks: 3200, downloads: 850, estimatedRevenue: "¥12,500", priorityScore: 100 },
  { category: "sushi", impressions: 12000, clicks: 2800, downloads: 720, estimatedRevenue: "¥10,800", priorityScore: 90 },
  { category: "mochi", impressions: 8500, clicks: 1700, downloads: 410, estimatedRevenue: "¥6,150", priorityScore: 80 },
  { category: "tempura", impressions: 6200, clicks: 1100, downloads: 250, estimatedRevenue: "¥3,750", priorityScore: 60 },
  { category: "gyoza", impressions: 4100, clicks: 650, downloads: 120, estimatedRevenue: "¥1,800", priorityScore: 40 },
  { category: "sakura", impressions: 18000, clicks: 4500, downloads: 1200, estimatedRevenue: "¥18,000", priorityScore: 85 },
];

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
            収益分析 & CTR トラッカー
          </h1>
        </div>
      </div>
      
      {/* Category CTR Panel */}
      <div className="glass-card border border-white/5 rounded-3xl overflow-hidden bg-white/[0.01]">
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <h2 className="text-lg font-black text-white">Category Demand & CTR (Mock Data)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="text-[10px] uppercase tracking-widest text-zinc-500 bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-black">カテゴリ</th>
                <th className="px-6 py-4 font-black text-right">Impressions <Eye className="w-3 h-3 inline ml-1" /></th>
                <th className="px-6 py-4 font-black text-right">Clicks <MousePointer2 className="w-3 h-3 inline ml-1" /></th>
                <th className="px-6 py-4 font-black text-right">CTR</th>
                <th className="px-6 py-4 font-black text-right">Downloads <Download className="w-3 h-3 inline ml-1" /></th>
                <th className="px-6 py-4 font-black text-right">DL Rate</th>
                <th className="px-6 py-4 font-black text-right">Est. Revenue</th>
                <th className="px-6 py-4 font-black text-center">Priority Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {mockCategoryStats.sort((a, b) => b.priorityScore - a.priorityScore).map((stat) => {
                const ctr = ((stat.clicks / stat.impressions) * 100).toFixed(1);
                const dlRate = ((stat.downloads / stat.clicks) * 100).toFixed(1);
                
                return (
                  <tr key={stat.category} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-bold text-white capitalize">{stat.category}</td>
                    <td className="px-6 py-4 text-right text-zinc-300">{stat.impressions.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right text-zinc-300">{stat.clicks.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-mono text-emerald-400">{ctr}%</td>
                    <td className="px-6 py-4 text-right text-zinc-300">{stat.downloads.toLocaleString()}</td>
                    <td className="px-6 py-4 text-right font-mono text-cyan-400">{dlRate}%</td>
                    <td className="px-6 py-4 text-right font-bold text-amber-400">{stat.estimatedRevenue}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-black ${
                        stat.priorityScore >= 80 ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-zinc-400'
                      }`}>
                        {stat.priorityScore}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
