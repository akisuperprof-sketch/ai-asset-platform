'use client';

import { useState, useEffect } from 'react';
import { Settings, Play, Square, Info } from 'lucide-react';

interface AutoConfig {
  autoProductionEnabled: boolean;
  batchSize: number;
  dailyLimit: number;
  idleMinutes: number;
  maxNetworkKBps: number;
  cooldownMinutes: number;
  todayGenerated: number;
}

export default function AutoProductionSettings() {
  const [config, setConfig] = useState<AutoConfig | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/auto-production/config');
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setConfig(json.data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch auto production config', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
    const interval = setInterval(fetchConfig, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleEnabled = async () => {
    if (!config) return;
    const newState = !config.autoProductionEnabled;
    setConfig({ ...config, autoProductionEnabled: newState });
    try {
      await fetch('/api/admin/auto-production/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autoProductionEnabled: newState })
      });
    } catch (e) {
      console.error('Failed to update config', e);
      setConfig(config); // Revert
    }
  };

  if (loading && !config) return null;

  return (
    <div className="mt-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2 text-white">
          <Settings className="text-indigo-400" />
          Local Auto Production
        </h2>
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-400">
            {config?.autoProductionEnabled ? '自動生成 ON' : '自動生成 OFF'}
          </span>
          <button
            onClick={toggleEnabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config?.autoProductionEnabled ? 'bg-indigo-500' : 'bg-zinc-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config?.autoProductionEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
          <div className="text-xs text-zinc-500 mb-1">Batch Size</div>
          <div className="text-lg font-bold text-white">{config?.batchSize}</div>
        </div>
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
          <div className="text-xs text-zinc-500 mb-1">Daily Limit</div>
          <div className="text-lg font-bold text-white">{config?.dailyLimit}</div>
        </div>
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
          <div className="text-xs text-zinc-500 mb-1">Idle Delay (min)</div>
          <div className="text-lg font-bold text-white">{config?.idleMinutes}</div>
        </div>
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
          <div className="text-xs text-zinc-500 mb-1">Max Network (KB/s)</div>
          <div className="text-lg font-bold text-white">{config?.maxNetworkKBps}</div>
        </div>
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
          <div className="text-xs text-zinc-500 mb-1">Cooldown (min)</div>
          <div className="text-lg font-bold text-white">{config?.cooldownMinutes}</div>
        </div>
        <div className="bg-zinc-950 p-4 rounded-2xl border border-indigo-500/20">
          <div className="text-xs text-indigo-400 mb-1">Generated Today</div>
          <div className="text-lg font-bold text-indigo-300">{config?.todayGenerated} / {config?.dailyLimit}</div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
        <Info size={14} />
        PCのネットワーク使用量が少ないアイドル状態の時にのみ自動で生成スクリプトが起動します。
      </div>
    </div>
  );
}
