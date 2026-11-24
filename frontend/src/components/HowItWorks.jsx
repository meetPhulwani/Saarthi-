import { ArrowRight, Cpu, FileUp, Sparkles } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Upload Notice",
    subtitle: "High-fidelity ingestion",
    description:
      "Drop any university or college circular in PDF, PNG, JPG, or JPEG format (up to 10 MB). Your notice is validated before processing.",
    icon: FileUp,
  },
  {
    step: "02",
    title: "AI Understands",
    subtitle: "Notice text analysis",
    description:
      "AI turns extracted notice text into a plain-language summary, key points, and explicitly stated dates in your selected language.",
    icon: Cpu,
  },
  {
    step: "03",
    title: "Act Decisively",
    subtitle: "Localized synthesis & alerts",
    description:
      "Receive an executive briefing and deadline timeline in your chosen language—English, Hindi, or Marathi—ready for immediate action.",
    icon: Sparkles,
  },
];

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 mx-auto max-w-6xl px-4 sm:px-6 py-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 border-b border-[#B8BDC4]/20 pb-4 dark:border-[#B8BDC4]/30">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#54794E] dark:text-[#C7F0BD]">
            <span>Three Simple Steps</span>
          </div>
          <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#202124] dark:text-[#F5F5F5]">
            How Saarthi works
          </h2>
        </div>
        <p className="text-xs text-[#6B7280] dark:text-[#B8BDC4]">
          From dense bureaucratic memo to clear student briefing
        </p>
      </div>

      {/* 3 Step Cards */}
      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-3">
        {steps.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="group relative flex flex-col justify-between rounded-2xl border border-[#B8BDC4]/35 bg-white p-6 shadow-2xs hover:border-[#C7F0BD]/50 transition-all dark:border-[#B8BDC4]/40 dark:bg-[#2B2D31]"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-[#C7F0BD] text-[#202124] dark:bg-[#C7F0BD] dark:text-[#202124]">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <span className="font-display font-bold text-sm text-[#54794E] dark:text-[#C7F0BD]">
                    STEP {item.step}
                  </span>
                </div>

                <h3 className="mt-4 font-display text-base font-bold text-[#202124] dark:text-[#F5F5F5]">
                  {item.title}
                </h3>
                <p className="text-[11px] font-semibold text-[#54794E] dark:text-[#C7F0BD]">
                  {item.subtitle}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#6B7280] dark:text-[#B8BDC4]">
                  {item.description}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#B8BDC4]/20 pt-3 text-[11px] font-medium text-[#6B7280] dark:border-[#B8BDC4]/30 dark:text-[#B8BDC4]">
                <span>{index === 0 ? "Drop & validate" : index === 1 ? "Extract & structure" : "Review & export"}</span>
                {index < 2 && <ArrowRight className="size-3.5 text-[#54794E] dark:text-[#C7F0BD]" aria-hidden="true" />}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default HowItWorks;
