import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Check, ChevronLeft, ChevronRight, Clock, MapPin, Sparkles, Sun, Users, X } from "lucide-react";
import { useCallback, useEffect, useState, type UIEvent } from "react";
import { cn } from "@/lib/utils";
import { ARTICLES, SLOTS, TOURS, UI, type Article, type Tour } from "./content";
import { btn } from "./fx";
import { formatTHB, useSI, useTx } from "./store";
import { Sheet, SmartImage, useLockBody } from "./ui";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ───────────────────────── Tour details ───────────────────────── */

export function TourModal() {
  const { t } = useTx();
  const tourId = useSI((s) => s.tourId);
  const close = useSI((s) => s.closeTour);
  const tour = TOURS.find((x) => x.id === tourId);

  return (
    <Sheet open={!!tour} onClose={close} label={tour ? t(tour.title) : ""} closeLabel={t(UI.close)} className="sm:max-w-2xl">
      {tour ? <TourDetails tour={tour} /> : null}
    </Sheet>
  );
}

function TourDetails({ tour }: { tour: Tour }) {
  const { t } = useTx();
  const openBooking = useSI((s) => s.openBooking);
  const slots = SLOTS.filter((s) => tour.slots.includes(s.id));
  const fishing = tour.kind === "fishing";

  return (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        <div className="relative aspect-[16/11] shrink-0 overflow-hidden sm:aspect-[16/9]">
          <motion.div
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.2, ease: EASE }}
            className="absolute inset-0"
          >
            <SmartImage src={tour.image} alt={t(tour.title)} eager className="size-full object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f3a] via-[#0d1f3a]/40 to-transparent" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
            className="absolute bottom-4 left-5 right-5"
          >
            <div className="mb-2 flex flex-wrap gap-2">
              {tour.badge ? (
                <span className="rounded-full bg-si-gold px-2.5 py-1 text-xs font-extrabold text-si-navy">{t(tour.badge)}</span>
              ) : null}
              <span className="si-glass rounded-full px-2.5 py-1 text-xs font-bold text-white">
                {fishing ? `🎣 ${t({ de: "Angeltour", en: "Fishing trip" })}` : `🏝️ ${t({ de: "Inseltour", en: "Island tour" })}`}
              </span>
            </div>
            <h3 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">{t(tour.title)}</h3>
          </motion.div>
        </div>

        <div className="space-y-7 p-5 sm:p-7">
          <div className="flex flex-wrap gap-2 text-sm font-semibold">
            <span className="si-glass flex items-center gap-1.5 rounded-xl px-3 py-2 text-slate-200">
              <Clock className="size-4 text-cyan-300" /> {t(tour.duration)}
            </span>
            <span className="si-glass flex items-center gap-1.5 rounded-xl px-3 py-2 text-slate-200">
              {t(UI.from)} <b className="text-white">{formatTHB(tour.price)}</b> {t(UI.perBoat)}
            </span>
            <span className="si-glass flex items-center gap-1.5 rounded-xl px-3 py-2 text-slate-200">
              <Users className="size-4 text-cyan-300" /> {t({ de: "bis 5 Gäste", en: "up to 5 guests" })}
            </span>
          </div>

          <p className="text-[15px] leading-relaxed text-slate-300">{t(tour.description)}</p>

          <div>
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200">{t(UI.stops)}</p>
            <ol className="relative space-y-4 pl-8">
              <motion.span
                aria-hidden
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.3 + tour.stops.length * 0.12, delay: 0.2, ease: EASE }}
                className="absolute bottom-2 left-[9px] top-2 w-0.5 origin-top rounded-full bg-gradient-to-b from-si-cyan via-cyan-300/60 to-si-gold"
              />
              {tour.stops.map((s, i) => (
                <motion.li
                  key={s}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.25 + i * 0.12, ease: EASE }}
                  className="relative flex items-center gap-2 font-bold text-white"
                >
                  <span
                    className={cn(
                      "absolute -left-8 top-1/2 grid size-5 -translate-y-1/2 place-items-center rounded-full ring-4 ring-[#10223f]",
                      i === tour.stops.length - 1 ? "bg-si-gold" : "bg-si-cyan",
                    )}
                  >
                    <span className="size-1.5 rounded-full bg-si-navy" />
                  </span>
                  <MapPin className="size-4 shrink-0 text-cyan-300" />
                  {s}
                </motion.li>
              ))}
            </ol>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200">{t(UI.included)}</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {tour.includes.map((inc, i) => (
                <motion.li
                  key={inc.de}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, delay: 0.3 + i * 0.05 }}
                  className="si-glass flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-200"
                >
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-si-cyan/20 text-cyan-300">
                    <Check className="size-3.5" strokeWidth={3} />
                  </span>
                  {t(inc)}
                </motion.li>
              ))}
            </ul>
          </div>

          {slots.length ? (
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200">
                {t({ de: "Abfahrtszeiten", en: "Departure times" })}
              </p>
              <div className="flex flex-wrap gap-2">
                {slots.map((s) => (
                  <span key={s.id} className="si-glass flex items-center gap-2 rounded-xl px-3 py-2 text-sm">
                    {s.id === "sunset" ? <Sun className="size-4 text-si-gold" /> : <Clock className="size-4 text-cyan-300" />}
                    <b className="tabular-nums text-white">{s.time}</b>
                    <span className="text-slate-400">{t(s.label)}</span>
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div
        className="flex shrink-0 items-center gap-4 border-t border-white/10 bg-si-navy/60 px-5 pt-4 backdrop-blur-xl"
        style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
      >
        <div className="min-w-0">
          <p className="text-xs text-slate-400">
            {t(UI.from)} · {t(UI.perBoat)}
          </p>
          <p className="text-xl font-black text-white">{formatTHB(tour.price)}</p>
        </div>
        <button type="button" onClick={() => openBooking({ tourId: tour.id })} className={cn(btn.primary, "h-14 flex-1")}>
          {t({ de: "Jetzt buchen", en: "Book now" })} <ArrowRight className="size-5" />
        </button>
      </div>
    </>
  );
}

/* ───────────────────────── Article reader ───────────────────────── */

export function ArticleModal() {
  const { t } = useTx();
  const id = useSI((s) => s.articleId);
  const close = useSI((s) => s.closeArticle);
  const article = ARTICLES.find((a) => a.id === id);

  return (
    <Sheet open={!!article} onClose={close} label={article ? t(article.title) : ""} closeLabel={t(UI.close)} className="sm:max-w-2xl">
      {article ? <ArticleReader article={article} /> : null}
    </Sheet>
  );
}

function ArticleReader({ article }: { article: Article }) {
  const { t, tl } = useTx();
  const openBooking = useSI((s) => s.openBooking);
  const progress = useMotionValue(0);
  const scaleX = useSpring(progress, { stiffness: 160, damping: 30, mass: 0.3 });

  const onScroll = (e: UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const max = el.scrollHeight - el.clientHeight;
    progress.set(max > 0 ? el.scrollTop / max : 0);
  };

  return (
    <>
      <motion.div
        aria-hidden
        style={{ scaleX }}
        className="absolute inset-x-0 top-0 z-20 h-1 origin-left bg-gradient-to-r from-si-cyan via-cyan-200 to-si-gold"
      />
      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain" onScroll={onScroll}>
        <div className="relative aspect-[16/9] overflow-hidden">
          <motion.div initial={{ scale: 1.12 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease: EASE }} className="absolute inset-0">
            <SmartImage src={article.image} alt="" eager className="size-full object-cover" />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1f3a] via-[#0d1f3a]/30 to-transparent" />
        </div>
        <article className="relative -mt-12 px-5 sm:px-10" style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom))" }}>
          <p className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300">
            <span className="rounded-full bg-si-cyan/20 px-2.5 py-1 font-bold text-cyan-200 ring-1 ring-si-cyan/40 backdrop-blur">
              {t(article.category)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" /> {article.minutes} {t(UI.minRead)}
            </span>
          </p>
          <h3 className="text-[1.7rem] font-extrabold leading-tight tracking-tight text-white sm:text-4xl">{t(article.title)}</h3>
          <p className="mt-4 border-l-2 border-si-cyan pl-4 text-lg font-medium leading-relaxed text-cyan-50/90">{t(article.excerpt)}</p>
          <div className="mt-7 space-y-5 text-[16.5px] leading-[1.8] text-slate-200">
            {tl(article.body).map((p, i) => (
              <p
                key={p.slice(0, 24)}
                className={cn(i === 0 && "first-letter:float-left first-letter:mr-2 first-letter:text-5xl first-letter:font-black first-letter:leading-[0.9] first-letter:text-cyan-300")}
              >
                {p}
              </p>
            ))}
          </div>

          <div className="si-glow-border mt-10 rounded-3xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-si-cyan/15 via-white/5 to-si-gold/10 p-6">
              <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-si-cyan/30 blur-3xl" />
              <p className="relative flex items-center gap-2 text-lg font-extrabold text-white">
                <Sparkles className="size-5 text-si-gold" /> {t({ de: "Lust auf genau diesen Tag?", en: "Fancy exactly this day?" })}
              </p>
              <p className="relative mt-1.5 text-sm leading-relaxed text-slate-300">
                {t({
                  de: "Wir planen Ihre private Tour nach diesem Guide – inkl. Gezeiten & Timing.",
                  en: "We'll plan your private tour based on this guide – tides & timing included.",
                })}
              </p>
              <button
                type="button"
                onClick={() => openBooking({ tourId: article.tourId })}
                className={cn(btn.primary, "relative mt-5 min-h-14 w-full py-3 text-center leading-snug")}
              >
                {t(UI.articleCta)} <ArrowRight className="size-5 shrink-0" />
              </button>
            </div>
          </div>
        </article>
      </div>
    </>
  );
}

/* ───────────────────────── Lightbox ───────────────────────── */

export function Lightbox() {
  const lb = useSI((s) => s.lightbox);
  const close = useSI((s) => s.closeLightbox);
  const setIndex = useSI((s) => s.setLightboxIndex);
  const { t } = useTx();
  const [dir, setDir] = useState(0);
  useLockBody(!!lb);

  const go = useCallback(
    (d: number) => {
      if (!lb) return;
      setDir(d);
      setIndex((lb.index + d + lb.items.length) % lb.items.length);
    },
    [lb, setIndex],
  );

  useEffect(() => {
    if (!lb) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lb, close, go]);

  const item = lb?.items[lb.index];
  const ctrl = "si-glass grid size-12 shrink-0 place-items-center rounded-full text-white transition hover:bg-white/20 active:scale-95";

  return (
    <AnimatePresence>
      {lb && item ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          className="fixed inset-0 z-[80] flex flex-col bg-[#030a16]/95 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 size-[60vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-si-cyan/15 blur-[100px]" />
          <div className="relative flex items-center justify-between gap-3 p-3" style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}>
            <p className="si-glass flex min-w-0 items-center gap-2 rounded-full py-2 pl-4 pr-3 text-sm font-semibold text-white">
              <span className="min-w-0 leading-snug [overflow-wrap:anywhere]">{item.title}</span>
              <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-xs tabular-nums text-cyan-200">
                {lb.index + 1}/{lb.items.length}
              </span>
            </p>
            <button type="button" onClick={close} aria-label={t(UI.close)} className={ctrl}>
              <X className="size-6" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2">
            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <motion.div
                key={lb.index}
                custom={dir}
                initial={{ opacity: 0, x: dir * 80, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: dir * -80, scale: 0.96 }}
                transition={{ duration: 0.3, ease: EASE }}
                drag={lb.items.length > 1 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.6}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -60) go(1);
                  else if (info.offset.x > 60) go(-1);
                }}
                className="flex size-full items-center justify-center"
              >
                {item.video ? (
                  <LightboxVideo src={item.video} poster={item.src} />
                ) : (
                  <SmartImage
                    src={item.src.replace(/w=\d+/, "w=2000")}
                    alt={item.title}
                    eager
                    className="max-h-full max-w-full rounded-2xl object-contain shadow-2xl shadow-black/60 [&.si-fallback]:aspect-[4/3] [&.si-fallback]:w-full [&.si-fallback]:max-w-3xl"
                  />
                )}
              </motion.div>
            </AnimatePresence>
            {lb.items.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={t({ de: "Vorheriges", en: "Previous" })}
                  className={cn(ctrl, "absolute left-3 top-1/2 hidden -translate-y-1/2 sm:grid")}
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={t({ de: "Nächstes", en: "Next" })}
                  className={cn(ctrl, "absolute right-3 top-1/2 hidden -translate-y-1/2 sm:grid")}
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            ) : null}
          </div>
          {lb.items.length > 1 ? (
            <div className="relative flex justify-center p-3" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
              <div className="si-glass hide-scroll flex max-w-full gap-2 overflow-x-auto rounded-2xl p-2">
                {lb.items.map((it, i) => (
                  <button
                    key={`${it.src}-${i}`}
                    type="button"
                    onClick={() => {
                      setDir(i > lb.index ? 1 : -1);
                      setIndex(i);
                    }}
                    aria-label={it.title}
                    aria-current={i === lb.index || undefined}
                    className={cn(
                      "relative size-14 shrink-0 overflow-hidden rounded-xl ring-2 transition",
                      i === lb.index ? "scale-105 ring-si-cyan shadow-[0_0_20px_-2px_rgb(6_182_212/0.8)]" : "opacity-50 ring-transparent hover:opacity-90",
                    )}
                  >
                    <SmartImage src={it.src.replace(/w=\d+/, "w=200")} alt="" className="size-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function LightboxVideo({ src, poster }: { src: string; poster: string }) {
  const { t } = useTx();
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="relative flex max-h-full w-full max-w-3xl items-center justify-center">
        <SmartImage src={poster} alt="" className="aspect-video max-h-[75vh] w-full rounded-2xl object-contain" />
        <span className="si-glass absolute bottom-3 rounded-full px-3 py-1 text-xs text-white">
          {t({ de: "Video-Vorschau", en: "Video preview" })}
        </span>
      </div>
    );
  }
  return (
    <video
      key={src}
      src={src}
      poster={poster}
      controls
      autoPlay
      playsInline
      muted
      loop
      onError={() => setFailed(true)}
      className="max-h-full max-w-full rounded-2xl shadow-2xl shadow-black/60"
    />
  );
}
