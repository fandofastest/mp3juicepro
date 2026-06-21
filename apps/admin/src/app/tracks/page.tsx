"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api-client";
import { 
  Music, Search, Trash2, RefreshCw, Plus, HelpCircle, CheckCircle, AlertTriangle 
} from "lucide-react";

export default function TracksManager() {
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({ total: 0, pages: 1 });
  
  // Sync Form
  const [syncQuery, setSyncQuery] = useState("");
  const [syncLimit, setSyncLimit] = useState(20);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Bulk Categories Sync
  const [bulkSyncing, setBulkSyncing] = useState(false);
  const [bulkSyncResult, setBulkSyncResult] = useState<{ success: boolean; msg: string } | null>(null);

  const fetchTracks = (query = searchQuery, pageNum = page) => {
    setLoading(true);
    apiRequest(`/tracks?q=${encodeURIComponent(query)}&page=${pageNum}&limit=12`)
      .then((res) => {
        setTracks(res.tracks || []);
        setPagination(res.pagination || { total: 0, pages: 1 });
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load tracks");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTracks();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTracks(searchQuery, 1);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!syncQuery.trim()) return;

    setSyncing(true);
    setSyncResult(null);

    try {
      const res = await apiRequest("/tracks/import", "POST", {
        query: syncQuery,
        limit: Number(syncLimit),
      });
      setSyncResult({ success: true, msg: res.message || "Tracks imported successfully!" });
      setSyncQuery("");
      fetchTracks(searchQuery, 1);
    } catch (err: any) {
      setSyncResult({ success: false, msg: err.message || "Import failed. Verify YouTube API key." });
    } finally {
      setSyncing(false);
    }
  };

  const handleBulkSyncCategories = async () => {
    if (!confirm("Are you sure you want to bulk sync tracks from YouTube for all active categories? This may take a moment.")) return;
    setBulkSyncing(true);
    setBulkSyncResult(null);

    try {
      const res = await apiRequest("/categories/import-bulk", "POST");
      setBulkSyncResult({ 
        success: true, 
        msg: `Bulk sync completed! Sync'd ${res.totalCategories} categories with ${res.totalImported} tracks.` 
      });
      fetchTracks(searchQuery, 1);
    } catch (err: any) {
      setBulkSyncResult({ success: false, msg: err.message || "Bulk import failed. Check YouTube API key." });
    } finally {
      setBulkSyncing(false);
    }
  };

  const handleDelete = async (vid: string) => {
    if (!confirm("Are you sure you want to delete this track from local database?")) return;
    try {
      await apiRequest(`/tracks?vid=${vid}`, "DELETE");
      fetchTracks(searchQuery, page);
    } catch (err: any) {
      alert(err.message || "Failed to delete track");
    }
  };

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Music className="w-8 h-8 text-emerald-500" />
          Local Tracks & Import Sync
        </h1>
        <p className="text-sm text-stone-400 mt-1">
          Manage local music databases, fetch new songs dynamically from YouTube, and make them available for local play.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Import Sync Form */}
        <div className="p-6 bg-stone-900 border border-stone-800 rounded-xl space-y-4 h-fit">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <RefreshCw className={`w-5 h-5 text-emerald-400 ${syncing ? "animate-spin" : ""}`} />
            Sync from YouTube API
          </h3>
          <p className="text-xs text-stone-400">
            Type any search query to pull matching music tracks from YouTube. They will be downloaded into your local database cache automatically.
          </p>

          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                Search Keyword
              </label>
              <input
                type="text"
                value={syncQuery}
                onChange={(e) => setSyncQuery(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="e.g. acoustic pop, lofi beats"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                Tracks Limit
              </label>
              <select
                value={syncLimit}
                onChange={(e) => setSyncLimit(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value={10}>10 Tracks</option>
                <option value={20}>20 Tracks</option>
                <option value={50}>50 Tracks</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={syncing}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold rounded-lg text-sm transition flex items-center justify-center gap-2"
            >
              {syncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Import & Save Locally
                </>
              )}
            </button>
          </form>

          {syncResult && (
            <div className={`p-4 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
              syncResult.success 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              {syncResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{syncResult.msg}</span>
            </div>
          )}
        </div>

        {/* Bulk Category Sync Panel */}
        <div className="p-6 bg-stone-900 border border-stone-800 rounded-xl space-y-4 h-fit">
          <h3 className="font-bold text-white text-lg flex items-center gap-2">
            <RefreshCw className={`w-5 h-5 text-emerald-400 ${bulkSyncing ? "animate-spin" : ""}`} />
            Bulk Sync Categories
          </h3>
          <p className="text-xs text-stone-400">
            Automatically import and cache YouTube tracks for all active categories ("Top Hits", "Focus & Chill", etc.) at once.
          </p>

          <button
            onClick={handleBulkSyncCategories}
            disabled={bulkSyncing}
            className="w-full py-3 bg-stone-800 hover:bg-stone-750 disabled:opacity-50 text-white font-bold rounded-lg text-sm transition flex items-center justify-center gap-2 border border-stone-700"
          >
            {bulkSyncing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Syncing Categories...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Sync All Categories
              </>
            )}
          </button>

          {bulkSyncResult && (
            <div className={`p-4 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
              bulkSyncResult.success 
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}>
              {bulkSyncResult.success ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
              <span>{bulkSyncResult.msg}</span>
            </div>
          )}
        </div>

        {/* Tracks List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter Bar */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-stone-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-stone-900 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                placeholder="Search local tracks by title or artist..."
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-white text-sm font-semibold rounded-lg transition"
            >
              Search
            </button>
          </form>

          {loading ? (
            <div className="flex items-center justify-center min-h-[30vh]">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tracks.length === 0 ? (
            <div className="p-12 text-center bg-stone-900 border border-stone-800 rounded-xl">
              <Music className="w-12 h-12 text-stone-600 mx-auto mb-4" />
              <p className="text-stone-400 font-medium">No tracks found in the local database.</p>
              <p className="text-xs text-stone-500 mt-1">Use the YouTube API sync tool to populate music.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tracks.map((track) => (
                <div
                  key={track._id}
                  className="p-3 bg-stone-900 border border-stone-800/80 hover:border-stone-700 rounded-lg flex items-center justify-between gap-3 group transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={track.cover || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=100"}
                      alt={track.title}
                      className="w-12 h-12 rounded object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-white text-sm truncate">{track.title}</h4>
                      <p className="text-xs text-stone-400 truncate">{track.artist}</p>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {formatDuration(track.duration)} • {track.provider}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(track.vid)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-stone-500 hover:text-red-400 transition shrink-0 opacity-0 group-hover:opacity-100 duration-200"
                    title="Delete track"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 pt-4">
              <button
                disabled={page === 1}
                onClick={() => {
                  setPage(page - 1);
                  fetchTracks(searchQuery, page - 1);
                }}
                className="px-4 py-2 bg-stone-900 border border-stone-800 disabled:opacity-40 text-xs font-bold text-stone-300 rounded-lg hover:bg-stone-800 transition"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-xs font-bold text-stone-400">
                Page {page} of {pagination.pages}
              </span>
              <button
                disabled={page === pagination.pages}
                onClick={() => {
                  setPage(page + 1);
                  fetchTracks(searchQuery, page + 1);
                }}
                className="px-4 py-2 bg-stone-900 border border-stone-800 disabled:opacity-40 text-xs font-bold text-stone-300 rounded-lg hover:bg-stone-800 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
