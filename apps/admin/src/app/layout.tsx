"use client";

import Providers, { useAuth } from "../components/providers";
import Link from "next/navigation";
import { usePathname } from "next/navigation";
import { 
  Music, LayoutDashboard, Sliders, FolderHeart, Image, Database, 
  Settings, LogOut, User as UserIcon, ListMusic, Menu, Smartphone
} from "lucide-react";
import { useState } from "react";
import "./globals.css";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, logout, token } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Users Directory", href: "/users", icon: UserIcon },
    { name: "Music Tracks", href: "/tracks", icon: Music },
    { name: "Home Builder", href: "/builder", icon: Sliders },
    { name: "Categories", href: "/categories", icon: FolderHeart },
    { name: "Banners", href: "/banners", icon: Image },
    { name: "App Configurations", href: "/app-config", icon: Smartphone },
    { name: "Cache Manager", href: "/cache", icon: Database },
    { name: "System Settings", href: "/settings", icon: Settings },
  ];

  if (!token) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#0c0a09] text-stone-100">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-stone-800 bg-[#1c1917] shrink-0">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-stone-800">
          <Music className="w-6 h-6 text-emerald-500 animate-pulse-slow" />
          <span className="font-bold text-lg tracking-wider text-white">MP3JUICE PRO</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition duration-200 ${
                  active
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-stone-400 hover:bg-stone-800/50 hover:text-stone-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-800 bg-stone-900/20">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <UserIcon className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{user?.displayName}</p>
              <p className="text-[10px] text-stone-400">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/5 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 h-16 border-b border-stone-800 bg-[#1c1917]/50 backdrop-blur-md sticky top-0 z-30">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-stone-400 hover:bg-stone-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="text-sm font-semibold text-stone-300">
            {menuItems.find((item) => item.href === pathname)?.name || "CMS Platform"}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              API Active
            </span>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)} />
            <div className="relative flex flex-col w-64 bg-[#1c1917] h-full border-r border-stone-800">
              <div className="flex items-center gap-3 px-6 h-16 border-b border-stone-800">
                <Music className="w-6 h-6 text-emerald-500" />
                <span className="font-bold text-lg tracking-wider text-white">MP3JUICE</span>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                        active
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "text-stone-400 hover:bg-stone-800 hover:text-stone-100"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </a>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-stone-800">
                <button
                  onClick={() => { setMobileMenuOpen(false); logout(); }}
                  className="flex items-center gap-3 w-full px-4 py-2 text-xs text-red-400 hover:bg-stone-800 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Portal */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 spotify-gradient">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </Providers>
      </body>
    </html>
  );
}
