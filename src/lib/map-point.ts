import { DISTRICTS } from "./constants.ts";
import type { FeedCard } from "./types.ts";

/** Ao Nang — MapLibre / GeoJSON order is [lng, lat]. */
export const AO_NANG: [number, number] = [98.8222, 8.0363];

export type MappableListing = Pick<FeedCard, "id" | "kind" | "lat" | "lng" | "district">;

export type ListingCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: { type: "Point"; coordinates: [number, number] };
    properties: { id: string; kind: string };
  }>;
};

export function asCoord(n: unknown): number | null {
  if (typeof n === "number") return Number.isFinite(n) ? n : null;
  if (typeof n === "string" && n.trim() !== "") {
    const v = Number(n);
    return Number.isFinite(v) ? v : null;
  }
  return null;
}

function coordsForId(id: string): [number, number] | null {
  const d = DISTRICTS.find((x) => x.id === id);
  return d ? [d.lng, d.lat] : null;
}

/** Known district id or place name → centroid. Empty/unknown → null. */
export function districtCentroid(district?: string | null): [number, number] | null {
  const raw = (district ?? "").trim();
  if (!raw) return null;
  const lower = raw.toLowerCase();
  const exact = DISTRICTS.find(
    (d) => d.id === lower || d.nameEn.toLowerCase() === lower || d.nameTh === raw,
  );
  if (exact) return [exact.lng, exact.lat];
  if (lower.includes("ao nang") || lower.includes("ao-nang") || raw.includes("อ่าวนาง")) {
    return coordsForId("ao-nang");
  }
  if (lower.includes("railay") || raw.includes("ไร่เลย์")) return coordsForId("railay");
  if (lower.includes("klong") || lower.includes("khlong") || raw.includes("คลองม่วง")) {
    return coordsForId("klong-muang");
  }
  if (lower.includes("nong thale") || lower.includes("nong-thale") || raw.includes("หนองทะเล")) {
    return coordsForId("nong-thale");
  }
  if (lower.includes("noi") || raw.includes("กระบี่น้อย")) return coordsForId("krabi-noi");
  if (lower.includes("krabi") || raw.includes("กระบี่")) return coordsForId("krabi-town");
  return null;
}

/**
 * Resolve a listing to a map point. Never drops a row:
 * 1) numeric lat/lng (number or numeric string) — GeoJSON order [lng, lat]
 * 2) swapped columns (lat stored as 98.x, lng as 8.x)
 * 3) district centroid
 * 4) Ao Nang last resort so the pin count matches the list
 */
export function pointFor(item: Pick<MappableListing, "lat" | "lng" | "district">): [number, number] {
  const lat = asCoord(item.lat);
  const lng = asCoord(item.lng);
  if (lat != null && lng != null) {
    if (lat >= -90 && lat <= 90) return [lng, lat];
    if (lng >= -90 && lng <= 90) return [lat, lng];
  }
  return districtCentroid(item.district) ?? AO_NANG;
}

export type PinMark = {
  id: string;
  kind: string;
  lng: number;
  lat: number;
  count: number;
  listingIds: string[];
};

/** One pin per listing. Does not drop rows. */
export function listingPins(items: MappableListing[] | null | undefined): PinMark[] {
  return (items ?? []).map((item) => {
    const [lng, lat] = pointFor(item);
    return { id: item.id, kind: item.kind, lng, lat, count: 1, listingIds: [item.id] };
  });
}

/** Grid clusters at city zoom so stacked district pins stay tappable. */
export function clusterPins(pins: PinMark[], zoom: number): PinMark[] {
  if (zoom >= 13 || pins.length <= 1) return pins;
  const cell = zoom >= 12 ? 0.006 : zoom >= 11 ? 0.018 : 0.04;
  const groups = new Map<string, PinMark[]>();
  for (const p of pins) {
    const key = `${Math.round(p.lng / cell)}_${Math.round(p.lat / cell)}`;
    const arr = groups.get(key) ?? [];
    arr.push(p);
    groups.set(key, arr);
  }
  return [...groups.values()].map((group) => {
    const first = group[0];
    if (!first || group.length === 1) return first ?? pins[0]!;
    const lng = group.reduce((s, p) => s + p.lng, 0) / group.length;
    const lat = group.reduce((s, p) => s + p.lat, 0) / group.length;
    return {
      id: `cluster:${group.map((p) => p.id).sort().join(",")}`,
      kind: "cluster",
      lng,
      lat,
      count: group.reduce((s, p) => s + p.count, 0),
      listingIds: group.flatMap((p) => p.listingIds),
    };
  });
}

/** One GeoJSON point per listing. Does not filter null coords. */
export function listingsToGeoJSON(items: MappableListing[] | null | undefined): ListingCollection {
  return {
    type: "FeatureCollection",
    features: (items ?? []).map((item) => ({
      type: "Feature" as const,
      geometry: { type: "Point" as const, coordinates: pointFor(item) },
      properties: { id: item.id, kind: item.kind },
    })),
  };
}
