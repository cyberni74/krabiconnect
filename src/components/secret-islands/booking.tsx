import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock, Gift, Send, Ship, UserRound, Users, UtensilsCrossed, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { toISODate } from "./booking-data";
import {
  STEP_LABELS,
  buildMessage,
  currentTour,
  durationOf,
  firstBlocked,
  htmlLang,
  initialDraft,
  mailHref,
  priceBreakdown,
  routeNames,
  slotInfo,
  stepBlocker,
  type Draft,
} from "./booking-model";
import { ContactStep, DateStep, ExtrasStep, GuestsStep, TourStep } from "./booking-steps";
import { AnimatedPrice } from "./booking-ui";
import { QuickAddChips, QuickAddPanel } from "./booking-quick";
import { btn } from "./fx";
import { SmartImage, WhatsAppIcon, useLockBody } from "./ui";
import { useSI, useTx, waLink } from "./store";

const STEP_ICONS = [Ship, CalendarDays, UtensilsCrossed, Gift, UserRound];
const EASE = [0.22, 1, 0.36, 1] as const;

type Session = {
  key: string;
  draft: Draft;
  step: number;
  sent: boolean;
  showErrors: boolean;
};

function newSession(tourId: string | null, custom: boolean): Session {
  const draft = initialDraft(tourId, custom);
  return { key: `${tourId}|${custom}`, draft, step: draft.tourId ? 1 : 0, sent: false, showErrors: false };
}

