import { Link } from "@tanstack/react-router";
import { CalendarDays, Check, ChevronDown, Clock, Lightbulb, ListTree, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Assemble, AssembleItem, GlassCard, SectionTitle, btn } from "../secret-islands/fx";
import { useSI, useTx } from "../secret-islands/store";
import { CATEGORY_LABEL, guideImageSrc, relatedArticles, type GuideArticle } from "./articles";
import {
  ArticleCard,
  Breadcrumb,
  GuideImage,
  GuideShell,
  TourCard,
  WhatsAppCta,
} from "./guide-ui";
import { formatDate, toursByIds, useGuideLang } from "./guide-helpers";

export function GuideArticlePage({ article }: { article: GuideArticle }) {
  return (
    <GuideShell>
      <ArticleView article={article} />
    </GuideShell>
  );
}

function Toc({ article }: { article: GuideArticle }) {
  const lang = useGuideLang();
  return (
    <ol className="space-y-0.5 text-sm">
      {article.sections.map((s, i) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            className="flex min-h-10 items-start gap-2.5 rounded-xl px-2 py-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <span className="mt-px w-5 shrink-0 text-right font-mono text-xs text-cyan-300">{i + 1}</span>
            <span className="leading-snug">{s.h2[lang]}</span>
          </a>
        </li>
      ))}
      <li>
        <a
          href="#faq"
          className="flex min-h-10 items-start gap-2.5 rounded-xl px-2 py-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <span className="mt-px w-5 shrink-0 text-right font-mono text-xs text-cyan-300">?</span>
          <span className="leading-snug">FAQ</span>
        </a>
      </li>
    </ol>
  );
}

