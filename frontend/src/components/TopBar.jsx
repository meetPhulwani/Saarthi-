import { Menu, Moon, Sun } from "lucide-react";

function TopBar({ onOpenMobile, theme, toggleTheme, activeSection }) {
  const sectionLabels = {
    workspace: "Notice Workspace",
    features: "Feature Preview",
    "how-it-works": "How It Works",
  };

  const currentLabel = sectionLabels[activeSection] || "Notice Workspace";

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-neutral-200/80 bg-white/75 px-4 backdrop-blur-md sm:px-6 dark:border-[#B8BDC4]/25 dark:bg-[#202124]/90">
      {/* Left: Mobile hamburger & Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={onOpenMobile}
          className="flex size-9 items-center justify-center rounded-xl border border-neutral-200/90 text-neutral-700 hover:bg-neutral-100 lg:hidden dark:border-[#B8BDC4]/30 dark:text-[#B8BDC4] dark:hover:bg-[#3A3D42]"
          aria-label="Open navigation menu"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-neutral-400 dark:text-[#B8BDC4]/70">
            Saarthi
          </span>
          <span className="text-neutral-300 dark:text-[#B8BDC4]/70">/</span>
          <span className="font-semibold text-neutral-800 dark:text-[#B8BDC4]">
            {currentLabel}
          </span>
        </div>
      </div>

      {/* Right: Srujan Badge & Theme Toggle */}
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-neutral-200/90 bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-700 shadow-2xs dark:border-[#B8BDC4]/30 dark:bg-[#2B2D31]/90 dark:text-[#B8BDC4]">
          <span className="size-2 rounded-full bg-neutral-400 dark:bg-[#B8BDC4]" />
          <span>Srujan 2026 Edition</span>
        </div>

        {/* Quick theme toggle */}
        <button
          type="button"
          onClick={toggleTheme}
          className="flex size-9 items-center justify-center rounded-xl border border-neutral-200/90 bg-white text-neutral-700 shadow-2xs transition-all hover:bg-neutral-50 dark:border-[#B8BDC4]/30 dark:bg-[#2B2D31] dark:text-[#B8BDC4] dark:hover:bg-[#3A3D42]"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          {theme === "dark" ? (
            <Moon className="size-4 text-[#54794E]" aria-hidden="true" />
          ) : (
            <Sun className="size-4 text-amber-500" aria-hidden="true" />
          )}
        </button>
      </div>
    </header>
  );
}

export default TopBar;
