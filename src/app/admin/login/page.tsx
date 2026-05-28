'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: password }),
      });

      const data = await res.json();
      if (data.ok) {
        // Force refresh to update middleware state
        window.location.href = '/admin/studio';
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-sans text-gray-200">
      <div className="w-full max-w-md bg-[#0a0a0a] border border-gray-800/50 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-blue-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-100 to-gray-400">
              Admin Portal
            </h1>
            <p className="text-sm text-gray-500 mt-2">
              AssetNinja D-Strategy System
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                Access Key
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#111] border border-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                placeholder="Enter admin key..."
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm bg-red-950/30 border border-red-900/50 rounded-lg p-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded-lg px-4 py-3 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Login to Studio'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
