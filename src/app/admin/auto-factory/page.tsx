"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Bot, Power, PowerOff, Target, Activity, Settings2, RefreshCw } from 'lucide-react';

export default function AdminAutoFactoryPage() {
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>({ is_enabled: false, daily_target: 30 });
  const [logs, setLogs] = useState<any[]>([]);

  const fetchLogs = async () => {
    const { data } = await supabase.from('factory_logs').select('*').order('created_at', { ascending: false }).limit(50);
    if (data) setLogs(data);
  };

  useEffect(() => {
    async function fetchData() {
      // Settings
      const { data: setts } = await supabase.from('auto_factory_settings').select('*').eq('id', 'default').single();
      if (setts) setSettings(setts);

      // Stats
      const todayStr = new Date().toISOString().split('T')[0];
      const { count: approvedTotal } = await supabase.from('assets').select('*', { count: 'exact', head: true }).eq('review_status', 'approved');
      const { count: todayApproved } = await supabase.from('assets').select('*', { count: 'exact', head: true }).eq('review_status', 'approved').gte('published_at', `${todayStr}T00:00:00Z`);
      const { count: queueCount } = await supabase.from('generation_jobs').select('*', { count: 'exact', head: true }).in('status', ['queued', 'processing']);

      setStats({
        approvedTotal: approvedTotal || 0,
        todayApproved: todayApproved || 0,
        queueCount: queueCount || 0
      });

      // Logs
      await fetchLogs();

      setLoading(false);
    }
    fetchData();
    
    // Auto refresh logs every 10s
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleManualRun = async (theme: string) => {
    if (!theme) return;
    alert(`Triggering Bulk Planner for theme: ${theme}`);
    try {
      await fetch('/api/admin/bulk-planner/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-agent-token': process.env.NEXT_PUBLIC_AGENT_TOKEN || '' },
        body: JSON.stringify({ theme })
      });
      alert('Bulk Planner triggered successfully!');
      fetchLogs();
    } catch (e) {
      alert('Error triggering bulk planner');
    }
  };

  const saveSettings = async (updates: any) => {
    const newSettings = { ...settings, ...updates };
    const { error } = await supabase.from('auto_factory_settings').update(updates).eq('id', 'default');
    if (!error) {
      setSettings(newSettings);
      alert("Settings saved!");
    } else {
      alert("Failed to save settings");
    }
  };

  if (loading) return <div className="p-8 text-white">Loading Auto Factory...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 flex items-center gap-2">
            <Bot className="w-6 h-6 text-purple-400" />
            Auto Factory
          </h1>
          <p className="text-secondary mt-2 text-sm max-w-2xl">
            Asynchronous asset production pipelines and autonomous task workers.
          </p>
        </div>
        <Link href="/admin" className="text-sm font-bold text-secondary hover:text-white uppercase tracking-wider">
          Back to Admin
        </Link>
      </div>

      {/* Stats Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Factory Goal</span>
            <Target className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats.approvedTotal} <span className="text-sm text-secondary">/ 10,000</span></div>
          <div className="w-full bg-white/5 h-2 mt-4 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full" style={{ width: `${Math.min(100, (stats.approvedTotal/10000)*100)}%` }}></div>
          </div>
        </div>
        <div className="glass-card border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Approved Today</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">+{stats.todayApproved}</div>
        </div>
        <div className="glass-card border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-secondary">Worker Queue</span>
            <RefreshCw className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-400">{stats.queueCount}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Settings & Manual Ops */}
        <div className="space-y-8">
          <div className="glass-card border border-white/5 p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-secondary mb-6">
              <Settings2 className="w-5 h-5 text-purple-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Factory Settings</span>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase font-bold text-secondary mb-2">Master Switch</label>
                <button 
                  onClick={() => saveSettings({ is_enabled: !settings.is_enabled })}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold uppercase transition-colors ${
                    settings.is_enabled 
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500/30' 
                      : 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30'
                  }`}
                >
                  {settings.is_enabled ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                  {settings.is_enabled ? 'ON (Auto Active)' : 'OFF (Paused)'}
                </button>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-secondary mb-2">Daily Target Limit</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-purple-500 outline-none"
                  value={settings.daily_target}
                  onChange={(e) => saveSettings({ daily_target: parseInt(e.target.value) })}
                >
                  <option value="10">10 Assets / Day</option>
                  <option value="30">30 Assets / Day</option>
                  <option value="50">50 Assets / Day</option>
                  <option value="100">100 Assets / Day</option>
                </select>
              </div>
            </div>
          </div>

          <div className="glass-card border border-white/5 p-6 rounded-2xl">
            <div className="flex items-center gap-3 text-secondary mb-6">
              <Bot className="w-5 h-5 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Manual Planner Override</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-secondary mb-2">Theme Keyword</label>
                <input 
                  id="theme-input" 
                  type="text" 
                  placeholder="e.g. business woman, neon cat" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-indigo-500 outline-none" 
                />
              </div>
              <button 
                onClick={() => {
                  const val = (document.getElementById('theme-input') as HTMLInputElement).value;
                  handleManualRun(val);
                }}
                className="w-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/50 px-4 py-3 rounded-xl text-xs font-bold uppercase hover:bg-indigo-500/30 transition-colors"
              >
                Force Inject Demand
              </button>
            </div>
          </div>
        </div>

        {/* Factory Logs Terminal */}
        <div className="lg:col-span-2 glass-card border border-white/5 p-6 rounded-2xl flex flex-col h-[600px]">
          <div className="flex items-center justify-between text-secondary mb-4">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider">Factory Live Output</span>
            </div>
            <button onClick={fetchLogs} className="text-[10px] hover:text-white uppercase font-bold tracking-wider">Refresh</button>
          </div>
          
          <div className="flex-1 overflow-y-auto bg-black/60 rounded-xl border border-white/5 p-4 font-mono text-[11px] space-y-3 custom-scrollbar">
            {logs.length > 0 ? logs.map((log) => (
              <div key={log.id} className="flex gap-4">
                <span className="text-secondary shrink-0">{new Date(log.created_at).toLocaleTimeString()}</span>
                <span className={`w-20 shrink-0 uppercase font-bold ${
                  log.status === 'success' ? 'text-emerald-400' : 
                  log.status === 'failed' ? 'text-red-400' : 'text-blue-400'
                }`}>
                  [{log.status}]
                </span>
                <span className="text-purple-400 w-32 shrink-0">{log.task}</span>
                <span className="text-white/80 break-all">{JSON.stringify(log.details)}</span>
              </div>
            )) : (
              <div className="text-secondary text-center pt-10">Waiting for logs...</div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
