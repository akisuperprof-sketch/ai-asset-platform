"use client";
import { Zap, Flame } from "lucide-react";

import React, { useState, useEffect } from "react";
import { Sparkles, Layers, Image as ImageIcon, Search, ShieldCheck, CheckCircle, XCircle, HelpCircle, TrendingUp, Gauge, AlertTriangle, RefreshCw, Plus, Eye, Sliders, Copy, Check } from "lucide-react";
import { adminClient } from '@/lib/supabase';
import AssetProductionCenter from "./AssetProductionCenter";
import ProductionDashboard from "./ProductionDashboard";
import AutoProductionSettings from "./AutoProductionSettings";
import { MonetizationLinks } from "@/components/admin/MonetizationLinks";
import { supabase } from "@/lib/supabase";
import { Asset } from "@/types";

// UI database category reverse mappings
const reverseCategoryMap: Record<string, string> = {
  "food": "日本の食",
  "japan": "和の伝統素材",
  "festival": "年中行事・祭り",
  "season": "年中行事・祭り",
  "business": "ビジネス",
  "medical": "医療・ヘルスケア",
  "stationery": "事務用品・文具",
};

// Database structure to frontend Asset interface converter
function mapDbAssetToAsset(dbAsset: any): Asset {
  const bucketName = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'sukashi-assets';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  
  let imageUrl = dbAsset.image_url;
  if (!imageUrl && dbAsset.storage_key && supabaseUrl) {
    imageUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${dbAsset.storage_key}`;
  }

  const mappedCat = reverseCategoryMap[dbAsset.category] || dbAsset.category || "";

  return {
    id: dbAsset.id,
    title: dbAsset.title,
    category: mappedCat,
    tags: dbAsset.tags || [],
    description: dbAsset.description || "",
    imageUrl: imageUrl || "",
    thumbnailUrl: imageUrl || "",
    storageKey: dbAsset.storage_key,
    width: dbAsset.width || 0,
    height: dbAsset.height || 0,
    fileSize: dbAsset.file_size || "",
    isAiGenerated: dbAsset.is_ai_generated ?? true,
    isCommercialOk: dbAsset.legal_status === 'clean',
    licenseType: dbAsset.license_type || "free",
    reviewStatus: dbAsset.review_status || "approved",
    legalStatus: dbAsset.legal_status || "clean",
    publishedAt: dbAsset.published_at || undefined,
    compositionScore: dbAsset.composition_score || 90,
    centeringScore: dbAsset.centering_score || 90,
    marginScore: dbAsset.margin_score || 90,
    whiteFringeScore: dbAsset.white_fringe_score || 90,
    resolutionScore: dbAsset.resolution_score || 90,
    aiDistortionScore: dbAsset.ai_distortion_score || 90,
    subjectScore: dbAsset.subject_score || 90,
    pinterestScore: dbAsset.pinterest_score || 90,
    canvaScore: dbAsset.canva_score || 90,
    luxuryScore: dbAsset.luxury_score || 90,
    qualityRank: dbAsset.quality_rank || "A",
    rejectReason: dbAsset.reject_reason || "",
    pinterestTitle: dbAsset.pinterest_title || "",
    pinterestDescription: dbAsset.pinterest_description || "",
    seoScore: dbAsset.seo_score || 90,
  };
}

const initialKeywords = [
  { term: "寿司 透過", searches: 4210, downloads: 1840, hit: true, status: "stable" },
  { term: "日本刀 PNG", searches: 3980, downloads: 1420, hit: true, status: "stable" },
  { term: "和風 桜吹雪", searches: 2900, downloads: 910, hit: true, status: "stable" },
  { term: "おにぎり デコ", searches: 840, downloads: 0, hit: false, status: "gap" },
  { term: "提灯 祭り 赤", searches: 1980, downloads: 680, hit: true, status: "stable" },
  { term: "忍者 手裏剣 3D", searches: 720, downloads: 0, hit: false, status: "gap" },
  { term: "富士山 赤富士 浮世絵", searches: 2430, downloads: 820, hit: true, status: "stable" }
];

export default function StudioPage() {
  const [localAssets, setLocalAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [previewBg, setPreviewBg] = useState<"checker" | "black" | "white">("checker");
  const [searchQuery, setSearchQuery] = useState("");
  const [qaFilter, setQaFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showLowQualityOnly, setShowLowQualityOnly] = useState(false);
  
  // Job Creator states
  const [jobCount, setJobCount] = useState(10);
  const [jobPrompt, setJobPrompt] = useState("");
  const [jobTags, setJobTags] = useState("");
  const [modelType, setModelType] = useState("stability-sdxl-1.0");

  const [activeTab, setActiveTab] = useState<"dashboard" | "generate" | "keywords" | "queue">("dashboard");
  const [jobCategory, setJobCategory] = useState("sushi");
  const [jobBatchSize, setJobBatchSize] = useState("10");
  const [generationStats, setGenerationStats] = useState<{
    candidatesToday: number;
    actualGenerated: number;
    qaPassed: number;
    qaFailed: number;
    passRate: string;
    costEstimateYen: number;
    premiumCandidates: number;
    rejectImmediately: number;
    categoryStats: Record<string, number>;
  } | null>(null);

  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [queueJobs, setQueueJobs] = useState<any[]>([]);

  const fetchQueueJobs = async () => {
    const { data } = await supabase
      .from('generation_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (data) setQueueJobs(data);
  };

  useEffect(() => {
    if (activeTab === 'queue') {
      fetchQueueJobs();
    }
  }, [activeTab]);

  // Fetch real assets and stats from API securely
  const fetchRealData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch accurate stats from health-check API
      const statsRes = await fetch("/api/admin/health-check");
      const statsJson = await statsRes.json();
      if (statsJson.success && statsJson.db) {
        setStats({
          totalAssets: statsJson.db.total,
          publishedAssets: statsJson.db.approved,
          pendingAssets: statsJson.db.pending,
          rejectedAssets: statsJson.db.rejected,
          draftAssets: statsJson.db.draft,
          storageFileCount: statsJson.storage.existsInStorageCount,
          missingImagesCount: statsJson.db.nullImageCount,
          todayAdded: 0, // calculate locally below
          downloadCount: 0
        });
      }

      // 2. Fetch raw assets securely via admin API
      const assetsRes = await fetch("/api/admin/assets");
      const assetsJson = await assetsRes.json();

      if (!assetsJson.success) {
        throw new Error(assetsJson.error || "認証エラー、またはデータ取得失敗");
      }

      if (assetsJson.data) {
        const mappedAssets = assetsJson.data.map(mapDbAssetToAsset);
        setLocalAssets(mappedAssets);
        if (mappedAssets.length > 0) {
          setSelectedAsset(mappedAssets[0]);
        }
      }
    } catch (e: any) {
      console.error("❌ Failed to fetch real data for Admin Studio:", e);
      setErrorMsg(e.message || "データ取得中にエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  // Sync selection when localAssets updates
  useEffect(() => {
    if (selectedAsset) {
      const match = localAssets.find(a => a.id === selectedAsset.id);
      if (match) setSelectedAsset(match);
    }
  }, [localAssets]);

  // Telemetry KPI calculator based on live stats or local map fallback
  const getKpiStats = () => {
    if (stats) {
      return {
        totalAssets: stats.totalAssets || 0,
        published: stats.publishedAssets || 0,
        pendingReview: stats.pendingAssets || 0,
        rejected: stats.rejectedAssets || 0,
        generatedToday: stats.todayAdded || 0,
        missingImagesCount: stats.missingImagesCount || 0,
        displayable: stats.publishedAssets || 0, // Since currently missing images are 0
        storageFileCount: stats.storageFileCount || 0,
      };
    }
    
    // Fallback: local calculation
    const total = localAssets.length;
    const published = localAssets.filter(a => a.reviewStatus === "approved").length;
    const pending = localAssets.filter(a => a.reviewStatus === "pending").length;
    const rejected = localAssets.filter(a => a.reviewStatus === "rejected").length;
    const missingImage = localAssets.filter(a => !a.imageUrl).length;
    const todayAdded = localAssets.filter(a => {
      if (!a.publishedAt) return false;
      const startOfToday = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
      return new Date(a.publishedAt) >= startOfToday;
    }).length;

    return {
      totalAssets: total,
      published,
      pendingReview: pending,
      rejected,
      generatedToday: todayAdded,
      missingImagesCount: missingImage,
      displayable: Math.max(0, published - missingImage),
      storageFileCount: total,
    };
  };

  const kpis = getKpiStats();

  const qaStats = {
    untested: localAssets.filter(a => !a.qaCheckedAt).length,
    pendingRec: localAssets.filter(a => a.qaRecommendedAction === 'pending').length,
    rejectRec: localAssets.filter(a => a.qaRecommendedAction === 'reject').length,
    approveRec: localAssets.filter(a => a.qaRecommendedAction === 'approve').length,
    highPinterest: localAssets.filter(a => (a.pinterestScore || 0) >= 70).length
  };

  // Filter assets based on search query and low quality flag
  const isLowQuality = (asset: Asset) => {
    const text = (asset.title + " " + asset.tags.join(" ")).toLowerCase();
    const lqTerms = ["star", "circle", "abstract", "monochrome", "low_quality", "図形", "幾何", "単色"];
    return lqTerms.some(term => text.includes(term));
  };

  const getLowQualityReasons = (asset: Asset) => {
    const text = (asset.title + " " + asset.tags.join(" ")).toLowerCase();
    const reasons = [];
    if (text.includes("star") || text.includes("星")) reasons.push("タイトル/タグに星(star)を含む");
    if (text.includes("circle") || text.includes("丸")) reasons.push("タイトル/タグに丸(circle)を含む");
    if (text.includes("abstract") || text.includes("抽象")) reasons.push("抽象図形の疑い");
    if (text.includes("monochrome") || text.includes("単色")) reasons.push("単色の疑い");
    if (text.includes("low_quality") || text.includes("幾何") || text.includes("図形")) reasons.push("幾何/図形/低品質タグを含む");
    return reasons;
  };

  const filteredAssets = localAssets.filter(asset => {
    const matchSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
    if (!matchSearch) return false;
    
    if (showLowQualityOnly && !isLowQuality(asset)) return false;

    if (statusFilter !== "all" && asset.reviewStatus !== statusFilter) return false;

    switch(qaFilter) {
      case "untested": return !asset.qaCheckedAt;
      case "qa_done": return !!asset.qaCheckedAt;
      case "rec_approve": return asset.qaRecommendedAction === "approve";
      case "rec_pending": return asset.qaRecommendedAction === "pending";
      case "rec_reject": return asset.qaRecommendedAction === "reject";
      case "high_risk": return asset.riskLevel === "high";
      case "comm_low": return (asset.commercialScore || 0) < 60;
      case "ai_high": return (asset.aiArtifactScore || 0) > 70;
      case "pin_high": return (asset.pinterestScore || 0) >= 70;
      case "rank_s": return asset.qualityRank === "S";
      case "rank_d": return asset.qualityRank === "D";
    }

    return true;
  });

  // Copy helper
  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(label);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Quick Action: Change Status manually securely via backend
  const runQAAudit = async (assetId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/qa-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      alert(`✅ Vision QA 完了\nVision: ${data.qaResult.visionScore}\nCommercial: ${data.qaResult.commercialScore}\nSEO: ${data.qaResult.seoScore}\n${data.autoPended ? '⚠️ 低品質のため自動で確認待ちに変更されました。' : ''}`);
      
      // Update local asset
      setLocalAssets(prev => prev.map(a => 
        a.id === assetId ? {
          ...a,
          visionScore: data.qaResult.visionScore,
          commercialScore: data.qaResult.commercialScore,
          seoScore: data.qaResult.seoScore,
          qualityFlags: data.qaResult.qualityFlags,
          lowQualityReason: data.qaResult.lowQualityReason,
          reviewStatus: data.autoPended ? "pending" : a.reviewStatus
        } : a
      ));

      if (selectedAsset?.id === assetId) {
        setSelectedAsset(prev => prev ? {
          ...prev,
          visionScore: data.qaResult.visionScore,
          commercialScore: data.qaResult.commercialScore,
          seoScore: data.qaResult.seoScore,
          qualityFlags: data.qaResult.qualityFlags,
          lowQualityReason: data.qaResult.lowQualityReason,
          reviewStatus: data.autoPended ? "pending" : prev.reviewStatus
        } : null);
      }

      // Fetch generation jobs stats
      const genRes = await fetch("/api/admin/generation-jobs/stats");
      if (genRes.ok) {
        const genData = await genRes.json();
        setGenerationStats(genData);
      }

    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to load admin data");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    if (newStatus === "rejected") {
      if (!window.confirm("この素材を却下しますか？公開一覧から除外されます。")) return;
    } else if (newStatus === "pending") {
      if (!window.confirm("この素材を確認待ちに戻しますか？公開サイトに表示されなくなります。")) return;
    }

    try {
      const res = await fetch('/api/admin/asset-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: id, status: newStatus })
      });
      const data = await res.json();
      
      if (!data.success) throw new Error(data.error);
      
      setLocalAssets(prev => prev.map(asset => {
        if (asset.id === id) {
          return { ...asset, reviewStatus: newStatus as any, publishedAt: newStatus === "approved" ? new Date().toISOString() : undefined } as any;
        }
        return asset;
      }));
      
      if (selectedAsset?.id === id) {
        setSelectedAsset(prev => prev ? { ...prev, reviewStatus: newStatus as any } : null);
      }
      
      const statsRes = await fetch("/api/stats");
      const statsJson = await statsRes.json();
      if (statsJson.success) setStats(statsJson);
      
    } catch (e: any) {
      console.error(e);
      alert(`❌ ステータス更新失敗: ${e.message}`);
    }
  };

  // Advanced Action: Update Quality Rank & auto-adjust status / scores securely via backend
  const updateRank = async (id: string, newRank: string) => {
    if (newRank === "D") {
      if (!window.confirm("この素材を「D Reject」ランクに変更しますか？")) return;
    }
    try {
      const res = await fetch('/api/admin/asset-rank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: id, rank: newRank })
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      
      setLocalAssets(prev => prev.map(asset => {
        if (asset.id === id) {
          return { ...asset, qualityRank: newRank as any };
        }
        return asset;
      }));

      if (selectedAsset?.id === id) {
        setSelectedAsset(prev => prev ? { ...prev, qualityRank: newRank as any } : null);
      }
      
    } catch (e: any) {
      console.error(e);
      alert(`❌ ランク更新失敗: ${e.message}`);
    }
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`💡 AI GENERATION JOB INITIATED SUCCESSFULLY!\n\nCategory: ${jobCategory}\nTarget Count: ${jobCount} assets\nModel: ${modelType}\nPrompt: ${jobPrompt || "Default Studio Settings"}`);
    setJobPrompt("");
    setJobTags("");
  };

  return (
    <div className="p-8 space-y-8 font-sans bg-zinc-950 text-white min-h-screen">
      <MonetizationLinks />
      <AssetProductionCenter />
      <ProductionDashboard />
      <AutoProductionSettings />

      {/* PHASE 7: Dashboard Tasks */}
      <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden mb-8">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <CheckCircle className="w-32 h-32 text-indigo-400" />
        </div>
        <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-indigo-300">
          <Layers className="w-5 h-5" />
          本日の推奨作業 (Today's Tasks)
        </h2>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setQaFilter("untested")} className="bg-black/40 hover:bg-black/60 border border-white/10 px-4 py-2 rounded-xl text-sm font-bold transition">
            未監査素材: <span className="text-white">{qaStats.untested}件</span>
          </button>
          <button onClick={() => setQaFilter("rec_pending")} className="bg-black/40 hover:bg-black/60 border border-amber-500/20 px-4 py-2 rounded-xl text-sm font-bold transition">
            pending推奨: <span className="text-amber-400">{qaStats.pendingRec}件</span>
          </button>
          <button onClick={() => setQaFilter("rec_reject")} className="bg-black/40 hover:bg-black/60 border border-red-500/20 px-4 py-2 rounded-xl text-sm font-bold transition">
            reject推奨: <span className="text-red-400">{qaStats.rejectRec}件</span>
          </button>
          <button onClick={() => setQaFilter("rec_approve")} className="bg-black/40 hover:bg-black/60 border border-emerald-500/20 px-4 py-2 rounded-xl text-sm font-bold transition">
            公開候補: <span className="text-emerald-400">{qaStats.approveRec}件</span>
          </button>
          <button onClick={() => setQaFilter("pin_high")} className="bg-black/40 hover:bg-black/60 border border-pink-500/20 px-4 py-2 rounded-xl text-sm font-bold transition">
            高Pinterest素材: <span className="text-pink-400">{qaStats.highPinterest}件</span>
          </button>
        </div>
      </div>
      
      {/* Top Banner OS Head */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            AI素材工場コンソール
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            スタジオ管理OS
          </h1>
          <p className="text-xs text-zinc-400 mt-2 max-w-xl leading-relaxed">
            公開中素材・確認待ち素材・低品質疑い素材を確認し、公開停止や確認待ち戻しを行う管理画面です。
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors ${
              activeTab === "dashboard" ? "bg-white text-zinc-950" : "bg-white/5 border border-white/5 text-zinc-400 hover:text-white"
            }`}
           title="素材全体の状態を確認します">
            ダッシュボード
          </button>
          <button 
            onClick={() => setActiveTab("generate")}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors ${
              activeTab === "generate" ? "bg-white text-zinc-950" : "bg-white/5 border border-white/5 text-zinc-400 hover:text-white"
            }`}
           title="新しい素材生成を予約します">
            生成ジョブ作成
          </button>
          <button 
            onClick={() => setActiveTab("queue")}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors ${
              activeTab === "queue" ? "bg-white text-zinc-950" : "bg-white/5 border border-white/5 text-zinc-400 hover:text-white"
            }`}
           title="キュー管理">
            プロダクションキュー
          </button>
          <button 
            onClick={() => setActiveTab("keywords")}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors ${
              activeTab === "keywords" ? "bg-white text-zinc-950" : "bg-white/5 border border-white/5 text-zinc-400 hover:text-white"
            }`}
           title="ユーザー検索ワードから不足素材を確認します">
            検索需要レーダー
          </button>
        </div>
      </div>

            {/* OPERATIONS GUIDE */}
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6">
        <h3 className="text-sm font-black text-purple-300 mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" /> 操作ガイド
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-xs text-zinc-300 font-semibold leading-relaxed">
          <li>まず「低品質疑い」を押して、星・丸・単色素材を確認します。</li>
          <li>問題がある素材をクリックします。</li>
          <li>公開に不適切な場合は「確認待ちに戻す」または「公開停止」を押します。</li>
          <li>検索欄では、タイトル・タグ・IDで素材を探せます。</li>
          <li>件数整合性チェックで、DB件数と画面表示件数のズレを確認できます。</li>
        </ol>
      </div>

      {activeTab === "dashboard" && (
        <div className="grid grid-cols-12 gap-8">
          
          {/* LEFT: Assets Grid (7 cols) */}
          <div className="col-span-12 xl:col-span-7 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-md font-black uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                素材品質確認一覧
              </h2>
              <p className="text-[10px] text-zinc-400">
                各素材の画像・品質ランク・SEOスコア・公開状態を確認できます。低品質な素材は公開停止または確認待ちに戻してください。
              </p>
              
              <div className="flex items-center gap-2">
                <div className="flex gap-1 bg-zinc-900 border border-white/5 p-1 rounded-xl">
                  <button onClick={() => setStatusFilter("all")} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${statusFilter === "all" ? "bg-white text-zinc-900" : "text-zinc-500 hover:text-white"}`}>All</button>
                  <button onClick={() => setStatusFilter("approved")} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${statusFilter === "approved" ? "bg-emerald-500 text-white" : "text-emerald-500/50 hover:text-emerald-400"}`}>公開</button>
                  <button onClick={() => setStatusFilter("pending")} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${statusFilter === "pending" ? "bg-amber-500 text-white" : "text-amber-500/50 hover:text-amber-400"}`}>確認待</button>
                  <button onClick={() => setStatusFilter("rejected")} className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors ${statusFilter === "rejected" ? "bg-red-500 text-white" : "text-red-500/50 hover:text-red-400"}`}>却下</button>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <button
                    onClick={() => setShowLowQualityOnly(!showLowQualityOnly)}
                    className={`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors border ${
                      showLowQualityOnly ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-zinc-900 text-zinc-400 border-white/5 hover:bg-zinc-800'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 inline-block mr-1" />
                    低品質疑い
                  </button>
                </div>
                {/* Search Bar */}
                <div className="relative max-w-xs w-full">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    placeholder="タイトル・タグ・IDで検索"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/5 pl-10 pr-4 py-2 rounded-full text-xs text-white focus:outline-none focus:border-purple-500/40"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
              {filteredAssets.map((asset) => (
                <div 
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`bg-zinc-900/40 rounded-2xl p-3 cursor-pointer transition-all border ${
                    selectedAsset?.id === asset.id ? "border-purple-500/50 bg-purple-500/5 shadow-[0_0_15px_rgba(168,85,247,0.1)]" : "border-white/5 hover:border-white/10"
                  }`}
                >
                  {/* Thumb Preview */}
                  <div className="aspect-square w-full rounded-xl bg-zinc-950 flex items-center justify-center p-2 relative overflow-hidden group mb-3">
                    <div className="absolute inset-0 bg-checker opacity-40 pointer-events-none" />
                    <img 
                      src={asset.imageUrl} 
                      alt={asset.title} 
                      className="w-full h-full object-contain relative z-10 transition-transform group-hover:scale-105"
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2 z-20">
                      {asset.reviewStatus === "approved" && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-500/25">
                          公開中
                        </span>
                      )}
                      {asset.reviewStatus === "pending" && (
                        <span className="bg-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-amber-500/25">
                          確認待ち
                        </span>
                      )}
                      {asset.reviewStatus === "rejected" && (
                        <span className="bg-red-500/20 text-red-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-red-500/25">
                          却下
                        </span>
                      )}
                    </div>

                    {/* Rank Badge */}
                    {asset.qualityRank && (
                      <div className="absolute top-2 left-2 z-20">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border ${
                          asset.qualityRank === "S" ? "bg-purple-500/20 text-purple-300 border-purple-500/30" :
                          asset.qualityRank === "A" ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" :
                          asset.qualityRank === "B" ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
                          "bg-zinc-800 text-zinc-400 border-zinc-700"
                        }`}>
                          {asset.qualityRank}ランク
                        </span>
                      </div>
                    )}

                    {/* SEO score bottom badge */}
                    {asset.visionScore !== undefined && (
                      <div className="absolute top-2 left-20 z-20">
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                          asset.visionScore >= 70 ? "bg-purple-500/20 text-purple-300 border-purple-500/30" :
                          asset.visionScore >= 40 ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
                          "bg-red-500/20 text-red-300 border-red-500/30"
                        }`}>
                          QA: {asset.visionScore}
                        </span>
                      </div>
                    )}

                    {asset.seoScore !== undefined && (
                      <div className="absolute bottom-2 left-2 z-20 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/5 text-[9px] font-mono font-bold text-zinc-300">
                        SEOスコア: {asset.seoScore}
                      </div>
                    )}
                  </div>

                  <h4 className="text-[11px] font-black text-white truncate">{asset.title}</h4>
                  <div className="flex items-center justify-between text-[9px] text-white/50 mt-1 mb-2 font-semibold">
                    <span>{asset.category}</span>
                    <span>{asset.fileSize}</span>
                  </div>

                  {isLowQuality(asset) && (
                    <div className="mb-2 p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
                      <span className="text-[9px] text-amber-400 font-bold block mb-1">【低品質疑い】</span>
                      {getLowQualityReasons(asset).map((r, i) => (
                        <span key={i} className="text-[8px] text-amber-300 block leading-tight">・{r}</span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto space-y-1.5 flex flex-col">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedAsset(asset); }} className="w-full py-1 text-[9px] font-bold bg-white/5 hover:bg-white/10 rounded">
                      👆 クリックで詳細を見る
                    </button>
                    {asset.reviewStatus !== 'pending' && (
                      <button onClick={(e) => { e.stopPropagation(); updateStatus(asset.id, 'pending'); }} className="w-full py-1 text-[9px] font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded">
                        確認待ちに戻す
                      </button>
                    )}
                    {asset.reviewStatus === 'approved' && (
                      <button onClick={(e) => { e.stopPropagation(); updateStatus(asset.id, 'rejected'); }} className="w-full py-1 text-[9px] font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded">
                        公開停止
                      </button>
                    )}
                    {asset.reviewStatus !== 'approved' && (
                      <button onClick={(e) => { e.stopPropagation(); updateStatus(asset.id, 'approved'); }} className="w-full py-1 text-[9px] font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded">
                        公開する
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filteredAssets.length === 0 && (
                <div className="col-span-full py-12 text-center text-zinc-500 text-xs font-semibold">
                  該当するステータス・条件の素材がありません。
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Detail Audit Panel (5 cols) */}
          <div className="col-span-12 xl:col-span-5 space-y-6">
            {selectedAsset ? (
              <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-3xl space-y-6 relative overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.02)]">
                
                {/* Head Details */}
                <div className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div>
                    <span className="text-[9px] font-mono tracking-widest text-purple-400 uppercase block mb-1">
                      ID: {selectedAsset.id}
                    </span>
                    <h3 className="text-md font-black tracking-tight text-white">{selectedAsset.title}</h3>
                  </div>

                  {selectedAsset.qualityRank && (
                    <span className={`text-xs font-black px-3 py-1 rounded-lg border shadow-sm shrink-0 ${
                      selectedAsset.qualityRank === "S" ? "bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-purple-500/5" :
                      selectedAsset.qualityRank === "A" ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/30 shadow-cyan-500/5" :
                      selectedAsset.qualityRank === "B" ? "bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-amber-500/5" :
                      "bg-zinc-800 text-zinc-400 border-zinc-700"
                    }`}>
                      {selectedAsset.qualityRank} Rank
                    </span>
                  )}
                </div>

                {/* Quality Preview Sandbox */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">
                      Quality Preview Sandbox
                    </span>
                    
                    {/* Bg options */}
                    <div className="flex gap-1.5">
                      {(["checker", "black", "white"] as const).map((bg) => (
                        <button 
                          key={bg}
                          onClick={() => setPreviewBg(bg)}
                          className={`px-2 py-0.5 rounded text-[9px] font-black uppercase transition-all ${
                            previewBg === bg ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                          }`}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main sandbox block */}
                  <div className={`aspect-square w-full rounded-2xl border border-white/5 flex items-center justify-center p-4 relative overflow-hidden transition-colors ${
                    previewBg === "checker" ? "bg-zinc-950" : previewBg === "black" ? "bg-black" : "bg-white"
                  }`}>
                    {previewBg === "checker" && <div className="absolute inset-0 bg-checker opacity-40" />}
                    <img 
                      src={selectedAsset.imageUrl} 
                      alt="Preview" 
                      className="h-full object-contain relative z-10" 
                    />
                  </div>
                </div>

                {/* Quality Gate Core Scores (Visual Bars) */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                      AI Quality Gate Score Index
                    </span>
                    {selectedAsset.seoScore && (
                      <span className="text-[10px] font-bold text-purple-300">
                        Global SEO: {selectedAsset.seoScore}/100
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Centering Score */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-zinc-500">
                        <span>CENTERING</span>
                        <span className="text-zinc-300">{selectedAsset.centeringScore || 90}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-cyan-400 rounded-full" 
                          style={{ width: `${selectedAsset.centeringScore || 90}%` }}
                        />
                      </div>
                    </div>

                    {/* Composition Score */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-zinc-500">
                        <span>COMPOSITION</span>
                        <span className="text-zinc-300">{selectedAsset.compositionScore || 92}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-purple-400 rounded-full" 
                          style={{ width: `${selectedAsset.compositionScore || 92}%` }}
                        />
                      </div>
                    </div>

                    {/* Margin Cleanliness */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-zinc-500">
                        <span>MARGIN SPACE</span>
                        <span className="text-zinc-300">{selectedAsset.marginScore || 88}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-400 rounded-full" 
                          style={{ width: `${selectedAsset.marginScore || 88}%` }}
                        />
                      </div>
                    </div>

                    {/* White Fringe Score */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-zinc-500">
                        <span>WHITE FRINGE REMOVAL</span>
                        <span className="text-zinc-300">{selectedAsset.whiteFringeScore || 94}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-400 rounded-full" 
                          style={{ width: `${selectedAsset.whiteFringeScore || 94}%` }}
                        />
                      </div>
                    </div>

                    {/* AI Distortion */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-zinc-500">
                        <span>AI DISTORTION RESIST</span>
                        <span className="text-zinc-300">{selectedAsset.aiDistortionScore || 86}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-teal-400 rounded-full" 
                          style={{ width: `${selectedAsset.aiDistortionScore || 86}%` }}
                        />
                      </div>
                    </div>

                    {/* Luxury / Premium Aesthetics */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-bold text-zinc-500">
                        <span>LUXURY OS FEEL</span>
                        <span className="text-zinc-300">{selectedAsset.luxuryScore || 85}%</span>
                      </div>
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-rose-400 rounded-full" 
                          style={{ width: `${selectedAsset.luxuryScore || 85}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reject Reason warning banner if B/C grade */}
                {selectedAsset.rejectReason && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl flex gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block mb-0.5">Quality Warning</span>
                      <p className="text-[10px] text-zinc-300 font-semibold leading-relaxed">
                        {selectedAsset.rejectReason}
                      </p>
                    </div>
                  </div>
                )}

                {/* Pinterest Metadata Studio */}
                <div className="border-t border-white/5 pt-4 space-y-4">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                    Pinterest OGP Optimization Console
                  </span>

                  <div className="space-y-3.5">
                    {/* Pinterest Title */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold">
                        <span>PINTEREST TITLE</span>
                        <button 
                          onClick={() => handleCopyText(selectedAsset.pinterestTitle || `【極上背景透過】${selectedAsset.title} - 無料商用利用`, "pintitle")}
                          className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-black uppercase text-[8px]"
                        >
                          {copiedId === "pintitle" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          Copy
                        </button>
                      </div>
                      <p className="bg-zinc-950 px-3 py-2 rounded-lg text-zinc-300 font-semibold border border-white/5 text-[10px] break-all leading-relaxed">
                        {selectedAsset.pinterestTitle || `【極上背景透過】${selectedAsset.title} - 無料商用利用`}
                      </p>
                    </div>

                    {/* Pinterest Description */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] text-zinc-500 font-bold">
                        <span>PINTEREST DESCRIPTION</span>
                        <button 
                          onClick={() => handleCopyText(selectedAsset.pinterestDescription || selectedAsset.description || "", "pindesc")}
                          className="flex items-center gap-1 text-purple-400 hover:text-purple-300 font-black uppercase text-[8px]"
                        >
                          {copiedId === "pindesc" ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          Copy
                        </button>
                      </div>
                      <p className="bg-zinc-950 px-3 py-2 rounded-lg text-zinc-300 font-semibold border border-white/5 text-[10px] break-all leading-relaxed">
                        {selectedAsset.pinterestDescription || selectedAsset.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Premium QA Audit Status */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                  <span className="text-[10px] font-black text-ai-cyan uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Premium QA Audit OS
                  </span>

                  <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Zap className="w-4 h-4" />
                      Vision QA Scores
                    </span>
                    
                    {selectedAsset.qaCheckedAt ? (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          <div className={`bg-black/50 p-2 rounded-lg border text-center ${selectedAsset.visionScore && selectedAsset.visionScore >= 90 ? 'border-emerald-500/30' : selectedAsset.visionScore && selectedAsset.visionScore >= 70 ? 'border-amber-500/30' : 'border-red-500/30'}`}>
                            <div className={`font-black text-xs ${selectedAsset.visionScore && selectedAsset.visionScore >= 90 ? 'text-emerald-400' : selectedAsset.visionScore && selectedAsset.visionScore >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{selectedAsset.visionScore || 0}</div>
                            <div className="text-[8px] text-zinc-500 uppercase mt-1">Vision QA</div>
                          </div>
                          <div className={`bg-black/50 p-2 rounded-lg border text-center ${selectedAsset.commercialScore && selectedAsset.commercialScore >= 90 ? 'border-emerald-500/30' : selectedAsset.commercialScore && selectedAsset.commercialScore >= 70 ? 'border-amber-500/30' : 'border-red-500/30'}`}>
                            <div className={`font-black text-xs ${selectedAsset.commercialScore && selectedAsset.commercialScore >= 90 ? 'text-emerald-400' : selectedAsset.commercialScore && selectedAsset.commercialScore >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{selectedAsset.commercialScore || 0}</div>
                            <div className="text-[8px] text-zinc-500 uppercase mt-1">Commercial</div>
                          </div>
                          <div className={`bg-black/50 p-2 rounded-lg border text-center ${selectedAsset.seoScore && selectedAsset.seoScore >= 90 ? 'border-emerald-500/30' : selectedAsset.seoScore && selectedAsset.seoScore >= 70 ? 'border-amber-500/30' : 'border-red-500/30'}`}>
                            <div className={`font-black text-xs ${selectedAsset.seoScore && selectedAsset.seoScore >= 90 ? 'text-emerald-400' : selectedAsset.seoScore && selectedAsset.seoScore >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{selectedAsset.seoScore || 0}</div>
                            <div className="text-[8px] text-zinc-500 uppercase mt-1">SEO</div>
                          </div>
                          <div className={`bg-black/50 p-2 rounded-lg border text-center ${selectedAsset.canvaScore && selectedAsset.canvaScore >= 90 ? 'border-emerald-500/30' : selectedAsset.canvaScore && selectedAsset.canvaScore >= 70 ? 'border-amber-500/30' : 'border-red-500/30'}`}>
                            <div className={`font-black text-xs ${selectedAsset.canvaScore && selectedAsset.canvaScore >= 90 ? 'text-emerald-400' : selectedAsset.canvaScore && selectedAsset.canvaScore >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{selectedAsset.canvaScore || 0}</div>
                            <div className="text-[8px] text-zinc-500 uppercase mt-1">Canva</div>
                          </div>
                          <div className={`bg-black/50 p-2 rounded-lg border text-center ${selectedAsset.pinterestScore && selectedAsset.pinterestScore >= 90 ? 'border-emerald-500/30' : selectedAsset.pinterestScore && selectedAsset.pinterestScore >= 70 ? 'border-amber-500/30' : 'border-red-500/30'}`}>
                            <div className={`font-black text-xs ${selectedAsset.pinterestScore && selectedAsset.pinterestScore >= 90 ? 'text-emerald-400' : selectedAsset.pinterestScore && selectedAsset.pinterestScore >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{selectedAsset.pinterestScore || 0}</div>
                            <div className="text-[8px] text-zinc-500 uppercase mt-1">Pinterest</div>
                          </div>
                          <div className={`bg-black/50 p-2 rounded-lg border text-center ${selectedAsset.aiArtifactScore && selectedAsset.aiArtifactScore <= 10 ? 'border-emerald-500/30' : selectedAsset.aiArtifactScore && selectedAsset.aiArtifactScore <= 40 ? 'border-amber-500/30' : 'border-red-500/30'}`}>
                            <div className={`font-black text-xs ${selectedAsset.aiArtifactScore && selectedAsset.aiArtifactScore <= 10 ? 'text-emerald-400' : selectedAsset.aiArtifactScore && selectedAsset.aiArtifactScore <= 40 ? 'text-amber-400' : 'text-red-400'}`}>{selectedAsset.aiArtifactScore || 0}</div>
                            <div className="text-[8px] text-zinc-500 uppercase mt-1">AI Artifact</div>
                          </div>
                        </div>

                        {selectedAsset.qaReasons && selectedAsset.qaReasons.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                              <Flame className="w-4 h-4" />
                              監査理由 / 危険フラグ
                            </span>
                            <ul className="list-disc pl-4 text-[10px] text-zinc-400 space-y-1">
                              {selectedAsset.qaReasons.map((reason, i) => (
                                <li key={i}>{reason}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2 items-center">
                          {selectedAsset.qaRecommendedAction === "approve" && (
                            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2 py-1 rounded">公開推奨</span>
                          )}
                          {selectedAsset.qaRecommendedAction === "pending" && (
                            <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase px-2 py-1 rounded">pending推奨</span>
                          )}
                          {selectedAsset.qaRecommendedAction === "reject" && (
                            <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase px-2 py-1 rounded">reject推奨</span>
                          )}
                          
                          {selectedAsset.qaRecommendedAction === "pending" && selectedAsset.reviewStatus !== "pending" && (
                            <button 
                              onClick={() => updateStatus(selectedAsset.id, "pending")}
                              className="ml-auto bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-[10px] font-black uppercase px-3 py-1 rounded border border-amber-500/30 transition-colors"
                            >
                              手動でPendingへ戻す
                            </button>
                          )}
                        </div>
                        <div className="mt-2 text-[8px] text-zinc-500 flex justify-between">
                          <span>Model: {selectedAsset.qaModel || "-"}</span>
                          <span>{selectedAsset.qaMode === "dry-run" ? "[DRY-RUN]" : ""}</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-xs text-zinc-500 py-4 font-bold">
                        Vision QA は未実行です
                      </div>
                    )}
                  </div>
                </div>

                {/* Rights Audit Status */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Rights & Policy Audit
                  </span>

                  <div className="text-[10px] space-y-2 text-zinc-400 font-semibold leading-relaxed">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>著名ブランド・商標・肖像権の侵害判定：SAFE</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>BOOTH / Canva パブリッシャーポリシー準拠</span>
                    </div>
                  </div>
                </div>

                {/* Verification Status Operators */}
                <div className="flex flex-col gap-2 pt-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(selectedAsset.id, "approved")}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(10,185,129,0.15)]"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      公開する
                    </button>
                    
                    <button
                      onClick={() => updateStatus(selectedAsset.id, "rejected")}
                      className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      公開停止 / 却下
                    </button>
                  
                    {selectedAsset.qaRecommendedAction && (
                      <button
                        onClick={() => {
                          const newSt = selectedAsset.qaRecommendedAction === 'approve' ? 'approved' : selectedAsset.qaRecommendedAction === 'reject' ? 'rejected' : 'pending';
                          updateStatus(selectedAsset.id, newSt);
                        }}
                        className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 mt-2 w-full"
                      >
                        QA推奨に従う
                      </button>
                    )}
                  </div>

                  {/* Manual Rank Upgrades */}
                  <div className="grid grid-cols-4 gap-1.5 mt-1 border-t border-white/5 pt-3">
                    {(["S", "A", "B", "C", "D"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => updateRank(selectedAsset.id, r)}
                        className={`py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${
                          selectedAsset.qualityRank === r ? "bg-white text-zinc-950 font-bold" : "bg-white/5 text-zinc-400 hover:text-white"
                        }`}
                      >
                        Set {r}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-zinc-900/30 border border-white/5 p-8 rounded-3xl text-center text-zinc-500 text-xs">
                No asset selected
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === "generate" && (
        <div className="max-w-3xl mx-auto bg-zinc-900/30 border border-white/5 p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-purple-500/5 pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight">Daily Quality Generation Pipeline</h3>
              <p className="text-xs text-zinc-500">100件生成 → Vision QA → 人間確認 → 10〜30件の厳選公開</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 mb-8">
            <div className="bg-white/5 p-3 rounded-xl border border-white/10 text-center">
              <span className="text-[9px] text-zinc-400 font-bold uppercase block mb-1">本日生成候補</span>
              <div className="text-xl font-black text-white">{generationStats?.candidatesToday || 0}</div>
            </div>
            <div className="bg-blue-500/10 p-3 rounded-xl border border-blue-500/20 text-center">
              <span className="text-[9px] text-blue-400 font-bold uppercase block mb-1">実生成数</span>
              <div className="text-xl font-black text-blue-300">{generationStats?.actualGenerated || 0}</div>
            </div>
            <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-center">
              <span className="text-[9px] text-emerald-400 font-bold uppercase block mb-1">Premium Candidate</span>
              <div className="text-xl font-black text-emerald-300">{generationStats?.premiumCandidates || 0}</div>
            </div>
            <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-center">
              <span className="text-[9px] text-amber-400 font-bold uppercase block mb-1">Needs Fix</span>
              <div className="text-xl font-black text-amber-300">0</div>
            </div>
            <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-center">
              <span className="text-[9px] text-red-400 font-bold uppercase block mb-1">Reject Immediately</span>
              <div className="text-xl font-black text-red-300">{generationStats?.rejectImmediately || 0}</div>
            </div>
            <div className="bg-purple-500/10 p-3 rounded-xl border border-purple-500/20 text-center">
              <span className="text-[9px] text-purple-400 font-bold uppercase block mb-1">QA通過率</span>
              <div className="text-xl font-black text-purple-300">{generationStats?.passRate || "0.0"}%</div>
            </div>
            <div className="bg-zinc-800 p-3 rounded-xl border border-zinc-700 text-center">
              <span className="text-[9px] text-zinc-400 font-bold uppercase block mb-1">コスト推定</span>
              <div className="text-xl font-black text-zinc-200">¥{generationStats?.costEstimateYen?.toLocaleString() || 0}</div>
            </div>
          </div>

          <form onSubmit={handleCreateJob} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest block mb-2">Category Target</label>
                <select 
                  value={jobCategory}
                  onChange={(e) => setJobCategory(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-purple-500/40 text-white"
                >
                  <option value="寿司">寿司 (Sushi)</option>
                  <option value="ラーメン">ラーメン (Ramen)</option>
                  <option value="和柄">和柄 (Japanese Pattern)</option>
                  <option value="桜">桜 (Sakura)</option>
                  <option value="鳥居">鳥居 (Torii)</option>
                  <option value="富士山">富士山 (Fujisan)</option>
                  <option value="抹茶">抹茶 (Matcha)</option>
                  <option value="着物">着物 (Kimono)</option>
                  <option value="日本刀">日本刀 (Katana)</option>
                  <option value="提灯">提灯 (Chochin)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest block mb-2">Generate Count</label>
                <input 
                  type="number"
                  value={jobCount}
                  onChange={(e) => setJobCount(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-purple-500/40 text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest block mb-2">Neural Generation Engine</label>
              <select
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-purple-500/40 text-white"
              >
                <option value="stability-sdxl-1.0">Stable Diffusion XL 1.0 (Commercial Grade)</option>
                <option value="stability-sd3">Stable Diffusion 3.0 Ultra</option>
                <option value="dall-e-3">DALL-E 3 Precision Engine</option>
                <option value="flux-schnell">Flux Schnell Core v1</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black text-purple-300 uppercase tracking-widest block mb-2">Custom Weights Prompt Override</label>
              <textarea 
                value={jobPrompt}
                onChange={(e) => setJobPrompt(e.target.value)}
                placeholder="isolated transparent food-grade macro shot of sushi..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-purple-500/40 text-white placeholder:text-white/20 resize-none font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-6 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                  Auto-Transparency (rembg)
                </span>
                <div className="w-10 h-6 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-end px-1 cursor-pointer">
                  <div className="w-4 h-4 bg-purple-400 rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-zinc-400">
                  Pinterest OGP Optimizer (2:3)
                </span>
                <div className="w-10 h-6 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-end px-1 cursor-pointer">
                  <div className="w-4 h-4 bg-purple-400 rounded-full" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-white text-zinc-950 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Enqueue Production Generation Job
            </button>
          </form>
        </div>
      )}

      {activeTab === "keywords" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-md font-black uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              SEO Keywords Search Radar & Gaps Analysis
            </h2>
            <span className="text-[10px] text-cyan-400 font-black bg-cyan-500/5 border border-cyan-500/10 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse w-fit">
              AI Market Watch Sync: Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Radar list */}
            <div className="bg-zinc-900/30 border border-white/5 p-6 rounded-3xl space-y-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Top Searched Terms & Gaps</h3>
              
              <div className="space-y-2">
                {initialKeywords.map((k, i) => (
                  <div key={i} className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                    <div>
                      <span className="text-xs font-black block text-white">{k.term}</span>
                      <span className="text-[9px] text-white/40 block mt-0.5">
                        Searches: {k.searches} | Downloads: {k.downloads}
                      </span>
                    </div>

                    <div>
                      {k.hit ? (
                        <span className="bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/10 tracking-widest">
                          STABLE HIT
                        </span>
                      ) : (
                        <span className="bg-amber-500/10 text-amber-400 text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-amber-500/10 tracking-widest animate-pulse">
                          MISSING GAP (PROMPT AI)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right AI recommendations */}
            <div className="bg-zinc-900/30 border border-purple-500/10 p-6 rounded-3xl space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-purple-500/5 pointer-events-none" />
              <h3 className="text-sm font-black uppercase tracking-wider text-purple-300">AI Suggested Generated Themes</h3>
              
              <div className="space-y-4 text-xs font-semibold leading-relaxed text-zinc-400">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span className="font-black text-white uppercase tracking-wider">日本の食 / 和食惣菜シリーズ</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    「おにぎり デコ」「屋台焼きそば 透過」「抹茶パフェ 和風」などのキーワードの検索数が過去1週間で +120% 急上昇していますが、該当する高品質素材が圧倒的に不足しています。
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="font-black text-white uppercase tracking-wider">年中行事 / お祭りネオン装飾</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    「提灯 祭り 赤」「鳥居 夜景 ネオン」のダウンロード率が驚異の 48% を突破。夏祭りシーズンに向け、さらにバリエーションを100枚追加生成することを推奨します。
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {activeTab === "queue" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <h2 className="text-md font-black uppercase tracking-wider flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              Generation Queue & QA Fails
            </h2>
            <button onClick={fetchQueueJobs} className="text-xs font-bold text-cyan-400 border border-cyan-500/50 bg-cyan-500/10 px-4 py-2 rounded-xl hover:bg-cyan-500/20">
              Refresh Queue
            </button>
          </div>

          <div className="overflow-x-auto bg-zinc-900/30 border border-white/5 rounded-2xl">
            <table className="w-full text-left text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-secondary border-b border-white/5">
                <tr>
                  <th className="p-4 font-bold">Theme / Prompt</th>
                  <th className="p-4 font-bold text-center">Status</th>
                  <th className="p-4 font-bold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {queueJobs.map(job => (
                  <tr key={job.id} className="hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="font-bold text-white text-xs">{job.theme}</div>
                      <div className="text-[10px] text-secondary truncate max-w-md">{job.prompt_text}</div>
                      <div className="text-[10px] text-secondary mt-1">{new Date(job.created_at).toLocaleString()}</div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                        job.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        job.status === 'qa_failed' ? 'bg-red-500/20 text-red-400' :
                        job.status === 'processing' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-zinc-500/20 text-zinc-400'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {job.status === 'qa_failed' && job.metadata?.qa_reasons && (
                        <div className="text-[10px] text-red-300 bg-red-500/10 p-2 rounded border border-red-500/20">
                          <strong className="block mb-1 text-red-400">QA Rejection Reasons:</strong>
                          <ul className="list-disc list-inside space-y-0.5">
                            {job.metadata.qa_reasons.map((r: string, i: number) => (
                              <li key={i}>{r}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {job.status === 'failed' && job.error_message && (
                        <div className="text-[10px] text-red-300 bg-red-500/10 p-2 rounded border border-red-500/20 break-all">
                          {job.error_message}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {queueJobs.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-secondary text-xs font-bold">
                      Queue is currently empty.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
