import { useState } from "react";
import { Menu, Moon, Sparkles, Sun, X } from "lucide-react";

function Navbar({ theme, toggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#B8BDC4]/30 bg-[#F5F5F5]/90 backdrop-blur-md dark:border-[#B8BDC4]/30 dark:bg-[#202124]/90 transition-colors">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        {/* Brand Wordmark */}
        <a
          href="#top"
          className="group flex items-center gap-2.5 text-decoration-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F5F5F5] rounded-lg"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-[#F5F5F5] text-[#54794E] shadow-xs group-hover:bg-[#3A3D42] transition-colors dark:bg-[#C7F0BD] dark:text-[#202124]">
            <Sparkles className="size-4" aria-hidden="true" />
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-xl font-bold tracking-tight text-[#202124] dark:text-[#F5F5F5]">
              Saarthi
            </span>
            <span className="size-1.5 rounded-full bg-[#C7F0BD]" aria-hidden="true" />
            <span className="ml-1 text-[11px] font-medium uppercase tracking-wider text-[#6B7280] dark:text-[#B8BDC4]">
              Srujan '26
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium" aria-label="Main Navigation">
          <a
            href="#workspace"
            className="text-[#6B7280] hover:text-[#202124] transition-colors dark:text-[#B8BDC4] dark:hover:text-[#F5F5F5]"
          >
            Workspace
          </a>
          <a
            href="#features"
            className="text-[#6B7280] hover:text-[#202124] transition-colors dark:text-[#B8BDC4] dark:hover:text-[#F5F5F5]"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="text-[#6B7280] hover:text-[#202124] transition-colors dark:text-[#B8BDC4] dark:hover:text-[#F5F5F5]"
          >
            How It Works
          </a>
        </nav>

        {/* Right Controls: Status & Theme Toggle */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-[#B8BDC4]/35 bg-[#3A3D42]/25 px-3 py-1 text-xs font-medium text-[#202124] dark:border-[#B8BDC4]/40 dark:bg-[#2B2D31] dark:text-[#F5F5F5]">
            <span className="size-1.5 rounded-full bg-[#C7F0BD] dark:bg-[#C7F0BD]" />
            AI Notice Analysis
          </span>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            className="flex size-9 items-center justify-center rounded-xl border border-[#B8BDC4]/35 bg-white text-[#202124] shadow-2xs hover:bg-[#3A3D42]/40 transition-colors dark:border-[#B8BDC4]/40 dark:bg-[#2B2D31] dark:text-[#F5F5F5] dark:hover:bg-[#3A3D42]"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="size-4 text-[#54794E]" aria-hidden="true" />
            ) : (
              <Moon className="size-4 text-[#202124]" aria-hidden="true" />
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="flex size-9 items-center justify-center rounded-xl border border-[#B8BDC4]/35 text-[#202124] md:hidden hover:bg-[#3A3D42]/30 dark:border-[#B8BDC4]/40 dark:text-[#F5F5F5]"
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t border-[#B8BDC4]/30 bg-[#F5F5F5] px-4 py-4 md:hidden dark:border-[#B8BDC4]/30 dark:bg-[#202124]">
          <nav className="flex flex-col gap-3 text-sm font-medium">
            <a
              href="#workspace"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-2 py-1.5 text-[#202124] hover:bg-[#3A3D42]/40 dark:text-[#F5F5F5]"
            >
              Workspace
            </a>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-2 py-1.5 text-[#202124] hover:bg-[#3A3D42]/40 dark:text-[#F5F5F5]"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-2 py-1.5 text-[#202124] hover:bg-[#3A3D42]/40 dark:text-[#F5F5F5]"
            >
              How It Works
            </a>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#B8BDC4]">
                <span className="size-1.5 rounded-full bg-[#C7F0BD] dark:bg-[#C7F0BD]" />
                AI Notice Analysis · Srujan 2026
              </span>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
