import { LOCALES, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function LanguagePill({ className }: { className?: string }) {
  const { locale, setLocale } = useT();
  return (
    <div
      className={cn(
        "inline-flex h-9 items-center rounded-full bg-surface p-0.5 shadow-card",
        className,
      )}
      role="group"
      aria-label="Language"
    >
      {LOCALES.map(({ locale: id, label, name }) => (
        <button
          key={id}
          type="button"
          data-locale={id}
          aria-label={name}
          aria-pressed={locale === id}
          onClick={() => setLocale(id)}
          className={cn(
            "h-8 min-w-9 rounded-full px-2.5 text-xs font-semibold",
            locale === id ? "bg-primary text-primary-fg" : "text-muted",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
