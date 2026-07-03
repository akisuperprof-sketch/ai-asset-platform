"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Sparkles, 
  ShieldAlert, 
  Terminal, 
  DollarSign, 
  Layers, 
  Search,
  Lock,
  ArrowRight,
  TrendingUp,
  Briefcase,
  Key,
  Globe,
  BarChart,
  Bot,
  Activity,
  CheckCircle2,
  ListOrdered
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    fetch('/api/admin/auth')
      .then(res => res.json())
      .then(data => {
        if (data.ok) setIsAuthenticated(true);
      })
      .catch(() => {})
      .finally(() => setIsChecking(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: password })
      });
      const data = await res.json();
      
      if (data.ok) {
        setIsAuthenticated(true);
        setError("");
      } else {
        setError(data.error || "AUTHENTICATION FAILED");
      }
    } catch (err) {
      setError("NETWORK ERROR");
    }
  };

  if (isChecking) {
    return <div className="min-h-screen bg-black" />;
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden font-mono px-4">
        <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
        <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="w-full max-w-md p-8 glass-card border border-cyan-500/20 rounded-3xl relative z-10 shadow-[0_0_50px_rgba(34,211,238,0.1)]">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-widest text-cyan-400">AI Company HQ</h1>
            <p className="text-xs text-secondary mt-2">AUTHORIZED PERSONNEL ONLY</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Master Key"
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-cyan-500/50 transition-colors pl-10"
                />
                <Key className="w-4 h-4 text-white/30 absolute left-3 top-3.5" />
              </div>
              {error && <p className="text-red-400 text-[10px] mt-2 font-bold tracking-wider uppercase">⚠️ {error}</p>}
            </div>
            <button
              type="submit"
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              INITIALIZE OPERATION ZERO
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  const NavLink = ({ href, icon: Icon, label }: { href: string, icon: any, label: string }) => {
    const isActive = pathname === href;
    return (
      <Link
        href={href}
        className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-colors ${
          isActive 
            ? "bg-cyan-500/10 border border-cyan-500/20 text-cyan-300" 
            : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
        }`}
      >
        <Icon className="w-4 h-4" />
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden font-sans">
      <aside className="w-64 bg-zinc-950 border-r border-white/5 flex flex-col justify-between shrink-0 relative z-30">
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="p-6 border-b border-white/5">
            <Link href="/" className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-cyan-400" />
              <div>
                <span className="text-sm font-black tracking-widest text-white block">AI COMPANY HQ</span>
                <span className="text-[9px] font-black text-cyan-400 tracking-[0.2em] block uppercase">Operation Zero</span>
              </div>
            </Link>
          </div>

          <nav className="p-4 space-y-1">
            <div className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.25em] pl-3 mb-2">COMMAND CENTER</div>
            <NavLink href="/admin" icon={LayoutDashboard} label="CEO Dashboard" />
            <NavLink href="/admin/ceo-report" icon={Briefcase} label="CEO Engine" />
            
            <div className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.25em] pl-3 pt-4 mb-2">PRODUCTION</div>
            <NavLink href="/admin/auto-factory" icon={Sparkles} label="Factory" />
            <NavLink href="/admin/studio" icon={CheckCircle2} label="QA Studio" />
            <NavLink href="/admin/assets-registry" icon={Layers} label="Assets" />
            
            <div className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.25em] pl-3 pt-4 mb-2">MARKET & SEO</div>
            <NavLink href="/admin/demand-radar" icon={Search} label="Demand Radar" />
            <NavLink href="/admin/search-console" icon={BarChart} label="Search Console" />
            
            <div className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.25em] pl-3 pt-4 mb-2">DISTRIBUTION</div>
            <NavLink href="/admin/pinterest" icon={Globe} label="Pinterest Engine" />
            <NavLink href="/admin/revenue-analytics" icon={DollarSign} label="Revenue" />
            
            <div className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.25em] pl-3 pt-4 mb-2">SYSTEM (AUTONOMOUS)</div>
            <NavLink href="/admin/growth-engine" icon={Activity} label="Growth Engine" />
            <NavLink href="/admin/self-repair" icon={ShieldAlert} label="Self Repair & Alerts" />
          </nav>
        </div>

        <div className="p-4 border-t border-white/5 space-y-3 bg-zinc-950">
          <div className="flex items-center gap-2.5 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div>
              <span className="text-[10px] font-black tracking-wider block text-emerald-400">AUTONOMOUS MODE</span>
              <span className="text-[8px] text-zinc-500 block tracking-widest font-mono">100% ONLINE</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 border-b border-white/5 bg-zinc-950/70 backdrop-blur-md flex items-center justify-between px-8 relative z-20">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              OPERATION ZERO: <span className="text-white">PHASE 13</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[9px] font-black bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full text-emerald-400 tracking-widest">
              SYSTEM HEALTH: 100
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-black relative">
          {children}
        </main>
      </div>
    </div>
  );
}
