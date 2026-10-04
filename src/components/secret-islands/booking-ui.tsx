import { animate, motion, useReducedMotion } from "framer-motion";
import { Check, Minus, Plus } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { AddOn } from "./booking-data";
import { formatTHB, useTx } from "./store";

/** Tweened THB amount (writes the DOM directly, no re-render per frame). */
export function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  const reduce = useReducedMotion();
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = prev.current;
    prev.current = value;
    if (reduce || from === value) {
      el.textContent = formatTHB(value);
      return;
    }
    const controls = animate(from, value, {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        el.textContent = formatTHB(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value, reduce]);
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {formatTHB(value)}
    </span>
  );
}

export function Stepper({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const { t } = useTx();
  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label={t({ de: "Weniger", en: "Fewer" })}
        className="si-glass grid size-12 place-items-center rounded-2xl text-white transition hover:bg-white/15 disabled:opacity-30"
      >
        <Minus className="size-5" />
      </button>
      <motion.output
        key={value}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        aria-live="polite"
        className="w-10 text-center text-2xl font-extrabold tabular-nums text-white"
      >
        {value}
      </motion.output>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label={t({ de: "Mehr", en: "More" })}
        className="grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-si-cyan to-cyan-300 text-si-navy shadow-[0_8px_30px_-10px_rgb(6_182_212/0.9)] transition active:scale-95 disabled:opacity-30"
      >
        <Plus className="size-5" />
      </button>
    </div>
  );
}

/** Selectable glass chip (filters, occasions, islands). */
export function Chip({
  active,
  onClick,
  children,
  disabled,
  className,
  ariaLabel,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-label={ariaLabel}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition",
        active
          ? "border-si-cyan/70 bg-si-cyan/20 text-white shadow-[0_0_24px_-6px_rgb(6_182_212/0.8)]"
          : "border-white/12 bg-white/5 text-slate-300 hover:border-white/25 hover:text-white",
        disabled && "cursor-not-allowed opacity-40",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function CheckDot({ on, className }: { on: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-6 shrink-0 place-items-center rounded-full border transition",
        on ? "border-si-cyan bg-si-cyan text-si-navy" : "border-white/25 bg-white/5 text-transparent",
        className,
      )}
    >
      <Check className="size-3.5" strokeWidth={3} />
    </span>
  );
}

/** Rich multi-select card for food / drinks / extras. */
export function AddOnCard({
  item,
  on,
  guests,
  onToggle,
  recommended,
}: {
  item: AddOn;
  on: boolean;
  guests: number;
  onToggle: () => void;
  /** Highlight text, e.g. "Empfohlen für Angeltouren". */
  recommended?: string | null;
}) {
  const { t } = useTx();
  const amount = item.per === "person" ? item.price * guests : item.price;
  return (
    <motion.button
      type="button"
      layout
      onClick={onToggle}
      aria-pressed={on}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "group relative flex w-full items-start gap-3 overflow-hidden rounded-2xl border p-3.5 text-left transition sm:p-4",
        on
          ? "border-si-cyan/60 bg-gradient-to-br from-si-cyan/20 to-si-cyan/5 shadow-[0_10px_40px_-18px_rgb(6_182_212/0.9)]"
          : recommended
            ? "border-si-gold/50 bg-gradient-to-br from-si-gold/15 to-transparent hover:border-si-gold/70"
            : "border-white/10 bg-white/[0.04] hover:border-white/20 hover:bg-white/[0.07]",
        recommended && "pt-9 sm:pt-9",
      )}
    >
      {recommended ? (
        <span className="absolute inset-x-0 top-0 flex items-center gap-1.5 bg-gradient-to-r from-si-gold/30 to-transparent px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-200">
          <span aria-hidden>★</span>
          {recommended}
        </span>
      ) : null}
      <span
        aria-hidden
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-xl text-2xl transition",
          on ? "bg-si-cyan/25" : "bg-white/5 group-hover:scale-105",
        )}
      >
        {item.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="font-bold leading-snug text-white">{t(item.label)}</span>
          {item.tag ? (
            <span className="rounded-full bg-si-gold/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-300">
              {t(item.tag)}
            </span>
          ) : null}
        </span>
        <span className="mt-0.5 block text-[13px] leading-snug text-slate-400">{t(item.desc)}</span>
        <span className="mt-2 flex flex-wrap items-baseline gap-x-2 text-sm">
          <span className="font-bold text-cyan-300">{formatTHB(item.price)}</span>
          <span className="text-xs text-slate-400">
            {item.per === "person" ? t({ de: "pro Person", en: "per person" }) : t({ de: "pro Boot", en: "per boat" })}
          </span>
          {on && item.per === "person" ? (
            <span className="text-xs font-semibold text-white/80">= {formatTHB(amount)}</span>
          ) : null}
        </span>
      </span>
      <CheckDot on={on} className="mt-0.5" />
    </motion.button>
  );
}

export function SectionHead({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="mb-3 flex items-end justify-between gap-3">
      <div className="min-w-0">
        <h3 className="text-lg font-extrabold text-white sm:text-xl">{title}</h3>
        {sub ? <p className="mt-0.5 text-sm text-slate-400">{sub}</p> : null}
      </div>
      {right}
    </div>
  );
}

export function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-slate-200">{label}</span>
      {children}
      {error ? (
        <motion.span
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1.5 block text-xs font-semibold text-rose-300"
          role="alert"
        >
          {error}
        </motion.span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-slate-500">{hint}</span>
      ) : null}
    </label>
  );
}

export const inputCls =
  "w-full min-h-12 rounded-2xl border border-white/12 bg-white/[0.06] px-4 text-base text-white placeholder:text-slate-500 outline-none transition focus:border-si-cyan/70 focus:bg-white/[0.09] focus:ring-4 focus:ring-si-cyan/15";
