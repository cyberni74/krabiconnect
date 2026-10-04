import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Camera,
  Check,
  Clock,
  Expand,
  Fish,
  MapPin,
  Pause,
  Play,
  Plane,
  ShieldCheck,
  Sparkles,
  UtensilsCrossed,
  Wand2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { DURATIONS } from "./booking-data";
import {
  GALLERY,
  GALLERY_TABS,
  IMG,
  TOUR_FILTERS,
  TOURS,
  UI,
  VIDEO,
  type GalleryCat,
  type L,
  type Tour,
  type TourCategory,
} from "./content";
import { Assemble, AssembleItem, GlassCard, ScrollScene, SectionTitle, btn, useParallax } from "./fx";
import { formatTHB, useSI, useTx } from "./store";
import { SmartImage } from "./ui";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ───────── Filter chips with sliding active pill ───────── */
function Chips<T extends string>({
  items,
  value,
  onChange,
  pillId,
}: {
  items: { id: T; label: L }[];
  value: T;
  onChange: (v: T) => void;
  pillId: string;
}) {
  const { t } = useTx();
  return (
    <div role="tablist" className="hide-scroll -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 py-1">
      {items.map((it) => {
        const on = value === it.id;
        return (
          <button
            key={it.id}
            type="button"
            role="tab"
            aria-selected={on}
            onClick={() => onChange(it.id)}
            className={cn(
              "relative h-11 shrink-0 rounded-full px-4 text-sm font-bold transition-colors",
              on ? "text-si-navy" : "si-glass text-slate-300 hover:text-white",
            )}
          >
            {on ? (
              <motion.span
                layoutId={pillId}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-si-cyan to-cyan-300 shadow-[0_8px_24px_-8px_rgb(6_182_212/0.9)]"
              />
            ) : null}
            <span className="relative whitespace-nowrap">
              {it.id === "fishing" ? "🎣 " : null}
              {t(it.label)}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ───────────────────────── Tours ───────────────────────── */

export function Tours() {
  const { t } = useTx();
  const [filter, setFilter] = useState<"all" | TourCategory>("all");
  const list = filter === "all" ? TOURS : TOURS.filter((tr) => tr.categories.includes(filter));
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
    scroller.current?.scrollTo({ left: 0 });
  }, [filter]);

  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const w = card ? card.offsetWidth + 16 : el.clientWidth;
    setActive(Math.min(list.length - 1, Math.round(el.scrollLeft / w)));
  };
  const goTo = (i: number) => {
    const el = scroller.current;
    const card = el?.children[i] as HTMLElement | undefined;
    if (el && card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft - 16, behavior: "smooth" });
  };

  return (
    <section id="touren" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <SectionTitle eyebrow={t(UI.toursEyebrow)} title={t(UI.toursTitle)} sub={t(UI.toursSub)} className="mb-6 sm:mb-10" />
          <motion.p
            key={filter}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="si-glass mb-6 inline-flex shrink-0 items-baseline gap-1.5 self-start rounded-full px-4 py-2 text-sm text-slate-300 sm:mb-12 sm:self-auto"
          >
            <span className="text-xl font-extrabold tabular-nums text-white">{list.length}</span>
            {t({ de: "Touren verfügbar", en: "tours available" })}
          </motion.p>
        </div>

        <Chips items={TOUR_FILTERS} value={filter} onChange={setFilter} pillId="tour-filter-pill" />

        <div
          ref={scroller}
          onScroll={onScroll}
          className="hide-scroll -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-6 pt-2 md:mx-0 md:grid md:grid-cols-2 md:gap-6 md:overflow-visible md:px-0 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {list.map((tour, i) => (
              <motion.div
                key={tour.id}
                layout
                initial={{ opacity: 0, y: 60, rotateX: -18, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
                transition={{ duration: 0.7, delay: (i % 3) * 0.1, ease: EASE }}
                style={{ transformPerspective: 1000 }}
                className="w-[84%] shrink-0 snap-center sm:w-[58%] md:w-auto"
              >
                <TourCard tour={tour} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Mobile progress dots */}
        <div className="flex items-center justify-center gap-1.5 md:hidden" aria-hidden>
          {list.map((tour, i) => (
            <button
              key={tour.id}
              type="button"
              tabIndex={-1}
              onClick={() => goTo(i)}
              className="grid h-6 place-items-center px-0.5"
            >
              <span
                className={cn(
                  "block h-1.5 rounded-full transition-all duration-300",
                  i === active ? "w-6 bg-gradient-to-r from-si-cyan to-si-gold" : "w-1.5 bg-white/25",
                )}
              />
            </button>
          ))}
        </div>

        <BuilderTeaser />
      </div>
    </section>
  );
}

function TourCard({ tour }: { tour: Tour }) {
  const { t } = useTx();
  const openTour = useSI((s) => s.openTour);
  const openBooking = useSI((s) => s.openBooking);
  const fishing = tour.kind === "fishing";
  return (
    <GlassCard as="article" tilt className="group flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-3xl">
        <SmartImage
          src={tour.image}
          alt={t(tour.title)}
          className="si-fallback size-full object-cover transition duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-si-navy via-si-navy/20 to-transparent" />
        <div className="absolute left-3 right-3 top-3 flex items-start justify-between gap-2">
          {tour.badge ? (
            <span className="truncate rounded-full bg-gradient-to-r from-si-gold to-amber-300 px-3 py-1 text-xs font-bold text-si-navy shadow-[0_6px_20px_-6px_rgb(245_158_11/0.9)]">
              {t(tour.badge)}
            </span>
          ) : (
            <span />
          )}
          <span
            className={cn(
              "si-glass flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold",
              fishing ? "text-amber-200" : "text-cyan-200",
            )}
          >
            {fishing ? "🎣" : "🏝️"} {fishing ? t({ de: "Angeltour", en: "Fishing" }) : t({ de: "Inseltour", en: "Island tour" })}
          </span>
        </div>
        <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-2 text-white">
          <span className="si-glass flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold">
            <Clock className="size-3.5 text-cyan-300" /> {t(tour.duration)}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-extrabold leading-snug text-white">{t(tour.title)}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{t(tour.short)}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tour.stops.map((s) => (
            <span
              key={s}
              className="flex items-center gap-1 rounded-full bg-white/[0.06] px-2.5 py-1 text-xs font-semibold text-slate-200 ring-1 ring-white/10"
            >
              <MapPin className="size-3 text-cyan-300" /> {s}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-end justify-between gap-2 pt-5">
          <p className="leading-none">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t(UI.from)}</span>
            <span className="si-text-gradient text-2xl font-extrabold">{formatTHB(tour.price)}</span>
            <span className="ml-1 text-xs text-slate-400">{t(UI.perBoat)}</span>
          </p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => openTour(tour.id)}
            className="h-12 min-w-0 truncate rounded-2xl bg-white/[0.07] px-2 text-sm font-bold text-white ring-1 ring-white/15 transition hover:bg-white/15 active:scale-[0.98]"
          >
            {t({ de: "Details", en: "Details" })}
          </button>
          <button
            type="button"
            onClick={() => openBooking({ tourId: tour.id })}
            className="flex h-12 min-w-0 items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-si-cyan to-cyan-300 px-2 text-sm font-bold text-si-navy shadow-[0_8px_24px_-10px_rgb(6_182_212/0.9)] transition hover:brightness-110 active:scale-[0.98]"
          >
            <span className="truncate">{t({ de: "Buchen", en: "Book" })}</span>
            <ArrowRight className="size-4 shrink-0 transition group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

function BuilderTeaser() {
  const { t } = useTx();
  const openBooking = useSI((s) => s.openBooking);
  const minBase = Math.min(...DURATIONS.map((d) => d.base));
  const steps = [
    { icon: Clock, title: { de: "Dauer wählen", en: "Pick a duration" }, sub: { de: "Halbtags bis Expedition", en: "Half day to expedition" } },
    { icon: MapPin, title: { de: "Inseln kombinieren", en: "Combine islands" }, sub: { de: "Bis zu 7 Stopps", en: "Up to 7 stops" } },
    { icon: UtensilsCrossed, title: { de: "Essen & Drinks", en: "Food & drinks" }, sub: { de: "Thai-Lunch, Obst, Bar", en: "Thai lunch, fruit, bar" } },
  ];
  return (
    <ScrollScene from="tilt" intensity={0.7} className="mt-14">
      <GlassCard glow className="overflow-hidden p-6 sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-si-gold/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 size-72 rounded-full bg-si-cyan/20 blur-3xl" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_1.4fr_auto] lg:items-center">
          <div>
            <span className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-si-gold/15 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200 ring-1 ring-si-gold/30">
              <Wand2 className="size-3.5" /> {t({ de: "Tour-Baukasten", en: "Tour builder" })}
            </span>
            <h3 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">
              {t({ de: "Bauen Sie Ihre eigene Traumroute", en: "Build your own dream route" })}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
              {t({
                de: "Keine Lust auf Standard? Stellen Sie Ihre Tour in drei Schritten zusammen – mit Live-Preis.",
                en: "Not into standard? Put your tour together in three steps – with a live price.",
              })}
            </p>
          </div>
          <Assemble className="grid gap-3 sm:grid-cols-3" stagger={0.12}>
            {steps.map((s, i) => (
              <AssembleItem
                key={s.title.de}
                variant="flip"
                className="flex items-center gap-3 rounded-2xl bg-white/[0.05] p-3 ring-1 ring-white/10 sm:block sm:p-4"
              >
                <div className="flex shrink-0 items-center gap-2 sm:mb-2">
                  <span className="grid size-10 place-items-center rounded-xl bg-si-cyan/15 text-cyan-300 ring-1 ring-si-cyan/30">
                    <s.icon className="size-[18px]" />
                  </span>
                  <span className="hidden text-xs font-black text-slate-500 sm:inline">0{i + 1}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-white">{t(s.title)}</p>
                  <p className="text-xs text-slate-400">{t(s.sub)}</p>
                </div>
              </AssembleItem>
            ))}
          </Assemble>
          <div className="flex flex-col gap-2 lg:items-end">
            <button type="button" onClick={() => openBooking({ custom: true })} className={cn(btn.gold, "h-14 w-full lg:w-auto")}>
              <Sparkles className="size-5" />
              {t({ de: "Eigene Tour bauen", en: "Build your own tour" })}
            </button>
            <p className="text-center text-xs text-slate-400 lg:text-right">
              {t(UI.from)} <span className="font-bold text-white">{formatTHB(minBase)}</span> {t(UI.perBoat)}
            </p>
          </div>
        </div>
      </GlassCard>
    </ScrollScene>
  );
}

/* ───────────────────────── Fishing spotlight ───────────────────────── */

const SPECIES: L[] = [
  { de: "Zackenbarsch", en: "Grouper" },
  { de: "Snapper", en: "Snapper" },
  { de: "Barrakuda", en: "Barracuda" },
  { de: "Königsmakrele", en: "King mackerel" },
  { de: "Thun", en: "Tuna" },
  { de: "Tintenfisch", en: "Squid" },
];

export function FishingSection() {
  const { t } = useTx();
  const fishing = TOURS.filter((tr) => tr.kind === "fishing");
  const styles: L[] = [
    { de: "Riff-Angeln", en: "Reef fishing" },
    { de: "Deep Sea Trolling", en: "Deep sea trolling" },
    { de: "Nacht-Tintenfisch", en: "Night squid fishing" },
    { de: "Catch & Cook BBQ", en: "Catch & cook BBQ" },
  ];

  return (
    <section id="angeln" className="relative scroll-mt-24 overflow-hidden py-20 sm:py-28">
      {/* Sonar rings */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-40 -z-10 -translate-x-1/2 sm:left-[18%]">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute left-1/2 top-1/2 size-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-si-cyan/25"
            initial={{ scale: 0.2, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 6, repeat: Infinity, delay: i * 2, ease: "easeOut" }}
          />
        ))}
      </div>

      <div className="mx-auto grid max-w-6xl gap-10 px-4 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <ScrollScene from="left" intensity={0.6}>
          <SectionTitle
            eyebrow={t({ de: "🎣 Angeltouren", en: "🎣 Fishing trips" })}
            title={t({ de: "Ihr Fang. Ihr Boot. Ihre Andamanensee.", en: "Your catch. Your boat. Your Andaman Sea." })}
            sub={t({
              de: "Vom Riff-Angeln für Einsteiger über Deep Sea Trolling bis zum Nacht-Tintenfischangeln – und am Abend grillen wir Ihren Fang beim Catch & Cook BBQ.",
              en: "From beginner reef fishing to deep sea trolling and night squid fishing – and in the evening we grill your catch at the catch & cook BBQ.",
            })}
            className="mb-6"
          />
          <Assemble className="mb-6 grid grid-cols-2 gap-2" stagger={0.08}>
            {styles.map((s) => (
              <AssembleItem key={s.de} variant="left" className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-si-cyan/15 text-cyan-300">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {t(s)}
              </AssembleItem>
            ))}
          </Assemble>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            {t({ de: "Was hier anbeißt", en: "What bites here" })}
          </p>
          <Assemble className="flex flex-wrap gap-2" stagger={0.05}>
            {SPECIES.map((s) => (
              <AssembleItem key={s.de} variant="scale">
                <span className="si-glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold text-white">
                  <Fish className="size-3.5 text-cyan-300" />
                  {t(s)}
                </span>
              </AssembleItem>
            ))}
          </Assemble>
          <div className="mt-6 inline-flex items-center gap-2.5 rounded-2xl bg-si-gold/10 px-4 py-3 text-sm font-bold text-amber-200 ring-1 ring-si-gold/30">
            <ShieldCheck className="size-5 shrink-0" />
            {t({ de: "Ausrüstung & Guide inklusive", en: "Gear & guide included" })}
          </div>
        </ScrollScene>

        <ScrollScene from="right" intensity={0.6}>
          <Assemble className="grid gap-4 sm:grid-cols-2" stagger={0.1}>
            {fishing.map((tour) => (
              <AssembleItem key={tour.id} variant="flip" className="h-full">
                <FishingCard tour={tour} />
              </AssembleItem>
            ))}
          </Assemble>
        </ScrollScene>
      </div>
    </section>
  );
}

