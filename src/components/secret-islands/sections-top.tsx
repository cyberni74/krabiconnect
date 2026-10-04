import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Globe, Play, Sailboat, ShieldCheck, Star, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BRAND, COMPARISON, IMG, LANGS, UI, VIDEO, type ComparisonId } from "./content";
import { scrollToId, useSI, useTx, waLink } from "./store";
import { BrandMark, SectionHeading, SmartImage, WhatsAppIcon } from "./ui";

const NAV = [
  { id: "touren", label: UI.navTours },
  { id: "drohne", label: UI.navDrone },
  { id: "galerie", label: UI.navGallery },
  { id: "guide", label: UI.navGuide },
  { id: "faq", label: UI.navFaq },
];

export function Header() {
  const { t, tOp } = useTx();
  const openInquiry = useSI((s) => s.openInquiry);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const waText = tOp({
    de: "Hallo Krabi Secret Islands! Ich interessiere mich für eine private Speedboat-Tour.",
    en: "Hi Krabi Secret Islands! I'm interested in a private speedboat tour.",
  });

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
        scrolled ? "bg-si-navy/90 shadow-lg backdrop-blur-md" : "bg-gradient-to-b from-si-navy/70 to-transparent",
      )}
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <a href="#top" className="flex min-w-0 items-center gap-2 text-white" aria-label={BRAND.name}>
          <BrandMark className="size-10" />
          <span className="truncate text-[15px] font-extrabold leading-none tracking-tight sm:text-base">
            Krabi <span className="text-si-cyan">Secret</span> Islands
          </span>
        </a>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => scrollToId(n.id)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10 hover:text-white"
            >
              {t(n.label)}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <LangMenu />
          <a
            href={waLink(waText)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="grid size-10 place-items-center rounded-full bg-si-wa text-white shadow-lg shadow-si-wa/30 transition hover:scale-105"
          >
            <WhatsAppIcon className="size-5" />
          </a>
          <button
            type="button"
            onClick={() => openInquiry()}
            className="hidden h-10 rounded-full bg-si-cyan px-5 text-sm font-bold text-si-navy shadow-lg shadow-si-cyan/30 transition hover:bg-white md:block"
          >
            {t(UI.ctaTour)}
          </button>
        </div>
      </div>
    </header>
  );
}

