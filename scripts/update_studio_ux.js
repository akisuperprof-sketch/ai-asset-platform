const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/app/admin/studio/page.tsx');
let code = fs.readFileSync(filePath, 'utf-8');

// 1. Update updateStatus
code = code.replace(
  `  const updateStatus = async (id: string, newStatus: "approved" | "pending" | "rejected") => {`,
  `  const updateStatus = async (id: string, newStatus: "approved" | "pending" | "rejected") => {
    if (newStatus !== "approved") {
      const msg = newStatus === "rejected" ? "この素材を公開停止（却下）しますか？公開サイトに表示されなくなります。" : "この素材を確認待ちに戻しますか？公開サイトに表示されなくなります。";
      if (!window.confirm(msg)) return;
    }
`
);

// 2. Add getLowQualityReasons
code = code.replace(
  `  const filteredAssets = localAssets.filter(asset => {`,
  `  const getLowQualityReasons = (asset: Asset) => {
    const text = (asset.title + " " + asset.tags.join(" ")).toLowerCase();
    const reasons = [];
    if (text.includes("star") || text.includes("星")) reasons.push("タイトル/タグに星(star)を含む");
    if (text.includes("circle") || text.includes("丸")) reasons.push("タイトル/タグに丸(circle)を含む");
    if (text.includes("abstract") || text.includes("抽象")) reasons.push("抽象図形の疑い");
    if (text.includes("monochrome") || text.includes("単色")) reasons.push("単色の疑い");
    if (text.includes("low_quality") || text.includes("幾何") || text.includes("図形")) reasons.push("幾何/図形/低品質タグを含む");
    return reasons;
  };

  const filteredAssets = localAssets.filter(asset => {`
);

// 3. Top Banner OS Head
code = code.replace(
  /<div className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-widest mb-1.5">[\s\S]*?STUDIO WORKSPACE OS\n\s*<\/h1>\n\s*<\/div>/,
  `<div className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            AI素材工場コンソール
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            スタジオ管理OS
          </h1>
          <p className="text-xs text-zinc-400 mt-2 max-w-xl leading-relaxed">
            公開中素材・確認待ち素材・低品質疑い素材を確認し、公開停止や確認待ち戻しを行う管理画面です。
          </p>
        </div>`
);

// 4. Tabs
code = code.replace(
  />\n\s*Dashboard\n\s*<\/button>/,
  ` title="素材全体の状態を確認します">\n            ダッシュボード\n          </button>`
);
code = code.replace(
  />\n\s*Create Gen Job\n\s*<\/button>/,
  ` title="新しい素材生成を予約します">\n            生成ジョブ作成\n          </button>`
);
code = code.replace(
  />\n\s*Keyword Radar\n\s*<\/button>/,
  ` title="ユーザー検索ワードから不足素材を確認します">\n            検索需要レーダー\n          </button>`
);

// 5. KPIs & Operations Guide
code = code.replace(
  `{/* KPI METRICS WIDGETS */}`,
  `      {/* OPERATIONS GUIDE */}
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

      {/* KPI METRICS WIDGETS */}`
);

// 6. KPI Texts
code = code.replace(
  `DB全素材数</span>\n          <h3 className="text-2xl font-black tracking-tight">{kpis.totalAssets}</h3>\n          <span className="text-[8px] text-purple-400 font-bold block mt-1 tracking-wider">TOTAL ASSETS IN DB</span>`,
  `DB全素材数</span>\n          <h3 className="text-2xl font-black tracking-tight">{isLoading ? "取得中" : kpis.totalAssets}</h3>\n          <span className="text-[10px] text-zinc-400 font-bold block mt-2">Supabaseのassetsテーブルに登録されている全素材数です。</span>`
);
code = code.replace(
  `公開中</span>\n          <h3 className="text-2xl font-black tracking-tight">{kpis.published}</h3>\n          <span className="text-[8px] text-emerald-500/80 font-bold block mt-1 tracking-wider">APPROVED & LIVE</span>`,
  `公開中</span>\n          <h3 className="text-2xl font-black tracking-tight">{isLoading ? "取得中" : kpis.published}</h3>\n          <span className="text-[10px] text-emerald-500/80 font-bold block mt-2">現在、公開サイトに表示される素材数です。</span>`
);
code = code.replace(
  `確認待ち</span>\n          <h3 className="text-2xl font-black tracking-tight">{kpis.pendingReview}</h3>\n          <span className="text-[8px] text-amber-500/80 font-bold block mt-1 tracking-wider">PENDING REVIEW</span>`,
  `確認待ち</span>\n          <h3 className="text-2xl font-black tracking-tight">{isLoading ? "取得中" : kpis.pendingReview}</h3>\n          <span className="text-[10px] text-amber-500/80 font-bold block mt-2">まだ公開判断が必要な素材です。</span>`
);
code = code.replace(
  `却下</span>\n          <h3 className="text-2xl font-black tracking-tight">{kpis.rejected}</h3>\n          <span className="text-[8px] text-rose-500/80 font-bold block mt-1 tracking-wider">REJECTED</span>`,
  `却下</span>\n          <h3 className="text-2xl font-black tracking-tight">{isLoading ? "取得中" : kpis.rejected}</h3>\n          <span className="text-[10px] text-rose-500/80 font-bold block mt-2">品質・権利・用途の観点で公開しない素材です。</span>`
);
code = code.replace(
  `画像URL欠損</span>\n          <h3 className="text-2xl font-black tracking-tight">{kpis.missingImagesCount}</h3>\n          <span className="text-[8px] text-red-500/80 font-bold block mt-1 tracking-wider">MISSING URL OR STORAGE KEY</span>`,
  `画像URL欠損</span>\n          <h3 className="text-2xl font-black tracking-tight">{isLoading ? "取得中" : kpis.missingImagesCount}</h3>\n          <span className="text-[10px] text-red-500/80 font-bold block mt-2">画像が見つからない異常なデータです。</span>`
);
code = code.replace(
  `表示可能素材</span>\n          <h3 className="text-2xl font-black tracking-tight">{kpis.displayable}</h3>\n          <span className="text-[8px] text-emerald-500/80 font-bold block mt-1 tracking-wider">APPROVED & HAS IMAGE URL</span>`,
  `表示可能素材</span>\n          <h3 className="text-2xl font-black tracking-tight">{isLoading ? "取得中" : kpis.displayable}</h3>\n          <span className="text-[10px] text-emerald-500/80 font-bold block mt-2">公開中で画像URLが存在する安全な素材です。</span>`
);
code = code.replace(
  `本日生成</span>\n          <h3 className="text-2xl font-black tracking-tight">+{kpis.generatedToday}</h3>\n          <span className="text-[8px] text-cyan-500/80 font-bold block mt-1 tracking-wider">GENERATED TODAY</span>`,
  `本日生成</span>\n          <h3 className="text-2xl font-black tracking-tight">{isLoading ? "取得中" : \`+\${kpis.generatedToday}\`}</h3>\n          <span className="text-[10px] text-cyan-500/80 font-bold block mt-2">本日新しく登録された素材数です。</span>`
);

