import { motion } from "motion/react";
import { ArrowDown, ArrowUp, Minus, Plus, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FALL, RISE } from "@/lib/tide/colors";
import { harmonicForecast, horizonEnd } from "@/lib/tide/harmonic";
import {
  BKK_OFFSET,
  bkkDayStart,
  fmtDay,
  fmtDuration,
  fmtSigned,
  fmtTime,
  useTT,
} from "@/lib/tide/i18n";
import type { TideLocation } from "@/lib/tide/locations";
import { HOUR, MIN, tourStats } from "@/lib/tide/model";
import { useTideView } from "@/lib/tide/store";

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

export function TourSheet({
  location,
  now,
  onClose,
}: {
  location: TideLocation;
  now: number;
  onClose: () => void;
}) {
  const { t, lang } = useTT();
  const setPreviewAt = useTideView((s) => s.setPreviewAt);
  const setTour = useTideView((s) => s.setTour);
  const today = bkkDayStart(now);
  const lastStart = horizonEnd(now) - MAX_MIN * MIN;
  const [start, setStart] = useState(() => Math.ceil((now + HOUR) / (30 * MIN)) * 30 * MIN);
  const [dur, setDur] = useState(180);
  const end = start + dur * MIN;

  const forecast = useMemo(
    // The state at the end needs the *next* extreme, which can be up to ~13 h later.
    () => harmonicForecast(location, start - HOUR, end + 14 * HOUR),
    [location, start, end],
  );
  const stats = useMemo(() => tourStats(forecast, start, end), [forecast, start, end]);

  useEffect(() => {
    setPreviewAt(start);
    setTour({ from: start, to: end });
  }, [start, end, setPreviewAt, setTour]);
  useEffect(
    () => () => {
      setPreviewAt(null);
      setTour(null);
    },
    [setPreviewAt, setTour],
  );

  const setDay = (v: string) =>
    v && setStart(Math.min(lastStart, Math.max(today, fromParts(v, isoTime(start)))));
  const setTime = (v: string) =>
    v && setStart(Math.min(lastStart, Math.max(today, fromParts(isoDay(start), v))));
  const setDuration = (m: number) => setDur(Math.min(MAX_MIN, Math.max(STEP, m)));

  const dirIcon = (rising: boolean) =>
    rising ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />;
  const dirColor = (rising: boolean) => (rising ? RISE : FALL);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="tide-panel tide-bracket px-3.5 pb-3 pt-3"
    >
      <div className="flex items-center justify-between">
        <div className="tide-label text-[11px] font-bold uppercase tracking-[0.18em] text-cyan-300">
          {t("tourTitle")}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="grid size-9 place-items-center rounded bg-white/10 active:scale-95"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <label className="block">
          <span className="tide-label mb-0.5 block text-[10.5px] uppercase tracking-wider text-white/55">
            {t("tourDay")}
          </span>
          <input
            type="date"
            className="tide-input tide-digits py-1.5 text-[15px]"
            min={isoDay(today)}
            max={isoDay(lastStart)}
            value={isoDay(start)}
            onChange={(e) => setDay(e.target.value)}
          />
        </label>
        <label className="block">
          <span className="tide-label mb-0.5 block text-[10.5px] uppercase tracking-wider text-white/55">
            {t("tourTime")}
          </span>
          <input
            type="time"
            step={300}
            className="tide-input tide-digits py-1.5 text-[15px]"
            value={isoTime(start)}
            onChange={(e) => setTime(e.target.value)}
          />
        </label>
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <span className="tide-label shrink-0 text-[10.5px] uppercase tracking-wider text-white/55">
          {t("tourDuration")}
        </span>
        <button
          type="button"
          onClick={() => setDuration(dur - STEP)}
          aria-label="−30 min"
          className="grid size-9 shrink-0 place-items-center rounded bg-white/10 active:scale-95"
        >
          <Minus className="size-4" />
        </button>
        <div className="tide-digits min-w-[84px] text-center text-[17px] font-medium">
          {fmtDuration(dur * MIN, lang)}
        </div>
        <button
          type="button"
          onClick={() => setDuration(dur + STEP)}
          aria-label="+30 min"
          className="grid size-9 shrink-0 place-items-center rounded bg-white/10 active:scale-95"
        >
          <Plus className="size-4" />
        </button>
        <div className="hide-scroll -mr-1 flex min-w-0 flex-1 gap-1 overflow-x-auto">
          {CHIPS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setDuration(h * 60)}
              className={`tide-digits h-9 shrink-0 rounded px-2.5 text-[13px] font-medium ${
                dur === h * 60 ? "bg-cyan-300 text-[#04131f]" : "bg-white/8 text-white/80"
              }`}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      {stats ? (
        <>
          <div className="mt-2.5 grid grid-cols-2 gap-2 text-[12px]">
            <Cell label={`${t("tourStart")} · ${fmtTime(start, lang)}`}>
              <Level
                cm={stats.startCm}
                rising={stats.startRising}
                icon={dirIcon}
                color={dirColor}
              />
            </Cell>
            <Cell label={`${t("tourEnd")} · ${fmtTime(end, lang)}`}>
              <Level cm={stats.endCm} rising={stats.endRising} icon={dirIcon} color={dirColor} />
            </Cell>
            <Cell label={t("tourChange")}>
              <div
                className="tide-digits text-[19px] font-medium"
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
                <span style={{ color: FALL }}>{Math.round(stats.min.cm)}</span>
                <span className="text-white/45"> {fmtTime(stats.min.t, lang)}</span>
              </div>
              <div className="tide-digits leading-snug">
                <span style={{ color: RISE }}>{Math.round(stats.max.cm)}</span>
                <span className="text-white/45"> {fmtTime(stats.max.t, lang)}</span>
              </div>
            </Cell>
          </div>

          <div className="mt-2 text-[12px]">
            <div className="tide-label mb-0.5 text-[10.5px] uppercase tracking-wider text-white/55">
              {t("tourEvents")}
            </div>
            {stats.events.length ? (
              <div className="flex flex-wrap gap-1.5">
                {stats.events.map((e) => (
                  <span
                    key={e.t}
                    className="tide-digits border px-1.5 py-0.5"
                    style={{
                      borderColor: e.type === "high" ? RISE : FALL,
                      color: e.type === "high" ? RISE : FALL,
                    }}
                  >
                    {e.type === "high" ? t("hw") : t("nw")} {fmtTime(e.t, lang)} ·{" "}
                    {Math.round(e.cm)} cm
                    {bkkDayStart(e.t) !== bkkDayStart(start) ? ` · ${fmtDay(e.t, lang)}` : ""}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-white/60">{t("tourNone")}</div>
            )}
          </div>
        </>
      ) : (
        <p className="mt-3 text-center text-[12px] text-white/60">{t("noData")}</p>
      )}
      <p className="mt-2 text-[10.5px] leading-snug text-white/50">{t("tourNote")}</p>
    </motion.div>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border border-white/10 bg-white/[0.04] px-2.5 py-1.5">
      <div className="tide-label text-[10.5px] uppercase tracking-wider text-white/55">{label}</div>
      {children}
    </div>
  );
}

function Level({
  cm,
  rising,
  icon,
  color,
}: {
  cm: number;
  rising: boolean;
  icon: (r: boolean) => React.ReactNode;
  color: (r: boolean) => string;
}) {
  return (
    <div className="flex items-center gap-1.5" style={{ color: color(rising) }}>
      {icon(rising)}
      <span className="tide-digits text-[19px] font-medium text-white">{Math.round(cm)} cm</span>
    </div>
  );
}
