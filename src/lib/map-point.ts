import { DISTRICTS } from "./constants";
import type { FeedCard } from "./types";

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
 * 1) numeric lat/lng (number or numeric string)
 * 2) district centroid
 * 3) Ao Nang last resort so the pin count matches the list when district is missing
 */
export function pointFor(item: Pick<MappableListing, "lat" | "lng" | "district">): [number, number] {
  const lat = asCoord(item.lat);
  const lng = asCoord(item.lng);
  if (lat != null && lng != null && lat >= -90 && lat <= 90) return [lng, lat];
  return districtCentroid(item.district) ?? AO_NANG;
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