export function BookingModal() {
  const booking = useSI((s) => s.booking);
  const closeBooking = useSI((s) => s.closeBooking);
  const [wasOpen, setWasOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  // Re-initialise on open when the entry point changed or the last request was sent.
  if (booking.open !== wasOpen) {
    setWasOpen(booking.open);
    if (booking.open) {
      const key = `${booking.tourId}|${booking.custom}`;
      if (!session || session.sent || session.key !== key) setSession(newSession(booking.tourId, booking.custom));
    }
  }

  useLockBody(booking.open);

  useEffect(() => {
    if (!booking.open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeBooking();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [booking.open, closeBooking]);

  return (
    <AnimatePresence>
      {booking.open && session ? (
        <Wizard key="wizard" session={session} setSession={setSession} onClose={closeBooking} />
      ) : null}
    </AnimatePresence>
  );
}

function Wizard({
  session,
  setSession,
  onClose,
}: {
  session: Session;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
  onClose: () => void;
}) {
  const { t, tOp, lang } = useTx();
  const reduce = useReducedMotion();
  const [todayISO] = useState(() => toISODate(new Date()));
  const [dir, setDir] = useState(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const { draft, step, sent, showErrors } = session;

  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const patch = useCallback(
    (p: Partial<Draft> | ((d: Draft) => Partial<Draft>)) =>
      setSession((s) => (s ? { ...s, draft: { ...s.draft, ...(typeof p === "function" ? p(s.draft) : p) } } : s)),
    [setSession],
  );

  const price = priceBreakdown(draft);
  const blocker = stepBlocker(draft, step, todayISO);
  const reachable = firstBlocked(draft, todayISO);
  const message = useMemo(() => buildMessage(draft, lang, tOp), [draft, lang, tOp]);
  const waHref = waLink(message);
  const mailtoHref = mailHref(draft, lang, tOp);

  const goTo = (i: number) => {
    if (i === step || i < 0 || i > 4) return;
    if (i > step && i > reachable) return;
    setDir(i > step ? 1 : -1);
    setSession((s) => (s ? { ...s, step: i } : s));
    scrollRef.current?.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  };

  const markErrors = () => setSession((s) => (s ? { ...s, showErrors: true } : s));

  const onSend = (_via: "wa" | "mail") => {
    if (stepBlocker(draft, 4, todayISO) || reachable < 4) {
      markErrors();
      return false;
    }
    setSession((s) => (s ? { ...s, sent: true } : s));
    return true;
  };

  const next = () => {
    if (step < 4) {
      if (!blocker) goTo(step + 1);
      return;
    }
    if (onSend("wa")) window.open(waHref, "_blank", "noopener,noreferrer");
  };

  const stepProps = { draft, patch, todayISO };
  const nextLabel = step === 4 ? t({ de: "Per WhatsApp senden", en: "Send via WhatsApp" }) : t({ de: "Weiter", en: "Next" });
  const nextDisabled = step < 4 && !!blocker;

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-stretch justify-center sm:items-center sm:p-4 lg:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      lang={htmlLang(lang)}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={t({ de: "Buchung schließen", en: "Close booking" })}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#02060f]/75 backdrop-blur-md"
      />
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={t({ de: "Tour buchen", en: "Book a tour" })}
        tabIndex={-1}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, y: 30, scale: 0.98 }}
        transition={{ duration: 0.45, ease: EASE }}
        className="si-glass-strong relative flex h-[100dvh] w-full flex-col overflow-hidden text-white outline-none sm:h-[min(880px,94dvh)] sm:max-w-[1100px] sm:rounded-[2rem]"
      >
        <div aria-hidden className="pointer-events-none absolute -left-32 -top-32 size-80 rounded-full bg-si-cyan/20 blur-[100px]" />
        <div aria-hidden className="pointer-events-none absolute -bottom-40 right-0 size-80 rounded-full bg-si-gold/10 blur-[110px]" />

        {/* Header */}
        <header className="relative z-10 shrink-0 border-b border-white/10 px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                {sent
                  ? t({ de: "Fertig", en: "Done" })
                  : `${step + 1} / 5`}
              </p>
              <h2 className="truncate text-xl font-extrabold sm:text-2xl">
                {sent ? t({ de: "Anfrage vorbereitet", en: "Request prepared" }) : t(STEP_LABELS[step])}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={t({ de: "Buchung schließen", en: "Close booking" })}
              className="si-glass grid size-11 shrink-0 place-items-center rounded-full text-white transition hover:rotate-90 hover:bg-white/15"
            >
              <X className="size-5" />
            </button>
          </div>
          {!sent ? <Progress step={step} reachable={reachable} onJump={goTo} /> : null}
        </header>

        {/* Body */}
        <div className="relative z-10 flex min-h-0 flex-1">
          <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 lg:py-6">
            {sent ? (
              <Success onClose={onClose} waHref={waHref} mailtoHref={mailtoHref} />
            ) : (
              <AnimatePresence mode="wait" custom={dir} initial={false}>
                <motion.div
                  key={step}
                  custom={dir}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -40 }}
                  transition={{ duration: 0.3, ease: EASE }}
                >
                  {step === 0 ? <TourStep {...stepProps} /> : null}
                  {step === 1 ? <DateStep {...stepProps} /> : null}
                  {step === 2 ? <GuestsStep {...stepProps} /> : null}
                  {step === 3 ? <ExtrasStep {...stepProps} /> : null}
                  {step === 4 ? (
                    <ContactStep {...stepProps} showErrors={showErrors} onSend={onSend} waHref={waHref} mailtoHref={mailtoHref} />
                  ) : null}
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {!sent ? (
            <aside className="hidden w-[330px] shrink-0 flex-col border-l border-white/10 bg-black/15 lg:flex">
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-amber-300">{t({ de: "Mit 1 Klick dazu", en: "Add with 1 click" })}</p>
                <QuickAddPanel draft={draft} patch={patch} className="mb-5" />
                <SummaryPanel draft={draft} />
              </div>
              <div className="border-t border-white/10 p-5">
                <div className="flex items-end justify-between">
                  <span className="text-sm text-slate-400">{t({ de: "Richtpreis", en: "Estimate" })}</span>
                  <AnimatedPrice value={price.total} className="si-text-gradient text-3xl font-extrabold" />
                </div>
                <div className="mt-4 flex gap-2">
                  {step > 0 ? (
                    <button type="button" onClick={() => goTo(step - 1)} className={cn(btn.glass, "px-4")} aria-label={t({ de: "Zurück", en: "Back" })}>
                      <ArrowLeft className="size-5" />
                    </button>
                  ) : null}
                  <NextButton label={nextLabel} disabled={nextDisabled} onClick={next} last={step === 4} className="flex-1" />
                </div>
                <BlockerNote blocker={blocker && (step < 4 || showErrors) ? t(blocker) : null} />
              </div>
            </aside>
          ) : null}
        </div>

        {/* Mobile / tablet bottom bar */}
        {!sent ? (
          <div className="relative z-10 shrink-0 border-t border-white/10 bg-si-navy/80 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
            <QuickAddChips draft={draft} patch={patch} />
            <BlockerNote blocker={blocker && (step < 4 || showErrors) ? t(blocker) : null} compact />
            <div className="flex items-center gap-2">
              {step > 0 ? (
                <button type="button" onClick={() => goTo(step - 1)} className="si-glass grid size-12 shrink-0 place-items-center rounded-2xl" aria-label={t({ de: "Zurück", en: "Back" })}>
                  <ArrowLeft className="size-5" />
                </button>
              ) : null}
              <div className="min-w-0 flex-1 leading-tight">
                <span className="block text-[11px] text-slate-400">{t({ de: "Richtpreis", en: "Estimate" })}</span>
                <AnimatedPrice value={price.total} className="si-text-gradient text-xl font-extrabold" />
              </div>
              <NextButton label={nextLabel} disabled={nextDisabled} onClick={next} last={step === 4} />
            </div>
          </div>
        ) : null}
      </motion.div>
    </motion.div>
  );
}

