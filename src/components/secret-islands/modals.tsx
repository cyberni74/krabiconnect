import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Clock, Mail, MapPin, Minus, Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ARTICLES, TOURS, UI } from "./content";
import { formatTHB, useSI, useTx, waLink } from "./store";
import { Sheet, SmartImage, WhatsAppIcon, useLockBody } from "./ui";

export function TourModal() {
  const { t } = useTx();
  const tourId = useSI((s) => s.tourId);
  const close = useSI((s) => s.closeTour);
  const openInquiry = useSI((s) => s.openInquiry);
  const tour = TOURS.find((x) => x.id === tourId);

  return (
    <Sheet open={!!tour} onClose={close} label={tour ? t(tour.title) : ""} closeLabel={t(UI.close)}>
      {tour ? (
        <>
          <div className="overflow-y-auto">
            <div className="relative aspect-[16/10] shrink-0">
              <SmartImage src={tour.image} alt={t(tour.title)} className="absolute inset-0 size-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-si-navy via-si-navy/20 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 text-white">
                {tour.badge ? (
                  <span className="mb-2 inline-block rounded-full bg-si-gold px-2.5 py-0.5 text-xs font-bold text-si-navy">
                    {t(tour.badge)}
                  </span>
                ) : null}
                <h3 className="text-2xl font-extrabold leading-tight">{t(tour.title)}</h3>
              </div>
            </div>
            <div className="space-y-6 p-5">
              <div className="flex flex-wrap gap-3 text-sm font-semibold text-si-slate">
                <span className="flex items-center gap-1.5 rounded-xl bg-si-white px-3 py-2">
                  <Clock className="size-4 text-si-cyan-dark" /> {t(tour.duration)}
                </span>
                <span className="flex items-center gap-1.5 rounded-xl bg-si-white px-3 py-2">
                  {t(UI.from)} <b className="text-si-navy">{formatTHB(tour.price)}</b> {t(UI.perBoat)}
                </span>
              </div>
              <p className="leading-relaxed text-si-slate">{t(tour.description)}</p>
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">{t(UI.stops)}</p>
                <ol className="relative space-y-3 border-l-2 border-dashed border-si-cyan/40 pl-5">
                  {tour.stops.map((s) => (
                    <li key={s} className="relative font-bold text-si-navy">
                      <span className="absolute -left-[27px] top-0.5 grid size-4 place-items-center rounded-full bg-si-cyan ring-4 ring-white" />
                      <MapPin className="mr-1 inline size-4 text-si-cyan-dark" />
                      {s}
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">{t(UI.included)}</p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {tour.includes.map((inc) => (
                    <li key={inc.de} className="flex items-center gap-2 text-sm text-si-slate">
                      <Check className="size-4 shrink-0 text-si-cyan-dark" strokeWidth={3} /> {t(inc)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-100 p-4" style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
            <button
              type="button"
              onClick={() => openInquiry(tour.id)}
              className="h-14 w-full rounded-2xl bg-si-cyan font-bold text-si-navy shadow-lg shadow-si-cyan/25 active:scale-[0.98]"
            >
              {t(UI.ctaInquire)}
            </button>
          </div>
        </>
      ) : null}
    </Sheet>
  );
}

export function ArticleModal() {
  const { t, tl } = useTx();
  const id = useSI((s) => s.articleId);
  const close = useSI((s) => s.closeArticle);
  const openInquiry = useSI((s) => s.openInquiry);
  const article = ARTICLES.find((a) => a.id === id);

  return (
    <Sheet open={!!article} onClose={close} label={article ? t(article.title) : ""} closeLabel={t(UI.close)} className="sm:max-w-2xl">
      {article ? (
        <div className="overflow-y-auto">
          <div className="relative aspect-[16/9]">
            <SmartImage src={article.image} alt="" className="absolute inset-0 size-full object-cover" />
          </div>
          <article className="p-5 sm:p-8" style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>
            <p className="mb-2 flex items-center gap-2 text-xs font-bold text-si-cyan-dark">
              {t(article.category)} <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1 text-slate-500">
                <Clock className="size-3" /> {article.minutes} {t(UI.minRead)}
              </span>
            </p>
            <h3 className="text-2xl font-extrabold leading-tight text-si-navy sm:text-3xl">{t(article.title)}</h3>
            <p className="mt-3 text-lg font-medium leading-relaxed text-si-slate">{t(article.excerpt)}</p>
            <div className="mt-6 space-y-4 text-[16px] leading-relaxed text-si-slate">
              {tl(article.body).map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <div className="mt-8 rounded-3xl bg-si-navy p-5 text-white">
              <p className="font-bold">{t({ de: "Lust auf genau diesen Tag?", en: "Fancy exactly this day?" })}</p>
              <p className="mt-1 text-sm text-slate-300">
                {t({
                  de: "Wir planen Ihre private Tour nach diesem Guide – inkl. Gezeiten & Timing.",
                  en: "We'll plan your private tour based on this guide – tides & timing included.",
                })}
              </p>
              <button
                type="button"
                onClick={() => openInquiry(article.tourId)}
                className="mt-4 min-h-14 w-full rounded-2xl bg-si-cyan px-4 py-3 font-bold text-si-navy active:scale-[0.98]"
              >
                {t(UI.articleCta)}
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </Sheet>
  );
}

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

  return (
    <AnimatePresence>
      {lb && item ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          className="fixed inset-0 z-[80] flex flex-col bg-black/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="flex items-center justify-between gap-3 p-3" style={{ paddingTop: "calc(0.75rem + env(safe-area-inset-top))" }}>
            <p className="truncate pl-2 text-sm font-semibold text-white">
              {item.title}
              <span className="ml-2 text-white/50">
                {lb.index + 1}/{lb.items.length}
              </span>
            </p>
            <button
              type="button"
              onClick={close}
              aria-label={t(UI.close)}
              className="grid size-12 shrink-0 place-items-center rounded-full bg-white/10 text-white"
            >
              <X className="size-6" />
            </button>
          </div>
          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-2">
            <AnimatePresence mode="popLayout" custom={dir} initial={false}>
              <motion.div
                key={lb.index}
                custom={dir}
                initial={{ opacity: 0, x: dir * 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -80 }}
                transition={{ duration: 0.25 }}
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
                    className="max-h-full max-w-full rounded-xl object-contain [&.si-fallback]:aspect-[4/3] [&.si-fallback]:w-full"
                  />
                )}
              </motion.div>
            </AnimatePresence>
            {lb.items.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous"
                  className="absolute left-2 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:grid"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next"
                  className="absolute right-2 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:grid"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            ) : null}
          </div>
          {lb.items.length > 1 ? (
            <div
              className="hide-scroll flex justify-center gap-2 overflow-x-auto p-3"
              style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
            >
              {lb.items.map((it, i) => (
                <button
                  key={`${it.src}-${i}`}
                  type="button"
                  onClick={() => {
                    setDir(i > lb.index ? 1 : -1);
                    setIndex(i);
                  }}
                  aria-label={it.title}
                  className={cn(
                    "relative size-14 shrink-0 overflow-hidden rounded-xl ring-2 transition",
                    i === lb.index ? "ring-si-cyan" : "opacity-50 ring-transparent",
                  )}
                >
                  <SmartImage src={it.src.replace(/w=\d+/, "w=200")} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function LightboxVideo({ src, poster }: { src: string; poster: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div className="relative flex max-h-full w-full max-w-3xl items-center justify-center">
        <SmartImage src={poster} alt="" className="max-h-[75vh] w-full rounded-xl object-contain" />
        <span className="absolute bottom-3 rounded-full bg-black/60 px-3 py-1 text-xs text-white">Video preview</span>
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
      className="max-h-full max-w-full rounded-xl"
    />
  );
}
