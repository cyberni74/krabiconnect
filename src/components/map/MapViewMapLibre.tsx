import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { loc, useT } from "@/lib/i18n";
import type { FeedCard } from "@/lib/types";
import { ListingCard } from "@/components/listings/listing-card";
import { AO_NANG, listingsToGeoJSON, pointFor, type ListingCollection } from "@/lib/map-point";

const OSM_STYLE = {
  version: 8 as const,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
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

function fitListings(map: maplibregl.Map, data: ListingCollection) {
  if (data.features.length === 0) {
    map.easeTo({ center: AO_NANG, zoom: 11 });
    return;
  }
  const bounds = new maplibregl.LngLatBounds();
  for (const f of data.features) bounds.extend(f.geometry.coordinates);
  const sw = bounds.getSouthWest();
  const ne = bounds.getNorthEast();
  if (sw.lat === ne.lat && sw.lng === ne.lng) {
    map.easeTo({ center: [sw.lng, sw.lat], zoom: 12 });
    return;
  }
  map.fitBounds(bounds, { padding: 56, maxZoom: 13, duration: 400 });
}

function ensureLayers(map: maplibregl.Map, data: ListingCollection) {
  if (!map.getSource("listings")) {
    map.addSource("listings", {
      type: "geojson",
      data,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 48,
    });
  } else {
    (map.getSource("listings") as maplibregl.GeoJSONSource).setData(data);
  }
  if (!map.getLayer("clusters")) {
    map.addLayer({
      id: "clusters",
      type: "circle",
      source: "listings",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": "#0088A3",
        "circle-radius": ["step", ["get", "point_count"], 18, 8, 22, 25, 28],
        "circle-stroke-width": 3,
        "circle-stroke-color": "#ffffff",
      },
    });
  }
  if (!map.getLayer("pins")) {
    map.addLayer({
      id: "pins",
      type: "circle",
      source: "listings",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": [
          "match",
          ["get", "kind"],
          "job",
          "#10B981",
          "market",
          "#F59E0B",
          "#0088A3",
        ],
        "circle-radius": 10,
        "circle-stroke-width": 3,
        "circle-stroke-color": "#ffffff",
      },
    });
  }
  if (!map.getLayer("cluster-count")) {
    try {
      map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "listings",
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["to-string", ["get", "point_count"]],
          "text-size": 12,
          "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
        },
        paint: { "text-color": "#ffffff" },
      });
    } catch {
      /* raster style may lack fonts — clusters still show */
    }
  }
}

function bindPinHandlers(map: maplibregl.Map, onSelectRef: { current?: (id: string) => void }) {
  map.on("click", "pins", (e: maplibregl.MapLayerMouseEvent) => {
    const raw = e.features?.[0]?.properties?.id;
    const id = raw == null ? "" : String(raw);
    if (id) onSelectRef.current?.(id);
  });
  map.on("click", "clusters", (e: maplibregl.MapLayerMouseEvent) => {
    const feature = e.features?.[0];
    const source = map.getSource("listings") as maplibregl.GeoJSONSource | undefined;
    const clusterId = feature?.properties?.cluster_id as number | undefined;
    if (!source || clusterId == null) return;
    void source.getClusterExpansionZoom(clusterId).then((zoom) => {
      if (zoom == null || !feature?.geometry || feature.geometry.type !== "Point") return;
      map.easeTo({ center: feature.geometry.coordinates as [number, number], zoom });
    });
  });
  const pointer = () => {
    map.getCanvas().style.cursor = "pointer";
  };
  const clear = () => {
    map.getCanvas().style.cursor = "";
  };
  map.on("mouseenter", "pins", pointer);
  map.on("mouseleave", "pins", clear);
  map.on("mouseenter", "clusters", pointer);
  map.on("mouseleave", "clusters", clear);
}

export default function MapView({
  items,
  selectedId,
  onSelect,
}: {
  items: FeedCard[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const { lang, t } = useT();
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const handlersBound = useRef(false);

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
      const data = listingsToGeoJSON(itemsRef.current);
      ensureLayers(map, data);
      if (!handlersBound.current && map.getLayer("pins")) {
        bindPinHandlers(map, onSelectRef);
        handlersBound.current = true;
      }
      fitListings(map, data);
    };
    map.on("load", paint);

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(el);

    mapRef.current = map;
    return () => {
      handlersBound.current = false;
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const data = listingsToGeoJSON(items);
      ensureLayers(map, data);
      if (!handlersBound.current && map.getLayer("pins")) {
        bindPinHandlers(map, onSelectRef);
        handlersBound.current = true;
      }
      fitListings(map, data);
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [items]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const item = items.find((i) => i.id === selectedId);
    if (!item) return;
    map.easeTo({ center: pointFor(item), zoom: Math.max(map.getZoom(), 13) });
  }, [selectedId, items]);

  const selected = items.find((i) => i.id === selectedId) ?? null;
  const pinCount = listingsToGeoJSON(items).features.length;

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-card">
      <div
        ref={wrapRef}
        className="h-[28rem] w-full"
        role="img"
        aria-label={loc(lang, "แผนที่กระบี่", "Krabi map")}
      />
      <p className="pointer-events-none absolute left-3 top-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-medium text-muted shadow-card">
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
