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
  Bot
} from "lucide-react";

export default function GrowthEnginePage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    approvedTotal: 0,
    generatedToday: 0,
    qaFailedToday: 0,
    pinterestWaiting: 0,
    generatingNow: 0
  });
  const [aiPlan, setAiPlan] = useState<any>(null);
  const [trends, setTrends] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        
        // 1. Total Approved
        const { count: approvedCount } = await supabase
          .from('assets')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'approved');

        // 2. Generated Today (count jobs completed today)
        const { count: generatedToday } = await supabase
          .from('generation_jobs')
          .select('*', { count: 'exact', head: true })
          .gte('completed_at', `${todayStr}T00:00:00Z`);

        // 3. QA Failed Today
        const { count: qaFailed } = await supabase
          .from('generation_jobs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'qa_failed')
          .gte('completed_at', `${todayStr}T00:00:00Z`);

        // 4. Pinterest Waiting
        const { count: pinWaiting } = await supabase
          .from('pinterest_posts')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'draft');

        // 5. Generating Now
        const { count: generatingNow } = await supabase
          .from('generation_jobs')
          .select('*', { count: 'exact', head: true })
          .in('status', ['processing', 'queued']);

        setStats({
          approvedTotal: approvedCount || 0,
          generatedToday: generatedToday || 0,
          qaFailedToday: qaFailed || 0,
          pinterestWaiting: pinWaiting || 0,
          generatingNow: generatingNow || 0
        });

        // Fetch AI Plan for tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        
        const { data: planData } = await supabase
          .from('daily_ai_plans')
          .select('*')
          .eq('date', tomorrowStr)
          .single();
        
        if (planData) setAiPlan(planData);

        // Fetch top trends
        const { data: topTrends } = await supabase
          .from('trend_hunts')
          .select('*')
          .order('demand_score', { ascending: false })
          .limit(10);
        
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
    alert("Triggering Master Growth Engine manually...");
    await fetch('/api/cron/growth-engine', {
      method: 'GET',
      headers: { 'authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}` }
    });
    alert("Cycle initiated in background.");
  };

  const targetCount = 1000;
  const remaining = Math.max(0, targetCount - stats.approvedTotal);
  const dailyTarget = 30; // Usually from settings
  const estimatedDays = Math.ceil(remaining / dailyTarget);

  if (loading) {
    return <div className="p-8 text-white">Loading Growth Engine Core...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            Growth Engine OS
          </h1>
          <p className="text-secondary mt-2 text-sm max-w-2xl">
            Autonomous self-evolving asset factory. AI handles demand hunting, generation, QA, SEO optimization, and social distribution.
          </p>
        </div>
        <button 
          onClick={triggerEngine}
          className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 px-6 py-2 rounded-xl text-sm font-bold uppercase hover:bg-emerald-500/30 transition-colors"
        >
          Force Manual Cycle
        </button>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center gap-3 text-secondary mb-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Generating Now</span>
          </div>
          <div className="text-3xl font-black">{stats.generatingNow}</div>
        </div>

        <div className="glass-card border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center gap-3 text-secondary mb-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Generated Today</span>
          </div>
          <div className="text-3xl font-black">{stats.generatedToday}</div>
        </div>

        <div className="glass-card border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center gap-3 text-secondary mb-3">
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-xs font-bold uppercase tracking-wider">QA Failed Today</span>
          </div>
          <div className="text-3xl font-black">{stats.qaFailedToday}</div>
        </div>

        <div className="glass-card border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center gap-3 text-secondary mb-3">
            <ImageIcon className="w-5 h-5 text-pink-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Pinterest Waiting</span>
          </div>
          <div className="text-3xl font-black">{stats.pinterestWaiting}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Scaling Goal */}
        <div className="glass-card border border-white/5 p-6 rounded-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <TrendingUp className="w-32 h-32 text-emerald-400" />
          </div>
          <div className="flex items-center gap-3 text-secondary">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Scaling Target (10,000 Milestone)</span>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-white font-bold">{stats.approvedTotal} / {targetCount}</span>
              <span className="text-secondary">{Math.round((stats.approvedTotal / targetCount) * 100)}%</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                style={{ width: `${Math.min(100, (stats.approvedTotal / targetCount) * 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
            <div>
              <div className="text-xs text-secondary uppercase tracking-wider mb-1">Remaining</div>
              <div className="text-xl font-black">{remaining} assets</div>
            </div>
            <div>
              <div className="text-xs text-secondary uppercase tracking-wider mb-1">Est. Completion</div>
              <div className="text-xl font-black text-emerald-400">~{estimatedDays} Days</div>
            </div>
          </div>
        </div>

        {/* AI Tomorrow Plan */}
        <div className="glass-card border border-white/5 p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-3 text-secondary">
            <Bot className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider">AI Tomorrow's Plan</span>
          </div>

          {aiPlan ? (
            <div className="space-y-4">
              <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-sm leading-relaxed text-cyan-50">
                {aiPlan.ai_reasoning}
              </div>
              <div className="flex flex-wrap gap-2">
                {aiPlan.planned_categories?.map((cat: string, i: number) => (
                  <span key={i} className="px-3 py-1 bg-white/10 text-xs font-bold rounded-lg uppercase tracking-wider text-white">
                    {cat}
                  </span>
                ))}
              </div>
              <div className="text-xs text-secondary uppercase tracking-wider pt-2 border-t border-white/5">
                Target Generation: <span className="text-white font-bold">{aiPlan.target_generation_count} assets</span>
              </div>
            </div>
          ) : (
            <div className="text-sm text-secondary">
              No plan generated yet. The Planner engine runs nightly.
            </div>
          )}
        </div>

        {/* Top Trends */}
        <div className="glass-card border border-white/5 p-6 rounded-2xl col-span-1 lg:col-span-2">
          <div className="flex items-center gap-3 text-secondary mb-6">
            <Calendar className="w-5 h-5 text-orange-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Trend Hunter Queue</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-secondary border-b border-white/5">
                <tr>
                  <th className="pb-3 font-bold">Keyword</th>
                  <th className="pb-3 font-bold">Category</th>
                  <th className="pb-3 font-bold text-right">Demand Score</th>
                  <th className="pb-3 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white/80">
                {trends.length > 0 ? trends.map((t) => (
                  <tr key={t.id} className="hover:bg-white/[0.02]">
                    <td className="py-3 font-bold text-white">{t.keyword}</td>
                    <td className="py-3">{t.category}</td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        t.demand_score >= 80 ? 'bg-orange-500/20 text-orange-400' : 'bg-white/10'
                      }`}>
                        {t.demand_score}
                      </span>
                    </td>
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
                    <td colSpan={4} className="py-4 text-center text-secondary text-xs">No active trends found</td>
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
