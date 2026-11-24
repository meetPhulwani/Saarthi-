import { Check, Globe2, Languages } from "lucide-react";

const languages = [
  {
    id: "english",
    label: "English",
    nativeLabel: "English",
    flag: "EN",
    description: "Default standard academic dialect",
  },
  {
    id: "hindi",
    label: "Hindi",
    nativeLabel: "हिन्दी",
    flag: "HI",
    description: "देवनागरी लिपि में अनुवाद",
  },
  {
    id: "marathi",
    label: "Marathi",
    nativeLabel: "मराठी",
    flag: "MR",
    description: "प्रादेशिक मराठी परिपत्रक भाषांतर",
  },
];

function LanguageSelector({ value, onChange }) {
  const selectedLang = languages.find((l) => l.id === value) || languages[0];

  return (
    <section
      aria-labelledby="language-heading"
      className="relative overflow-hidden rounded-3xl border border-neutral-200/80 bg-white/95 p-6 shadow-[0_12px_40px_-15px_rgba(32,33,36,0.12)] backdrop-blur-xl transition-all sm:p-7 dark:border-[#B8BDC4]/25 dark:bg-[#2B2D31]/95 dark:shadow-[0_12px_40px_-15px_rgba(0,0,0,0.5)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-[#C7F0BD]/10 text-[#54794E] dark:bg-[#C7F0BD]/20">
            <Languages className="size-4" aria-hidden="true" />
          </span>
          <h2
            id="language-heading"
            className="text-base font-bold tracking-tight text-neutral-900 dark:text-white"
          >
            Target Language
          </h2>
        </div>
        <span className="rounded-full border border-[#C7F0BD]/20 bg-[#C7F0BD]/5 px-2.5 py-0.5 text-[11px] font-semibold text-[#54794E] dark:border-[#C7F0BD]/30 dark:bg-[#C7F0BD]/15">
          {selectedLang.nativeLabel}
        </span>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-neutral-500 dark:text-[#B8BDC4]">
        Choose your desired language for extracted summaries and deadline briefs.
      </p>

      {/* Segmented Radio Group */}
      <div
        role="radiogroup"
        aria-label="Preferred notice language"
        className="mt-5 flex flex-col gap-2.5"
      >
        {languages.map((language) => {
          const selected = value === language.id;
          return (
            <button
              key={language.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(language.id)}
              className={`group flex items-center justify-between rounded-2xl border p-3.5 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C7F0BD] ${
                selected
                  ? "border-[#C7F0BD] bg-[#C7F0BD]/5 shadow-xs dark:border-[#C7F0BD] dark:bg-[#C7F0BD]/15"
                  : "border-neutral-200/90 bg-neutral-50/70 hover:border-neutral-300 hover:bg-neutral-100/60 dark:border-[#B8BDC4]/30 dark:bg-[#2B2D31]/40 dark:hover:border-neutral-700 dark:hover:bg-[#3A3D42]/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold transition-colors ${
                    selected
                      ? "bg-[#C7F0BD] text-[#202124]"
                      : "bg-neutral-200/80 text-neutral-700 dark:bg-[#2B2D31] dark:text-[#B8BDC4]"
                  }`}
                >
                  {language.flag}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {language.label}
                    </span>
                    <span className="text-xs font-medium text-neutral-400 dark:text-[#B8BDC4]/70">
                      ({language.nativeLabel})
                    </span>
                  </div>
                  <span className="block text-[11px] text-neutral-500 dark:text-[#B8BDC4]">
                    {language.description}
                  </span>
                </div>
              </div>

              {/* Selection Check Circle */}
              <span
                className={`flex size-5 shrink-0 items-center justify-center rounded-full border transition-all ${
                  selected
                    ? "border-[#C7F0BD] bg-[#C7F0BD] text-[#202124] shadow-2xs"
                    : "border-neutral-300 bg-white dark:border-[#B8BDC4]/35 dark:bg-[#2B2D31]"
                }`}
              >
                {selected && <Check className="size-3 stroke-[3]" aria-hidden="true" />}
              </span>
            </button>
          );
        })}
      </div>

      {/* Translation Pipeline Status Notice */}
      <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-50/60 p-3 text-xs leading-relaxed text-amber-800 dark:border-amber-500/20 dark:bg-amber-950/30 dark:text-amber-300">
        <div className="flex items-start gap-2">
          <Globe2 className="size-3.5 shrink-0 text-amber-600 mt-0.5 dark:text-amber-400" aria-hidden="true" />
          <div>
            <span className="font-semibold">Display preference active.</span>
            <span className="block text-[11px] text-amber-700/90 dark:text-amber-400/90 mt-0.5">
              AI explanations are generated in your selected language when you analyze extracted notice text.
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LanguageSelector;
