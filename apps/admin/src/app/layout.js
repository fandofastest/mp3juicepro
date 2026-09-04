"use client";
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RootLayout;
const providers_1 = __importStar(require("../components/providers"));
const navigation_1 = require("next/navigation");
const lucide_react_1 = require("lucide-react");
const react_1 = require("react");
require("./globals.css");
function DashboardLayoutContent({ children }) {
    const { user, logout, token } = (0, providers_1.useAuth)();
    const pathname = (0, navigation_1.usePathname)();
    const [mobileMenuOpen, setMobileMenuOpen] = (0, react_1.useState)(false);
    const menuItems = [
        { name: "Dashboard", href: "/", icon: lucide_react_1.LayoutDashboard },
        { name: "Users Directory", href: "/users", icon: lucide_react_1.User },
        { name: "Music Tracks", href: "/tracks", icon: lucide_react_1.Music },
        { name: "Play Hit Logs", href: "/play-logs", icon: lucide_react_1.ListMusic },
        { name: "Home Builder", href: "/builder", icon: lucide_react_1.Sliders },
        { name: "Categories", href: "/categories", icon: lucide_react_1.FolderHeart },
        { name: "Banners", href: "/banners", icon: lucide_react_1.Image },
        { name: "App Configurations", href: "/app-config", icon: lucide_react_1.Smartphone },
        { name: "Cache Manager", href: "/cache", icon: lucide_react_1.Database },
        { name: "System Settings", href: "/settings", icon: lucide_react_1.Settings },
    ];
    if (!token) {
        return <>{children}</>;
    }
    return (<div className="flex min-h-screen bg-[#0c0a09] text-stone-100">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-stone-800 bg-[#1c1917] shrink-0">
        <div className="flex items-center gap-3 px-6 h-16 border-b border-stone-800">
          <lucide_react_1.Music className="w-6 h-6 text-emerald-500 animate-pulse-slow"/>
          <span className="font-bold text-lg tracking-wider text-white">MP3JUICE PRO</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (<a key={item.name} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition duration-200 ${active
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-stone-400 hover:bg-stone-800/50 hover:text-stone-100"}`}>
                <Icon className="w-5 h-5"/>
                {item.name}
              </a>);
        })}
        </nav>

        <div className="p-4 border-t border-stone-800 bg-stone-900/20">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
              <lucide_react_1.User className="w-4 h-4 text-emerald-400"/>
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{user?.displayName}</p>
              <p className="text-[10px] text-stone-400">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-3 w-full px-4 py-2 text-xs font-medium text-red-400 hover:bg-red-500/5 rounded-lg transition">
            <lucide_react_1.LogOut className="w-4 h-4"/>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-6 h-16 border-b border-stone-800 bg-[#1c1917]/50 backdrop-blur-md sticky top-0 z-30">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg text-stone-400 hover:bg-stone-800">
            <lucide_react_1.Menu className="w-5 h-5"/>
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
        {mobileMenuOpen && (<div className="md:hidden fixed inset-0 z-50 flex">
            <div className="fixed inset-0 bg-black/60" onClick={() => setMobileMenuOpen(false)}/>
            <div className="relative flex flex-col w-64 bg-[#1c1917] h-full border-r border-stone-800">
              <div className="flex items-center gap-3 px-6 h-16 border-b border-stone-800">
                <lucide_react_1.Music className="w-6 h-6 text-emerald-500"/>
                <span className="font-bold text-lg tracking-wider text-white">MP3JUICE</span>
              </div>
              <nav className="flex-1 px-4 py-6 space-y-1">
                {menuItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (<a key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${active
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-stone-400 hover:bg-stone-800 hover:text-stone-100"}`}>
                      <Icon className="w-5 h-5"/>
                      {item.name}
                    </a>);
            })}
              </nav>
              <div className="p-4 border-t border-stone-800">
                <button onClick={() => { setMobileMenuOpen(false); logout(); }} className="flex items-center gap-3 w-full px-4 py-2 text-xs text-red-400 hover:bg-stone-800 rounded-lg">
                  <lucide_react_1.LogOut className="w-4 h-4"/>
                  Sign Out
                </button>
              </div>
            </div>
          </div>)}

        {/* Content Portal */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 spotify-gradient">
          {children}
        </main>
      </div>
    </div>);
}
function RootLayout({ children }) {
    return (<html lang="en" className="dark">
      <body>
        <providers_1.default>
          <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </providers_1.default>
      </body>
    </html>);
}
//# sourceMappingURL=layout.js.map