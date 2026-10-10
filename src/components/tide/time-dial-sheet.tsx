import { motion } from "motion/react";
import { ArrowDown, ArrowUp, Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { frameIndexFor } from "@/lib/tide/frames";
import {
  bkkDayStart,
  fmtDateNum,
  fmtDuration,
  fmtHour,
  fmtSigned,
  fmtTime,
  fmtWeekday,
  uses12h,
  useTT,
} from "@/lib/tide/i18n";
import { HOUR, levelAt, MIN, tideStateAt, type TideForecast } from "@/lib/tide/model";
import { useTideView } from "@/lib/tide/store";
import { FALL, RISE } from "@/lib/tide/colors";
import { preloadFrame } from "./tide-background";

const DAY = 24 * HOUR;
const STEP = 5 * MIN;
const SIZE = 236;
const C = SIZE / 2;
const R = 92;
const RING_W = 20;
const SEGMENTS = 96;

/** Low water = sand, high water = lagoon cyan. */
const LOW_RGB = [214, 160, 96];
const HIGH_RGB = [103, 232, 249];
function levelColor(frac: number): string {
  const f = Math.min(1, Math.max(0, frac));
  const c = LOW_RGB.map((lo, i) => Math.round(lo + (HIGH_RGB[i] - lo) * f));
  return `rgb(${c[0]} ${c[1]} ${c[2]})`;
}

/** Clockwise angle from 12 o'clock (radians) → point on a circle. */
function polar(angle: number, r: number) {
  return { x: C + r * Math.sin(angle), y: C - r * Math.cos(angle) };
}

function arc(a0: number, a1: number, r: number) {
  const p0 = polar(a0, r);
  const p1 = polar(a1, r);
  return `M${p0.x.toFixed(2)},${p0.y.toFixed(2)}A${r},${r} 0 0 1 ${p1.x.toFixed(2)},${p1.y.toFixed(2)}`;
}

const minuteToAngle = (m: number) => (m / 1440) * 2 * Math.PI;

/**
 * "Drehrad": one full turn of the dial = 24 hours. Turning past midnight rolls
 * into the next day, so a captain can spin forward through the whole week.
 * The chosen time drives the background illustration and the header readout.
 */
export function TimeDialSheet({
  forecast,
  now,
  onClose,
}: {
  forecast: TideForecast;
  now: number;
  onClose: () => void;
}) {
  const { t, lang } = useTT();
  const setPreviewAt = useTideView((s) => s.setPreviewAt);
  const today = bkkDayStart(now);
  const minT = today;
  const maxT = Math.min(forecast.t[forecast.t.length - 1] - STEP, today + 7 * DAY - STEP);
  const clamp = (x: number) => Math.min(maxT, Math.max(minT, x));
  const [at, setAt] = useState(() => clamp(Math.ceil((now + 30 * MIN) / (15 * MIN)) * 15 * MIN));
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const lastHour = useRef<number | null>(null);

  useEffect(() => {
    setPreviewAt(at);
    const v = levelAt(forecast, at);
    if (v != null) {
      const i = frameIndexFor(v);
      void preloadFrame(i - 1);
      void preloadFrame(i + 1);
    }
  }, [at, forecast, setPreviewAt]);

  useEffect(() => () => setPreviewAt(null), [setPreviewAt]);

  const day = bkkDayStart(at);
  const minuteOfDay = Math.round((at - day) / MIN);

  const [lo, hi] = useMemo(() => [Math.min(...forecast.cm), Math.max(...forecast.cm)], [forecast]);

  const ring = useMemo(() => {
    const segs: { d: string; color: string }[] = [];
    const span = (2 * Math.PI) / SEGMENTS;
    for (let i = 0; i < SEGMENTS; i++) {
      const v = levelAt(forecast, day + (i + 0.5) * (DAY / SEGMENTS));
      segs.push({
        d: arc(i * span, (i + 1) * span + 0.004, R),
        color: v == null ? "rgba(255,255,255,0.08)" : levelColor((v - lo) / (hi - lo || 1)),
      });
    }
    return segs;
  }, [forecast, day, lo, hi]);

  const dayExtremes = forecast.extremes.filter((e) => e.t >= day && e.t < day + DAY);
  const state = tideStateAt(forecast, at);
  const nowLevel = levelAt(forecast, now);

  const commit = (next: number) => {
    const snapped = clamp(Math.round(next / STEP) * STEP);
    const h = Math.floor(snapped / HOUR);
    if (lastHour.current != null && h !== lastHour.current) navigator.vibrate?.(6);
    lastHour.current = h;
    setAt(snapped);
  };

  const fromPointer = (clientX: number, clientY: number, unwrap: boolean) => {
    const el = svgRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const dx = clientX - (r.left + r.width / 2);
    const dy = clientY - (r.top + r.height / 2);
    let a = Math.atan2(dx, -dy);
    if (a < 0) a += 2 * Math.PI;
    const m = (a / (2 * Math.PI)) * 1440;
    // Unwrap across midnight: a jump of more than half a turn means we crossed 00:00.
    // A tap jumps within the shown day; only a continuous drag rolls over.
    let d = day;
    const delta = m - minuteOfDay;
    if (unwrap && delta < -720) d += DAY;
    else if (unwrap && delta > 720) d -= DAY;
    commit(d + m * MIN);
  };

  const knob = polar(minuteToAngle(minuteOfDay), R);
  const nowOnDial =
    now >= day && now < day + DAY ? polar(minuteToAngle((now - day) / MIN), R) : null;
  const days = Array.from({ length: 7 }, (_, i) => today + i * DAY).filter((d) => d <= maxT);
  const dirColor = state ? (state.rising ? RISE : FALL) : "#fff";
  const diffFromNow = state && nowLevel != null ? state.cm - nowLevel : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="tide-glass rounded px-4 pb-3 pt-3"
    >
      <div className="flex items-center justify-between">
        <div className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-cyan-200">
          {t("pickTime")}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="grid size-9 place-items-center rounded bg-white/12 active:scale-95"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="hide-scroll -mx-1 mt-1 flex gap-1.5 overflow-x-auto px-1">
        {days.map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => commit(d + minuteOfDay * MIN)}
            className={`min-w-[46px] shrink-0 rounded px-2 py-1 text-center ${
              d === day ? "bg-cyan-300 text-[#04131f]" : "bg-white/8 text-white/80"
            }`}
          >
            <div className="text-[10.5px] font-bold uppercase">
              {d === today ? t("today") : fmtWeekday(d, lang)}
            </div>
            <div className="tide-digits text-[10.5px] opacity-75">{fmtDateNum(d, lang)}</div>
          </button>
        ))}
      </div>

      <div className="mt-1 flex items-center justify-center gap-1">
        <StepButton label="−15 min" onClick={() => commit(at - 15 * MIN)}>
          <Minus className="size-4" />
        </StepButton>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="size-[min(212px,54vw)] shrink-0 touch-none select-none rounded-full outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          role="slider"
          tabIndex={0}
          aria-label={t("pickTime")}
          aria-valuemin={minT}
          aria-valuemax={maxT}
          aria-valuenow={at}
          aria-valuetext={`${fmtWeekday(at, lang)} ${fmtTime(at, lang)}`}
          onPointerDown={(e) => {
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            fromPointer(e.clientX, e.clientY, false);
          }}
          onPointerMove={(e) => {
            if (dragging.current) fromPointer(e.clientX, e.clientY, true);
          }}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          onKeyDown={(e) => {
            const step = e.shiftKey ? HOUR : STEP;
            if (e.key === "ArrowRight" || e.key === "ArrowUp") commit(at + step);
            else if (e.key === "ArrowLeft" || e.key === "ArrowDown") commit(at - step);
            else return;
            e.preventDefault();
          }}
        >
          <circle cx={C} cy={C} r={R + RING_W / 2 + 10} fill="rgba(2,14,30,0.55)" />
          {ring.map((s, i) => (
            <path key={i} d={s.d} stroke={s.color} strokeWidth={RING_W} fill="none" />
          ))}
          {Array.from({ length: 24 }, (_, h) => {
            const a = minuteToAngle(h * 60);
            const major = h % 6 === 0;
            const p0 = polar(a, R + RING_W / 2 + 2);
            const p1 = polar(a, R + RING_W / 2 + (major ? 9 : 5));
            return (
              <line
                key={h}
                x1={p0.x}
                y1={p0.y}
                x2={p1.x}
                y2={p1.y}
                stroke="rgba(255,255,255,0.55)"
                strokeWidth={major ? 2 : 1}
              />
            );
          })}
          {[0, 6, 12, 18].map((h) => {
            const p = polar(minuteToAngle(h * 60), R - RING_W / 2 - 11);
            return (
              <text
                key={h}
                x={p.x}
                y={p.y + 3.5}
                textAnchor="middle"
                fontSize="10"
                fontWeight="600"
                fill="rgba(255,255,255,0.6)"
              >
                {fmtHour(day + h * HOUR, lang)}
              </text>
            );
          })}
          {dayExtremes.map((e) => {
            const p = polar(minuteToAngle((e.t - day) / MIN), R);
            return (
              <circle
                key={e.t}
                cx={p.x}
                cy={p.y}
                r={4}
                fill={e.type === "high" ? "#ecfeff" : "#3b2a14"}
                stroke={e.type === "high" ? "#0e7490" : "#fdba74"}
                strokeWidth={2}
              />
            );
          })}
          {nowOnDial ? <circle cx={nowOnDial.x} cy={nowOnDial.y} r={3} fill="#fde68a" /> : null}
          <line
            x1={C}
            y1={C}
            x2={knob.x}
            y2={knob.y}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={1.5}
          />
          <circle cx={knob.x} cy={knob.y} r={15} fill="#fff" opacity={0.18} />
          <circle cx={knob.x} cy={knob.y} r={11} fill="#fff" stroke="#22d3ee" strokeWidth={3.5} />

          <text
            x={C}
            y={C - 24}
            textAnchor="middle"
            fontSize="11"
            fontWeight="700"
            letterSpacing="1.5"
            fill="rgba(165,243,252,0.95)"
          >
            {`${fmtWeekday(at, lang).toUpperCase()} ${fmtDateNum(at, lang)}`}
          </text>
          <text
            x={C}
            y={C + 8}
            textAnchor="middle"
            fontSize={uses12h(lang) ? 26 : 34}
            fontWeight="700"
            fill="#fff"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {fmtTime(at, lang)}
          </text>
          <text x={C} y={C + 30} textAnchor="middle" fontSize="15" fontWeight="700" fill={dirColor}>
            {state ? `${state.rising ? "↑" : "↓"} ${Math.round(state.cm)} cm` : "—"}
          </text>
        </svg>

        <StepButton label="+15 min" onClick={() => commit(at + 15 * MIN)}>
          <Plus className="size-4" />
        </StepButton>
      </div>

      {state ? (
        <div className="mt-1 grid grid-cols-2 gap-2 text-[12px] leading-snug">
          <div className="rounded bg-white/7 px-3 py-2">
            <div className="flex items-center gap-1 font-bold" style={{ color: dirColor }}>
              {state.rising ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
              {state.rising ? t("rising") : t("falling")}
            </div>
            <div className="mt-0.5 text-white/75">
              {diffFromNow != null ? `${fmtSigned(diffFromNow)} cm ${t("vsNow")}` : ""}
            </div>
            <div className="tide-digits text-white/55">
              {at >= now
                ? `${t("in")} ${fmtDuration(at - now, lang)}`
                : `${fmtDuration(now - at, lang)} ${t("ago")}`}
            </div>
          </div>
          <div className="rounded bg-white/7 px-3 py-2">
            <div className="text-white/60">{t("thenNext")}</div>
            <div className="font-bold">
              {state.next.type === "high" ? t("highAt") : t("lowAt")}{" "}
              <span className="tide-digits">{fmtTime(state.next.t, lang)}</span>
            </div>
            <div className="tide-digits text-white/75">
              {Math.round(state.next.cm)} cm · {fmtSigned(state.toNext)} cm
            </div>
          </div>
        </div>
      ) : (
        <p className="mt-1 text-center text-[12px] text-white/60">{t("noData")}</p>
      )}
      <p className="mt-1.5 text-center text-[10.5px] text-white/50">{t("dialHint")}</p>
    </motion.div>
  );
}

function StepButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-11 shrink-0 flex-col items-center justify-center rounded bg-white/10 text-[8.5px] font-bold active:scale-90"
    >
      {children}
      15′
    </button>
  );
}
