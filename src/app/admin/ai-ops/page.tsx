"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  TrendingUp, 
  Cpu, 
  Database, 
  BarChart3, 
  DollarSign, 
  Play, 
  Pause, 
  Activity,
  CheckCircle,
  HelpCircle,
  ArrowUpRight,
  Workflow,
  Clock
} from "lucide-react";

const initialQueue = [
  { id: "Q-104", category: "寿司", prompt: "江戸前極上マグロ握り寿司", step: "SEO生成中", progress: 85, status: "processing" },
  { id: "Q-105", category: "ラーメン", prompt: "極上醤油豚骨ラーメン", step: "品質確認中", progress: 60, status: "processing" },
  { id: "Q-106", category: "和柄", prompt: "伝統的美麗和柄紋様", step: "透過処理中", progress: 35, status: "processing" },
  { id: "Q-107", category: "日本刀", prompt: "研ぎ澄まされた日本刀真剣", step: "生成待ち", progress: 0, status: "queued" },
  { id: "Q-103", category: "抹茶", prompt: "本格京都宇治抹茶", step: "公開完了", progress: 100, status: "completed" }
];

const mockRevenue = {
  totalDownloads: 4850,
  canvaClicks: 3200,
  adobeClicks: 1420,
  impactClicks: 840,
  ctr: "5.8%",
  estMonthlyRev: "$8,420 USD"
};