function LangMenu() {
  const { lang } = useTx();
  const setLang = useSI((s) => s.setLang);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGS.find((l) => l.id === lang) ?? LANGS[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
        className="flex h-10 items-center gap-1.5 rounded-full bg-white/10 pl-3 pr-2.5 text-xs font-bold uppercase text-white ring-1 ring-white/15 transition hover:bg-white/20"
      >
        <Globe className="size-4" />
        {current.id}
        <ChevronDown className={cn("size-3.5 transition", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.ul
            role="listbox"
            aria-label="Language"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-44 overflow-hidden rounded-2xl bg-white p-1.5 shadow-2xl ring-1 ring-slate-200"
          >
            {LANGS.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={l.id === lang}
                  lang={l.html}
                  onClick={() => {
                    setLang(l.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold transition",
                    l.id === lang ? "bg-cyan-50 text-si-cyan-dark" : "text-si-navy hover:bg-slate-50",
                  )}
                >
                  <span className="text-lg leading-none">{l.flag}</span>
                  <span className="flex-1">{l.label}</span>
                  {l.id === lang ? <Check className="size-4" strokeWidth={3} /> : null}
                </button>
              </li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export function BottomBar() {
  const { t, tOp } = useTx();
  const openInquiry = useSI((s) => s.openInquiry);
  const waText = tOp({
    de: "Hallo! Ich möchte eine private Speedboat-Tour anfragen. Wunschdatum: … / Personen: …",
    en: "Hi! I'd like to request a private speedboat tour. Preferred date: … / Guests: …",
  });
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-si-navy/95 px-3 pt-3 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
    >
      <div className="grid grid-cols-2 gap-2">
        <a
          href={waLink(waText)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 min-w-0 items-center justify-center gap-2 rounded-2xl bg-si-wa px-2 text-[15px] font-bold text-white active:scale-[0.98]"
        >
          <WhatsAppIcon className="size-5 shrink-0" />
          <span className="truncate">{t(UI.ctaWhatsapp)}</span>
        </a>
        <button
          type="button"
          onClick={() => openInquiry()}
          className="h-12 min-w-0 truncate rounded-2xl bg-si-cyan px-2 text-[15px] font-bold text-si-navy active:scale-[0.98]"
        >
          {t(UI.ctaTour)}
        </button>
      </div>
    </div>
  );
}

export function Hero() {
  const { t } = useTx();
  const openInquiry = useSI((s) => s.openInquiry);
  const openLightbox = useSI((s) => s.openLightbox);
  const [videoOk, setVideoOk] = useState(true);

  const showDrone = () =>
    openLightbox(
      [
        { src: IMG.aerial, title: "Cinematic Drone – Phang Nga", video: VIDEO.cinematic },
        { src: IMG.sandbar, title: "Reel – Koh Kudu", video: VIDEO.reel1 },
        { src: IMG.lagoon, title: "Reel – Hong Lagoon", video: VIDEO.reel2 },
      ],
      0,
    );

  return (
    <section id="top" className="si-fallback relative isolate flex min-h-[88svh] items-end overflow-hidden">
      <SmartImage src={IMG.hero} alt="" eager className="absolute inset-0 -z-20 size-full object-cover" />
      {videoOk ? (
        <video
          className="absolute inset-0 -z-20 size-full object-cover opacity-0 transition-opacity duration-1000"
          src={VIDEO.heroLoop}
          poster={IMG.hero}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={(e) => (e.currentTarget.style.opacity = "1")}
          onError={() => setVideoOk(false)}
        />
      ) : null}
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-si-navy via-si-navy/55 to-si-navy/30" />

      <div className="mx-auto w-full max-w-6xl px-4 pb-12 pt-28 sm:pb-20">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-si-gold/40 bg-si-navy/50 px-3 py-1.5 text-xs font-semibold text-si-gold backdrop-blur sm:text-sm"
        >
          <Star className="size-3.5 shrink-0 fill-si-gold" />
          <span className="truncate">{t(UI.heroBadge)}</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="max-w-3xl text-[2.25rem] font-extrabold leading-[1.08] text-white sm:text-6xl"
        >
          {t(UI.heroTitleA)}{" "}
          <span className="bg-gradient-to-r from-si-cyan to-cyan-200 bg-clip-text text-transparent">
            {t(UI.heroTitleB)}
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-4 max-w-xl text-base leading-relaxed text-slate-200 sm:text-lg"
        >
          {t(UI.heroSub)}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-7 flex flex-col gap-3 sm:flex-row"
        >
          <button
            type="button"
            onClick={() => openInquiry()}
            className="h-14 rounded-2xl bg-si-cyan px-7 text-base font-bold text-si-navy shadow-xl shadow-si-cyan/30 transition hover:bg-white active:scale-[0.98]"
          >
            {t(UI.heroPrimary)}
          </button>
          <button
            type="button"
            onClick={showDrone}
            className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-7 text-base font-bold text-white backdrop-blur transition hover:bg-white/20 active:scale-[0.98]"
          >
            <span className="grid size-7 place-items-center rounded-full bg-white text-si-navy">
              <Play className="ml-0.5 size-3.5 fill-current" />
            </span>
            {t(UI.heroSecondary)}
          </button>
        </motion.div>

        <motion.ul
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.45 } } }}
          className="mt-7 flex flex-wrap gap-2"
        >
          {UI.pills.map((p) => (
            <motion.li
              key={p.de}
              variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white ring-1 ring-white/15 backdrop-blur sm:text-sm"
            >
              <Check className="size-3.5 text-si-cyan" strokeWidth={3} />
              {t(p)}
            </motion.li>
          ))}
        </motion.ul>

        <div className="mt-8 grid max-w-md grid-cols-3 divide-x divide-white/15 rounded-2xl bg-white/5 py-3 ring-1 ring-white/10 backdrop-blur">
          {UI.stats.map((s) => (
            <div key={s.v} className="px-3 text-center">
              <p className="text-xl font-extrabold text-white">{s.v}</p>
              <p className="text-[11px] font-medium text-slate-300">{t(s.l)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const COMPARE_ICON: Record<ComparisonId, typeof ShieldCheck> = {
  ksi: ShieldCheck,
  group: Users,
  longtail: Sailboat,
};

export function Comparison() {
  const { t } = useTx();
  const [active, setActive] = useState<ComparisonId>("ksi");
  const current = COMPARISON.find((c) => c.id === active) ?? COMPARISON[0];

  return (
    <section className="bg-si-white py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <SectionHeading eyebrow={t(UI.compareEyebrow)} title={t(UI.compareTitle)} sub={t(UI.compareSub)} />

        {/* Mobile: segmented tabs + animated card */}
        <div className="md:hidden">
          <div role="tablist" className="mb-4 grid grid-cols-3 gap-1 rounded-2xl bg-slate-200/70 p-1">
            {COMPARISON.map((c) => (
              <button
                key={c.id}
                role="tab"
                type="button"
                aria-selected={active === c.id}
                onClick={() => setActive(c.id)}
                className={cn(
                  "min-h-12 rounded-xl px-1 text-xs font-bold leading-tight transition",
                  active === c.id
                    ? c.good
                      ? "bg-si-navy text-white shadow"
                      : "bg-white text-si-navy shadow"
                    : "text-si-slate",
                )}
              >
                {t(c.short)}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              <CompareCard item={current} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Desktop: three columns */}
        <div className="hidden gap-5 md:grid md:grid-cols-3">
          {COMPARISON.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <CompareCard item={c} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CompareCard({ item }: { item: (typeof COMPARISON)[number] }) {
  const { t } = useTx();
  const Icon = COMPARE_ICON[item.id];
  return (
    <div
      className={cn(
        "relative h-full rounded-3xl p-6",
        item.good
          ? "bg-si-navy text-white shadow-2xl shadow-si-cyan/20 ring-2 ring-si-cyan"
          : "bg-white text-si-navy ring-1 ring-slate-200",
      )}
    >
      {item.good ? (
        <span className="absolute -top-3 left-6 rounded-full bg-si-gold px-3 py-1 text-xs font-bold text-si-navy">
          ★ {t({ de: "Empfohlen", en: "Recommended" })}
        </span>
      ) : null}
      <div className="mb-5 flex items-center gap-3">
        <span
          className={cn(
            "grid size-12 place-items-center rounded-2xl",
            item.good ? "bg-si-cyan/20 text-si-cyan" : "bg-slate-100 text-slate-500",
          )}
        >
          <Icon className="size-6" />
        </span>
        <div>
          <p className="text-lg font-extrabold leading-tight">{t(item.name)}</p>
          <p className={cn("text-xs font-semibold", item.good ? "text-si-cyan" : "text-slate-500")}>{t(item.tag)}</p>
        </div>
      </div>
      <ul className="space-y-3">
        {item.points.map((p) => (
          <li key={p.de} className="flex items-start gap-3 text-[15px] leading-snug">
            {item.good ? (
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-si-cyan text-si-navy">
                <Check className="size-3" strokeWidth={3.5} />
              </span>
            ) : (
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-red-100 text-red-500">
                <X className="size-3" strokeWidth={3.5} />
              </span>
            )}
            <span className={item.good ? "text-slate-100" : "text-si-slate"}>{t(p)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
