'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Clock, CheckCircle2, XCircle, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';

interface DashboardStats {
  todayGenerated: number;
  todayPublished: number;
  todayRejected: number;
  todayFailed: number;
  rejectReasons: { reason: string; count: number }[];
  totalApproved: number;
}

export default function ProductionDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [targetCount, setTargetCount] = useState<number>(50);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setStats(json.data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch dashboard stats', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // 30s
    return () => clearInterval(interval);
  }, []);

  // 1件あたり 5.5分 (330秒) と仮定
  const AVG_TIME_MINUTES = 5.5;
  const estimatedTotalMinutes = Math.round(targetCount * AVG_TIME_MINUTES);
  const estimatedHours = Math.floor(estimatedTotalMinutes / 60);
  const estimatedMinsRemaining = estimatedTotalMinutes % 60;

  const successRate = stats && stats.todayGenerated > 0 
    ? Math.round((stats.todayPublished / stats.todayGenerated) * 100) 
    : 0;

  return (
    <div className="relative mt-8 p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
      <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
        <BarChart3 size={150} />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-fuchsia-500/20 rounded-xl text-fuchsia-400">
              <BarChart3 size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-400 to-pink-500">
                Production Dashboard
              </h2>
              <p className="text-zinc-400 text-sm mt-1 flex items-center gap-2">
                本日の生成状況と品質分析 
                <button onClick={() => { setLoading(true); fetchStats(); }} className="hover:text-white transition-colors">
                  <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                </button>
              </p>
            </div>
          </div>
        </div>

        {/* 100 Assets Mission */}
        {stats && (
          <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl p-6 mb-8 relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-purple-500/20 to-transparent pointer-events-none" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex-1 w-full">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-purple-500 text-white text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded">KPI MISSION</span>
                  <h3 className="text-xl font-bold text-white">100素材公開プロジェクト</h3>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-zinc-400">現在のApproved Real素材数: <strong className="text-white">{stats.totalApproved}</strong></span>
                  <span className="text-zinc-400">目標まで残り: <strong className="text-purple-400">{Math.max(0, 100 - stats.totalApproved)}</strong></span>
                </div>
                <div className="h-3 w-full bg-zinc-950 rounded-full overflow-hidden border border-white/5 shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative" 
                    style={{ width: `${Math.min(100, Math.round((stats.totalApproved / 100) * 100))}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                  </div>
                </div>
                <div className="mt-2 text-right text-xs text-zinc-500 font-bold">
                  達成率: {Math.min(100, Math.round((stats.totalApproved / 100) * 100))}%
                </div>
              </div>

              <div className="shrink-0 w-full md:w-auto bg-black/40 border border-white/5 p-4 rounded-xl">
                <div className="text-xs text-zinc-400 mb-2 font-bold uppercase">おすすめの次アクション</div>
                {stats.totalApproved >= 100 ? (
                  <div className="text-emerald-400 font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} /> 第1フェーズ目標達成！
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button onClick={() => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})} className="text-sm text-left text-white hover:text-purple-300 transition-colors flex items-center gap-2">
                      <TrendingUp size={14} className="text-purple-500" />
                      Auto Modeで自動生成を開始する
                    </button>
                    <button onClick={() => window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})} className="text-sm text-left text-white hover:text-pink-300 transition-colors flex items-center gap-2">
                      <BarChart3 size={14} className="text-pink-500" />
                      手動生成で品質をコントロールする
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Top KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp size={80}/></div>
            <div className="text-zinc-400 text-xs font-semibold mb-2 uppercase tracking-widest">本日生成数</div>
            <div className="text-4xl font-black text-white">{stats ? stats.todayGenerated : '-'} <span className="text-sm font-medium text-zinc-500">件</span></div>
          </div>
          
          <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 text-emerald-500 group-hover:scale-110 transition-transform"><CheckCircle2 size={80}/></div>
            <div className="text-emerald-400/80 text-xs font-semibold mb-2 uppercase tracking-widest">本日公開数</div>
            <div className="text-4xl font-black text-emerald-400">{stats ? stats.todayPublished : '-'} <span className="text-sm font-medium text-emerald-500/50">件</span></div>
          </div>

          <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 text-fuchsia-500 group-hover:scale-110 transition-transform"><BarChart3 size={80}/></div>
            <div className="text-fuchsia-400/80 text-xs font-semibold mb-2 uppercase tracking-widest">QA成功率</div>
            <div className="text-4xl font-black text-fuchsia-400">{stats ? successRate : '-'} <span className="text-xl font-bold">%</span></div>
            <div className="mt-2 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-fuchsia-500 to-pink-500" style={{ width: `${successRate}%` }} />
            </div>
          </div>

          <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-2xl p-5 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 text-rose-500 group-hover:scale-110 transition-transform"><XCircle size={80}/></div>
            <div className="text-rose-400/80 text-xs font-semibold mb-2 uppercase tracking-widest">エラー・却下</div>
            <div className="text-4xl font-black text-rose-400">{stats ? stats.todayRejected + stats.todayFailed : '-'} <span className="text-sm font-medium text-rose-500/50">件</span></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prediction & Count Selector */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-zinc-800/30 border border-indigo-500/20 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2 mb-6">
                <Clock size={16} /> 生成完了予測
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-400 mb-2 block">ターゲット生成件数</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[5, 10, 20, 50, 100].map(num => (
                      <button
                        key={num}
                        onClick={() => setTargetCount(num)}
                        className={`py-2 rounded-lg text-sm font-bold transition-all ${
                          targetCount === num 
                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' 
                            : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800">
                  <div className="text-xs font-semibold text-zinc-400 mb-1">推定所要時間 (1件あたり約{AVG_TIME_MINUTES}分)</div>
                  <div className="text-2xl font-black text-white">
                    {estimatedHours > 0 && <span className="text-indigo-400">{estimatedHours}<span className="text-base font-medium text-zinc-500 mx-1">時間</span></span>}
                    <span className="text-indigo-400">{estimatedMinsRemaining}<span className="text-base font-medium text-zinc-500 ml-1">分</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reject Analysis */}
          <div className="lg:col-span-2">
            <div className="bg-zinc-800/30 border border-zinc-700/50 rounded-2xl p-6 h-full">
              <h3 className="text-sm font-bold text-zinc-300 uppercase tracking-widest flex items-center gap-2 mb-6">
                <AlertTriangle size={16} className="text-amber-500" /> Reject要因分析
              </h3>

              {!stats || stats.rejectReasons.length === 0 ? (
                <div className="h-32 flex items-center justify-center text-zinc-500 text-sm">
                  本日のRejectデータはありません
                </div>
              ) : (
                <div className="space-y-4">
                  {stats.rejectReasons.map((item, idx) => {
                    const maxCount = stats.rejectReasons[0].count;
                    const percent = Math.round((item.count / stats.todayRejected) * 100);
                    const barWidth = Math.max(5, Math.round((item.count / maxCount) * 100));
                    
                    return (
                      <div key={idx} className="relative">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-zinc-300 truncate pr-4">{item.reason}</span>
                          <span className="text-zinc-500 font-mono">{item.count}件 ({percent}%)</span>
                        </div>
                        <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-amber-500/80 to-rose-500/80 rounded-full" 
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
