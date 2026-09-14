import { Globe } from "lucide-react";
import { useState } from "react";
import { loc, useT } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function TranslationBanner({
  sourceLanguage,
  className,
}: {
  sourceLanguage: "en" | "th";
  className?: string;
}) {
  const { lang, t } = useT();
  if (sourceLanguage === lang) return null;
  return (
    <p className={cn("inline-flex items-center gap-1 text-xs text-muted", className)}>
      <Globe className="size-3.5 text-primary" />
      {sourceLanguage === "th" ? t("translatedFromTh") : t("translatedFromEn")}
    </p>
  );
}

export function LocalizedText({
  lang,
  th,
  en,
  sourceLanguage,
  as: Tag = "p",
  className,
}: {
  lang: "en" | "th";
  th: string;
  en: string;
  sourceLanguage: "en" | "th";
  as?: "p" | "h1" | "h2" | "h3" | "span";
  className?: string;
}) {
  const { t } = useT();
  const [showOriginal, setShowOriginal] = useState(false);
  const text = showOriginal
    ? sourceLanguage === "th"
      ? th
      : en
    : loc(lang, th, en);
  const canToggle = sourceLanguage !== lang && th && en && th !== en;
  return (
    <div>
      <Tag className={className}>{text}</Tag>
      {canToggle ? (
        <button
          type="button"
          className="mt-1 text-xs font-medium text-primary"
          onClick={() => setShowOriginal((v) => !v)}
        >
          {showOriginal ? t("showTranslation") : t("showOriginal")}
        </button>
      ) : null}
    </div>
  );
}
