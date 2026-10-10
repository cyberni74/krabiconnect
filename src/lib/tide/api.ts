import { createServerFn } from "@tanstack/react-start";
import type { TideForecast } from "./model";

export type TideResponse = {
  forecast: TideForecast;
  /** Why a preferred source was skipped (shown as a hint, never as data). */
  notice: string | null;
  servedFromCache: boolean;
};

type CacheEntry = { at: number; value: TideResponse };
const cache = new Map<string, CacheEntry>();
const TTL_REAL = 60 * 60_000;
const TTL_DEMO = 5 * 60_000;

export const getTideForecast = createServerFn({ method: "GET" })
  .validator((input: { locationId: string }) => {
    if (!input || typeof input.locationId !== "string") throw new Error("locationId required");
    return { locationId: input.locationId.slice(0, 40) };
  })
  .handler(async ({ data }): Promise<TideResponse> => {
    const { getLocation } = await import("./locations");
    const { fetchWorldTides, fetchOpenMeteo, demoForecast } = await import("./providers");
    const loc = getLocation(data.locationId);
    const now = Date.now();
    const hit = cache.get(loc.id);
    if (hit) {
      const ttl = hit.value.forecast.source === "demo" ? TTL_DEMO : TTL_REAL;
      if (now - hit.at < ttl) return { ...hit.value, servedFromCache: true };
    }

    const notices: string[] = [];
    let forecast: TideForecast | null = null;
    const key = process.env.WORLDTIDES_API_KEY?.trim();
    if (key) {
      try {
        forecast = await fetchWorldTides(loc, key, now);
      } catch (err) {
        notices.push(`WorldTides: ${err instanceof Error ? err.message : "Fehler"}`);
      }
    }
    if (!forecast) {
      try {
        forecast = await fetchOpenMeteo(loc, now);
      } catch (err) {
        notices.push(`Open-Meteo: ${err instanceof Error ? err.message : "Fehler"}`);
      }
    }
    // Keep serving the last real forecast (marked stale via fetchedAt) over demo data.
    if (!forecast && hit && hit.value.forecast.source !== "demo") {
      return { ...hit.value, notice: notices.join(" · "), servedFromCache: true };
    }
    if (!forecast) forecast = demoForecast(loc, now);

    const value: TideResponse = {
      forecast,
      notice: notices.length ? notices.join(" · ") : null,
      servedFromCache: false,
    };
    cache.set(loc.id, { at: now, value });
    return value;
  });
