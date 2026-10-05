import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarClock,
  Check,
  Mail,
  MapPin,
  MessageCircleQuestion,
  Plus,
  Quote,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Star,
  Wand2,
  Waves,
  X,
  Zap,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { BRAND, FAQ, LONGTAIL_CROWD_IMG, REVIEWS, ROMANCE_IMGS, TOURS, UI, altFor } from "./content";
import { ARTICLES as GUIDE_ARTICLES, GUIDE_CATEGORIES, type GuideArticle, type GuideCategory } from "../krabi-guide/articles";
import { ArticleCard as GuideArticleCard } from "../krabi-guide/guide-ui";
import { keepLang } from "./lang-context";
import { LONGTAIL_FAQ, LONGTAIL_INTRO, type LongtailFaqItem, type LongtailStep } from "./longtail-faq";
import { Assemble, AssembleItem, CountUp, GlassCard, Magnetic, ScrollScene, SectionTitle, SplitReveal, btn } from "./fx";
import { scrollToId, useSI, useTx, waLink } from "./store";
import { BrandMark, SmartImage, WhatsAppIcon } from "./ui";

/* ───────────────────────── Guide (blog / SEO) ───────────────────────── */

/** Guide articles linked directly from the landing page (pillar pages + core USP islands). */
const GUIDE_TOP_LINKS = [
  "krabi-islands-insider-guide",
  "best-time-to-visit-krabi",
  "krabi-island-hopping-planner",
  "koh-roi-hidden-lagoon",
  "hong-island-krabi",
  "best-snorkeling-spots-krabi",
  "krabi-bioluminescent-plankton-night-boat-tour",
  "krabi-fishing-guide",
];

export function Guide() {
  const { t } = useTx();
  const [cat, setCat] = useState<"all" | GuideCategory>("all");
  const list = (
    cat === "all"
      ? GUIDE_TOP_LINKS.map((slug) => GUIDE_ARTICLES.find((a) => a.slug === slug)).filter((a): a is GuideArticle => !!a)
      : GUIDE_ARTICLES.filter((a) => a.category === cat)
  ).slice(0, 6);

  return (
    <section id="guide" className="relative scroll-mt-24 px-4 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionTitle eyebrow={t(UI.guideEyebrow)} title={t(UI.guideTitle)} sub={t(UI.guideSub)} />

        <div role="tablist" className="hide-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {GUIDE_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={cat === c.id}
              onClick={() => setCat(c.id)}
              className={cn(
                "relative min-h-11 shrink-0 rounded-full px-4 text-sm font-bold transition",
                cat === c.id ? "text-si-navy" : "si-glass text-slate-200 hover:text-white",
              )}
            >
              {cat === c.id ? (
                <motion.span
                  layoutId="guide-cat-pill"
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-si-cyan to-cyan-300 shadow-[0_0_24px_-4px_rgb(6_182_212/0.8)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <span className="relative">{t(c.label)}</span>
            </button>
          ))}
        </div>

        <Assemble key={cat} className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08}>
          {list.map((a, i) => (
            <AssembleItem key={a.slug} variant={i % 3 === 1 ? "flip" : "up"} className="h-full">
              <GuideArticleCard article={a} />
            </AssembleItem>
          ))}
        </Assemble>

        <ScrollScene intensity={0.6} className="mt-10">
          <Link
            to="/krabi-guide"
            search={keepLang}
            className="si-glass si-glow-border group flex flex-col items-start gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8"
          >
            <span>
              <span className="block text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
                {t({ de: "Krabi Insider Guide", en: "Krabi Insider Guide" })}
              </span>
              <span className="mt-1 block text-xl font-extrabold text-white sm:text-2xl">
                {t({
                  de: "Alle Insider-Artikel: Inseln, Schnorchelspots, Gezeiten & Geheimtipps",
                  en: "All insider articles: islands, snorkel spots, tides & secret tips",
                })}{" "}
                <span className="text-si-cyan">({GUIDE_ARTICLES.length})</span>
              </span>
            </span>
            <span className={btn.primary}>
              {t({ de: "Zum Insider Guide", en: "Open the Insider Guide" })}
              <ArrowRight className="size-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        </ScrollScene>
      </div>
    </section>
  );
}

