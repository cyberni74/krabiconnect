import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { loc, useT } from "@/lib/i18n";
import type { FeedCard } from "@/lib/types";
import { ListingCard } from "@/components/listings/listing-card";
import {
  AO_NANG,
  clusterPins,
  listingPins,
  pointFor,
  type PinMark,
} from "@/lib/map-point";

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
  layers: [{ id: "osm", type: "raster" as const, source: "osm" }],
};

function pinColor(kind: string): string {
  if (kind === "job") return "#10B981";
  if (kind === "market") return "#F59E0B";
  if (kind === "cluster") return "#0088A3";
  return "#0088A3";
}

function pinElement(mark: PinMark, onClick: () => void): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.setAttribute("data-map-pin", "1");
  el.dataset.listingId = mark.listingIds[0] ?? mark.id;
  el.dataset.pinCount = String(mark.count);
  el.setAttribute("aria-label", mark.count > 1 ? `${mark.count} listings` : "Listing");
  const size = mark.count > 1 ? 32 : 22;
  el.style.cssText = [
    `width:${size}px`,
    `height:${size}px`,
    "border:3px solid #fff",
    "border-radius:999px",
    `background:${pinColor(mark.kind)}`,
    "box-shadow:0 2px 8px rgba(0,0,0,.28)",
    "cursor:pointer",
    "padding:0",
    "color:#fff",
    "font:700 11px/1 Inter,system-ui,sans-serif",
    "display:grid",
    "place-items:center",
  ].join(";");
  if (mark.count > 1) el.textContent = String(mark.count);
  el.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  });
  return el;
}

function fitPins(map: maplibregl.Map, pins: PinMark[]) {
  if (pins.length === 0) {
    map.easeTo({ center: AO_NANG, zoom: 11 });
    return;
  }
  if (pins.length === 1) {
    map.easeTo({ center: [pins[0]!.lng, pins[0]!.lat], zoom: 12 });
    return;
  }
  const bounds = new maplibregl.LngLatBounds();
  for (const p of pins) bounds.extend([p.lng, p.lat]);
  map.fitBounds(bounds, { padding: 56, maxZoom: 13, duration: 400 });
}

export default function MapView({
  items,
  selectedId,
  onSelect,
  active = true,
}: {
  items: FeedCard[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  active?: boolean;
}) {
  const { lang, t } = useT();
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  function syncMarkers(map: maplibregl.Map) {
    const zoom = map.getZoom();
    const pins = clusterPins(listingPins(itemsRef.current), zoom);
    for (const m of markersRef.current) m.remove();
    markersRef.current = pins.map((mark) => {
      const marker = new maplibregl.Marker({
        element: pinElement(mark, () => {
          if (mark.count > 1) {
            map.easeTo({ center: [mark.lng, mark.lat], zoom: Math.min(zoom + 2, 14) });
            return;
          }
          const id = mark.listingIds[0];
          if (id) onSelectRef.current?.(id);
        }),
        anchor: "center",
      })
        .setLngLat([mark.lng, mark.lat])
        .addTo(map);
      return marker;
    });
    return pins;
  }

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const map = new maplibregl.Map({
      container: el,
      style: OSM_STYLE,
      center: AO_NANG,
      zoom: 11,
      attributionControl: { compact: true },
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    const paint = () => {
      syncMarkers(map);
      fitPins(map, listingPins(itemsRef.current));
    };
    map.on("load", paint);
    map.on("zoomend", () => {
      syncMarkers(map);
    });

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(el);

    mapRef.current = map;
    return () => {
      for (const m of markersRef.current) m.remove();
      markersRef.current = [];
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
    // syncMarkers reads refs; map is created once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      syncMarkers(map);
      fitPins(map, listingPins(items));
    };
    if (map.loaded()) apply();
    else map.once("load", apply);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !active) return;
    map.resize();
    const id = requestAnimationFrame(() => {
      map.resize();
      syncMarkers(map);
      fitPins(map, listingPins(itemsRef.current));
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const item = items.find((i) => i.id === selectedId);
    if (!item) return;
    map.easeTo({ center: pointFor(item), zoom: Math.max(map.getZoom(), 13) });
  }, [selectedId, items]);

  const selected = items.find((i) => i.id === selectedId) ?? null;
  const pinCount = listingPins(items).length;

  return (
    <div
      className="relative overflow-hidden rounded-2xl shadow-card"
      data-pin-count={pinCount}
      data-map-type="maplibre"
    >
      <div
        ref={wrapRef}
        className="h-[28rem] w-full"
        role="img"
        aria-label={loc(lang, "แผนที่กระบี่", "Krabi map")}
      />
      <p
        className="pointer-events-none absolute left-3 top-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-medium text-muted shadow-card"
        data-map-badge="pins"
      >
        {t("coast")} · {pinCount}
      </p>
      {selected ? (
        <div className="absolute inset-x-3 bottom-3 z-10 max-w-sm">
          <ListingCard card={selected} compact />
        </div>
      ) : null}
    </div>
  );
}
