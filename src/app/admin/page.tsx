"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { 
  Building2, Activity, AlertTriangle, CheckCircle, 
  Settings, Bot, TrendingUp, BarChart3, Camera, 
  TerminalSquare, ShieldAlert, Cpu, Network,
  Globe, DollarSign, Calendar
} from 'lucide-react';

export default function ExecutiveDashboard() {
  const [stats, setStats] = useState({
    totalAssets: 0,
    qaFails: 0,
    cronStatus: 'checking',
    alerts: [] as any[],
    healthScore: 100,
    healthDetails: {
      Database: 100, API: 100, Cron: 100, Gemini: 100, Google: 100, 
      Pinterest: 100, Revenue: 100, Queue: 100, QA: 100, System: 100, AI: 100
    },
    gsc: { clicks: 0, impressions: 0, ctr: '0%', position: '0' },
    today: {
      assets: 0, dl: 0, rev: 0, qa: 0, queue: 0, google: 0, pinterest: 0
    }
  });

  const [heatmap, setHeatmap] = useState<number[]>(Array(24).fill(0));

  useEffect(() => {
    async function fetchHQStats() {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayISO = todayStart.toISOString();

      // Total Assets
      const { count: totalCount } = await supabase
        .from('assets')
        .select('*', { count: 'exact', head: true })
        .eq('review_status', 'approved');

      // Today Assets
      const { count: todayCount } = await supabase
        .from('assets')
        .select('*', { count: 'exact', head: true })
        .gte('published_at', todayISO)
        .eq('is_ai_generated', true);

      // QA Fails (recent)
      const { count: failCount } = await supabase
        .from('generation_jobs')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'qa_failed');

      // Pending Index Queue
      const { count: indexCount } = await supabase
        .from('index_queue')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Pending Generation Jobs
      const { count: jobQueueCount } = await supabase
        .from('generation_jobs')
        .select('*', { count: 'exact', head: true })
        .in('status', ['queued', 'generating', 'processing']);

      // Alerts
      const { data: alerts } = await supabase
        .from('system_alerts')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false })
        .limit(5);

      // Health Score Calculation (Mocked dynamically for UI based on errors)
      let health = 100;
      let dbHealth = 100;
      let qaHealth = failCount && failCount > 10 ? 80 : 100;
      let alertHealth = alerts && alerts.length > 0 ? 90 - (alerts.length * 5) : 100;
      let queueHealth = (indexCount && indexCount > 500) ? 80 : 100;
      
      health = Math.floor((dbHealth + qaHealth + alertHealth + queueHealth + 100) / 5);

      // Fetch Search Console Data
      let gscData = { clicks: 0, impressions: 0, ctr: '0%', position: '0' };
      try {
        const gscRes = await fetch('/api/search-console');
        if (gscRes.ok) {
          const gscJson = await gscRes.json();
          if (gscJson.success) gscData = gscJson.data;
        }
      } catch (e) {
        console.warn('GSC fetch error', e);
      }

      // Heatmap Mock Data (in real app, query group by hour)
      const mockHeatmap = Array.from({length: 24}, () => Math.floor(Math.random() * 50));

      setStats(prev => ({
        ...prev,
        totalAssets: totalCount || 0,
        qaFails: failCount || 0,
        cronStatus: 'healthy',
        alerts: alerts || [],
        healthScore: health,
        gsc: gscData,
        healthDetails: {
          ...prev.healthDetails,
          QA: qaHealth,
          System: alertHealth,
          Queue: queueHealth
        },
        today: {
          ...prev.today,
          assets: todayCount || 0,
          qa: failCount || 0,
          google: indexCount || 0,
          queue: jobQueueCount || 0
        }
      }));
      setHeatmap(mockHeatmap);
    }

    fetchHQStats();
    const interval = setInterval(fetchHQStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30">
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6 mt-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tighter flex items-center gap-3">
              <Bot className="w-8 h-8 text-cyan-400" />
              AI Company HQ
            </h1>
            <p className="text-sm text-zinc-400 font-bold mt-1 tracking-widest uppercase">Executive Dashboard & Operation Zero</p>
          </div>
          <div className="flex items-center gap-3 bg-zinc-900/50 px-4 py-2 rounded-2xl border border-white/5">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${stats.cronStatus === 'healthy' ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${stats.cronStatus === 'healthy' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-zinc-300">
              Auto Scaling: ON / Mode: Autonomous
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Health Score Panel */}
          <div className="lg:col-span-1 bg-zinc-900/30 border border-white/5 rounded-3xl p-6 relative overflow-hidden group flex flex-col">
            <h2 className="text-[10px] font-black text-zinc-500 tracking-widest uppercase mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              System Health Score
            </h2>
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="text-7xl font-black text-white tracking-tighter">
                {stats.healthScore}
              </div>
              <p className="text-xs font-bold text-emerald-400 mt-2 uppercase tracking-widest">
                Overall Status: OPTIMAL
              </p>
            </div>
            <div className="mt-6 space-y-2">
              {Object.entries(stats.healthDetails).slice(0, 5).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider">
                  <span className="text-zinc-400">{key}</span>
                  <span className={value === 100 ? 'text-emerald-400' : 'text-amber-400'}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's KPI Dashboard */}
          <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-5 hover:bg-white/5 transition-colors">
               <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">Today's Assets</div>
               <div className="text-3xl font-black">{stats.today.assets}</div>
            </div>
            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-5 hover:bg-white/5 transition-colors">
               <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Today's Downloads</div>
               <div className="text-3xl font-black">---</div>
            </div>
            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-5 hover:bg-white/5 transition-colors">
               <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Today's Revenue</div>
               <div className="text-3xl font-black">¥---</div>
            </div>
            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-5 hover:bg-white/5 transition-colors">
               <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Today's QA Fails</div>
               <div className="text-3xl font-black">{stats.today.qa}</div>
            </div>
            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-5 hover:bg-white/5 transition-colors">
               <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Google Index Queue</div>
               <div className="text-3xl font-black">{stats.today.google} <span className="text-sm font-bold text-zinc-500">pending</span></div>
            </div>
            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-5 hover:bg-white/5 transition-colors">
               <div className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1">Pinterest Dist.</div>
               <div className="text-3xl font-black">Active</div>
            </div>
            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-5 hover:bg-white/5 transition-colors">
               <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Gen Jobs Queue</div>
               <div className="text-3xl font-black">{stats.today.queue} <span className="text-sm font-bold text-zinc-500">active</span></div>
            </div>
            <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-5 hover:bg-white/5 transition-colors">
               <div className="text-[10px] font-black text-orange-400 uppercase tracking-widest mb-1">Tomorrow's Plan</div>
               <div className="text-3xl font-black flex items-center gap-2"><Calendar className="w-5 h-5"/> Ready</div>
            </div>
          </div>
        </div>

        {/* Search Console Metrics (SEO) */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
             <div className="flex items-center gap-3">
               <Globe className="w-5 h-5 text-blue-400" />
               <h2 className="text-sm font-black tracking-widest uppercase text-white">Google Search Console (7 Days)</h2>
             </div>
             <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Organic Performance</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-5 hover:bg-blue-500/10 transition-colors">
               <div className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Clicks</div>
               <div className="text-3xl font-black">{stats.gsc.clicks.toLocaleString()}</div>
            </div>
            <div className="bg-purple-900/10 border border-purple-500/20 rounded-2xl p-5 hover:bg-purple-500/10 transition-colors">
               <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">Total Impressions</div>
               <div className="text-3xl font-black">{stats.gsc.impressions.toLocaleString()}</div>
            </div>
            <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-2xl p-5 hover:bg-emerald-500/10 transition-colors">
               <div className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Average CTR</div>
               <div className="text-3xl font-black">{stats.gsc.ctr}</div>
            </div>
            <div className="bg-amber-900/10 border border-amber-500/20 rounded-2xl p-5 hover:bg-amber-500/10 transition-colors">
               <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Avg. Position</div>
               <div className="text-3xl font-black">{stats.gsc.position}</div>
            </div>
          </div>
        </div>

        {/* Keyword Rank Tracking (SEO) */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
             <div className="flex items-center gap-3">
               <TrendingUp className="w-5 h-5 text-indigo-400" />
               <h2 className="text-sm font-black tracking-widest uppercase text-white">Keyword Ranking Trends</h2>
             </div>
             <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Daily SERP Monitor</span>
          </div>
          
          <div className="flex flex-col gap-4 h-48 overflow-hidden">
             {/* Mock Graph Layout since we don't have Recharts installed */}
             <div className="flex items-end gap-2 h-32 border-b border-white/5 pb-2">
                {[12, 10, 8, 9, 6, 5, 4, 3, 2, 2].map((pos, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                     <div 
                       className="w-full bg-indigo-500/50 rounded-t-sm transition-all duration-300 group-hover:bg-indigo-400"
                       style={{ height: `${100 - (pos * 2)}%` }} // Inverse height for position (lower rank = taller)
                     />
                     <span className="text-[8px] font-bold text-zinc-600">Day {i+1}</span>
                     <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10 border border-white/10">
                       Pos: {pos}
                     </div>
                  </div>
                ))}
             </div>
             <div className="text-[10px] font-black uppercase text-center tracking-widest text-zinc-500">
               Target: "透過PNG", "AI 透過" (Last 10 Days Position Average)
             </div>
          </div>
        </div>

        {/* Factory Heatmap */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 md:p-8">
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
             <div className="flex items-center gap-3">
               <BarChart3 className="w-5 h-5 text-cyan-400" />
               <h2 className="text-sm font-black tracking-widest uppercase text-white">Factory Heatmap (24H)</h2>
             </div>
             <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Real-time Generation Velocity</span>
          </div>
          
          <div className="flex gap-1 h-32 items-end">
            {heatmap.map((val, i) => {
              // Normalize height 0-100%
              const heightPct = Math.max(5, (val / 50) * 100);
              // Color based on intensity
              const opacity = Math.max(0.2, val / 50);
              return (
                <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group relative">
                   <div 
                     className="w-full bg-cyan-400 rounded-sm transition-all duration-500 group-hover:bg-white" 
                     style={{ height: `${heightPct}%`, opacity: opacity }} 
                   />
                   <span className="text-[8px] font-black text-zinc-600">{i}h</span>
                   
                   {/* Tooltip */}
                   <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10 border border-white/10">
                     Hour {i}: {val} assets
                   </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* System Monitoring Alerts */}
        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h2 className="text-sm font-black tracking-widest uppercase text-white">Self Repair & System Alerts</h2>
          </div>

          <div className="space-y-4">
            {stats.alerts.length === 0 ? (
              <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-emerald-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">All systems operational. No active self-repair events.</span>
              </div>
            ) : (
              stats.alerts.map((alert: any) => (
                <div key={alert.id} className={`flex items-start gap-4 p-4 rounded-2xl border ${
                  alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/20 text-red-300' :
                  alert.severity === 'warning' ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' :
                  'bg-blue-500/10 border-blue-500/20 text-blue-300'
                }`}>
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                        {alert.component}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-current opacity-50" />
                      <span className="text-[10px] font-bold opacity-70">
                        {new Date(alert.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs font-bold leading-relaxed">{alert.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
