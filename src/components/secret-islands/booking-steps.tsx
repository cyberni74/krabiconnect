import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  Fish,
  Lock,
  Mail,
  MapPin,
  Sailboat,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { BRAND, TOUR_FILTERS, TOURS, type TourCategory } from "./content";
import {
  BOOKING_EXTRAS,
  CATERING_PACKAGE,
  DRINKS,
  DURATIONS,
  FOOD,
  ISLANDS,
  ZONE_LABEL,
  ZONE_SURCHARGE,
  addOnTotal,
  dayStatus,
  islandAllowed,
  slotStatus,
  toISODate,
  type AddOn,
  type DurationId,
  type SlotStatus,
  type Zone,
} from "./booking-data";
import {
  AddOnCard,
  AnimatedPrice,
  CheckDot,
  Chip,
  IncludedStrip,
  Field,
  SectionHead,
  Stepper,
  inputCls,
} from "./booking-ui";
import {
  MAX_GUESTS,
  OCCASIONS,
  contactErrors,
  currentSlots,
  currentTour,
  durationOf,
  htmlLang,
  itemAmount,
  priceBreakdown,
  recommendation,
  routeNames,
  sortByRecommendation,
  slotInfo,
  type Draft,
} from "./booking-model";
import { SmartImage, WhatsAppIcon } from "./ui";
import { btn } from "./fx";
import { formatTHB, useTx } from "./store";

export type StepProps = {
  draft: Draft;
  patch: (p: Partial<Draft> | ((d: Draft) => Partial<Draft>)) => void;
  todayISO: string;
};

/* ═════════════════ Step 1 · Tour ═════════════════ */

