"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ShieldCheck, XCircle, RefreshCw, AlertTriangle, Layers, Activity } from "lucide-react";
import { Asset } from "@/types";
import { SplashWrapper } from "@/components/layout/SplashWrapper";

export default function DStrategyDashboard() {
  const [pendingAssets, setPendingAssets] = useState<any[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirm, setShowConfirm] = useState<"approve" | "reject" | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch stats
      const { count: pendingCount } = await supabase.from("assets").select("*", { count: "exact", head: true }).eq("review_status", "pending");
      const { count: approvedCount } = await supabase.from("assets").select("*", { count: "exact", head: true }).eq("review_status", "approved");
      const { count: rejectedCount } = await supabase.from("assets").select("*", { count: "exact", head: true }).eq("review_status", "rejected");

      setStats({
        pending: pendingCount || 0,
        approved: approvedCount || 0,
        rejected: rejectedCount || 0,
      });

      // Fetch pending list
      const { data } = await supabase
        .from("assets")
        .select("*")
        .eq("review_status", "pending")
        .order("created_at", { ascending: false })
        .limit(100);

      if (data) {
        setPendingAssets(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const selectTop20 = () => {
    const top20 = pendingAssets.slice(0, 20).map(a => a.id);
    setSelectedIds(new Set(top20));
  };

  const handleBulkAction = async (action: "bulk_approve" | "bulk_reject") => {
    if (selectedIds.size === 0) return;
    setIsProcessing(true);
    
    try {
      const ids = Array.from(selectedIds);
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ids }),
      });

      const result = await res.json();
      if (result.success) {
        alert(`${ids.length}件のアセットを${action === "bulk_approve" ? "承認" : "却下"}しました。`);
        setSelectedIds(new Set());
        fetchDashboardData();
      } else {
        alert(`エラー: ${result.error}`);
      }
    } catch (err) {
      console.error(err);
      alert("処理に失敗しました。");
    } finally {
      setIsProcessing(false);
      setShowConfirm(null);
    }
  };

  return (
    <div className="p-8 pb-32">
      <div className="mb-8">
        <h1 className="text-2xl font-black uppercase tracking-widest text-white mb-2">D-Strategy OS</h1>
        <p className="text-xs text-secondary">AssetNinja 自律成長型オペレーション・ダッシュボード</p>
      </div>

      {/* Monitors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="glass-card p-6 border-white/5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[50px]" />
          <h3 className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-4">Pending Queue</h3>
          <p className="text-4xl font-black text-white">{stats.pending}</p>
        </div>
        <div className="glass-card p-6 border-white/5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px]" />
          <h3 className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-4">Published (Live)</h3>
          <p className="text-4xl font-black text-white">{stats.approved}</p>
        </div>
        <div className="glass-card p-6 border-white/5 rounded-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 blur-[50px]" />
          <h3 className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-4">Rejected</h3>
          <p className="text-4xl font-black text-white">{stats.rejected}</p>
        </div>
      </div>

      {/* Review Queue UI */}
      <div className="glass-card border-white/5 rounded-3xl p-8 relative">
        <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-ai-cyan" />
            <h2 className="text-lg font-black uppercase tracking-widest">Pending Review Queue</h2>
          </div>
          <div className="flex gap-4">
            <button onClick={fetchDashboardData} className="flex items-center gap-2 text-[10px] uppercase font-bold text-secondary hover:text-white transition-colors">
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-between mb-6 bg-white/5 p-4 rounded-xl border border-white/5">
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold text-white">{selectedIds.size} Selected</span>
            <button onClick={selectTop20} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">
              Select Top 20
            </button>
            <button onClick={() => setSelectedIds(new Set())} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors text-white/50">
              Clear
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button 
              disabled={selectedIds.size === 0 || isProcessing}
              onClick={() => setShowConfirm("reject")}
              className="px-6 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-30 flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" /> Bulk Reject
            </button>
            <button 
              disabled={selectedIds.size === 0 || isProcessing}
              onClick={() => setShowConfirm("approve")}
              className="px-6 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-xl text-xs font-black uppercase tracking-widest transition-colors disabled:opacity-30 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Bulk Approve
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {pendingAssets.map(asset => (
            <div 
              key={asset.id} 
              onClick={() => toggleSelect(asset.id)}
              className={`relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                selectedIds.has(asset.id) ? "border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]" : "border-white/5 hover:border-white/20"
              }`}
            >
              <div className="aspect-square bg-black/50 p-4 flex items-center justify-center">
                <img src={asset.image_url} alt={asset.title} loading="lazy" className="max-w-full max-h-full object-contain" />
              </div>
              <div className="p-3 bg-ninja-black">
                <h4 className="text-[10px] font-bold text-white truncate">{asset.title}</h4>
                <p className="text-[9px] text-white/40 truncate">{asset.category}</p>
              </div>
              {selectedIds.has(asset.id) && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                  <ShieldCheck className="w-3 h-3 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-ninja-black border border-white/10 p-8 rounded-3xl max-w-md w-full shadow-2xl relative">
            <AlertTriangle className={`w-12 h-12 mb-4 ${showConfirm === 'approve' ? 'text-emerald-400' : 'text-red-400'}`} />
            <h3 className="text-xl font-black uppercase mb-2">
              Confirm {showConfirm === 'approve' ? 'Approval' : 'Rejection'}
            </h3>
            <p className="text-sm text-secondary mb-8">
              選択された {selectedIds.size} 件のアセットを{showConfirm === 'approve' ? '公開' : '却下'}します。よろしいですか？
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowConfirm(null)}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={() => handleBulkAction(`bulk_${showConfirm}` as any)}
                className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-colors ${
                  showConfirm === 'approve' ? 'bg-emerald-500 hover:bg-emerald-400 text-black' : 'bg-red-500 hover:bg-red-400 text-white'
                }`}
              >
                Execute
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