export default function AiOpsPage() {
  const [queue, setQueue] = useState(initialQueue);
  const [isAiActive, setIsAiActive] = useState(true);

  return (
    <div className="p-8 space-y-8 font-sans">
      
      {/* Head section */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <Cpu className="w-3.5 h-3.5" />
            AI Operations & Autopilot Monitor
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            AI OSP / AUTOPILOT WATCH
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAiActive(!isAiActive)}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
              isAiActive ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-zinc-800 text-white/50"
            }`}
          >
            {isAiActive ? (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                AI Autopilot: ACTIVE
              </>
            ) : (
              <>
                <Pause className="w-3.5 h-3.5" />
                AI Autopilot: PAUSED
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: AI Activities & Metrics */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* Left Side: AI Market Watch & Generation Queue (7 cols) */}
        <div className="col-span-12 xl:col-span-8 space-y-8">
          
          {/* Generation Queue */}
          <div className="glass-card border-white/5 p-6 rounded-3xl space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <Workflow className="w-4 h-4 text-purple-400" />
              AI Autopilot Generation Queue
            </h2>

            <div className="space-y-3">
              {queue.map((job) => (
                <div key={job.id} className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold text-purple-400">{job.id}</span>
                      <span className="text-xs font-black text-white">{job.prompt}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-white/50 font-semibold">
                      <span>Category: {job.category}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.step}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full md:w-48 space-y-1.5 shrink-0">
                    <div className="flex items-center justify-between text-[9px] font-mono font-bold">
                      <span className="text-purple-300">PROGRESS</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full transition-all" 
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="shrink-0 text-right">
                    {job.status === "completed" ? (
                      <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase px-2 py-1 rounded-md border border-emerald-500/10 tracking-widest">
                        LIVE INDEXED
                      </span>
                    ) : job.status === "queued" ? (
                      <span className="bg-zinc-800 text-white/40 text-[8px] font-black uppercase px-2 py-1 rounded-md border border-white/5 tracking-widest">
                        QUEUED
                      </span>
                    ) : (
                      <span className="bg-purple-500/10 text-purple-400 text-[8px] font-black uppercase px-2 py-1 rounded-md border border-purple-500/10 tracking-widest animate-pulse">
                        PROCESSING
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Market Watch Gaps */}
          <div className="glass-card border-white/5 p-6 rounded-3xl space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              AI Market Watch Needs & Gaps
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                <span className="text-[9px] font-black text-cyan-400 tracking-widest uppercase block">SEASONAL RISING DEMANDS</span>
                <ul className="text-xs font-semibold space-y-2 text-white/70">
                  <li className="flex items-center justify-between">
                    <span>浴衣 背景透過 (Kimono Summer)</span>
                    <span className="text-emerald-400 text-[10px] font-bold">+184% Searches</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>花火大会 PNG (Fireworks)</span>
                    <span className="text-emerald-400 text-[10px] font-bold">+142% Searches</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>かき氷 イラスト (Shaved Ice)</span>
                    <span className="text-emerald-400 text-[10px] font-bold">+98% Searches</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                <span className="text-[9px] font-black text-purple-400 tracking-widest uppercase block">INTERNATIONAL DESIGN TRENDS</span>
                <ul className="text-xs font-semibold space-y-2 text-white/70">
                  <li className="flex items-center justify-between">
                    <span>Ukiyo-e Mt.Fuji PNG</span>
                    <span className="text-emerald-400 text-[10px] font-bold">+210% Searches</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Samurai Katana transparent</span>
                    <span className="text-emerald-400 text-[10px] font-bold">+165% Searches</span>
                  </li>
                  <li className="flex items-center justify-between">
                    <span>Kyoto Temple Torii Gate</span>
                    <span className="text-emerald-400 text-[10px] font-bold">+112% Searches</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side: AI Revenue Brain & Monetization (5 cols) */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
          
          {/* Revenue Analytics Box */}
          <div className="glass-card border-purple-500/10 p-6 rounded-3xl space-y-6 relative overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.02)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-4">
              <DollarSign className="w-4 h-4 text-purple-400" />
              AI Revenue & Partner Metrics
            </h2>

            {/* Main Stats */}
            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                <span className="text-[9px] text-white/50 uppercase tracking-wider block">Estimated Monthly Revenue</span>
                <div className="flex items-baseline justify-between mt-1">
                  <h3 className="text-2xl font-black text-white">{mockRevenue.estMonthlyRev}</h3>
                  <span className="text-emerald-400 text-[10px] font-bold flex items-center gap-0.5">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    +18% from last month
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] text-white/50 block">Canva Link Clicks</span>
                  <span className="text-sm font-black mt-1 block">{mockRevenue.canvaClicks} clicks</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[9px] text-white/50 block">Adobe Express Clicks</span>
                  <span className="text-sm font-black mt-1 block">{mockRevenue.adobeClicks} clicks</span>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-white/50 block">Reward Ad CTR</span>
                  <span className="text-sm font-black mt-1 block">{mockRevenue.ctr}</span>
                </div>
                <span className="bg-purple-500/10 text-purple-400 text-[8px] font-black uppercase px-2 py-1 rounded-md border border-purple-500/10 tracking-widest">
                  OPTIMAL EFFICIENCY
                </span>
              </div>
            </div>

            {/* AI Optimization Tips */}
            <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl space-y-2">
              <span className="text-[10px] font-black text-purple-300 uppercase tracking-widest block">AI REVENUE REASONING</span>
              <p className="text-[11px] text-white/70 font-semibold leading-relaxed">
                寿司カテゴリのCanvaリンク移行率が現在最高の8.4%を維持中。寿司アセットを毎日さらに10枚ずつ追加シームレス補強することで、月間収益がさらに+$1,200向上する予測が出ています。
              </p>
            </div>
          </div>

          {/* AI SEO Brain Sitemap verification */}
          <div className="glass-card border-white/5 p-6 rounded-3xl space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              AI SEO Brain & Crawler Audit
            </h2>

            <div className="text-xs font-semibold space-y-3 text-white/70">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span>Total Sitemap Indexed URLs</span>
                <span className="text-white font-black">1,163 Pages</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <span>Google Image Schema Tags</span>
                <span className="text-emerald-400 font-black">100% Fully Compliant</span>
              </div>
              <div className="flex items-center justify-between pb-1">
                <span>Pinterest Rich Pin Metadata</span>
                <span className="text-emerald-400 font-black">ACTIVE / VALID</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
