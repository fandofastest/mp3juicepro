"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api-client";
import { 
  Plus, Edit2, Trash2, CheckCircle, XCircle, ArrowUp, ArrowDown, Eye, Settings, Sliders 
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
        });
      }
      setModalOpen(false);
      fetchSections();
    } catch (err: any) {
      alert(err.message || "Failed to save section");
    }
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
          <div className="relative w-full max-w-lg p-6 bg-stone-900 border border-stone-800 rounded-xl shadow-xl z-10 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingSection ? "Modify Home Section" : "Create New Home Section"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
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

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-sm font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition"
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
