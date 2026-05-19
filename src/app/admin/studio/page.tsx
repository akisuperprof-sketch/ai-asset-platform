"use client";

import React, { useState } from "react";
import { 
  Sparkles, 
  Layers, 
  Image as ImageIcon, 
  Search, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  TrendingUp, 
  Gauge, 
  AlertTriangle,
  RefreshCw,
  Plus,
  Eye,
  Sliders
} from "lucide-react";

// Mocking initial telemetry datasets for the Dashboard
const initialKpi = {
  totalAssets: 1100,
  published: 980,
  drafts: 90,
  pendingReview: 20,
  rejected: 10,
  generatedToday: 24,
  generatedWeekly: 184
};

const initialKeywords = [
  { term: "寿司 透過", searches: 4210, downloads: 1840, hit: true, status: "stable" },
  { term: "日本刀 PNG", searches: 3980, downloads: 1420, hit: true, status: "stable" },
  { term: "和風 桜吹雪", searches: 2900, downloads: 910, hit: true, status: "stable" },
  { term: "おにぎり デコ", searches: 840, downloads: 0, hit: false, status: "gap" },
  { term: "提灯 祭り 赤", searches: 1980, downloads: 680, hit: true, status: "stable" },
  { term: "忍者 手裏剣 3D", searches: 720, downloads: 0, hit: false, status: "gap" },
  { term: "富士山 赤富士 浮世絵", searches: 2430, downloads: 820, hit: true, status: "stable" }
];

const mockAssets = [
  {
    id: "sushi-item-1",
    title: "江戸前極上マグロ握り寿司",
    category: "日本の食",
    imageUrl: "https://pngimg.com/uploads/sushi/sushi_PNG9202.png",
    status: "pending",
    qualityScore: 96,
    transparencyScore: 98,
    commercialSafetyScore: 94,
    trademarkRiskScore: "low",
    readinessScore: 96,
    tags: ["寿司", "日本の食", "背景透過", "PNG素材"],
    description: "極上大トロマグロの江戸前握り寿司背景透過アセットデータです。シャリの米粒一つ一つまで高精細に抽出。",
    width: 4096,
    height: 4096,
    fileSize: "2.4 MB"
  },
  {
    id: "ramen-item-2",
    title: "濃厚特製醤油豚骨ラーメン",
    category: "日本の食",
    imageUrl: "https://pngimg.com/uploads/sushi/sushi_PNG9202.png",
    status: "approved",
    qualityScore: 94,
    transparencyScore: 95,
    commercialSafetyScore: 92,
    trademarkRiskScore: "low",
    readinessScore: 94,
    tags: ["ラーメン", "日本の食", "背景透過", "PNG素材"],
    description: "旨み豊かな極太チャーシューと煮玉子をトッピングした特製醤油豚骨ラーメンの透過PNGアセット。",
    width: 4096,
    height: 4096,
    fileSize: "2.8 MB"
  },
  {
    id: "katana-item-3",
    title: "真打戦国日本刀真剣",
    category: "事務用品",
    imageUrl: "https://pngimg.com/uploads/pen/pen_PNG1395.png",
    status: "approved",
    qualityScore: 98,
    transparencyScore: 99,
    commercialSafetyScore: 95,
    trademarkRiskScore: "low",
    readinessScore: 97,
    tags: ["日本刀", "武具", "背景透過", "PNG素材"],
    description: "研ぎ澄まされた刃文と美しい日本刀の反りを極限再現した透過PNG画像アセット。",
    width: 4096,
    height: 4096,
    fileSize: "2.1 MB"
  },
  {
    id: "chochin-item-4",
    title: "伝統お祭り赤塗り提灯",
    category: "日本の日常小物",
    imageUrl: "https://pngimg.com/uploads/teapot/teapot_PNG27.png",
    status: "rejected",
    qualityScore: 72,
    transparencyScore: 60,
    commercialSafetyScore: 88,
    trademarkRiskScore: "high",
    readinessScore: 65,
    tags: ["提灯", "祭り", "背景透過", "PNG素材"],
    description: "有名特定神社のロゴマークが提灯表面に意図せず写り込んでしまっているためリジェクト対象。",
    width: 4096,
    height: 4096,
    fileSize: "2.5 MB"
  }
];

