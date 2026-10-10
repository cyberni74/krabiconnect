import { AnimatePresence, motion } from "motion/react";
import {
  ArrowDown,
  ArrowUp,
  Clock3,
  Navigation,
  PlayCircle,
  RefreshCcw,
  RotateCcw,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { FALL, RISE } from "@/lib/tide/colors";
import { bkkDayStart, fill, fmtDay, fmtMeters, fmtSigned, fmtTime, useTT } from "@/lib/tide/i18n";
import { useTideView } from "@/lib/tide/store";
import { horizonEnd } from "@/lib/tide/harmonic";
import { fmtLatLon, type TideLocation } from "@/lib/tide/locations";
import { formatCountdown, type TideForecast, type TideState } from "@/lib/tide/model";
import { LangSwitch } from "./lang-switch";
import { SimulateSheet } from "./simulate-sheet";
import { TideInstrument } from "./tide-instrument";
import { TideMark } from "./tide-mark";
import { TimeDialSheet } from "./time-dial-sheet";
import { TourSheet } from "./tour-sheet";

export function NowView({
  forecast,
  state,
  liveState,
  now,
  previewAt,
  location,
  onOpenMap,
}: {
  forecast: TideForecast;
  /** State at the shown time (preview or now). */
  state: TideState | null;
  /** State right now, for the countdown. */
  liveState: TideState | null;
  now: number;
  previewAt: number | null;
  location: TideLocation;
  onOpenMap: () => void;
}) {
  const { t, lang } = useTT();
  const [sheet, setSheet] = useState<"sim" | "dial" | "tour" | null>(null);
  const setPreviewAt = useTideView((s) => s.setPreviewAt);
  const tour = useTideView((s) => s.tour);
  const isPreview = previewAt != null;
  const dirColor = state ? (state.rising ? RISE : FALL) : "#9fb3c8";

  return (
    <div
      className="hide-scroll absolute inset-0 flex flex-col gap-2 overflow-y-auto px-3"
      style={{
        paddingTop: "max(env(safe-area-inset-top), 10px)",
        paddingBottom: "calc(86px + env(safe-area-inset-bottom))",
      }}
    >
      {/* ── Title bar ── */}
      <header className="shrink-0">
        <div className="flex items-center gap-2.5">
          <TideMark className="size-7 shrink-0" />
          <div className="tide-label flex-1 text-[13px] font-bold tracking-[0.24em]">
            CAPTAIN TIDE
          </div>
          <div className="text-right leading-tight">
            <div className="tide-digits text-[16px] font-medium">{fmtTime(now, lang, true)}</div>
            <div className="tide-label text-[9.5px] uppercase tracking-wider text-white/55">
              {fmtDay(now, lang)} · UTC+7
            </div>
          </div>
        </div>
        <div className="mt-1.5 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onOpenMap}
            className="min-w-0 border-l-2 border-cyan-400/70 pl-2 text-left leading-tight"
          >
            <div className="tide-label truncate text-[13px] font-semibold">{location.name}</div>
            <div className="tide-digits truncate text-[10px] text-white/55">
              {fmtLatLon(location.lat, location.lon)}
            </div>
          </button>
          <LangSwitch />
        </div>
      </header>

      {/* ── Level readout (hidden while a sheet is open: the sheet + instrument show the preview) ── */}
      {!sheet ? (
        <section className="tide-panel tide-bracket flex shrink-0 items-stretch gap-3 px-3 py-2.5">
          <div className="min-w-0 flex-1">
            <div className="tide-label text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-300">
              {isPreview
                ? `${t("preview")} · ${fmtDay(previewAt, lang)} ${fmtTime(previewAt, lang)}`
                : t("forecastNow")}
            </div>
            {isPreview ? (
              <button
                type="button"
                onClick={() => setPreviewAt(null)}
                className="tide-label mt-1 flex items-center gap-1 border border-cyan-300/50 px-1.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-cyan-200 active:bg-cyan-300/20"
              >
                <RotateCcw className="size-3.5" />
                {t("backToNow")}
              </button>
            ) : null}
            {state ? (
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="tide-digits text-[clamp(54px,8.8dvh,80px)] font-medium leading-none">
                  {Math.round(state.cm)}
                </span>
                <span className="flex flex-col leading-tight">
                  <span className="tide-label text-[17px] font-semibold text-cyan-200">cm</span>
                  <span className="tide-digits whitespace-nowrap text-[11px] text-white/50">
                    {fmtMeters(state.cm, lang)} m
                  </span>
                </span>
              </div>
            ) : (
              <div className="mt-2 text-[15px] text-white/75">
                {forecast ? t("noData") : t("loading")}
              </div>
            )}
          </div>
          {state ? (
            <div className="flex w-[46%] max-w-[190px] shrink-0 flex-col justify-center gap-1 border-l border-white/10 pl-3">
              <motion.div
                key={state.slack ? "turn" : state.rising ? "up" : "down"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5 self-start border px-1.5 py-0.5"
                style={{ borderColor: dirColor, color: dirColor }}
              >
                {state.slack ? (
                  <RefreshCcw className="size-4" strokeWidth={2.6} />
                ) : state.rising ? (
                  <ArrowUp className="size-4" strokeWidth={3} />
                ) : (
                  <ArrowDown className="size-4" strokeWidth={3} />
                )}
                <span className="tide-label text-[14px] font-bold tracking-wider">
                  {state.slack ? t("turn") : state.rising ? t("flood") : t("ebb")}
                </span>
              </motion.div>
              <Row label={t("perHour")} value={state.perHour} color={dirColor} />
              <Row label={t("last30")} value={state.change30} />
              <Row label={t("toGo")} value={state.toNext} color={dirColor} />
            </div>
          ) : null}
        </section>
      ) : null}

      {/* ── Instrument ── */}
      <section className="tide-panel flex min-h-[250px] flex-1 flex-col px-1.5 pb-1 pt-1.5">
        <div className="min-h-0 flex-1">
          {forecast ? (
            <TideInstrument
              forecast={forecast}
              state={state}
              tour={tour}
              onPan={sheet ? undefined : setPreviewAt}
              minAt={bkkDayStart(now)}
              maxAt={horizonEnd(now)}
            />
          ) : null}
        </div>
        {!sheet ? (
          <div className="tide-label px-1 pt-0.5 text-center text-[10px] uppercase tracking-[0.14em] text-cyan-300/70">
            {t("dragHint")}
          </div>
        ) : null}
        {forecast ? (
          <div className="tide-label truncate px-1 text-center text-[9.5px] text-white/45">
            {forecast.sourceLabel} · {forecast.station} · {forecast.datum}
          </div>
        ) : null}
      </section>

      {/* ── Countdown / tools ── */}
      <div className="shrink-0">
        <AnimatePresence mode="wait" initial={false}>
          {sheet === "sim" && forecast ? (
            <SimulateSheet key="sim" forecast={forecast} now={now} onClose={() => setSheet(null)} />
          ) : sheet === "dial" && forecast ? (
            <TimeDialSheet
              key="dial"
              forecast={forecast}
              now={now}
              onClose={() => setSheet(null)}
            />
          ) : sheet === "tour" ? (
            <TourSheet key="tour" location={location} now={now} onClose={() => setSheet(null)} />
          ) : (
            <motion.div
              key="count"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.25 }}
            >
              <CountdownCard state={liveState} now={now}>
                <div className="mt-2.5 grid grid-cols-3 gap-2">
                  <ToolButton onClick={() => setSheet("tour")} disabled={!forecast}>
                    <Navigation className="size-4 text-cyan-300" />
                    {t("tourBtn")}
                  </ToolButton>
                  <ToolButton onClick={() => setSheet("dial")} disabled={!forecast}>
                    <Clock3 className="size-4 text-cyan-300" />
                    {t("pickTime")}
                  </ToolButton>
                  <ToolButton onClick={() => setSheet("sim")} disabled={!forecast}>
                    <PlayCircle className="size-4 text-cyan-300" />
                    {t("simulate")}
                  </ToolButton>
                </div>
              </CountdownCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Row({ label, value, color }: { label: string; value: number | null; color?: string }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="tide-label truncate text-[10.5px] text-white/55">{label}</span>
      <span className="tide-digits shrink-0 text-[13px] font-medium" style={{ color }}>
        {value != null ? `${fmtSigned(value)} cm` : "—"}
      </span>
    </div>
  );
}

function ToolButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="tide-label flex min-h-[52px] flex-col items-center justify-center gap-0.5 border border-cyan-300/35 bg-cyan-300/[0.07] px-1 py-1 text-center text-[10px] font-bold uppercase leading-tight tracking-[0.08em] text-cyan-50 active:bg-cyan-300/20 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function CountdownCard({
  state,
  now,
  children,
}: {
  state: TideState | null;
  now: number;
  children?: ReactNode;
}) {
  const { t, lang } = useTT();
  if (!state) {
    return (
      <div className="tide-panel px-4 py-6 text-center text-sm text-white/70">{t("loading")}</div>
    );
  }
  const { next, following } = state;
  const isHigh = next.type === "high";
  const color = isHigh ? RISE : FALL;
  return (
    <div className="tide-panel tide-bracket px-3.5 pb-3 pt-2.5">
      <div className="flex items-center justify-between gap-2">
        <div
          className="tide-label flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em]"
          style={{ color }}
        >
          <span className="size-2" style={{ background: color }} />
          {isHigh ? t("nextHighIn") : t("nextLowIn")}
        </div>
        {state.slack ? (
          <span className="tide-label border border-cyan-300/60 px-1.5 text-[10px] font-bold uppercase tracking-wider text-cyan-200">
            {t("slack")}
          </span>
        ) : null}
      </div>
      <div className="tide-digits text-[clamp(44px,7.6dvh,64px)] font-medium leading-[1.05]">
        {formatCountdown(next.t - now)}
      </div>
      <div className="text-[13.5px] text-white/90">
        {fill(t("eventLine"), {
          type: isHigh ? t("highAt") : t("lowAt"),
          time: <b className="tide-digits">{fmtTime(next.t, lang)}</b>,
        })}
        <span className="text-white/40"> · </span>
        <b className="tide-digits">{Math.round(next.cm)} cm</b>
      </div>
      {following ? (
        <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/10 pt-1.5 text-[12px] text-white/70">
          <span className="min-w-0 truncate">
            {fill(t("eventLine"), {
              type: following.type === "high" ? t("highAt") : t("lowAt"),
              time: <b className="tide-digits text-white">{fmtTime(following.t, lang)}</b>,
            })}
            {" · "}
            <span className="tide-digits">{Math.round(following.cm)} cm</span>
          </span>
          <span className="tide-digits shrink-0 text-white">
            {t("in")} {formatCountdown(following.t - now)}
          </span>
        </div>
      ) : null}
      {children}
    </div>
  );
}