function FishingCard({ tour }: { tour: Tour }) {
  const { t } = useTx();
  const openTour = useSI((s) => s.openTour);
  const openBooking = useSI((s) => s.openBooking);
  return (
    <GlassCard tilt className="group flex h-full flex-row overflow-hidden sm:flex-col">
      <div className="relative w-32 shrink-0 overflow-hidden rounded-l-3xl sm:aspect-[16/10] sm:w-full sm:rounded-l-none sm:rounded-t-3xl">
        <SmartImage
          src={tour.image}
          alt={t(tour.title)}
          className="si-fallback absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-si-navy/80 to-transparent" />
        <span className="absolute left-2 top-2 text-xl drop-shadow">🎣</span>
        {tour.badge ? (
          <span className="absolute bottom-2 left-2 hidden rounded-full bg-gradient-to-r from-si-gold to-amber-300 px-2.5 py-0.5 text-[11px] font-bold text-si-navy sm:inline-block">
            {t(tour.badge)}
          </span>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-4">
        <h3 className="font-extrabold leading-snug text-white">{t(tour.title)}</h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
          <Clock className="size-3.5 shrink-0 text-cyan-300" /> {t(tour.duration)}
        </p>
        <p className="mt-2 leading-none">
          <span className="text-[11px] font-semibold uppercase text-slate-400">{t(UI.from)} </span>
          <span className="si-text-gradient text-lg font-extrabold">{formatTHB(tour.price)}</span>
          <span className="ml-1 text-[11px] text-slate-400">{t(UI.perBoat)}</span>
        </p>
        <div className="mt-auto grid grid-cols-2 gap-2 pt-3">
          <button
            type="button"
            onClick={() => openTour(tour.id)}
            className="h-11 min-w-0 truncate rounded-xl bg-white/[0.07] px-2 text-xs font-bold text-white ring-1 ring-white/15 transition hover:bg-white/15 sm:text-sm"
          >
            {t({ de: "Details", en: "Details" })}
          </button>
          <button
            type="button"
            onClick={() => openBooking({ tourId: tour.id })}
            className="h-11 min-w-0 truncate rounded-xl bg-gradient-to-r from-si-cyan to-cyan-300 px-2 text-xs font-bold text-si-navy transition hover:brightness-110 sm:text-sm"
          >
            {t({ de: "Buchen", en: "Book" })}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}

/* ───────────────────────── Drone feature ───────────────────────── */

export function DroneFeature() {
  const { t } = useTx();
  const openLightbox = useSI((s) => s.openLightbox);
  const openBooking = useSI((s) => s.openBooking);
  const { ref: pRef, y: pY } = useParallax(50);
  const samples = [
    { src: IMG.aerial, title: "Cinematic Drone – Phang Nga", video: VIDEO.cinematic },
    { src: IMG.sandbar, title: "Tup Sandbank", video: undefined },
    { src: IMG.island, title: "Private Bay", video: undefined },
    { src: IMG.lagoon, title: "Reel – Hong Lagoon", video: VIDEO.reel2 },
  ];

  return (
    <section id="drohne" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollScene from="up" intensity={0.8}>
          <GlassCard className="overflow-hidden p-6 sm:p-10 lg:p-14">
            <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-si-cyan/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-40 -left-20 size-96 rounded-full bg-si-gold/15 blur-3xl" />
            <div className="relative grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
              <div>
                <SectionTitle eyebrow={t(UI.droneEyebrow)} title={t(UI.droneTitle)} sub={t(UI.droneText)} className="mb-8" />
                <Assemble as="ul" className="mb-8 grid gap-3 sm:grid-cols-2" stagger={0.09}>
                  {UI.droneFeatures.map((f) => (
                    <AssembleItem
                      as="li"
                      key={f.de}
                      variant="left"
                      className="flex items-center gap-2.5 rounded-2xl bg-white/[0.04] px-3 py-2.5 text-sm font-medium text-slate-200 ring-1 ring-white/10"
                    >
                      <span className="grid size-7 shrink-0 place-items-center rounded-full bg-si-gold/20 text-si-gold">
                        <Check className="size-3.5" strokeWidth={3} />
                      </span>
                      {t(f)}
                    </AssembleItem>
                  ))}
                </Assemble>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <button type="button" onClick={() => openLightbox(samples, 0)} className={cn(btn.gold, "h-14 px-4 text-[15px]")}>
                    <Plane className="size-5" /> {t(UI.droneButton)}
                  </button>
                  <button type="button" onClick={() => openBooking()} className={cn(btn.glass, "h-14")}>
                    {t({ de: "Tour buchen", en: "Book a tour" })}
                  </button>
                </div>
              </div>

              <div ref={pRef} className="relative mx-auto w-full max-w-[22rem]">
                {/* Phone frame */}
                <motion.button
                  type="button"
                  onClick={() => openLightbox(samples, 3)}
                  initial={{ opacity: 0, y: 60, rotate: -6 }}
                  whileInView={{ opacity: 1, y: 0, rotate: -3 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.9, ease: EASE }}
                  className="relative mx-auto block w-[62%] rounded-[2.6rem] border border-white/20 bg-black/60 p-2 shadow-[0_40px_100px_-30px_rgb(6_182_212/0.6)]"
                  aria-label="Play reel"
                >
                  <span className="si-fallback relative block aspect-[9/19] overflow-hidden rounded-[2.1rem]">
                    <VideoPreview src={VIDEO.reel2} poster={IMG.lagoon} />
                    <span className="absolute left-1/2 top-2 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
                    <span className="absolute left-3 top-9 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                      <span className="size-1.5 animate-pulse rounded-full bg-red-500" /> REEL · 4K
                    </span>
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 p-4 text-left text-xs font-bold text-white">
                      @krabisecretislands
                    </span>
                    <span className="absolute left-1/2 top-1/2 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/25 text-white backdrop-blur-md">
                      <Play className="ml-0.5 size-6 fill-current" />
                    </span>
                  </span>
                </motion.button>

                {/* Floating thumbs */}
                <motion.div style={{ y: pY }} className="absolute -right-1 top-6 w-[34%] sm:-right-4">
                  <button
                    type="button"
                    onClick={() => openLightbox(samples, 1)}
                    aria-label={samples[1].title}
                    className="si-fallback relative block aspect-[4/5] w-full rotate-6 overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl"
                  >
                    <SmartImage src={samples[1].src} alt={samples[1].title} className="absolute inset-0 size-full object-cover" />
                  </button>
                </motion.div>
                <motion.div style={{ y: pY }} className="absolute -left-1 bottom-16 w-[32%] sm:-left-4">
                  <button
                    type="button"
                    onClick={() => openLightbox(samples, 2)}
                    aria-label={samples[2].title}
                    className="si-fallback relative block aspect-square w-full -rotate-6 overflow-hidden rounded-2xl border-2 border-white/20 shadow-2xl"
                  >
                    <SmartImage src={samples[2].src} alt={samples[2].title} className="absolute inset-0 size-full object-cover" />
                  </button>
                </motion.div>

                {/* Price chip */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4, ease: EASE }}
                  className="si-glass-strong absolute -left-1 top-2 flex items-center gap-2.5 rounded-2xl px-4 py-3"
                >
                  <span className="grid size-9 place-items-center rounded-xl bg-si-gold/20 text-si-gold">
                    <Camera className="size-5" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-white">{t({ de: "Ab ฿4,500", en: "From ฿4,500" })}</p>
                    <p className="text-[11px] text-slate-400">{t({ de: "pro Tour", en: "per tour" })}</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </GlassCard>
        </ScrollScene>
      </div>
    </section>
  );
}

/** Muted autoplaying preview; falls back to the poster image. */
function VideoPreview({ src, poster }: { src: string; poster: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <SmartImage src={poster} alt="" className="absolute inset-0 size-full object-cover" />;
  return (
    <video
      className="absolute inset-0 size-full object-cover"
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      preload="metadata"
      onError={() => setFailed(true)}
    />
  );
}

/* ───────────────────────── Gallery ───────────────────────── */

export function Gallery() {
  const { t } = useTx();
  const [tab, setTab] = useState<"all" | GalleryCat>("all");
  const openLightbox = useSI((s) => s.openLightbox);
  const list = tab === "all" ? GALLERY : GALLERY.filter((g) => g.cat === tab);
  const lbItems = list.map((g) => ({ src: g.src, title: t(g.title), video: g.video }));

  return (
    <section id="galerie" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle eyebrow={t(UI.galleryEyebrow)} title={t(UI.galleryTitle)} />
        <Chips items={GALLERY_TABS} value={tab} onChange={setTab} pillId="gallery-tab-pill" />

        <motion.div
          layout
          className="grid auto-rows-[130px] grid-flow-dense grid-cols-2 gap-3 sm:auto-rows-[190px] md:grid-cols-4 md:gap-4"
        >
          <AnimatePresence mode="popLayout">
            {list.map((g, i) => (
              <motion.button
                layout
                key={g.id}
                type="button"
                initial={{ opacity: 0, y: 80, scale: 0.85, rotate: i % 2 ? 4 : -4 }}
                whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.75, delay: (i % 4) * 0.08, ease: EASE }}
                onClick={() => openLightbox(lbItems, i)}
                className={cn(
                  "si-fallback group relative block overflow-hidden rounded-3xl ring-1 ring-white/10",
                  g.tall && "row-span-2",
                  i === 0 && tab === "all" && "md:col-span-2 md:row-span-2",
                )}
                aria-label={t(g.title)}
              >
                <SmartImage
                  src={g.src}
                  alt={t(g.title)}
                  className="absolute inset-0 size-full object-cover transition duration-700 ease-out group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-si-navy/80 via-transparent to-transparent" />
                <span className="si-glass absolute bottom-2 left-2 right-2 flex items-center gap-2 rounded-2xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-left transition group-hover:bg-white/15">
                  <span className="line-clamp-2 min-w-0 flex-1 text-[11px] font-semibold leading-snug text-white sm:text-sm">{t(g.title)}</span>
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-white/20 text-white">
                    {g.video ? <Play className="ml-0.5 size-3 fill-current" /> : <Expand className="size-3" />}
                  </span>
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        <h3 className="mb-5 mt-16 flex items-center gap-3 text-xl font-extrabold text-white sm:text-2xl">
          <span className="h-px w-8 bg-gradient-to-r from-si-cyan to-si-gold" />
          {t(UI.reelsTitle)}
        </h3>
        <Assemble className="hide-scroll -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-[1fr_1fr_2.2fr] md:px-0" stagger={0.12}>
          <ReelPlayer src={VIDEO.reel1} poster={IMG.aerial} label="Koh Kudu · Reel" vertical />
          <ReelPlayer src={VIDEO.reel2} poster={IMG.lagoon} label="Hong Lagoon · Reel" vertical />
          <ReelPlayer src={VIDEO.cinematic} poster={IMG.island} label="Phang Nga · Cinematic 4K" />
        </Assemble>
      </div>
    </section>
  );
}

function ReelPlayer({
  src,
  poster,
  label,
  vertical,
}: {
  src: string;
  poster: string;
  label: string;
  vertical?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);

  const toggle = () => {
    const v = ref.current;
    if (!v || failed) return;
    if (v.paused) {
      void v.play().catch(() => setFailed(true));
    } else {
      v.pause();
    }
  };

  return (
    <AssembleItem
      variant="scale"
      className={cn(
        "si-fallback relative shrink-0 snap-center overflow-hidden rounded-3xl ring-1 ring-white/15 shadow-[0_30px_60px_-30px_rgb(0_0_0/0.8)]",
        vertical ? "aspect-[9/16] w-[62%] sm:w-[40%] md:w-auto" : "aspect-video w-[88%] md:aspect-auto md:w-auto",
      )}
    >
      {failed ? (
        <SmartImage src={poster} alt={label} className="absolute inset-0 size-full object-cover" />
      ) : (
        <video
          ref={ref}
          className="absolute inset-0 size-full object-cover"
          src={src}
          poster={poster}
          playsInline
          loop
          muted
          preload="none"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setFailed(true)}
        />
      )}
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="group absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-transparent to-black/10"
      >
        <motion.span
          animate={{ scale: playing ? 0.8 : 1, opacity: playing ? 0 : 1 }}
          className="si-glass grid size-16 place-items-center rounded-full text-white transition group-hover:scale-110"
        >
          {playing ? <Pause className="size-6 fill-current" /> : <Play className="ml-1 size-6 fill-current" />}
        </motion.span>
      </button>
      <span className="si-glass pointer-events-none absolute bottom-3 left-3 rounded-full px-3 py-1 text-xs font-bold text-white">
        {label}
      </span>
      {failed ? (
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/40 px-2 py-1 text-[10px] text-white">
          Preview
        </span>
      ) : null}
    </AssembleItem>
  );
}
