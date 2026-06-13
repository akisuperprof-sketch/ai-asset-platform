"use client";

import React, { useEffect, useState } from 'react';
import { Search, TrendingUp, AlertTriangle } from 'lucide-react';

export default function KeywordsRadarPage() {
  const [queries, setQueries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [queueStatus, setQueueStatus] = useState<string | null>(null);
  const [isQueueing, setIsQueueing] = useState(false);

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const res = await fetch("/api/admin/demand-stats");
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "データ取得失敗");
        setQueries(json.data || []);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQueries();
  }, []);

  const handleQueue = async (items: any[]) => {
    if (isQueueing) return;
    setIsQueueing(true);
    setQueueStatus("Queueing...");
    
    try {
      const payload = items.map(q => ({
        query: q.keyword,
        normalized_query: q.keyword,
        priority_score: q.priorityScore
      }));

      const res = await fetch("/api/admin/generation-jobs/from-demand", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: payload })
      });
      
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Queue API Error");
      
      const summary = json.results.map((r: any) => `${r.query}: ${r.status}`).join('\n');
      setQueueStatus(`Success:\n${summary}`);
      setTimeout(() => setQueueStatus(null), 8000);
    } catch (e: any) {
      setQueueStatus(`Error: ${e.message}`);
    } finally {
      setIsQueueing(false);
    }
  };

  const queueTop = (limit: number) => {
    const topItems = queries.slice(0, limit);
    handleQueue(topItems);
  };

  const [workerStats, setWorkerStats] = useState({ queued: 0, processing: 0, passed: 0, failed: 0 });
  const [isWorking, setIsWorking] = useState(false);
  const [workerLogs, setWorkerLogs] = useState<string[]>([]);

  const fetchWorkerStats = async () => {
    try {
      const res = await fetch("/api/admin/generation-jobs/stats");
      const json = await res.json();
      if (json) {
        setWorkerStats({
          queued: json.globalQueued || 0,
          processing: json.globalProcessing || 0,
          passed: json.globalQaPassed || 0,
          failed: json.globalQaFailed || 0,
        });
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchWorkerStats();
    const interval = setInterval(fetchWorkerStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRunWorker = async (limit: number) => {
    if (isWorking) return;
    setIsWorking(true);
    const newLog = `Starting worker for ${limit} jobs...`;
    setWorkerLogs(prev => [newLog, ...prev].slice(0, 5));

    try {
      const res = await fetch("/api/admin/generation-jobs/run", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Worker API Error");
      
      const summary = json.results.map((r: any) => `[${r.keyword}] => ${r.status}`).join(' | ');
      setWorkerLogs(prev => [`Success: ${summary}`, ...prev].slice(0, 5));
      fetchWorkerStats();
    } catch (e: any) {
      setWorkerLogs(prev => [`Error: ${e.message}`, ...prev].slice(0, 5));
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <div className="p-8 space-y-8 font-sans bg-zinc-950 text-white min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-widest mb-1.5">
            <Search className="w-3.5 h-3.5" />
            Demand Engine
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-400">
            検索需要 & 0件検索レーダー
          </h1>
        </div>
      </div>
      
      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-bold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {errorMsg}
        </div>
      )}

      {queueStatus && (
        <div className="p-4 bg-zinc-900 border border-zinc-700 text-white rounded-xl text-xs font-mono whitespace-pre-wrap">
          {queueStatus}
        </div>
      )}

      {/* Generation Worker UI */}
      <div className="glass-card border border-white/5 rounded-3xl overflow-hidden bg-white/[0.01]">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-white">Generation Worker (Semi-Auto)</h2>
          </div>
          <div className="flex gap-2 text-xs font-bold font-mono">
            <div className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
              <span className="text-zinc-500">Queued:</span> <span className="text-white">{workerStats.queued}</span>
            </div>
            <div className="px-3 py-1.5 bg-blue-900/20 border border-blue-900/40 rounded-lg">
              <span className="text-blue-400">Processing:</span> <span className="text-white">{workerStats.processing}</span>
            </div>
            <div className="px-3 py-1.5 bg-emerald-900/20 border border-emerald-900/40 rounded-lg">
              <span className="text-emerald-400">QA Passed:</span> <span className="text-white">{workerStats.passed}</span>
            </div>
            <div className="px-3 py-1.5 bg-rose-900/20 border border-rose-900/40 rounded-lg">
              <span className="text-rose-400">QA Failed:</span> <span className="text-white">{workerStats.failed}</span>
            </div>
          </div>
        </div>
        <div className="p-6 bg-zinc-900/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-2">
            <button 
              onClick={() => handleRunWorker(1)}
              disabled={isWorking || workerStats.queued === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-black rounded-lg uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
              Run Next 1
            </button>
            <button 
              onClick={() => handleRunWorker(5)}
              disabled={isWorking || workerStats.queued === 0}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-600 disabled:opacity-50 text-white text-xs font-black rounded-lg uppercase tracking-widest transition-colors">
              Run Next 5
            </button>
            <button 
              onClick={() => handleRunWorker(10)}
              disabled={isWorking || workerStats.queued === 0}
              className="px-4 py-2 bg-blue-800 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black rounded-lg uppercase tracking-widest transition-colors">
              Run Next 10
            </button>
          </div>
          {workerLogs.length > 0 && (
            <div className="w-full md:w-1/2 text-[10px] font-mono text-zinc-400 max-h-20 overflow-y-auto space-y-1">
              {workerLogs.map((log, i) => <div key={i} className="truncate">{log}</div>)}
            </div>
          )}
        </div>
      </div>

      <div className="glass-card border border-white/5 rounded-3xl overflow-hidden bg-white/[0.01]">
        <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black text-white">Demand Priority Queue</h2>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => queueTop(5)}
              disabled={isQueueing || queries.length === 0}
              className="px-4 py-2 bg-ai-purple hover:bg-ai-purple/80 disabled:opacity-50 text-white text-xs font-black rounded-lg uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              上位5件をQueue
            </button>
            <button 
              onClick={() => queueTop(10)}
              disabled={isQueueing || queries.length === 0}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white text-xs font-black rounded-lg uppercase tracking-widest transition-colors">
              上位10件をQueue
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="text-[10px] uppercase tracking-widest text-zinc-500 bg-white/[0.02] border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-black">検索ワード</th>
                <th className="px-6 py-4 font-black text-center">Score (Priority)</th>
                <th className="px-6 py-4 font-black text-center">検索数</th>
                <th className="px-6 py-4 font-black text-center text-rose-400">0件(Gap)</th>
                <th className="px-6 py-4 font-black text-center text-emerald-400">推定CTR</th>
                <th className="px-6 py-4 font-black text-center text-cyan-400">推定DL率</th>
                <th className="px-6 py-4 font-black text-right text-amber-400">Rev推定</th>
                <th className="px-6 py-4 font-black text-right">アクション</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-zinc-500 font-bold">
                    読み込み中...
                  </td>
                </tr>
              ) : queries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-zinc-500 font-bold">
                    需要データがありません
                  </td>
                </tr>
              ) : (
                queries.map((q, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm text-white">{q.keyword}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-xs font-black ${
                        q.priorityScore >= 50 ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]' : 'bg-white/5 text-zinc-400'
                      }`}>
                        {q.priorityScore}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-zinc-300 font-bold">
                      {q.searchCount}
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-rose-400">
                      {q.zeroResultCount > 0 ? (
                        <span className="flex items-center justify-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> {q.zeroResultCount}
                        </span>
                      ) : (
                        <span className="text-zinc-600">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-emerald-400">
                      {q.estimatedCtr}%
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-cyan-400">
                      {q.estimatedDlRate}%
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-amber-400">
                      ¥{q.estimatedRevenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleQueue([q])}
                        disabled={isQueueing}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-white rounded-lg font-bold text-[10px] transition-colors">
                        Queue投入
                      </button>
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
