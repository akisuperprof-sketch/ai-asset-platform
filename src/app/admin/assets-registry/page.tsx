"use client";

import React, { useEffect, useState } from 'react';
import { Layers, Search, Filter, AlertTriangle, CheckCircle, XCircle, Image as ImageIcon } from 'lucide-react';

export default function AssetsRegistryPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [lowQualityFilter, setLowQualityFilter] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/assets");
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "データ取得失敗");
      setAssets(json.data || []);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/asset-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      setAssets(prev => prev.map(a => a.id === id ? { ...a, review_status: newStatus } : a));
    } catch (err: any) {
      alert(`更新失敗: ${err.message}`);
    }
  };

  const isLowQuality = (asset: any) => {
    const text = (asset.title + " " + (asset.tags?.join(" ") || "")).toLowerCase();
    const lqTerms = ["star", "circle", "abstract", "monochrome", "low_quality", "図形", "幾何", "単色"];
    return lqTerms.some(term => text.includes(term));
  };

  const filteredAssets = assets.filter(a => {
    const textMatch = (a.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (a.slug || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (a.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (a.tags?.join(" ") || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!textMatch) return false;

    if (statusFilter !== "all") {
      if (statusFilter === "missing_url") {
        if (a.image_url) return false;
      } else {
        if (a.review_status !== statusFilter) return false;
      }
    }

    if (lowQualityFilter && !isLowQuality(a)) return false;

    return true;
  });

  return (
    <div className="p-8 space-y-8 font-sans bg-zinc-950 text-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <Layers className="w-3.5 h-3.5" />
            Asset Management
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            素材一覧 (Registry)
          </h1>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search by title, slug, ID, or tag..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500 transition-colors"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">すべてのステータス</option>
          <option value="approved">公開中 (Approved)</option>
          <option value="pending">確認待ち (Pending)</option>
          <option value="rejected">却下 (Rejected)</option>
          <option value="missing_url">画像URL欠損 (Missing URL)</option>
        </select>
        <button 
          onClick={() => setLowQualityFilter(!lowQualityFilter)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
            lowQualityFilter ? "bg-amber-500/20 border-amber-500/50 text-amber-400" : "bg-white/5 border-white/10 text-zinc-400 hover:text-white"
          }`}
        >
          <Filter className="w-4 h-4" />
          低品質疑い
        </button>
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
                <th className="px-6 py-4 font-black">Image</th>
                <th className="px-6 py-4 font-black">Meta (Title / Slug / Tags)</th>
                <th className="px-6 py-4 font-black text-center">Status</th>
                <th className="px-6 py-4 font-black">Created At</th>
                <th className="px-6 py-4 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-bold">読み込み中...</td>
                </tr>
              ) : filteredAssets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-bold">データがありません</td>
                </tr>
              ) : (
                filteredAssets.map(a => (
                  <tr key={a.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      {a.image_url ? (
                        <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 overflow-hidden relative group">
                          <img src={a.image_url} alt="" className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform" />
                        </div>
                      ) : (
                        <div className="w-16 h-16 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                          <ImageIcon className="w-6 h-6 opacity-50" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-white mb-1">{a.title}</div>
                      <div className="text-[10px] text-zinc-400 font-mono mb-1">{a.slug}</div>
                      <div className="flex gap-1 overflow-hidden max-w-[200px]">
                        {a.tags?.slice(0,3).map((t: string) => (
                          <span key={t} className="px-1.5 py-0.5 bg-white/5 text-[9px] rounded text-zinc-400">{t}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-black ${
                        a.review_status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                        a.review_status === "rejected" ? "bg-rose-500/20 text-rose-400" :
                        "bg-amber-500/20 text-amber-400"
                      }`}>
                        {a.review_status?.toUpperCase() || "UNKNOWN"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 font-mono">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {a.review_status !== 'pending' && (
                        <button onClick={() => updateStatus(a.id, 'pending')} className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg font-bold text-[10px] transition-colors">
                          Pending戻し
                        </button>
                      )}
                      {a.review_status === 'approved' && (
                        <button onClick={() => updateStatus(a.id, 'rejected')} className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg font-bold text-[10px] transition-colors">
                          公開停止
                        </button>
                      )}
                      {a.review_status !== 'approved' && (
                        <button onClick={() => updateStatus(a.id, 'approved')} className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg font-bold text-[10px] transition-colors">
                          公開する
                        </button>
                      )}
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
