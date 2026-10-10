import { useEffect } from "react";
import { toast } from "sonner";
import { getLocation } from "@/lib/tide/locations";
import { MIN, nextCrossing, nextExtreme, type TideForecast } from "@/lib/tide/model";
import { fmtTime, translate, type TideKey } from "@/lib/tide/i18n";
import { useTideSettings } from "@/lib/tide/store";

const FIRED_KEY = "captain-tide-fired";

function loadFired(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(FIRED_KEY) || "[]");
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function markFired(key: string) {
  try {
    const list = [...loadFired(), key].slice(-60);
    localStorage.setItem(FIRED_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

let swReg: Promise<ServiceWorkerRegistration | null> | null = null;
function registration(): Promise<ServiceWorkerRegistration | null> {
  if (!swReg) {
    swReg =
      "serviceWorker" in navigator
        ? navigator.serviceWorker.register("/tide-sw.js", { scope: "/tide" }).catch(() => null)
        : Promise.resolve(null);
  }
  return swReg;
}

export async function requestNotifyPermission(): Promise<NotificationPermission | "unsupported"> {
  if (typeof Notification === "undefined") return "unsupported";
  void registration();
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

async function notify(title: string, body: string) {
  toast(title, { description: body, duration: 12_000 });
  if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
  const reg = await registration();
  try {
    if (reg) await reg.showNotification(title, { body, icon: "/__grok/icon-180.png", tag: title });
    else new Notification(title, { body });
  } catch {
    /* in-app toast already shown */
  }
}

/** Headless: checks the active forecast against the captain's alert settings. */
export function TideNotifier({ forecast }: { forecast: TideForecast | null }) {
  const lang = useTideSettings((s) => s.lang);
  const alerts = useTideSettings((s) => s.alerts);

  useEffect(() => {
    if (!forecast) return;
    const loc = getLocation(forecast.locationId);
    const t = (k: TideKey) => translate(lang, k);
    const check = () => {
      const now = Date.now();
      const lead = alerts.leadMin * MIN;
      const fired = new Set(loadFired());
      const fire = (key: string, title: string, body: string) => {
        if (fired.has(key)) return;
        fired.add(key);
        markFired(key);
        void notify(title, body);
      };
      for (const type of ["high", "low"] as const) {
        const on = type === "high" ? alerts.beforeHigh : alerts.beforeLow;
        if (!on) continue;
        const e = nextExtreme(forecast.extremes, now, type);
        if (e && e.t - now <= lead) {
          const mins = Math.max(0, Math.round((e.t - now) / MIN));
          fire(
            `${loc.id}:${type}:${e.t}`,
            `${type === "high" ? t("reminderHigh") : t("reminderLow")} ${mins} ${t("minutes")}`,
            `${loc.name} · ${fmtTime(e.t, lang)} · ${Math.round(e.cm)} cm`,
          );
        }
      }
      const thresholds: [boolean, number, "above" | "below"][] = [
        [alerts.aboveOn, alerts.above, "above"],
        [alerts.belowOn, alerts.below, "below"],
      ];
      for (const [on, value, dir] of thresholds) {
        if (!on) continue;
        const c = nextCrossing(forecast, value, dir, now - 2 * MIN, lead + 2 * MIN);
        if (c != null) {
          fire(
            `${loc.id}:${dir}:${value}:${Math.round(c / (10 * MIN))}`,
            `${dir === "above" ? t("crossAbove") : t("crossBelow")} ${value} cm`,
            `${loc.name} · ${t("at")} ${fmtTime(c, lang)}`,
          );
        }
      }
    };
    check();
    const id = window.setInterval(check, 30_000);
    return () => window.clearInterval(id);
  }, [forecast, alerts, lang]);

  return null;
}
