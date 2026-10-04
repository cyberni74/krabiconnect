/**
 * Shared chrome for the Krabi Insider Guide (/krabi-guide): shell, header, breadcrumb, footer,
 * image with fallback chain, article + tour cards.
 */
import { Link } from "@tanstack/react-router";
import { keepLang } from "../secret-islands/lang-context";
import { ArrowRight, BookOpen, ChevronRight, Clock, Sparkles } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { BookingModal } from "../secret-islands/booking";
import { BRAND, type Tour } from "../secret-islands/content";
import { AuroraBackground, GlassCard, ScrollProgress, btn } from "../secret-islands/fx";
import { BrandMark, WhatsAppIcon, unsplashSrcSet } from "../secret-islands/ui";
import { LangBoundary, useHtmlLang, useSwitchLang, useUrlLang } from "../secret-islands/lang";
import { formatTHB, useLang, useSI, useTx, waLink } from "../secret-islands/store";
import { useGuideLang, type GuideLang } from "./guide-helpers";
import { ARTICLES, CATEGORY_LABEL, type Bi, type GuideArticle } from "./articles";

/* ───────── Image with fallback chain ───────── */
/** Tries `src`, then `fallback`, then the ocean gradient. */
export function GuideImage({
  src,
  fallback,
  alt,
  className,
  eager,
  priority,
  sizes = "100vw",
}: {
  src: string;
  fallback?: string;
  alt: string;
  className?: string;
  eager?: boolean;
  /** LCP image: eager + fetchpriority="high". */
  priority?: boolean;
  sizes?: string;
}) {
  const [stage, setStage] = useState(0);
  const ref = useRef<HTMLImageElement>(null);
  const current = stage === 0 ? src : stage === 1 && fallback ? fallback : null;
  const fail = () => setStage((s) => (s === 0 && fallback ? 1 : 2));
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) fail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);
  if (!current) return <div role="img" aria-label={alt} className={cn("si-fallback", className)} />;
  return (
    <img
      ref={ref}
      key={current}
      src={current}
      srcSet={unsplashSrcSet(current)}
      sizes={unsplashSrcSet(current) ? sizes : undefined}
      alt={alt}
      loading={eager || priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding={priority ? "sync" : "async"}
      onError={fail}
      className={className}
    />
  );
}

/* ───────── Shell ───────── */
export function GuideShell({ children }: { children: ReactNode }) {
  const urlLang = useUrlLang();
  return (
    <LangBoundary urlLang={urlLang}>
      <GuideShellBody>{children}</GuideShellBody>
    </LangBoundary>
  );
}

function GuideShellBody({ children }: { children: ReactNode }) {
  useHtmlLang();
  return (
    <div className="relative isolate min-h-dvh overflow-x-clip font-jakarta text-white antialiased">
      <AuroraBackground />
      <ScrollProgress />
      <GuideHeader />
      <main className="pb-16">{children}</main>
      <GuideFooter />
      <BookingModal />
    </div>
  );
}

