/**
 * Pure tide math — no React, no network. All times are epoch milliseconds,
 * all heights are centimetres on the forecast's unified datum.
 */

export type TideSource = "worldtides" | "open-meteo" | "demo";

export type TideExtreme = { t: number; cm: number; type: "high" | "low" };

export type TideForecast = {
  locationId: string;
  source: TideSource;
  /** Human-readable provider + station, e.g. "WorldTides · Krabi". */
  sourceLabel: string;
  /** Where the prediction is computed (station name or model grid cell). */
  station: string;
  stationLat: number | null;
  stationLon: number | null;
  /** Height reference all values are expressed in. */
  datum: string;
  fetchedAt: number;
  /** Sorted sample times + heights. */
  t: number[];
  cm: number[];
  extremes: TideExtreme[];
  copyright?: string;
};

export const MIN = 60_000;
export const HOUR = 60 * MIN;

/** Index i such that t[i] <= x < t[i+1]; -1 when outside. */
function bracket(t: number[], x: number): number {
  if (t.length < 2 || x < t[0] || x > t[t.length - 1]) return -1;
  let lo = 0;
  let hi = t.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (t[mid] <= x) lo = mid;
    else hi = mid;
  }
  return lo;
}

/** Cubic (Catmull-Rom on a non-uniform grid) interpolation; null outside range. */
export function levelAt(f: Pick<TideForecast, "t" | "cm">, x: number): number | null {
  const { t, cm } = f;
  const i = bracket(t, x);
  if (i < 0) return null;
  if (i === t.length - 1) return cm[i];
  const t0 = t[i];
  const t1 = t[i + 1];
  const h = t1 - t0;
  if (h <= 0) return cm[i];
  const s = (x - t0) / h;
  const slope = (j: number) => {
    const a = Math.max(0, j - 1);
    const b = Math.min(t.length - 1, j + 1);
    return (cm[b] - cm[a]) / (t[b] - t[a]);
  };
  const m0 = slope(i) * h;
  const m1 = slope(i + 1) * h;
  const s2 = s * s;
  const s3 = s2 * s;
  return (
    (2 * s3 - 3 * s2 + 1) * cm[i] +
    (s3 - 2 * s2 + s) * m0 +
    (-2 * s3 + 3 * s2) * cm[i + 1] +
    (s3 - s2) * m1
  );
}

/**
 * Extremes from samples: local max/min, refined with a parabola through the
 * three surrounding samples. Used when the provider has no extremes list.
 */
export function findExtremes(t: number[], cm: number[]): TideExtreme[] {
  const out: TideExtreme[] = [];
  for (let i = 1; i < t.length - 1; i++) {
    const a = cm[i - 1];
    const b = cm[i];
    const c = cm[i + 1];
    const isHigh = b > a && b >= c;
    const isLow = b < a && b <= c;
    if (!isHigh && !isLow) continue;
    // Parabola through (-h0, a), (0, b), (h1, c) — assume near-uniform step.
    const h = (t[i + 1] - t[i - 1]) / 2;
    const denom = a - 2 * b + c;
    let dx = 0;
    let peak = b;
    if (denom !== 0) {
      dx = (0.5 * (a - c)) / denom;
      dx = Math.max(-1, Math.min(1, dx));
      peak = b - 0.25 * (a - c) * dx;
    }
    const type = isHigh ? "high" : "low";
    const prev = out[out.length - 1];
    // Flat-topped samples can yield two of the same kind in a row; keep the stronger.
    if (prev && prev.type === type) {
      if ((type === "high" && peak > prev.cm) || (type === "low" && peak < prev.cm)) {
        out[out.length - 1] = { t: Math.round(t[i] + dx * h), cm: peak, type };
      }
      continue;
    }
    out.push({ t: Math.round(t[i] + dx * h), cm: peak, type });
  }
  return out;
}

export function nextExtreme(ex: TideExtreme[], x: number, type?: "high" | "low") {
  return ex.find((e) => e.t > x && (!type || e.type === type)) ?? null;
}

export function prevExtreme(ex: TideExtreme[], x: number, type?: "high" | "low") {
  for (let i = ex.length - 1; i >= 0; i--) {
    const e = ex[i];
    if (e.t <= x && (!type || e.type === type)) return e;
  }
  return null;
}

/** Within this window around a turning point the UI shows "Gezeitenwechsel". */
export const SLACK_WINDOW = 10 * MIN;

export type TideState = {
  at: number;
  cm: number;
  /** true = water rising (next extreme is high water). */
  rising: boolean;
  slack: TideExtreme | null;
  next: TideExtreme;
  following: TideExtreme | null;
  nextHigh: TideExtreme | null;
  nextLow: TideExtreme | null;
  /** cm change over the past 30 minutes. */
  change30: number | null;
  /** Instantaneous rate, cm per hour. */
  perHour: number | null;
  /** Remaining change until the next extreme (signed). */
  toNext: number;
};

export function tideStateAt(f: TideForecast, x: number): TideState | null {
  const cm = levelAt(f, x);
  const next = nextExtreme(f.extremes, x);
  if (cm == null || !next) return null;
  const idx = f.extremes.indexOf(next);
  const following = f.extremes[idx + 1] ?? null;
  const prev = prevExtreme(f.extremes, x);
  let slack: TideExtreme | null = null;
  if (next.t - x <= SLACK_WINDOW) slack = next;
  else if (prev && x - prev.t <= SLACK_WINDOW) slack = prev;
  const past = levelAt(f, x - 30 * MIN);
  const a = levelAt(f, x - 15 * MIN);
  const b = levelAt(f, x + 15 * MIN);
  return {
    at: x,
    cm,
    rising: next.type === "high",
    slack,
    next,
    following,
    nextHigh: nextExtreme(f.extremes, x, "high"),
    nextLow: nextExtreme(f.extremes, x, "low"),
    change30: past == null ? null : cm - past,
    perHour: a == null || b == null ? null : (b - a) * 2,
    toNext: next.cm - cm,
  };
}

/** First time after `from` (within `horizon`) the level crosses `threshold` in `dir`. */
export function nextCrossing(
  f: TideForecast,
  threshold: number,
  dir: "above" | "below",
  from: number,
  horizon = 48 * HOUR,
  step = 5 * MIN,
): number | null {
  let prev = levelAt(f, from);
  if (prev == null) return null;
  for (let x = from + step; x <= from + horizon; x += step) {
    const v = levelAt(f, x);
    if (v == null) return null;
    if (dir === "above" && prev < threshold && v >= threshold) return x;
    if (dir === "below" && prev > threshold && v <= threshold) return x;
    prev = v;
  }
  return null;
}

export function forecastRange(f: Pick<TideForecast, "t">): [number, number] | null {
  if (f.t.length < 2) return null;
  return [f.t[0], f.t[f.t.length - 1]];
}

/** "HH:MM:SS" (hours may exceed 24). Negative input clamps to zero. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}
