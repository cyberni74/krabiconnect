export type TideLocation = {
  id: string;
  name: string;
  region: string;
  lat: number;
  lon: number;
  /**
   * Estimated height of mean sea level above chart datum (cm). Only used for
   * model sources that deliver heights relative to MSL, so every source is
   * shown on the same (approximate) chart-datum reference.
   */
  z0: number;
};

export const LOCATIONS: TideLocation[] = [
  { id: "krabi-town", name: "Krabi Town", region: "Pak Nam Krabi", lat: 8.02, lon: 98.87, z0: 180 },
  { id: "ao-nang", name: "Ao Nang", region: "Krabi", lat: 8.03, lon: 98.81, z0: 178 },
  { id: "railay", name: "Railay Beach", region: "Krabi", lat: 8.01, lon: 98.84, z0: 178 },
  { id: "phi-phi", name: "Phi Phi Islands", region: "Krabi", lat: 7.74, lon: 98.77, z0: 172 },
  { id: "koh-lanta", name: "Koh Lanta", region: "Krabi", lat: 7.62, lon: 99.03, z0: 175 },
  { id: "phang-nga", name: "Phang Nga Bay", region: "Phang Nga", lat: 8.27, lon: 98.5, z0: 185 },
  { id: "phuket", name: "Phuket", region: "Ao Chalong", lat: 7.815, lon: 98.36, z0: 160 },
];

export const DEFAULT_LOCATION_ID = "krabi-town";

export function getLocation(id: string | null | undefined): TideLocation {
  return LOCATIONS.find((l) => l.id === id) ?? LOCATIONS[0];
}

export function distanceKm(aLat: number, aLon: number, bLat: number, bLon: number): number {
  const R = 6371;
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLon = (bLon - aLon) * rad;
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/** Beyond this distance the GPS fix is outside the Krabi forecast area: do not switch location. */
export const MAX_GPS_KM = 60;

export function nearestLocation(lat: number, lon: number): { loc: TideLocation; km: number } {
  let best = LOCATIONS[0];
  let bestKm = Infinity;
  for (const l of LOCATIONS) {
    const km = distanceKm(lat, lon, l.lat, l.lon);
    if (km < bestKm) {
      bestKm = km;
      best = l;
    }
  }
  return { loc: best, km: bestKm };
}

/** 8.02, 98.87 → "08°01′N 098°52′E" (degrees + decimal minutes, chart style). */
export function fmtLatLon(lat: number, lon: number): string {
  const part = (v: number, pos: string, neg: string, width: number) => {
    const a = Math.abs(v);
    let deg = Math.floor(a);
    let min = Math.round((a - deg) * 60);
    if (min === 60) {
      deg += 1;
      min = 0;
    }
    return `${String(deg).padStart(width, "0")}°${String(min).padStart(2, "0")}′${v >= 0 ? pos : neg}`;
  };
  return `${part(lat, "N", "S", 2)} ${part(lon, "E", "W", 3)}`;
}
