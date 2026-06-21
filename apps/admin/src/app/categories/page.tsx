"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api-client";
import { Plus, Edit2, Trash2, Folder, RefreshCw } from "lucide-react";

export default function CategoriesManager() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#1DB954");
  const [sortOrder, setSortOrder] = useState(0);
  const [enabled, setEnabled] = useState(true);

  // Category Tracks Editor States
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

  const fetchCategories = () => {
    setLoading(true);
    apiRequest("/categories")
      .then((res) => {
        setCategories(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load categories");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setColor("#1DB954");
    setSortOrder(categories.length + 1);
    setEnabled(true);
    setTracks([]);
    setSearchKeyword("");
    setSearchResults([]);
    setFetchLimit(20);
    setModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setTitle(cat.title);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setColor(cat.color || "#1DB954");
    setSortOrder(cat.sortOrder);
    setEnabled(cat.enabled);
    setTracks(cat.tracks || []);
    setSearchKeyword("");
    setSearchResults([]);
    setFetchLimit(20);
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingCategory) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await apiRequest("/categories", "PUT", {
          id: editingCategory._id,
          title,
          slug,
          description,
          color,
          sortOrder: Number(sortOrder),
          enabled,
          tracks,
        });
      } else {
        await apiRequest("/categories", "POST", {
          title,
          slug,
          description,
          color,
          sortOrder: Number(sortOrder),
          enabled,
          tracks,
        });
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      alert(err.message || "Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await apiRequest(`/categories?id=${id}`, "DELETE");
      fetchCategories();
    } catch (err: any) {
      alert(err.message || "Failed to delete category");
    }
  };

  // Track manipulation functions
  const handleDeleteTrack = (vid: string) => {
    setTracks(tracks.filter((t) => t.vid !== vid));
  };

  const handleFetchTracks = async () => {
    if (!slug) {
      alert("Category slug is required to fetch tracks.");
      return;
    }
    setFetchingTracks(true);
    try {
      const res = await apiRequest(`/categories/tracks?slug=${slug}&limit=${fetchLimit}`);
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
      alert("This track already exists in this category.");
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
      alert("This track already exists in this category.");
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

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white font-sans">Categories Directory</h1>
          <p className="text-sm text-stone-400 mt-1">Organize browsing categories for client layouts.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Grid of Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <div
            key={cat._id}
            style={{ borderLeftColor: cat.color }}
            className={`p-5 bg-stone-900 border-l-4 border border-stone-800 rounded-xl relative flex flex-col justify-between h-48 transition hover:border-stone-700/50 ${
              !cat.enabled ? "opacity-50" : ""
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white text-lg truncate flex-1 mr-2">{cat.title}</h3>
                <Folder className="w-5 h-5 opacity-40 shrink-0" style={{ color: cat.color }} />
              </div>
              <p className="text-xs text-stone-500 mt-1 font-mono">{cat.slug}</p>
              <p className="text-xs text-stone-400 line-clamp-2 mt-2">{cat.description || "No description."}</p>
              <span className="text-[10px] text-stone-500 block mt-2 font-semibold">
                Tracks: {cat.tracks?.length || 0} songs
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-stone-800/60 pt-3 mt-2">
              <span className="text-[10px] uppercase font-bold text-stone-500 font-mono">Order: {cat.sortOrder}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-emerald-400 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(cat._id)}
                  className="p-1.5 rounded bg-stone-800 hover:bg-red-500/10 text-red-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
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
          <div className="relative w-full max-w-4xl p-6 bg-stone-900 border border-stone-800 rounded-xl shadow-xl z-10 max-h-[92vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingCategory ? `Modify Category: ${title}` : "Create Category"}
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Properties */}
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-sm border-b border-stone-800 pb-2 uppercase tracking-wider text-stone-400">
                    Category Properties
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                      Category Title
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Acoustic Chill"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                      Unique Slug
                    </label>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500 h-20 resize-none"
                      placeholder="Brief summary..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                        Hex Color Code
                      </label>
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="w-full h-10 p-1 bg-stone-950 border border-stone-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                        Sort Index
                      </label>
                      <input
                        type="number"
                        value={sortOrder}
                        onChange={(e) => setSortOrder(Number(e.target.value))}
                        className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center pt-2">
                    <input
                      type="checkbox"
                      id="enabled"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                      className="w-4 h-4 text-emerald-500 bg-stone-950 border-stone-800 rounded focus:ring-emerald-500"
                    />
                    <label htmlFor="enabled" className="ml-2 text-sm font-semibold text-stone-300">
                      Enable Category
                    </label>
                  </div>
                </div>

                {/* Right Column: Tracks Editor */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider text-stone-400">
                      Category Tracklist ({tracks.length})
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
