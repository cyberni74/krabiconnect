import { useEffect, useRef } from "react";
import {
  Map as MapLibreMap,
  NavigationControl,
  type GeoJSONSource,
  type MapGeoJSONFeature,
  type MapMouseEvent,
  type StyleSpecification,
} from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { FeatureCollection, Point } from "geojson";
import type { FeedCard } from "@/lib/types";
import type { ListingKind } from "@/lib/constants";

/** Ao Nang, Krabi — MapLibre center is [lng, lat]. */
export const KRABI_CENTER: [number, number] = [98.855, 8.045];
export const KRABI_ZOOM = 11;

const KIND_COLOR: Record<ListingKind, string> = {
  service: "#0088a3",
  job: "#10b981",
  market: "#0f172a",
};

const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
      maxzoom: 19,
    },
  },
  layers: [{ id: "osm", type: "raster", source: "osm" }],
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
};

const SOURCE_ID = "listings";
const LAYER_CLUSTERS = "listing-clusters";
const LAYER_CLUSTER_COUNT = "listing-cluster-count";
const LAYER_POINTS = "listing-points";

function toGeoJSON(items: FeedCard[]): FeatureCollection<Point> {
  return {
    type: "FeatureCollection",
    features: items
      .filter(
        (i) => i.lat != null && i.lng != null && Number.isFinite(i.lat) && Number.isFinite(i.lng),
      )
      .map((i) => ({
        type: "Feature",
        id: i.id,
        geometry: {
          type: "Point",
          coordinates: [i.lng as number, i.lat as number],
        },
        properties: {
          id: i.id,
          kind: i.kind,
        },
      })),
  };
}

function listingSource(map: MapLibreMap): GeoJSONSource | undefined {
  const source = map.getSource(SOURCE_ID);
  return source?.type === "geojson" ? (source as GeoJSONSource) : undefined;
}

function addListingLayers(map: MapLibreMap) {
  map.addSource(SOURCE_ID, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 48,
  });

  map.addLayer({
    id: LAYER_CLUSTERS,
    type: "circle",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    paint: {
      "circle-color": [
        "step",
        ["get", "point_count"],
        "#0088a3",
        8,
        "#0e7490",
        20,
        "#155e75",
      ],
      "circle-radius": ["step", ["get", "point_count"], 16, 8, 20, 20, 26],
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });

  map.addLayer({
    id: LAYER_CLUSTER_COUNT,
    type: "symbol",
    source: SOURCE_ID,
    filter: ["has", "point_count"],
    layout: {
      "text-field": "{point_count_abbreviated}",
      "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
      "text-size": 12,
    },
    paint: {
      "text-color": "#ffffff",
    },
  });

  map.addLayer({
    id: LAYER_POINTS,
    type: "circle",
    source: SOURCE_ID,
    filter: ["!", ["has", "point_count"]],
    paint: {
      "circle-color": [
        "match",
        ["get", "kind"],
        "job",
        KIND_COLOR.job,
        "market",
        KIND_COLOR.market,
        KIND_COLOR.service,
      ],
      "circle-radius": 8,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });
}

export function KrabiMapCanvas({
  items,
  onSelect,
  onDeselect,
  selectedId,
}: {
  items: FeedCard[];
  onSelect?: (card: FeedCard) => void;
  onDeselect?: () => void;
  selectedId?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const itemsRef = useRef(items);
  const onSelectRef = useRef(onSelect);
  const onDeselectRef = useRef(onDeselect);
  itemsRef.current = items;
  onSelectRef.current = onSelect;
  onDeselectRef.current = onDeselect;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || mapRef.current) return;

    const coarse =
      typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

    const map = new MapLibreMap({
      container: el,
      style: OSM_STYLE,
      center: KRABI_CENTER,
      zoom: KRABI_ZOOM,
      attributionControl: { compact: true },
      cooperativeGestures: coarse,
    });
    mapRef.current = map;

    map.addControl(new NavigationControl({ showCompass: false }), "bottom-right");

    const onLoad = () => {
      addListingLayers(map);
      void listingSource(map)?.setData(toGeoJSON(itemsRef.current));
    };
    map.on("load", onLoad);

    map.on("click", (e: MapMouseEvent) => {
      const layers = [LAYER_CLUSTERS, LAYER_POINTS].filter((id) => map.getLayer(id));
      const hits = layers.length ? map.queryRenderedFeatures(e.point, { layers }) : [];
      const cluster = hits.find((f: MapGeoJSONFeature) => f.layer.id === LAYER_CLUSTERS);
      if (cluster && cluster.geometry.type === "Point") {
        const clusterId = cluster.properties?.cluster_id as number | undefined;
        const source = listingSource(map);
        const coords = cluster.geometry.coordinates as [number, number];
        if (clusterId != null && source) {
          source
            .getClusterExpansionZoom(clusterId)
            .then((zoom: number) => {
              map.easeTo({ center: coords, zoom });
            })
            .catch(() => {
              map.easeTo({ center: coords, zoom: map.getZoom() + 2 });
            });
        }
        return;
      }
      const point = hits.find((f: MapGeoJSONFeature) => f.layer.id === LAYER_POINTS);
      if (point) {
        const id = String(point.properties?.id ?? "");
        const card = itemsRef.current.find((c) => c.id === id);
        if (card) onSelectRef.current?.(card);
        return;
      }
      onDeselectRef.current?.();
    });

    const pointer = (layer: string) => {
      map.on("mouseenter", layer, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", layer, () => {
        map.getCanvas().style.cursor = "";
      });
    };
    pointer(LAYER_CLUSTERS);
    pointer(LAYER_POINTS);

    const resize = () => map.resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.isStyleLoaded()) return;
    void listingSource(map)?.setData(toGeoJSON(items));
  }, [items]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map?.getLayer(LAYER_POINTS) || selectedId == null) return;
    const card = itemsRef.current.find((c) => c.id === selectedId);
    if (card?.lng == null || card.lat == null) return;
    map.easeTo({ center: [card.lng, card.lat], duration: 400 });
  }, [selectedId]);

  return (
    <div
      ref={containerRef}
      className="h-[28rem] w-full"
      role="application"
      aria-label="Krabi map"
    />
  );
}