function GuideHeader() {
  const { t } = useTx();
  const lang = useLang();
  const setLang = useSwitchLang();
  const shown: GuideLang = lang === "de" ? "de" : "en";
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5">
      <nav
        aria-label={t({ de: "Hauptnavigation", en: "Main navigation" })}
        className="si-glass-strong mx-auto flex h-14 max-w-6xl items-center gap-2 rounded-full pl-2 pr-2 sm:pl-3"
      >
        <Link to="/secret-islands" search={keepLang} className="flex min-w-0 items-center gap-2 rounded-full py-1 pr-2">
          <BrandMark className="size-9" />
          <span className="hidden truncate text-sm font-extrabold tracking-tight sm:inline">{BRAND.name}</span>
        </Link>
        <Link
          to="/krabi-guide" search={keepLang}
          className="flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-sm font-bold text-cyan-200 hover:bg-white/10 min-[360px]:px-3"
          activeOptions={{ exact: true }}
        >
          <BookOpen className="size-4" />
          Insider Guide
        </Link>
        <div className="ml-auto flex items-center gap-1.5">
          <Link
            to="/secret-islands" search={keepLang}
            hash="touren"
            className="hidden min-h-11 items-center rounded-full px-4 text-sm font-bold text-white/90 hover:bg-white/10 md:flex"
          >
            {t({ de: "Touren", en: "Tours" })}
          </Link>
          <div role="group" aria-label={t({ de: "Sprache", en: "Language" })} className="flex rounded-full bg-white/5 p-1">
            {(["de", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                aria-pressed={shown === l}
                className={cn(
                  "grid h-11 min-w-11 place-items-center rounded-full px-2 text-xs font-extrabold uppercase transition",
                  shown === l ? "bg-white text-si-navy" : "text-white/70 hover:text-white",
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </nav>
    </header>
  );
}

/* ───────── Breadcrumb ───────── */
export function Breadcrumb({ article }: { article?: GuideArticle }) {
  const { t } = useTx();
  const lang = useGuideLang();
  return (
    <nav aria-label={t({ de: "Brotkrümelnavigation", en: "Breadcrumb" })} className="mb-5">
      <ol className="flex flex-wrap items-center gap-1 text-[13px] font-semibold text-slate-300">
        <li>
          <Link to="/secret-islands" search={keepLang} className="rounded hover:text-white">
            {t({ de: "Startseite", en: "Home" })}
          </Link>
        </li>
        <li aria-hidden>
          <ChevronRight className="size-3.5 text-slate-500" />
        </li>
        <li>
          {article ? (
            <Link to="/krabi-guide" search={keepLang} className="rounded hover:text-white">
              Insider Guide
            </Link>
          ) : (
            <span aria-current="page" className="text-cyan-200">
              Insider Guide
            </span>
          )}
        </li>
        {article ? (
          <>
            <li aria-hidden>
              <ChevronRight className="size-3.5 text-slate-500" />
            </li>
            <li className="min-w-0">
              <span aria-current="page" className="text-cyan-200">
                {article.short[lang]}
              </span>
            </li>
          </>
        ) : null}
      </ol>
    </nav>
  );
}

/* ───────── Cards ───────── */
export function ArticleCard({ article, className }: { article: GuideArticle; className?: string }) {
  const lang = useGuideLang();
  const { t } = useTx();
  return (
    <GlassCard as="article" className={cn("group h-full overflow-hidden", className)}>
      <Link to="/krabi-guide/$slug" search={keepLang} params={{ slug: article.slug }} className="flex h-full flex-col">
        <div className="relative aspect-[16/10] overflow-hidden">
          <GuideImage
            src={article.image}
            alt={article.h1[lang]}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="size-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-si-navy/80 via-transparent to-transparent" />
          <span className="si-glass absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-100">
            {t(CATEGORY_LABEL[article.category])}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-lg font-extrabold leading-snug text-white">{article.title[lang]}</h3>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-300">{article.metaDescription[lang]}</p>
          <div className="mt-auto flex items-center justify-between pt-4 text-xs font-semibold text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3.5" />
              {article.readingMinutes} {t({ de: "Min. Lesezeit", en: "min read" })}
            </span>
            <span className="inline-flex items-center gap-1 text-cyan-300 transition group-hover:gap-2">
              {t({ de: "Lesen", en: "Read" })}
              <ArrowRight className="size-3.5" />
            </span>
          </div>
        </div>
      </Link>
    </GlassCard>
  );
}

export function TourCard({ tour }: { tour: Tour }) {
  const { t } = useTx();
  const openBooking = useSI((s) => s.openBooking);
  return (
    <GlassCard glow className="flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden">
        <GuideImage src={tour.image} alt={t(tour.title)} sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw" className="size-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-si-navy/85 via-si-navy/10 to-transparent" />
        <span className="absolute bottom-3 left-3 rounded-full bg-si-navy/70 px-2.5 py-1 text-[11px] font-bold text-cyan-100 backdrop-blur">
          {t(tour.duration)}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-extrabold leading-snug">{t(tour.title)}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-300">{t(tour.short)}</p>
        <p className="mt-3 text-sm text-slate-300">
          {t({ de: "ab", en: "from" })}{" "}
          <span className="si-text-gradient text-xl font-extrabold">{formatTHB(tour.price)}</span>{" "}
          {t({ de: "pro Boot · max. 5 Gäste", en: "per boat · max. 5 guests" })}
        </p>
        <div className="mt-auto flex flex-col gap-2 pt-4">
          <button type="button" onClick={() => openBooking({ tourId: tour.id })} className={cn(btn.primary, "px-4 text-sm")}>
            <Sparkles className="size-4" />
            {t({ de: "Diese Tour buchen", en: "Book this tour" })}
          </button>
          <Link to="/secret-islands" search={keepLang} hash="touren" className={cn(btn.glass, "px-4 text-sm")}>
            {t({ de: "Alle Touren", en: "All tours" })}
          </Link>
        </div>
      </div>
    </GlassCard>
  );
}

/* ───────── WhatsApp CTA ───────── */
export function WhatsAppCta({ topic }: { topic?: Bi }) {
  const { t, tOp } = useTx();
  const text = topic
    ? tOp({
        de: `Hallo! Ich habe im Insider Guide „${topic.de}“ gelesen und interessiere mich für eine private Speedboat-Tour. Wunschdatum: … / Personen: …`,
        en: `Hi! I read “${topic.en}” in your Insider Guide and I'm interested in a private speedboat tour. Preferred date: … / Guests: …`,
      })
    : tOp({
        de: "Hallo! Ich habe Ihren Krabi Insider Guide gelesen und möchte eine private Speedboat-Tour anfragen.",
        en: "Hi! I read your Krabi Insider Guide and would like to request a private speedboat tour.",
      });
  return (
    <a href={waLink(text)} target="_blank" rel="noopener noreferrer" className={btn.whatsapp}>
      <WhatsAppIcon className="size-5" />
      {t({ de: "Frage per WhatsApp", en: "Ask on WhatsApp" })}
    </a>
  );
}

/* ───────── Footer ───────── */
function GuideFooter() {
  const { t } = useTx();
  const lang = useGuideLang();
  const groups: { title: Bi; items: GuideArticle[] }[] = [
    { title: { de: "Grundlagen", en: "Essentials" }, items: ARTICLES.filter((a) => a.category === "pillar") },
    { title: { de: "Inseln", en: "Islands" }, items: ARTICLES.filter((a) => a.category === "island") },
    { title: { de: "Insider-Wissen", en: "Insider know-how" }, items: ARTICLES.filter((a) => a.category === "insider") },
  ];
  return (
    <footer className="relative border-t border-white/10 bg-si-navy/60 px-4 pb-10 pt-14 backdrop-blur sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <Link to="/secret-islands" search={keepLang} className="inline-flex items-center gap-2.5">
              <BrandMark className="size-10" />
              <span className="text-lg font-extrabold">{BRAND.name}</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-slate-300">
              {t({
                de: "Private Speedboat-Touren ab Ao Nang für max. 5 Gäste – geheime Inseln, Angeltouren und 4K-Drohnen-Paket.",
                en: "Private speedboat tours from Ao Nang for max. 5 guests – secret islands, fishing trips and a 4K drone package.",
              })}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/secret-islands" search={keepLang} hash="touren" className={cn(btn.primary, "min-h-11 px-4 text-sm")}>
                {t({ de: "Touren ansehen", en: "View tours" })}
              </Link>
              <WhatsAppCta />
            </div>
          </div>
          {groups.map((g) => (
            <div key={g.title.en}>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{t(g.title)}</p>
              <ul className="space-y-1">
                {g.items.map((a) => (
                  <li key={a.slug}>
                    <Link
                      to="/krabi-guide/$slug" search={keepLang}
                      params={{ slug: a.slug }}
                      className="inline-flex min-h-8 items-center text-sm text-slate-300 hover:text-white"
                    >
                      {a.short[lang]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-slate-400 sm:flex-row sm:justify-between">
          <p>
            © 2026 {BRAND.name} · {t(BRAND.location)}
          </p>
          <p>
            <Link to="/krabi-guide" search={keepLang} className="hover:text-white">
              Krabi Insider Guide
            </Link>{" "}
            · <a href={`mailto:${BRAND.email}`} className="hover:text-white">{BRAND.email}</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
