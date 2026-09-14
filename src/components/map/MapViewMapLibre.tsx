import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { DISTRICTS } from "@/lib/constants";
import { loc, useT } from "@/lib/i18n";
import type { FeedCard } from "@/lib/types";
import { ListingCard } from "@/components/listings/listing-card";

const AO_NANG: [number, number] = [98.8222, 8.0363];

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

type ListingCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: { type: "Point"; coordinates: [number, number] };
    properties: { id: string; kind: string };
  }>;
};

function asCoord(n: unknown): number | null {
  const v = typeof n === "number" ? n : typeof n === "string" && n.trim() !== "" ? Number(n) : NaN;
  return Number.isFinite(v) ? v : null;
}

function pointFor(item: FeedCard): [number, number] | null {
  const lat = asCoord(item.lat);
  const lng = asCoord(item.lng);
  if (lat != null && lng != null) return [lng, lat];
  const d = DISTRICTS.find((x) => x.id === item.district);
  return d ? [d.lng, d.lat] : AO_NANG;
}

function toGeoJSON(items: FeedCard[]): ListingCollection {
  return {
    type: "FeatureCollection",
    features: items.map((item) => {
      const coords = pointFor(item) ?? AO_NANG;
      return {
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: coords },
        properties: { id: item.id, kind: item.kind },
      };
    }),
  };
}

function fitListings(map: maplibregl.Map, data: ListingCollection) {
  if (data.features.length === 0) {
    map.easeTo({ center: AO_NANG, zoom: 11 });
    return;
  }
  const bounds = new maplibregl.LngLatBounds();
  for (const f of data.features) bounds.extend(f.geometry.coordinates);
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

export default function MapView({
  items,
  selectedId,
  onSelect,
}: {
  items: FeedCard[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
}) {
  const { lang } = useT();
  const wrapRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

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
      const data = toGeoJSON(itemsRef.current);
      ensureLayers(map, data);
      fitListings(map, data);
    };
    map.on("load", paint);
    map.on("idle", () => map.resize());

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

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const apply = () => {
      const data = toGeoJSON(items);
      ensureLayers(map, data);
      fitListings(map, data);
    };
    if (map.isStyleLoaded()) apply();
    else map.once("load", apply);
  }, [items]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const item = items.find((i) => i.id === selectedId);
    const coords = item ? pointFor(item) : null;
    if (!coords) return;
    map.easeTo({ center: coords, zoom: Math.max(map.getZoom(), 13) });
  }, [selectedId, items]);

  const selected = items.find((i) => i.id === selectedId) ?? null;

  return (
    <div className="relative overflow-hidden rounded-2xl shadow-card">
      <div
        ref={wrapRef}
        className="h-[28rem] w-full"
        role="img"
        aria-label={loc(lang, "แผนที่กระบี่", "Krabi map")}
      />
      {selected ? (
        <div className="absolute inset-x-3 bottom-3 z-10 max-w-sm">
          <ListingCard card={selected} compact />
        </div>
      ) : null}
    </div>
  );
}
