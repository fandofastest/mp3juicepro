"use client";

import { useState } from "react";
import { apiRequest } from "../../lib/api-client";
import { Database, ShieldAlert, Sparkles } from "lucide-react";

export default function CacheManager() {
  const [pattern, setPattern] = useState("*");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFlush = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const res = await apiRequest(`/cache?pattern=${encodeURIComponent(pattern)}`, "DELETE");
      setMessage(res || `Successfully flushed keys matching pattern: ${pattern}`);
    } catch (err: any) {
      setError(err.message || "Failed to flush keys");
    } finally {
      setLoading(false);
    }
  };

  const flushQuickPattern = async (pat: string) => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      await apiRequest(`/cache?pattern=${encodeURIComponent(pat)}`, "DELETE");
      setMessage(`Successfully invalidated cache keys for '${pat}'`);
    } catch (err: any) {
      setError(err.message || "Failed to flush cache");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Cache & Invalidation</h1>
        <p className="text-sm text-stone-400 mt-1">Flush global Redis caches and clean key listings manually.</p>
      </div>

      {message && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{error}</span>
        </div>
      )}

      <div className="p-6 bg-stone-900 border border-stone-800 rounded-xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-stone-800 rounded-lg text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white">Redis Cache Cleaner</h3>
            <p className="text-xs text-stone-400">Specify wildcards to clear corresponding entries.</p>
          </div>
        </div>

        <form onSubmit={handleFlush} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
              Key Pattern
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                required
                className="flex-1 px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500 font-mono"
                placeholder="e.g. home:*, settings:*"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold rounded-lg text-sm transition"
              >
                {loading ? "Wiping..." : "Wipe Keys"}
              </button>
            </div>
            <p className="text-[10px] text-stone-500 mt-1 font-mono">Use * for wildcard matches. Warning: * will clear all keys.</p>
          </div>
        </form>

        <div className="border-t border-stone-800/60 pt-6">
          <h4 className="text-xs font-bold text-stone-300 uppercase tracking-wider mb-4">Quick actions</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => flushQuickPattern("home:*")}
              className="p-3 rounded-lg bg-stone-950 border border-stone-850 hover:border-stone-700/50 text-stone-300 text-xs font-semibold transition text-left"
            >
              Invalidate Homepage Caches
            </button>
            <button
              onClick={() => flushQuickPattern("categories:*")}
              className="p-3 rounded-lg bg-stone-950 border border-stone-850 hover:border-stone-700/50 text-stone-300 text-xs font-semibold transition text-left"
            >
              Invalidate Categories
            </button>
            <button
              onClick={() => flushQuickPattern("settings:*")}
              className="p-3 rounded-lg bg-stone-950 border border-stone-850 hover:border-stone-700/50 text-stone-300 text-xs font-semibold transition text-left"
            >
              Invalidate Settings Caches
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