const AVATAR_GRADIENTS = [
  "from-si-cyan to-blue-600",
  "from-si-gold to-rose-500",
  "from-emerald-400 to-teal-600",
  "from-fuchsia-500 to-indigo-600",
  "from-sky-400 to-si-cyan-dark",
];

function initials(name: string) {
  return name
    .replace(/^(Familie|Family)\s+/i, "")
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

function Stars({ className }: { className?: string }) {
  return (
    <span className="flex" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("fill-si-gold text-si-gold", className)} />
      ))}
    </span>
  );
}

export function Reviews() {
  const { t } = useTx();
  return (
    <section id="reviews" className="relative scroll-mt-16 overflow-hidden py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_auto]">
          <SectionTitle eyebrow={t(UI.reviewsEyebrow)} title={t(UI.reviewsTitle)} className="mb-0" />
          <ScrollScene from="right" intensity={0.7}>
            <GlassCard glow className="flex items-center gap-5 p-5 sm:p-6">
              <div className="text-center">
                <CountUp
                  to={4.9}
                  decimals={1}
                  className="si-text-gradient block text-6xl font-black leading-none tracking-tight sm:text-7xl"
                />
                <span className="mt-1 block text-xs font-bold text-slate-400">/ 5</span>
              </div>
              <div className="min-w-0">
                <Stars className="size-5" />
                <p className="mt-2 text-lg font-extrabold text-white">
                  <CountUp to={380} suffix="+" /> {t({ de: "Bewertungen", en: "reviews" })}
                </p>
                <div className="mt-2 flex items-center">
                  {REVIEWS.slice(0, 4).map((r, i) => (
                    <span
                      key={r.name}
                      className={cn(
                        "-ml-2 grid size-8 place-items-center rounded-full bg-gradient-to-br text-[11px] font-extrabold text-white ring-2 ring-si-navy first:ml-0",
                        AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length],
                      )}
                    >
                      {initials(r.name)}
                    </span>
                  ))}
                  <span className="ml-2 text-xs font-semibold text-slate-400">
                    {t({ de: "verifizierte Gäste", en: "verified guests" })}
                  </span>
                </div>
              </div>
            </GlassCard>
          </ScrollScene>
        </div>
      </div>

      <ScrollScene intensity={0.5} className="mt-12">
        <div
          className="group/marquee relative flex overflow-x-auto hide-scroll [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] motion-safe:overflow-hidden"
          aria-label={t(UI.reviewsEyebrow)}
          role="region"
        >
          <div
            className="flex w-max shrink-0 items-stretch gap-5 px-4 py-2 group-hover/marquee:[animation-play-state:paused] group-focus-within/marquee:[animation-play-state:paused] group-active/marquee:[animation-play-state:paused] motion-reduce:!animate-none"
            style={{ animation: "si-marquee 60s linear infinite" }}
          >
            {[0, 1].map((copy) =>
              REVIEWS.map((r, i) => <ReviewCard key={`${copy}-${r.name}`} review={r} index={i} hidden={copy === 1} />),
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-xs font-semibold text-slate-500">
          {t({ de: "Zum Lesen anhalten: Maus darüber oder antippen & halten", en: "Hover or press & hold to pause" })}
        </p>
      </ScrollScene>
    </section>
  );
}

function ReviewCard({ review: r, index, hidden }: { review: (typeof REVIEWS)[number]; index: number; hidden: boolean }) {
  const { t } = useTx();
  return (
    <figure
      aria-hidden={hidden || undefined}
      className="si-glass si-spotlight relative flex w-[300px] shrink-0 flex-col rounded-3xl p-6 sm:w-[380px]"
    >
      <Quote className="absolute right-5 top-5 size-10 text-si-cyan/20" />
      <Stars className="size-4" />
      <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-slate-200">“{t(r.text)}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-white/10 pt-4">
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br text-sm font-extrabold text-white shadow-lg",
            AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length],
          )}
        >
          {initials(r.name)}
        </span>
        <span className="min-w-0">
          <span className="block [overflow-wrap:anywhere] font-bold text-white">
            {r.name} <span className="font-medium text-slate-400">· {t(r.origin)}</span>
          </span>
          <span className="block [overflow-wrap:anywhere] text-xs font-semibold text-cyan-200">{t(r.type)}</span>
          <span className="block [overflow-wrap:anywhere] text-xs text-slate-400">{t(r.tour)}</span>
        </span>
      </figcaption>
    </figure>
  );
}

