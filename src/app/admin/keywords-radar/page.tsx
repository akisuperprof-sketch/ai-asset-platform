"use client";

import React, { useEffect, useState } from 'react';
import { Search, TrendingUp, AlertTriangle } from 'lucide-react';

export default function KeywordsRadarPage() {
  const [queries, setQueries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const res = await fetch("/api/admin/search-queries");
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "データ取得失敗");
        setQueries(json.data || []);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQueries();
  }, []);

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
      
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {errorMsg}
        </div>
      )}

      <div className="glass-card border border-white/5 rounded-3xl overflow-hidden bg-white/[0.01]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="text-[10px] uppercase tracking-widest text-zinc-500 bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-black">検索ワード</th>
                <th className="px-6 py-4 font-black text-center">需要優先度 (Score)</th>
                <th className="px-6 py-4 font-black text-center">ヒット有無</th>
                <th className="px-6 py-4 font-black text-center">ヒット件数</th>
                <th className="px-6 py-4 font-black">正規化ワード</th>
                <th className="px-6 py-4 font-black">推定カテゴリ</th>
                <th className="px-6 py-4 font-black text-right">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 font-bold">
                    読み込み中...
                  </td>
                </tr>
              ) : queries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500 font-bold">
                    検索ログがありません
                  </td>
                </tr>
              ) : (
                queries.map((q) => (
                  <tr key={q.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-white">{q.query}</div>
                      <div className="text-[10px] text-zinc-500 mt-1">
                        {new Date(q.updated_at).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-black ${
                        q.priority_score > 5 ? 'bg-purple-500/20 text-purple-400' : 'bg-white/5 text-zinc-400'
                      }`}>
                        {q.priority_score}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {q.has_results ? (
                        <span className="text-emerald-400 font-bold">あり</span>
                      ) : (
                        <span className="text-rose-400 font-bold">なし (Gap)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-zinc-300 font-bold">
                      {q.matched_asset_count}
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-400 text-[11px]">
                      {q.normalized_query}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {q.suggested_category || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-white rounded-lg font-bold text-[10px] transition-colors">
                        生成キューに追加 (準備中)
                      </button>
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
