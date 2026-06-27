"use client";

import React, { useEffect, useState } from "react";
import { Radar, RefreshCcw, ShieldCheck, TrendingUp, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";

type DemandLog = {
  id: string;
  keyword: string;
  normalized_keyword: string;
  search_count: number;
  clicks: number;
  category: string;
  first_seen_at: string;
  last_seen_at: string;
  need_asset: boolean;
  priority_score: number;
};

export default function DemandRadarPage() {
  const [logs, setLogs] = useState<DemandLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDemandLogs = async () => {
    setIsRefreshing(true);
    try {
      const { data, error } = await supabase
        .from('search_demand_logs')
        .select('*')
        .order('priority_score', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLogs(data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDemandLogs();
  }, []);

  const triggerPlanner = async () => {
    if (!confirm("Auto Plannerを起動して不足素材をキューに追加しますか？")) return;
    try {
      const res = await fetch('/api/admin/planner/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-agent-token': 'temp-agent-token-123' }
      });
      const data = await res.json();
      if (data.success) {
        alert(`Planner完了: ${data.added} 件のジョブを追加しました。\n対象: ${data.jobs?.join(', ') || 'なし'}`);
        fetchDemandLogs();
      } else {
        alert(`エラー: ${data.error}`);
      }
    } catch (e: any) {
      alert(`エラー: ${e.message}`);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto text-white">
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Radar className="w-6 h-6 text-ai-cyan" />
            <span className="text-[10px] font-black text-ai-cyan uppercase tracking-[0.3em]">
              ASSETNINJA PHASE 3
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight leading-none">
            Search Demand Radar
          </h1>
          <p className="text-secondary mt-4 text-sm font-bold">
            ユーザーの検索需要を解析し、自動で不足素材を特定します。
          </p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={triggerPlanner}
            className="flex items-center gap-2 px-6 py-3 bg-ai-purple text-white text-xs font-black uppercase tracking-widest rounded-full hover:scale-105 transition-transform"
          >
            <TrendingUp className="w-4 h-4" />
            Run Auto Planner
          </button>
          <button 
            onClick={fetchDemandLogs}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-6 py-3 glass text-white text-xs font-black uppercase tracking-widest rounded-full hover:bg-white hover:text-black transition-colors"
          >
            <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="glass-card rounded-[32px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase bg-black/40 text-secondary">
              <tr>
                <th className="px-6 py-4 font-black tracking-widest">Keyword</th>
                <th className="px-6 py-4 font-black tracking-widest text-center">Category</th>
                <th className="px-6 py-4 font-black tracking-widest text-center">Search Count</th>
                <th className="px-6 py-4 font-black tracking-widest text-center">CTR</th>
                <th className="px-6 py-4 font-black tracking-widest text-center">Need Asset</th>
                <th className="px-6 py-4 font-black tracking-widest text-right">Priority Score</th>
                <th className="px-6 py-4 font-black tracking-widest text-right">Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-secondary">
                    <RefreshCcw className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading demand data...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-secondary font-bold">
                    需要データがありません。
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-bold text-white">
                      {log.keyword}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {log.category ? (
                        <span className="bg-white/10 px-3 py-1 rounded-full text-xs">
                          {log.category}
                        </span>
                      ) : (
                        <span className="text-secondary text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="bg-white/10 px-3 py-1 rounded-full font-mono text-xs">
                        {log.search_count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-mono text-xs text-ai-cyan">
                        {log.search_count > 0 ? ((log.clicks || 0) / log.search_count * 100).toFixed(1) : 0}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {log.need_asset ? (
                        <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          <AlertTriangle className="w-3 h-3" />
                          Need Asset
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                          <ShieldCheck className="w-3 h-3" />
                          Covered
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-ai-cyan font-bold">
                      {log.priority_score}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-secondary">
                      {new Date(log.last_seen_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
