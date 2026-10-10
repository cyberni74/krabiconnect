import { Crosshair, Loader2, MapPin, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type * as Maplibre from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { LOCATIONS, MAX_GPS_KM, nearestLocation } from "@/lib/tide/locations";
import type { TideForecast } from "@/lib/tide/model";
import { fmtTime, useTT } from "@/lib/tide/i18n";
import { useTideSettings, useTideView } from "@/lib/tide/store";
import { toast } from "sonner";
import { harmonicLevelAt } from "@/lib/tide/harmonic";
import { useNow } from "@/lib/tide/use-tide";
// MapLibre 6 looks for its worker next to the bundled script, where Vite does not emit it;
// bundle the worker with its dependencies and tell MapLibre where it is (needed for GeoJSON layers).
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { ZoneMapLayer, ZoneOverlay, ZonePanel, useZoneEvals } from "./zones";

const OSM_STYLE = {
  version: 8 as const,
  sources: {
    osm: {
      type: "raster" as const,
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap",
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster" as const,
      source: "osm",
      // Night-chart look; done in the layer (not a CSS filter) so overlays keep their true colours.
      paint: {
        "raster-brightness-max": 0.6,
        "raster-saturation": -0.45,
        "raster-contrast": 0.2,
      },
    },
  ],
};

export function locateNearest(
  onDone: (id: string, km: number) => void,
  onFail: (msg: string) => void,
  onFar: (km: number) => void,
) {
  if (!("geolocation" in navigator)) {
    onFail("no geolocation");
    return;
  }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const fix = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      useTideView.getState().setUserFix(fix);
      const { loc, km } = nearestLocation(fix.lat, fix.lon);
      // Browser location can be far off (Wi-Fi/IP fix) or the user is outside the area: never guess.
      if (km > MAX_GPS_KM) return onFar(km);
      onDone(loc.id, km);
    },
    (err) => onFail(err.message),
    { enableHighAccuracy: false, timeout: 12_000, maximumAge: 5 * 60_000 },
  );
}

