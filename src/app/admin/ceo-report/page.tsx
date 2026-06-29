"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Briefcase, 
  TrendingUp, 
  ListTodo, 
  Lightbulb, 
  BarChart3,
  Search,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export default function CeoReportPage() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    async function fetchReport() {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase
          .from('ceo_reports')
          .select('*')
          .order('date', { ascending: false })
          .limit(1)
          .single();

        if (data) {
          setReport(data);
        }
      } catch (err) {
        console.error('Failed to fetch CEO report', err);
      } finally {
        setLoading(false);
      }
    }
    fetchReport();
  }, []);

  if (loading) {
    return <div className="p-8 text-white">Loading CEO Report...</div>;
  }

  if (!report) {
    return <div className="p-8 text-white">No CEO Report generated yet. Run the Growth Engine V2 cycle.</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 flex items-center gap-3">
            <Briefcase className="w-6 h-6 text-blue-400" />
            AI CEO Daily Report
          </h1>
          <p className="text-secondary mt-2 text-sm max-w-2xl">
            Date: {report.date} | AI-generated strategic analysis and daily tasks.
          </p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase text-secondary font-bold mb-1">Revenue Forecast</div>
          <div className="text-2xl font-black text-emerald-400">${report.revenue_forecast}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card border border-white/5 p-6 rounded-2xl">
          <div className="text-xs font-bold uppercase text-secondary mb-2">PV (Yesterday)</div>
          <div className="text-2xl font-black">{report.metrics?.pv || 0}</div>
        </div>
        <div className="glass-card border border-white/5 p-6 rounded-2xl">
          <div className="text-xs font-bold uppercase text-secondary mb-2">Downloads</div>
          <div className="text-2xl font-black">{report.metrics?.dl || 0}</div>
        </div>
        <div className="glass-card border border-white/5 p-6 rounded-2xl">
          <div className="text-xs font-bold uppercase text-secondary mb-2">Avg CTR</div>
          <div className="text-2xl font-black">{report.metrics?.ctr || 0}%</div>
        </div>
        <div className="glass-card border border-white/5 p-6 rounded-2xl">
          <div className="text-xs font-bold uppercase text-secondary mb-2">RPM</div>
          <div className="text-2xl font-black">${report.metrics?.rpm || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Proposals */}
        <div className="glass-card border border-blue-500/20 p-6 rounded-2xl bg-blue-500/5">
          <div className="flex items-center gap-3 text-blue-300 mb-6">
            <Lightbulb className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">AI Proposals</span>
          </div>
          <p className="text-sm leading-relaxed text-blue-50 whitespace-pre-wrap">
            {report.proposals}
          </p>
        </div>

        {/* TODOs */}
        <div className="glass-card border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center gap-3 text-secondary mb-6">
            <ListTodo className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Today's TOP 10 Priorities</span>
          </div>
          <ul className="space-y-3">
            {report.todos?.map((todo: string, i: number) => (
              <li key={i} className="flex gap-3 items-start text-sm text-white/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-500/50 mt-0.5 shrink-0" />
                <span>{todo}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Analysis Data */}
        <div className="glass-card border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center gap-3 text-secondary mb-6">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Factory Analytics</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-secondary mb-1">QA Fails</div>
              <div className="text-xl font-bold text-red-400">{report.analysis?.qa_fails || 0}</div>
            </div>
            <div>
              <div className="text-xs text-secondary mb-1">Index Success (Queue)</div>
              <div className="text-xl font-bold text-cyan-400">{report.analysis?.index_count || 0}</div>
            </div>
          </div>
        </div>

        {/* Tomorrow Plan */}
        <div className="glass-card border border-white/5 p-6 rounded-2xl">
          <div className="flex items-center gap-3 text-secondary mb-6">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Tomorrow's Master Plan</span>
          </div>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {report.tomorrow_plan?.categories?.map((cat: string, i: number) => (
                <span key={i} className="px-2 py-1 bg-white/10 rounded text-xs font-bold uppercase">
                  {cat}
                </span>
              ))}
            </div>
            <p className="text-sm text-secondary">
              {report.tomorrow_plan?.reasoning || 'No specific reasoning provided.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