export default function StudioPage() {
  const [assets, setAssets] = useState(mockAssets);
  const [selectedAsset, setSelectedAsset] = useState(mockAssets[0]);
  const [previewBg, setPreviewBg] = useState("checker"); // 'checker', 'black', 'white'
  
  // Job Creator states
  const [jobCategory, setJobCategory] = useState("寿司");
  const [jobCount, setJobCount] = useState(10);
  const [jobPrompt, setJobPrompt] = useState("");
  const [jobTags, setJobTags] = useState("");
  const [modelType, setModelType] = useState("stability-sdxl-1.0");

  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard', 'generate', 'keywords'

  // Handling Quick Verification Status actions
  const updateStatus = (id: string, newStatus: string) => {
    const updated = assets.map(asset => {
      if (asset.id === id) {
        return { ...asset, status: newStatus };
      }
      return asset;
    });
    setAssets(updated);
    // Sync selection
    const match = updated.find(a => a.id === id);
    if (match) setSelectedAsset(match);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`💡 AI GENERATION JOB INITIATED SUCCESSFULLY!\n\nCategory: ${jobCategory}\nTarget Count: ${jobCount} assets\nModel: ${modelType}\nPrompt: ${jobPrompt || "Default Studio Settings"}`);
    setJobPrompt("");
    setJobTags("");
  };

  return (
    <div className="p-8 space-y-8 font-sans">
      
      {/* Top Banner OS Head */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            AI Asset Factory Console
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase">
            STUDIO WORKSPACE
          </h1>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors ${
              activeTab === "dashboard" ? "bg-ai-gradient text-white" : "glass-card border-white/5 text-secondary hover:text-white"
            }`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab("generate")}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors ${
              activeTab === "generate" ? "bg-ai-gradient text-white" : "glass-card border-white/5 text-secondary hover:text-white"
            }`}
          >
            Create Gen Job
          </button>
          <button 
            onClick={() => setActiveTab("keywords")}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors ${
              activeTab === "keywords" ? "bg-ai-gradient text-white" : "glass-card border-white/5 text-secondary hover:text-white"
            }`}
          >
            Keyword Radar
          </button>
        </div>
      </div>

      {/* KPI METRICS WIDGETS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="glass-card border-white/5 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-purple-500/5 pointer-events-none" />
          <span className="text-[9px] font-black text-secondary tracking-widest uppercase block mb-1">TOTAL IMAGES</span>
          <h3 className="text-2xl font-black tracking-tight">{initialKpi.totalAssets}</h3>
          <span className="text-[8px] text-purple-400 font-bold block mt-1 tracking-wider">ALL CATEGORIES</span>
        </div>

        <div className="glass-card border-white/5 p-5 rounded-2xl">
          <span className="text-[9px] font-black text-emerald-400 tracking-widest uppercase block mb-1">PUBLISHED</span>
          <h3 className="text-2xl font-black tracking-tight">{initialKpi.published}</h3>
          <span className="text-[8px] text-emerald-500/80 font-bold block mt-1 tracking-wider">LIVE IN SITEMAP</span>
        </div>

        <div className="glass-card border-white/5 p-5 rounded-2xl">
          <span className="text-[9px] font-black text-amber-400 tracking-widest uppercase block mb-1">PENDING REVIEW</span>
          <h3 className="text-2xl font-black tracking-tight">{initialKpi.pendingReview}</h3>
          <span className="text-[8px] text-amber-500/80 font-bold block mt-1 tracking-wider">NEEDS RIGHTS AUDIT</span>
        </div>

        <div className="glass-card border-white/5 p-5 rounded-2xl">
          <span className="text-[9px] font-black text-red-400 tracking-widest uppercase block mb-1">REJECTED</span>
          <h3 className="text-2xl font-black tracking-tight">{initialKpi.rejected}</h3>
          <span className="text-[8px] text-red-500/80 font-bold block mt-1 tracking-wider">TRADEMARK RISKS</span>
        </div>

        <div className="glass-card border-white/5 p-5 rounded-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-cyan-500/5 pointer-events-none" />
          <span className="text-[9px] font-black text-cyan-400 tracking-widest uppercase block mb-1">GENERATED TODAY</span>
          <h3 className="text-2xl font-black tracking-tight">+{initialKpi.generatedToday}</h3>
          <span className="text-[8px] text-cyan-500/80 font-bold block mt-1 tracking-wider">AI OPS QUEUE</span>
        </div>
      </div>

      {activeTab === "dashboard" && (
        <div className="grid grid-cols-12 gap-8">
          
          {/* LEFT: Assets Grid (7 cols) */}
          <div className="col-span-12 xl:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-md font-black uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                Asset Verification Pipeline Grid
              </h2>
              <span className="text-[10px] text-secondary font-semibold">
                Click an asset to load comprehensive SEO & Transparency analysis
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {assets.map((asset) => (
                <div 
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={`glass-card rounded-2xl p-3 cursor-pointer transition-all border ${
                    selectedAsset.id === asset.id ? "border-purple-500/50 bg-purple-500/5" : "border-white/5 hover:border-white/10"
                  }`}
                >
                  {/* Thumb Preview */}
                  <div className="aspect-square w-full rounded-xl bg-zinc-900 flex items-center justify-center p-2 relative overflow-hidden group mb-3">
                    <div className="absolute inset-0 bg-checker opacity-40 pointer-events-none" />
                    <img 
                      src={asset.imageUrl} 
                      alt={asset.title} 
                      className="w-full h-full object-contain relative z-10 transition-transform group-hover:scale-105"
                    />
                    
                    {/* Status Badge */}
                    <div className="absolute top-2 right-2 z-20">
                      {asset.status === "approved" && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-500/25">
                          APPROVED
                        </span>
                      )}
                      {asset.status === "pending" && (
                        <span className="bg-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-amber-500/25">
                          PENDING
                        </span>
                      )}
                      {asset.status === "rejected" && (
                        <span className="bg-red-500/20 text-red-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-red-500/25">
                          REJECTED
                        </span>
                      )}
                    </div>

                    {/* Quality score bottom badge */}
                    <div className="absolute bottom-2 left-2 z-20 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/5 text-[9px] font-mono font-bold text-purple-300">
                      Score: {asset.readinessScore}%
                    </div>
                  </div>

                  <h4 className="text-[11px] font-black text-white truncate">{asset.title}</h4>
                  <div className="flex items-center justify-between text-[9px] text-white/50 mt-1 font-semibold">
                    <span>{asset.category}</span>
                    <span>{asset.fileSize}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Detail Audit Panel (5 cols) */}
          <div className="col-span-12 xl:col-span-5 space-y-6">
            <div className="glass-card border-purple-500/10 p-6 rounded-3xl space-y-6 relative overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.02)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
              
              {/* Head Details */}
              <div className="border-b border-white/5 pb-4">
                <span className="text-[9px] font-mono tracking-widest text-purple-400 uppercase block mb-1">
                  ID: {selectedAsset.id}
                </span>
                <h3 className="text-md font-black tracking-tight text-white">{selectedAsset.title}</h3>
              </div>

              {/* Quality Preview Sandbox */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-secondary uppercase tracking-wider">
                    Quality Preview Sandbox
                  </span>
                  
                  {/* Bg options */}
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => setPreviewBg("checker")}
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase transition-all ${
                        previewBg === "checker" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                      }`}
                    >
                      Checker
                    </button>
                    <button 
                      onClick={() => setPreviewBg("black")}
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase transition-all ${
                        previewBg === "black" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                      }`}
                    >
                      Black
                    </button>
                    <button 
                      onClick={() => setPreviewBg("white")}
                      className={`px-2 py-0.5 rounded text-[9px] font-black uppercase transition-all ${
                        previewBg === "white" ? "bg-white/10 text-white" : "text-white/40 hover:text-white"
                      }`}
                    >
                      White
                    </button>
                  </div>
                </div>

                {/* Main sandbox block */}
                <div className={`aspect-video w-full rounded-2xl border border-white/5 flex items-center justify-center p-4 relative overflow-hidden transition-colors ${
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

              {/* Asset Safety Scores */}
              <div className="space-y-3">
                <span className="text-[10px] font-black text-secondary uppercase tracking-wider block">
                  Asset Safety Score Index
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] text-white/50 block">Quality Score</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      <span className="text-xs font-black">{selectedAsset.qualityScore}%</span>
                    </div>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] text-white/50 block">Transparency</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span className="text-xs font-black">{selectedAsset.transparencyScore}%</span>
                    </div>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] text-white/50 block">Commercial Safety</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${selectedAsset.commercialSafetyScore > 90 ? "bg-emerald-400" : "bg-amber-400"}`} />
                      <span className="text-xs font-black">{selectedAsset.commercialSafetyScore}%</span>
                    </div>
                  </div>

                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-[9px] text-white/50 block">Trademark Risks</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className={`w-1.5 h-1.5 rounded-full ${selectedAsset.trademarkRiskScore === "low" ? "bg-emerald-400" : "bg-red-400"}`} />
                      <span className="text-xs font-black uppercase tracking-wider">{selectedAsset.trademarkRiskScore}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rights & Platform Policy Audit */}
              <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  Rights & Policy Audit
                </span>

                <div className="text-[10px] space-y-2 text-white/70 font-semibold leading-relaxed">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>著名ブランド・有名キャラクター・肖像権の侵害はありません。 (Verified Safe)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>各プラットフォーム (BASE/BOOTH/Canva) のAI生成物掲載ガイドラインに適合しています。</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>公序良俗・性的/暴力的表現規約をパスしています。</span>
                  </div>
                </div>
              </div>

              {/* Action Operations controls */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => updateStatus(selectedAsset.id, "approved")}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Approve Asset
                </button>
                
                <button
                  onClick={() => updateStatus(selectedAsset.id, "rejected")}
                  className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/10 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject/Deny
                </button>
              </div>

            </div>
          </div>

        </div>
      )}

      {activeTab === "generate" && (
        <div className="max-w-3xl mx-auto glass-card border-white/5 p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute inset-0 bg-purple-500/5 pointer-events-none" />
          
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight">Create AI Image Generation Job</h3>
              <p className="text-xs text-secondary">Initiate batch transparent PNG generation pipelines with smart prompt weighting</p>
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
                <span className="text-[11px] font-black uppercase tracking-wider text-secondary">
                  Auto-Transparency (rembg)
                </span>
                <div className="w-10 h-6 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-end px-1 cursor-pointer">
                  <div className="w-4 h-4 bg-purple-400 rounded-full" />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-secondary">
                  Pinterest OGP Optimizer (2:3)
                </span>
                <div className="w-10 h-6 bg-purple-500/20 border border-purple-500/30 rounded-full flex items-center justify-end px-1 cursor-pointer">
                  <div className="w-4 h-4 bg-purple-400 rounded-full" />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-ai-gradient py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
              <Plus className="w-4 h-4" />
              Enqueue Production Generation Job
            </button>
          </form>
        </div>
      )}

      {activeTab === "keywords" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-md font-black uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              SEO Keywords Search Radar & Gaps Analysis
            </h2>
            <span className="text-[10px] text-cyan-400 font-black bg-cyan-500/5 border border-cyan-500/10 px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
              AI Market Watch Sync: Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Radar list */}
            <div className="glass-card border-white/5 p-6 rounded-3xl space-y-4">
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
                          MISSING GAP (PROMPT AI NOW)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right AI recommendations */}
            <div className="glass-card border-purple-500/10 p-6 rounded-3xl space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-purple-500/5 pointer-events-none" />
              <h3 className="text-sm font-black uppercase tracking-wider text-purple-300">AI Suggested Generated Themes</h3>
              
              <div className="space-y-4 text-xs font-semibold leading-relaxed text-white/70">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    <span className="font-black text-white uppercase tracking-wider">日本の食 / 和食惣菜シリーズ</span>
                  </div>
                  <p className="text-[11px] text-secondary">
                    「おにぎり デコ」「屋台焼きそば 透過」「抹茶パフェ 和風」などのキーワードの検索数が過去1週間で +120% 急上昇していますが、該当する高品質素材が圧倒的に不足しています。
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="font-black text-white uppercase tracking-wider">年中行事 / お祭りネオン装飾</span>
                  </div>
                  <p className="text-[11px] text-secondary">
                    「提灯 祭り 赤」「鳥居 夜景 ネオン」のダウンロード率が驚異の 48% を突破。夏祭りシーズンに向け、さらにバリエーションを100枚追加生成することを推奨します。
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
