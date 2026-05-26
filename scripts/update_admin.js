const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '../src/app/admin/studio/page.tsx');
let content = fs.readFileSync(file, 'utf-8');

const newAuditCode = `                {/* Premium QA Audit Status */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                  <span className="text-[10px] font-black text-ai-cyan uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Premium QA Audit OS
                  </span>

                  <div className="text-[10px] space-y-2 text-zinc-400 font-semibold leading-relaxed">
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">✓</span> 用途が明確
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">✓</span> Canva利用可能
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">✓</span> Pinterest向き
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">✓</span> 高品質透過
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">✓</span> AI感が弱い
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">✓</span> Adobe Stock基準
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="w-4 h-4 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center">✓</span> 商用利用価値
                    </p>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                    <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Zap className="w-4 h-4" />
                      Vision QA Scores
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-black/50 p-2 rounded-lg border border-white/5 text-center">
                        <div className="text-white font-black text-xs">82</div>
                        <div className="text-[8px] text-zinc-500 uppercase mt-1">Vision QA</div>
                      </div>
                      <div className="bg-black/50 p-2 rounded-lg border border-white/5 text-center">
                        <div className="text-white font-black text-xs">91</div>
                        <div className="text-[8px] text-zinc-500 uppercase mt-1">Commercial</div>
                      </div>
                      <div className="bg-black/50 p-2 rounded-lg border border-white/5 text-center">
                        <div className="text-white font-black text-xs">74</div>
                        <div className="text-[8px] text-zinc-500 uppercase mt-1">SEO</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                    <span className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Flame className="w-4 h-4" />
                      危険フラグ
                    </span>
                    <ul className="list-disc pl-4 text-[10px] text-zinc-500 space-y-1">
                      <li>単色率高 (チェック対象)</li>
                      <li>用途不明 (チェック対象)</li>
                      <li>抽象図形疑い (チェック対象)</li>
                    </ul>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2">
                    <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase px-2 py-1 rounded">公開推奨</span>
                    <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase px-2 py-1 rounded">pending推奨</span>
                    <span className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase px-2 py-1 rounded">reject推奨</span>
                  </div>
                </div>`;

content = content.replace(
  `                {/* Rights Audit Status */}
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-3">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Rights & Policy Audit
                  </span>

                  <div className="text-[10px] space-y-2 text-zinc-400 font-semibold leading-relaxed">`,
  newAuditCode + `\n\n                <div className="text-[10px] space-y-2 text-zinc-400 font-semibold leading-relaxed hidden">`
);

fs.writeFileSync(file, content);
