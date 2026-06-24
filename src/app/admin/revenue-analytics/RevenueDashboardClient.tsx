"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Download, Eye, DollarSign, Activity, Filter, ExternalLink } from "lucide-react";
import Link from "next/link";

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

  // Calculate ad display rate
  const adDisplayRate = stats.today_pv > 0 ? (stats.today_admax_render / stats.today_pv) * 100 : 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
            <DollarSign className="text-green-400" /> Revenue & KPI Dashboard
          </h1>
          <p className="text-secondary text-sm">
            Tracking Beta Phase KPIs, Downloads, and Estimated Advertising Revenue.
          </p>
        </div>
        <div>
          <Link href="/admin/ad-health" className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm transition border border-white/10">
            <Activity className="w-4 h-4 text-ai-cyan" />
            Ad Health Check
            <ExternalLink className="w-3 h-3 text-secondary" />
          </Link>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass p-6 rounded-xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 blur-3xl rounded-full" />
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
          <p className="text-[10px] text-white/40 mt-2">Display Rate: {adDisplayRate.toFixed(1)}%</p>
        </div>

        <div className="glass p-6 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 text-secondary mb-2">
            <Activity className="w-4 h-4 text-red-400" />
            <h3 className="text-xs uppercase tracking-wider font-bold">PopAds Trigger</h3>
          </div>
          <p className="text-3xl font-black text-white">{stats.today_popads_trigger}</p>
        </div>
      </div>

      {/* AD FUNNEL */}
      <div className="glass p-6 rounded-xl border border-white/10">
        <div className="flex items-center gap-2 mb-6">
          <Filter className="w-5 h-5 text-ai-purple" />
          <h2 className="text-xl font-bold">Conversion Funnel</h2>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {[
            { label: "Page View", value: stats.funnel?.pv || 0, color: "text-white" },
            { label: "Asset View", value: stats.funnel?.asset_view || 0, color: "text-blue-400" },
            { label: "Download Start", value: stats.funnel?.download_start || 0, color: "text-ai-cyan" },
            { label: "Ad Impression", value: stats.funnel?.ad_impression || 0, color: "text-yellow-400" },
            { label: "DL Complete", value: stats.funnel?.download_complete || 0, color: "text-green-400" },
          ].map((step, idx, arr) => (
            <div key={step.label} className="flex-1 w-full flex flex-col items-center relative">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4 w-full text-center relative z-10">
                <p className="text-xs text-secondary uppercase tracking-widest mb-1">{step.label}</p>
                <p className={`text-2xl font-black ${step.color}`}>{step.value}</p>
              </div>
              {idx < arr.length - 1 && (
                <div className="hidden md:block absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 z-0">
                  <div className="w-8 h-[2px] bg-white/20" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* TOP REVENUE CANDIDATES */}
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
                <th className="px-4 py-3 text-right">Page Views</th>
                <th className="px-4 py-3 text-right">Downloads</th>
                <th className="px-4 py-3 text-right">Ad Impr.</th>
                <th className="px-4 py-3 text-right">Value Score</th>
              </tr>
            </thead>
            <tbody>
              {stats.top_revenue_candidates?.map((a: any) => (
                <tr key={a.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3 font-medium">{a.title}</td>
                  <td className="px-4 py-3 text-secondary">{a.category}</td>
                  <td className="px-4 py-3 text-right text-secondary">{a.view}</td>
                  <td className="px-4 py-3 text-right text-secondary">{a.dl}</td>
                  <td className="px-4 py-3 text-right text-secondary">{a.ad}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="bg-ai-cyan/20 text-ai-cyan px-2 py-1 rounded text-xs font-bold">
                      {a.valueScore.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
              {(!stats.top_revenue_candidates || stats.top_revenue_candidates.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-secondary">
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
