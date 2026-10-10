import { motion } from "motion/react";
import { Pause, Play, RotateCcw, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { HOUR, levelAt, MIN, type TideForecast } from "@/lib/tide/model";
import { fmtTime, fmtWeekday, useTT } from "@/lib/tide/i18n";
import { useTideView } from "@/lib/tide/store";
import { preloadFrame } from "./tide-background";
import { frameIndexFor } from "@/lib/tide/frames";

const SPAN_MIN = 24 * 60;
/** Real seconds the full 24 h time-lapse takes. */
const PLAY_SECONDS = 16;

export function SimulateSheet({
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
  const [start] = useState(() => Math.floor(now / MIN) * MIN);
  const [offset, setOffset] = useState(0);
  const [playing, setPlaying] = useState(false);
  const raf = useRef<number | null>(null);

  const at = start + offset * MIN;

  useEffect(() => {
    setPreviewAt(at);
  }, [at, setPreviewAt]);

  useEffect(() => () => setPreviewAt(null), [setPreviewAt]);

  const samples = useMemo(() => {
    const pts: { x: number; v: number }[] = [];
    for (let m = 0; m <= SPAN_MIN; m += 10) {
      const v = levelAt(forecast, start + m * MIN);
      if (v != null) pts.push({ x: m, v });
    }
    return pts;
  }, [forecast, start]);

  // Warm every frame the next 24 h will pass through so playback never stalls.
  useEffect(() => {
    const seen = new Set<number>();
    for (const p of samples) seen.add(frameIndexFor(p.v));
    for (const i of seen) void preloadFrame(i);
  }, [samples]);

  useEffect(() => {
    if (!playing) return;
    let last = performance.now();
    const tick = (ts: number) => {
      const dt = (ts - last) / 1000;
      last = ts;
      let stop = false;
      setOffset((o) => {
        const n = o + (dt * SPAN_MIN) / PLAY_SECONDS;
        if (n >= SPAN_MIN) {
          stop = true;
          return SPAN_MIN;
        }
        return n;
      });
      if (stop) setPlaying(false);
      else raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, [playing]);

  const lo = samples.length ? Math.min(...samples.map((p) => p.v)) : 0;
  const hi = samples.length ? Math.max(...samples.map((p) => p.v)) : 1;
  const W = 320;
  const H = 70;
  const y = (v: number) => H - 6 - ((v - lo) / Math.max(1, hi - lo)) * (H - 14);
  const x = (m: number) => (m / SPAN_MIN) * W;
  const path = samples
    .map((p, i) => `${i ? "L" : "M"}${x(p.x).toFixed(1)},${y(p.v).toFixed(1)}`)
    .join("");
  const area = `${path}L${W},${H}L0,${H}Z`;
  const ex = forecast.extremes.filter((e) => e.t >= start && e.t <= start + SPAN_MIN * MIN);
  const cur = levelAt(forecast, at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 60 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="tide-glass rounded-[28px] px-4 pb-3 pt-3.5"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-cyan-200">
            {t("simulation")} · 24 h
          </div>
          <div className="tide-digits text-[30px] font-bold leading-tight">
            {fmtWeekday(at, lang)} {fmtTime(at, lang)}
            <span className="ml-2 text-[15px] font-semibold text-white/70">
              {cur != null ? `${Math.round(cur)} cm` : ""}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="grid size-10 place-items-center rounded-full bg-white/12 active:scale-95"
        >
          <X className="size-5" />
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="mt-1 h-[70px] w-full" preserveAspectRatio="none">
        <defs>
          <linearGradient id="sim-a" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#22d3ee" stopOpacity="0.55" />
            <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#sim-a)" />
        <path
          d={path}
          fill="none"
          stroke="#a5f3fc"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
        {ex.map((e) => (
          <circle
            key={e.t}
            cx={x((e.t - start) / MIN)}
            cy={y(e.cm)}
            r="3.5"
            fill={e.type === "high" ? "#5eead4" : "#fdba74"}
            stroke="#031123"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <line
          x1={x(offset)}
          x2={x(offset)}
          y1="0"
          y2={H}
          stroke="#fff"
          strokeWidth="2"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex justify-between text-[10px] tide-digits text-white/55">
        {[0, 6, 12, 18, 24].map((h) => (
          <span key={h}>{fmtTime(start + h * HOUR, lang)}</span>
        ))}
      </div>

      <input
        type="range"
        min={0}
        max={SPAN_MIN}
        step={5}
        value={Math.round(offset)}
        onChange={(e) => {
          setPlaying(false);
          setOffset(Number(e.target.value));
        }}
        aria-label={t("simulation")}
        className="tide-range"
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (offset >= SPAN_MIN) setOffset(0);
            setPlaying((p) => !p);
          }}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-cyan-400 text-[13px] font-bold uppercase tracking-wider text-[#032036] active:scale-[0.98]"
        >
          {playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          {playing ? t("pause") : t("play")}
        </button>
        <button
          type="button"
          onClick={() => {
            setPlaying(false);
            setOffset(0);
          }}
          className="flex h-11 items-center gap-2 rounded-full bg-white/12 px-4 text-[12px] font-semibold active:scale-[0.98]"
        >
          <RotateCcw className="size-4" />
          {t("now")}
        </button>
      </div>
    </motion.div>
  );
}
