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
  Share2
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

  const currentTotal = stats.approvedTotal;
  const dailyTarget = 30;
  
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
        <button 
          onClick={triggerEngine}
          className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 px-6 py-2 rounded-xl text-sm font-bold uppercase hover:bg-emerald-500/30 transition-colors"
        >
          Force Manual Cycle
        </button>
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
              <div className="text-[10px] text-secondary uppercase mb-1">Generated Today</div>
              <div className="text-2xl font-black text-emerald-400">{stats.generatedToday}</div>
            </div>
            <div>
              <div className="text-[10px] text-secondary uppercase mb-1">Generated This Month</div>
              <div className="text-2xl font-black text-cyan-400">{stats.generatedMonth}</div>
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