export function TourStep({ draft, patch }: StepProps) {
  const { t } = useTx();
  return (
    <div>
      <div
        role="tablist"
        aria-label={t({ de: "Tour-Art", en: "Tour type" })}
        className="relative mb-6 grid grid-cols-2 rounded-2xl border border-white/10 bg-black/20 p-1"
      >
        {(
          [
            { id: "preset", icon: Sailboat, label: { de: "Fertige Touren", en: "Ready-made tours" } },
            { id: "custom", icon: Compass, label: { de: "Eigene Tour bauen", en: "Build your own" } },
          ] as const
        ).map((m) => {
          const active = draft.mode === m.id;
          const Icon = m.icon;
          return (
            <button
              key={m.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => patch({ mode: m.id })}
              className={cn(
                "relative z-10 flex min-h-12 items-center justify-center gap-2 rounded-xl px-2 text-sm font-bold transition sm:text-base",
                active ? "text-si-navy" : "text-slate-300 hover:text-white",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="si-mode-pill"
                  className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-si-cyan to-cyan-300 shadow-[0_8px_30px_-10px_rgb(6_182_212/0.9)]"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}
              <Icon className="size-4" />
              {t(m.label)}
            </button>
          );
        })}
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={draft.mode}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {draft.mode === "preset" ? <PresetPicker draft={draft} patch={patch} /> : <CustomBuilder draft={draft} patch={patch} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PresetPicker({ draft, patch }: Omit<StepProps, "todayISO">) {
  const { t } = useTx();
  const [filter, setFilter] = useState<"all" | TourCategory>("all");
  const list = filter === "all" ? TOURS : TOURS.filter((x) => x.categories.includes(filter));
  return (
    <div>
      <div className="hide-scroll -mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
        {TOUR_FILTERS.map((f) => (
          <Chip key={f.id} active={filter === f.id} onClick={() => setFilter(f.id)}>
            {f.id === "fishing" ? <span aria-hidden>🎣</span> : f.id === "family" ? <span aria-hidden>👨‍👩‍👧</span> : null}
            {t(f.label)}
          </Chip>
        ))}
      </div>
      {filter !== "fishing" && currentTour(draft)?.kind !== "fishing" ? <IncludedStrip className="mb-4" /> : null}
      <motion.div layout className="grid gap-3 md:grid-cols-2">
        <AnimatePresence initial={false}>
          {list.map((tour) => {
            const on = draft.tourId === tour.id;
            return (
              <motion.button
                layout
                key={tour.id}
                type="button"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                onClick={() => patch((d) => ({ tourId: tour.id, slot: d.slot && tour.slots.includes(d.slot) ? d.slot : null }))}
                aria-pressed={on}
                className={cn(
                  "group relative flex items-stretch gap-3 overflow-hidden rounded-2xl border p-2 pr-3 text-left transition",
                  on
                    ? "border-si-cyan/70 bg-si-cyan/15 shadow-[0_12px_40px_-18px_rgb(6_182_212/1)]"
                    : "border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]",
                )}
              >
                <div className="relative w-24 shrink-0 overflow-hidden rounded-xl sm:w-28">
                  <SmartImage src={tour.image} alt={t(tour.title)} className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-110" />
                  {tour.kind === "fishing" ? (
                    <span className="absolute left-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-black/50 text-sm backdrop-blur" aria-label={t({ de: "Angeltour", en: "Fishing trip" })}>
                      🎣
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1 py-1">
                  {tour.badge ? (
                    <span className="mb-1 inline-block rounded-full bg-si-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
                      {t(tour.badge)}
                    </span>
                  ) : null}
                  <p className="line-clamp-2 text-[15px] font-bold leading-snug text-white">{t(tour.title)}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                    <Clock className="size-3.5 shrink-0" />
                    <span className="truncate">{t(tour.duration)}</span>
                  </p>
                  <p className="mt-1.5 text-sm">
                    <span className="font-extrabold text-cyan-300">{formatTHB(tour.price)}</span>{" "}
                    <span className="text-xs text-slate-400">{t({ de: "pro Boot", en: "per boat" })}</span>
                  </p>
                </div>
                <CheckDot on={on} className="self-center" />
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

const ZONES: Zone[] = ["near", "mid", "far"];

function CustomBuilder({ draft, patch }: Omit<StepProps, "todayISO">) {
  const { t } = useTx();
  const dur = durationOf(draft.duration);
  const full = draft.islands.length >= dur.maxStops;
  const names = routeNames(draft);

  const setDuration = (id: DurationId) =>
    patch((d) => {
      const nd = durationOf(id);
      const islands = d.islands
        .filter((iid) => {
          const isl = ISLANDS.find((x) => x.id === iid);
          return isl ? islandAllowed(isl, id) : false;
        })
        .slice(0, nd.maxStops);
      return { duration: id, islands, slot: d.slot && nd.slots.includes(d.slot) ? d.slot : null };
    });

  const toggle = (id: string) =>
    patch((d) => {
      if (d.islands.includes(id)) return { islands: d.islands.filter((x) => x !== id) };
      if (d.islands.length >= durationOf(d.duration).maxStops) return {};
      return { islands: [...d.islands, id] };
    });

  const move = (i: number, dir: -1 | 1) =>
    patch((d) => {
      const arr = [...d.islands];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return {};
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return { islands: arr };
    });

  return (
    <div className="space-y-7">
      <section>
        <SectionHead title={t({ de: "1 · Dauer wählen", en: "1 · Choose duration" })} />
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
          {DURATIONS.map((d) => {
            const on = draft.duration === d.id;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setDuration(d.id)}
                aria-pressed={on}
                className={cn(
                  "relative rounded-2xl border p-3.5 text-left transition",
                  on
                    ? "border-si-cyan/70 bg-gradient-to-br from-si-cyan/25 to-si-cyan/5 shadow-[0_12px_40px_-18px_rgb(6_182_212/1)]"
                    : "border-white/10 bg-white/[0.04] hover:border-white/25",
                )}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-white">{t(d.label)}</span>
                  <CheckDot on={on} className="size-5" />
                </span>
                <span className="mt-1 block text-xs leading-snug text-slate-400">{t(d.desc)}</span>
                <span className="mt-2 block text-sm font-bold text-cyan-300">
                  {t({ de: "ab", en: "from" })} {formatTHB(d.base)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <SectionHead
          title={t({ de: "2 · Inseln wählen", en: "2 · Pick your islands" })}
          sub={t({ de: "Reihenfolge = Ihre Route. Der Kapitän optimiert nach Gezeiten.", en: "Order = your route. The captain optimises for the tides." })}
          right={
            <motion.span
              key={draft.islands.length}
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              className={cn(
                "shrink-0 rounded-full px-3 py-1 text-sm font-bold tabular-nums",
                full ? "bg-si-gold/20 text-amber-300" : "bg-si-cyan/15 text-cyan-300",
              )}
              aria-live="polite"
            >
              {draft.islands.length}/{dur.maxStops} {t({ de: "Stopps", en: "stops" })}
            </motion.span>
          }
        />
        <div className="space-y-5">
          {ZONES.map((zone) => {
            const isles = ISLANDS.filter((i) => i.zone === zone);
            const locked = !islandAllowed(isles[0], draft.duration);
            return (
              <div key={zone}>
                <div className="mb-2 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>{t(ZONE_LABEL[zone])}</span>
                  {ZONE_SURCHARGE[zone] ? (
                    <span className="rounded-full bg-white/5 px-2 py-0.5 normal-case tracking-normal text-slate-300">
                      +{formatTHB(ZONE_SURCHARGE[zone])}
                    </span>
                  ) : null}
                  {locked ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-si-gold/15 px-2 py-0.5 normal-case tracking-normal text-amber-300">
                      <Lock className="size-3" />
                      {t({ de: "Nur bei Ganztags oder Expedition erreichbar", en: "Only reachable on full day or expedition" })}
                    </span>
                  ) : null}
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
                  {isles.map((isl) => {
                    const idx = draft.islands.indexOf(isl.id);
                    const on = idx >= 0;
                    const disabled = locked || (!on && full);
                    return (
                      <button
                        key={isl.id}
                        type="button"
                        onClick={() => toggle(isl.id)}
                        disabled={disabled}
                        aria-pressed={on}
                        title={locked ? t({ de: "Nur bei Ganztags oder Expedition erreichbar", en: "Only reachable on full day or expedition" }) : undefined}
                        className={cn(
                          "group relative h-28 overflow-hidden rounded-2xl border text-left transition",
                          on ? "border-si-cyan ring-2 ring-si-cyan/60" : "border-white/10 hover:border-white/30",
                          disabled && "cursor-not-allowed opacity-40 grayscale",
                        )}
                      >
                        <SmartImage src={isl.image} alt={isl.name} className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-110" />
                        <span className="absolute inset-0 bg-gradient-to-t from-si-navy via-si-navy/40 to-transparent" />
                        <span className="absolute inset-x-2.5 bottom-2 block">
                          <span className="block text-sm font-bold leading-tight text-white">{isl.name}</span>
                          <span className="mt-0.5 block truncate text-[11px] text-slate-300">
                            {t(isl.tag)} · {isl.minutes} {t({ de: "Min.", en: "min" })}
                          </span>
                        </span>
                        {on ? (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-si-cyan text-sm font-extrabold text-si-navy shadow-lg"
                          >
                            {idx + 1}
                          </motion.span>
                        ) : locked ? (
                          <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-black/50 text-white">
                            <Lock className="size-3.5" />
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        {full ? (
          <p className="mt-3 text-xs text-amber-300">
            {t({ de: "Maximale Stopps erreicht – für mehr Inseln eine längere Dauer wählen.", en: "Max stops reached – choose a longer duration for more islands." })}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-white/10 bg-black/20 p-4">
        <SectionHead title={t({ de: "Ihre Route", en: "Your route" })} />
        <p className="-mt-1 mb-3 text-xs text-emerald-200">
          <span aria-hidden>🤿🏊🌴 </span>
          {t({ de: "An jedem Stopp: Schnorcheln, Schwimmen & Entspannen so lange Sie möchten", en: "At every stop: snorkel, swim & relax as long as you like" })}
        </p>
        {names.length === 0 ? (
          <p className="text-sm text-slate-400">{t({ de: "Noch keine Insel gewählt – tippen Sie oben auf eine Insel.", en: "No island yet – tap an island above." })}</p>
        ) : (
          <ol className="relative space-y-1.5">
            <RouteNode label="Ao Nang" sub={t({ de: "Start", en: "Start" })} />
            <AnimatePresence initial={false}>
              {draft.islands.map((id, i) => (
                <motion.li
                  key={id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  className="flex items-center gap-2 rounded-xl bg-white/[0.05] py-1 pl-2 pr-1"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-si-cyan text-xs font-extrabold text-si-navy">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{names[i]}</span>
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label={t({ de: "Nach oben", en: "Move up" })} className="grid size-10 place-items-center rounded-lg text-slate-300 hover:bg-white/10 disabled:opacity-25">
                    <ArrowUp className="size-4" />
                  </button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === draft.islands.length - 1} aria-label={t({ de: "Nach unten", en: "Move down" })} className="grid size-10 place-items-center rounded-lg text-slate-300 hover:bg-white/10 disabled:opacity-25">
                    <ArrowDown className="size-4" />
                  </button>
                  <button type="button" onClick={() => toggle(id)} aria-label={t({ de: "Entfernen", en: "Remove" })} className="grid size-10 place-items-center rounded-lg text-slate-300 hover:bg-rose-500/20 hover:text-rose-200">
                    <X className="size-4" />
                  </button>
                </motion.li>
              ))}
            </AnimatePresence>
            <RouteNode label="Ao Nang" sub={t({ de: "Rückkehr", en: "Return" })} />
          </ol>
        )}
      </section>
    </div>
  );
}

function RouteNode({ label, sub }: { label: string; sub: string }) {
  return (
    <li className="flex items-center gap-2 px-2 py-1">
      <span className="grid size-7 shrink-0 place-items-center rounded-full border border-si-gold/50 bg-si-gold/15 text-amber-300">
        <MapPin className="size-3.5" />
      </span>
      <span className="text-sm font-semibold text-white">{label}</span>
      <span className="text-xs text-slate-400">· {sub}</span>
    </li>
  );
}

/* ═════════════════ Step 2 · Date & time ═════════════════ */

const STATUS_DOT: Record<SlotStatus, string> = {
  free: "bg-si-cyan",
  limited: "bg-si-gold",
  booked: "bg-slate-600",
};

export function DateStep({ draft, patch, todayISO }: StepProps) {
  const { t, lang } = useTx();
  const locale = htmlLang(lang);
  const slots = currentSlots(draft);
  const today = useMemo(() => new Date(`${todayISO}T12:00:00`), [todayISO]);
  const [view, setView] = useState(() => {
    const base = draft.date ? new Date(`${draft.date}T12:00:00`) : today;
    return { y: base.getFullYear(), m: base.getMonth() };
  });

  const weekdays = useMemo(() => {
    const f = new Intl.DateTimeFormat(locale, { weekday: "short" });
    // 2024-01-01 was a Monday.
    return Array.from({ length: 7 }, (_, i) => f.format(new Date(2024, 0, 1 + i, 12)));
  }, [locale]);
  const monthTitle = new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(new Date(view.y, view.m, 1, 12));

  const first = new Date(view.y, view.m, 1, 12);
  const offset = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(view.y, view.m, i + 1, 12)),
  ];

  const monthIndex = view.y * 12 + view.m;
  const minIndex = today.getFullYear() * 12 + today.getMonth();
  const maxIndex = minIndex + 12;
  const shift = (dir: -1 | 1) => {
    const idx = Math.min(maxIndex, Math.max(minIndex, monthIndex + dir));
    setView({ y: Math.floor(idx / 12), m: idx % 12 });
  };

  const pickDate = (iso: string) =>
    patch((d) => {
      const open = currentSlots(d).filter((s) => slotStatus(iso, s, todayISO) !== "booked");
      const keep = d.slot && open.includes(d.slot) ? d.slot : open.length === 1 ? open[0] : null;
      return { date: iso, slot: keep };
    });

  const longDate = draft.date
    ? new Intl.DateTimeFormat(locale, { weekday: "long", day: "numeric", month: "long" }).format(new Date(`${draft.date}T12:00:00`))
    : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]">
      <section className="rounded-3xl border border-white/10 bg-black/20 p-3 sm:p-5">
        <div className="mb-3 flex items-center justify-between">
          <button type="button" onClick={() => shift(-1)} disabled={monthIndex <= minIndex} aria-label={t({ de: "Vorheriger Monat", en: "Previous month" })} className="si-glass grid size-11 place-items-center rounded-xl text-white disabled:opacity-30">
            <ChevronLeft className="size-5" />
          </button>
          <AnimatePresence mode="wait" initial={false}>
            <motion.h3
              key={monthTitle}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="text-lg font-extrabold capitalize text-white"
              aria-live="polite"
            >
              {monthTitle}
            </motion.h3>
          </AnimatePresence>
          <button type="button" onClick={() => shift(1)} disabled={monthIndex >= maxIndex} aria-label={t({ de: "Nächster Monat", en: "Next month" })} className="si-glass grid size-11 place-items-center rounded-xl text-white disabled:opacity-30">
            <ChevronRight className="size-5" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500" aria-hidden>
          {weekdays.map((w, i) => (
            <span key={i} className="py-1">
              {w}
            </span>
          ))}
        </div>
        <motion.div
          key={monthIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-7 gap-1"
          role="grid"
          aria-label={monthTitle}
        >
          {cells.map((day, i) => {
            if (!day) return <span key={`e${i}`} />;
            const iso = toISODate(day);
            const past = iso < todayISO;
            const isToday = iso === todayISO;
            const status: SlotStatus = past ? "booked" : dayStatus(iso, slots, todayISO);
            const disabled = status === "booked";
            const on = draft.date === iso;
            const label = new Intl.DateTimeFormat(locale, { dateStyle: "full" }).format(day);
            return (
              <button
                key={iso}
                type="button"
                disabled={disabled}
                onClick={() => pickDate(iso)}
                aria-pressed={on}
                aria-label={`${label}${status === "limited" ? ` – ${t({ de: "Wenige Plätze", en: "Few spots" })}` : disabled && !past ? ` – ${t({ de: "Ausgebucht", en: "Booked out" })}` : ""}`}
                className={cn(
                  "relative flex aspect-square min-h-11 flex-col items-center justify-center rounded-xl text-sm font-bold transition sm:aspect-[1.15]",
                  on
                    ? "bg-gradient-to-br from-si-cyan to-cyan-300 text-si-navy shadow-[0_8px_24px_-8px_rgb(6_182_212/1)]"
                    : disabled
                      ? "cursor-not-allowed text-slate-600"
                      : "text-white hover:bg-white/10",
                  isToday && !on && "ring-1 ring-inset ring-white/40",
                )}
              >
                <span className={cn(disabled && !past && "line-through decoration-slate-500")}>{day.getDate()}</span>
                {!past && !disabled ? (
                  <span className={cn("mt-1 size-1.5 rounded-full", on ? "bg-si-navy" : STATUS_DOT[status])} />
                ) : (
                  <span className="mt-1 size-1.5" />
                )}
              </button>
            );
          })}
        </motion.div>
        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-white/10 pt-3 text-xs text-slate-400">
          <Legend dot="bg-si-cyan" label={t({ de: "Verfügbar", en: "Available" })} />
          <Legend dot="bg-si-gold" label={t({ de: "Wenige Plätze", en: "Few spots" })} />
          <span className="inline-flex items-center gap-1.5">
            <span className="text-slate-600 line-through">12</span>
            {t({ de: "Ausgebucht", en: "Booked out" })}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="size-3.5 rounded ring-1 ring-white/40" />
            {t({ de: "Heute", en: "Today" })}
          </span>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          {t({ de: "Verfügbarkeit wird nach Anfrage final bestätigt", en: "Availability is confirmed after your request" })}
        </p>
      </section>

      <section>
        <SectionHead
          title={t({ de: "Abfahrtszeit", en: "Departure time" })}
          sub={longDate ?? t({ de: "Wählen Sie zuerst ein Datum im Kalender.", en: "Pick a date in the calendar first." })}
        />
        {draft.date ? (
          <div className="grid gap-2.5">
            {slots.map((sid, i) => {
              const s = slotInfo(sid, draft);
              const st = slotStatus(draft.date!, sid, todayISO);
              const on = draft.slot === sid;
              const disabled = st === "booked";
              return (
                <motion.button
                  key={sid}
                  type="button"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  disabled={disabled}
                  onClick={() => patch({ slot: sid })}
                  aria-pressed={on}
                  className={cn(
                    "flex min-h-16 items-center gap-3 rounded-2xl border px-4 text-left transition",
                    on
                      ? "border-si-cyan/70 bg-si-cyan/15 shadow-[0_10px_30px_-14px_rgb(6_182_212/1)]"
                      : "border-white/10 bg-white/[0.04] hover:border-white/25",
                    disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  <span className="text-2xl font-extrabold tabular-nums text-white">{s.time}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-white">{t(s.label)}</span>
                    <span
                      className={cn(
                        "flex items-center gap-1.5 text-xs",
                        st === "free" ? "text-cyan-300" : st === "limited" ? "text-amber-300" : "text-slate-500",
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", STATUS_DOT[st])} />
                      {st === "free"
                        ? t({ de: "Verfügbar", en: "Available" })
                        : st === "limited"
                          ? t({ de: "Wenige Plätze", en: "Few spots" })
                          : t({ de: "Ausgebucht", en: "Booked out" })}
                    </span>
                  </span>
                  <CheckDot on={on} />
                </motion.button>
              );
            })}
          </div>
        ) : (
          <div className="grid place-items-center rounded-2xl border border-dashed border-white/15 px-4 py-10 text-center text-slate-500">
            <CalendarDays className="mb-2 size-8" />
            <p className="text-sm">{t({ de: "Freie Tage sind mit einem Punkt markiert.", en: "Available days are marked with a dot." })}</p>
          </div>
        )}
        <p className="mt-4 text-xs text-slate-400">
          {t({ de: "Privat-Charter – nur Ihre Gruppe an Bord, flexible Abholung vom Hotel.", en: "Private charter – only your group on board, flexible hotel pick-up." })}
        </p>
      </section>
    </div>
  );
}

function Legend({ dot, label }: { dot: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("size-2 rounded-full", dot)} />
      {label}
    </span>
  );
}

/* ═════════════════ Step 3 · Guests & catering ═════════════════ */

function AddOnGrid({
  items,
  selected,
  draft,
  onToggle,
}: {
  items: AddOn[];
  selected: string[];
  draft: Draft;
  onToggle: (id: string) => void;
}) {
  const { t } = useTx();
  return (
    <div className="grid gap-2.5 md:grid-cols-2">
      {sortByRecommendation(items, draft).map((item) => {
        const rec = recommendation(item, draft);
        return (
          <AddOnCard
            key={item.id}
            item={item}
            guests={draft.guests}
            kids={draft.kids}
            on={selected.includes(item.id)}
            onToggle={() => onToggle(item.id)}
            recommended={rec ? t(rec) : null}
          />
        );
      })}
    </div>
  );
}

function Subtotal({ value }: { value: number }) {
  const { t } = useTx();
  return (
    <span className="shrink-0 text-right">
      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">{t({ de: "Zwischensumme", en: "Subtotal" })}</span>
      <AnimatedPrice value={value} className="font-extrabold text-cyan-300" />
    </span>
  );
}

const toggleIn = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

export function GuestsStep({ draft, patch }: StepProps) {
  const { t } = useTx();
  return (
    <div className="space-y-8">
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="si-glow-border rounded-3xl bg-gradient-to-br from-si-cyan/15 to-transparent p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-extrabold text-white">
                <Users className="size-5 text-cyan-300" />
                {t({ de: "Gäste", en: "Guests" })}
              </p>
              <p className="mt-1 text-xs font-semibold text-amber-300">{t({ de: "max. 5 Gäste – nur Ihre Gruppe", en: "max. 5 guests – just your group" })}</p>
            </div>
            <Stepper
              value={draft.guests}
              min={1}
              max={MAX_GUESTS}
              label={t({ de: "Anzahl Gäste", en: "Number of guests" })}
              onChange={(v) => patch((d) => ({ guests: v, kids: Math.min(d.kids, v) }))}
            />
          </div>
          <div className="mt-3 flex gap-1" aria-hidden>
            {Array.from({ length: MAX_GUESTS }, (_, i) => (
              <motion.span
                key={i}
                animate={{ opacity: i < draft.guests ? 1 : 0.2, scale: i < draft.guests ? 1 : 0.85 }}
                className="text-xl"
              >
                {i < draft.guests - draft.kids ? "🧑" : i < draft.guests ? "🧒" : "👤"}
              </motion.span>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-extrabold text-white">{t({ de: "davon Kinder", en: "of which children" })}</p>
              <p className="mt-1 text-xs text-slate-400">{t({ de: "Optional · Schwimmwesten in Kindergröße an Bord", en: "Optional · kids' life jackets on board" })}</p>
            </div>
            <Stepper value={draft.kids} min={0} max={draft.guests} label={t({ de: "Anzahl Kinder", en: "Number of children" })} onChange={(v) => patch({ kids: v })} />
          </div>
        </div>
      </section>

      <section>
        <p className="mb-2 text-sm font-semibold text-slate-200">{t({ de: "Anlass? (optional)", en: "Occasion? (optional)" })}</p>
        <div className="hide-scroll -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          {OCCASIONS.map((o) => (
            <Chip key={o.id} active={draft.occasion === o.id} onClick={() => patch((d) => ({ occasion: d.occasion === o.id ? null : o.id }))}>
              <span aria-hidden>{o.emoji}</span>
              {t(o.label)}
            </Chip>
          ))}
        </div>
      </section>

      <section>
        <SectionHead
          title={t({ de: "Verpflegung", en: "Food" })}
          sub={t({ de: "Mit einem Klick dazubuchen", en: "Add with one click" })}
          right={<Subtotal value={addOnTotal(FOOD, draft.food, draft.guests, draft.kids)} />}
        />
        <CateringHero draft={draft} patch={patch} />
        <div className="mt-3 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">
          <span aria-hidden className="text-lg">💧</span>
          <p>{t({ de: "Immer inklusive: Wasser, Softdrinks & frisches Obst.", en: "Always included: water, soft drinks & fresh fruit." })}</p>
        </div>
        <p className="mb-2.5 mt-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-300">
          <Sparkles className="size-3.5" />
          {t({ de: "Premium-Upgrades", en: "Premium upgrades" })}
        </p>
        <AddOnGrid
          items={FOOD.filter((f) => f.id !== CATERING_PACKAGE.id)}
          selected={draft.food}
          draft={draft}
          onToggle={(id) => patch((d) => ({ food: toggleIn(d.food, id) }))}
        />
      </section>

      <section>
        <SectionHead
          title={t({ de: "Getränke", en: "Drinks" })}
          sub={t({ de: "Mehrfachauswahl möglich", en: "Choose as many as you like" })}
          right={<Subtotal value={addOnTotal(DRINKS, draft.drinks, draft.guests, draft.kids)} />}
        />
        <AddOnGrid items={DRINKS} selected={draft.drinks} draft={draft} onToggle={(id) => patch((d) => ({ drinks: toggleIn(d.drinks, id) }))} />
      </section>
    </div>
  );
}

function CateringHero({ draft, patch }: Pick<StepProps, "draft" | "patch">) {
  const { t } = useTx();
  const c = CATERING_PACKAGE;
  const on = draft.food.includes(c.id);
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => patch((d) => ({ food: toggleIn(d.food, c.id) }))}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "si-glow-border relative flex w-full flex-col gap-3 overflow-hidden rounded-3xl p-4 text-left transition sm:flex-row sm:items-center sm:p-5",
        on ? "bg-gradient-to-br from-si-cyan/30 to-si-cyan/5" : "bg-gradient-to-br from-white/[0.09] to-white/[0.02] hover:from-white/[0.12]",
      )}
    >
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-si-cyan/25 blur-3xl" />
      <span className="flex items-center gap-3 sm:flex-1">
        <span aria-hidden className={cn("grid size-14 shrink-0 place-items-center rounded-2xl text-3xl", on ? "bg-si-cyan/30" : "bg-white/10")}>
          {c.emoji}
        </span>
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-extrabold text-white">{t(c.label)}</span>
            {c.tag ? (
              <span className="rounded-full bg-si-cyan/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-200">{t(c.tag)}</span>
            ) : null}
          </span>
          <span className="mt-0.5 block text-sm leading-snug text-slate-300">{t(c.desc)}</span>
        </span>
      </span>
      <span className="flex items-center justify-between gap-4 border-t border-white/10 pt-3 sm:border-0 sm:pt-0">
        <span className="text-right leading-tight">
          <span className="block font-extrabold text-cyan-300">
            +{formatTHB(c.price)} {t({ de: "p. P.", en: "p.p." })}
          </span>
          <span className="block text-xs text-slate-400">
            {draft.guests} × {formatTHB(c.price)} = {formatTHB(itemAmount(c, draft.guests, draft.kids))}
          </span>
        </span>
        <span
          aria-hidden
          className={cn("relative inline-flex h-8 w-14 shrink-0 items-center rounded-full p-1 transition-colors", on ? "bg-si-cyan" : "bg-white/15")}
        >
          <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 32 }} className={cn("size-6 rounded-full bg-white shadow", on && "ml-auto")} />
        </span>
      </span>
    </motion.button>
  );
}

/* ═════════════════ Step 4 · Extras ═════════════════ */

export function ExtrasStep({ draft, patch }: StepProps) {
  const { t } = useTx();
  return (
    <section>
      <SectionHead
        title={t({ de: "Machen Sie den Tag unvergesslich", en: "Make the day unforgettable" })}
        sub={t({ de: "Alle Extras sind optional und pro Boot berechnet.", en: "All extras are optional and priced per boat." })}
        right={<Subtotal value={addOnTotal(BOOKING_EXTRAS, draft.extras, draft.guests, draft.kids)} />}
      />
      <AddOnGrid items={BOOKING_EXTRAS} selected={draft.extras} draft={draft} onToggle={(id) => patch((d) => ({ extras: toggleIn(d.extras, id) }))} />
      <div className="mt-5 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-300">
        <Sparkles className="mt-0.5 size-5 shrink-0 text-amber-300" />
        <p>{t({ de: "Etwas anderes im Sinn? Schreiben Sie es im nächsten Schritt in Ihre Wünsche – wir machen fast alles möglich.", en: "Something else in mind? Add it to your wishes in the next step – we make almost anything happen." })}</p>
      </div>
    </section>
  );
}

/* ═════════════════ Step 5 · Contact & summary ═════════════════ */

export function ContactStep({
  draft,
  patch,
  showErrors,
  onSend,
  waHref,
  mailtoHref,
}: StepProps & { showErrors: boolean; onSend: (via: "wa" | "mail") => boolean; waHref: string; mailtoHref: string }) {
  const { t } = useTx();
  const errs = contactErrors(draft);
  const e = (k: keyof typeof errs) => (showErrors && errs[k] ? t(errs[k]!) : undefined);
  const valid = Object.keys(errs).length === 0;

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <section className="space-y-4">
        <SectionHead title={t({ de: "Ihre Kontaktdaten", en: "Your contact details" })} sub={t({ de: "Wir antworten persönlich – kein Callcenter.", en: "We reply personally – no call centre." })} />
        <Field label={`${t({ de: "Name", en: "Name" })} *`} error={e("name")}>
          <input className={inputCls} value={draft.name} onChange={(ev) => patch({ name: ev.target.value })} autoComplete="name" placeholder={t({ de: "Vor- und Nachname", en: "First and last name" })} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <Field label={t({ de: "E-Mail", en: "E-mail" })} error={e("email")}>
            <input className={inputCls} type="email" inputMode="email" value={draft.email} onChange={(ev) => patch({ email: ev.target.value })} autoComplete="email" placeholder="name@mail.com" />
          </Field>
          <Field label={t({ de: "WhatsApp / Telefon", en: "WhatsApp / phone" })} error={e("phone")}>
            <input className={inputCls} type="tel" inputMode="tel" value={draft.phone} onChange={(ev) => patch({ phone: ev.target.value })} autoComplete="tel" placeholder="+49 170 1234567" />
          </Field>
        </div>
        {e("contact") ? (
          <p role="alert" className="-mt-2 text-xs font-semibold text-rose-300">
            {e("contact")}
          </p>
        ) : (
          <p className="-mt-2 text-xs text-slate-500">{t({ de: "* Name sowie E-Mail oder WhatsApp/Telefon erforderlich", en: "* Name plus e-mail or WhatsApp/phone required" })}</p>
        )}
        <Field label={t({ de: "Hotel (optional)", en: "Hotel (optional)" })} hint={t({ de: "Für die kostenlose Abholung", en: "For the free pick-up" })}>
          <input className={inputCls} value={draft.hotel} onChange={(ev) => patch({ hotel: ev.target.value })} placeholder={t({ de: "z. B. Centara Ao Nang", en: "e.g. Centara Ao Nang" })} />
        </Field>
        <Field label={t({ de: "Wünsche & Fragen", en: "Wishes & questions" })}>
          <textarea
            className={cn(inputCls, "min-h-28 resize-y py-3")}
            value={draft.wishes}
            onChange={(ev) => patch({ wishes: ev.target.value })}
            placeholder={t({ de: "Allergien, Lieblingsinsel, Überraschung …", en: "Allergies, favourite island, a surprise …" })}
          />
        </Field>
      </section>

      <section>
        <Receipt draft={draft} />
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
          <a
            href={valid ? waHref : undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!valid}
            onClick={(ev) => {
              if (!onSend("wa")) ev.preventDefault();
            }}
            className={cn(btn.whatsapp, "w-full", !valid && "opacity-60")}
          >
            <WhatsAppIcon className="size-5" />
            {t({ de: "Per WhatsApp senden", en: "Send via WhatsApp" })}
          </a>
          <a
            href={valid ? mailtoHref : undefined}
            aria-disabled={!valid}
            onClick={(ev) => {
              if (!onSend("mail")) ev.preventDefault();
            }}
            className={cn(btn.glass, "w-full", !valid && "opacity-60")}
          >
            <Mail className="size-5" />
            {t({ de: "Per E-Mail senden", en: "Send via e-mail" })}
          </a>
        </div>
        <p className="mt-2 text-center text-xs text-slate-500">
          {t({ de: "Unverbindliche Anfrage an", en: "Non-binding request to" })} {BRAND.email}
        </p>
      </section>
    </div>
  );
}

export function Receipt({ draft }: { draft: Draft }) {
  const { t, lang } = useTx();
  const tour = currentTour(draft);
  const price = priceBreakdown(draft);
  const dur = durationOf(draft.duration);
  const locale = htmlLang(lang);
  const slot = draft.slot ? slotInfo(draft.slot, draft) : null;
  const dateStr = draft.date
    ? new Intl.DateTimeFormat(locale, { weekday: "short", day: "numeric", month: "long", year: "numeric" }).format(new Date(`${draft.date}T12:00:00`))
    : null;

  const lines = (items: AddOn[], selected: string[]) =>
    items
      .filter((i) => selected.includes(i.id))
      .map((i) => (
        <li key={i.id} className="flex items-start justify-between gap-3 py-1.5 text-sm">
          <span className="min-w-0 text-slate-300">
            <span aria-hidden>{i.emoji} </span>
            {t(i.label)}
            {i.per !== "boat" ? (
              <span className="block text-xs text-slate-500">
                {i.per === "child" ? draft.kids : draft.guests} × {formatTHB(i.price)}
              </span>
            ) : null}
          </span>
          <span className="shrink-0 font-semibold tabular-nums text-white">{formatTHB(itemAmount(i, draft.guests, draft.kids))}</span>
        </li>
      ));

  const addons = [...lines(FOOD, draft.food), ...lines(DRINKS, draft.drinks), ...lines(BOOKING_EXTRAS, draft.extras)];

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-gradient-to-b from-white/[0.08] to-white/[0.02] p-5">
      <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-si-cyan/20 blur-3xl" />
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{t({ de: "Ihre Übersicht", en: "Your summary" })}</p>
      <div className="mt-3 flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-si-cyan/15 text-cyan-300">
          {tour?.kind === "fishing" ? <Fish className="size-5" /> : <Sailboat className="size-5" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold leading-snug text-white">{tour ? t(tour.title) : `${t({ de: "Eigene Tour", en: "Custom tour" })} · ${t(dur.label)}`}</p>
          <p className="mt-0.5 text-xs text-slate-400">
            {tour ? t(tour.duration) : `Ao Nang → ${routeNames(draft).join(" → ") || "…"} → Ao Nang`}
          </p>
        </div>
        <span className="shrink-0 font-semibold tabular-nums text-white">{formatTHB(price.base)}</span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-black/20 p-2.5">
          <dt className="text-[11px] text-slate-500">{t({ de: "Datum", en: "Date" })}</dt>
          <dd className="font-semibold text-white">{dateStr ?? "—"}</dd>
        </div>
        <div className="rounded-xl bg-black/20 p-2.5">
          <dt className="text-[11px] text-slate-500">{t({ de: "Abfahrt", en: "Departure" })}</dt>
          <dd className="font-semibold text-white">{slot ? `${slot.time} · ${t(slot.label)}` : "—"}</dd>
        </div>
        <div className="col-span-2 rounded-xl bg-black/20 p-2.5">
          <dt className="text-[11px] text-slate-500">{t({ de: "Gäste", en: "Guests" })}</dt>
          <dd className="font-semibold text-white">
            {draft.guests}
            {draft.kids ? ` · ${t({ de: "davon Kinder", en: "of which children" })}: ${draft.kids}` : ""}
          </dd>
        </div>
      </dl>
      {addons.length ? <ul className="mt-3 divide-y divide-white/5 border-t border-dashed border-white/15 pt-2">{addons}</ul> : null}
      <div className="mt-3 flex items-end justify-between gap-3 border-t border-dashed border-white/15 pt-4">
        <span className="text-sm font-semibold text-slate-300">{t({ de: "Gesamt", en: "Total" })}</span>
        <AnimatedPrice value={price.total} className="si-text-gradient text-3xl font-extrabold sm:text-4xl" />
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
        {t({ de: "Richtpreis · 30 % Anzahlung nach Bestätigung · kostenlose Umbuchung bei Schlechtwetter", en: "Estimate · 30% deposit after confirmation · free rebooking in bad weather" })}
      </p>
    </div>
  );
}
