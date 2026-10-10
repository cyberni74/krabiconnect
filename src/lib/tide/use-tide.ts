import { useEffect, useMemo, useState } from "react";
import { harmonicForecast } from "./harmonic";
import { getLocation } from "./locations";
import { HOUR, tideStateAt, type TideForecast, type TideState } from "./model";

const BUCKET = 6 * HOUR;

/** Re-renders every `ms` with the current epoch time. */
export function useNow(ms = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}

/**
 * Live window (yesterday … +9 days) computed on the device from harmonic
 * constants — no request, so it works offline and never goes stale.
 * Regenerated every 6 h and when the location changes.
 */
export function useTide(locationId: string, now: number): TideForecast {
  const bucket = Math.floor(now / BUCKET) * BUCKET;
  return useMemo(
    () => harmonicForecast(getLocation(locationId), bucket - 24 * HOUR, bucket + 9 * 24 * HOUR),
    [locationId, bucket],
  );
}

/**
 * Tide state at `at`. A picked time outside the live window (e.g. a date two
 * years ahead) gets its own small window, so the readouts always have data.
 */
export function useTideStateAt(
  locationId: string,
  live: TideForecast,
  at: number,
): { forecast: TideForecast; state: TideState | null } {
  const inLive = at >= live.t[0] && at <= live.t[live.t.length - 1] - 6 * HOUR;
  const own = useMemo(
    () =>
      inLive ? null : harmonicForecast(getLocation(locationId), at - 30 * HOUR, at + 30 * HOUR, 15),
    // one window per picked quarter-hour is plenty
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inLive, locationId, Math.floor(at / (6 * HOUR))],
  );
  const forecast = own ?? live;
  return { forecast, state: useMemo(() => tideStateAt(forecast, at), [forecast, at]) };
}
