/**
 * Motion + glass primitives for the Secret Islands page.
 * Shared contract: sections and the booking wizard build on these, so keep APIs stable.
 */
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
  type Variants,
} from "framer-motion";
import { useEffect, useRef, type CSSProperties, type ElementType, type PointerEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ───────── Buttons (class presets) ───────── */
export const btn = {
  primary:
    "relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-si-cyan to-cyan-300 px-6 font-bold text-si-navy shadow-[0_10px_40px_-10px_rgb(6_182_212/0.8)] transition hover:shadow-[0_14px_50px_-8px_rgb(6_182_212/0.95)] active:scale-[0.98] disabled:opacity-50",
  gold:
    "relative inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-si-gold to-amber-300 px-6 font-bold text-si-navy shadow-[0_10px_40px_-12px_rgb(245_158_11/0.8)] transition active:scale-[0.98]",
  glass:
    "si-glass inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl px-6 font-bold text-white transition hover:bg-white/15 active:scale-[0.98]",
  whatsapp:
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-si-wa px-6 font-bold text-white shadow-[0_10px_40px_-12px_rgb(37_211_102/0.8)] transition active:scale-[0.98]",
};

/* ───────── Background ───────── */
/** Fixed animated aurora + grid behind the whole page. */
export function AuroraBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-si-navy">
      <div
        className="absolute -left-[20vw] -top-[20vh] size-[70vw] rounded-full bg-si-cyan/25 blur-[120px]"
        style={{ animation: "si-drift-a 22s ease-in-out infinite" }}
      />
      <div
        className="absolute -right-[25vw] top-[30vh] size-[65vw] rounded-full bg-teal-500/20 blur-[120px]"
        style={{ animation: "si-drift-b 26s ease-in-out infinite" }}
      />
      <div
        className="absolute bottom-[-30vh] left-[20vw] size-[55vw] rounded-full bg-si-gold/10 blur-[140px]"
        style={{ animation: "si-drift-a 30s ease-in-out infinite reverse" }}
      />
      <div className="si-grid-bg absolute inset-0" />
    </div>
  );
}

/** Thin cyan→gold reading progress bar at the very top. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-si-cyan via-cyan-200 to-si-gold"
    />
  );
}

/* ───────── Scroll-scrubbed "assemble" ───────── */
/**
 * The block builds itself while it scrolls into view: it rises, un-tilts,
 * un-blurs and scales up, tied to scroll position (reverses when scrolling back).
 */
export function ScrollScene({
  children,
  className,
  from = "up",
  intensity = 1,
}: {
  children: ReactNode;
  className?: string;
  from?: "up" | "left" | "right" | "tilt";
  intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 0.6"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.4 });
  const x = useTransform(p, [0, 1], [from === "left" ? -120 * intensity : from === "right" ? 120 * intensity : 0, 0]);
  const y = useTransform(p, [0, 1], [from === "up" || from === "tilt" ? 110 * intensity : 30, 0]);
  const rotateX = useTransform(p, [0, 1], [from === "tilt" ? 22 * intensity : 8 * intensity, 0]);
  const scale = useTransform(p, [0, 1], [0.88, 1]);
  const opacity = useTransform(p, [0, 0.6], [0, 1]);
  const blur = useTransform(p, [0, 0.8], [10, 0]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  if (reduce) return <div className={className}>{children}</div>;
  return (
    <div ref={ref} style={{ perspective: 1200 }} className={className}>
      <motion.div style={{ x, y, rotateX, scale, opacity, filter, transformOrigin: "50% 100%" }}>{children}</motion.div>
    </div>
  );
}

/* ───────── Stagger reveal (in-view, once) ───────── */
const itemVariants: Record<string, Variants> = {
  up: { hidden: { opacity: 0, y: 40, filter: "blur(8px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)" } },
  left: { hidden: { opacity: 0, x: -60 }, show: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: 60 }, show: { opacity: 1, x: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.8 }, show: { opacity: 1, scale: 1 } },
  flip: { hidden: { opacity: 0, rotateX: -70, y: 30 }, show: { opacity: 1, rotateX: 0, y: 0 } },
};

/** Container: children wrapped in <AssembleItem> fly in one after another when visible. */
export function Assemble({
  children,
  className,
  stagger = 0.08,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  as?: "div" | "ul" | "ol";
}) {
  const Comp = motion[as] as ElementType;
  return (
    <Comp
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger } } }}
      style={{ perspective: 1000 }}
    >
      {children}
    </Comp>
  );
}

