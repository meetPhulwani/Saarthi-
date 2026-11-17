import { useEffect } from "react";
import {
  Boxes,
  FileCheck2,
  HelpCircle,
  Moon,
  Sparkles,
  Sun,
  X,
} from "lucide-react";

const navItems = [
  {
    id: "workspace",
    href: "#workspace",
    label: "Notice Workspace",
    badge: "Active",
    icon: FileCheck2,
  },
  {
    id: "features",
    href: "#features",
    label: "Feature Preview",
    badge: "v2.0",
    icon: Boxes,
  },
  {
    id: "how-it-works",
    href: "#how-it-works",
    label: "How It Works",
    badge: null,
    icon: HelpCircle,
  },
];

function Sidebar({ activeSection, onNavClick, isMobileOpen, onCloseMobile, theme, toggleTheme }) {
  // Close mobile drawer on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isMobileOpen) {
        onCloseMobile();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMobileOpen, onCloseMobile]);

  const navContent = (
    <div className="flex h-full flex-col justify-between">
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pb-6 pt-1">
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
              if (isMobileOpen) onCloseMobile();
            }}
            className="group flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="flex size-10 items-center justify-center rounded-2xl bg-[#C7F0BD] text-[#202124] shadow-md shadow-[#C7F0BD]/25 transition-transform duration-200 group-hover:scale-105">
              <Sparkles className="size-5" aria-hidden="true" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                  Saarthi
                </span>
              </div>
              <p className="text-[11px] font-medium text-neutral-500 dark:text-[#B8BDC4]">
                Srujan 2026 Assistant
              </p>
            </div>
          </a>

          {/* Close button for mobile */}
          {isMobileOpen && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="rounded-xl p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 lg:hidden dark:text-[#B8BDC4] dark:hover:bg-[#3A3D42] dark:hover:text-white"
              aria-label="Close navigation drawer"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <div className="mt-2 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-[#B8BDC4]/70">
            Navigation
          </p>
          <nav aria-label="Sidebar navigation" className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavClick(item.id);
                  }}
                  className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 ${
                    isActive
                      ? "bg-[#C7F0BD] text-[#202124] shadow-sm shadow-[#C7F0BD]/25"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-[#B8BDC4] dark:hover:bg-[#3A3D42]/80 dark:hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`size-4 transition-colors ${
                        isActive
                          ? "text-[#202124]"
                          : "text-neutral-400 group-hover:text-neutral-600 dark:text-[#B8BDC4] dark:group-hover:text-neutral-200"
                      }`}
                      aria-hidden="true"
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isActive
                          ? "bg-[#202124]/10 text-[#202124]"
                          : "bg-neutral-200/80 text-neutral-600 dark:bg-[#2B2D31] dark:text-[#B8BDC4]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Notice Validation & Status Card */}
        <div className="mt-8 rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-4 text-xs dark:border-[#B8BDC4]/25 dark:bg-[#2B2D31]/60">
          <div className="flex items-center gap-2 text-neutral-900 dark:text-white">
            <FileCheck2 className="size-4 text-[#54794E]" aria-hidden="true" />
            <span className="font-semibold">Notice Validation</span>
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-neutral-500 dark:text-[#B8BDC4]">
            AI analysis is available after backend setup.
          </p>
          <div className="mt-3 flex items-center justify-between text-[10px] font-medium text-neutral-400 dark:text-[#B8BDC4]/70">
            <span>AI Notice Analysis</span>
            <span className="size-2 rounded-full bg-neutral-400 dark:bg-[#B8BDC4]" />
          </div>
        </div>
      </div>

      {/* Sidebar Footer: Theme Toggle & Version */}
      <div className="border-t border-neutral-200/80 pt-4 dark:border-[#B8BDC4]/25">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex w-full items-center justify-between rounded-xl border border-neutral-200/90 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 shadow-2xs transition-all hover:bg-neutral-50 hover:text-neutral-900 dark:border-[#B8BDC4]/30 dark:bg-[#2B2D31] dark:text-[#B8BDC4] dark:hover:bg-[#3A3D42]"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <div className="flex items-center gap-2">
            {theme === "dark" ? (
              <Moon className="size-4 text-[#54794E]" aria-hidden="true" />
            ) : (
              <Sun className="size-4 text-amber-500" aria-hidden="true" />
            )}
            <span>{theme === "dark" ? "Dark Mode" : "Light Mode"}</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-[#B8BDC4]/70">
            Toggle
          </span>
        </button>

        <div className="mt-3 px-1 text-center">
          <p className="text-[10px] font-medium text-neutral-400 dark:text-[#B8BDC4]/70">
            Saarthi · Srujan 2026 Preview
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-neutral-200/80 bg-white/70 p-5 backdrop-blur-xl lg:flex xl:w-72 dark:border-[#B8BDC4]/25 dark:bg-[#202124]/90">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 z-50 flex lg:hidden"
        >
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-neutral-950/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Sliding Drawer */}
          <div className="relative z-10 flex h-full w-72 max-w-[85vw] flex-col border-r border-neutral-200 bg-white p-5 shadow-2xl dark:border-[#B8BDC4]/30 dark:bg-[#202124]">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
