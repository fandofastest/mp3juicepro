"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../../lib/api-client";
import { Settings, Save, AlertTriangle, CheckCircle } from "lucide-react";

export default function SettingsManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [appName, setAppName] = useState("MP3Juice Pro");
  const [primaryColor, setPrimaryColor] = useState("#1DB954");
  const [secondaryColor, setSecondaryColor] = useState("#191414");
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("en");
  const [country, setCountry] = useState("US");
  const [searchLimit, setSearchLimit] = useState(20);
  const [cacheTtl, setCacheTtl] = useState(3600);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [minimumAppVersion, setMinimumAppVersion] = useState("1.0.0");
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    apiRequest("/settings")
      .then((res) => {
        setAppName(res.appName);
        setPrimaryColor(res.primaryColor);
        setSecondaryColor(res.secondaryColor);
        setTheme(res.theme);
        setLanguage(res.language);
        setCountry(res.country);
        setSearchLimit(res.searchLimit);
        setCacheTtl(res.cacheTtl);
        setMaintenanceMode(res.maintenanceMode);
        setMinimumAppVersion(res.minimumAppVersion);
        setApiKeys(res.apiKeys || {});
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load settings");
        setLoading(false);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      await apiRequest("/settings", "PUT", {
        appName,
        primaryColor,
        secondaryColor,
        theme,
        language,
        country,
        searchLimit: Number(searchLimit),
        cacheTtl: Number(cacheTtl),
        maintenanceMode,
        minimumAppVersion,
        apiKeys,
      });
      setSuccess("Global configurations updated successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update configurations");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">System Settings</h1>
          <p className="text-sm text-stone-400 mt-1">Configure global application state, colors, limits, and API integrations.</p>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-center gap-2">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General settings card */}
          <div className="p-6 bg-stone-900 border border-stone-800 rounded-xl space-y-4">
            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
              <Settings className="w-5 h-5 text-emerald-500" />
              General Branding
            </h3>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                Application Title
              </label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                  Accent Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-10 p-1 bg-stone-950 border border-stone-800 rounded-lg cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-950 border border-stone-800 text-stone-300 text-sm focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-10 p-1 bg-stone-950 border border-stone-800 rounded-lg cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-full px-3 py-2.5 bg-stone-950 border border-stone-800 text-stone-300 text-sm focus:outline-none font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                  Default Theme
                </label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm"
                >
                  <option value="dark">Dark Theme</option>
                  <option value="light">Light Theme</option>
                  <option value="system">Follow System</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                  Language
                </label>
                <input
                  type="text"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm"
                />
              </div>
            </div>
          </div>

          {/* Limits and states Card */}
          <div className="p-6 bg-stone-900 border border-stone-800 rounded-xl space-y-4">
            <h3 className="font-bold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Controls & Operations
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                  Search Limit
                </label>
                <input
                  type="number"
                  value={searchLimit}
                  onChange={(e) => setSearchLimit(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                  Cache Expiry (secs)
                </label>
                <input
                  type="number"
                  value={cacheTtl}
                  onChange={(e) => setCacheTtl(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                Minimum App Version
              </label>
              <input
                type="text"
                value={minimumAppVersion}
                onChange={(e) => setMinimumAppVersion(e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-800 text-white text-sm font-mono"
              />
            </div>

            <div className="p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/10 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-yellow-400 uppercase tracking-wider">Maintenance Mode</h4>
                <p className="text-[10px] text-stone-400 mt-1">If enabled, API clients will show maintenance screens.</p>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-5 h-5 text-yellow-500 bg-stone-950 border-stone-800 rounded focus:ring-yellow-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* API keys card */}
        <div className="p-6 bg-stone-900 border border-stone-800 rounded-xl space-y-4">
          <h3 className="font-bold text-white mb-2">Integrations & API Secrets</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                Spotify Client ID Stub
              </label>
              <input
                type="password"
                value={apiKeys.spotify_client_id || ""}
                onChange={(e) => setApiKeys({ ...apiKeys, spotify_client_id: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-850 text-white text-sm font-mono focus:outline-none"
                placeholder="Client ID (mock config)"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                YouTube Data API v3 Key Stub
              </label>
              <input
                type="password"
                value={apiKeys.youtube_api_key || ""}
                onChange={(e) => setApiKeys({ ...apiKeys, youtube_api_key: e.target.value })}
                className="w-full px-4 py-2.5 rounded-lg bg-stone-950 border border-stone-850 text-white text-sm font-mono focus:outline-none"
                placeholder="API Key (mock config)"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold rounded-lg text-sm transition shadow-lg shadow-emerald-500/10 duration-200"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving Changes..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
