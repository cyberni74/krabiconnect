import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getTideForecast, type TideResponse } from "./api";
import { HOUR } from "./model";

const STORAGE_PREFIX = "captain-tide-cache:";
/** A forecast older than this is flagged as stale in the UI. */
export const STALE_AFTER = 6 * HOUR;

function readCached(id: string): TideResponse | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + id);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as TideResponse;
    if (!parsed?.forecast?.t?.length) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

function writeCached(id: string, value: TideResponse) {
  if (value.forecast.source === "demo") return;
  try {
    localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(value));
  } catch {
    /* storage full / private mode — live data still works */
  }
}

export function useTide(locationId: string) {
  const query = useQuery({
    queryKey: ["tide", locationId],
    queryFn: async () => {
      const value = await getTideForecast({ data: { locationId } });
      writeCached(locationId, value);
      return value;
    },
    initialData: () => readCached(locationId),
    initialDataUpdatedAt: () => readCached(locationId)?.forecast.fetchedAt,
    staleTime: 30 * 60_000,
    refetchInterval: 30 * 60_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });
  const data = query.data ?? null;
  return {
    data,
    forecast: data?.forecast ?? null,
    isLoading: !data && query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/** Re-renders every `ms` with the current epoch time. */
export function useNow(ms = 1000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}
