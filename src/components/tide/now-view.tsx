import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowUp, ChevronDown, PlayCircle, RefreshCcw } from "lucide-react";
import { useState } from "react";
import type { TideForecast, TideState } from "@/lib/tide/model";
import { formatCountdown } from "@/lib/tide/model";
import { FRAME_MAX, FRAME_MIN } from "@/lib/tide/frames";
import { fmtDay, fmtSigned, fmtTime, useTT } from "@/lib/tide/i18n";
import type { TideLocation } from "@/lib/tide/locations";
import { SimulateSheet } from "./simulate-sheet";
import { TideMark } from "./tide-mark";

export const RISE = "#5eead4";
export const FALL = "#fdba74";

export function NowView({
  forecast,
  state,
  now,
  previewAt,
  location,
  onOpenMap,
  statusSlot,
}: {
  forecast: TideForecast | null;
  state: TideState | null;
  now: number;
  previewAt: number | null;
  location: TideLocation;
  onOpenMap: () => void;
  statusSlot: React.ReactNode;
}) {
  const { t, lang } = useTT();
  const [simOpen, setSimOpen] = useState(false);
  const isPreview = previewAt != null;
  const dirColor = state ? (state.rising ? RISE : FALL) : "#fff";
  const outOfRange = state && (state.cm > FRAME_MAX + 5 || state.cm < FRAME_MIN - 5);

  return (
    <div className="absolute inset-0">
      {/* ── Top 25 %: brand, place, clock, level ── */}
      <header className="tide-header absolute inset-x-0 top-0 h-[27%] min-h-[190px]">
        <div
          className="flex h-full flex-col px-5"
          style={{ paddingTop: "max(env(safe-area-inset-top), 14px)" }}
        >
          <div className="flex items-center gap-3">
            <TideMark className="size-8 shrink-0" />
            <div className="min-w-0 flex-1 leading-tight">
              <div className="text-[13px] font-bold tracking-[0.22em]">CAPTAIN TIDE</div>
              <button
                type="button"
                onClick={onOpenMap}
                className="flex max-w-full items-center gap-1 text-[12.5px] text-cyan-100/85"
              >
                <span className="truncate">{location.name} · Thailand</span>
                <ChevronDown className="size-3.5 shrink-0" />
              </button>
            </div>
            <div className="text-right leading-tight">
              <div className="tide-digits text-[15px] font-semibold">
                {fmtTime(now, lang, true)}
              </div>
              <div className="text-[10.5px] uppercase tracking-wider text-cyan-100/70">
                {fmtDay(now, lang)} · ICT
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center pb-4 text-center">
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.24em] text-cyan-200/90">
              {isPreview
                ? `${t("simulation")} · ${fmtTime(previewAt, lang)} ${t("oClock")}`
                : t("forecastNow")}
            </div>
            {state ? (
              <div className="tide-shadow flex items-baseline gap-2">
                <span className="tide-digits text-[clamp(56px,10.5dvh,92px)] font-bold leading-[0.95]">
                  {Math.round(state.cm)}
                </span>
                <span className="text-[clamp(20px,3.2dvh,28px)] font-semibold text-cyan-100">
                  cm
                </span>
                <span className="tide-digits ml-1 text-[13px] font-medium text-white/65">
                  {(state.cm / 100).toLocaleString(lang === "de" ? "de-DE" : "en-GB", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  m
                </span>
              </div>
            ) : (
              <div className="mt-2 text-lg font-semibold text-white/80">
                {forecast ? t("noData") : t("loading")}
              </div>
            )}
            {outOfRange ? (
              <div className="text-[10.5px] text-white/60">{t("outOfRange")}</div>
            ) : null}
          </div>
        </div>
      </header>

      {statusSlot}

      {/* ── Middle: free view on the gauge, direction left, rate right ── */}
      {state ? (
        <div className="pointer-events-none absolute inset-x-0 top-[30.5%] flex items-start justify-between px-3.5">
          <div className="flex w-[38%] max-w-[170px] flex-col gap-2">
            <motion.div
              key={state.slack ? "slack" : state.rising ? "up" : "down"}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="tide-glass-soft rounded-2xl px-3 py-2.5"
            >
              <div className="flex items-center gap-1.5" style={{ color: dirColor }}>
                {state.slack ? (
                  <RefreshCcw className="size-5" strokeWidth={2.6} />
                ) : state.rising ? (
                  <ArrowUp className="size-6" strokeWidth={3} />
                ) : (
                  <ArrowDown className="size-6" strokeWidth={3} />
                )}
                <span className="text-[17px] font-extrabold tracking-wide">
                  {state.slack
                    ? lang === "de"
                      ? "WECHSEL"
                      : "TURN"
                    : state.rising
                      ? lang === "de"
                        ? "FLUT"
                        : "FLOOD"
                      : lang === "de"
                        ? "EBBE"
                        : "EBB"}
                </span>
              </div>
              <div className="mt-0.5 text-[11.5px] font-medium leading-snug text-white/85">
                {state.slack
                  ? t("slack")
                  : state.rising
                    ? lang === "de"
                      ? "Wasser steigt"
                      : "Water rising"
                    : lang === "de"
                      ? "Wasser fällt"
                      : "Water falling"}
              </div>
              <div className="tide-digits mt-1.5 text-[12.5px] font-semibold text-white/90">
                {fmtSigned(state.toNext)} cm
              </div>
              <div className="text-[11px] text-white/75">{t("toGo")}</div>
            </motion.div>
            {!simOpen ? (
              <button
                type="button"
                onClick={() => setSimOpen(true)}
                className="tide-glass-soft pointer-events-auto flex items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-[10.5px] font-bold uppercase leading-tight tracking-[0.14em] text-cyan-50 active:scale-95"
              >
                <PlayCircle className="size-6 shrink-0 text-cyan-300" />
                {t("simulate")}
              </button>
            ) : null}
          </div>

          <div className="tide-glass-soft w-[38%] max-w-[170px] rounded-2xl px-3 py-2.5 text-right">
            <div className="tide-digits text-[17px] font-bold" style={{ color: dirColor }}>
              {state.perHour != null ? `${fmtSigned(state.perHour)} cm` : "—"}
            </div>
            <div className="text-[11px] text-white/75">{t("perHour")}</div>
            <div className="tide-digits mt-1 text-[12.5px] font-semibold text-white/90">
              {state.change30 != null ? `${fmtSigned(state.change30)} cm` : "—"}
            </div>
            <div className="text-[11px] text-white/75">{t("last30")}</div>
          </div>
        </div>
      ) : null}

      {/* ── Bottom 35 %: countdown card / simulator ── */}
      <div className="tide-bottom-fade pointer-events-none absolute inset-x-0 bottom-0 h-[30%]" />
      <div
        className="absolute inset-x-0 px-3"
        style={{ bottom: "calc(76px + env(safe-area-inset-bottom))" }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {simOpen && forecast ? (
            <SimulateSheet
              key="sim"
              forecast={forecast}
              now={now}
              onClose={() => setSimOpen(false)}
            />
          ) : (
            <motion.div
              key="count"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              <CountdownCard
                state={isPreview ? null : state}
                now={now}
                source={forecast ? `${forecast.sourceLabel} · ${forecast.station}` : null}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CountdownCard({
  state,
  now,
  source,
}: {
  state: TideState | null;
  now: number;
  source: string | null;
}) {
  const { t, lang } = useTT();
  if (!state) {
    return (
      <div className="tide-glass rounded-[28px] px-5 py-6 text-center text-sm text-white/75">
        {t("loading")}
      </div>
    );
  }
  const { next, following } = state;
  const isHigh = next.type === "high";
  const color = isHigh ? RISE : FALL;
  return (
    <div className="tide-glass-count rounded-[28px] px-5 pb-3 pt-3.5">
      <div>
        <div className="text-[11px] font-bold uppercase tracking-[0.18em]" style={{ color }}>
          {state.slack ? `${t("slack")} · ` : ""}
          {isHigh ? t("nextHighIn") : t("nextLowIn")}
        </div>
      </div>
      <div className="tide-digits tide-shadow text-[clamp(48px,8.2dvh,74px)] font-bold leading-[1.02]">
        {formatCountdown(next.t - now)}
      </div>
      <div className="tide-shadow text-[14px] text-white/95">
        {isHigh ? t("highAt") : t("lowAt")} {lang === "de" ? "um" : "at"}{" "}
        <b className="tide-digits">
          {fmtTime(next.t, lang)}
          {lang === "de" ? " Uhr" : ""}
        </b>
        <span className="text-white/50"> · </span>
        <b className="tide-digits">{Math.round(next.cm)} cm</b>
      </div>
      {following ? (
        <div className="tide-shadow mt-2 flex items-center justify-between gap-2 border-t border-white/12 pt-2 text-[12.5px] text-white/80">
          <span>
            {following.type === "high" ? t("highAt") : t("lowAt")}{" "}
            <b className="tide-digits text-white">{fmtTime(following.t, lang)}</b> ·{" "}
            <span className="tide-digits">{Math.round(following.cm)} cm</span>
          </span>
          <span className="tide-digits font-semibold text-white">
            {t("in")} {formatCountdown(following.t - now)}
          </span>
        </div>
      ) : null}
      {source ? (
        <div className="mt-1 truncate text-center text-[9.5px] text-white/50">{source}</div>
      ) : null}
    </div>
  );
}
