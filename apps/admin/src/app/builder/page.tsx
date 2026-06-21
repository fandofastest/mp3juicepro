"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api-client";
import { 
  Plus, Edit2, Trash2, CheckCircle, XCircle, ArrowUp, ArrowDown, Eye, Settings, Sliders, RefreshCw
} from "lucide-react";

export default function HomeBuilder() {
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<any>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [layout, setLayout] = useState("carousel");
  const [type, setType] = useState("featured");
  const [query, setQuery] = useState("");
  const [limit, setLimit] = useState(10);
  const [provider, setProvider] = useState("mock");
  const [enabled, setEnabled] = useState(true);

  // Track Editor States
  const [tracks, setTracks] = useState<any[]>([]);
  const [fetchingTracks, setFetchingTracks] = useState(false);
  const [newTrackTitle, setNewTrackTitle] = useState("");
  const [newTrackArtist, setNewTrackArtist] = useState("");
  const [newTrackVid, setNewTrackVid] = useState("");
  const [newTrackCover, setNewTrackCover] = useState("");
  const [newTrackDuration, setNewTrackDuration] = useState("240");

  // YouTube Fetch States
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [fetchLimit, setFetchLimit] = useState(20);

  const isTrackBased = ["featured", "recommendation", "search", "manual"].includes(type);

  const fetchSections = () => {
    setLoading(true);
    apiRequest("/home/sections")
      .then((res) => {
        setSections(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load builder sections");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const openCreateModal = () => {
    setEditingSection(null);
    setTitle("");
    setSubtitle("");
    setLayout("carousel");
    setType("featured");
    setQuery("");
    setLimit(10);
    setProvider("mock");
    setEnabled(true);
    setTracks([]);
    setSearchKeyword("");
    setSearchResults([]);
    setFetchLimit(20);
    setModalOpen(true);
  };

  const openEditModal = (sec: any) => {
    setEditingSection(sec);
    setTitle(sec.title);
    setSubtitle(sec.subtitle || "");
    setLayout(sec.layout);
    setType(sec.type);
    setQuery(sec.query || "");
    setLimit(sec.limit);
    setProvider(sec.provider || "mock");
    setEnabled(sec.enabled);
    setTracks(sec.tracks || []);
    setSearchKeyword("");
    setSearchResults([]);
    setFetchLimit(20);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSection) {
        // Update
        await apiRequest("/home/sections", "PUT", {
          id: editingSection._id,
          title,
          subtitle,
          layout,
          type,
          query,
          limit: Number(limit),
          provider,
          enabled,
          tracks,
        });
      } else {
        // Create
        await apiRequest("/home/sections", "POST", {
          title,
          subtitle,
          layout,
          type,
          query,
          limit: Number(limit),
          provider,
          enabled,
          sortOrder: sections.length + 1,
          tracks,
        });
      }
      setModalOpen(false);
      fetchSections();
    } catch (err: any) {
      alert(err.message || "Failed to save section");
    }
  };

  // Track manipulation functions
  const handleDeleteTrack = (vid: string) => {
    setTracks(tracks.filter((t) => t.vid !== vid));
  };

  const handleFetchTracks = async () => {
    if (!query) {
      alert("Query keyword is required to fetch tracks.");
      return;
    }
    setFetchingTracks(true);
    try {
      const res = await apiRequest(`/search?q=${encodeURIComponent(query)}&provider=${provider || "youtube"}&limit=${fetchLimit}`);
      if (res && res.tracks) {
        const existingVids = new Set(tracks.map((t) => t.vid));
        const newTracks = [...tracks];
        res.tracks.forEach((t: any) => {
          if (t.vid && !existingVids.has(t.vid)) {
            newTracks.push(t);
          }
        });
        setTracks(newTracks);
      }
    } catch (err: any) {
      alert(err.message || "Failed to fetch tracks. Ensure YouTube API Key is active.");
    } finally {
      setFetchingTracks(false);
    }
  };

  const handleAddTrack = () => {
    if (!newTrackTitle.trim() || !newTrackArtist.trim() || !newTrackVid.trim()) {
      alert("Title, Artist and YouTube Video ID are required.");
      return;
    }
    
    const cleanVid = newTrackVid.trim();
    const newTrack = {
      id: cleanVid,
      vid: cleanVid,
      title: newTrackTitle.trim(),
      artist: newTrackArtist.trim(),
      cover: newTrackCover.trim() || `https://i.ytimg.com/vi/${cleanVid}/hqdefault.jpg`,
      duration: Number(newTrackDuration) || 240,
      provider: "youtube",
    };

    if (tracks.some((t) => t.vid === cleanVid)) {
      alert("This track already exists in this section.");
      return;
    }

    setTracks([...tracks, newTrack]);
    setNewTrackTitle("");
    setNewTrackArtist("");
    setNewTrackVid("");
    setNewTrackCover("");
    setNewTrackDuration("240");
  };

  const handleSearchYoutube = async () => {
    if (!searchKeyword.trim()) {
      alert("Please enter a search keyword.");
      return;
    }
    setSearching(true);
    try {
      const res = await apiRequest(`/search?q=${encodeURIComponent(searchKeyword)}&provider=youtube&limit=10`);
      if (res && res.tracks) {
        setSearchResults(res.tracks);
      } else {
        setSearchResults([]);
      }
    } catch (err: any) {
      alert(err.message || "Failed to search tracks. Check YouTube API Key.");
    } finally {
      setSearching(false);
    }
  };

  const handleAddTrackFromSearch = (track: any) => {
    const cleanVid = track.vid;
    if (!cleanVid) return;

    if (tracks.some((t) => t.vid === cleanVid)) {
      alert("This track already exists in this section.");
      return;
    }

    const newTrack = {
      id: cleanVid,
      vid: cleanVid,
      title: track.title,
      artist: track.artist,
      cover: track.cover || `https://i.ytimg.com/vi/${cleanVid}/hqdefault.jpg`,
      duration: track.duration || 240,
      provider: "youtube",
    };

    setTracks([...tracks, newTrack]);
  };

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? "0" : ""}${sec}`;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) return;
    try {
      await apiRequest(`/home/sections?id=${id}`, "DELETE");
      fetchSections();
    } catch (err: any) {
      alert(err.message || "Failed to delete section");
    }
  };

  const moveSection = async (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;

    const currentSec = sections[index];
    const targetSec = sections[targetIdx];

    try {
      // Swap sortOrders
      const currentOrder = currentSec.sortOrder;
      const targetOrder = targetSec.sortOrder;

      await apiRequest("/home/sections", "PUT", { id: currentSec._id, sortOrder: targetOrder });
      await apiRequest("/home/sections", "PUT", { id: targetSec._id, sortOrder: currentOrder });

      fetchSections();
    } catch (err: any) {
      alert("Failed to reorder sections");
    }
  };

  if (loading && sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Homepage Layout Builder</h1>
          <p className="text-sm text-stone-400 mt-1">Configure layout sections dynamically without editing code.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Add Section
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Sections List */}
      <div className="space-y-4">
        {sections.map((sec, idx) => (
          <div
            key={sec._id}
            className={`p-5 rounded-xl border transition ${
              sec.enabled ? "bg-stone-900 border-stone-800" : "bg-stone-950 border-stone-900 opacity-60"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-stone-800 rounded-lg border border-stone-700/50">
                  <Sliders className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white text-base">{sec.title}</h3>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-stone-800 text-stone-400">
                      {sec.layout}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                      {sec.type}
                    </span>
                  </div>
                  <p className="text-xs text-stone-400 mt-1">{sec.subtitle || "No description provided."}</p>
                  <div className="flex items-center gap-4 mt-2 text-[10px] text-stone-500 font-medium">
                    <span>Limit: {sec.limit} items</span>
                    <span>•</span>
                    <span>Provider: {sec.provider}</span>
                    {sec.query && (
                      <>
                        <span>•</span>
                        <span>Query: {sec.query}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {/* Order swap */}
                <button
                  onClick={() => moveSection(idx, "up")}
                  disabled={idx === 0}
                  className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:hover:bg-stone-800 text-stone-400 transition"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  onClick={() => moveSection(idx, "down")}
                  disabled={idx === sections.length - 1}
                  className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 disabled:hover:bg-stone-800 text-stone-400 transition"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                <button
                  onClick={() => openEditModal(sec)}
                  className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-emerald-400 transition"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(sec._id)}
                  className="p-2 rounded-lg bg-stone-800 hover:bg-red-500/10 text-red-400 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className={`relative w-full ${isTrackBased ? "max-w-4xl" : "max-w-lg"} p-6 bg-stone-900 border border-stone-800 rounded-xl shadow-xl z-10 max-h-[92vh] overflow-y-auto`}>
            <h2 className="text-xl font-bold text-white mb-6">
              {editingSection ? "Modify Home Section" : "Create New Home Section"}
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              <div className={isTrackBased ? "grid grid-cols-1 md:grid-cols-2 gap-8" : "space-y-4"}>
                {/* Left Column: Properties */}
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-sm border-b border-stone-800 pb-2 uppercase tracking-wider text-stone-400">
                    Section Properties
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Featured Hits"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Hot new drops"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                        Layout
                      </label>
                      <select
                        value={layout}
                        onChange={(e) => setLayout(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                      >
                        <option value="carousel">Carousel</option>
                        <option value="grid">Grid Layout</option>
                        <option value="list">List Row</option>
                        <option value="banner">Banner Banner</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                        Section Content Type
                      </label>
                      <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                      >
                        <option value="featured">Featured tracks</option>
                        <option value="banner">Promotional Banner</option>
                        <option value="category">Categories Grid</option>
                        <option value="history">History (Listening History)</option>
                        <option value="favorites">Favorites</option>
                        <option value="playlist">Playlists (Local)</option>
                        <option value="search">Dynamic Search Query</option>
                        <option value="manual">Manual Tracklist</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                        Query Keyword
                      </label>
                      <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                        placeholder="e.g. hits"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                        Max Limit
                      </label>
                      <input
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        min={1}
                        max={100}
                        className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                        Music Provider
                      </label>
                      <select
                        value={provider}
                        onChange={(e) => setProvider(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                      >
                        <option value="mock">Mock Music Provider</option>
                        <option value="spotify">Spotify Stub</option>
                        <option value="local">Local Database</option>
                      </select>
                    </div>

                    <div className="flex items-center pt-8">
                      <input
                        type="checkbox"
                        id="enabled"
                        checked={enabled}
                        onChange={(e) => setEnabled(e.target.checked)}
                        className="w-4 h-4 text-emerald-500 bg-stone-950 border-stone-800 rounded focus:ring-emerald-500"
                      />
                      <label htmlFor="enabled" className="ml-2 text-sm font-semibold text-stone-300">
                        Enable Section
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column: Tracks Editor */}
                {isTrackBased && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                      <h3 className="font-bold text-white text-sm uppercase tracking-wider text-stone-400">
                        Section Tracklist ({tracks.length})
                      </h3>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={fetchLimit}
                          onChange={(e) => setFetchLimit(Number(e.target.value))}
                          className="px-1.5 py-1 bg-stone-950 border border-stone-850 text-[11px] font-bold text-stone-300 rounded focus:outline-none"
                        >
                          <option value={10}>10</option>
                          <option value={20}>20</option>
                          <option value={30}>30</option>
                          <option value={50}>50</option>
                        </select>
                        <button
                          type="button"
                          onClick={handleFetchTracks}
                          disabled={fetchingTracks}
                          className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded transition flex items-center gap-1.5"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${fetchingTracks ? "animate-spin" : ""}`} />
                          {fetchingTracks ? "Syncing..." : "Sync from YouTube"}
                        </button>
                      </div>
                    </div>

                    {/* Manual Add Track Subform */}
                    <div className="p-3 bg-stone-950 border border-stone-850 rounded-lg space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Add Track Manually</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Song Title"
                          value={newTrackTitle}
                          onChange={(e) => setNewTrackTitle(e.target.value)}
                          className="px-3 py-1.5 rounded bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                        <input
                          type="text"
                          placeholder="Artist Name"
                          value={newTrackArtist}
                          onChange={(e) => setNewTrackArtist(e.target.value)}
                          className="px-3 py-1.5 rounded bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="YouTube ID (vid)"
                          value={newTrackVid}
                          onChange={(e) => setNewTrackVid(e.target.value)}
                          className="col-span-2 px-3 py-1.5 rounded bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                        <input
                          type="number"
                          placeholder="Duration (sec)"
                          value={newTrackDuration}
                          onChange={(e) => setNewTrackDuration(e.target.value)}
                          className="px-3 py-1.5 rounded bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Cover Image URL (optional)"
                          value={newTrackCover}
                          onChange={(e) => setNewTrackCover(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddTrack}
                          className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded transition"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* YouTube Fetch Search Subform */}
                    <div className="p-3 bg-stone-950 border border-stone-850 rounded-lg space-y-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Search & Fetch YouTube Tracks</h4>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Enter keyword (e.g. lofi hiphop)"
                          value={searchKeyword}
                          onChange={(e) => setSearchKeyword(e.target.value)}
                          className="flex-1 px-3 py-1.5 rounded bg-stone-900 border border-stone-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSearchYoutube();
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleSearchYoutube}
                          disabled={searching}
                          className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold text-xs rounded transition flex items-center gap-1"
                        >
                          {searching ? "Searching..." : "Search"}
                        </button>
                      </div>

                      {searchResults.length > 0 && (
                        <div className="space-y-1.5 max-h-[140px] overflow-y-auto border border-stone-850 p-1.5 rounded bg-stone-900 mt-2">
                          {searchResults.map((track) => (
                            <div
                              key={track.vid}
                              className="flex items-center justify-between p-1.5 bg-stone-950 rounded hover:bg-stone-900 transition text-[11px]"
                            >
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <img
                                  src={track.cover || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=50"}
                                  alt={track.title}
                                  className="w-6 h-6 object-cover rounded shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <h5 className="font-bold text-white truncate">{track.title}</h5>
                                  <p className="text-[9px] text-stone-400 truncate">{track.artist}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleAddTrackFromSearch(track)}
                                className="px-2 py-1 bg-stone-800 hover:bg-emerald-500 hover:text-black font-bold text-[9px] rounded transition shrink-0 ml-2"
                              >
                                Add
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Tracks Scroll Area */}
                    <div className="space-y-2 max-h-[220px] overflow-y-auto border border-stone-850 p-2 rounded-lg bg-stone-950/50">
                      {tracks.length === 0 ? (
                        <p className="text-xs text-stone-500 text-center py-6">
                          No songs assigned. Click "Sync from YouTube" or add manually.
                        </p>
                      ) : (
                        tracks.map((track, index) => (
                          <div
                            key={track.vid || index}
                            className="flex items-center justify-between p-2 bg-stone-900 rounded border border-stone-850 hover:border-stone-800 transition text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img
                                src={track.cover || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=50"}
                                alt={track.title}
                                className="w-8 h-8 object-cover rounded shrink-0"
                              />
                              <div className="min-w-0">
                                <h5 className="font-bold text-white truncate">{track.title}</h5>
                                <p className="text-[10px] text-stone-400 truncate">{track.artist}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 shrink-0">
                              <span className="text-[10px] text-stone-500 font-mono">
                                {formatDuration(track.duration)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteTrack(track.vid)}
                                className="p-1 text-stone-500 hover:text-red-400 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex justify-end gap-3 border-t border-stone-800 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-sm font-semibold text-stone-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition"
                >
                  Save Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