// 7. Auditor Strings
code = code.replace(
  `Real-Time Count Discrepancy Auditor (データ整合性監査システム)`,
  `件数整合性チェック`
);
code = code.replace(
  /<h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">[\s\S]*?<\/h3>/,
  `<h3 className="text-xs font-black text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Gauge className="w-4 h-4" />
          件数整合性チェック
        </h3>
        <p className="text-[10px] text-zinc-400 mb-6 -mt-2">
          DB、Storage、画面表示の件数にズレがないか確認します。
        </p>`
);

code = code.replace(/DB vs Storage Audit/g, `DBとStorageの差分確認`);
code = code.replace(/DB vs UI Display Audit/g, `DBと画面表示の差分確認`);
code = code.replace(/Today Added Dynamic Bind/g, `本日追加分の確認`);

code = code.replace(/>MATCHED</g, `>一致<`);
code = code.replace(/>MISMATCH</g, `>不一致<`);
code = code.replace(/>DISPLAY MISSING</g, `>不一致<`);
code = code.replace(/>SECURE</g, `>安全<`);

// 8. Grid Head
code = code.replace(
  `Asset Verification Pipeline Grid`,
  `素材品質確認一覧`
);
code = code.replace(
  /<h2 className="text-md font-black uppercase tracking-wider flex items-center gap-2">[\s\S]*?<\/h2>/,
  `<h2 className="text-md font-black uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                素材品質確認一覧
              </h2>
              <p className="text-[10px] text-zinc-400">
                各素材の画像・品質ランク・SEOスコア・公開状態を確認できます。低品質な素材は公開停止または確認待ちに戻してください。
              </p>`
);

// Low quality description
code = code.replace(
  /<button\n\s*onClick={\(\) => setShowLowQualityOnly\(!showLowQualityOnly\)}[\s\S]*?低品質疑い\n\s*<\/button>/,
  `<div className="flex flex-col gap-1 items-end">
                  <button
                    onClick={() => setShowLowQualityOnly(!showLowQualityOnly)}
                    className={\`px-3 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-colors border \${
                      showLowQualityOnly ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' : 'bg-zinc-900 text-zinc-400 border-white/5 hover:bg-zinc-800'
                    }\`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 inline-block mr-1" />
                    低品質疑い
                  </button>
                  <p className="text-[9px] text-amber-400/80 max-w-xs text-right leading-relaxed">
                    星・丸・単色・抽象図形など、商用素材として弱い可能性がある素材を自動抽出します。最終判断は目視で行ってください。
                  </p>
                </div>`
);

code = code.replace(
  `Filter by title, tag, ID...`,
  `タイトル・タグ・IDで検索`
);

// 9. Card Update
code = code.replace(
  `{asset.reviewStatus === "approved" && (
                        <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-emerald-500/25">
                          APPROVED
                        </span>
                      )}
                      {asset.reviewStatus === "pending" && (
                        <span className="bg-amber-500/20 text-amber-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-amber-500/25">
                          PENDING
                        </span>
                      )}
                      {asset.reviewStatus === "rejected" && (
                        <span className="bg-red-500/20 text-red-400 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border border-red-500/25">
                          REJECTED
                        </span>
                      )}`,
  `{asset.reviewStatus === "approved" && (
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
                      )}`
);

code = code.replace(
  `{asset.qualityRank} RANK`,
  `{asset.qualityRank}ランク`
);

code = code.replace(
  `SEO: {asset.seoScore}`,
  `SEOスコア: {asset.seoScore}`
);

// Insert buttons below thumbnail and reasons
code = code.replace(
  `<h4 className="text-[11px] font-black text-white truncate">{asset.title}</h4>\n                  <div className="flex items-center justify-between text-[9px] text-white/50 mt-1 font-semibold">\n                    <span>{asset.category}</span>\n                    <span>{asset.fileSize}</span>\n                  </div>\n                </div>`,
  `<h4 className="text-[11px] font-black text-white truncate">{asset.title}</h4>
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
                </div>`
);

// Update details panel buttons
code = code.replace(
  `Approve Live`,
  `公開する`
);
code = code.replace(
  `Reject / Quarantine`,
  `公開停止 / 却下`
);

fs.writeFileSync(filePath, code);
console.log('Script completed.');
