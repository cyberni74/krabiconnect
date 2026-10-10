import { createTidePredictor } from "@neaps/tide-predictor";
import harmonics from "./harmonics.json" with { type: "json" };
import { DEFAULT_LOCATION_ID, type TideLocation } from "./locations.ts";
import { HOUR, type TideExtreme, type TideForecast } from "./model.ts";

/** How far ahead the app lets you look. Tides repeat, the maths works for any date. */
export const HORIZON_YEARS = 3;

type Predictor = ReturnType<typeof createTidePredictor>;
type LocationData = (typeof harmonics.locations)[keyof typeof harmonics.locations];

const predictors = new Map<string, Predictor>();

function dataFor(id: string): { id: string; data: LocationData } {
  const locations = harmonics.locations as Record<string, LocationData>;
  if (locations[id]) return { id, data: locations[id] };
  return { id: DEFAULT_LOCATION_ID, data: locations[DEFAULT_LOCATION_ID] };
}

/** Predictor whose levels are metres above the location's chart-datum reference. */
function predictorFor(id: string): { predictor: Predictor; data: LocationData } {
  const { id: key, data } = dataFor(id);
  let predictor = predictors.get(key);
  if (!predictor) {
    predictor = createTidePredictor(data.constituents, { offset: data.offsetM });
    predictors.set(key, predictor);
  }
  return { predictor, data };
}

export function horizonEnd(now: number): number {
  const d = new Date(now);
  d.setUTCFullYear(d.getUTCFullYear() + HORIZON_YEARS);
  return d.getTime();
}

/**
 * Tide prediction for [from, to] (epoch ms), sampled every `stepMin` minutes,
 * with exact high/low water times from the harmonic model. Runs fully offline.
 */
export function harmonicForecast(
  loc: TideLocation,
  from: number,
  to: number,
  stepMin = 15,
): TideForecast {
  const { predictor, data } = predictorFor(loc.id);
  const start = Math.floor(from / HOUR) * HOUR;
  const end = Math.ceil(to / HOUR) * HOUR;
  const line = predictor.getTimelinePrediction({
    start: new Date(start),
    end: new Date(end),
    timeFidelity: stepMin * 60,
  });
  const extremes: TideExtreme[] = predictor
    .getExtremesPrediction({ start: new Date(start), end: new Date(end) })
    .map((e) => ({
      t: e.time.getTime(),
      cm: e.level * 100,
      type: e.high ? ("high" as const) : ("low" as const),
    }));
  const ref = harmonics.reference;
  return {
    locationId: loc.id,
    source: "harmonic",
    sourceLabel: "Harmonische Vorhersage",
    station: `${ref.name} · TICON-4 (${data.basis === "table" ? "kalibriert" : "lokal korrigiert"})`,
    stationLat: ref.lat,
    stationLon: ref.lon,
    datum:
      data.basis === "table"
        ? "Tabellenbezug Pak Nam Krabi (kalibriert)"
        : "≈ LAT (berechnet, Thai-Seekarten können abweichen)",
    fetchedAt: from,
    t: line.map((p) => p.time.getTime()),
    cm: line.map((p) => p.level * 100),
    extremes,
    copyright: "TICON-4 / UHSLC (CC BY 4.0) · Open-Meteo.com (CC BY 4.0)",
  };
}

/** Predicted level (cm above the location's chart datum) at one instant. */
export function harmonicLevelAt(locationId: string, time: number): number {
  const { predictor } = predictorFor(locationId);
  return predictor.getWaterLevelAtTime({ time: new Date(time) }).level * 100;
}

export const harmonicMeta = {
  referenceName: harmonics.reference.name,
  generated: harmonics.generated,
};
