import { CalendarClock, FileText, Languages } from "lucide-react";

const features = [
  {
    num: "01",
    title: "Simplify",
    tagline: "Dense memos distilled",
    description:
      "Synthesizes pages of bureaucratic administrative notices into clear, high-impact student directives and eligibility criteria.",
    icon: FileText,
  },
  {
    num: "02",
    title: "Translate",
    tagline: "Regional academic clarity",
    description:
      "Contextual translation across English, हिन्दी, and मराठी that preserves institutional abbreviations, college rules, and course codes.",
    icon: Languages,
  },
  {
    num: "03",
    title: "Important Dates",
    tagline: "Notice-grounded dates",
    description:
      "Highlights dates explicitly stated in the notice and keeps their original wording for review.",
    icon: CalendarClock,
  },
];

function FeatureStrip() {
  return (
    <section id="features" className="scroll-mt-20 mx-auto max-w-6xl px-4 sm:px-6 py-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-[#B8BDC4]/20 pb-4 dark:border-[#B8BDC4]/30">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#54794E] dark:text-[#C7F0BD]">
            <span>AI Notice Analysis</span>
          </div>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#202124] dark:text-[#F5F5F5]">
            Built for college productivity
          </h2>
        </div>
        <span className="text-xs text-[#6B7280] dark:text-[#B8BDC4]">
          English · हिन्दी · मराठी
        </span>
      </div>

      {/* 3-Part Horizontal Feature Strip */}
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        {features.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.num}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#B8BDC4]/35 bg-white p-6 shadow-2xs hover:border-[#C7F0BD]/50 transition-all dark:border-[#B8BDC4]/40 dark:bg-[#2B2D31]"
            >
              <div>
                {/* Header: Number and Badge */}
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-[#54794E] dark:text-[#C7F0BD]">
                    {item.num}
                  </span>
                  <span className="rounded-full border border-[#B8BDC4]/30 bg-[#3A3D42]/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#202124] dark:border-[#B8BDC4]/40 dark:bg-[#2B2D31] dark:text-[#F5F5F5]">
                    Available
                  </span>
                </div>

                {/* Icon & Title */}
                <div className="mt-4 flex items-center gap-2.5">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-[#C7F0BD] text-[#202124] dark:bg-[#C7F0BD] dark:text-[#202124]">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold text-[#202124] dark:text-[#F5F5F5]">
                      {item.title}
                    </h3>
                    <p className="text-[11px] font-semibold text-[#54794E] dark:text-[#C7F0BD]">
                      {item.tagline}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="mt-3 text-xs leading-relaxed text-[#6B7280] dark:text-[#B8BDC4]">
                  {item.description}
                </p>
              </div>

              {/* Bottom tag */}
              <div className="mt-5 border-t border-[#B8BDC4]/20 pt-3 text-[11px] text-[#6B7280] dark:border-[#B8BDC4]/30 dark:text-[#B8BDC4]">
                <span>AI Module · Srujan 2026</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FeatureStrip;
