"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Sparkles, 
  ShieldAlert, 
  Terminal, 
  FileLock2, 
  DollarSign, 
  Layers, 
  Settings, 
  Search,
  Lock,
  ArrowRight,
  TrendingUp,
  Key
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Secure HTTP-Only Cookie validation
    fetch('/api/admin/auth')
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          setIsAuthenticated(true);
        }
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
        if (data.error === 'SERVER_KEY_NOT_CONFIGURED') {
          setError("SYSTEM ERROR: D_STRATEGY_KEY NOT CONFIGURED");
        } else if (data.error === 'MISSING_KEY') {
          setError("AUTHENTICATION FAILED: KEY IS REQUIRED");
        } else {
          setError("AUTHENTICATION FAILED: INVALID CRITICAL KEY");
        }
      }
    } catch (err) {
      setError("NETWORK ERROR");
    }
  };

  // Cyber Punk Auth Portal Overlay
  if (isChecking) {
    return <div className="min-h-screen bg-black" />; // simple dark loading state
  }
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden font-mono px-4">
        {/* Glow ambient background */}
        <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
        <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[20%] w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md p-8 glass-card border border-purple-500/20 rounded-3xl relative z-10 shadow-[0_0_50px_rgba(168,85,247,0.1)]">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-purple-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10 shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-xl font-black uppercase tracking-widest bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              STUDIO OS PORTAL
            </h1>
            <p className="text-xs text-secondary mt-2">
              AUTHORIZED PERSONNEL ONLY / MULTI-FACTOR KEY REQUIRED
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="text-[10px] uppercase tracking-widest text-purple-300 font-bold block mb-2">
                ADMIN DEPLOYMENT KEY
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••••"
                  className="w-full bg-white/5 border border-white/10 px-4 py-3 rounded-xl text-sm focus:outline-none focus:border-purple-500/50 transition-colors placeholder:text-white/20 pl-10"
                />
                <Key className="w-4 h-4 text-white/30 absolute left-3 top-3.5" />
              </div>
              {error && (
                <p className="text-red-400 text-[10px] mt-2 font-bold tracking-wider animate-pulse uppercase">
                  ⚠️ {error}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-ai-gradient py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.3)]"
            >
              AUTHENTICATE CONSOLE
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center text-[9px] text-white/40 leading-relaxed uppercase">
            SECURED VIA ASSETNINJA SECURE CORRIDOR PROTOCOLS <br />
            IP LOGGING: ACTIVE / DEPLOYMENT REF: 2026.05.19
          </div>
        </div>
      </div>
    );
  }

  // Fully Authorized Cyber Admin layout Sidebar + Workspace
  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden font-sans">
      
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-zinc-950 border-r border-white/5 flex flex-col justify-between shrink-0 relative z-30">
        <div>
          {/* Logo & Console Title */}
          <div className="p-6 border-b border-white/5">
            <Link href="/" className="flex items-center gap-3">
              <img src="/brand/icon-shuriken.svg" alt="Ninja" className="w-6 h-6 animate-spin" style={{ animationDuration: "12s" }} />
              <div>
                <span className="text-sm font-black tracking-widest text-white block">ASSETNINJA</span>
                <span className="text-[9px] font-black text-purple-400 tracking-[0.2em] block uppercase">STUDIO OS v1.0</span>
              </div>
            </Link>
          </div>

          {/* Nav links */}
          <nav className="p-4 space-y-1">
            <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.25em] pl-3 mb-2">
              WORKSPACE
            </div>
            
            <Link
              href="/admin/studio"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                pathname === "/admin/studio" 
                  ? "bg-purple-500/10 border border-purple-500/20 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.05)]" 
                  : "text-secondary hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              スタジオ管理
            </Link>

            <Link
              href="/admin/ai-ops"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                pathname === "/admin/ai-ops" 
                  ? "bg-purple-500/10 border border-purple-500/20 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.05)]" 
                  : "text-secondary hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI稼働監視
            </Link>

            <div className="text-[9px] font-black text-white/30 uppercase tracking-[0.25em] pl-3 pt-6 mb-2">
              SYSTEM ENGINE
            </div>

            <Link
              href="/admin/ad-health"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                pathname === "/admin/ad-health" 
                  ? "bg-purple-500/10 border border-purple-500/20 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.05)]" 
                  : "text-secondary hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              広告ヘルスチェック
            </Link>

            <Link
              href="/admin/d-strategy"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                pathname === "/admin/d-strategy" 
                  ? "bg-purple-500/10 border border-purple-500/20 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.05)]" 
                  : "text-secondary hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              D作戦OS
            </Link>

            <Link
              href="/admin/assets-registry"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black transition-colors ${
                pathname === "/admin/assets-registry"
                  ? "bg-purple-500/10 border border-purple-500/20 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.05)]" 
                  : "text-secondary hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Layers className="w-4 h-4" />
              素材一覧
            </Link>

            <Link
              href="/admin/keywords-radar"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black transition-colors ${
                pathname === "/admin/keywords-radar"
                  ? "bg-purple-500/10 border border-purple-500/20 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.05)]" 
                  : "text-secondary hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Search className="w-4 h-4" />
              検索需要レーダー
            </Link>

            <Link
              href="/admin/revenue-analytics"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-black transition-colors ${
                pathname === "/admin/revenue-analytics"
                  ? "bg-purple-500/10 border border-purple-500/20 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.05)]" 
                  : "text-secondary hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              収益分析
            </Link>
          </nav>
        </div>

        {/* User / Session status */}
        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="flex items-center gap-2.5 bg-white/5 p-3 rounded-xl border border-white/5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <div className="overflow-hidden">
              <span className="text-[10px] font-black tracking-wider block text-white">SECURE NODE: ACTIVE</span>
              <span className="text-[8px] text-emerald-400 block tracking-widest font-mono">LEVEL S-RANK AUTH</span>
            </div>
          </div>
          <button
            onClick={async () => {
              await fetch('/api/admin/auth', { method: 'DELETE' });
              setIsAuthenticated(false);
            }}
            className="w-full text-center py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-red-500/10 transition-colors"
          >
            DISCONNECT CONSOLE
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-white/5 bg-zinc-950/70 backdrop-blur-md flex items-center justify-between px-8 relative z-20">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-black uppercase tracking-wider text-secondary">
              ENGINE NODE: <span className="text-white">PROD_MAIN_CLUSTER_JP</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black bg-white/5 border border-white/5 px-3 py-1 rounded-full text-purple-300">
              VERCEL EDGE ROUTING
            </span>
            <span className="text-[10px] font-black bg-white/5 border border-white/5 px-3 py-1 rounded-full text-cyan-300">
              SUPABASE DB LINK
            </span>
          </div>
        </header>

        {/* Child Views */}
        <main className="flex-1 overflow-y-auto bg-black relative">
          {children}
        </main>
      </div>

    </div>
  );
}