function ArticleView({ article }: { article: GuideArticle }) {
  const { t } = useTx();
  const lang = useGuideLang();
  const openBooking = useSI((s) => s.openBooking);
  const tours = toursByIds(article.tourIds);
  const related = relatedArticles(article);
  const tocTitle = t({ de: "Inhalt", en: "Contents" });

  return (
    <article lang={lang}>
      {/* Hero */}
      <header className="relative px-4 pt-24 sm:px-6 sm:pt-28">
        <div className="mx-auto max-w-6xl">
          <Breadcrumb article={article} />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_40px_120px_-40px_rgb(6_182_212/0.45)]">
            <GuideImage
              src={article.image}
              alt={article.h1[lang]}
              eager
              className="aspect-[4/3] w-full object-cover sm:aspect-[21/9]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-si-navy via-si-navy/40 to-transparent" />
            <span className="si-glass absolute left-4 top-4 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-100">
              {t(CATEGORY_LABEL[article.category])}
            </span>
          </div>
          <div className="relative -mt-16 max-w-4xl px-1 sm:-mt-24 sm:px-8">
            <h1 className="text-[2rem] font-extrabold leading-[1.08] tracking-tight drop-shadow-[0_4px_24px_rgb(10_25_47/0.9)] sm:text-5xl">
              {article.h1[lang]}
            </h1>
            <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-semibold text-slate-300">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4 text-si-cyan" />
                {article.readingMinutes} {t({ de: "Min. Lesezeit", en: "min read" })}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4 text-si-gold" />
                {t({ de: "Aktualisiert:", en: "Updated:" })}{" "}
                <time dateTime={article.updated}>{formatDate(article.updated, lang)}</time>
              </span>
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto mt-8 grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Main column */}
        <div className="min-w-0 max-w-3xl">
          <p className="text-lg leading-relaxed text-slate-200 sm:text-xl">{article.intro[lang]}</p>

          <details className="si-glass group mt-8 rounded-2xl lg:hidden">
            <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 font-bold [&::-webkit-details-marker]:hidden">
              <ListTree className="size-4 text-si-cyan" />
              {tocTitle}
              <ChevronDown className="ml-auto size-4 transition group-open:rotate-180" />
            </summary>
            <nav aria-label={tocTitle} className="px-2 pb-3">
              <Toc article={article} />
            </nav>
          </details>

          {article.sections.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-24 pt-10">
              <div className="flex items-baseline gap-3">
                <span aria-hidden className="font-mono text-sm font-bold text-si-cyan/70">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{s.h2[lang]}</h2>
              </div>
              <div className="mt-4 space-y-4 text-base leading-[1.75] text-slate-300 sm:text-[17px]">
                {s.body[lang].map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
              {s.list ? (
                <ul className="mt-5 space-y-2.5">
                  {s.list[lang].map((li, j) => (
                    <li key={j} className="flex gap-3 text-base leading-relaxed text-slate-200">
                      <span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-si-cyan/20 text-si-cyan">
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                      <span>{li}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {s.tip ? (
                <aside className="si-glass relative mt-6 overflow-hidden rounded-2xl border-l-4 border-l-si-gold p-5">
                  <p className="mb-1.5 flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-si-gold">
                    <Lightbulb className="size-4" />
                    {t({ de: "Insider-Tipp", en: "Insider tip" })}
                  </p>
                  <p className="leading-relaxed text-slate-100">{s.tip[lang]}</p>
                </aside>
              ) : null}
            </section>
          ))}

          {article.images?.length ? (
            <section aria-label={t({ de: "Bilder", en: "Photos" })} className="pt-10">
              <div className="grid grid-cols-2 gap-3">
                {article.images.map((img, i) => (
                  <figure key={img.src} className={cn("overflow-hidden rounded-2xl", (i === 0 || (i === article.images!.length - 1 && i % 2 === 1)) && "col-span-2")}>
                    <GuideImage
                      src={guideImageSrc(img)}
                      alt={img.alt[lang]}
                      className={cn("w-full object-cover", i === 0 || (i === article.images!.length - 1 && i % 2 === 1) ? "aspect-[16/9]" : "aspect-square")}
                    />
                    <figcaption className="sr-only">{img.alt[lang]}</figcaption>
                  </figure>
                ))}
              </div>
            </section>
          ) : null}

          {/* FAQ */}
          <section id="faq" className="scroll-mt-24 pt-12">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              {t({ de: "Häufige Fragen", en: "Frequently asked questions" })}
            </h2>
            <div className="mt-5 space-y-3">
              {article.faq.map((f, i) => (
                <details key={i} className="si-glass group rounded-2xl" open={i === 0}>
                  <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 px-5 py-3 font-bold leading-snug [&::-webkit-details-marker]:hidden">
                    <span className="flex-1">{f.q[lang]}</span>
                    <ChevronDown className="size-5 shrink-0 text-si-cyan transition group-open:rotate-180" />
                  </summary>
                  <p className="px-5 pb-5 leading-relaxed text-slate-300">{f.a[lang]}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Inline booking CTA */}
          <GlassCard glow className="mt-12 p-6 sm:p-8">
            <h2 className="text-xl font-extrabold sm:text-2xl">
              {t({ de: "Diesen Ort privat erleben", en: "Experience this place privately" })}
            </h2>
            <p className="mt-2 text-slate-300">
              {t({
                de: "Privates Speedboat ab Ao Nang für maximal 5 Gäste – Route und Timing nach Gezeiten und Ihren Wünschen.",
                en: "Private speedboat from Ao Nang for a maximum of 5 guests – route and timing planned around the tides and your wishes.",
              })}
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => openBooking({ tourId: article.tourIds[0] ?? null })}
                className={btn.primary}
              >
                <Sparkles className="size-4" />
                {t({ de: "Diese Tour buchen", en: "Book this tour" })}
              </button>
              <WhatsAppCta topic={article.title} />
            </div>
          </GlassCard>
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            <nav aria-label={tocTitle} className="si-glass rounded-3xl p-4">
              <p className="mb-2 flex items-center gap-2 px-2 text-xs font-extrabold uppercase tracking-[0.18em] text-cyan-300">
                <ListTree className="size-4" />
                {tocTitle}
              </p>
              <Toc article={article} />
            </nav>
            <GlassCard className="p-5">
              <p className="text-sm font-bold">{t({ de: "Privat, max. 5 Gäste", en: "Private, max. 5 guests" })}</p>
              <p className="mt-1 text-sm text-slate-300">
                {t({ de: "Ihr eigenes Speedboat – Sie bestimmen das Timing.", en: "Your own speedboat – you set the timing." })}
              </p>
              <button
                type="button"
                onClick={() => openBooking({ tourId: article.tourIds[0] ?? null })}
                className={cn(btn.primary, "mt-4 w-full text-sm")}
              >
                {t({ de: "Diese Tour buchen", en: "Book this tour" })}
              </button>
            </GlassCard>
          </div>
        </aside>
      </div>

      {/* Matching tours */}
      {tours.length ? (
        <section className="px-4 pt-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <SectionTitle
              eyebrow={t({ de: "Passende Touren", en: "Matching tours" })}
              title={t({ de: "Mit uns dorthin", en: "Get there with us" })}
              sub={t({
                de: "Diese privaten Touren führen zu den Orten aus diesem Artikel.",
                en: "These private tours visit the places in this article.",
              })}
            />
            <Assemble className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {tours.map((tour) => (
                <AssembleItem key={tour.id} className="h-full">
                  <TourCard tour={tour} />
                </AssembleItem>
              ))}
            </Assemble>
          </div>
        </section>
      ) : null}

      {/* Related */}
      {related.length ? (
        <section className="px-4 pt-20 sm:px-6">
          <div className="mx-auto max-w-6xl">
            <SectionTitle
              eyebrow={t({ de: "Weiterlesen", en: "Keep reading" })}
              title={t({ de: "Das könnte Sie auch interessieren", en: "You might also like" })}
            />
            <Assemble className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((a) => (
                <AssembleItem key={a.slug} className="h-full">
                  <ArticleCard article={a} />
                </AssembleItem>
              ))}
            </Assemble>
            <div className="mt-8">
              <Link to="/krabi-guide" className={btn.glass}>
                {t({ de: "Alle Artikel im Insider Guide", en: "All Insider Guide articles" })}
              </Link>
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
