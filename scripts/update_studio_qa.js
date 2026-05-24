const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/admin/studio/page.tsx');
let code = fs.readFileSync(filePath, 'utf-8');

// Update mapDbAssetToAsset
code = code.replace(
  `seoScore: dbAsset.seo_score,`,
  `seoScore: dbAsset.seo_score,
    visionScore: dbAsset.vision_score,
    commercialScore: dbAsset.commercial_score,
    qualityFlags: dbAsset.quality_flags || [],
    lowQualityReason: dbAsset.low_quality_reason,
    visionLastCheckedAt: dbAsset.vision_last_checked_at,
    qaStatus: dbAsset.qa_status,`
);

// We need to add the QA API call function to the component
code = code.replace(
  `const updateStatus = async (id: string, newStatus: "approved" | "pending" | "rejected") => {`,
  `const runQAAudit = async (assetId: string) => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/qa-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);

      alert(\`✅ Vision QA 完了\\nVision: \${data.qaResult.visionScore}\\nCommercial: \${data.qaResult.commercialScore}\\nSEO: \${data.qaResult.seoScore}\\n\${data.autoPended ? '⚠️ 低品質のため自動で確認待ちに変更されました。' : ''}\`);
      
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

    } catch (e: any) {
      console.error(e);
      alert(\`❌ QA監査失敗: \${e.message}\`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: "approved" | "pending" | "rejected") => {`
);

// Update Asset Grid Card to show QA badge if present
code = code.replace(
  `{asset.seoScore !== undefined && (`,
  `{asset.visionScore !== undefined && (
                      <div className="absolute top-2 left-20 z-20">
                        <span className={\`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border \${
                          asset.visionScore >= 70 ? "bg-purple-500/20 text-purple-300 border-purple-500/30" :
                          asset.visionScore >= 40 ? "bg-amber-500/20 text-amber-300 border-amber-500/30" :
                          "bg-red-500/20 text-red-300 border-red-500/30"
                        }\`}>
                          QA: {asset.visionScore}
                        </span>
                      </div>
                    )}

                    {asset.seoScore !== undefined && (`
);

// Add Vision QA block to detailed panel
code = code.replace(
  `{/* Quality Scoring */}`,
  `{/* Vision Commercial QA OS Studio */}
                <div className="border-t border-white/5 pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" /> Vision QA OS
                    </span>
                    <button
                      onClick={() => runQAAudit(selectedAsset.id)}
                      className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 px-3 py-1 rounded text-[9px] font-bold uppercase transition-colors"
                    >
                      AI監査を実行
                    </button>
                  </div>

                  {selectedAsset.visionScore !== undefined ? (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center relative overflow-hidden">
                        {selectedAsset.visionScore < 30 && <div className="absolute inset-0 bg-red-500/10" />}
                        <span className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Vision QA</span>
                        <span className={\`text-lg font-black \${selectedAsset.visionScore >= 70 ? 'text-emerald-400' : selectedAsset.visionScore >= 40 ? 'text-amber-400' : 'text-red-400'}\`}>
                          {selectedAsset.visionScore}<span className="text-[10px] text-zinc-500">/100</span>
                        </span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center relative overflow-hidden">
                        {selectedAsset.commercialScore !== undefined && selectedAsset.commercialScore < 30 && <div className="absolute inset-0 bg-red-500/10" />}
                        <span className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">Commercial</span>
                        <span className={\`text-lg font-black \${(selectedAsset.commercialScore || 0) >= 70 ? 'text-emerald-400' : (selectedAsset.commercialScore || 0) >= 40 ? 'text-amber-400' : 'text-red-400'}\`}>
                          {selectedAsset.commercialScore || '-'}<span className="text-[10px] text-zinc-500">/100</span>
                        </span>
                      </div>
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                        <span className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">SEO & Util</span>
                        <span className="text-lg font-black text-cyan-400">
                          {selectedAsset.seoScore || '-'}<span className="text-[10px] text-zinc-500">/100</span>
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-zinc-500 bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                      未監査 (AI監査を実行してください)
                    </div>
                  )}

                  {/* Danger Flags & Reasons */}
                  {selectedAsset.qualityFlags && selectedAsset.qualityFlags.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {selectedAsset.qualityFlags.map((flag, idx) => (
                          <span key={idx} className="bg-red-500/20 text-red-400 border border-red-500/20 text-[9px] font-bold px-2 py-0.5 rounded">
                            {flag}
                          </span>
                        ))}
                      </div>
                      {selectedAsset.lowQualityReason && (
                        <p className="text-[10px] text-red-300/80 bg-red-500/5 p-2 rounded-lg border border-red-500/10 leading-relaxed font-semibold">
                          {selectedAsset.lowQualityReason}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Quality Scoring */}`
);

fs.writeFileSync(filePath, code);
console.log('Script completed.');