/* ───────────────────────── Longtail vs. speedboat (storytelling FAQ) ───────────────────────── */

export function LongtailFaq() {
  const { t, tOp } = useTx();
  const openBooking = useSI((s) => s.openBooking);
  const [open, setOpen] = useState<string | null>(LONGTAIL_FAQ[0]?.id ?? null);
  const intro = LONGTAIL_INTRO;

  return (
    <section
      id="longtail-vs-speedboat"
      className="relative scroll-mt-16 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle eyebrow={t(intro.eyebrow)} title={t(intro.title)} sub={t(intro.sub)} />

        {/* Intro story: two timelines */}
        <ScrollScene from="tilt" intensity={0.7}>
          <div className="mb-6 max-w-2xl">
            <h3 className="text-xl font-extrabold text-white sm:text-2xl">{t(intro.storyTitle)}</h3>
            <p className="mt-2 leading-relaxed text-slate-300">{t(intro.story)}</p>
          </div>
        </ScrollScene>

        <div className="relative grid gap-5 md:grid-cols-2 md:gap-8">
          <span
            aria-hidden
            className="si-glass absolute left-1/2 top-1/2 z-10 hidden size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-sm font-black text-white md:grid"
          >
            VS
          </span>
          <ScrollScene from="left" intensity={0.8}>
            <StoryTimeline
              label={t(intro.them.label)}
              steps={intro.them.steps}
              variant="them"
              image={{ src: LONGTAIL_CROWD_IMG.src, alt: t(altFor(LONGTAIL_CROWD_IMG.src)) }}
            />
          </ScrollScene>
          <ScrollScene from="right" intensity={0.8}>
            <StoryTimeline
              label={t(intro.us.label)}
              steps={intro.us.steps}
              variant="us"
              image={{ src: ROMANCE_IMGS[0].src, alt: t(altFor(ROMANCE_IMGS[0].src)) }}
            />
          </ScrollScene>
        </div>

        {/* Accordion */}
        <Assemble className="mt-14 space-y-3" stagger={0.05}>
          {LONGTAIL_FAQ.map((item, i) => (
            <AssembleItem key={item.id} variant="up">
              <LongtailItem item={item} index={i} open={open === item.id} onToggle={() => setOpen(open === item.id ? null : item.id)} />
            </AssembleItem>
          ))}
        </Assemble>

        {/* CTA */}
        <ScrollScene intensity={0.6} className="mt-12">
          <GlassCard glow className="flex flex-col items-start gap-5 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xl font-extrabold text-white sm:text-2xl">
                {t({ de: "Bereit für den Tag, der nur Ihnen gehört?", en: "Ready for a day that belongs only to you?" })}
              </p>
              <p className="mt-1.5 text-sm text-slate-300">
                {t({
                  de: "Privates Speedboat, max. 5 Gäste, Ihre Route. Unverbindlich anfragen – Antwort meist in 30 Minuten.",
                  en: "Private speedboat, max. 5 guests, your route. No-obligation request – usually answered in 30 minutes.",
                })}
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto lg:shrink-0">
              <button type="button" onClick={() => openBooking()} className={cn(btn.primary, "min-h-14 px-6 py-2 leading-tight sm:whitespace-nowrap sm:px-7")}>
                {t({ de: "Speedboat-Tag anfragen", en: "Request a speedboat day" })} <ArrowRight className="size-5" />
              </button>
              <a
                href={waLink(tOp({ de: "Hallo! Ich habe eine Frage zum Speedboat vs. Longtail.", en: "Hi! I have a question about speedboat vs. longtail." }))}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(btn.whatsapp, "h-14")}
              >
                <WhatsAppIcon className="size-5" /> WhatsApp
              </a>
            </div>
          </GlassCard>
        </ScrollScene>
      </div>
    </section>
  );
}