function NextButton({
  label,
  disabled,
  onClick,
  last,
  className,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
  last: boolean;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={cn(last ? btn.whatsapp : btn.primary, "shrink-0 px-5 disabled:cursor-not-allowed disabled:opacity-40", className)}
    >
      {last ? <WhatsAppIcon className="size-5" /> : null}
      <span className="whitespace-nowrap">{label}</span>
      {!last ? <ArrowRight className="size-5" /> : null}
    </motion.button>
  );
}

function BlockerNote({ blocker, compact }: { blocker: string | null; compact?: boolean }) {
  return (
    <AnimatePresence initial={false}>
      {blocker ? (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className={cn("overflow-hidden text-xs font-semibold text-amber-300", compact ? "pb-2" : "pt-2 text-center")}
          role="status"
        >
          {blocker}
        </motion.p>
      ) : null}
    </AnimatePresence>
  );
}

function Progress({ step, reachable, onJump }: { step: number; reachable: number; onJump: (i: number) => void }) {
  const { t } = useTx();
  return (
    <nav aria-label={t({ de: "Buchungsschritte", en: "Booking steps" })} className="mt-3">
      <ol className="relative flex items-center justify-between gap-1">
        <div aria-hidden className="absolute inset-x-5 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-white/10" />
        <motion.div
          aria-hidden
          className="absolute left-5 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-gradient-to-r from-si-cyan to-si-gold"
          initial={false}
          animate={{ width: `calc((100% - 2.5rem) * ${step / 4})` }}
          transition={{ duration: 0.5, ease: EASE }}
        />
        {STEP_LABELS.map((label, i) => {
          const Icon = STEP_ICONS[i];
          const done = i < step;
          const active = i === step;
          const can = i <= Math.max(step, reachable);
          return (
            <li key={i} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={() => onJump(i)}
                disabled={!can || active}
                aria-current={active ? "step" : undefined}
                aria-label={`${i + 1}. ${t(label)}`}
                className={cn(
                  "group flex items-center gap-2 rounded-full p-1 transition",
                  active && "bg-si-navy pr-3 shadow-[0_0_0_1px_rgb(6_182_212/0.5)]",
                  !active && "bg-si-navy",
                  can && !active ? "cursor-pointer" : "",
                )}
              >
                <span
                  className={cn(
                    "relative grid size-9 place-items-center rounded-full border text-sm font-bold transition",
                    active
                      ? "border-transparent bg-gradient-to-br from-si-cyan to-cyan-300 text-si-navy"
                      : done
                        ? "border-si-cyan/60 bg-si-cyan/20 text-cyan-200 group-hover:bg-si-cyan/35"
                        : can
                          ? "border-white/25 bg-white/5 text-slate-300 group-hover:border-white/50"
                          : "border-white/10 bg-white/[0.03] text-slate-600",
                  )}
                >
                  {active ? (
                    <motion.span layoutId="si-step-glow" className="absolute inset-0 rounded-full shadow-[0_0_24px_rgb(6_182_212/0.8)]" />
                  ) : null}
                  {done ? <Check className="size-4" strokeWidth={3} /> : <Icon className="size-4" />}
                </span>
                {active ? (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    className="hidden overflow-hidden whitespace-nowrap text-sm font-bold text-white sm:block"
                  >
                    {t(label)}
                  </motion.span>
                ) : null}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function SummaryPanel({ draft }: { draft: Draft }) {
  const { t, lang } = useTx();
  const tour = currentTour(draft);
  const price = priceBreakdown(draft);
  const dur = durationOf(draft.duration);
  const route = routeNames(draft);
  const slot = draft.slot ? slotInfo(draft.slot) : null;
  const dateStr = draft.date
    ? new Intl.DateTimeFormat(htmlLang(lang), { weekday: "short", day: "numeric", month: "short" }).format(new Date(`${draft.date}T12:00:00`))
    : null;

  const rows: { label: string; value: number }[] = [
    { label: t({ de: "Boot & Crew", en: "Boat & crew" }), value: price.base },
    { label: t({ de: "Verpflegung", en: "Food" }), value: price.food },
    { label: t({ de: "Getränke", en: "Drinks" }), value: price.drinks },
    { label: t({ de: "Extras", en: "Extras" }), value: price.extras },
  ];

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">{t({ de: "Live-Preis", en: "Live price" })}</p>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tour?.id ?? `custom-${draft.mode}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mt-3 overflow-hidden rounded-2xl border border-white/10"
        >
          <div className="relative h-28">
            <SmartImage src={tour?.image ?? "https://images.unsplash.com/photo-1537956965359-7573183d1f57?auto=format&fit=crop&w=800&q=70"} alt="" className="absolute inset-0 size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-si-navy to-transparent" />
            <p className="absolute inset-x-3 bottom-2 line-clamp-2 font-bold leading-snug text-white">
              {tour ? t(tour.title) : draft.mode === "custom" ? `${t({ de: "Eigene Tour", en: "Custom tour" })} · ${t(dur.label)}` : t({ de: "Noch keine Tour gewählt", en: "No tour chosen yet" })}
            </p>
          </div>
          {draft.mode === "custom" && !tour ? (
            <p className="bg-black/20 px-3 py-2 text-xs text-slate-300">
              Ao Nang → {route.length ? route.join(" → ") : "…"} → Ao Nang
            </p>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <ul className="mt-4 space-y-2 text-sm">
        <Info icon={CalendarDays} text={dateStr ?? t({ de: "Datum offen", en: "Date open" })} muted={!dateStr} />
        <Info icon={Clock} text={slot ? `${slot.time} · ${t(slot.label)}` : t({ de: "Uhrzeit offen", en: "Time open" })} muted={!slot} />
        <Info
          icon={Users}
          text={`${draft.guests} ${t({ de: "Gäste", en: "guests" })}${draft.kids ? ` · ${draft.kids} ${t({ de: "Kinder", en: "children" })}` : ""}`}
        />
      </ul>

      <ul className="mt-4 space-y-1.5 border-t border-dashed border-white/15 pt-4 text-sm">
        {rows.map((r) => (
          <li key={r.label} className={cn("flex justify-between gap-3 transition", r.value ? "text-slate-200" : "text-slate-600")}>
            <span>{r.label}</span>
            <AnimatedPrice value={r.value} className="font-semibold" />
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[11px] leading-relaxed text-slate-500">
        {t({ de: "Preis pro Boot für bis zu 5 Gäste. Wasser, Softdrinks & Obst inklusive.", en: "Price per boat for up to 5 guests. Water, soft drinks & fruit included." })}
      </p>
    </div>
  );
}

function Info({ icon: Icon, text, muted }: { icon: typeof Clock; text: string; muted?: boolean }) {
  return (
    <li className={cn("flex items-center gap-2.5", muted ? "text-slate-500" : "text-white")}>
      <span className="grid size-8 place-items-center rounded-lg bg-white/5">
        <Icon className="size-4" />
      </span>
      {text}
    </li>
  );
}

function Success({ onClose, waHref, mailtoHref }: { onClose: () => void; waHref: string; mailtoHref: string }) {
  const { t } = useTx();
  return (
    <div className="grid min-h-full place-items-center py-6 text-center">
      <div className="max-w-md">
        <div className="relative mx-auto grid size-28 place-items-center">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="absolute inset-0 rounded-full border border-si-cyan/50"
              initial={{ scale: 0.6, opacity: 0.8 }}
              animate={{ scale: 1.9, opacity: 0 }}
              transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
            />
          ))}
          <motion.span
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
            className="grid size-24 place-items-center rounded-full bg-gradient-to-br from-si-cyan to-cyan-300 text-si-navy shadow-[0_0_60px_rgb(6_182_212/0.7)]"
          >
            <svg viewBox="0 0 24 24" className="size-12" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.35, duration: 0.5 }} />
            </svg>
          </motion.span>
        </div>
        <motion.h3
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="si-text-gradient mt-8 text-3xl font-extrabold sm:text-4xl"
        >
          {t({ de: "Anfrage vorbereitet", en: "Request prepared" })}
        </motion.h3>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }} className="mt-3 text-slate-300">
          {t({ de: "Bitte senden Sie die Nachricht in WhatsApp bzw. Ihrem Mailprogramm ab – wir antworten meist innerhalb von 30 Minuten.", en: "Please send the message in WhatsApp or your mail app – we usually reply within 30 minutes." })}
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-8 grid gap-2.5">
          <button type="button" onClick={onClose} className={cn(btn.primary, "w-full")}>
            <Check className="size-5" />
            {t({ de: "Fertig", en: "Done" })}
          </button>
          <div className="grid grid-cols-2 gap-2.5">
            <a href={waHref} target="_blank" rel="noopener noreferrer" className={cn(btn.glass, "px-3 text-sm")}>
              <WhatsAppIcon className="size-4 text-si-wa" />
              {t({ de: "WhatsApp erneut öffnen", en: "Reopen WhatsApp" })}
            </a>
            <a href={mailtoHref} className={cn(btn.glass, "px-3 text-sm")}>
              <Send className="size-4" />
              {t({ de: "E-Mail erneut öffnen", en: "Reopen e-mail" })}
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
