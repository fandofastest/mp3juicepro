"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api-client";
import { 
  Users, Award, Activity, PlayCircle, Heart, Flame, Search, ArrowUpRight 
} from "lucide-react";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest("/dashboard")
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Failed to load dashboard data");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
        Error: {error}
      </div>
    );
  }

  const { cards, topCategories, topSearches, recentActivities, charts } = data;

  const statCards = [
    { name: "Total Listeners", value: cards.totalUsers, icon: Users, color: "text-blue-400" },
    { name: "Premium Subscribers", value: cards.premiumUsers, icon: Award, color: "text-emerald-400" },
    { name: "Daily Active Users", value: cards.dailyActiveUsers, icon: Activity, color: "text-purple-400" },
    { name: "Global Plays", value: cards.playCount, icon: PlayCircle, color: "text-pink-400" },
    { name: "Favourited Tracks", value: cards.favoriteCount, icon: Heart, color: "text-red-400" },
  ];

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Dashboard Overview</h1>
        <p className="text-sm text-stone-400 mt-1">Real-time statistics and user actions across the platform.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="p-6 rounded-xl bg-stone-900 border border-stone-800 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{card.name}</span>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white tracking-tight">{card.value}</p>
                <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-medium">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+12.4% this week</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* SVG Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User growth chart */}
        <div className="p-6 rounded-xl bg-stone-900 border border-stone-800">
          <h3 className="text-sm font-semibold text-stone-300 uppercase tracking-wider mb-6">User Acquisition (6 months)</h3>
          <div className="h-64 flex items-end justify-between gap-2 pt-6">
            {charts.userGrowthChart.map((month: any, idx: number) => {
              const maxUsers = Math.max(...charts.userGrowthChart.map((m: any) => m.users));
              const heightPercent = (month.users / maxUsers) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full flex items-end justify-center gap-1 h-44">
                    {/* Access Users */}
                    <div 
                      style={{ height: `${heightPercent}%` }}
                      className="w-1/2 bg-emerald-500/20 group-hover:bg-emerald-500/40 rounded-t-sm transition-all duration-300 relative"
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-emerald-400 opacity-0 group-hover:opacity-100 transition font-mono">
                        {month.users}
                      </span>
                    </div>
                    {/* Premium Users */}
                    <div 
                      style={{ height: `${(month.premium / maxUsers) * 100}%` }}
                      className="w-1/2 bg-emerald-500 group-hover:bg-emerald-400 rounded-t-sm transition-all duration-300 relative"
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-emerald-300 opacity-0 group-hover:opacity-100 transition font-mono">
                        {month.premium}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">{month.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Plays Trend Chart */}
        <div className="p-6 rounded-xl bg-stone-900 border border-stone-800">
          <h3 className="text-sm font-semibold text-stone-300 uppercase tracking-wider mb-6">Weekly Stream Plays</h3>
          <div className="h-64 flex items-end justify-between gap-2 pt-6">
            {charts.playsChart.map((day: any, idx: number) => {
              const maxPlays = Math.max(...charts.playsChart.map((d: any) => d.plays));
              const heightPercent = (day.plays / maxPlays) * 100;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-8 bg-stone-800 group-hover:bg-emerald-500/20 border border-stone-700/50 hover:border-emerald-500/30 rounded-t-md h-44 flex items-end justify-center overflow-hidden transition-all duration-200">
                    <div 
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-emerald-500/70 group-hover:bg-emerald-500 rounded-t-sm transition-all duration-500 relative"
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-white opacity-0 group-hover:opacity-100 transition font-mono">
                        {day.plays}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">{day.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top searches & Categories */}
        <div className="p-6 rounded-xl bg-stone-900 border border-stone-800 lg:col-span-1 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-emerald-400" />
              Trending Search Terms
            </h3>
            <div className="space-y-2">
              {topSearches.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-stone-950 border border-stone-900/50">
                  <span className="text-sm font-medium text-white">{item.term}</span>
                  <span className="text-xs text-stone-400 bg-stone-800 px-2.5 py-0.5 rounded-full font-mono">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-stone-300 uppercase tracking-wider flex items-center gap-2 mb-4">
              <Flame className="w-4 h-4 text-orange-400" />
              Top Categories
            </h3>
            <div className="space-y-2">
              {topCategories.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-stone-950 border border-stone-900/50">
                  <span className="text-sm font-medium text-white">{item.name}</span>
                  <span className="text-xs text-stone-400 bg-stone-800 px-2.5 py-0.5 rounded-full font-mono">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Audit Log Activities */}
        <div className="p-6 rounded-xl bg-stone-900 border border-stone-800 lg:col-span-2">
          <h3 className="text-sm font-semibold text-stone-300 uppercase tracking-wider mb-6">Recent System Logs</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-300">
              <thead>
                <tr className="border-b border-stone-800 text-stone-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="pb-3">Action</th>
                  <th className="pb-3">Module</th>
                  <th className="pb-3">User ID</th>
                  <th className="pb-3 text-right">Logged At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/40">
                {recentActivities.map((act: any) => (
                  <tr key={act.id} className="hover:bg-stone-800/20">
                    <td className="py-3.5 font-medium text-white">
                      <span className="capitalize">{act.action}</span>
                    </td>
                    <td className="py-3.5 text-stone-400 uppercase text-xs tracking-wider">{act.resource}</td>
                    <td className="py-3.5 font-mono text-xs text-stone-500">{act.userId}</td>
                    <td className="py-3.5 text-right text-xs text-stone-400 font-mono">
                      {new Date(act.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