export function MapView({ forecast }: { forecast: TideForecast | null }) {
  const { t, lang } = useTT();
  const locationId = useTideSettings((s) => s.locationId);
  const setLocation = useTideSettings((s) => s.setLocation);
  const favorites = useTideSettings((s) => s.favorites);
  const toggleFavorite = useTideSettings((s) => s.toggleFavorite);
  const scene = useTideSettings((s) => s.scene);
  const autoGps = useTideSettings((s) => s.autoGps);
  const setAutoGps = useTideSettings((s) => s.setAutoGps);
  const [locating, setLocating] = useState(false);
  const [ready, setReady] = useState(false);
  const now = useNow(30_000);
  const { evals, at, draft, reserve } = useZoneEvals(forecast, now);
  const mapEl = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Maplibre.Map | null>(null);
  const markers = useRef<Map<string, HTMLElement>>(new Map());
  const libRef = useRef<typeof Maplibre | null>(null);
  const userPin = useRef<Maplibre.Marker | null>(null);
  const userFix = useTideView((s) => s.userFix);

  useEffect(() => {
    let disposed = false;
    const pins = markers.current;
    void import("maplibre-gl").then((mod) => {
      const maplibregl = (mod as { default?: typeof Maplibre }).default ?? mod;
      if (disposed || !mapEl.current) return;
      libRef.current = maplibregl;
      maplibregl.setWorkerUrl(workerUrl);
      const map = new maplibregl.Map({
        container: mapEl.current,
        style: OSM_STYLE,
        center: [98.7, 7.95],
        zoom: 8.2,
        attributionControl: { compact: true },
      });
      mapRef.current = map;
      map.on("load", () => setReady(true));
      for (const l of LOCATIONS) {
        const el = document.createElement("button");
        el.type = "button";
        el.setAttribute("aria-label", l.name);
        el.style.cssText =
          "width:18px;height:18px;border-radius:999px;border:3px solid #fff;background:#0891b2;box-shadow:0 2px 10px rgba(0,0,0,.4);cursor:pointer;padding:0";
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          useTideSettings.getState().setLocation(l.id);
        });
        pins.set(l.id, el);
        new maplibregl.Marker({ element: el }).setLngLat([l.lon, l.lat]).addTo(map);
      }
      paint(useTideSettings.getState().locationId);
    });
    return () => {
      disposed = true;
      mapRef.current?.remove();
      mapRef.current = null;
      userPin.current = null;
      pins.clear();
    };
  }, []);

  // Device position: an orange dot, separate from the blue prediction points (which sit at sea).
  useEffect(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!userFix || !map || !lib || !ready) return;
    const lngLat: [number, number] = [userFix.lon, userFix.lat];
    if (userPin.current) {
      userPin.current.setLngLat(lngLat);
      return;
    }
    const el = document.createElement("div");
    el.setAttribute("aria-label", t("yourPosition"));
    el.style.cssText =
      "width:14px;height:14px;border-radius:999px;background:#f97316;border:3px solid #fff;box-shadow:0 0 0 5px rgba(249,115,22,.3)";
    userPin.current = new lib.Marker({ element: el }).setLngLat(lngLat).addTo(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userFix, ready]);

  function paint(selected: string) {
    for (const [id, el] of markers.current) {
      const on = id === selected;
      el.style.background = on ? "#22d3ee" : "#0e7490";
      el.style.width = el.style.height = on ? "24px" : "16px";
      el.style.zIndex = on ? "2" : "1";
    }
  }

  useEffect(() => {
    paint(locationId);
    const l = LOCATIONS.find((x) => x.id === locationId);
    if (l) mapRef.current?.easeTo({ center: [l.lon, l.lat], duration: 700 });
  }, [locationId]);

  const ordered = [...LOCATIONS].sort(
    (a, b) => Number(favorites.includes(b.id)) - Number(favorites.includes(a.id)),
  );

  return (
    <div className="space-y-3">
      <section className="tide-glass overflow-hidden rounded">
        <div className="relative" data-zone-map>
          <div ref={mapEl} className="h-[300px] w-full bg-[#0b2a44]" />
          <ZoneOverlay />
        </div>
        <ZoneMapLayer mapRef={mapRef} ready={ready} evals={evals} />
        <div className="space-y-2 p-4">
          <button
            type="button"
            disabled={locating}
            onClick={() => {
              setLocating(true);
              locateNearest(
                (id, km) => {
                  setLocating(false);
                  setLocation(id);
                  const name = LOCATIONS.find((l) => l.id === id)?.name ?? id;
                  toast.success(`${t("gpsNearest")}: ${name} (${Math.round(km)} km)`);
                },
                () => {
                  setLocating(false);
                  toast.error(t("gpsDenied"));
                },
                (km) => {
                  setLocating(false);
                  toast.error(t("gpsFar").replace("{km}", String(Math.round(km))));
                },
              );
            }}
            className="flex h-12 w-full items-center justify-center gap-2 rounded bg-cyan-400 text-[14px] font-bold text-[#04131f] active:scale-[0.98] disabled:opacity-70"
          >
            {locating ? (
              <Loader2 className="size-5 animate-spin" />
            ) : (
              <Crosshair className="size-5" />
            )}
            {locating ? t("gpsLocating") : t("useGps")}
          </button>
          <label className="flex items-center justify-between gap-3 py-1 text-[13px] text-white/85">
            {t("autoGps")}
            <input
              type="checkbox"
              checked={autoGps}
              onChange={(e) => setAutoGps(e.target.checked)}
              className="size-5 accent-cyan-400"
            />
          </label>
        </div>
      </section>

      <ZonePanel
        evals={evals}
        at={at}
        draft={draft}
        reserve={reserve}
        levelAtNow={forecast ? harmonicLevelAt(locationId, now) : null}
      />

      <section className="tide-glass rounded p-2">
        <h3 className="px-3 pb-1 pt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-200">
          {t("locations")}
        </h3>
        <ul>
          {ordered.map((l) => {
            const on = l.id === locationId;
            const fav = favorites.includes(l.id);
            return (
              <li key={l.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => setLocation(l.id)}
                  className={`flex min-h-12 flex-1 items-center gap-3 rounded px-3 py-2 text-left ${on ? "bg-cyan-300/18" : ""}`}
                >
                  <MapPin className={`size-5 ${on ? "text-cyan-300" : "text-white/50"}`} />
                  <span className="flex-1">
                    <span className="block text-[15px] font-semibold">{l.name}</span>
                    <span className="block text-[11.5px] text-white/60">
                      {l.region} · {l.lat.toFixed(2)}°N {l.lon.toFixed(2)}°E
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(l.id)}
                  aria-label={t("favorites")}
                  aria-pressed={fav}
                  className="grid size-12 place-items-center"
                >
                  <Star
                    className={`size-5 ${fav ? "fill-amber-300 text-amber-300" : "text-white/40"}`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      {forecast ? (
        <section className="tide-glass rounded p-4 text-[12.5px] leading-relaxed text-white/80">
          <Row k={t("source")} v={forecast.sourceLabel} />
          <Row k={t("station")} v={forecast.station} />
          <Row k={t("datum")} v={forecast.datum} />
          <Row k="Update" v={fmtTime(forecast.fetchedAt, lang)} />
          {forecast.copyright ? (
            <p className="mt-2 text-[10.5px] text-white/50">{forecast.copyright}</p>
          ) : null}
          <p className="mt-2 text-[11px] text-white/60">{t("notMeasured")}</p>
          <p className="mt-1 text-[11px] text-white/60">{t("method")}</p>
          {scene ? <p className="mt-1 text-[11px] text-white/60">{t("illustrationNote")}</p> : null}
        </section>
      ) : null}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-white/8 py-1.5 last:border-0">
      <span className="text-white/55">{k}</span>
      <span className="text-right font-medium text-white">{v}</span>
    </div>
  );
}
