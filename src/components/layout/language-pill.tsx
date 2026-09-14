import { useT, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const OPTIONS: { locale: Lang; label: string }[] = [
  { locale: "th", label: "TH" },
  { locale: "en", label: "EN" },
];

export function LanguagePill({ className }: { className?: string }) {
  const { lang, setLang } = useT();
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center rounded-full bg-surface p-0.5 shadow-card",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {OPTIONS.map(({ locale, label }) => {
        const active = lang === locale;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => setLang(locale)}
            aria-pressed={active}
            className={cn(
              "h-8 min-w-9 rounded-full px-2.5 text-xs font-semibold",
              active ? "bg-primary text-primary-fg" : "text-muted",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
