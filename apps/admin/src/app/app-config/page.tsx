"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api-client";
import { 
  Smartphone, Plus, Edit2, Trash2, ShieldAlert, CheckCircle, 
  Settings, ToggleLeft, ToggleRight, Radio, RefreshCw 
} from "lucide-react";

export default function AppConfigManager() {
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<any>(null);

  // Form Fields
  const [packageName, setPackageName] = useState("");
  const [adProvider, setAdProvider] = useState("none");
  const [bannerEnabled, setBannerEnabled] = useState(false);
  const [interstitialEnabled, setInterstitialEnabled] = useState(false);
  const [rewardedEnabled, setRewardedEnabled] = useState(false);
  const [nativeEnabled, setNativeEnabled] = useState(false);
  const [interstitialInterval, setInterstitialInterval] = useState(5);

  // AdMob Specific
  const [appId, setAppId] = useState("");
  const [bannerAdUnitId, setBannerAdUnitId] = useState("");
  const [interstitialAdUnitId, setInterstitialAdUnitId] = useState("");
  const [rewardedAdUnitId, setRewardedAdUnitId] = useState("");
  const [nativeAdUnitId, setNativeAdUnitId] = useState("");

  // Promo Banner Settings
  const [promoBannerEnabled, setPromoBannerEnabled] = useState(false);
  const [promoBannerImage, setPromoBannerImage] = useState("");
  const [promoBannerTargetUrl, setPromoBannerTargetUrl] = useState("");

  // App Update / Force Update
  const [forceUpdate, setForceUpdate] = useState(false);
  const [minimumVersion, setMinimumVersion] = useState("1.0.0");
  const [updateUrl, setUpdateUrl] = useState("");

  // Safe Mode Settings
  const [safeMode, setSafeMode] = useState(false);

  const fetchConfigs = () => {
    setLoading(true);
    apiRequest("/app-config")
      .then((res) => {
        setConfigs(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load app configurations");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const openCreateModal = () => {
    setEditingConfig(null);
    setPackageName("");
    setAdProvider("none");
    setBannerEnabled(false);
    setInterstitialEnabled(false);
    setRewardedEnabled(false);
    setNativeEnabled(false);
    setInterstitialInterval(5);
    setAppId("");
    setBannerAdUnitId("");
    setInterstitialAdUnitId("");
    setRewardedAdUnitId("");
    setNativeAdUnitId("");
    setPromoBannerEnabled(false);
    setPromoBannerImage("");
    setPromoBannerTargetUrl("");
    setForceUpdate(false);
    setMinimumVersion("1.0.0");
    setUpdateUrl("");
    setSafeMode(false);
    setModalOpen(true);
  };

  const openEditModal = (conf: any) => {
    setEditingConfig(conf);
    setPackageName(conf.packageName);
    setAdProvider(conf.ads?.adProvider || "none");
    setBannerEnabled(conf.ads?.bannerEnabled || false);
    setInterstitialEnabled(conf.ads?.interstitialEnabled || false);
    setRewardedEnabled(conf.ads?.rewardedEnabled || false);
    setNativeEnabled(conf.ads?.nativeEnabled || false);
    setInterstitialInterval(conf.ads?.interstitialInterval ?? 5);
    
    setAppId(conf.admob?.appId || "");
    setBannerAdUnitId(conf.admob?.bannerAdUnitId || "");
    setInterstitialAdUnitId(conf.admob?.interstitialAdUnitId || "");
    setRewardedAdUnitId(conf.admob?.rewardedAdUnitId || "");
    setNativeAdUnitId(conf.admob?.nativeAdUnitId || "");

    setPromoBannerEnabled(conf.promoBanner?.enabled || false);
    setPromoBannerImage(conf.promoBanner?.image || "");
    setPromoBannerTargetUrl(conf.promoBanner?.targetUrl || "");
    setForceUpdate(conf.appUpdate?.forceUpdate || false);
    setMinimumVersion(conf.appUpdate?.minimumVersion || "1.0.0");
    setUpdateUrl(conf.appUpdate?.updateUrl || "");
    setSafeMode(conf.safeMode || false);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = {
      packageName,
      ads: {
        bannerEnabled,
        interstitialEnabled,
        rewardedEnabled,
        nativeEnabled,
        interstitialInterval: Number(interstitialInterval),
        adProvider,
      },
      admob: {
        appId,
        bannerAdUnitId,
        interstitialAdUnitId,
        rewardedAdUnitId,
        nativeAdUnitId,
      },
      promoBanner: {
        enabled: promoBannerEnabled,
        image: promoBannerImage,
        targetUrl: promoBannerTargetUrl,
      },
      appUpdate: {
        forceUpdate,
        minimumVersion,
        updateUrl,
      },
      safeMode
    };

    try {
      if (editingConfig) {
        await apiRequest("/app-config", "PUT", {
          id: editingConfig._id,
          ...payload
        });
      } else {
        await apiRequest("/app-config", "POST", payload);
      }
      setModalOpen(false);
      fetchConfigs();
    } catch (err: any) {
      alert(err.message || "Failed to save configuration");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this configuration?")) return;
    try {
      await apiRequest(`/app-config?id=${id}`, "DELETE");
      fetchConfigs();
    } catch (err: any) {
      alert(err.message || "Failed to delete configuration");
    }
  };

  if (loading && configs.length === 0) {
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
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Smartphone className="w-8 h-8 text-emerald-500" />
            App Configurations
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Manage multi-app ad setups, AdMob unit keys, and settings segmented by application Package Name.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm rounded-lg transition"
        >
          <Plus className="w-4 h-4" />
          Add Configuration
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {/* Grid of Configurations */}
      {configs.length === 0 ? (
        <div className="p-12 text-center bg-stone-900 border border-stone-800 rounded-xl">
          <Smartphone className="w-12 h-12 text-stone-600 mx-auto mb-4" />
          <p className="text-stone-400 font-medium">No app configurations found.</p>
          <p className="text-xs text-stone-500 mt-1">Click "Add Configuration" to register ads setups per packageName.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configs.map((conf) => (
            <div
              key={conf._id}
              className="p-5 bg-stone-900 border border-stone-800 rounded-xl flex flex-col justify-between hover:border-stone-700 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-base truncate" title={conf.packageName}>
                      {conf.packageName}
                    </h3>
                    <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                      Provider: <span className="text-emerald-400 font-mono">{conf.ads?.adProvider || "none"}</span>
                    </span>
                  </div>
                  <Radio className={`w-5 h-5 shrink-0 ${conf.ads?.adProvider !== "none" ? "text-emerald-400 animate-pulse" : "text-stone-600"}`} />
                </div>

                <div className="p-3 bg-stone-950 border border-stone-850 rounded-lg space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Banner Ads:</span>
                    <span className={conf.ads?.bannerEnabled ? "text-emerald-400 font-semibold" : "text-stone-600"}>
                      {conf.ads?.bannerEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Interstitial Ads:</span>
                    <span className={conf.ads?.interstitialEnabled ? "text-emerald-400 font-semibold" : "text-stone-600"}>
                      {conf.ads?.interstitialEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Rewarded Ads:</span>
                    <span className={conf.ads?.rewardedEnabled ? "text-emerald-400 font-semibold" : "text-stone-600"}>
                      {conf.ads?.rewardedEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Native Ads:</span>
                    <span className={conf.ads?.nativeEnabled ? "text-emerald-400 font-semibold" : "text-stone-600"}>
                      {conf.ads?.nativeEnabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-1.5 border-t border-stone-850">
                    <span className="text-stone-400">Promo Banner:</span>
                    <span className={conf.promoBanner?.enabled ? "text-emerald-400 font-semibold" : "text-stone-600"}>
                      {conf.promoBanner?.enabled ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Force Update:</span>
                    <span className={conf.appUpdate?.forceUpdate ? "text-yellow-400 font-semibold" : "text-stone-600"}>
                      {conf.appUpdate?.forceUpdate ? `v${conf.appUpdate?.minimumVersion || "1.0.0"}` : "Off"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Safe Mode:</span>
                    <span className={conf.safeMode ? "text-red-400 font-semibold text-xs flex items-center gap-1" : "text-stone-600"}>
                      {conf.safeMode ? "Active (Catalog Only)" : "Inactive"}
                    </span>
                  </div>
                  {conf.ads?.interstitialEnabled && (
                    <div className="flex justify-between items-center pt-1 border-t border-stone-900 text-[10px]">
                      <span className="text-stone-500">Ad Click Interval:</span>
                      <span className="text-emerald-500 font-mono font-bold">{conf.ads?.interstitialInterval || 5} clicks</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-stone-800/60 pt-3 mt-4">
                <button
                  onClick={() => openEditModal(conf)}
                  className="p-1.5 rounded bg-stone-800 hover:bg-stone-700 text-emerald-400 transition"
                  title="Edit Settings"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(conf._id)}
                  className="p-1.5 rounded bg-stone-800 hover:bg-red-500/10 text-red-400 transition"
                  title="Delete App"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Editor Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-2xl p-6 bg-stone-900 border border-stone-800 rounded-xl shadow-xl z-10 max-h-[92vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingConfig ? `Modify App Config: ${packageName}` : "Register New App Config"}
            </h2>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Left Column: Package details and toggles */}
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-sm border-b border-stone-800 pb-2 uppercase tracking-wider text-stone-400">
                    Application & Ad Settings
                  </h3>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                      Package Name / Bundle Identifier
                    </label>
                    <input
                      type="text"
                      value={packageName}
                      onChange={(e) => setPackageName(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. com.mp3juice.pro"
                      disabled={!!editingConfig}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                      Active Ad Network
                    </label>
                    <select
                      value={adProvider}
                      onChange={(e) => setAdProvider(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="none">Disabled / No Ads</option>
                      <option value="admob">Google AdMob</option>
                      <option value="applovin">AppLovin SDK</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-stone-950 border border-stone-850 rounded-lg">
                    <div>
                      <label htmlFor="safeModeToggle" className="block text-xs font-semibold text-stone-300 uppercase tracking-wider">
                        Safe Mode
                      </label>
                      <p className="text-[10px] text-stone-500">If enabled, client app can only browse catalog and cannot play/download music.</p>
                    </div>
                    <button
                      type="button"
                      id="safeModeToggle"
                      onClick={() => setSafeMode(!safeMode)}
                      className="text-stone-400 hover:text-white transition shrink-0 ml-2"
                    >
                      {safeMode ? <ToggleRight className="w-9 h-9 text-red-500" /> : <ToggleLeft className="w-9 h-9" />}
                    </button>
                  </div>

                  <div className="space-y-3 pt-2 bg-stone-950 p-4 border border-stone-850 rounded-lg">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Ad Unit Controls</h4>
                    
                    <div className="flex items-center justify-between">
                      <label htmlFor="bannerToggle" className="text-xs text-stone-300">Banner Ads</label>
                      <button
                        type="button"
                        id="bannerToggle"
                        onClick={() => setBannerEnabled(!bannerEnabled)}
                        className="text-stone-400 hover:text-white transition"
                      >
                        {bannerEnabled ? <ToggleRight className="w-9 h-9 text-emerald-500" /> : <ToggleLeft className="w-9 h-9" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label htmlFor="interstitialToggle" className="text-xs text-stone-300">Interstitial Ads</label>
                      <button
                        type="button"
                        id="interstitialToggle"
                        onClick={() => setInterstitialEnabled(!interstitialEnabled)}
                        className="text-stone-400 hover:text-white transition"
                      >
                        {interstitialEnabled ? <ToggleRight className="w-9 h-9 text-emerald-500" /> : <ToggleLeft className="w-9 h-9" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label htmlFor="rewardedToggle" className="text-xs text-stone-300">Rewarded Video Ads</label>
                      <button
                        type="button"
                        id="rewardedToggle"
                        onClick={() => setRewardedEnabled(!rewardedEnabled)}
                        className="text-stone-400 hover:text-white transition"
                      >
                        {rewardedEnabled ? <ToggleRight className="w-9 h-9 text-emerald-500" /> : <ToggleLeft className="w-9 h-9" />}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label htmlFor="nativeToggle" className="text-xs text-stone-300">Native Advanced Ads</label>
                      <button
                        type="button"
                        id="nativeToggle"
                        onClick={() => setNativeEnabled(!nativeEnabled)}
                        className="text-stone-400 hover:text-white transition"
                      >
                        {nativeEnabled ? <ToggleRight className="w-9 h-9 text-emerald-500" /> : <ToggleLeft className="w-9 h-9" />}
                      </button>
                    </div>

                    {interstitialEnabled && (
                      <div className="pt-2 border-t border-stone-850">
                        <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
                          Interstitial Trigger Interval (clicks)
                        </label>
                        <input
                          type="number"
                          value={interstitialInterval}
                          onChange={(e) => setInterstitialInterval(Number(e.target.value))}
                          min={1}
                          max={50}
                          className="w-full px-3 py-1.5 rounded bg-stone-900 border border-stone-800 text-xs text-white"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: AdMob Keys Configuration */}
                <div className="space-y-4">
                  <h3 className="font-bold text-white text-sm border-b border-stone-800 pb-2 uppercase tracking-wider text-stone-400">
                    Google AdMob Unit IDs
                  </h3>

                  {adProvider !== "admob" ? (
                    <div className="p-8 text-center bg-stone-950 border border-stone-850 rounded-lg flex flex-col justify-center items-center h-[340px]">
                      <Settings className="w-10 h-10 text-stone-600 mb-2" />
                      <p className="text-xs text-stone-500">AdMob Unit IDs will only be configurable when Google AdMob is chosen as the active network.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                          AdMob App ID
                        </label>
                        <input
                          type="text"
                          value={appId}
                          onChange={(e) => setAppId(e.target.value)}
                          placeholder="e.g. ca-app-pub-xxxxxxxxxxxxxxxx~xxxxxxxxxx"
                          className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-850 text-white text-xs font-mono focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                          Banner Ad Unit ID
                        </label>
                        <input
                          type="text"
                          value={bannerAdUnitId}
                          onChange={(e) => setBannerAdUnitId(e.target.value)}
                          placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx"
                          className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-850 text-white text-xs font-mono focus:outline-none"
                          disabled={!bannerEnabled}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                          Interstitial Ad Unit ID
                        </label>
                        <input
                          type="text"
                          value={interstitialAdUnitId}
                          onChange={(e) => setInterstitialAdUnitId(e.target.value)}
                          placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx"
                          className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-850 text-white text-xs font-mono focus:outline-none"
                          disabled={!interstitialEnabled}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                          Rewarded Video Ad Unit ID
                        </label>
                        <input
                          type="text"
                          value={rewardedAdUnitId}
                          onChange={(e) => setRewardedAdUnitId(e.target.value)}
                          placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx"
                          className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-850 text-white text-xs font-mono focus:outline-none"
                          disabled={!rewardedEnabled}
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">
                          Native Advanced Ad Unit ID
                        </label>
                        <input
                          type="text"
                          value={nativeAdUnitId}
                          onChange={(e) => setNativeAdUnitId(e.target.value)}
                          placeholder="ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx"
                          className="w-full px-3 py-2 rounded-lg bg-stone-950 border border-stone-850 text-white text-xs font-mono focus:outline-none"
                          disabled={!nativeEnabled}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Promo Banner and Force Update settings row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-stone-800">
                {/* Promo Banner Settings Card */}
                <div className="p-4 bg-stone-950 border border-stone-850 rounded-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-850 pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Promotional Banner</h4>
                      <p className="text-[10px] text-stone-500">Show promo billboard inside client apps.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPromoBannerEnabled(!promoBannerEnabled)}
                      className="text-stone-400 hover:text-white transition"
                    >
                      {promoBannerEnabled ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                  </div>

                  {promoBannerEnabled && (
                    <div className="space-y-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                          Banner Image URL
                        </label>
                        <input
                          type="text"
                          value={promoBannerImage}
                          onChange={(e) => setPromoBannerImage(e.target.value)}
                          placeholder="https://example.com/banner.png"
                          className="w-full px-3 py-2 rounded-lg bg-stone-905 border border-stone-800 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                          Target Redirect URL / Target URI
                        </label>
                        <input
                          type="text"
                          value={promoBannerTargetUrl}
                          onChange={(e) => setPromoBannerTargetUrl(e.target.value)}
                          placeholder="https://example.com/redirect"
                          className="w-full px-3 py-2 rounded-lg bg-stone-905 border border-stone-800 text-xs text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* App Version & Forced Update Settings Card */}
                <div className="p-4 bg-stone-950 border border-stone-850 rounded-lg space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-850 pb-2">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Force Layout / App Update</h4>
                      <p className="text-[10px] text-stone-500">Require update check before loading content.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForceUpdate(!forceUpdate)}
                      className="text-stone-400 hover:text-white transition"
                    >
                      {forceUpdate ? <ToggleRight className="w-8 h-8 text-emerald-500" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                  </div>

                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                        Minimum App Version Required
                      </label>
                      <input
                        type="text"
                        value={minimumVersion}
                        onChange={(e) => setMinimumVersion(e.target.value)}
                        placeholder="e.g. 1.0.0"
                        className="w-full px-3 py-2 rounded-lg bg-stone-905 border border-stone-800 text-xs text-white font-mono"
                      />
                    </div>
                    {forceUpdate && (
                      <div>
                        <label className="block text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                          Update Action Link / Play Store URL
                        </label>
                        <input
                          type="text"
                          value={updateUrl}
                          onChange={(e) => setUpdateUrl(e.target.value)}
                          placeholder="market://details?id=..."
                          className="w-full px-3 py-2 rounded-lg bg-stone-905 border border-stone-800 text-xs text-white"
                        />
                      </div>
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
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
