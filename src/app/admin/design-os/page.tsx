import React from 'react';
import { runDesignAudit } from '@/design/design-audit';
import { DESIGN_TOKENS } from '@/design/tokens';
import path from 'path';

// Force dynamic since it reads from filesystem
export const dynamic = 'force-dynamic';

export default function DesignOsMonitorPage() {
  const targetDir = path.resolve(process.cwd(), 'src');
  const auditResults = runDesignAudit(targetDir);
  
  const totalViolations = auditResults.reduce((acc, curr) => acc + curr.violations.length, 0);
  const maxScore = 100;
  const consistencyScore = Math.max(0, maxScore - (totalViolations * 2));

  return (
    <div className={`min-h-screen ${DESIGN_TOKENS.colors.background} ${DESIGN_TOKENS.colors.textPrimary} p-8`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="border-b border-white/10 pb-6">
          <h1 className="text-3xl font-semibold tracking-tight">Design OS Monitor</h1>
          <p className="text-zinc-400 mt-2">Brand Consistency & Commercial Constraint Engine</p>
        </header>

        <section className={`p-6 ${DESIGN_TOKENS.colors.surface} ${DESIGN_TOKENS.radius.large} border border-white/10`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Consistency Score</h2>
              <p className="text-zinc-400 mt-1">Overall brand alignment based on static analysis</p>
            </div>
            <div className={`text-5xl font-bold ${consistencyScore >= 90 ? 'text-green-400' : 'text-red-400'}`}>
              {consistencyScore}
              <span className="text-2xl text-zinc-500">/100</span>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Audit Violations ({totalViolations} issues)</h2>
          {auditResults.length === 0 ? (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
              Perfect! No design violations found.
            </div>
          ) : (
            <div className="grid gap-4">
              {auditResults.map((result, i) => (
                <div key={i} className={`p-4 ${DESIGN_TOKENS.colors.surface} ${DESIGN_TOKENS.radius.base} border border-white/5`}>
                  <h3 className="font-mono text-sm text-zinc-300 break-all">{result.file.split(process.cwd())[1]}</h3>
                  <ul className="mt-2 space-y-1">
                    {result.violations.map((v, j) => (
                      <li key={j} className="text-sm text-red-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        {v}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
