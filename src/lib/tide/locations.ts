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