function StoryTimeline({
  label,
  steps,
  variant,
  image,
}: {
  label: string;
  steps: LongtailStep[];
  variant: "them" | "us";
  image: { src: string; alt: string };
}) {
  const { t } = useTx();
  const us = variant === "us";
  return (
    <div
      className={cn(
        "relative h-full overflow-hidden rounded-3xl p-5 sm:p-7",
        us
          ? "group si-glass si-glow-border shadow-[0_0_60px_-15px_rgb(6_182_212/0.55)]"
          : "group border border-white/10 bg-slate-900/40 backdrop-blur-sm",
      )}
    >
      <div className="relative -mx-5 -mt-5 mb-5 aspect-[2688/1520] overflow-hidden sm:-mx-7 sm:-mt-7">
        <SmartImage
          src={image.src}
          alt={image.alt}
          className={cn(
            "absolute inset-0 size-full object-cover transition duration-700",
            us ? "group-hover:scale-105" : "grayscale-[65%] group-hover:scale-105 group-hover:grayscale-0",
          )}
        />
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 transition duration-700",
            us
              ? "bg-gradient-to-t from-si-navy/80 via-transparent to-transparent"
              : "bg-gradient-to-t from-slate-950/85 via-slate-900/35 to-slate-900/30 group-hover:via-transparent group-hover:to-transparent",
          )}
        />
      </div>
      {us ? <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-si-cyan/25 blur-3xl" /> : null}
      <p
        className={cn(
          "relative mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em]",
          us ? "text-cyan-200" : "text-slate-500",
        )}
      >
        <span className={cn("grid size-6 place-items-center rounded-full", us ? "bg-si-cyan text-si-navy" : "bg-white/10 text-slate-400")}>
          {us ? <Check className="size-3.5" strokeWidth={3} /> : <X className="size-3.5" strokeWidth={3} />}
        </span>
        {label}
      </p>
      <Assemble as="ol" className="relative space-y-4" stagger={0.12}>
        <span
          aria-hidden
          className={cn(
            "absolute bottom-3 left-[27px] top-3 w-px",
            us ? "bg-gradient-to-b from-si-cyan via-cyan-300/50 to-si-gold" : "bg-white/10",
          )}
        />
        {steps.map((s) => (
          <AssembleItem key={s.time + s.text.de} as="li" variant={us ? "right" : "left"} className="relative flex gap-3">
            <span
              className={cn(
                "relative z-[1] grid h-7 w-14 shrink-0 place-items-center rounded-full text-[11px] font-black tabular-nums",
                us ? "bg-si-navy text-cyan-200 ring-1 ring-si-cyan/60" : "bg-slate-800 text-slate-500 ring-1 ring-white/10",
              )}
            >
              {s.time}
            </span>
            <span className={cn("pt-0.5 text-[15px] leading-relaxed", us ? "text-slate-100" : "text-slate-400")}>{t(s.text)}</span>
          </AssembleItem>
        ))}
      </Assemble>
    </div>
  );
}

