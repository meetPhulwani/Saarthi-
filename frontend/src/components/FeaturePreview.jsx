import {
  CalendarClock,
  Clock,
  FileCheck2,
  Languages,
  Sparkles,
} from "lucide-react";

const features = [
  {
    id: "summary",
    title: "AI Executive Summary",
    tagline: "Dense memos distilled into seconds",
    description:
      "Synthesizes pages of administrative circulars into bullet points highlighting eligibility, key rules, and essential student instructions.",
    icon: FileCheck2,
    badge: "Coming Soon",
  },
  {
    id: "deadlines",
    title: "Deadline Detection",
    tagline: "Never miss a critical date",
    description:
      "Automatically extracts fee payment deadlines, exam form cutoffs, scholarship dates, and event timetables into a prioritized schedule.",
    icon: CalendarClock,
    badge: "Coming Soon",
  },
  {
    id: "multilingual",
    title: "Multilingual Translation",
    tagline: "English, Hindi, and Marathi",
    description:
      "Native regional translation preserving institutional terminology, department names, and legal academic directives accurately.",
    icon: Languages,
    badge: "Coming Soon",
  },
  {
    id: "insights",
    title: "Smart Insights",
    tagline: "Personalized action roadmap",
    description:
      "Surfaces prerequisites, required document checklists, fee amount schedules, and designated office contact details for immediate action.",
    icon: Sparkles,
    badge: "Coming Soon",
  },
];

function FeaturePreview() {
  return (
    <section id="features" className="scroll-mt-24 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#C7F0BD]/20 bg-[#C7F0BD]/5 px-3 py-1 text-xs font-semibold text-[#54794E] dark:border-[#C7F0BD]/30 dark:bg-[#C7F0BD]/15">
              <Sparkles className="size-3" aria-hidden="true" />
              Intelligence Architecture
            </div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
              Engineered for academic clarity
            </h2>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-neutral-500 dark:text-[#B8BDC4]">
              Preview our core AI document processing modules scheduled for integration in Srujan 2026.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-neutral-500 dark:text-[#B8BDC4]">
            <Clock className="size-4 text-[#54794E]" aria-hidden="true" />
            <span>Modules in active development</span>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-neutral-200/80 bg-white/90 p-6 shadow-[0_8px_30px_-15px_rgba(32,33,36,0.08)] backdrop-blur-md transition-all duration-200 hover:-tranneutral-y-1 hover:border-[#C7F0BD]/40 hover:shadow-[0_12px_36px_-12px_rgba(32,33,36,0.18)] dark:border-[#B8BDC4]/25 dark:bg-[#2B2D31]/90 dark:hover:border-[#C7F0BD]/50"
              >
                <div>
                  {/* Top Bar: Icon & Coming Soon Badge */}
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-[#C7F0BD]/10 text-[#54794E] transition-colors group-hover:bg-[#C7F0BD] group-hover:text-[#202124] dark:bg-[#C7F0BD]/20">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="rounded-full border border-[#B8BDC4]/40 bg-[#C7F0BD]/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#54794E] dark:border-[#B8BDC4]/30 dark:bg-[#C7F0BD]/10 dark:text-[#C7F0BD]">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 text-base font-bold text-neutral-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-[#54794E] dark:text-[#C7F0BD]">
                    {feature.tagline}
                  </p>
                  <p className="mt-2.5 text-xs leading-relaxed text-neutral-500 dark:text-[#B8BDC4]">
                    {feature.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-100 dark:border-[#B8BDC4]/30 text-[11px] font-medium text-neutral-400 dark:text-[#B8BDC4]/70 flex items-center justify-between">
                  <span>Srujan 2026 Core</span>
                  <span className="size-1.5 rounded-full bg-neutral-300 dark:bg-[#3A3D42] group-hover:bg-[#C7F0BD] transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default FeaturePreview;
