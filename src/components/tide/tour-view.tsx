import { ArrowDown, ArrowUp, Minus, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { FALL, RISE } from "@/lib/tide/colors";
import { harmonicForecast, horizonEnd } from "@/lib/tide/harmonic";
import {
  BKK_OFFSET,
  bkkDayStart,
  fill,
  fmtDay,
  fmtDuration,
  fmtSigned,
  fmtTime,
  useTT,
} from "@/lib/tide/i18n";
import type { TideLocation } from "@/lib/tide/locations";
import { HOUR, MIN, tideStateAt, tourStats } from "@/lib/tide/model";
import { useTideSettings } from "@/lib/tide/store";
import { TideInstrument } from "./tide-instrument";

const STEP = 30;
const MAX_MIN = 12 * 60;
const CHIPS = [1, 2, 3, 4, 6, 8];

const isoDay = (t: number) => new Date(t + BKK_OFFSET).toISOString().slice(0, 10);
const isoTime = (t: number) => new Date(t + BKK_OFFSET).toISOString().slice(11, 16);
const fromParts = (day: string, time: string) => {
  const [y, m, d] = day.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  return Date.UTC(y, m - 1, d, hh, mm) - BKK_OFFSET;
};

/**
 * Tour planner: day + start time + duration → the level picture for that
 * window. The chart can be dragged sideways to slide the start.
 */
export function TourView({ location, now }: { location: TideLocation; now: number }) {
  const { t, lang } = useTT();
  const boat = useTideSettings((s) => s.boat);
  const today = bkkDayStart(now);
  const lastStart = horizonEnd(now) - MAX_MIN * MIN;
  // Never plan a start in the past.
  const earliest = Math.ceil(now / (5 * MIN)) * 5 * MIN;
  const clampStart = (v: number) => Math.min(lastStart, Math.max(earliest, v));
  const [start, setStart] = useState(() => Math.ceil((now + HOUR) / (30 * MIN)) * 30 * MIN);
  const [dur, setDur] = useState(180);
  const end = start + dur * MIN;

  // Chart window is start-3h … start+21h; the state at the end needs the next extreme.
  const forecast = useMemo(
    () => harmonicForecast(location, start - 4 * HOUR, start + 27 * HOUR),
    [location, start],
  );
  const stats = useMemo(() => tourStats(forecast, start, end), [forecast, start, end]);
  const startState = useMemo(() => tideStateAt(forecast, start), [forecast, start]);

  const setDuration = (m: number) => setDur(Math.min(MAX_MIN, Math.max(STEP, m)));
  const dirColor = (rising: boolean) => (rising ? RISE : FALL);
  const need = boat.draft != null ? boat.draft + boat.reserve : null;

  return (
    <div className="space-y-3">
      {/* ── Inputs ── */}
      <section className="tide-panel tide-bracket p-3">
        <div className="grid min-w-0 grid-cols-2 gap-2.5">
          <Field label={t("tourDay")}>
            <input
              type="date"
              className="tide-input tide-digits min-h-12 text-[16px]"
              min={isoDay(today)}
              max={isoDay(lastStart)}
              value={isoDay(start)}
              onChange={(e) =>
                e.target.value && setStart(clampStart(fromParts(e.target.value, isoTime(start))))
              }
            />
          </Field>
          <Field label={t("tourTime")}>
            <input
              type="time"
              step={300}
              className="tide-input tide-digits min-h-12 text-[16px]"
              value={isoTime(start)}
              onChange={(e) =>
                e.target.value && setStart(clampStart(fromParts(isoDay(start), e.target.value)))
              }
            />
          </Field>
        </div>

        <div className="mt-3">
          <div className="tide-label mb-1 text-[10.5px] uppercase tracking-wider text-white/55">
            {t("tourDuration")}
          </div>
          <div className="flex items-center gap-2">
            <Round label="−30 min" onClick={() => setDuration(dur - STEP)}>
              <Minus className="size-5" />
            </Round>
            <div className="tide-digits flex-1 text-center text-[22px] font-medium">
              {fmtDuration(dur * MIN, lang)}
            </div>
            <Round label="+30 min" onClick={() => setDuration(dur + STEP)}>
              <Plus className="size-5" />
            </Round>
          </div>
          <div className="mt-2 grid grid-cols-6 gap-1.5">
            {CHIPS.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => setDuration(h * 60)}
                className={`tide-digits h-11 rounded text-[15px] font-medium active:scale-95 ${
                  dur === h * 60 ? "bg-cyan-300 text-[#04131f]" : "bg-white/8 text-white/80"
                }`}
              >
                {h}h
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Result ── */}
      <section className="tide-panel p-3">
        {stats ? (
          <>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              <Cell label={`${t("tourStart")} · ${fmtTime(start, lang)}`}>
                <Level cm={stats.startCm} rising={stats.startRising} color={dirColor} />
              </Cell>
              <Cell label={`${t("tourEnd")} · ${fmtTime(end, lang)}`}>
                <Level cm={stats.endCm} rising={stats.endRising} color={dirColor} />
              </Cell>
              <Cell label={t("tourChange")}>
                <div
                  className="tide-digits text-[21px] font-medium"
                  style={{ color: stats.net >= 0 ? RISE : FALL }}
                >
                  {fmtSigned(stats.net)} cm
                </div>
                <div className="tide-digits text-white/55">
                  {t("tourRate")} {Math.round(stats.maxRate)} cm/h
                </div>
              </Cell>
              <Cell label={`${t("tourLow")} / ${t("tourHigh")}`}>
                <div className="tide-digits leading-snug">
                  <span className="text-[16px]" style={{ color: FALL }}>
                    {Math.round(stats.min.cm)}
                  </span>
                  <span className="text-white/50"> {fmtTime(stats.min.t, lang)}</span>
                </div>
                <div className="tide-digits leading-snug">
                  <span className="text-[16px]" style={{ color: RISE }}>
                    {Math.round(stats.max.cm)}
                  </span>
                  <span className="text-white/50"> {fmtTime(stats.max.t, lang)}</span>
                </div>
              </Cell>
            </div>

            <div className="mt-3">
              <div className="tide-label mb-1 text-[10.5px] uppercase tracking-wider text-white/55">
                {t("tourEvents")}
              </div>
              {stats.events.length ? (
                <div className="flex flex-wrap gap-1.5">
                  {stats.events.map((e) => {
                    const c = e.type === "high" ? RISE : FALL;
                    return (
                      <span
                        key={e.t}
                        className="tide-digits border px-2 py-1 text-[13px]"
                        style={{ borderColor: c, color: c }}
                      >
                        {e.type === "high" ? t("hw") : t("nw")} {fmtTime(e.t, lang)} ·{" "}
                        {Math.round(e.cm)} cm
                        {bkkDayStart(e.t) !== bkkDayStart(start) ? ` · ${fmtDay(e.t, lang)}` : ""}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="text-[13px] text-white/60">{t("tourNone")}</div>
              )}
            </div>

            <div className="mt-3 space-y-1.5 border-t border-white/10 pt-3 text-[14px] leading-snug">
              <p>
                {fill(t("tplDeparture"), {
                  time: <b className="tide-digits">{fmtTime(start, lang)}</b>,
                  cm: <b className="tide-digits text-cyan-200">{Math.round(stats.startCm)} cm</b>,
                })}
              </p>
              <p>
                {fill(t("tplReturn"), {
                  time: <b className="tide-digits">{fmtTime(end, lang)}</b>,
                  cm: <b className="tide-digits text-cyan-200">{Math.round(stats.endCm)} cm</b>,
                })}
              </p>
            </div>
          </>
        ) : (
          <p className="text-center text-[13px] text-white/60">{t("noData")}</p>
        )}

        <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-white/10 pt-3 text-[12px]">
          <span className="text-white/60">{t("minDepth")}</span>
          <span className="tide-digits shrink-0 text-[15px] font-medium">
            {need != null ? `${need} cm` : "—"}
          </span>
        </div>
        <p className="mt-2 text-[11px] leading-snug text-amber-200/90">{t("noUkc")}</p>
      </section>

      {/* ── Chart (drag = move start) ── */}
      <section className="tide-panel px-1.5 pb-1 pt-1.5">
        <div className="h-[300px]">
          <TideInstrument
            forecast={forecast}
            state={startState}
            tour={{ from: start, to: end }}
            onPan={(at) => setStart(clampStart(at))}
            minAt={today}
            maxAt={lastStart}
          />
        </div>
        <div className="tide-label px-1 pt-0.5 text-center text-[10px] uppercase tracking-[0.14em] text-cyan-300/70">
          {t("tourDrag")}
        </div>
      </section>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0 max-w-full overflow-hidden">
      <span className="tide-label mb-1 block text-[10.5px] uppercase tracking-wider text-white/55">
        {label}
      </span>
      {children}
    </label>
  );
}

function Round({
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
      className="grid size-12 shrink-0 place-items-center rounded bg-white/10 active:scale-95"
    >
      {children}
    </button>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 border border-white/10 bg-white/[0.04] px-2.5 py-2">
      <div className="tide-label truncate text-[10.5px] uppercase tracking-wider text-white/55">
        {label}
      </div>
      {children}
    </div>
  );
}

function Level({
  cm,
  rising,
  color,
}: {
  cm: number;
  rising: boolean;
  color: (r: boolean) => string;
}) {
  return (
    <div className="flex items-center gap-1.5" style={{ color: color(rising) }}>
      {rising ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
      <span className="tide-digits text-[21px] font-medium text-white">{Math.round(cm)} cm</span>
    </div>
  );
}
