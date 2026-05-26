"use client";

import React, { useEffect, useState } from 'react';
import { Layers, Search, Filter, AlertTriangle, CheckCircle, XCircle, Image as ImageIcon, CheckSquare, Square, MoreHorizontal, AlertOctagon } from 'lucide-react';

export default function AssetsRegistryPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [qaFilter, setQaFilter] = useState("all");

  // Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isBulkConfirming, setIsBulkConfirming] = useState<"none"|"reject-1"|"reject-2">("none");

  // Stats for Dashboard "本日の推奨作業"
  const stats = {
    untested: assets.filter(a => !a.qa_checked_at).length,
    pendingRec: assets.filter(a => a.qa_recommended_action === 'pending').length,
    rejectRec: assets.filter(a => a.qa_recommended_action === 'reject').length,
    approveRec: assets.filter(a => a.qa_recommended_action === 'approve').length,
    highPinterest: assets.filter(a => (a.pinterest_score || 0) >= 70).length
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      // Need an API that returns more QA fields. I will use the existing /api/admin/assets.
      // Wait, does it return qa_checked_at? I should ensure the API selects all fields.
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
    if (newStatus === "rejected") {
      if (!window.confirm("この素材を却下しますか？公開一覧から除外されます。")) return;
    }
    try {
      const res = await fetch('/api/admin/asset-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: id, status: newStatus })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setAssets(prev => prev.map(a => a.id === id ? { ...a, review_status: newStatus } : a));
    } catch (err: any) {
      alert(`更新失敗: ${err.message}`);
    }
  };

  const updateRank = async (id: string, rank: string) => {
    if (rank === "D") {
      if (!window.confirm("この素材を「D Reject」ランクに変更しますか？")) return;
    }
    try {
      const res = await fetch('/api/admin/asset-rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: id, rank })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setAssets(prev => prev.map(a => a.id === id ? { ...a, quality_rank: rank } : a));
    } catch (err: any) {
      alert(`ランク更新失敗: ${err.message}`);
    }
  };

  const executeBulkAction = async (action: string, value?: string) => {
    if (action === "bulk-reject") {
      if (isBulkConfirming === "none") {
        setIsBulkConfirming("reject-1");
        return;
      }
      if (isBulkConfirming === "reject-1") {
        setIsBulkConfirming("reject-2");
        return;
      }
    }
    
    try {
      const res = await fetch('/api/admin/bulk-asset-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetIds: Array.from(selectedIds), action, value })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      // Reset UI and refresh
      setSelectedIds(new Set());
      setIsBulkConfirming("none");
      fetchAssets();
    } catch (err: any) {
      alert(`一括操作失敗: ${err.message}`);
      setIsBulkConfirming("none");
    }
  };

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredAssets.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAssets.map(a => a.id)));
    }
  };

  const filteredAssets = assets.filter(a => {
    const textMatch = (a.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                      (a.tags?.join(" ") || "").toLowerCase().includes(searchQuery.toLowerCase());
    if (!textMatch) return false;

    switch(qaFilter) {
      case "untested": return !a.qa_checked_at;
      case "qa_done": return !!a.qa_checked_at;
      case "rec_approve": return a.qa_recommended_action === "approve";
      case "rec_pending": return a.qa_recommended_action === "pending";
      case "rec_reject": return a.qa_recommended_action === "reject";
      case "high_risk": return a.risk_level === "high";
      case "comm_low": return (a.commercial_score || 0) < 60;
      case "ai_high": return (a.ai_artifact_score || 0) > 70;
      case "pin_high": return (a.pinterest_score || 0) >= 70;
      case "rank_s": return a.quality_rank === "S";
      case "rank_d": return a.quality_rank === "D";
    }

    return true;
  });

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 70) return "text-amber-400";
    return "text-red-400";
  };
  
  const getScoreBg = (score: number) => {
    if (score >= 90) return "border-emerald-500/30";
    if (score >= 70) return "border-amber-500/30";
    return "border-red-500/30";
  };

  return (
    <div className="p-8 space-y-6 font-sans bg-zinc-950 text-white min-h-screen">
      
      {/* PHASE 7: Dashboard Tasks */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <CheckCircle className="w-32 h-32 text-indigo-400" />
        </div>
        <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-indigo-300">
          <Layers className="w-5 h-5" />
          本日の推奨作業 (Today's Tasks)
        </h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setQaFilter("untested")} className="bg-black/40 hover:bg-black/60 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold transition">
            未監査素材: <span className="text-white">{stats.untested}件</span>
          </button>
          <button onClick={() => setQaFilter("rec_pending")} className="bg-black/40 hover:bg-black/60 border border-amber-500/20 px-4 py-2 rounded-xl text-sm font-bold transition">
            pending推奨: <span className="text-amber-400">{stats.pendingRec}件</span>
          </button>
          <button onClick={() => setQaFilter("rec_reject")} className="bg-black/40 hover:bg-black/60 border border-red-500/20 px-4 py-2 rounded-xl text-sm font-bold transition">
            reject推奨: <span className="text-red-400">{stats.rejectRec}件</span>
          </button>
          <button onClick={() => setQaFilter("rec_approve")} className="bg-black/40 hover:bg-black/60 border border-emerald-500/20 px-4 py-2 rounded-xl text-sm font-bold transition">
            公開候補: <span className="text-emerald-400">{stats.approveRec}件</span>
          </button>
          <button onClick={() => setQaFilter("pin_high")} className="bg-black/40 hover:bg-black/60 border border-pink-500/20 px-4 py-2 rounded-xl text-sm font-bold transition">
            高Pinterest素材: <span className="text-pink-400">{stats.highPinterest}件</span>
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
            QA Audit & Curation OS
          </h1>
        </div>
      </div>

      {/* PHASE 6: QA Recommended Filters */}
      <div className="flex flex-wrap gap-2">
        <select 
          className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
          value={qaFilter}
          onChange={e => setQaFilter(e.target.value)}
        >
          <option value="all">すべての素材</option>
          <option value="untested">未監査</option>
          <option value="qa_done">QA済み</option>
          <option value="rec_approve">公開推奨</option>
          <option value="rec_pending">pending推奨</option>
          <option value="rec_reject">reject推奨</option>
          <option value="high_risk">high risk</option>
          <option value="comm_low">Commercial 60未満</option>
          <option value="ai_high">AI Artifact 70超</option>
          <option value="pin_high">Pinterest 70以上</option>
          <option value="rank_s">S Premium</option>
          <option value="rank_d">D Reject</option>
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
          <input 
            type="text" 
            placeholder="Search..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-purple-500"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* PHASE 5: Bulk Action Floating Bar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 shadow-2xl rounded-2xl p-4 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5">
          <div className="text-sm font-bold px-2">{selectedIds.size} 件選択中</div>
          <div className="h-6 w-px bg-white/10"></div>
          
          {isBulkConfirming !== "none" ? (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-red-400 font-bold">
                {isBulkConfirming === "reject-1" ? "選択した素材を却下しますか？" : "本当に公開一覧から除外しますか？"}
              </span>
              <button onClick={() => executeBulkAction("bulk-reject")} className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold">はい</button>
              <button onClick={() => setIsBulkConfirming("none")} className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg">キャンセル</button>
            </div>
          ) : (
            <>
              <button onClick={() => executeBulkAction("bulk-approve")} className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold transition">公開する</button>
              <button onClick={() => executeBulkAction("bulk-pending")} className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-xs font-bold transition">Pendingへ戻す</button>
              <button onClick={() => executeBulkAction("bulk-follow-qa")} className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs font-bold transition">QA推奨に従う</button>
              <button onClick={() => executeBulkAction("bulk-reject")} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs font-bold transition">却下</button>
              <div className="h-6 w-px bg-white/10"></div>
              <div className="flex gap-1">
                {["S", "A", "B", "C", "D"].map(r => (
                  <button key={r} onClick={() => executeBulkAction("bulk-rank", r)} className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/20 rounded text-xs font-bold transition">{r}</button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Registry Table */}
      <div className="glass-card border border-white/5 rounded-3xl overflow-hidden bg-white/[0.01]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="text-[10px] uppercase tracking-widest text-zinc-500 bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="px-4 py-4 w-10">
                  <button onClick={toggleAll}>
                    {selectedIds.size === filteredAssets.length && filteredAssets.length > 0 ? <CheckSquare className="w-4 h-4 text-purple-400" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-4 py-4 font-black">Asset</th>
                <th className="px-4 py-4 font-black">QA Status & Scores</th>
                <th className="px-4 py-4 font-black text-center">Quality Rank</th>
                <th className="px-4 py-4 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-bold">読み込み中...</td></tr>
              ) : filteredAssets.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500 font-bold">対象データがありません</td></tr>
              ) : (
                filteredAssets.map(a => (
                  <tr key={a.id} className={`hover:bg-white/[0.02] transition-colors ${selectedIds.has(a.id) ? 'bg-purple-500/5' : ''}`}>
                    <td className="px-4 py-4">
                      <button onClick={() => toggleSelection(a.id)}>
                        {selectedIds.has(a.id) ? <CheckSquare className="w-4 h-4 text-purple-400" /> : <Square className="w-4 h-4 text-zinc-600" />}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-4 items-center">
                        {a.image_url ? (
                          <div className="w-16 h-16 rounded-xl bg-white/5 border border-white/10 flex-shrink-0 overflow-hidden relative group">
                            <img src={a.image_url} alt="" className="w-full h-full object-contain p-1" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-white/5 border flex-shrink-0 flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 opacity-20" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-sm text-white mb-1">{a.title}</div>
                          <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded font-bold ${
                              a.review_status === "approved" ? "bg-emerald-500/20 text-emerald-400" :
                              a.review_status === "rejected" ? "bg-rose-500/20 text-rose-400" :
                              "bg-amber-500/20 text-amber-400"
                            }`}>
                              {a.review_status?.toUpperCase() || "UNKNOWN"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {/* QA Status & Scores */}
                    <td className="px-4 py-4 max-w-sm whitespace-normal">
                      {a.qa_checked_at ? (
                        <div className="space-y-2">
                          <div className="flex gap-1.5 flex-wrap">
                            <span className={`px-1.5 py-0.5 border rounded flex items-center gap-1 ${getScoreBg(a.commercial_score || 0)}`}>
                              <span className="text-[8px] text-zinc-500">COM</span>
                              <span className={`font-black text-[10px] ${getScoreColor(a.commercial_score || 0)}`}>{a.commercial_score || 0}</span>
                            </span>
                            <span className={`px-1.5 py-0.5 border rounded flex items-center gap-1 ${getScoreBg(a.pinterest_score || 0)}`}>
                              <span className="text-[8px] text-zinc-500">PIN</span>
                              <span className={`font-black text-[10px] ${getScoreColor(a.pinterest_score || 0)}`}>{a.pinterest_score || 0}</span>
                            </span>
                            <span className={`px-1.5 py-0.5 border rounded flex items-center gap-1 ${getScoreBg(a.adobe_stock_score || 0)}`}>
                              <span className="text-[8px] text-zinc-500">ADB</span>
                              <span className={`font-black text-[10px] ${getScoreColor(a.adobe_stock_score || 0)}`}>{a.adobe_stock_score || 0}</span>
                            </span>
                            <span className={`px-1.5 py-0.5 border rounded flex items-center gap-1 ${(a.ai_artifact_score || 0) <= 30 ? 'border-emerald-500/30' : 'border-red-500/30'}`}>
                              <span className="text-[8px] text-zinc-500">ART</span>
                              <span className={`font-black text-[10px] ${(a.ai_artifact_score || 0) <= 30 ? 'text-emerald-400' : 'text-red-400'}`}>{a.ai_artifact_score || 0}</span>
                            </span>
                          </div>
                          
                          <div className="flex gap-2 items-center text-[10px]">
                            {a.qa_recommended_action === 'approve' && <span className="text-emerald-400 font-bold">公開推奨</span>}
                            {a.qa_recommended_action === 'pending' && <span className="text-amber-400 font-bold">pending推奨</span>}
                            {a.qa_recommended_action === 'reject' && <span className="text-red-400 font-bold">reject推奨</span>}
                            {a.risk_level === 'high' && <span className="bg-red-500/20 text-red-400 px-1 rounded flex items-center gap-1"><AlertOctagon className="w-3 h-3"/> High Risk</span>}
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-500 text-xs font-bold">未監査</span>
                      )}
                    </td>

                    {/* PHASE 3: 1-Click Rank Buttons */}
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-1">
                        {["S", "A", "B", "C", "D"].map(r => (
                          <button 
                            key={r}
                            onClick={() => updateRank(a.id, r)}
                            className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-black transition ${
                              a.quality_rank === r 
                                ? "bg-purple-500 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]" 
                                : "bg-white/5 text-zinc-500 hover:bg-white/10"
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* PHASE 4: 1-Click Status Update */}
                    <td className="px-4 py-4 text-right">
                      <div className="flex flex-col gap-1 items-end">
                        {a.review_status !== 'approved' && (
                          <button onClick={() => updateStatus(a.id, 'approved')} className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded font-bold text-[10px] transition-colors">
                            公開する
                          </button>
                        )}
                        {a.review_status !== 'pending' && (
                          <button onClick={() => updateStatus(a.id, 'pending')} className="px-2 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded font-bold text-[10px] transition-colors">
                            確認待ちに戻す
                          </button>
                        )}
                        {a.review_status !== 'rejected' && (
                          <button onClick={() => updateStatus(a.id, 'rejected')} className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded font-bold text-[10px] transition-colors">
                            却下する
                          </button>
                        )}
                        {a.qa_recommended_action && (
                          <button 
                            onClick={() => executeBulkAction("bulk-follow-qa")} // For a single one, it would be better to have an individual function but bulk action works with selectedIds. We can also just map QA -> Status.
                            className="mt-1 flex items-center gap-1 text-[9px] text-blue-400 hover:text-blue-300"
                            onClickCapture={(e) => {
                                e.stopPropagation();
                                const newSt = a.qa_recommended_action === 'approve' ? 'approved' : a.qa_recommended_action === 'reject' ? 'rejected' : 'pending';
                                updateStatus(a.id, newSt);
                            }}
                          >
                            QA推奨に従う
                          </button>
                        )}
                      </div>
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
