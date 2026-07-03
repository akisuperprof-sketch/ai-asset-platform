"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Sparkles, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Image as ImageIcon,
  BarChart3,
  Bot,
  Activity,
  Target,
  Zap,
  Globe,
  Share2,
  Search,
  Power,
  PowerOff
} from "lucide-react";

export default function GrowthEnginePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    approvedTotal: 0,
    generatedToday: 0,
    generatedMonth: 0,
    qaFailedToday: 0,
    pinterestWaiting: 0,
    generatingNow: 0
  });
  const [scores, setScores] = useState({
    growth: 92,
    seo: 85,
    revenue: 78,
    trend: 95,
    factory: 90,
    pinterest: 72,
    index: 88,
    automation: 99
  });
  const [aiPlan, setAiPlan] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({ is_enabled: true, daily_target: 10 });
  const [lastRun, setLastRun] = useState<any>(null);
  const [recentRuns, setRecentRuns] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const monthStart = new Date();
        monthStart.setDate(1);
        const monthStartStr = monthStart.toISOString().split('T')[0];
        
        // Total Approved
        const { count: approvedCount } = await supabase
          .from('assets')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');

        // Generated Today
        const { count: generatedToday } = await supabase
          .from('generation_jobs')
          .select('*', { count: 'exact', head: true })
          .gte('completed_at', `${todayStr}T00:00:00Z`);

        // Generated This Month
        const { count: generatedMonth } = await supabase
          .from('generation_jobs')
          .select('*', { count: 'exact', head: true })
          .gte('completed_at', `${monthStartStr}T00:00:00Z`);

        const { count: qaFailed } = await supabase
          .from('generation_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'qa_failed')
          .gte('completed_at', `${todayStr}T00:00:00Z`);

        const { count: pinWaiting } = await supabase
          .from('pinterest_posts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'draft');

        const { count: generatingNow } = await supabase
          .from('generation_jobs')
          .select('*', { count: 'exact', head: true })
          .in('status', ['processing', 'queued']);

        setStats({
          approvedTotal: approvedCount || 0,
          generatedToday: generatedToday || 0,
          generatedMonth: generatedMonth || 0,
          qaFailedToday: qaFailed || 0,
          pinterestWaiting: pinWaiting || 0,
          generatingNow: generatingNow || 0
        });

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        const { data: planData } = await supabase
          .from('daily_ai_plans')
          .select('*')
          .eq('date', tomorrowStr)
          .single();
        
        if (planData) setAiPlan(planData);

        const { data: topTrends } = await supabase
          .from('trend_hunts')
          .select('*')
          .order('demand_score', { ascending: false })
          .limit(5);
        
        if (topTrends) setTrends(topTrends);

        // Fetch settings
        const { data: setts } = await supabase.from('auto_factory_settings').select('*').eq('id', 'default').single();
        if (setts) setSettings(setts);

        // Fetch last run
        const { data: runs } = await supabase.from('growth_engine_runs').select('*').order('started_at', { ascending: false }).limit(5);
        if (runs && runs.length > 0) {
          setLastRun(runs[0]);
          setRecentRuns(runs);
        }

      } catch (err) {
        console.error('Failed to fetch growth stats', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const triggerEngine = async () => {
    alert("Triggering V2 Master Growth Engine manually...");
    await fetch('/api/cron/growth-engine-v2', {
      method: 'GET',
      headers: { 'authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}` }
    });
    alert("V2 Cycle initiated in background.");
  };

  const toggleEmergencyStop = async () => {
    const newState = !settings.is_enabled;
    const { error } = await supabase.from('auto_factory_settings').update({ is_enabled: newState }).eq('id', 'default');
    if (!error) {
      setSettings({ ...settings, is_enabled: newState });
    }
  };

  const currentTotal = stats.approvedTotal;
  const dailyTarget = settings.daily_target || 10;
  
  const getProgress = (target: number) => {
    const rem = Math.max(0, target - currentTotal);
    const est = Math.ceil(rem / dailyTarget);
    return { remaining: rem, estimatedDays: est, percent: Math.min(100, (currentTotal / target) * 100) };
  };

  const p1000 = getProgress(1000);
  const p3000 = getProgress(3000);
  const p10000 = getProgress(10000);

  if (loading) {
    return <div className="p-8 text-white">Loading Growth Engine V2 Core...</div>;
  }

  const ScoreCard = ({ title, score, icon: Icon, color }: any) => (
    <div className="glass-card border border-white/5 p-4 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="text-xs font-bold uppercase text-secondary">{title}</span>
      </div>
      <div className="text-xl font-black text-white">{score}</div>
    </div>
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Growth Engine V2
          </h1>
          <p className="text-secondary mt-2 text-sm max-w-2xl">
            Self Growing AI Company OS. Autonomous analysis, execution, and strategy.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleEmergencyStop}
            className={`flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold uppercase transition-colors ${
              settings.is_enabled 
                ? 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30' 
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30'
            }`}
          >
            {settings.is_enabled ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
            {settings.is_enabled ? 'Emergency Stop' : 'Resume Engine'}
          </button>
          <button 
            onClick={triggerEngine}
            className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 px-6 py-2 rounded-xl text-sm font-bold uppercase hover:bg-cyan-500/30 transition-colors"
          >
            Force Manual Cycle
          </button>
        </div>
      </div>

      {/* AI Company Scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ScoreCard title="Growth" score={scores.growth} icon={TrendingUp} color="bg-emerald-500" />
        <ScoreCard title="SEO" score={scores.seo} icon={Search} color="bg-blue-500" />
        <ScoreCard title="Revenue" score={scores.revenue} icon={BarChart3} color="bg-yellow-500" />
        <ScoreCard title="Factory" score={scores.factory} icon={Bot} color="bg-purple-500" />
        <ScoreCard title="Index" score={scores.index} icon={Globe} color="bg-cyan-500" />
        <ScoreCard title="Pinterest" score={scores.pinterest} icon={Share2} color="bg-pink-500" />
        <ScoreCard title="Trend" score={scores.trend} icon={Activity} color="bg-orange-500" />
        <ScoreCard title="Automation" score={scores.automation} icon={Zap} color="bg-indigo-500" />
      </div>

      {/* Run Status & Target */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card border border-white/5 p-4 rounded-xl">
          <div className="text-[10px] uppercase text-secondary font-bold mb-1">Engine Status</div>
          <div className={`text-lg font-black flex items-center gap-2 ${settings.is_enabled ? 'text-emerald-400' : 'text-red-400'}`}>
            {settings.is_enabled ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {settings.is_enabled ? 'ACTIVE & AUTONOMOUS' : 'STOPPED (EMERGENCY)'}
          </div>
        </div>
        <div className="glass-card border border-white/5 p-4 rounded-xl">
          <div className="text-[10px] uppercase text-secondary font-bold mb-1">Daily Target (Assets)</div>
          <div className="text-lg font-black text-cyan-400">{dailyTarget} / Day</div>
        </div>
        <div className="glass-card border border-white/5 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="text-[10px] uppercase text-secondary font-bold mb-1">Last Run Status</div>
            <div className="text-lg font-black text-white">
              {lastRun ? (
                <span className={lastRun.status === 'success' ? 'text-emerald-400' : lastRun.status === 'running' ? 'text-blue-400' : 'text-red-400'}>
                  {lastRun.status.toUpperCase()} ({lastRun.duration_seconds || 0}s)
                </span>
              ) : 'NO RUNS YET'}
            </div>
            <div className="text-[10px] text-secondary mt-1">
              {lastRun ? new Date(lastRun.started_at).toLocaleString() : '-'}
            </div>
          </div>
          {lastRun?.status === 'failed' && lastRun.errors && (
            <div className="mt-2 text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20 break-all">
              {lastRun.errors.message || JSON.stringify(lastRun.errors)}
            </div>
          )}
        </div>
      </div>

      {/* Recent Engine Runs Timeline */}
      <div className="glass-card border border-white/5 p-6 rounded-2xl">
        <div className="flex items-center gap-3 text-secondary mb-6">
          <Bot className="w-5 h-5 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider">Recent Runs History</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-wider text-secondary border-b border-white/5">
              <tr>
                <th className="pb-3 font-bold">Time</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold">Duration</th>
                <th className="pb-3 font-bold">Approved</th>
                <th className="pb-3 font-bold text-red-400">QA Failed</th>
                <th className="pb-3 font-bold">Revenue/CEO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-white/80">
              {recentRuns.length > 0 ? recentRuns.map((r) => (
                <tr key={r.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 text-xs">{new Date(r.started_at).toLocaleString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      r.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 
                      r.status === 'running' ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono text-xs">{r.duration_seconds ? `${r.duration_seconds}s` : '-'}</td>
                  <td className="py-3 font-bold text-emerald-400">+{r.approved_count || 0}</td>
                  <td className="py-3 font-bold text-red-400">{r.qa_failed_count || 0}</td>
                  <td className="py-3">
                    <div className="flex gap-2">
                      <span className={`w-2 h-2 rounded-full ${r.revenue_analysis_created ? 'bg-yellow-400' : 'bg-white/20'}`} title="Revenue Analysis"></span>
                      <span className={`w-2 h-2 rounded-full ${r.ceo_report_created ? 'bg-indigo-400' : 'bg-white/20'}`} title="CEO Report"></span>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-secondary text-xs">No runs recorded</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Scaling Goal Matrix */}
        <div className="glass-card border border-white/5 p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-3 text-secondary">
            <Target className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Factory Goals Matrix</span>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b border-white/5">
            <div>
              <div className="text-[10px] text-secondary uppercase mb-1">Current Assets</div>
              <div className="text-2xl font-black">{currentTotal}</div>
            </div>
            <div>
              <div className="text-[10px] text-secondary uppercase mb-1">Approved Today</div>
              <div className="text-2xl font-black text-emerald-400">{lastRun?.approved_count || 0}</div>
            </div>
            <div>
              <div className="text-[10px] text-secondary uppercase mb-1">QA Failed Today</div>
              <div className="text-2xl font-black text-red-400">{lastRun?.qa_failed_count || 0}</div>
            </div>
          </div>

          {[
            { label: 'Phase 1: 1,000 Assets', p: p1000 },
            { label: 'Phase 2: 3,000 Assets', p: p3000 },
            { label: 'Phase 3: 10,000 Assets', p: p10000 },
          ].map((goal, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white font-bold">{goal.label}</span>
                <span className="text-secondary">{Math.round(goal.p.percent)}% (Rem: {goal.p.remaining})</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                  style={{ width: `${goal.p.percent}%` }}
                />
              </div>
              <div className="text-[10px] text-emerald-400/70 text-right uppercase tracking-wider">
                Est. Completion: {goal.p.estimatedDays} Days
              </div>
            </div>
          ))}
        </div>

        {/* Top Trends */}
        <div className="glass-card border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center gap-3 text-secondary mb-6">
            <Calendar className="w-5 h-5 text-orange-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Trend Hunter Real-time</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-secondary border-b border-white/5">
                <tr>
                  <th className="pb-3 font-bold">Keyword</th>
                  <th className="pb-3 font-bold text-right">Score</th>
                  <th className="pb-3 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {trends.length > 0 ? trends.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 font-bold text-white">{t.keyword}</td>
                    <td className="py-3 text-right text-orange-400 font-bold">{t.demand_score}</td>
                    <td className="py-3 text-right">
                      {t.is_processed ? (
                        <span className="text-emerald-400 text-xs font-bold">Processed</span>
                      ) : (
                        <span className="text-secondary text-xs">Waiting</span>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-secondary text-xs">No active trends found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
