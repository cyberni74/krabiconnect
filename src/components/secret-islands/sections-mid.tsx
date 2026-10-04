import { AnimatePresence, motion } from "framer-motion";
import { Camera, Check, Clock, Expand, MapPin, Pause, Play, Plane } from "lucide-react";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  GALLERY,
  GALLERY_TABS,
  IMG,
  TOUR_FILTERS,
  TOURS,
  UI,
  VIDEO,
  type GalleryCat,
  type Tour,
  type TourCategory,
} from "./content";
import { formatTHB, useSI, useTx } from "./store";
import { Reveal, SectionHeading, SmartImage } from "./ui";

function Chips<T extends string>({
  items,
  value,
  onChange,
  dark,
}: {
  items: { id: T; label: { de: string; en: string } }[];
  value: T;
  onChange: (v: T) => void;
  dark?: boolean;
}) {
  const { t } = useTx();
  return (
    <div role="tablist" className="hide-scroll -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          role="tab"
          aria-selected={value === it.id}
          onClick={() => onChange(it.id)}
          className={cn(
            "h-11 shrink-0 rounded-full px-4 text-sm font-bold transition",
            value === it.id
              ? "bg-si-cyan text-si-navy shadow-lg shadow-si-cyan/25"
              : dark
                ? "bg-white/10 text-slate-200 ring-1 ring-white/15 hover:bg-white/20"
                : "bg-white text-si-slate ring-1 ring-slate-200 hover:ring-si-cyan",
          )}
        >
          {t(it.label)}
        </button>
      ))}
    </div>
  );
}

