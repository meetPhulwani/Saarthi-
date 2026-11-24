import { FileCheck, Sparkles } from "lucide-react";

function Footer() {
  return (
    <footer className="border-t border-[#B8BDC4]/30 bg-[#F5F5F5] px-4 py-8 dark:border-[#B8BDC4]/30 dark:bg-[#202124] transition-colors">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 sm:flex-row sm:items-center px-2">
        {/* Brand & Wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#F5F5F5] text-[#54794E] shadow-2xs dark:bg-[#C7F0BD] dark:text-[#202124]">
            <Sparkles className="size-4" aria-hidden="true" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-base font-bold tracking-tight text-[#202124] dark:text-[#F5F5F5]">
                Saarthi
              </span>
              <span className="size-1 rounded-full bg-[#C7F0BD]" />
              <span className="rounded-md bg-[#C7F0BD] px-1.5 py-0.2 text-[10px] font-bold text-[#202124]">
                Srujan 2026
              </span>
            </div>
            <p className="text-xs text-[#6B7280] dark:text-[#B8BDC4]">
              AI-Powered Multilingual College Notice Assistant
            </p>
          </div>
        </div>

        {/* Validation Note */}
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <div className="flex items-center gap-1.5 text-xs font-medium text-[#202124] dark:text-[#F5F5F5]">
            <FileCheck className="size-3.5 text-[#54794E] dark:text-[#C7F0BD]" aria-hidden="true" />
            <span>Notice Validation</span>
          </div>
          <p className="text-[11px] text-[#6B7280] dark:text-[#B8BDC4]">
            Check AI summaries and dates against the original notice.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
