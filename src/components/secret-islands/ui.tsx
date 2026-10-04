import { AnimatePresence, motion } from "framer-motion";
import { Anchor, X } from "lucide-react";
import { LOGO_URL } from "./content";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const SRCSET_WIDTHS = [480, 768, 1080, 1440, 1920];

/**
 * Responsive `srcSet` for Unsplash URLs (`…&w=1200…`): the CDN resizes + serves WebP/AVIF (auto=format),
 * so phones no longer download the 1200–1800 px desktop file. Other hosts: no srcSet.
 */
/** Local images under /public/images with a pre-rendered 900 px variant (`name-900.webp`). */
const LOCAL_VARIANTS: Record<string, number> = { "/images/krabi-secret-islands-privates-speedboat.webp": 1672 };

export function unsplashSrcSet(src: string): string | undefined {
  const local = LOCAL_VARIANTS[src];
  if (local) return `${src.replace(/\.webp$/, "-900.webp")} 900w, ${src} ${local}w`;
  if (!src.startsWith("https://images.unsplash.com/")) return undefined;
  const m = /[?&]w=(\d+)/.exec(src);
  if (!m) return undefined;
  const max = Number(m[1]);
  const widths = SRCSET_WIDTHS.filter((w) => w < max);
  return [...widths, max].map((w) => `${src.replace(/([?&])w=\d+/, `$1w=${w}`)} ${w}w`).join(", ");
}

/** Remote image with a soft ocean-gradient fallback if the photo fails to load. */
export function SmartImage({
  src,
  alt,
  className,
  eager,
  priority,
  sizes = "100vw",
}: {
  src: string;
  alt: string;
  className?: string;
  eager?: boolean;
  /** LCP image: eager + fetchpriority="high". */
  priority?: boolean;
  /** `sizes` for the responsive srcSet (rendered width of the image). */
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  // An SSR-rendered <img> can fail before hydration attaches onError.
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, [src]);
  if (failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn("si-fallback", className)}
      />
    );
  }
  return (
    <img
      ref={ref}
      src={src}
      srcSet={unsplashSrcSet(src)}
      sizes={unsplashSrcSet(src) ? sizes : undefined}
      alt={alt}
      loading={eager || priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding={priority ? "sync" : "async"}
      onError={() => setFailed(true)}
      className={className}
    />
  );
}

/** Brand logo mark; falls back to an anchor tile if the image can't load. */
export function BrandMark({ className }: { className?: string }) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const img = ref.current;
    if (img && img.complete && img.naturalWidth === 0) setFailed(true);
  }, []);
  if (failed) {
    return (
      <span
        className={cn(
          "grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-si-cyan to-si-cyan-dark text-white shadow-lg shadow-si-cyan/30",
          className,
        )}
      >
        <Anchor className="size-[55%]" strokeWidth={2.2} />
      </span>
    );
  }
  return (
    <img
      ref={ref}
      src={LOGO_URL}
      alt=""
      width={40}
      height={40}
      onError={() => setFailed(true)}
      className={cn("shrink-0 object-contain", className)}
    />
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.92-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.27.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.75-.72 2-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35ZM12.04 21.5h-.01a9.4 9.4 0 0 1-4.8-1.32l-.34-.2-3.56.93.95-3.47-.22-.36a9.4 9.4 0 0 1-1.44-5.02c0-5.2 4.23-9.43 9.43-9.43a9.43 9.43 0 0 1 9.43 9.44c0 5.2-4.23 9.43-9.44 9.43Zm8.02-17.45A11.27 11.27 0 0 0 12.04.75C5.8.75.72 5.83.72 12.07c0 2 .52 3.94 1.51 5.65L.62 23.25l5.67-1.49a11.3 11.3 0 0 0 5.75 1.47c6.24 0 11.32-5.08 11.32-11.32 0-3.02-1.18-5.87-3.3-8Z" />
    </svg>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  dark,
  center,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
  dark?: boolean;
  center?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn("mb-8 max-w-2xl", center && "mx-auto text-center")}
    >
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-si-cyan">{eyebrow}</p>
      <h2
        className={cn(
          "text-[1.75rem] font-extrabold leading-tight sm:text-4xl",
          dark ? "text-white" : "text-si-navy",
        )}
      >
        {title}
      </h2>
      {sub ? (
        <p className={cn("mt-3 text-base leading-relaxed", dark ? "text-slate-300" : "text-si-slate")}>{sub}</p>
      ) : null}
    </motion.div>
  );
}

export function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function useLockScroll(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}

/** Bottom sheet on mobile, centered dialog on desktop. */
export function Sheet({
  open,
  onClose,
  label,
  children,
  className,
  closeLabel = "Close",
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  className?: string;
  closeLabel?: string;
}) {
  useLockScroll(open);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label={closeLabel}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={label}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={cn(
              "si-glass-strong relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[2rem] text-white sm:max-w-xl sm:rounded-[2rem]",
              className,
            )}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="si-glass absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-full text-white"
            >
              <X className="size-5" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export function useLockBody(active: boolean) {
  useLockScroll(active);
}
