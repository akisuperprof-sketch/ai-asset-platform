"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  TrendingUp, 
  Cpu, 
  Database, 
  Play, 
  Pause, 
  Activity,
  CheckCircle,
  AlertTriangle,
  FileCode2,
  Trash2,
  Check,
  X,
  RefreshCw,
  Clock,
  Eye,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

export default function AiOpsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [pendingAssets, setPendingAssets] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isAiActive, setIsAiActive] = useState(true);
  
  // モーダル状態
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // マウント後の処理
  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  // データフェッチ
  const fetchData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // 1. ヘルスチェックデータの取得
      const res = await fetch("/api/admin/health-check", { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setData(json);
      } else {
        setErrorMessage(json.error || "ヘルスチェックデータの取得に失敗しました。");
      }

      // 2. 承認待ちアセットの取得
      // supabaseクライアントを直呼び出しせず、セキュリティのためAPI経由などで取得する設計にするか、
      // ここでは/api/admin/health-checkの返却データ内、または個別にクライアントサイドでsupabaseから取得します。
      // 実装のシンプルさと service_role 秘匿のため、NEXT_PUBLIC_SUPABASE_URL と Anon キーを使った
      // クライアント側での select クエリで pending アセットを取得します。
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
      const supabase = createClient(supabaseUrl, supabaseAnonKey);

      const { data: pending, error } = await supabase
        .from("assets")
        .select("*")
        .eq("review_status", "pending")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching pending assets:", error);
      } else {
        setPendingAssets(pending || []);
      }

    } catch (err: any) {
      setErrorMessage(err.message || "通信エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  // 個別承認の処理
  const handleApproveSingle = async (assetId: string) => {
    setActionLoading(assetId);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, action: "approve_single" }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccessMessage(result.message);
        await fetchData(); // リロード
      } else {
        setErrorMessage(result.error || "承認処理に失敗しました。");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "エラーが発生しました。");
    } finally {
      setActionLoading(null);
    }
  };

  // 個別却下の処理
  const handleRejectSingle = async (assetId: string) => {
    if (!confirm("本当にこのアセットを却下しますか？")) return;
    setActionLoading(assetId);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId, action: "reject_single" }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccessMessage(result.message);
        await fetchData(); // リロード
      } else {
        setErrorMessage(result.error || "却下処理に失敗しました。");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "エラーが発生しました。");
    } finally {
      setActionLoading(null);
    }
  };

  // 一括承認の処理
  const handleApproveAll = async () => {
    setShowConfirmModal(false);
    setActionLoading("approve_all");
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_all" }),
      });
      const result = await res.json();
      if (result.success) {
        setSuccessMessage(
          `${result.approvedCount} 件を承認しました。` +
          (result.skippedCount > 0 ? ` (危険フラグ等で ${result.skippedCount} 件を安全スキップ)` : "")
        );
        if (result.skippedDetails && result.skippedDetails.length > 0) {
          console.warn("Skipped assets:", result.skippedDetails);
        }
        await fetchData();
      } else {
        setErrorMessage(result.error || "一括承認に失敗しました。");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "エラーが発生しました。");
    } finally {
      setActionLoading(null);
    }
  };

  if (!mounted) {
    return (
      <div className="p-8 text-center text-white/50 text-xs font-mono">
        INITIALIZING CORE SYSTEM...
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 font-sans bg-[#05080c] min-h-screen text-white">
      
      {/* 画面ヘッダー */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest mb-1.5 animate-pulse">
            <Cpu className="w-3.5 h-3.5" />
            AI Operations & Autopilot Monitor
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase bg-gradient-to-r from-white via-slate-100 to-cyan-500 bg-clip-text text-transparent">
            AI OSP / AUTOPILOT WATCH
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAiActive(!isAiActive)}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.05)] border border-cyan-500/10 ${
              isAiActive ? "bg-cyan-950 text-cyan-400 border-cyan-400/30" : "bg-zinc-900 text-white/40 border-white/5"
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${isAiActive ? "animate-spin" : ""}`} />
            Autopilot: {isAiActive ? "RUNNING" : "PAUSED"}
          </button>
          
          <button 
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-full bg-white/5 border border-white/5 hover:bg-white/10 active:scale-95 transition-all text-white/70"
            title="最新データに更新"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* エラー / 成功通知 */}
      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold rounded-2xl flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold rounded-2xl flex items-center gap-3">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* メインダッシュボードグリッド */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* DB HEALTH */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col justify-between min-h-[160px]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-cyan-400 tracking-wider uppercase block">DB HEALTH STATUS</span>
              <h3 className="text-3xl font-black">{data?.db?.total ?? "---"} <span className="text-xs text-white/40 font-normal">assets</span></h3>
            </div>
            <div className="p-2 bg-cyan-500/10 rounded-xl">
              <Database className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-white/50 space-y-1 font-semibold">
            <div className="flex justify-between">
              <span>Approved (公開中)</span>
              <span className="text-emerald-400 font-bold">{data?.db?.approved ?? "-"}</span>
            </div>
            <div className="flex justify-between">
              <span>Pending (未承認)</span>
              <span className="text-amber-400 font-bold">{data?.db?.pending ?? "-"}</span>
            </div>
            <div className="flex justify-between text-rose-400">
              <span>Rejected / Draft</span>
              <span className="font-bold">{(data?.db?.rejected ?? 0) + (data?.db?.draft ?? 0)}</span>
            </div>
          </div>
        </div>

        {/* STORAGE HEALTH */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col justify-between min-h-[160px]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-purple-400 tracking-wider uppercase block">STORAGE HEALTH</span>
              <h3 className="text-3xl font-black">
                {data?.storage?.existsInStorageCount ?? "---"}
                <span className="text-xs text-white/40 font-normal"> / {data?.storage?.totalScanned ?? "---"}</span>
              </h3>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-xl">
              <ShieldCheck className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-white/50 space-y-1 font-semibold">
            <div className="flex justify-between">
              <span>R2 Bucket State</span>
              <span className="text-emerald-400 font-bold">CONNECTED</span>
            </div>
            <div className="flex justify-between">
              <span>Missing in Storage</span>
              <span className={`font-bold ${data?.storage?.missingInStorageCount > 0 ? "text-rose-400 animate-pulse" : "text-emerald-400"}`}>
                {data?.storage?.missingInStorageCount ?? "-"}件
              </span>
            </div>
          </div>
        </div>

        {/* BROKEN IMAGES */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col justify-between min-h-[160px]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-emerald-400 tracking-wider uppercase block">BROKEN IMAGES</span>
              <h3 className="text-3xl font-black">
                {data?.brokenImages?.brokenCount ?? "0"}
                <span className="text-xs text-white/40 font-normal"> detected</span>
              </h3>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-xl">
              <Eye className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-white/50 space-y-1 font-semibold">
            <div className="flex justify-between">
              <span>Scan Scope (HEAD Test)</span>
              <span className="text-white/70">最新 {data?.brokenImages?.totalScanned ?? "0"} 件</span>
            </div>
            <div className="flex justify-between text-rose-400">
              <span>Broken HTTP Links</span>
              <span className="font-bold">{data?.brokenImages?.brokenCount ?? "0"} 件</span>
            </div>
          </div>
        </div>

        {/* FAILED JOBS */}
        <div className="glass-card p-6 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col justify-between min-h-[160px]">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-rose-400 tracking-wider uppercase block">FAILED JOBS</span>
              <h3 className="text-3xl font-black">
                {data?.failedJobs?.count ?? "0"}
                <span className="text-xs text-white/40 font-normal"> errors</span>
              </h3>
            </div>
            <div className="p-2 bg-rose-500/10 rounded-xl">
              <FileCode2 className="w-5 h-5 text-rose-400" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-white/5 text-[11px] text-white/50 space-y-1 font-semibold">
            <div className="flex justify-between">
              <span>Log File</span>
              <span className="text-white/60">failed_jobs.json</span>
            </div>
            <div className="flex justify-between">
              <span>Error Retries</span>
              <span className="text-emerald-400 font-bold">Enabled (Max 3)</span>
            </div>
          </div>
        </div>

      </div>

      {/* 中段グリッド: 承認審査リスト と 異常レコード監査 */}
      <div className="grid grid-cols-12 gap-8">
        
        {/* 左: 承認待ちアセット審査 (8 cols) */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-white/5 bg-white/[0.01] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400 animate-pulse" />
                <h2 className="text-base font-black uppercase tracking-wider">
                  Pending Assets Review ({pendingAssets.length})
                </h2>
              </div>

              {pendingAssets.length > 0 && (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={actionLoading !== null}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 active:scale-95 transition-all text-xs font-black uppercase tracking-widest text-white rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                >
                  <Check className="w-3.5 h-3.5" />
                  Approve All (一括承認)
                </button>
              )}
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs font-mono text-white/40 animate-pulse">
                SCANNING PENDING QUEUES...
              </div>
            ) : pendingAssets.length === 0 ? (
              <div className="py-12 text-center text-xs font-semibold text-white/30 border border-dashed border-white/5 rounded-2xl bg-white/[0.005]">
                承認待ちのアセットはありません。システムは健全です。
              </div>
            ) : (
              <div className="space-y-4">
                {pendingAssets.map((asset) => {
                  // このアセットが監査上の問題（危険フラグ）を抱えているか確認
                  const isBroken = data?.brokenImages?.brokenList?.some((b: any) => b.id === asset.id);
                  const hasMissingCategory = !asset.category;
                  const hasMissingTags = !asset.tags || asset.tags.length === 0;
                  const hasRisk = isBroken || hasMissingCategory || hasMissingTags;

                  return (
                    <div 
                      key={asset.id} 
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        hasRisk 
                          ? "bg-rose-950/20 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.02)]" 
                          : "bg-white/5 border-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className="flex gap-4 items-center">
                        {/* 簡易プレビュー */}
                        {asset.image_url ? (
                          <img 
                            src={asset.image_url} 
                            alt={asset.title} 
                            className="w-12 h-12 rounded-xl object-contain bg-slate-900 border border-white/10 shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://dummyimage.com/100x100/000/fff.png&text=ERR";
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-rose-950/40 border border-rose-500/20 flex items-center justify-center shrink-0">
                            <X className="w-5 h-5 text-rose-400" />
                          </div>
                        )}

                        <div className="space-y-1">
                          <h4 className="text-xs font-black text-white flex items-center gap-2">
                            {asset.title}
                            {hasRisk && (
                              <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[8px] px-1.5 py-0.5 rounded font-black uppercase flex items-center gap-0.5 animate-pulse">
                                <AlertTriangle className="w-2.5 h-2.5" />
                                RISK WARNING
                              </span>
                            )}
                          </h4>
                          <p className="text-[10px] text-white/40 font-mono">
                            ID/Slug: {asset.slug}
                          </p>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="bg-white/5 px-2 py-0.5 rounded-md text-[9px] font-bold text-cyan-300">
                              {asset.category || "No Category"}
                            </span>
                            {asset.tags?.slice(0, 3).map((t: string) => (
                              <span key={t} className="bg-white/5 px-1.5 py-0.5 rounded text-[8px] text-white/50">
                                #{t}
                              </span>
                            ))}
                          </div>

                          {/* 不合格警告詳細 */}
                          {hasRisk && (
                            <div className="text-[9px] text-rose-300 font-bold bg-rose-950/30 border border-rose-500/10 px-2 py-1 rounded-lg mt-2 space-y-0.5 max-w-md">
                              {isBroken && <div>• 画像のHTTP疎通確認でエラーまたは404が検出されました。</div>}
                              {hasMissingCategory && <div>• カテゴリが未設定です。</div>}
                              {hasMissingTags && <div>• タグが設定されていません。</div>}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* アクションボタン */}
                      <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleRejectSingle(asset.id)}
                          disabled={actionLoading !== null}
                          className="p-2 text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 rounded-xl transition-all"
                          title="却下（ゴミ箱）"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        
                        <button
                          onClick={() => handleApproveSingle(asset.id)}
                          disabled={actionLoading !== null || hasRisk}
                          className={`px-4 py-2 text-xs font-black uppercase rounded-full tracking-wider transition-all ${
                            hasRisk
                              ? "bg-zinc-800 text-white/20 border border-white/5 cursor-not-allowed"
                              : "bg-white text-[#05080c] hover:bg-cyan-400 hover:text-black active:scale-95 shadow-[0_0_15px_rgba(255,255,255,0.05)]"
                          }`}
                        >
                          {actionLoading === asset.id ? "PROCCESSING..." : "Approve"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 右: 自動生成パイプライン失敗ログ & 異常検知 (4 cols) */}
        <div className="col-span-12 xl:col-span-4 space-y-8">
          
          {/* Failed Jobs Logs */}
          <div className="glass-card p-6 rounded-3xl border border-white/5 bg-white/[0.01] space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-rose-400" />
              Failed Pipeline Logs
            </h2>

            {data?.failedJobs?.list && data.failedJobs.list.length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {data.failedJobs.list.map((job: any, i: number) => (
                  <div key={i} className="bg-rose-950/10 border border-rose-500/10 p-3 rounded-xl text-[10px] space-y-1 font-mono">
                    <div className="flex justify-between text-rose-400 font-bold">
                      <span>[{job.category || "UNKNOWN"}] {job.keyword || "No keyword"}</span>
                      <span>{job.timestamp ? new Date(job.timestamp).toLocaleTimeString() : ""}</span>
                    </div>
                    <div className="text-white/60 break-all leading-relaxed bg-black/30 p-1.5 rounded-lg border border-white/5">
                      {job.error || "詳細不明なパイプライン例外エラー"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-xs font-semibold text-white/30 bg-white/[0.005] border border-dashed border-white/5 rounded-xl">
                現在、パイプラインの失敗ログはありません。
              </div>
            )}
          </div>

          {/* AI Market Watch (リアルデータ連動) */}
          <div className="glass-card p-6 rounded-3xl border border-white/5 bg-white/[0.01] space-y-4">
            <h2 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Market Demand gaps
            </h2>

            <div className="text-xs font-semibold space-y-2 text-white/70">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-black text-cyan-400 tracking-wider block">日本の食 (FOOD)</span>
                  <span>ラーメン, 寿司, 天ぷら</span>
                </div>
                <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded">RISING</span>
              </div>

              <div className="p-3 bg-white/5 rounded-xl border border-white/5 flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-black text-purple-400 tracking-wider block">和の伝統 (JAPAN)</span>
                  <span>富士山, 鳥居, 招き猫</span>
                </div>
                <span className="text-emerald-400 font-bold text-[10px] bg-emerald-500/10 px-1.5 py-0.5 rounded">STEADY</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* 一括承認確認モーダル */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b121c] border border-cyan-500/20 max-w-md w-full rounded-3xl p-6 space-y-6 shadow-[0_0_50px_rgba(6,182,212,0.15)] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-cyan-400">
              <ShieldCheck className="w-6 h-6 shrink-0" />
              <h3 className="text-lg font-black uppercase tracking-tight">一括承認の確認</h3>
            </div>
            
            <p className="text-xs text-white/70 leading-relaxed font-medium">
              現在、承認待ち（Pending）のアセットを全て一括承認します。
              安全のため、**重複・破損画像・カテゴリ/タグ欠損などの危険フラグが検知されたアセットは自動でスキップ（保留）されます**。
            </p>

            <div className="bg-cyan-950/20 border border-cyan-500/10 p-3 rounded-xl text-[11px] font-mono space-y-1">
              <div className="flex justify-between text-cyan-300">
                <span>承認待ち総件数:</span>
                <span>{pendingAssets.length} 件</span>
              </div>
              <div className="flex justify-between text-rose-300">
                <span>危険・欠損警告アセット:</span>
                <span>{pendingAssets.filter(a => !a.category || !a.tags || a.tags.length === 0).length} 件</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-white/5 hover:bg-white/5 rounded-full text-xs font-black uppercase tracking-wider text-white/70"
              >
                キャンセル
              </button>
              
              <button
                onClick={handleApproveAll}
                className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-[#05080c] hover:text-white rounded-full text-xs font-black uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                安全なアセットを承認
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
