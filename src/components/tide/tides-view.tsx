import { ArrowDown, ArrowUp, RotateCcw } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { HOUR, levelAt, MIN, type TideForecast, type TideState } from "@/lib/tide/model";
import { bkkDayStart, fmtDateNum, fmtTime, fmtWeekday, useTT } from "@/lib/tide/i18n";
import { useTideView } from "@/lib/tide/store";
import { FALL, RISE } from "./now-view";

const DAY = 24 * HOUR;
const Y_AXIS_W = 38;
const MARGIN_R = 10;

export function TidesView({
  forecast,
  state,
  now,
}: {
  forecast: TideForecast;
  state: TideState | null;
  now: number;
}) {
  const { t, lang } = useTT();
  const previewAt = useTideView((s) => s.previewAt);
  const setPreviewAt = useTideView((s) => s.setPreviewAt);
  const today = bkkDayStart(now);
  const [day, setDay] = useState(today);
  const plotRef = useRef<HTMLDivElement>(null);

  const days = useMemo(() => {
    const end = forecast.t[forecast.t.length - 1];
    return Array.from({ length: 7 }, (_, i) => today + i * DAY).filter((d) => d < end);
  }, [forecast, today]);

  const data = useMemo(() => {
    const pts: { t: number; cm: number }[] = [];
    for (let x = day; x <= day + DAY; x += 15 * MIN) {
      const v = levelAt(forecast, x);
      if (v != null) pts.push({ t: x, cm: Math.round(v * 10) / 10 });
    }
    return pts;
  }, [forecast, day]);

  const [yLo, yHi] = useMemo(() => {
    const lo = Math.min(...forecast.cm);
    const hi = Math.max(...forecast.cm);
    return [Math.floor((lo - 20) / 100) * 100, Math.ceil((hi + 20) / 100) * 100];
  }, [forecast]);

  const dayEx = forecast.extremes.filter((e) => e.t >= day && e.t < day + DAY);
  const hourly = data.filter((p) => (p.t - day) % HOUR === 0 && p.t < day + DAY);

  const selectFromPointer = (clientX: number) => {
    const el = plotRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const w = r.width - Y_AXIS_W - MARGIN_R;
    const frac = Math.min(1, Math.max(0, (clientX - r.left - Y_AXIS_W) / w));
    const x = day + Math.round((frac * DAY) / (5 * MIN)) * 5 * MIN;
    setPreviewAt(x);
  };

  const shownAt = previewAt ?? now;
  const selInDay = previewAt != null && previewAt >= day && previewAt <= day + DAY;
  const nowInDay = now >= day && now <= day + DAY;
  const dirColor = state ? (state.rising ? RISE : FALL) : "#fff";

  return (
    <div className="space-y-3">
      <section className="tide-glass rounded-[26px] p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="text-[10.5px] font-bold uppercase tracking-[0.2em] text-cyan-200">
              {previewAt != null
                ? `${fmtWeekday(shownAt, lang)} ${fmtTime(shownAt, lang)}`
                : t("now")}
            </div>
            <div className="tide-digits text-[44px] font-bold leading-none">
              {state ? Math.round(state.cm) : "—"}
              <span className="ml-1 text-[18px] font-semibold text-cyan-100">cm</span>
            </div>
          </div>
          {state ? (
            <div
              className="flex items-center gap-1 pb-1 text-[13px] font-bold"
              style={{ color: dirColor }}
            >
              {state.rising ? <ArrowUp className="size-5" /> : <ArrowDown className="size-5" />}
              {state.rising ? t("rising") : t("falling")}
            </div>
          ) : null}
        </div>

        <div className="hide-scroll -mx-1 mt-4 flex gap-1.5 overflow-x-auto px-1">
          {days.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDay(d);
                setPreviewAt(null);
              }}
              className={`min-w-[52px] shrink-0 rounded-2xl px-2.5 py-2 text-center transition ${
                d === day ? "bg-cyan-300 text-[#032036]" : "bg-white/8 text-white/85"
              }`}
            >
              <div className="text-[11px] font-bold uppercase">
                {d === today ? t("today") : fmtWeekday(d, lang)}
              </div>
              <div className="tide-digits text-[12px] opacity-80">{fmtDateNum(d, lang)}</div>
            </button>
          ))}
        </div>

        <div
          ref={plotRef}
          className="relative mt-3 h-[210px] touch-pan-y select-none"
          onPointerDown={(e) => {
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            selectFromPointer(e.clientX);
          }}
          onPointerMove={(e) => {
            if (e.buttons || e.pointerType === "mouse") selectFromPointer(e.clientX);
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 18, right: MARGIN_R, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="tide-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#22d3ee" stopOpacity={0.6} />
                  <stop offset="1" stopColor="#0e7490" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
              <XAxis
                dataKey="t"
                type="number"
                domain={[day, day + DAY]}
                ticks={[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => day + h * HOUR)}
                tickFormatter={(v: number) => fmtTime(v, lang).slice(0, 2)}
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                width={Y_AXIS_W}
                domain={[yLo, yHi]}
                tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                ticks={Array.from(
                  { length: Math.floor((yHi - yLo) / 100) + 1 },
                  (_, i) => yLo + i * 100,
                )}
              />
              <Area
                type="monotone"
                dataKey="cm"
                stroke="#a5f3fc"
                strokeWidth={2.2}
                fill="url(#tide-area)"
                isAnimationActive={false}
                dot={false}
                activeDot={false}
              />
              {nowInDay ? (
                <ReferenceLine
                  x={now}
                  stroke="#fde68a"
                  strokeDasharray="3 3"
                  label={{ value: t("now"), fill: "#fde68a", fontSize: 10, position: "top" }}
                />
              ) : null}
              {selInDay ? <ReferenceLine x={previewAt} stroke="#fff" strokeWidth={2} /> : null}
              {dayEx.map((e) => (
                <ReferenceDot
                  key={e.t}
                  x={e.t}
                  y={e.cm}
                  r={4.5}
                  fill={e.type === "high" ? RISE : FALL}
                  stroke="#031123"
                  strokeWidth={2}
                  label={{
                    value: `${Math.round(e.cm)}`,
                    fill: "#fff",
                    fontSize: 10,
                    position: e.type === "high" ? "top" : "bottom",
                  }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <p className="text-[11px] text-white/60">{t("tapChart")}</p>
          {previewAt != null ? (
            <button
              type="button"
              onClick={() => setPreviewAt(null)}
              className="flex shrink-0 items-center gap-1 rounded-full bg-white/12 px-3 py-1.5 text-[11px] font-semibold"
            >
              <RotateCcw className="size-3.5" />
              {t("backToNow")}
            </button>
          ) : null}
        </div>
      </section>

      <section className="tide-glass rounded-[26px] p-4">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200">
          {t("extremes")}
        </h3>
        <ul className="mt-2 divide-y divide-white/10">
          {dayEx.map((e) => (
            <li key={e.t}>
              <button
                type="button"
                onClick={() => setPreviewAt(e.t)}
                className="flex w-full items-center gap-3 py-2.5 text-left"
              >
                <span
                  className="grid size-8 place-items-center rounded-full"
                  style={{
                    background: `${e.type === "high" ? RISE : FALL}26`,
                    color: e.type === "high" ? RISE : FALL,
                  }}
                >
                  {e.type === "high" ? (
                    <ArrowUp className="size-4" />
                  ) : (
                    <ArrowDown className="size-4" />
                  )}
                </span>
                <span className="flex-1 text-[14px] font-semibold">
                  {e.type === "high" ? t("highAt") : t("lowAt")}
                </span>
                <span className="tide-digits text-[15px] font-semibold">{fmtTime(e.t, lang)}</span>
                <span className="tide-digits w-16 text-right text-[15px] text-white/80">
                  {Math.round(e.cm)} cm
                </span>
              </button>
            </li>
          ))}
          {dayEx.length === 0 ? <li className="py-2 text-sm text-white/60">—</li> : null}
        </ul>
      </section>

      <section className="tide-glass rounded-[26px] p-4">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200">
          {t("hourly")}
        </h3>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {hourly.map((p) => {
            const sel = previewAt != null && Math.abs(previewAt - p.t) < 30 * MIN;
            return (
              <button
                key={p.t}
                type="button"
                onClick={() => setPreviewAt(p.t)}
                className={`rounded-xl px-1 py-1.5 text-center ${sel ? "bg-cyan-300 text-[#032036]" : "bg-white/6"}`}
              >
                <div className="tide-digits text-[10.5px] opacity-75">{fmtTime(p.t, lang)}</div>
                <div className="tide-digits text-[13.5px] font-semibold">{Math.round(p.cm)}</div>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
