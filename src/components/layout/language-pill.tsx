import { useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

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
      <button
        type="button"
        onClick={() => setLang("th")}
        className={cn(
          "h-8 min-w-9 rounded-full px-2.5 text-xs font-semibold",
          lang === "th" ? "bg-primary text-primary-fg" : "text-muted",
        )}
      >
        TH
      </button>
      <button
        type="button"
        onClick={() => setLang("en")}
        className={cn(
          "h-8 min-w-9 rounded-full px-2.5 text-xs font-semibold",
          lang === "en" ? "bg-primary text-primary-fg" : "text-muted",
        )}
      >
        EN
      </button>
    </div>
  );
}
