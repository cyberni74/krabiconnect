import { findExtremes, HOUR, type TideExtreme, type TideForecast } from "./model.ts";
import type { TideLocation } from "./locations.ts";

const DAY = 24 * HOUR;

/** Hours of history kept so "change over the last 30 min" and the previous turn exist. */
const PAST_MS = DAY;
const FUTURE_DAYS = 8;

type WorldTidesResponse = {
  status?: number;
  error?: string;
  copyright?: string;
  station?: string;
  atlas?: string;
  responseLat?: number;
  responseLon?: number;
  responseDatum?: string;
  heights?: { dt: number; height: number }[];
  extremes?: { dt: number; height: number; type: string }[];
};

/** WorldTides v3 — station / tidal-atlas prediction on chart datum (CD/LAT). */
export async function fetchWorldTides(
  loc: TideLocation,
  key: string,
  now: number,
): Promise<TideForecast> {
  const start = Math.floor((now - PAST_MS) / 1000);
  const params = new URLSearchParams({
    lat: String(loc.lat),
    lon: String(loc.lon),
    start: String(start),
    length: String((FUTURE_DAYS + 1) * 86400),
    step: "1800",
    datum: "CD",
    key,
  });
  const res = await fetch(`https://www.worldtides.info/api/v3?heights&extremes&${params}`, {
    signal: AbortSignal.timeout(12_000),
  });
  const body = (await res.json()) as WorldTidesResponse;
  if (!res.ok || body.status !== 200 || !body.heights?.length) {
    throw new Error(body.error || `WorldTides HTTP ${res.status}`);
  }
  const t = body.heights.map((h) => h.dt * 1000);
  const cm = body.heights.map((h) => h.height * 100);
  const extremes: TideExtreme[] = (body.extremes ?? []).map((e) => ({
    t: e.dt * 1000,
    cm: e.height * 100,
    type: e.type.toLowerCase().startsWith("h") ? "high" : "low",
  }));
  return {
    locationId: loc.id,
    source: "worldtides",
    sourceLabel: "WorldTides",
    station: body.station || `Tidal atlas ${body.atlas ?? ""}`.trim(),
    stationLat: body.responseLat ?? null,
    stationLon: body.responseLon ?? null,
    datum: body.responseDatum || "CD",
    fetchedAt: now,
    t,
    cm,
    extremes: extremes.length ? extremes : findExtremes(t, cm),
    copyright: body.copyright,
  };
}

type OpenMeteoResponse = {
  latitude?: number;
  longitude?: number;
  error?: boolean;
  reason?: string;
  hourly?: { time: string[]; sea_level_height_msl: (number | null)[] };
};

/**
 * Open-Meteo Marine — global ocean-model tide + surge prediction relative to
 * MSL (no key). Converted to the location's approximate chart datum via z0.
 */
export async function fetchOpenMeteo(loc: TideLocation, now: number): Promise<TideForecast> {
  const params = new URLSearchParams({
    latitude: String(loc.lat),
    longitude: String(loc.lon),
    hourly: "sea_level_height_msl",
    timezone: "GMT",
    past_days: "1",
    forecast_days: String(FUTURE_DAYS),
    cell_selection: "sea",
  });
  let lastErr: unknown = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`https://marine-api.open-meteo.com/v1/marine?${params}`, {
        signal: AbortSignal.timeout(12_000),
      });
      const body = (await res.json()) as OpenMeteoResponse;
      if (!res.ok || body.error || !body.hourly) {
        throw new Error(body.reason || `Open-Meteo HTTP ${res.status}`);
      }
      const t: number[] = [];
      const cm: number[] = [];
      body.hourly.time.forEach((iso, i) => {
        const v = body.hourly!.sea_level_height_msl[i];
        if (v == null) return;
        t.push(Date.parse(`${iso}:00Z`));
        cm.push(v * 100 + loc.z0);
      });
      if (t.length < 24) throw new Error("Open-Meteo: no sea-level data for this point");
      return {
        locationId: loc.id,
        source: "open-meteo",
        sourceLabel: "Open-Meteo Marine (Modell)",
        station: `${body.latitude?.toFixed(2)}°N ${body.longitude?.toFixed(2)}°E`,
        stationLat: body.latitude ?? null,
        stationLon: body.longitude ?? null,
        datum: `≈ CD (MSL + ${(loc.z0 / 100).toFixed(2)} m)`,
        fetchedAt: now,
        t,
        cm,
        extremes: findExtremes(t, cm),
        copyright: "Open-Meteo.com (CC BY 4.0)",
      };
    } catch (err) {
      lastErr = err;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Open-Meteo unavailable");
}

/**
 * Synthetic harmonic curve (M2, S2, K1, O1) for DEMO mode only. Never shown
 * without the demo banner — these are not predictions.
 */
export function demoForecast(loc: TideLocation, now: number): TideForecast {
  const start = Math.floor((now - PAST_MS) / HOUR) * HOUR;
  const t: number[] = [];
  const cm: number[] = [];
  const phase = loc.lat * 3 + loc.lon;
  const hours = (FUTURE_DAYS + 1) * 24;
  for (let i = 0; i <= hours * 2; i++) {
    const x = start + i * 30 * 60_000;
    const h = x / HOUR;
    const v =
      236 +
      105 * Math.cos((2 * Math.PI * h) / 12.4206 + phase) +
      40 * Math.cos((2 * Math.PI * h) / 12 + phase * 0.7) +
      18 * Math.cos((2 * Math.PI * h) / 23.9345 + phase * 0.3) +
      12 * Math.cos((2 * Math.PI * h) / 25.8193 + phase * 0.2);
    t.push(x);
    cm.push(v);
  }
  return {
    locationId: loc.id,
    source: "demo",
    sourceLabel: "DEMO",
    station: "Simulierte Beispielkurve",
    stationLat: null,
    stationLon: null,
    datum: "—",
    fetchedAt: now,
    t,
    cm,
    extremes: findExtremes(t, cm),
  };
}