export function Tours() {
  const { t } = useTx();
  const [filter, setFilter] = useState<"all" | TourCategory>("all");
  const list = filter === "all" ? TOURS : TOURS.filter((tr) => tr.categories.includes(filter));

  return (
    <section id="touren" className="scroll-mt-16 bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow={t(UI.toursEyebrow)} title={t(UI.toursTitle)} sub={t(UI.toursSub)} />
        <Chips items={TOUR_FILTERS} value={filter} onChange={setFilter} />
        <div className="hide-scroll -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          <AnimatePresence mode="popLayout">
            {list.map((tour) => (
              <motion.div
                key={tour.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="w-[85%] shrink-0 snap-center sm:w-[60%] md:w-auto"
              >
                <TourCard tour={tour} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function TourCard({ tour }: { tour: Tour }) {
  const { t } = useTx();
  const openTour = useSI((s) => s.openTour);
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-xl shadow-slate-900/5 ring-1 ring-slate-200">
      <div className="relative aspect-[4/3] overflow-hidden">
        <SmartImage
          src={tour.image}
          alt={t(tour.title)}
          className="size-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-si-navy/80 via-transparent to-transparent" />
        {tour.badge ? (
          <span className="absolute left-3 top-3 rounded-full bg-si-gold px-3 py-1 text-xs font-bold text-si-navy shadow">
            {t(tour.badge)}
          </span>
        ) : null}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
          <span className="flex items-center gap-1 text-xs font-semibold">
            <Clock className="size-3.5" /> {t(tour.duration)}
          </span>
          <span className="text-right">
            <span className="block text-[10px] font-medium uppercase opacity-80">{t(UI.from)}</span>
            <span className="text-lg font-extrabold">{formatTHB(tour.price)}</span>
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-extrabold leading-snug text-si-navy">{t(tour.title)}</h3>
        <p className="mt-1.5 text-sm leading-relaxed text-si-slate">{t(tour.short)}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {tour.stops.map((s) => (
            <span
              key={s}
              className="flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-si-cyan-dark"
            >
              <MapPin className="size-3" /> {s}
            </span>
          ))}
        </div>
        <div className="mt-auto pt-5">
          <button
            type="button"
            onClick={() => openTour(tour.id)}
            className="h-12 w-full rounded-2xl bg-si-navy text-sm font-bold text-white transition hover:bg-si-cyan-dark active:scale-[0.98]"
          >
            {t(UI.details)}
          </button>
        </div>
      </div>
    </article>
  );
}

export function DroneFeature() {
  const { t } = useTx();
  const openLightbox = useSI((s) => s.openLightbox);
  const openInquiry = useSI((s) => s.openInquiry);
  const samples = [
    { src: IMG.aerial, title: "Cinematic Drone – Phang Nga", video: VIDEO.cinematic },
    { src: IMG.sandbar, title: "Tup Sandbank", video: undefined },
    { src: IMG.island, title: "Private Bay", video: undefined },
    { src: IMG.lagoon, title: "Reel – Hong Lagoon", video: VIDEO.reel2 },
  ];

  return (
    <section id="drohne" className="relative scroll-mt-16 overflow-hidden bg-si-navy py-16 sm:py-24">
      <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-si-cyan/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-20 size-96 rounded-full bg-si-gold/10 blur-3xl" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
        <div>
          <SectionHeading eyebrow={t(UI.droneEyebrow)} title={t(UI.droneTitle)} sub={t(UI.droneText)} dark />
          <ul className="mb-8 grid gap-3 sm:grid-cols-2">
            {UI.droneFeatures.map((f) => (
              <li key={f.de} className="flex items-center gap-2.5 text-sm font-medium text-slate-200">
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-si-gold/20 text-si-gold">
                  <Check className="size-3.5" strokeWidth={3} />
                </span>
                {t(f)}
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => openLightbox(samples, 0)}
              className="flex h-14 items-center justify-center gap-2 rounded-2xl bg-si-gold px-6 font-bold text-si-navy shadow-xl shadow-si-gold/20 transition hover:bg-amber-300 active:scale-[0.98]"
            >
              <Plane className="size-5" /> {t(UI.droneButton)}
            </button>
            <button
              type="button"
              onClick={() => openInquiry()}
              className="h-14 rounded-2xl border border-white/20 px-6 font-bold text-white transition hover:bg-white/10"
            >
              {t(UI.ctaTour)}
            </button>
          </div>
        </div>

        <Reveal className="relative mx-auto w-full max-w-md">
          <div className="grid grid-cols-5 gap-3">
            <button
              type="button"
              onClick={() => openLightbox(samples, 3)}
              className="si-fallback relative col-span-3 aspect-[9/16] overflow-hidden rounded-[2rem] border-4 border-white/10 shadow-2xl"
              aria-label="Play reel"
            >
              <VideoPreview src={VIDEO.reel2} poster={IMG.lagoon} />
              <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur">
                ● REEL · 4K
              </span>
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 p-4 text-left text-sm font-bold text-white">
                @krabisecretislands
              </span>
            </button>
            <div className="col-span-2 flex flex-col gap-3">
              {samples.slice(1, 3).map((s, i) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => openLightbox(samples, i + 1)}
                  className="relative flex-1 overflow-hidden rounded-3xl border-4 border-white/10"
                  aria-label={s.title}
                >
                  <SmartImage src={s.src} alt={s.title} className="absolute inset-0 size-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-4 -left-2 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-2xl">
            <Camera className="size-5 text-si-cyan-dark" />
            <div>
              <p className="text-xs font-bold text-si-navy">{t({ de: "Ab ฿4,500", en: "From ฿4,500" })}</p>
              <p className="text-[11px] text-si-slate">{t({ de: "pro Tour", en: "per tour" })}</p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Muted autoplaying preview that plays on hover (desktop) or when visible (mobile autoplay). */
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

export function Gallery() {
  const { t } = useTx();
  const [tab, setTab] = useState<"all" | GalleryCat>("all");
  const openLightbox = useSI((s) => s.openLightbox);
  const list = tab === "all" ? GALLERY : GALLERY.filter((g) => g.cat === tab);
  const lbItems = list.map((g) => ({ src: g.src, title: t(g.title), video: g.video }));

  return (
    <section id="galerie" className="scroll-mt-16 bg-si-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow={t(UI.galleryEyebrow)} title={t(UI.galleryTitle)} />
        <Chips items={GALLERY_TABS} value={tab} onChange={setTab} />

        <motion.div layout className="columns-2 gap-3 md:columns-3 [&>*]:mb-3">
          <AnimatePresence mode="popLayout">
            {list.map((g, i) => (
              <motion.button
                layout
                key={g.id}
                type="button"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                onClick={() => openLightbox(lbItems, i)}
                className={cn(
                  "group relative block w-full break-inside-avoid overflow-hidden rounded-2xl bg-slate-200",
                  g.tall ? "aspect-[3/4]" : "aspect-square",
                )}
                aria-label={t(g.title)}
              >
                <SmartImage
                  src={g.src}
                  alt={t(g.title)}
                  className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-si-navy/70 via-transparent to-transparent opacity-90" />
                <span className="absolute bottom-2.5 left-3 right-10 text-left text-xs font-semibold text-white sm:text-sm">
                  {t(g.title)}
                </span>
                <span className="absolute bottom-2 right-2 grid size-8 place-items-center rounded-full bg-white/20 text-white backdrop-blur">
                  {g.video ? <Play className="ml-0.5 size-3.5 fill-current" /> : <Expand className="size-3.5" />}
                </span>
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        <h3 className="mb-5 mt-14 text-xl font-extrabold text-si-navy sm:text-2xl">{t(UI.reelsTitle)}</h3>
        <div className="hide-scroll -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-[1fr_1fr_2.2fr] md:px-0">
          <ReelPlayer src={VIDEO.reel1} poster={IMG.aerial} label="Koh Kudu · Reel" vertical />
          <ReelPlayer src={VIDEO.reel2} poster={IMG.lagoon} label="Hong Lagoon · Reel" vertical />
          <ReelPlayer src={VIDEO.cinematic} poster={IMG.island} label="Phang Nga · Cinematic 4K" />
        </div>
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
    <div
      className={cn(
        "si-fallback relative shrink-0 snap-center overflow-hidden rounded-3xl shadow-xl",
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
        className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 via-transparent to-black/10"
      >
        <motion.span
          animate={{ scale: playing ? 0.8 : 1, opacity: playing ? 0 : 1 }}
          className="grid size-16 place-items-center rounded-full bg-white/90 text-si-navy shadow-2xl"
        >
          {playing ? <Pause className="size-6 fill-current" /> : <Play className="ml-1 size-6 fill-current" />}
        </motion.span>
      </button>
      <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/40 px-3 py-1 text-xs font-bold text-white backdrop-blur">
        {label}
      </span>
      {failed ? (
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/40 px-2 py-1 text-[10px] text-white">
          Preview
        </span>
      ) : null}
    </div>
  );
}
