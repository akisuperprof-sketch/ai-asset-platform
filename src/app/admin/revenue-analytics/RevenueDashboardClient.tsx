"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Download, Eye, DollarSign, Activity } from "lucide-react";

export function RevenueDashboardClient() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/revenue-stats");
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-ai-cyan" />
      </div>
    );
  }

  if (!stats) {
    return <div>Failed to load stats.</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
          <DollarSign className="text-green-400" /> Revenue & KPI Dashboard
        </h1>
        <p className="text-secondary text-sm">
          Tracking Beta Phase KPIs, Downloads, and Estimated Advertising Revenue.
        </p>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-secondary mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <h3 className="text-xs uppercase tracking-wider font-bold">Estimated Daily</h3>
          </div>
          <p className="text-3xl font-black text-white">¥{stats.estimated_daily_revenue.toFixed(0)}</p>
          <p className="text-[10px] text-white/40 mt-2">*Based on RPM (AdMax:¥50, PopAds:¥100)</p>
        </div>

        <div className="glass p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-secondary mb-2">
            <DollarSign className="w-4 h-4 text-green-400" />
            <h3 className="text-xs uppercase tracking-wider font-bold">Estimated Monthly</h3>
          </div>
          <p className="text-3xl font-black text-white">¥{stats.estimated_monthly_revenue.toFixed(0)}</p>
          <p className="text-[10px] text-white/40 mt-2">*Simple projection</p>
        </div>

        <div className="glass p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-secondary mb-2">
            <Eye className="w-4 h-4 text-ai-cyan" />
            <h3 className="text-xs uppercase tracking-wider font-bold">Today's PV</h3>
          </div>
          <p className="text-3xl font-black text-white">{stats.today_pv}</p>
        </div>

        <div className="glass p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-secondary mb-2">
            <Download className="w-4 h-4 text-ai-purple" />
            <h3 className="text-xs uppercase tracking-wider font-bold">Today's DL</h3>
          </div>
          <p className="text-3xl font-black text-white">{stats.today_dl}</p>
          <p className="text-[10px] text-white/40 mt-2">DL Rate: {stats.dl_rate.toFixed(1)}%</p>
        </div>

        <div className="glass p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-secondary mb-2">
            <Activity className="w-4 h-4 text-yellow-400" />
            <h3 className="text-xs uppercase tracking-wider font-bold">AdMax Render</h3>
          </div>
          <p className="text-3xl font-black text-white">{stats.today_admax_render}</p>
        </div>

        <div className="glass p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-secondary mb-2">
            <Activity className="w-4 h-4 text-red-400" />
            <h3 className="text-xs uppercase tracking-wider font-bold">PopAds Trigger</h3>
          </div>
          <p className="text-3xl font-black text-white">{stats.today_popads_trigger}</p>
        </div>
      </div>

      <div className="glass p-6 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-ai-cyan" />
          <h2 className="text-xl font-bold">Top Revenue Candidate Assets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase text-secondary bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-4 py-3">Asset</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Value Score</th>
              </tr>
            </thead>
            <tbody>
              {stats.top_revenue_candidates.map((a: any) => (
                <tr key={a.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 font-medium">{a.title}</td>
                  <td className="px-4 py-3 text-secondary">{a.category}</td>
                  <td className="px-4 py-3">
                    <span className="bg-ai-cyan/20 text-ai-cyan px-2 py-1 rounded text-xs">
                      TBD
                    </span>
                  </td>
                </tr>
              ))}
              {stats.top_revenue_candidates.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-secondary">
                    No data available yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
