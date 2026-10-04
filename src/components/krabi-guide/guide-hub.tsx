import { Link } from "@tanstack/react-router";
import { keepLang } from "../secret-islands/lang-context";
import { ArrowRight, Clock, Compass, MapPin, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { Assemble, AssembleItem, GlassCard, ScrollScene, SectionTitle, btn } from "../secret-islands/fx";
import { useTx } from "../secret-islands/store";
import { ARTICLES, FEATURED_SLUG, GUIDE_CATEGORIES, ISLAND_ARTICLES, getArticle, type GuideCategory } from "./articles";
import { ArticleCard, Breadcrumb, GuideImage, GuideShell, WhatsAppCta } from "./guide-ui";
import { useGuideLang } from "./guide-helpers";

function norm(s: string) {
  return s.toLowerCase().normalize("NFKD").replace(/[̀-ͯ]/g, "");
}

export function GuideHub() {
  return (
    <GuideShell>
      <HubHero />
      <IslandNav />
      <ArticleBrowser />
      <HubCta />
    </GuideShell>
  );
}

function HubHero() {
  const { t } = useTx();
  const lang = useGuideLang();
  const featured = getArticle(FEATURED_SLUG)!;
  return (
    <section className="relative px-4 pb-10 pt-24 sm:px-6 sm:pt-32">
      <div className="mx-auto max-w-6xl">
        <Breadcrumb />
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <span className="si-glass mb-5 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200">
              <span className="size-1.5 rounded-full bg-si-cyan shadow-[0_0_10px_2px_rgb(6_182_212/0.8)]" />
              {t({ de: "Wissen von lokalen Kapitänen", en: "Know-how from local captains" })}
            </span>
            <h1 className="text-[2.1rem] font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
              {lang === "de" ? (
                <>
                  Krabi Insider Guide – <span className="si-text-gradient">Inseln, Geheimtipps & Reisewissen</span>
                </>
              ) : (
                <>
                  Krabi Insider Guide – <span className="si-text-gradient">islands, hidden gems & travel know-how</span>
                </>
              )}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
              {t({
                de: "Alles, was wir in Jahren auf dem Wasser vor Ao Nang gelernt haben: welche Krabi Inseln sich wirklich lohnen, wann Sandbänke auftauchen, wo man am besten schnorchelt und wie Sie den Massen ausweichen.",
                en: "Everything we have learned in years on the water off Ao Nang: which Krabi islands are really worth it, when sandbars appear, where to snorkel best and how to dodge the crowds.",
              })}
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <Compass className="size-4 text-si-cyan" />
                {ARTICLES.length} {t({ de: "Artikel", en: "articles" })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4 text-si-gold" />
                {ISLAND_ARTICLES.length} {t({ de: "Insel-Guides", en: "island guides" })}
              </span>
            </div>
          </div>
          <ScrollScene from="tilt" intensity={0.5}>
            <GlassCard glow tilt className="overflow-hidden">
              <Link to="/krabi-guide/$slug" search={keepLang} params={{ slug: featured.slug }} className="group block">
                <div className="relative aspect-[16/11] overflow-hidden">
                  <GuideImage src={featured.image} alt={featured.h1[lang]} eager className="size-full object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-si-navy via-si-navy/30 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                    <span className="mb-2 inline-flex rounded-full bg-si-gold px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-si-navy">
                      {t({ de: "Start hier", en: "Start here" })}
                    </span>
                    <h2 className="text-xl font-extrabold leading-tight sm:text-2xl">{featured.title[lang]}</h2>
                    <p className="mt-1.5 line-clamp-2 text-sm text-slate-200">{featured.metaDescription[lang]}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-cyan-300">
                      <Clock className="size-4" />
                      {featured.readingMinutes} {t({ de: "Min. Lesezeit", en: "min read" })}
                      <ArrowRight className="size-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </Link>
            </GlassCard>
          </ScrollScene>
        </div>
      </div>
    </section>
  );
}

function IslandNav() {
  const { t } = useTx();
  const lang = useGuideLang();
  return (
    <nav aria-label={t({ de: "Inseln im Überblick", en: "Islands at a glance" })} className="px-4 pb-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
          {t({ de: "Direkt zur Insel", en: "Jump to an island" })}
        </p>
        <ul className="hide-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0">
          {ISLAND_ARTICLES.map((a) => (
            <li key={a.slug} className="shrink-0">
              <Link
                to="/krabi-guide/$slug" search={keepLang}
                params={{ slug: a.slug }}
                className="si-glass inline-flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-bold text-white transition hover:bg-white/15"
              >
                <MapPin className="size-3.5 text-si-cyan" />
                {a.short[lang]}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

function ArticleBrowser() {
  const { t } = useTx();
  const lang = useGuideLang();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<"all" | GuideCategory>("all");

  const list = useMemo(() => {
    const nq = norm(q.trim());
    return ARTICLES.filter((a) => {
      if (cat !== "all" && a.category !== cat) return false;
      if (!nq) return true;
      const hay = norm(
        [a.title.de, a.title.en, a.metaDescription[lang], a.primaryKeyword, ...a.keywords, a.short.de, a.short.en].join(" "),
      );
      return nq.split(/\s+/).every((w) => hay.includes(w));
    });
  }, [q, cat, lang]);

  return (
    <section id="artikel" className="scroll-mt-24 px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <SectionTitle
          eyebrow={t({ de: "Alle Artikel", en: "All articles" })}
          title={t({ de: "Inseln, Timing & Geheimtipps", en: "Islands, timing & hidden gems" })}
          sub={t({
            de: "Suchen Sie nach Insel, Thema oder Stichwort – oder filtern Sie nach Kategorie.",
            en: "Search by island, topic or keyword – or filter by category.",
          })}
        />
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center">
          <label className="si-glass flex min-h-12 flex-1 items-center gap-2 rounded-2xl px-4 focus-within:ring-2 focus-within:ring-si-cyan/60">
            <Search className="size-5 shrink-0 text-slate-400" />
            <span className="sr-only">{t({ de: "Artikel durchsuchen", en: "Search articles" })}</span>
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t({ de: "z. B. Schnorcheln, Hong, Ebbe …", en: "e.g. snorkelling, Hong, low tide …" })}
              className="min-w-0 flex-1 bg-transparent text-base text-white placeholder:text-slate-400 focus:outline-none"
            />
            {q ? (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label={t({ de: "Suche leeren", en: "Clear search" })}
                className="grid size-9 place-items-center rounded-full text-slate-300 hover:bg-white/10"
              >
                <X className="size-4" />
              </button>
            ) : null}
          </label>
          <div role="group" aria-label={t({ de: "Kategorie", en: "Category" })} className="hide-scroll -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
            {GUIDE_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCat(c.id)}
                aria-pressed={cat === c.id}
                className={cn(
                  "min-h-11 shrink-0 rounded-full px-4 text-sm font-bold transition",
                  cat === c.id ? "bg-white text-si-navy" : "si-glass text-white/85 hover:bg-white/15",
                )}
              >
                {t(c.label)}
              </button>
            ))}
          </div>
        </div>

        {list.length ? (
          <Assemble key={`${cat}-${q}`} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.05}>
            {list.map((a) => (
              <AssembleItem key={a.slug} className="h-full">
                <ArticleCard article={a} />
              </AssembleItem>
            ))}
          </Assemble>
        ) : (
          <p className="si-glass rounded-2xl p-6 text-center text-slate-300">
            {t({ de: "Keine Artikel gefunden. Versuchen Sie einen anderen Begriff.", en: "No articles found. Try a different term." })}
          </p>
        )}
      </div>
    </section>
  );
}

function HubCta() {
  const { t } = useTx();
  return (
    <section className="px-4 py-12 sm:px-6">
      <ScrollScene className="mx-auto max-w-6xl">
        <GlassCard glow className="overflow-hidden p-7 sm:p-12">
          <div className="grid items-center gap-6 md:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="text-2xl font-extrabold leading-tight sm:text-4xl">
                {t({ de: "Genug gelesen? Erleben Sie es selbst.", en: "Read enough? Experience it yourself." })}
              </h2>
              <p className="mt-3 text-slate-300">
                {t({
                  de: "Privates Speedboat ab Ao Nang, maximal 5 Gäste, Route nach Gezeiten und Ihren Wünschen – Schnorcheln, Lagunen, Sunset oder Angeln.",
                  en: "Private speedboat from Ao Nang, max. 5 guests, a route planned around the tides and your wishes – snorkelling, lagoons, sunset or fishing.",
                })}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <Link to="/secret-islands" search={keepLang} hash="touren" className={btn.primary}>
                {t({ de: "Touren ansehen", en: "View tours" })}
                <ArrowRight className="size-4" />
              </Link>
              <WhatsAppCta />
            </div>
          </div>
        </GlassCard>
      </ScrollScene>
    </section>
  );
}
