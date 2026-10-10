import { useMemo, useRef } from "react";
import { BKK_OFFSET, bkkDayStart, fmtTime, fmtWeekday, useTT } from "@/lib/tide/i18n";
import { FALL, RISE } from "@/lib/tide/colors";
import { HOUR, levelAt, MIN, type TideForecast, type TideState } from "@/lib/tide/model";

const W = 340;
const H = 340;
const TOP = 32;
const BOTTOM = 300;
/** Staff (gauge) geometry. */
const SX0 = 30;
const SX1 = 58;
/** Trend plot geometry. */
const PX0 = 112;
const PX1 = 332;
const PAST = 3 * HOUR;
const SPAN = 24 * HOUR;

/**
 * Tide staff + 24 h trend on one shared level scale, so the level line runs
 * straight from the staff into the curve. Drawn entirely in SVG — the
 * "instrument" the whole screen is built around.
 */
export function TideInstrument({
  forecast,
  state,
  tour = null,
  onPan,
  minAt,
  maxAt,
}: {
  forecast: TideForecast;
  state: TideState | null;
  /** Planned tour window, shaded on the chart and on the staff. */
  tour?: { from: number; to: number } | null;
  /** Drag sideways to move through time (omit to disable). */
  onPan?: (at: number) => void;
  minAt?: number;
  maxAt?: number;
}) {
  const { t, lang } = useTT();
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef<{ x: number; at: number; msPerPx: number } | null>(null);
  const at = state?.at ?? Date.now();
  const cur = state?.cm ?? null;

  const [lo, hi] = useMemo(() => {
    const min = Math.min(...forecast.cm);
    const max = Math.max(...forecast.cm);
    return [Math.min(0, Math.floor(min / 50) * 50), Math.max(400, Math.ceil((max + 10) / 50) * 50)];
  }, [forecast]);

  const y = (cm: number) => BOTTOM - ((cm - lo) / (hi - lo)) * (BOTTOM - TOP);
  const x = (time: number) => PX0 + ((time - (at - PAST)) / SPAN) * (PX1 - PX0);

  const curve = useMemo(() => {
    const pts: [number, number][] = [];
    const start = at - PAST;
    for (let m = 0; m <= SPAN / MIN; m += 15) {
      const time = start + m * MIN;
      const v = levelAt(forecast, time);
      if (v != null) pts.push([PX0 + (m * MIN * (PX1 - PX0)) / SPAN, y(v)]);
    }
    return pts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [forecast, Math.floor(at / MIN), lo, hi]);

  const line = curve
    .map(([px, py], i) => `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`)
    .join("");
  const area = curve.length
    ? `${line}L${curve[curve.length - 1][0].toFixed(1)},${BOTTOM}L${curve[0][0].toFixed(1)},${BOTTOM}Z`
    : "";

  const gridLevels: number[] = [];
  for (let v = Math.ceil(lo / 100) * 100; v <= hi; v += 100) gridLevels.push(v);

  const ticks: number[] = [];
  for (let v = lo; v <= hi; v += 10) ticks.push(v);

  // 3-hourly vertical grid in Bangkok local time.
  const hourTicks: number[] = [];
  {
    const step = 3 * HOUR;
    const first = Math.ceil((at - PAST + BKK_OFFSET) / step) * step - BKK_OFFSET;
    for (let tt = first; tt <= at - PAST + SPAN; tt += step) hourTicks.push(tt);
  }

  const extremes = forecast.extremes.filter((e) => e.t >= at - PAST && e.t <= at - PAST + SPAN);
  const dirColor = state ? (state.rising ? RISE : FALL) : "#9fb3c8";
  const cx = x(at);
  const cy = cur != null ? y(cur) : null;

  // Tour window: lowest/highest level inside it, for the staff highlight.
  const tourRange = useMemo(() => {
    if (!tour) return null;
    let min = Infinity;
    let max = -Infinity;
    for (let tt = tour.from; tt <= tour.to; tt += 5 * MIN) {
      const v = levelAt(forecast, tt);
      if (v == null) continue;
      min = Math.min(min, v);
      max = Math.max(max, v);
    }
    return Number.isFinite(min) ? { min, max } : null;
  }, [tour, forecast]);
  const tourX0 = tour ? Math.max(PX0, Math.min(PX1, x(tour.from))) : 0;
  const tourX1 = tour ? Math.max(PX0, Math.min(PX1, x(tour.to))) : 0;

  const dayTag = bkkDayStart(at) !== bkkDayStart(Date.now()) ? `${fmtWeekday(at, lang)} ` : "";
  const tagW = dayTag ? 58 : 38;

  const pan = (clientX: number) => {
    const d = drag.current;
    if (!d || !onPan) return;
    // Dragging left reveals the future: content follows the finger.
    let next = d.at - (clientX - d.x) * d.msPerPx;
    if (minAt != null) next = Math.max(minAt, next);
    if (maxAt != null) next = Math.min(maxAt, next);
    onPan(Math.round(next / (5 * MIN)) * 5 * MIN);
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className={`block h-full w-full select-none ${onPan ? "cursor-grab active:cursor-grabbing" : ""}`}
      style={onPan ? { touchAction: "pan-y" } : undefined}
      role="img"
      aria-label={`${t("gauge")} / ${t("trend24")}`}
      onPointerDown={(e) => {
        if (!onPan || !svgRef.current) return;
        const rect = svgRef.current.getBoundingClientRect();
        const pxPerUnit = rect.width / W;
        drag.current = { x: e.clientX, at, msPerPx: SPAN / ((PX1 - PX0) * pxPerUnit) };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (drag.current) pan(e.clientX);
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
    >
      <defs>
        <linearGradient id="ti-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#38bdf8" stopOpacity="0.95" />
          <stop offset="1" stopColor="#0c4a6e" stopOpacity="0.95" />
        </linearGradient>
        <linearGradient id="ti-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#38bdf8" stopOpacity="0.32" />
          <stop offset="1" stopColor="#38bdf8" stopOpacity="0.02" />
        </linearGradient>
        <clipPath id="ti-clip">
          <rect x={PX0} y={TOP - 4} width={PX1 - PX0} height={BOTTOM - TOP + 8} />
        </clipPath>
      </defs>

      <text x={SX0} y={9} className="tide-svg-label" textAnchor="start">
        {t("gauge")} · cm
      </text>
      <text x={PX0} y={9} className="tide-svg-label" textAnchor="start">
        {t("trend24")}
      </text>

      {/* ── Staff ── */}
      <rect
        x={SX0}
        y={TOP}
        width={SX1 - SX0}
        height={BOTTOM - TOP}
        fill="rgba(255,255,255,0.03)"
        stroke="rgba(180,205,230,0.55)"
        strokeWidth="1"
      />
      {gridLevels
        .slice(0, -1)
        .map((v, i) =>
          i % 2 === 0 ? (
            <rect
              key={v}
              x={SX0}
              y={y(Math.min(hi, v + 100))}
              width={SX1 - SX0}
              height={y(v) - y(Math.min(hi, v + 100))}
              fill="rgba(255,255,255,0.05)"
            />
          ) : null,
        )}
      {cur != null ? (
        <rect
          x={SX0 + 1}
          y={y(Math.min(cur, hi))}
          width={SX1 - SX0 - 2}
          height={Math.max(0, BOTTOM - y(Math.min(cur, hi)))}
          fill="url(#ti-water)"
        />
      ) : null}
      {tourRange ? (
        <g>
          <rect
            x={SX0 - 4}
            y={y(Math.min(tourRange.max, hi))}
            width={SX1 - SX0 + 8}
            height={Math.max(2, y(tourRange.min) - y(Math.min(tourRange.max, hi)))}
            fill="rgba(56,189,248,0.22)"
            stroke="#38bdf8"
            strokeWidth="1.2"
          />
        </g>
      ) : null}
      {ticks.map((v) => {
        const major = v % 100 === 0;
        const mid = v % 50 === 0;
        return (
          <line
            key={v}
            x1={SX1}
            x2={SX1 + (major ? 11 : mid ? 8 : 4)}
            y1={y(v)}
            y2={y(v)}
            stroke="rgba(190,212,235,0.7)"
            strokeWidth={major ? 1.2 : 0.8}
          />
        );
      })}
      {gridLevels.map((v) => (
        <text key={v} x={SX1 + 14} y={y(v) + 3.5} className="tide-svg-num" textAnchor="start">
          {v}
        </text>
      ))}

      {/* ── Trend plot ── */}
      <g clipPath="url(#ti-clip)">
        {gridLevels.map((v) => (
          <line
            key={v}
            x1={PX0}
            x2={PX1}
            y1={y(v)}
            y2={y(v)}
            stroke="rgba(150,180,210,0.16)"
            strokeWidth="1"
          />
        ))}
        {hourTicks.map((tt) => (
          <line
            key={tt}
            x1={x(tt)}
            x2={x(tt)}
            y1={TOP}
            y2={BOTTOM}
            stroke="rgba(150,180,210,0.12)"
            strokeWidth="1"
          />
        ))}
        {area ? <path d={area} fill="url(#ti-area)" /> : null}
        {line ? (
          <>
            {/* elapsed part dimmer */}
            <path d={line} fill="none" stroke="#7dd3fc" strokeWidth="2" strokeOpacity="0.9" />
            <rect
              x={PX0}
              y={TOP}
              width={Math.max(0, cx - PX0)}
              height={BOTTOM - TOP}
              fill="rgba(7,13,20,0.45)"
            />
          </>
        ) : null}
        {tour && tourX1 > tourX0 ? (
          <g>
            <rect
              x={tourX0}
              y={TOP}
              width={tourX1 - tourX0}
              height={BOTTOM - TOP}
              fill="rgba(56,189,248,0.2)"
            />
            <line x1={tourX0} x2={tourX0} y1={TOP} y2={BOTTOM} stroke="#38bdf8" strokeWidth="1.5" />
            <line
              x1={tourX1}
              x2={tourX1}
              y1={TOP}
              y2={BOTTOM}
              stroke="#38bdf8"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
          </g>
        ) : null}
        <line x1={cx} x2={cx} y1={TOP - 4} y2={BOTTOM} stroke="#f1f5f9" strokeWidth="1.2" />
      </g>
      <g>
        <rect
          x={cx - tagW / 2}
          y={TOP - 17}
          width={tagW}
          height="13"
          fill="#070d14"
          stroke="#f1f5f9"
          strokeWidth="1"
        />
        <text
          x={cx}
          y={TOP - 7}
          className="tide-svg-num"
          textAnchor="middle"
          style={{ fill: "#fff", fontWeight: 600 }}
        >
          {dayTag}
          {fmtTime(at, lang)}
        </text>
      </g>

      {extremes.map((e) => {
        const ex = x(e.t);
        const high = e.type === "high";
        const anchor = ex > PX1 - 26 ? "end" : ex < PX0 + 16 ? "start" : "middle";
        return (
          <g key={e.t}>
            <circle
              cx={ex}
              cy={y(e.cm)}
              r="3.6"
              fill="#070d14"
              stroke={high ? RISE : FALL}
              strokeWidth="1.8"
            />
            <text
              x={ex}
              y={high ? y(e.cm) - 8 : y(e.cm) + 16}
              className="tide-svg-num"
              textAnchor={anchor}
              style={{ fill: high ? RISE : FALL, fontWeight: 600 }}
            >
              {Math.round(e.cm)}
            </text>
            <text
              x={ex}
              y={high ? y(e.cm) - 18 : y(e.cm) + 26}
              className="tide-svg-num"
              textAnchor={anchor}
              fillOpacity="0.7"
            >
              {fmtTime(e.t, lang)}
            </text>
          </g>
        );
      })}

      {hourTicks.map((tt) => (
        <text key={tt} x={x(tt)} y={BOTTOM + 14} className="tide-svg-num" textAnchor="middle">
          {fmtTime(tt, lang).slice(0, 2)}
        </text>
      ))}
      <text x={PX1} y={BOTTOM + 28} className="tide-svg-label" textAnchor="end">
        UTC+7 · h
      </text>

      {/* ── Current level: pointer on the staff → line → marker on the curve ── */}
      {cy != null && cur != null ? (
        <g>
          <line
            x1={SX0 - 2}
            x2={PX1}
            y1={cy}
            y2={cy}
            stroke={dirColor}
            strokeWidth="1"
            strokeDasharray="3 3"
            strokeOpacity="0.85"
          />
          <path
            d={`M${SX0 - 4},${cy - 6}L${SX0 + 5},${cy}L${SX0 - 4},${cy + 6}Z`}
            fill={dirColor}
          />
          <circle cx={cx} cy={cy} r="5" fill={dirColor} stroke="#070d14" strokeWidth="2" />
          <rect
            x={0}
            y={cy - 8}
            width={SX0 - 6}
            height={16}
            fill="#070d14"
            stroke={dirColor}
            strokeWidth="1"
          />
          <text
            x={(SX0 - 6) / 2}
            y={cy + 4}
            className="tide-svg-num"
            textAnchor="middle"
            style={{ fill: "#fff", fontWeight: 600 }}
          >
            {Math.round(cur)}
          </text>
        </g>
      ) : null}
    </svg>
  );
}
