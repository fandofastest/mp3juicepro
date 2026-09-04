"use client";
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BannersManager;
const react_1 = require("react");
const api_client_1 = require("../../lib/api-client");
const lucide_react_1 = require("lucide-react");
function BannersManager() {
    const [banners, setBanners] = (0, react_1.useState)([]);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [modalOpen, setModalOpen] = (0, react_1.useState)(false);
    const [editingBanner, setEditingBanner] = (0, react_1.useState)(null);
    // Form Fields
    const [title, setTitle] = (0, react_1.useState)("");
    const [subtitle, setSubtitle] = (0, react_1.useState)("");
    const [image, setImage] = (0, react_1.useState)("");
    const [buttonText, setButtonText] = (0, react_1.useState)("");
    const [buttonColor, setButtonColor] = (0, react_1.useState)("#1DB954");
    const [targetType, setTargetType] = (0, react_1.useState)("url");
    const [targetId, setTargetId] = (0, react_1.useState)("");
    const [sortOrder, setSortOrder] = (0, react_1.useState)(0);
    const [enabled, setEnabled] = (0, react_1.useState)(true);
    const fetchBanners = () => {
        setLoading(true);
        (0, api_client_1.apiRequest)("/banners")
            .then((res) => {
            setBanners(res);
            setLoading(false);
        })
            .catch((err) => {
            setError(err.message || "Failed to load banners");
            setLoading(false);
        });
    };
    (0, react_1.useEffect)(() => {
        fetchBanners();
    }, []);
    const openCreateModal = () => {
        setEditingBanner(null);
        setTitle("");
        setSubtitle("");
        setImage("https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800&auto=format&fit=crop&q=60");
        setButtonText("Listen Now");
        setButtonColor("#1DB954");
        setTargetType("url");
        setTargetId("");
        setSortOrder(banners.length + 1);
        setEnabled(true);
        setModalOpen(true);
    };
    const openEditModal = (ban) => {
        setEditingBanner(ban);
        setTitle(ban.title);
        setSubtitle(ban.subtitle || "");
        setImage(ban.image);
        setButtonText(ban.buttonText || "");
        setButtonColor(ban.buttonColor || "#1DB954");
        setTargetType(ban.targetType);
        setTargetId(ban.targetId || "");
        setSortOrder(ban.sortOrder);
        setEnabled(ban.enabled);
        setModalOpen(true);
    };
    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title,
                subtitle,
                image,
                buttonText,
                buttonColor,
                targetType,
                targetId,
                sortOrder: Number(sortOrder),
                enabled,
            };
            if (editingBanner) {
                await (0, api_client_1.apiRequest)("/banners", "PUT", { id: editingBanner._id, ...payload });
            }
            else {
                await (0, api_client_1.apiRequest)("/banners", "POST", payload);
            }
            setModalOpen(false);
            fetchBanners();
        }
        catch (err) {
            alert(err.message || "Failed to save banner");
        }
    };
    const handleDelete = async (id) => {
        if (!confirm("Delete this banner?"))
            return;
        try {
            await (0, api_client_1.apiRequest)(`/banners?id=${id}`, "DELETE");
            fetchBanners();
        }
        catch (err) {
            alert(err.message || "Failed to delete banner");
        }
    };
    if (loading && banners.length === 0) {
        return (<div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"/>
      </div>);
    }
    return (<div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Banners Configuration</h1>
          <p className="text-sm text-stone-400 mt-1">Manage top banners and highlights showing on mobile/web clients.</p>
        </div>
        <button onClick={openCreateModal} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm rounded-lg transition">
          <lucide_react_1.Plus className="w-4 h-4"/>
          Add Banner
        </button>
      </div>

      {error && (<div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>)}

      {/* Grid of Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((ban) => (<div key={ban._id} className={`bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-md flex flex-col justify-between ${!ban.enabled ? "opacity-50" : ""}`}>
            <div className="h-40 bg-cover bg-center relative" style={{ backgroundImage: `url(${ban.image})` }}>
              <div className="absolute inset-0 bg-black/60 p-5 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-white text-lg line-clamp-1">{ban.title}</h3>
                  <p className="text-xs text-stone-300 line-clamp-2 mt-1">{ban.subtitle || "No subtitle."}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-black/40 text-stone-300">
                    {ban.targetType}: {ban.targetId || "none"}
                  </span>
                  {ban.buttonText && (<button style={{ backgroundColor: ban.buttonColor }} className="px-3 py-1 rounded text-black font-bold text-[10px] uppercase tracking-wider">
                      {ban.buttonText}
                    </button>)}
                </div>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between bg-stone-950/20">
              <span className="text-[10px] uppercase font-bold text-stone-500 font-mono">Sort Order: {ban.sortOrder}</span>
              <div className="flex gap-2">
                <button onClick={() => openEditModal(ban)} className="p-1.5 rounded bg-stone-850 hover:bg-stone-800 text-emerald-400 transition">
                  <lucide_react_1.Edit2 className="w-3.5 h-3.5"/>
                </button>
                <button onClick={() => handleDelete(ban._id)} className="p-1.5 rounded bg-stone-850 hover:bg-red-500/10 text-red-400 transition">
                  <lucide_react_1.Trash2 className="w-3.5 h-3.5"/>
                </button>
              </div>
            </div>
          </div>))}
      </div>

      {/* Editor Modal */}
      {modalOpen && (<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)}/>
          <div className="relative w-full max-w-md p-6 bg-stone-900 border border-stone-800 rounded-xl shadow-xl z-10 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-white mb-6">
              {editingBanner ? "Edit Banner Content" : "Create Banner Content"}
            </h2>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                  Banner Title
                </label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500" placeholder="e.g. Premium Sound"/>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                  Subtitle
                </label>
                <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500" placeholder="e.g. Try free for 30 days"/>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                  Banner Image URL
                </label>
                <input type="url" value={image} onChange={(e) => setImage(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500" placeholder="e.g. https://domain.com/img.jpg"/>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                    Action Button Label
                  </label>
                  <input type="text" value={buttonText} onChange={(e) => setButtonText(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500" placeholder="e.g. Upgrade"/>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                    Button Hex Color
                  </label>
                  <input type="color" value={buttonColor} onChange={(e) => setButtonColor(e.target.value)} className="w-full h-10 p-1 bg-stone-950 border border-stone-800 rounded-lg cursor-pointer"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                    Action Target Type
                  </label>
                  <select value={targetType} onChange={(e) => setTargetType(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500">
                    <option value="url">External Link URL</option>
                    <option value="category">Category slug</option>
                    <option value="genre">Genre name</option>
                    <option value="playlist">Playlist ID</option>
                    <option value="artist">Artist ID</option>
                    <option value="album">Album ID</option>
                    <option value="song">Song ID</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                    Target Reference / URL
                  </label>
                  <input type="text" value={targetId} onChange={(e) => setTargetId(e.target.value)} className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500" placeholder="e.g. https://... or identifier"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                    Sort Index
                  </label>
                  <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500"/>
                </div>

                <div className="flex items-center pt-8">
                  <input type="checkbox" id="enabled" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="w-4 h-4 text-emerald-500 bg-stone-950 border-stone-800 rounded focus:ring-emerald-500"/>
                  <label htmlFor="enabled" className="ml-2 text-sm font-semibold text-stone-300">
                    Enable Banner
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-sm font-semibold transition">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm transition">
                  Save Banner
                </button>
              </div>
            </form>
          </div>
        </div>)}
    </div>);
}
//# sourceMappingURL=page.js.map