export function AssembleItem({
  children,
  className,
  variant = "up",
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof itemVariants;
  as?: "div" | "li";
}) {
  const Comp = motion[as] as ElementType;
  return (
    <Comp className={className} variants={itemVariants[variant]} transition={{ duration: 0.7, ease: EASE }}>
      {children}
    </Comp>
  );
}

/* ───────── Parallax ───────── */
export function useParallax(range = 80): { ref: React.RefObject<HTMLDivElement | null>; y: MotionValue<number> } {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-range, range]);
  return { ref, y };
}

/* ───────── Headings ───────── */
/** Word-by-word masked reveal for headlines. */
export function SplitReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <motion.span
      className={cn("inline", className)}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: delay } } }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={`${w}-${i}`} aria-hidden className="inline-block overflow-hidden pb-[0.08em] align-bottom">
          <motion.span
            className="inline-block"
            variants={{ hidden: { y: "110%", rotate: 4 }, show: { y: "0%", rotate: 0 } }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Section header: glass eyebrow pill + split-reveal title + sub. Dark background assumed. */
export function SectionTitle({
  eyebrow,
  title,
  sub,
  center,
  className,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  center?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("mb-10 max-w-3xl", center && "mx-auto text-center", className)}>
      <motion.span
        initial={{ opacity: 0, y: 10, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: EASE }}
        className="si-glass mb-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200"
      >
        <span className="size-1.5 rounded-full bg-si-cyan shadow-[0_0_10px_2px_rgb(6_182_212/0.8)]" />
        {eyebrow}
      </motion.span>
      <h2 className="text-[2rem] font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl">
        <SplitReveal text={title} />
      </h2>
      {sub ? (
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.25, ease: EASE }}
          className="mt-4 text-base leading-relaxed text-slate-300 sm:text-lg"
        >
          {sub}
        </motion.p>
      ) : null}
    </div>
  );
}

/* ───────── Glass card with spotlight + optional tilt ───────── */
export function GlassCard({
  children,
  className,
  tilt = false,
  glow = false,
  style,
  as = "div",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  tilt?: boolean;
  /** Animated conic border. */
  glow?: boolean;
  style?: CSSProperties;
  as?: "div" | "article" | "button";
  onClick?: () => void;
}) {
  const ref = useRef<HTMLElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 200, damping: 20 });
  const sry = useSpring(ry, { stiffness: 200, damping: 20 });
  const Comp = motion[as] as ElementType;

  const onMove = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--spot-x", `${px * 100}%`);
    el.style.setProperty("--spot-y", `${py * 100}%`);
    el.style.setProperty("--spot-o", "1");
    if (tilt) {
      rx.set((0.5 - py) * 10);
      ry.set((px - 0.5) * 12);
    }
  };
  const onLeave = () => {
    ref.current?.style.setProperty("--spot-o", "0");
    rx.set(0);
    ry.set(0);
  };

  return (
    <Comp
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      onClick={onClick}
      type={as === "button" ? "button" : undefined}
      style={{ ...style, rotateX: tilt ? srx : 0, rotateY: tilt ? sry : 0, transformPerspective: 900 }}
      className={cn("si-glass si-spotlight relative rounded-3xl", glow && "si-glow-border", className)}
    >
      {children}
    </Comp>
  );
}

/* ───────── Numbers ───────── */
export function CountUp({ to, decimals = 0, suffix = "", className }: { to: number; decimals?: number; suffix?: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const controls = animate(0, to, {
      duration: 1.6,
      ease: EASE,
      onUpdate: (v) => {
        el.textContent = `${v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, to, decimals, suffix]);
  return (
    <span ref={ref} className={className}>
      {(0).toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ───────── Marquee ───────── */
export function Marquee({ children, speed = 40, className }: { children: ReactNode; speed?: number; className?: string }) {
  return (
    <div className={cn("relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]", className)}>
      <div className="flex w-max shrink-0 items-center" style={{ animation: `si-marquee ${speed}s linear infinite` }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div aria-hidden className="flex shrink-0 items-center">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ───────── Magnetic wrapper (desktop pointer only) ───────── */
export function Magnetic({ children, strength = 0.3, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(0, { stiffness: 250, damping: 18 });
  const y = useSpring(0, { stiffness: 250, damping: 18 });
  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      className={cn("inline-block", className)}
      onPointerMove={(e) => {
        if (e.pointerType === "touch" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - r.left - r.width / 2) * strength);
        y.set((e.clientY - r.top - r.height / 2) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
