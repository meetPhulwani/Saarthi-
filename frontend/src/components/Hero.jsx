import { ArrowDown, FileText, Sparkles } from "lucide-react";

function Hero() {
  return (
    <section className="relative overflow-hidden pt-8 pb-6 sm:pt-12 sm:pb-8">
      {/* Background abstract editorial shapes */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {/* Soft Thistle wash */}
        <div className="absolute top-10 right-1/4 size-96 rounded-full bg-[#3A3D42]/35 blur-3xl dark:bg-[#3A3D42]/10" />
        {/* Tea Green micro accent blur */}
        <div className="absolute -bottom-10 left-10 size-48 rounded-full bg-[#C7F0BD]/25 blur-2xl dark:bg-[#C7F0BD]/10" />
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Asymmetric Editorial Typography */}
          <div className="lg:col-span-7 flex flex-col items-start">
            {/* Gen-Z / Creative pill */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B8BDC4]/35 bg-[#F5F5F5] px-3.5 py-1 text-xs font-medium text-[#6B7280] shadow-2xs dark:border-[#B8BDC4]/40 dark:bg-[#2B2D31] dark:text-[#B8BDC4]">
              <span className="flex size-2 rounded-full bg-[#C7F0BD]" />
              <span className="font-medium tracking-wide">Srujan 2026 Academic Assistant</span>
              <span className="text-[#6B7280]/50 dark:text-[#B8BDC4]/60">/</span>
              <span className="text-[#202124] dark:text-[#C7F0BD] font-semibold">v1.0 Preview</span>
            </div>

            {/* Oversized Headline */}
            <h1 className="mt-5 font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-bold tracking-tight text-[#202124] dark:text-[#F5F5F5] leading-[1.08]">
              College notices,{" "}
              <span className="relative inline-block mt-1 sm:mt-0">
                <span className="relative z-10 px-2.5 py-0.5 text-[#202124] dark:text-[#202124] font-extrabold">
                  minus the confusion.
                </span>
                <span
                  aria-hidden="true"
                  className="absolute inset-0 -skew-y-1 rounded-md bg-[#C7F0BD] shadow-xs"
                />
              </span>
            </h1>

            {/* Supporting line */}
            <p className="mt-4 text-lg sm:text-xl font-normal leading-relaxed text-[#6B7280] dark:text-[#F5F5F5] max-w-xl">
              Upload it. Understand it. Never miss what matters.
            </p>

            <p className="mt-2 text-sm text-[#6B7280] dark:text-[#B8BDC4] max-w-lg">
              Saarthi breaks down dense circulars, exam forms, and fee notices into plain language across English, हिन्दी, and मराठी.
            </p>

            {/* Micro Badges & CTA anchor */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <a
                href="#workspace"
                className="inline-flex items-center gap-2 rounded-xl bg-[#F5F5F5] px-5 py-2.5 text-sm font-semibold text-[#202124] shadow-sm hover:bg-[#3A3D42] active:scale-98 transition-all dark:bg-[#C7F0BD] dark:text-[#202124] dark:hover:bg-white"
              >
                <span>Upload a Notice</span>
                <ArrowDown className="size-4" aria-hidden="true" />
              </a>

              <div className="flex items-center gap-2 text-xs text-[#6B7280] dark:text-[#B8BDC4]">
                <span className="rounded-md border border-[#B8BDC4]/35 bg-white px-2 py-1 font-mono text-[11px] text-[#202124] dark:border-[#B8BDC4]/40 dark:bg-[#2B2D31] dark:text-[#F5F5F5]">
                  PDF · PNG · JPG
                </span>
                <span className="text-[#6B7280] dark:text-[#B8BDC4]">up to 10 MB</span>
              </div>
            </div>
          </div>

          {/* Right Column: Custom Document Illustration (Pure SVG/CSS) */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md select-none">
              {/* Backing paper sheet shadow tilt */}
              <div
                aria-hidden="true"
                className="absolute inset-0 tranneutral-x-3 tranneutral-y-3 rotate-3 rounded-2xl border border-[#B8BDC4]/30 bg-[#3A3D42]/60 dark:border-[#B8BDC4]/40 dark:bg-[#2B2D31]"
              />

              {/* Main Document Canvas Card */}
              <div className="relative -rotate-1 rounded-2xl border-2 border-[#B8BDC4]/40 bg-white p-6 shadow-md transition-transform duration-300 hover:rotate-0 dark:border-[#B8BDC4]/40 dark:bg-[#2B2D31]">
                {/* Dog-ear folded corner indicator */}
                <div
                  aria-hidden="true"
                  className="absolute top-0 right-0 size-8 border-b border-l border-[#B8BDC4]/40 bg-[#F5F5F5] shadow-2xs dark:border-[#B8BDC4]/40 dark:bg-[#202124]"
                  style={{ clipPath: "polygon(0 0, 100% 100%, 0 100%)" }}
                />

                {/* Header of Notice */}
                <div className="flex items-start justify-between border-b border-[#B8BDC4]/20 pb-3 dark:border-[#B8BDC4]/30">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-[#3A3D42]/50 text-[#202124] dark:bg-[#C7F0BD]/20 dark:text-[#C7F0BD]">
                      <FileText className="size-4" />
                    </span>
                    <div>
                      <p className="font-display text-[11px] font-bold uppercase tracking-wider text-[#202124] dark:text-[#F5F5F5]">
                        Academic Notice
                      </p>
                      <p className="text-[10px] text-[#6B7280] dark:text-[#B8BDC4]">
                        Ref: ACAD/2026/042-B
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-[#C7F0BD] px-2.5 py-0.5 text-[10px] font-bold text-[#202124] mr-4 shadow-2xs">
                    CIRCULAR
                  </span>
                </div>

                {/* Simulated Document Content Lines */}
                <div className="mt-4 space-y-2.5">
                  <div className="h-3 w-5/6 rounded-sm bg-[#F5F5F5]/15 dark:bg-[#3A3D42]/30" />
                  <div className="h-2.5 w-full rounded-sm bg-[#B8BDC4]/25 dark:bg-[#B8BDC4]/40" />
                  <div className="h-2.5 w-4/5 rounded-sm bg-[#B8BDC4]/25 dark:bg-[#B8BDC4]/40" />

                  {/* Highlighted text line in Tea Green */}
                  <div className="rounded-md bg-[#C7F0BD] p-2 text-[#202124] dark:bg-[#C7F0BD] dark:text-[#202124]">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="font-display font-bold text-[#202124]">Deadline: 28 Nov 2026</span>
                      <span className="text-[10px] text-[#54794E] font-bold uppercase tracking-wide">Critical</span>
                    </div>
                    <div className="mt-1 h-2 w-3/4 rounded-sm bg-[#F5F5F5]/20" />
                  </div>

                  <div className="h-2.5 w-11/12 rounded-sm bg-[#B8BDC4]/25 dark:bg-[#B8BDC4]/40" />
                  <div className="h-2.5 w-3/4 rounded-sm bg-[#B8BDC4]/25 dark:bg-[#B8BDC4]/40" />
                </div>

                {/* Editorial Circular Stamp (SVG) */}
                <div className="mt-4 flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280] dark:text-[#B8BDC4]">
                    <Sparkles className="size-3 text-[#54794E] dark:text-[#C7F0BD]" />
                    <span>Multilingual Summary</span>
                  </div>

                  {/* Stamp */}
                  <div className="relative flex size-12 items-center justify-center rounded-full border-2 border-dashed border-[#C7F0BD] text-[#54794E] opacity-90 rotate-[-12deg] dark:border-[#C7F0BD] dark:text-[#C7F0BD]">
                    <span className="text-center font-display text-[7px] font-extrabold uppercase leading-tight">
                      SRUJAN
                      <br />
                      2026
                      <br />
                      OFFICIAL
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
