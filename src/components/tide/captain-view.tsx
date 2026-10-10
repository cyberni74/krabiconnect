import { Bell, BellOff, ShieldAlert, Ship } from "lucide-react";
import { useState } from "react";
import { LOCATIONS } from "@/lib/tide/locations";
import { levelAt, MIN, HOUR, type TideForecast } from "@/lib/tide/model";
import { BKK_OFFSET, fill, fmtDay, fmtSigned, fmtTime, useTT } from "@/lib/tide/i18n";
import { useTideSettings } from "@/lib/tide/store";
import { LangSwitch } from "./lang-switch";
import { requestNotifyPermission } from "./notifier";

/** epoch → "YYYY-MM-DDTHH:mm" in Bangkok time for <input type=datetime-local>. */
function toLocalInput(t: number): string {
  return new Date(t + BKK_OFFSET).toISOString().slice(0, 16);
}
function fromLocalInput(v: string): number | null {
  const x = Date.parse(`${v}:00Z`);
  return Number.isFinite(x) ? x - BKK_OFFSET : null;
}

export function CaptainView({ forecast, now }: { forecast: TideForecast | null; now: number }) {
  const { t, lang } = useTT();
  const s = useTideSettings();
  const [dep, setDep] = useState(() =>
    toLocalInput(Math.ceil((now + 2 * HOUR) / (30 * MIN)) * 30 * MIN),
  );
  const [ret, setRet] = useState(() =>
    toLocalInput(Math.ceil((now + 8 * HOUR) / (30 * MIN)) * 30 * MIN),
  );
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">(() =>
    typeof Notification === "undefined" ? "unsupported" : Notification.permission,
  );

  const depT = fromLocalInput(dep);
  const retT = fromLocalInput(ret);
  const lvNow = forecast ? levelAt(forecast, now) : null;
  const lvDep = forecast && depT != null ? levelAt(forecast, depT) : null;
  const lvRet = forecast && retT != null ? levelAt(forecast, retT) : null;
  const need = s.boat.draft + s.boat.reserve;
  const timeLabel = (x: number) =>
    (Math.abs(x - now) < 20 * HOUR ? "" : `${fmtDay(x, lang)}, `) + fmtTime(x, lang);

  const anyAlert =
    s.alerts.beforeHigh || s.alerts.beforeLow || s.alerts.aboveOn || s.alerts.belowOn;

  return (
    <div className="space-y-3">
      <section className="tide-glass rounded p-4">
        <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200">
          <Ship className="size-4" /> {t("boat")}
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <Field label={t("boatName")} className="col-span-2">
            <input
              className="tide-input"
              value={s.boat.name}
              placeholder="Andaman Spirit"
              maxLength={40}
              onChange={(e) => s.setBoat({ name: e.target.value })}
            />
          </Field>
          <Field label={`${t("draft")} (cm)`}>
            <NumInput value={s.boat.draft} onChange={(v) => s.setBoat({ draft: v })} />
          </Field>
          <Field label={`${t("reserve")} (cm)`}>
            <NumInput value={s.boat.reserve} onChange={(v) => s.setBoat({ reserve: v })} />
          </Field>
          <Field label={t("homePort")} className="col-span-2">
            <select
              className="tide-input"
              value={s.boat.homePort}
              onChange={(e) => s.setBoat({ homePort: e.target.value })}
            >
              {LOCATIONS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="mt-3 rounded bg-white/6 p-3">
          <div className="text-[11px] uppercase tracking-wider text-white/60">{t("minDepth")}</div>
          <div className="tide-digits text-[24px] font-bold">{need} cm</div>
          <p className="mt-1 text-[11.5px] leading-snug text-white/70">{t("depthHint")}</p>
        </div>
      </section>

      <section className="tide-glass rounded p-4">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200">
          {t("planner")}
          {s.boat.name ? ` · ${s.boat.name}` : ""}
        </h3>
        <div className="mt-3 grid grid-cols-1 gap-3">
          <Field label={t("departure")}>
            <input
              type="datetime-local"
              className="tide-input text-[14px]"
              value={dep}
              onChange={(e) => setDep(e.target.value)}
            />
          </Field>
          <Field label={t("ret")}>
            <input
              type="datetime-local"
              className="tide-input text-[14px]"
              value={ret}
              onChange={(e) => setRet(e.target.value)}
            />
          </Field>
        </div>
        <div className="mt-3 space-y-2 text-[14px] leading-snug">
          {depT != null && lvDep != null ? (
            <p>
              {fill(t("tplDeparture"), {
                time: <b>{timeLabel(depT)}</b>,
                cm: <b className="text-cyan-200">{Math.round(lvDep)} cm</b>,
              })}
            </p>
          ) : null}
          {depT != null && lvDep != null && lvNow != null && depT > now ? (
            <p>
              {fill(lvDep >= lvNow ? t("tplRises") : t("tplFalls"), {
                cm: <b className="text-cyan-200">{Math.abs(Math.round(lvDep - lvNow))} cm</b>,
              })}
            </p>
          ) : null}
          {retT != null && lvRet != null ? (
            <p>
              {fill(t("tplReturn"), {
                time: <b>{timeLabel(retT)}</b>,
                cm: <b className="text-cyan-200">{Math.round(lvRet)} cm</b>,
              })}
              {lvDep != null ? (
                <span className="text-white/60">
                  {" "}
                  ({t("change")} {fmtSigned(lvRet - lvDep)} cm)
                </span>
              ) : null}
            </p>
          ) : null}
          {forecast && ((depT != null && lvDep == null) || (retT != null && lvRet == null)) ? (
            <p className="text-amber-200">{t("noData")}</p>
          ) : null}
        </div>
        <div className="mt-3 flex gap-2 rounded border border-amber-300/30 bg-amber-300/10 p-3 text-[11.5px] leading-snug text-amber-50">
          <ShieldAlert className="size-4 shrink-0 text-amber-300" />
          {t("noUkc")}
        </div>
      </section>

      <section className="tide-glass rounded p-4">
        <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200">
          <Bell className="size-4" /> {t("alerts")}
        </h3>
        <div className="mt-2 divide-y divide-white/10">
          <Toggle
            label={t("beforeHigh")}
            on={s.alerts.beforeHigh}
            set={(v) => s.setAlerts({ beforeHigh: v })}
          />
          <Toggle
            label={t("beforeLow")}
            on={s.alerts.beforeLow}
            set={(v) => s.setAlerts({ beforeLow: v })}
          />
          <div className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
            {t("leadTime")}
            <select
              className="tide-input w-28 py-1.5"
              value={s.alerts.leadMin}
              onChange={(e) => s.setAlerts({ leadMin: Number(e.target.value) })}
            >
              {[10, 15, 30, 60, 90, 120].map((m) => (
                <option key={m} value={m}>
                  {m} {t("minutes")}
                </option>
              ))}
            </select>
          </div>
          <ThresholdRow
            label={t("aboveAlarm")}
            on={s.alerts.aboveOn}
            value={s.alerts.above}
            set={(on, value) => s.setAlerts({ aboveOn: on, above: value })}
          />
          <ThresholdRow
            label={t("belowAlarm")}
            on={s.alerts.belowOn}
            value={s.alerts.below}
            set={(on, value) => s.setAlerts({ belowOn: on, below: value })}
          />
        </div>
        {anyAlert && perm !== "granted" ? (
          <button
            type="button"
            disabled={perm === "denied" || perm === "unsupported"}
            onClick={async () => setPerm(await requestNotifyPermission())}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded bg-cyan-400 text-[13px] font-bold text-[#04131f] disabled:bg-white/10 disabled:text-white/60"
          >
            {perm === "denied" || perm === "unsupported" ? (
              <BellOff className="size-4" />
            ) : (
              <Bell className="size-4" />
            )}
            {perm === "denied" || perm === "unsupported" ? t("notifBlocked") : t("enableNotif")}
          </button>
        ) : null}
        <p className="mt-2 text-[11px] leading-snug text-white/60">{t("alertsNote")}</p>
      </section>

      <section className="tide-glass p-4">
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200">
          {t("language")} · Sprache · ภาษา
        </h3>
        <div className="mt-2">
          <LangSwitch size="large" />
        </div>
        <h3 className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200">
          {t("display")}
        </h3>
        <label className="mt-1 flex min-h-11 items-center justify-between gap-3 text-[14px]">
          <span>
            {t("scene")}
            <span className="block text-[11px] leading-snug text-white/55">{t("sceneNote")}</span>
          </span>
          <input
            type="checkbox"
            checked={s.scene}
            onChange={(e) => s.setScene(e.target.checked)}
            className="size-5 shrink-0 accent-cyan-400"
          />
        </label>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-medium text-white/65">{label}</span>
      {children}
    </label>
  );
}

function NumInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={2000}
      className="tide-input tide-digits"
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => {
        const v = Math.round(Number(e.target.value));
        onChange(Number.isFinite(v) ? Math.min(2000, Math.max(0, v)) : 0);
      }}
    />
  );
}

function Toggle({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) {
  return (
    <label className="flex min-h-11 items-center justify-between gap-3 py-2 text-[14px]">
      {label}
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => set(e.target.checked)}
        className="size-5 accent-cyan-400"
      />
    </label>
  );
}

function ThresholdRow({
  label,
  on,
  value,
  set,
}: {
  label: string;
  on: boolean;
  value: number;
  set: (on: boolean, value: number) => void;
}) {
  return (
    <div className="py-2.5 text-[14px]">
      <label className="flex min-h-9 items-center gap-3">
        <input
          type="checkbox"
          checked={on}
          onChange={(e) => set(e.target.checked, value)}
          className="size-5 shrink-0 accent-cyan-400"
        />
        {label}
      </label>
      <div className="mt-1 flex items-center justify-end gap-1.5">
        <input
          type="number"
          inputMode="numeric"
          className="tide-input tide-digits w-28 py-1.5 text-right"
          value={value}
          onChange={(e) => {
            const v = Math.round(Number(e.target.value));
            set(on, Number.isFinite(v) ? Math.min(1000, Math.max(0, v)) : 0);
          }}
        />
        <span className="text-white/60">cm</span>
      </div>
    </div>
  );
}