function LongtailItem({
  item,
  index,
  open,
  onToggle,
}: {
  item: LongtailFaqItem;
  index: number;
  open: boolean;
  onToggle: () => void;
}) {
  const { t } = useTx();
  const panelId = `lt-panel-${item.id}`;
  return (
    <div
      className={cn(
        "si-glass overflow-hidden rounded-2xl transition duration-300",
        open && "bg-si-cyan/10 shadow-[0_0_0_1px_rgb(6_182_212/0.55),0_0_40px_-8px_rgb(6_182_212/0.5)]",
      )}
    >
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex min-h-16 w-full items-center gap-3 px-4 py-4 text-left sm:gap-4 sm:px-5"
        >
          <span className="hidden w-7 shrink-0 text-sm font-black tabular-nums text-cyan-200/60 sm:block">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/5 text-xl ring-1 ring-white/10">
            {item.emoji}
          </span>
          <span className={cn("flex-1 font-bold transition", open ? "text-white" : "text-slate-200")}>
            {t(item.q)}
          </span>
          <motion.span
            animate={{ rotate: open ? 45 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-full transition-colors",
              open ? "bg-si-cyan text-si-navy" : "bg-white/10 text-white",
            )}
          >
            <Plus className="size-4" strokeWidth={2.6} />
          </motion.span>
        </button>
      </h3>
      {/* Content always rendered (SSR / indexable) – collapsed via grid-rows animation. */}
      <div
        id={panelId}
        role="region"
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="space-y-5 px-4 pb-6 sm:px-5 sm:pl-[4.25rem]">
            <p className="text-[15px] leading-relaxed text-slate-200">{t(item.story)}</p>

            <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] text-[10.5px] font-bold uppercase tracking-[0.14em] [overflow-wrap:anywhere] sm:text-[11px]">
                <span className="bg-white/5 px-3 py-2.5 text-slate-400 sm:px-4">{t({ de: "Longtail / Gruppe", en: "Longtail / group" })}</span>
                <span className="bg-si-cyan/15 px-3 py-2.5 text-cyan-200 sm:px-4">Krabi Secret Islands</span>
              </div>
              <ul>
                {item.rows.map((r) => (
                  <li key={r.us.de} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] border-t border-white/10 text-[13px] leading-snug sm:text-sm">
                    <span className="flex gap-2 bg-white/[0.02] px-3 py-3 text-slate-400 sm:px-4">
                      <X className="mt-0.5 size-4 shrink-0 text-rose-400/80" strokeWidth={2.6} aria-label="✗" />
                      <span className="min-w-0 hyphens-auto [overflow-wrap:anywhere]">{t(r.them)}</span>
                    </span>
                    <span className="flex gap-2 bg-si-cyan/[0.06] px-3 py-3 font-semibold text-white sm:px-4">
                      <Check className="mt-0.5 size-4 shrink-0 text-cyan-300" strokeWidth={3} aria-label="✓" />
                      <span className="min-w-0 hyphens-auto [overflow-wrap:anywhere]">{t(r.us)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {item.insider ? (
              <figure className="relative rounded-2xl border-l-2 border-si-gold bg-si-gold/[0.07] py-3 pl-4 pr-4">
                <figcaption className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-si-gold">
                  <Sparkles className="size-3.5" /> {t({ de: "Insider-Moment", en: "Insider moment" })}
                </figcaption>
                <blockquote className="text-[15px] italic leading-relaxed text-amber-50/90">{t(item.insider)}</blockquote>
              </figure>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── FAQ ───────────────────────── */

export function Faq() {
  const { t, tOp } = useTx();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative scroll-mt-16 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle eyebrow={t(UI.faqEyebrow)} title={t(UI.faqTitle)} />
        <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
          <Assemble className="space-y-3" stagger={0.06}>
            {FAQ.map((f, i) => {
              const isOpen = open === i;
              return (
                <AssembleItem key={f.q.de} variant="left">
                  <div
                    className={cn(
                      "si-glass overflow-hidden rounded-2xl transition duration-300",
                      isOpen && "bg-si-cyan/10 shadow-[0_0_0_1px_rgb(6_182_212/0.55),0_0_40px_-8px_rgb(6_182_212/0.5)]",
                    )}
                  >
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={`faq-panel-${i}`}
                      onClick={() => setOpen(isOpen ? null : i)}
                      className="flex min-h-16 w-full items-center gap-4 px-5 py-4 text-left"
                    >
                      <span className="hidden w-7 shrink-0 text-sm font-black tabular-nums text-cyan-200/60 sm:block">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className={cn("flex-1 font-bold transition", isOpen ? "text-white" : "text-slate-200")}>
                        {t(f.q)}
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={cn(
                          "grid size-9 shrink-0 place-items-center rounded-full transition-colors",
                          isOpen ? "bg-si-cyan text-si-navy" : "bg-white/10 text-white",
                        )}
                      >
                        <Plus className="size-4" strokeWidth={2.6} />
                      </motion.span>
                    </button>
                    {/* Answer always in the DOM (SSR / FAQPage JSON-LD must match visible content) – collapsed via grid-rows. */}
                    <div
                      id={`faq-panel-${i}`}
                      role="region"
                      className={cn(
                        "grid transition-[grid-template-rows,opacity] duration-[350ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                        isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      )}
                    >
                      <div className="min-h-0 overflow-hidden">
                        <p className="px-5 pb-5 text-[15px] leading-relaxed text-slate-300 sm:pl-16">{t(f.a)}</p>
                      </div>
                    </div>
                  </div>
                </AssembleItem>
              );
            })}
          </Assemble>

          <ScrollScene from="right" intensity={0.6} className="lg:sticky lg:top-24">
            <GlassCard glow className="p-6">
              <span className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-si-cyan to-si-cyan-dark shadow-lg shadow-si-cyan/30">
                <MessageCircleQuestion className="size-6 text-white" />
              </span>
              <h3 className="mt-4 text-xl font-extrabold text-white">{t({ de: "Noch Fragen?", en: "Still have questions?" })}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                {t({
                  de: "Schreiben Sie uns direkt – ein echter Mensch aus Ao Nang antwortet meist innerhalb von 30 Minuten.",
                  en: "Message us directly – a real person in Ao Nang usually replies within 30 minutes.",
                })}
              </p>
              <a
                href={waLink(tOp({ de: "Hallo! Ich habe eine Frage zu Ihren Touren.", en: "Hi! I have a question about your tours." }))}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(btn.whatsapp, "mt-5 w-full")}
              >
                <WhatsAppIcon className="size-5" /> {t(UI.ctaWhatsapp)}
              </a>
              <a href={`mailto:${BRAND.email}`} className={cn(btn.glass, "mt-3 w-full text-sm")}>
                <Mail className="size-4" /> {t({ de: "E-Mail schreiben", en: "Send an e-mail" })}
              </a>
            </GlassCard>
          </ScrollScene>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── Final CTA ───────────────────────── */

export function FinalCta() {
  const { t, tOp } = useTx();
  const openBooking = useSI((s) => s.openBooking);
  const trust = [
    { icon: BadgeCheck, label: t({ de: "TAT-Lizenz", en: "TAT licence" }), tone: "text-si-gold" },
    { icon: ShieldCheck, label: t({ de: "Marine Department geprüft", en: "Marine Department certified" }), tone: "text-cyan-200" },
    { icon: RefreshCcw, label: t({ de: "Kostenlose Umbuchung", en: "Free rebooking" }), tone: "text-emerald-300" },
    { icon: Waves, label: t({ de: "Schnorchel-Ausrüstung inklusive", en: "Snorkel gear included" }), tone: "text-sky-300" },
    { icon: Zap, label: t({ de: "Antwort < 30 Min.", en: "Reply < 30 min" }), tone: "text-amber-200" },
  ];
  return (
    <section className="relative px-4 py-16 sm:py-24">
      <ScrollScene from="tilt" intensity={0.9} className="mx-auto max-w-6xl">
        <div className="si-glow-border relative overflow-hidden rounded-[2rem]">
          <div className="si-glass-strong relative overflow-hidden rounded-[2rem] px-5 py-12 text-center sm:px-14 sm:py-20">
            <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-80 rounded-full bg-si-cyan/30 blur-[90px]" />
            <div aria-hidden className="pointer-events-none absolute -bottom-28 -right-20 size-80 rounded-full bg-si-gold/20 blur-[90px]" />
            <div aria-hidden className="si-grid-bg pointer-events-none absolute inset-0" />

            <span className="si-glass relative inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200">
              <CalendarClock className="size-3.5" /> {t({ de: "Freie Termine verfügbar", en: "Dates available" })}
            </span>
            <h2 className="si-text-gradient relative mx-auto mt-5 max-w-3xl text-[2.2rem] font-black leading-[1.05] tracking-tight sm:text-6xl">
              <SplitReveal text={t(UI.finalTitle)} />
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-base text-slate-300 sm:text-lg">
              {t({
                de: "Schnorcheln, Schwimmen & Entspannen an einsamen Stränden – so lange Sie möchten, nur mit Ihrer Gruppe.",
                en: "Snorkel, swim & relax on lonely beaches – as long as you like, just with your group.",
              })}{" "}
              {t(UI.finalSub)}
            </p>

            <div className="relative mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              <Magnetic className="sm:w-auto">
                <button type="button" onClick={() => openBooking()} className={cn(btn.primary, "min-h-14 w-full px-5 py-2 text-base leading-tight sm:whitespace-nowrap sm:px-7")}>
                  {t(UI.ctaInquire)} <ArrowRight className="size-5" />
                </button>
              </Magnetic>
              <Magnetic className="sm:w-auto">
                <button type="button" onClick={() => openBooking({ custom: true })} className={cn(btn.gold, "min-h-14 w-full px-5 py-2 leading-tight sm:whitespace-nowrap sm:px-7")}>
                  <Wand2 className="size-5" /> {t({ de: "Eigene Tour bauen", en: "Build your own tour" })}
                </button>
              </Magnetic>
              <a
                href={waLink(tOp({ de: "Hallo! Ich möchte eine private Inseltour anfragen.", en: "Hi! I'd like to request a private island tour." }))}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(btn.whatsapp, "min-h-14 py-2 leading-tight sm:whitespace-nowrap")}
              >
                <WhatsAppIcon className="size-5" /> {t(UI.ctaWhatsapp)}
              </a>
            </div>

            <Assemble className="relative mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5" stagger={0.1}>
              {trust.map(({ icon: Icon, label, tone }) => (
                <AssembleItem key={label} variant="scale" className="last:col-span-2 sm:last:col-span-1">
                  <div className="si-glass flex h-full items-center gap-2 rounded-2xl px-3 py-3 text-left text-xs font-bold text-slate-200 sm:flex-col sm:text-center">
                    <Icon className={cn("size-5 shrink-0", tone)} />
                    {label}
                  </div>
                </AssembleItem>
              ))}
            </Assemble>
          </div>
        </div>
      </ScrollScene>
    </section>
  );
}

/* ───────────────────────── Footer ───────────────────────── */

export function Footer() {
  const { t, tOp } = useTx();
  const openTour = useSI((s) => s.openTour);
  const [legal, setLegal] = useState<"imprint" | "privacy" | null>(null);
  const footerTours = [...TOURS.filter((x) => x.kind === "island").slice(0, 4), ...TOURS.filter((x) => x.kind === "fishing").slice(0, 1)];

  return (
    <footer className="relative mt-8 overflow-hidden border-t border-white/10 bg-gradient-to-b from-si-navy/40 to-si-navy/90 pb-28 pt-16 text-slate-300 backdrop-blur-xl md:pb-10">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-si-cyan/70 to-transparent" />
      <Assemble className="mx-auto grid max-w-6xl gap-10 px-4 sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_1.15fr_0.75fr]" stagger={0.08}>
        <AssembleItem>
          <p className="flex items-center gap-2.5 text-lg font-extrabold text-white">
            <BrandMark className="size-11" />
            <span>
              Krabi <span className="text-si-cyan">Secret</span> Islands
            </span>
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">{t(UI.footerTagline)}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 rounded-full bg-si-gold/10 px-3 py-1.5 text-xs font-bold text-si-gold ring-1 ring-si-gold/30">
              <BadgeCheck className="size-4" /> {t(UI.tat)}
            </span>
            <span className="flex items-center gap-1.5 rounded-full bg-si-cyan/10 px-3 py-1.5 text-xs font-bold text-cyan-200 ring-1 ring-si-cyan/30">
              <ShieldCheck className="size-4" /> {t(UI.marine)}
            </span>
          </div>
        </AssembleItem>

        <AssembleItem>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white">{t(UI.navTours)}</p>
          <ul className="text-sm">
            {footerTours.map((tour) => (
              <li key={tour.id}>
                <button
                  type="button"
                  onClick={() => openTour(tour.id)}
                  className="flex min-h-11 items-center gap-1.5 py-1.5 text-left leading-snug transition hover:text-white"
                >
                  {tour.kind === "fishing" ? "🎣 " : ""}
                  {t(tour.title)}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                onClick={() => scrollToId("touren")}
                className="flex min-h-11 items-center gap-1 font-bold text-cyan-200 transition hover:text-white"
              >
                {t({ de: "Alle Touren ansehen", en: "View all tours" })} <ArrowUpRight className="size-4" />
              </button>
            </li>
          </ul>
        </AssembleItem>

        <AssembleItem>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white">{t(UI.contact)}</p>
          <ul className="text-sm">
            <li>
              <a
                href={waLink(tOp({ de: "Hallo Krabi Secret Islands!", en: "Hi Krabi Secret Islands!" }))}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-h-11 items-center gap-2 hover:text-white"
              >
                <WhatsAppIcon className="size-4 text-si-wa" /> {BRAND.whatsappDisplay}
              </a>
            </li>
            <li>
              <a href={`mailto:${BRAND.email}`} className="flex min-h-11 items-center gap-2 [overflow-wrap:anywhere] hover:text-white">
                <Mail className="size-4 shrink-0 text-si-cyan" /> {BRAND.email}
              </a>
            </li>
            <li className="flex min-h-11 items-center gap-2">
              <MapPin className="size-4 text-si-gold" /> {t(BRAND.location)}
            </li>
          </ul>
        </AssembleItem>

        <AssembleItem>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-white">Legal</p>
          <ul className="text-sm">
            {(["imprint", "privacy"] as const).map((k) => (
              <li key={k}>
                <button
                  type="button"
                  aria-expanded={legal === k}
                  onClick={() => setLegal(legal === k ? null : k)}
                  className={cn("flex min-h-11 items-center gap-1.5 transition hover:text-white", legal === k && "text-white")}
                >
                  {t(k === "imprint" ? UI.imprint : UI.privacy)}
                  <Plus className={cn("size-3.5 transition", legal === k && "rotate-45")} />
                </button>
              </li>
            ))}
          </ul>
          <AnimatePresence initial={false}>
            {legal ? (
              <motion.p
                key={legal}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="si-glass mt-2 overflow-hidden rounded-xl p-3 text-xs leading-relaxed"
              >
                {legal === "imprint"
                  ? t({
                      de: `Krabi Secret Islands Co., Ltd. · Ao Nang, Mueang Krabi, 81180 Thailand · ${BRAND.email}`,
                      en: `Krabi Secret Islands Co., Ltd. · Ao Nang, Mueang Krabi, 81180 Thailand · ${BRAND.email}`,
                    })
                  : t({
                      de: "Anfragedaten werden ausschließlich zur Bearbeitung Ihrer Buchung verwendet und nicht an Dritte weitergegeben. Diese Seite speichert nur Ihre Spracheinstellung lokal.",
                      en: "Inquiry data is used solely to process your booking and never shared with third parties. This site only stores your language preference locally.",
                    })}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </AssembleItem>
      </Assemble>

      <div className="mx-auto mt-12 max-w-6xl border-t border-white/10 px-4 pt-6 text-xs leading-relaxed text-slate-500">
        <p>{t(UI.legalNote)}</p>
        <p className="mt-2">
          © {new Date().getFullYear()} {BRAND.name} · {BRAND.domain}
        </p>
      </div>

      <p
        aria-hidden
        className="pointer-events-none mx-auto mt-10 select-none whitespace-nowrap px-2 text-center text-[min(7.6vw,96px)] font-black uppercase leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.09)]"
        style={{ backgroundImage: "linear-gradient(180deg, rgb(255 255 255 / 0.10), transparent)", WebkitBackgroundClip: "text", backgroundClip: "text" }}
      >
        Krabi Secret Islands
      </p>
    </footer>
  );
}
