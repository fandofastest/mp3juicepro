"use client";

import { useEffect, useState, useCallback } from "react";
import { apiRequest } from "../../lib/api-client";
import { 
  PlayCircle, Activity, Music, Smartphone, Search, RefreshCw, 
  ExternalLink, Copy, Check, ChevronLeft, ChevronRight, Globe, User as UserIcon
} from "lucide-react";

interface PlayLogItem {
  id: string;
  vid: string;
  title: string;
  artist: string;
  playUrl: string;
  packageName: string;
  userId: string | null;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

interface SummaryData {
  totalHits: number;
  todayHits: number;
  uniqueTracksCount: number;
  uniqueAppsCount: number;
}

export default function PlayLogsPage() {
  const [logs, setLogs] = useState<PlayLogItem[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    totalHits: 0,
    todayHits: 0,
    uniqueTracksCount: 0,
    uniqueAppsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters & Pagination
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (searchTerm.trim()) {
        params.set("q", searchTerm.trim());
      }

      const res = await apiRequest(`/play-logs?${params.toString()}`);
      setLogs(res.logs || []);
      setSummary(res.summary || {
        totalHits: 0,
        todayHits: 0,
        uniqueTracksCount: 0,
        uniqueAppsCount: 0,
      });
      setTotalPages(res.pagination?.pages || 1);
      setTotalCount(res.pagination?.total || 0);
    } catch (err: any) {
      setError(err.message || "Failed to fetch play logs");
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Play Resource & Hit Logs</h1>
          <p className="text-sm text-stone-400 mt-1">
            Real-time backend logs of stream requests, video IDs, and played audio resource URLs.
          </p>
        </div>
        <button
          onClick={() => fetchLogs()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-lg text-xs font-semibold text-stone-200 transition shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? "animate-spin" : ""}`} />
          Refresh Logs
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-6 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Total Play Hits</p>
            <p className="text-2xl font-bold text-white mt-2 font-mono">{summary.totalHits.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <PlayCircle className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        <div className="p-6 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Today's Hits</p>
            <p className="text-2xl font-bold text-emerald-400 mt-2 font-mono">{summary.todayHits.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Activity className="w-6 h-6 text-purple-400" />
          </div>
        </div>

        <div className="p-6 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Unique Tracks</p>
            <p className="text-2xl font-bold text-white mt-2 font-mono">{summary.uniqueTracksCount.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Music className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        <div className="p-6 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Connected Apps</p>
            <p className="text-2xl font-bold text-white mt-2 font-mono">{summary.uniqueAppsCount.toLocaleString()}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="p-4 rounded-xl bg-stone-900 border border-stone-800 flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-96">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search video ID, title, or resource URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-stone-950 border border-stone-800 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 font-mono text-xs"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg text-xs transition"
          >
            Search
          </button>
        </form>

        <div className="text-xs text-stone-400 font-mono">
          Showing <span className="text-white font-bold">{logs.length}</span> of <span className="text-white font-bold">{totalCount}</span> logs
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Logs Table */}
      <div className="p-6 rounded-xl bg-stone-900 border border-stone-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-16 text-stone-500 text-sm">
            No play hit logs found. Play a track from mobile app or API to populate logs.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-300">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-4 pl-2">Timestamp</th>
                  <th className="pb-4">Track / Video ID</th>
                  <th className="pb-4">Play Resource Link</th>
                  <th className="pb-4">App Package</th>
                  <th className="pb-4">IP / Client</th>
                  <th className="pb-4 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/40">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-stone-800/20 transition">
                    <td className="py-4 pl-2 text-xs font-mono text-stone-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    
                    <td className="py-4 max-w-xs">
                      <div className="font-semibold text-white truncate" title={log.title}>
                        {log.title}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono bg-stone-800 text-emerald-400 px-2 py-0.5 rounded">
                          ID: {log.vid}
                        </span>
                        <a
                          href={`https://youtu.be/${log.vid}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-stone-500 hover:text-stone-300"
                          title="View on YouTube"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>

                    <td className="py-4 max-w-md">
                      <div className="flex items-center gap-2 bg-stone-950 p-2 rounded-lg border border-stone-800">
                        <span className="text-xs font-mono text-stone-300 truncate flex-1" title={log.playUrl}>
                          {log.playUrl}
                        </span>
                        <button
                          onClick={() => handleCopyLink(log.playUrl, log.id)}
                          className="p-1 text-stone-400 hover:text-white transition shrink-0"
                          title="Copy Resource URL"
                        >
                          {copiedId === log.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={log.playUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1 text-emerald-400 hover:text-emerald-300 transition shrink-0"
                          title="Test Stream / Download URL"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>

                    <td className="py-4 whitespace-nowrap">
                      <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                        {log.packageName}
                      </span>
                    </td>

                    <td className="py-4 text-xs font-mono text-stone-400">
                      <div className="flex items-center gap-1.5 text-stone-300">
                        <Globe className="w-3 h-3 text-stone-500" />
                        {log.ipAddress}
                      </div>
                      {log.userId && (
                        <div className="flex items-center gap-1 text-[10px] text-stone-500 mt-1">
                          <UserIcon className="w-3 h-3" />
                          User: {log.userId}
                        </div>
                      )}
                    </td>

                    <td className="py-4 pr-2 text-right">
                      <a
                        href={log.playUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md text-xs font-medium transition"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        Play
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-stone-800 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="flex items-center gap-1 px-3 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 rounded-lg text-xs text-stone-300 font-semibold transition"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <span className="text-xs font-mono text-stone-400">
              Page <span className="text-white font-bold">{page}</span> of <span className="text-white font-bold">{totalPages}</span>
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="flex items-center gap-1 px-3 py-2 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 rounded-lg text-xs text-stone-300 font-semibold transition"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
