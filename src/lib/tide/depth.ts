import type { DepthMark } from "./store.ts";

/** Within this many cm of the required depth a spot is flagged "tight" (amber). */
export const TIGHT_MARGIN_CM = 30;

export type ZoneState = "red" | "amber" | "none" | "no-draft";

export type ZoneEval = {
  mark: DepthMark;
  /** Predicted level at chart datum at the evaluation time (cm). */
  levelCm: number;
  /** charted depth + level − draft − reserve (cm); null without a draft. */
  clearanceCm: number | null;
  state: ZoneState;
};

/**
 * Clearance under the keel at a charted spot, from the captain's own chart
 * depth. Only ever flags *insufficient* depth: a spot that is not red/amber is
 * "no statement", never "safe" — charts, currents and sandbanks move.
 */
export function evaluateMark(
  mark: DepthMark,
  levelCm: number,
  draftCm: number | null,
  reserveCm: number,
): ZoneEval {
  if (draftCm == null) return { mark, levelCm, clearanceCm: null, state: "no-draft" };
  const clearance = mark.depthM * 100 + levelCm - draftCm - reserveCm;
  const state: ZoneState = clearance < 0 ? "red" : clearance < TIGHT_MARGIN_CM ? "amber" : "none";
  return { mark, levelCm, clearanceCm: clearance, state };
}

const R_EARTH = 6_371_000;
const rad = Math.PI / 180;

/** Point at `distM` metres from [lat, lon] in direction `bearing` (radians, 0 = north). */
function destination(
  [lat, lon]: [number, number],
  distM: number,
  bearing: number,
): [number, number] {
  const d = distM / R_EARTH;
  const la = lat * rad;
  const lo = lon * rad;
  const lat2 = Math.asin(
    Math.sin(la) * Math.cos(d) + Math.cos(la) * Math.sin(d) * Math.cos(bearing),
  );
  const lon2 =
    lo +
    Math.atan2(
      Math.sin(bearing) * Math.sin(d) * Math.cos(la),
      Math.cos(d) - Math.sin(la) * Math.sin(lat2),
    );
  return [lat2 / rad, lon2 / rad];
}

function bearingBetween(a: [number, number], b: [number, number]): number {
  const la = a[0] * rad;
  const lb = b[0] * rad;
  const dl = (b[1] - a[1]) * rad;
  return Math.atan2(
    Math.sin(dl) * Math.cos(lb),
    Math.cos(la) * Math.sin(lb) - Math.sin(la) * Math.cos(lb) * Math.cos(dl),
  );
}

/** GeoJSON ring ([lon, lat]) approximating a circle. */
export function circleRing(
  center: [number, number],
  radiusM: number,
  steps = 40,
): [number, number][] {
  const ring: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const [lat, lon] = destination(center, radiusM, (i / steps) * 2 * Math.PI);
    ring.push([lon, lat]);
  }
  return ring;
}

/** GeoJSON ring ([lon, lat]) of a "capsule": the A→B line widened by `halfWidthM`, round ends. */
export function capsuleRing(
  a: [number, number],
  b: [number, number],
  halfWidthM: number,
  steps = 16,
): [number, number][] {
  const theta = bearingBetween(a, b);
  const ring: [number, number][] = [];
  // Around B from the left side (θ−90°) over the far end to the right side (θ+90°)…
  for (let i = 0; i <= steps; i++) {
    const [lat, lon] = destination(b, halfWidthM, theta - Math.PI / 2 + (i / steps) * Math.PI);
    ring.push([lon, lat]);
  }
  // …then around A back to the start.
  for (let i = 0; i <= steps; i++) {
    const [lat, lon] = destination(a, halfWidthM, theta + Math.PI / 2 + (i / steps) * Math.PI);
    ring.push([lon, lat]);
  }
  ring.push(ring[0]);
  return ring;
}

export function markCenter(m: DepthMark): [number, number] {
  return m.b ? [(m.a[0] + m.b[0]) / 2, (m.a[1] + m.b[1]) / 2] : m.a;
}

export function markRing(m: DepthMark): [number, number][] {
  return m.b ? capsuleRing(m.a, m.b, m.radiusM) : circleRing(m.a, m.radiusM);
}

export function zonesGeoJSON(evals: ZoneEval[]) {
  return {
    type: "FeatureCollection" as const,
    features: evals.map((e) => ({
      type: "Feature" as const,
      properties: { id: e.mark.id, state: e.state },
      geometry: { type: "Polygon" as const, coordinates: [markRing(e.mark)] },
    })),
  };
}
