import { AnimatePresence, motion, useScroll, useTransform, type PanInfo } from "framer-motion";
import {
  Check,
  ChevronDown,
  Globe,
  Play,
  Sailboat,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
  Wand2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { BRAND, COMPARISON, IMG, LANGS, UI, VIDEO, type ComparisonId } from "./content";
import { Assemble, AssembleItem, CountUp, GlassCard, Magnetic, Marquee, ScrollScene, SectionTitle, SplitReveal, btn } from "./fx";
import { scrollToId, useSI, useTx, waLink } from "./store";
import { BrandMark, SmartImage, WhatsAppIcon } from "./ui";

const NAV = [
  { id: "touren", label: UI.navTours },
  { id: "angeln", label: { de: "Angeln", en: "Fishing" } },
  { id: "drohne", label: UI.navDrone },
  { id: "galerie", label: UI.navGallery },
  { id: "guide", label: UI.navGuide },
  { id: "faq", label: UI.navFaq },
];

const BOOK = { de: "Tour buchen", en: "Book a tour" };

/* ───────────────────────── Header ───────────────────────── */

export function Header() {
  const { t, tOp } = useTx();
  const openBooking = useSI((s) => s.openBooking);
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
      className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 sm:px-5"
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)" }}
    >
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "pointer-events-auto mx-auto flex items-center gap-2 rounded-full pl-2 pr-2 transition-all duration-500 sm:gap-3",
          scrolled
            ? "si-glass-strong h-14 max-w-5xl shadow-[0_20px_60px_-20px_rgb(0_0_0/0.8)]"
            : "si-glass h-16 max-w-6xl",
        )}
      >
        <a href="#top" className="flex min-w-0 items-center gap-2 pl-1 text-white" aria-label={BRAND.name}>
          <BrandMark className={cn("transition-all duration-500", scrolled ? "size-9" : "size-10")} />
          <span className="truncate text-[14px] font-extrabold leading-none tracking-tight sm:text-base">
            Krabi <span className="si-text-gradient">Secret</span> Islands
          </span>
        </a>

        <nav className="ml-4 hidden items-center gap-0.5 lg:flex">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => scrollToId(n.id)}
              className="group relative rounded-full px-3 py-2 text-sm font-semibold text-slate-300 transition hover:text-white"
            >
              <span className="absolute inset-0 scale-75 rounded-full bg-white/10 opacity-0 transition group-hover:scale-100 group-hover:opacity-100" />
              <span className="relative">{t(n.label)}</span>
            </button>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <LangMenu />
          <a
            href={waLink(waText)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="grid size-11 place-items-center rounded-full bg-si-wa text-white shadow-[0_8px_24px_-6px_rgb(37_211_102/0.7)] transition hover:scale-105"
          >
            <WhatsAppIcon className="size-5" />
          </a>
          <Magnetic className="hidden sm:inline-block">
            <button
              type="button"
              onClick={() => openBooking()}
              className="relative inline-flex h-11 items-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-si-cyan to-cyan-300 px-5 text-sm font-bold text-si-navy shadow-[0_8px_30px_-8px_rgb(6_182_212/0.9)] transition hover:brightness-110"
            >
              <Sparkles className="size-4" />
              {t(BOOK)}
            </button>
          </Magnetic>
        </div>
      </motion.div>
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
        className="flex h-11 items-center gap-1.5 rounded-full bg-white/[0.07] pl-3 pr-2.5 text-xs font-bold uppercase text-white ring-1 ring-white/15 transition hover:bg-white/15"
      >
        <Globe className="size-4 text-cyan-200" />
        {current.id}
        <ChevronDown className={cn("size-3.5 transition", open && "rotate-180")} />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.ul
            role="listbox"
            aria-label="Language"
            initial={{ opacity: 0, y: -8, scale: 0.95, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -8, scale: 0.95, filter: "blur(6px)" }}
            transition={{ duration: 0.18 }}
            className="si-glass-strong absolute right-0 top-14 w-48 origin-top-right overflow-hidden rounded-2xl p-1.5"
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
                    l.id === lang ? "bg-si-cyan/15 text-cyan-200" : "text-slate-200 hover:bg-white/10",
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

/* ───────────────────────── Mobile bottom bar ───────────────────────── */

export function BottomBar() {
  const { t, tOp } = useTx();
  const openBooking = useSI((s) => s.openBooking);
  const waText = tOp({
    de: "Hallo! Ich möchte eine private Speedboat-Tour anfragen. Wunschdatum: … / Personen: …",
    en: "Hi! I'd like to request a private speedboat tour. Preferred date: … / Guests: …",
  });
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 px-3 md:hidden"
      style={{ paddingBottom: "calc(0.6rem + env(safe-area-inset-bottom))" }}
    >
      <div className="si-glass-strong grid grid-cols-[1fr_1.25fr] gap-2 rounded-[1.4rem] p-1.5">
        <a
          href={waLink(waText)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-12 min-w-0 items-center justify-center gap-2 rounded-2xl bg-si-wa/90 px-2 text-[15px] font-bold text-white active:scale-[0.98]"
        >
          <WhatsAppIcon className="size-5 shrink-0" />
          <span className="truncate">{t(UI.ctaWhatsapp)}</span>
        </a>
        <button
          type="button"
          onClick={() => openBooking()}
          className="flex h-12 min-w-0 items-center justify-center gap-1.5 rounded-2xl bg-gradient-to-r from-si-cyan to-cyan-300 px-2 text-[15px] font-bold text-si-navy shadow-[0_8px_24px_-8px_rgb(6_182_212/0.9)] active:scale-[0.98]"
        >
          <Sparkles className="size-4 shrink-0" />
          <span className="truncate">{t(BOOK)}</span>
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── Hero ───────────────────────── */

const ISLAND_NAMES = [
  "Koh Poda",
  "Koh Hong",
  "Koh Roi",
  "Koh Kudu",
  "Maya Bay",
  "Railay",
  "Phi Phi",
  "Chicken Island",
  "Tup Sandbar",
  "Koh Pakbia",
  "Hong Lagoon",
  "Koh Lao Lading",
];

export function Hero() {
  const { t } = useTx();
  const openBooking = useSI((s) => s.openBooking);
  const openLightbox = useSI((s) => s.openLightbox);
  const [videoOk, setVideoOk] = useState(true);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.3]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -120]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const statsY = useTransform(scrollYProgress, [0, 1], [0, -220]);

  const showDrone = () =>
    openLightbox(
      [
        { src: IMG.aerial, title: "Cinematic Drone – Phang Nga", video: VIDEO.cinematic },
        { src: IMG.sandbar, title: "Reel – Koh Kudu", video: VIDEO.reel1 },
        { src: IMG.lagoon, title: "Reel – Hong Lagoon", video: VIDEO.reel2 },
      ],
      0,
    );

  const stats = [
    { node: <CountUp to={4.9} decimals={1} />, icon: <Star className="size-4 fill-si-gold text-si-gold" />, label: UI.stats[0].l },
    { node: <CountUp to={1200} suffix="+" />, icon: <Sailboat className="size-4 text-cyan-300" />, label: UI.stats[1].l },
    { node: <CountUp to={5} />, icon: <Users className="size-4 text-cyan-300" />, label: UI.stats[2].l },
  ];

  return (
    <>
      <section ref={ref} id="top" className="relative isolate flex min-h-[100svh] items-end overflow-hidden">
        <motion.div style={{ y: bgY, scale: bgScale }} className="si-fallback absolute inset-0 -z-20 will-change-transform">
          <SmartImage src={IMG.hero} alt="" eager className="absolute inset-0 size-full object-cover" />
          {videoOk ? (
            <video
              className="absolute inset-0 size-full object-cover opacity-0 transition-opacity duration-1000"
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
        </motion.div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-si-navy via-si-navy/60 to-si-navy/20" />
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(80%_60%_at_15%_85%,rgb(6_182_212/0.25),transparent_70%)]" />

        <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 pb-14 pt-28 sm:pb-24 lg:grid-cols-[1fr_auto] lg:items-end">
          <motion.div style={{ y: contentY, opacity: contentOpacity }}>
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="si-glass mb-5 inline-flex max-w-full items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold text-amber-200 sm:text-sm"
            >
              <span className="relative flex size-2 shrink-0">
                <span className="absolute inset-0 animate-ping rounded-full bg-si-gold/70" />
                <span className="relative size-2 rounded-full bg-si-gold" />
              </span>
              <span className="truncate">{t(UI.heroBadge)}</span>
            </motion.div>

            <h1 className="max-w-4xl text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl">
              <SplitReveal text={t(UI.heroTitleA)} delay={0.25} />
              <br />
              <SplitReveal text={t(UI.heroTitleB)} delay={0.45} className="si-text-gradient" />
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg"
            >
              {t(UI.heroSub)}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.85 }}
              className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            >
              <Magnetic className="w-full sm:w-auto">
                <button type="button" onClick={() => openBooking()} className={cn(btn.primary, "h-14 w-full text-base sm:w-auto")}>
                  <span className="si-shimmer pointer-events-none absolute inset-0 opacity-0 mix-blend-overlay transition hover:opacity-40" />
                  {t(UI.heroPrimary)}
                </button>
              </Magnetic>
              <button type="button" onClick={() => openBooking({ custom: true })} className={cn(btn.glass, "h-14 text-base")}>
                <Wand2 className="size-5 text-si-gold" />
                {t({ de: "Eigene Tour bauen", en: "Build your own tour" })}
              </button>
              <button
                type="button"
                onClick={showDrone}
                className="group flex min-h-12 items-center gap-3 self-start rounded-full py-1 pr-3 text-sm font-bold text-white sm:ml-2 sm:self-auto"
              >
                <span className="relative grid size-12 place-items-center rounded-full bg-white text-si-navy">
                  <span className="absolute inset-0 animate-ping rounded-full bg-white/40 [animation-duration:2.2s]" />
                  <Play className="relative ml-0.5 size-4 fill-current" />
                </span>
                <span className="underline-offset-4 group-hover:underline">{t(UI.heroSecondary)}</span>
              </button>
            </motion.div>

            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 1 } } }}
              className="mt-7 flex flex-wrap gap-2"
            >
              {UI.pills.map((p) => (
                <motion.li
                  key={p.de}
                  variants={{ hidden: { opacity: 0, y: 8, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1 } }}
                  className="si-glass flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-slate-100 sm:text-sm"
                >
                  <Check className="size-3.5 text-si-cyan" strokeWidth={3} />
                  {t(p)}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Floating glass stat cards */}
          <motion.div
            style={{ y: statsY }}
            className="grid grid-cols-3 gap-2 sm:gap-3 lg:w-56 lg:grid-cols-1 lg:gap-4"
          >
            {stats.map((s, i) => (
              <motion.div
                key={s.label.de}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.8, delay: 1.1 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                className={cn(i === 1 && "lg:-translate-x-10")}
              >
                <motion.div
                  animate={{ y: [0, -7, 0] }}
                  transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
                  className="si-glass rounded-2xl px-3 py-3 sm:px-4 lg:rounded-3xl lg:p-5"
                >
                  <div className="flex items-center gap-1.5">
                    {s.icon}
                    <span className="text-xl font-extrabold tabular-nums text-white sm:text-2xl lg:text-3xl">{s.node}</span>
                  </div>
                  <p className="mt-1 text-[11px] font-medium leading-tight text-slate-300 sm:text-xs">{t(s.label)}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.button
          type="button"
          onClick={() => scrollToId("vergleich")}
          aria-label={t({ de: "Nach unten scrollen", en: "Scroll down" })}
          style={{ opacity: contentOpacity }}
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 md:flex"
        >
          <span className="flex h-10 w-6 justify-center rounded-full border border-white/30 pt-2">
            <motion.span
              animate={{ y: [0, 12, 0], opacity: [1, 0.2, 1] }}
              transition={{ duration: 1.8, repeat: Infinity }}
              className="size-1.5 rounded-full bg-white"
            />
          </span>
          Scroll
        </motion.button>
      </section>

      <div className="relative border-y border-white/10 bg-white/[0.03] py-4 backdrop-blur-sm">
        <Marquee speed={45}>
          {ISLAND_NAMES.map((n) => (
            <span key={n} className="flex items-center whitespace-nowrap">
              <span className="px-5 text-lg font-extrabold uppercase tracking-wide text-white/80 sm:px-8 sm:text-2xl">{n}</span>
              <span className="si-text-gradient text-lg sm:text-2xl">✦</span>
            </span>
          ))}
        </Marquee>
      </div>
    </>
  );
}

/* ───────────────────────── Comparison ───────────────────────── */

const COMPARE_ICON: Record<ComparisonId, typeof ShieldCheck> = {
  ksi: ShieldCheck,
  group: Users,
  longtail: Sailboat,
};

export function Comparison() {
  const { t } = useTx();
  const [active, setActive] = useState<ComparisonId>("ksi");
  const [dir, setDir] = useState(1);
  const idx = Math.max(0, COMPARISON.findIndex((c) => c.id === active));
  const current = COMPARISON[idx];
  const ours = COMPARISON.find((c) => c.good) ?? COMPARISON[0];
  const others = COMPARISON.filter((c) => !c.good);

  const go = (next: number) => {
    const n = (next + COMPARISON.length) % COMPARISON.length;
    setDir(n > idx ? 1 : -1);
    setActive(COMPARISON[n].id);
  };
  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -50) go(idx + 1);
    else if (info.offset.x > 50) go(idx - 1);
  };

  return (
    <section id="vergleich" className="relative scroll-mt-24 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle eyebrow={t(UI.compareEyebrow)} title={t(UI.compareTitle)} sub={t(UI.compareSub)} center />

        {/* Mobile: segmented tabs + swipeable card */}
        <ScrollScene className="md:hidden" from="tilt" intensity={0.6}>
          <div role="tablist" className="si-glass relative mb-5 grid grid-cols-3 gap-1 rounded-2xl p-1">
            {COMPARISON.map((c, i) => (
              <button
                key={c.id}
                role="tab"
                type="button"
                aria-selected={active === c.id}
                onClick={() => go(i)}
                className={cn(
                  "relative min-h-12 rounded-xl px-1 text-xs font-bold leading-tight transition-colors",
                  active === c.id ? (c.good ? "text-si-navy" : "text-white") : "text-slate-400",
                )}
              >
                {active === c.id ? (
                  <motion.span
                    layoutId="cmp-pill"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    className={cn(
                      "absolute inset-0 rounded-xl",
                      c.good ? "bg-gradient-to-r from-si-cyan to-cyan-300" : "bg-white/15",
                    )}
                  />
                ) : null}
                <span className="relative">{t(c.short)}</span>
              </button>
            ))}
          </div>
          <div className="relative overflow-hidden px-0.5 py-1">
            <AnimatePresence mode="wait" custom={dir} initial={false}>
              <motion.div
                key={current.id}
                custom={dir}
                variants={{
                  enter: (d: number) => ({ opacity: 0, x: 60 * d, rotateY: -12 * d }),
                  center: { opacity: 1, x: 0, rotateY: 0 },
                  exit: (d: number) => ({ opacity: 0, x: -60 * d, rotateY: 12 * d }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragEnd={onDragEnd}
                className="touch-pan-y"
              >
                <CompareCard item={current} />
              </motion.div>
            </AnimatePresence>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            {t({ de: "← Wischen zum Vergleichen →", en: "← Swipe to compare →" })}
          </p>
        </ScrollScene>

        {/* Desktop: dimmed rival | glowing us | dimmed rival */}
        <Assemble className="relative hidden items-stretch gap-6 md:grid md:grid-cols-[1fr_1.15fr_1fr]" stagger={0.15}>
          <AssembleItem variant="left" className="opacity-70 transition hover:opacity-100">
            <CompareCard item={others[0]} />
          </AssembleItem>
          <AssembleItem variant="scale" className="relative z-10 md:-my-4">
            <CompareCard item={ours} />
            <span className="si-glass-strong absolute -left-[2.35rem] top-1/2 z-20 grid size-12 -translate-y-1/2 place-items-center rounded-full text-sm font-black text-si-gold">
              VS
            </span>
            <span className="si-glass-strong absolute -right-[2.35rem] top-1/2 z-20 grid size-12 -translate-y-1/2 place-items-center rounded-full text-sm font-black text-si-gold">
              VS
            </span>
          </AssembleItem>
          <AssembleItem variant="right" className="opacity-70 transition hover:opacity-100">
            <CompareCard item={others[1] ?? others[0]} />
          </AssembleItem>
        </Assemble>
      </div>
    </section>
  );
}

function CompareCard({ item }: { item: (typeof COMPARISON)[number] }) {
  const { t } = useTx();
  const Icon = COMPARE_ICON[item.id];
  return (
    <GlassCard
      glow={item.good}
      className={cn(
        "h-full p-6 sm:p-7",
        item.good ? "bg-gradient-to-b from-si-cyan/[0.14] to-transparent shadow-[0_30px_80px_-30px_rgb(6_182_212/0.6)]" : "grayscale-[40%]",
      )}
    >
      {item.good ? (
        <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-si-gold to-amber-300 px-3 py-1 text-xs font-bold text-si-navy shadow-[0_6px_20px_-6px_rgb(245_158_11/0.9)]">
          ★ {t({ de: "Empfohlen", en: "Recommended" })}
        </span>
      ) : null}
      <div className="mb-6 flex items-center gap-3">
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-2xl",
            item.good ? "bg-si-cyan/20 text-cyan-300 ring-1 ring-si-cyan/40" : "bg-white/5 text-slate-400 ring-1 ring-white/10",
          )}
        >
          <Icon className="size-6" />
        </span>
        <div className="min-w-0">
          <p className={cn("text-lg font-extrabold leading-tight", item.good ? "text-white" : "text-slate-200")}>{t(item.name)}</p>
          <p className={cn("text-xs font-semibold", item.good ? "text-cyan-300" : "text-slate-500")}>{t(item.tag)}</p>
        </div>
      </div>
      <Assemble as="ul" className="space-y-3.5" stagger={0.07}>
        {item.points.map((p) => (
          <AssembleItem as="li" key={p.de} variant="left" className="flex items-start gap-3 text-[15px] leading-snug">
            {item.good ? (
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-si-cyan text-si-navy shadow-[0_0_12px_rgb(6_182_212/0.7)]">
                <Check className="size-3" strokeWidth={3.5} />
              </span>
            ) : (
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-red-500/15 text-red-400 ring-1 ring-red-400/30">
                <X className="size-3" strokeWidth={3.5} />
              </span>
            )}
            <span className={item.good ? "text-slate-100" : "text-slate-400"}>{t(p)}</span>
          </AssembleItem>
        ))}
      </Assemble>
    </GlassCard>
  );
}
