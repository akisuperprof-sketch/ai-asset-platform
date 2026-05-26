const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/app/admin/studio/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add QA filter state
content = content.replace(
  /const \[searchQuery, setSearchQuery\] = useState\(""\);/,
  `const [searchQuery, setSearchQuery] = useState("");
  const [qaFilter, setQaFilter] = useState("all");`
);

// 2. Add dashboard stats
content = content.replace(
  /const kpis = getKpiStats\(\);/,
  `const kpis = getKpiStats();

  const qaStats = {
    untested: localAssets.filter(a => !a.qaCheckedAt).length,
    pendingRec: localAssets.filter(a => a.qaRecommendedAction === 'pending').length,
    rejectRec: localAssets.filter(a => a.qaRecommendedAction === 'reject').length,
    approveRec: localAssets.filter(a => a.qaRecommendedAction === 'approve').length,
    highPinterest: localAssets.filter(a => (a.pinterestScore || 0) >= 70).length
  };`
);

// 3. Update filteredAssets
content = content.replace(
  /const filteredAssets = localAssets\.filter\(asset => \{[\s\S]*?return matchSearch;\n  \}\);/,
  `const filteredAssets = localAssets.filter(asset => {
    const matchSearch = asset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      
    if (!matchSearch) return false;
    
    if (showLowQualityOnly && !isLowQuality(asset)) return false;

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
  });`
);

// 4. Update updateStatus
content = content.replace(
  /const updateStatus = async \(id: string, newStatus: "approved" \| "pending" \| "rejected"\) => \{[\s\S]*?alert\(\`✅ ステータスを更新しました.*?\n    \} catch \(e: any\) \{[\s\S]*?alert\(\`❌ ステータス更新失敗.*?\n    \}\n  \};/,
  `const updateStatus = async (id: string, newStatus: string) => {
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
      alert(\`❌ ステータス更新失敗: \${e.message}\`);
    }
  };`
);

// 5. Update updateRank
content = content.replace(
  /const updateRank = async \(id: string, newRank: "S" \| "A" \| "B" \| "C"\) => \{[\s\S]*?alert\(\`✅ ランクを.*?更新しました.*?\n    \} catch \(e: any\) \{[\s\S]*?alert\(\`❌ ランク更新失敗.*?\n    \}\n  \};/,
  `const updateRank = async (id: string, newRank: string) => {
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
      alert(\`❌ ランク更新失敗: \${e.message}\`);
    }
  };`
);

// 6. Inject Dashboard Tasks below Top Banner OS Head
content = content.replace(
  /\{\/\* Top Banner OS Head \*\/\}/,
  `{/* PHASE 7: Dashboard Tasks */}
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
      
      {/* Top Banner OS Head */}`
);

// 7. Inject QA Filters
content = content.replace(
  /<input\s+type="text"\s+placeholder="Search by title, category, tags, or ID\.\.\."/,
  `<select 
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-purple-500 mr-2"
                value={qaFilter}
                onChange={e => setQaFilter(e.target.value)}
              >
                <option value="all">QAフィルタ: すべて</option>
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
              <input 
                type="text" 
                placeholder="Search by title, category, tags, or ID..."`
);

// 8. Add Quality standard Reference Box
content = content.replace(
  /<div className="w-80 flex-shrink-0 flex flex-col gap-4">/,
  `<div className="w-80 flex-shrink-0 flex flex-col gap-4">
            
            {/* PHASE 9: Publish Quality Standard */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <h3 className="text-sm font-black mb-3 border-b border-white/10 pb-2">公開品質基準 (QA Standards)</h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-emerald-400 font-bold block mb-1">✅ 公開OK</span>
                  <ul className="text-zinc-400 list-disc pl-4 space-y-0.5">
                    <li>Commercial &gt;= 80</li>
                    <li>Adobe Stock &gt;= 75</li>
                    <li>AI Artifact &lt;= 30</li>
                    <li>用途が明確 / 透過品質が良い</li>
                  </ul>
                </div>
                <div>
                  <span className="text-amber-400 font-bold block mb-1">⚠️ pending推奨</span>
                  <ul className="text-zinc-400 list-disc pl-4 space-y-0.5">
                    <li>Commercial 60〜79</li>
                    <li>AI Artifact 31〜70</li>
                    <li>用途が弱い</li>
                  </ul>
                </div>
                <div>
                  <span className="text-red-400 font-bold block mb-1">❌ reject推奨</span>
                  <ul className="text-zinc-400 list-disc pl-4 space-y-0.5">
                    <li>Commercial &lt; 60</li>
                    <li>AI Artifact &gt; 70</li>
                    <li>単色/図形/抽象/煙のみ/用途不明</li>
                  </ul>
                </div>
              </div>
            </div>`
);

// 9. Update inline rank buttons (manual rank upgrades) in the selectedAsset view
content = content.replace(
  /\{\(\["S", "A", "B", "C"\] as const\)\.map\(\(r\) => \(/,
  `{(["S", "A", "B", "C", "D"] as const).map((r) => (`
);

// 10. Fix 1-click status updates inside card loop and detail panel
content = content.replace(
  /onClick=\{\(e\) => \{ e\.stopPropagation\(\); updateStatus\(asset\.id, 'pending'\); \}\}/g,
  `onClick={(e) => { e.stopPropagation(); updateStatus(asset.id, 'pending'); }}`
);

// Add "QA推奨に従う" button to the selectedAsset panel
content = content.replace(
  /<\/div>\n\n                  \{\/\* Manual Rank Upgrades \*\/\}/,
  `
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

                  {/* Manual Rank Upgrades */}`
);

fs.writeFileSync(file, content);
console.log('Patched page.tsx');
