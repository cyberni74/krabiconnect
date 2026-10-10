import { TIDE_LANGS, useTideSettings, type TideLang } from "@/lib/tide/store";

const NAMES: Record<TideLang, string> = { de: "Deutsch", en: "English", th: "ไทย" };

export function Flag({ lang, className }: { lang: TideLang; className?: string }) {
  return (
    <svg viewBox="0 0 60 40" className={className} aria-hidden preserveAspectRatio="xMidYMid slice">
      {lang === "de" ? (
        <>
          <rect width="60" height="13.4" fill="#000" />
          <rect y="13.3" width="60" height="13.4" fill="#d00" />
          <rect y="26.6" width="60" height="13.4" fill="#ffce00" />
        </>
      ) : lang === "th" ? (
        <>
          <rect width="60" height="40" fill="#a51931" />
          <rect y="6.7" width="60" height="26.6" fill="#f4f5f8" />
          <rect y="13.3" width="60" height="13.4" fill="#2d2a4a" />
        </>
      ) : (
        <>
          <rect width="60" height="40" fill="#012169" />
          <path d="M0,0 60,40M60,0 0,40" stroke="#fff" strokeWidth="8" />
          <path d="M0,0 60,40M60,0 0,40" stroke="#c8102e" strokeWidth="3" />
          <path d="M30,0V40M0,20H60" stroke="#fff" strokeWidth="13" />
          <path d="M30,0V40M0,20H60" stroke="#c8102e" strokeWidth="7.5" />
        </>
      )}
    </svg>
  );
}

/** One-tap three-way language switch with flags. */
export function LangSwitch({ size = "compact" }: { size?: "compact" | "large" }) {
  const lang = useTideSettings((s) => s.lang);
  const setLang = useTideSettings((s) => s.setLang);
  const large = size === "large";
  return (
    <div
      role="radiogroup"
      aria-label="Language / Sprache / ภาษา"
      className={`flex ${large ? "gap-2" : "gap-1"}`}
    >
      {TIDE_LANGS.map((l) => {
        const on = l === lang;
        return (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={NAMES[l]}
            onClick={() => setLang(l)}
            className={`flex items-center justify-center border transition active:scale-95 ${
              large ? "h-14 flex-1 flex-col gap-1 rounded" : "h-8 gap-1.5 rounded-sm px-1.5"
            } ${
              on
                ? "border-cyan-300 bg-cyan-300/15 text-white"
                : "border-white/15 bg-white/[0.04] text-white/60"
            }`}
          >
            <Flag
              lang={l}
              className={`${large ? "h-6 w-9" : "h-[13px] w-5"} rounded ${on ? "" : "opacity-70"}`}
            />
            <span
              className={`tide-label font-semibold ${large ? "text-[12px]" : "text-[10.5px]"} tracking-wider`}
            >
              {large ? NAMES[l] : l.toUpperCase()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
