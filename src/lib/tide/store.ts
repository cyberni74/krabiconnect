import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_LOCATION_ID } from "./locations";

export type TideLang = "de" | "en" | "th";
export const TIDE_LANGS: TideLang[] = ["de", "en", "th"];

export type BoatSettings = {
  /** Individual boat name. */
  name: string;
  model: string;
  engine: string;
  /** Manufacturer figures. */
  lengthM: number | null;
  beamM: number | null;
  weightKg: number | null;
  fuelL: number | null;
  persons: number | null;
  ceCategory: string;
  /** Draft in cm at the lowest point (propeller/skeg). null = not measured yet — never guessed. */
  draft: number | null;
  /** Desired under-keel reserve in cm. */
  reserve: number;
  homePort: string;
};

/**
 * A shallow spot or channel section the captain entered from a verified chart.
 * `depthM` is the charted depth in metres at chart datum (negative = dries).
 */
export type DepthMark = {
  id: string;
  kind: "point" | "segment";
  name: string;
  depthM: number;
  /** Radius (point) or half-width (segment) in metres. */
  radiusM: number;
  a: [number, number]; // [lat, lon]
  b?: [number, number];
};

export type AlertSettings = {
  beforeHigh: boolean;
  beforeLow: boolean;
  /** Minutes before the event. */
  leadMin: number;
  aboveOn: boolean;
  above: number;
  belowOn: boolean;
  below: number;
};

type TideSettings = {
  lang: TideLang;
  locationId: string;
  favorites: string[];
  autoGps: boolean;
  /** Show the supplied Krabi illustrations behind the instruments. */
  scene: boolean;
  boat: BoatSettings;
  marks: DepthMark[];
  showZones: boolean;
  alerts: AlertSettings;
  setLang: (lang: TideLang) => void;
  setLocation: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setAutoGps: (on: boolean) => void;
  setScene: (on: boolean) => void;
  setShowZones: (on: boolean) => void;
  upsertMark: (m: DepthMark) => void;
  removeMark: (id: string) => void;
  setBoat: (patch: Partial<BoatSettings>) => void;
  setAlerts: (patch: Partial<AlertSettings>) => void;
};

export const useTideSettings = create<TideSettings>()(
  persist(
    (set) => ({
      lang: "de",
      locationId: DEFAULT_LOCATION_ID,
      favorites: [DEFAULT_LOCATION_ID],
      autoGps: false,
      scene: false,
      // Maker figures for the Atomix 705 HT; draft stays empty until measured.
      boat: {
        name: "",
        model: "Atomix 705 HT",
        engine: "",
        lengthM: 7.2,
        beamM: 2.4,
        weightKg: 1400,
        fuelL: 220,
        persons: 7,
        ceCategory: "C",
        draft: null,
        reserve: 50,
        homePort: "krabi-town",
      },
      marks: [],
      showZones: false,
      alerts: {
        beforeHigh: false,
        beforeLow: false,
        leadMin: 30,
        aboveOn: false,
        above: 300,
        belowOn: false,
        below: 150,
      },
      setLang: (lang) => set({ lang }),
      setLocation: (locationId) => set({ locationId }),
      toggleFavorite: (id) =>
        set((s) => ({
          favorites: s.favorites.includes(id)
            ? s.favorites.filter((f) => f !== id)
            : [...s.favorites, id],
        })),
      setAutoGps: (autoGps) => set({ autoGps }),
      setScene: (scene) => set({ scene }),
      setShowZones: (showZones) => set({ showZones }),
      upsertMark: (m) =>
        set((s) => ({
          marks: s.marks.some((x) => x.id === m.id)
            ? s.marks.map((x) => (x.id === m.id ? m : x))
            : [...s.marks, m].slice(-200),
        })),
      removeMark: (id) => set((s) => ({ marks: s.marks.filter((m) => m.id !== id) })),
      setBoat: (patch) => set((s) => ({ boat: { ...s.boat, ...patch } })),
      setAlerts: (patch) => set((s) => ({ alerts: { ...s.alerts, ...patch } })),
    }),
    {
      name: "captain-tide-settings",
      version: 2,
      migrate: (persisted, version) => {
        const p = persisted as Partial<TideSettings> & { boat?: Partial<BoatSettings> };
        if (version < 2 && p.boat) {
          // v1 shipped an invented 90 cm default; a draft must be measured, not assumed.
          if (p.boat.draft === 90) p.boat.draft = null;
          p.boat = { ...useTideSettings.getInitialState().boat, ...p.boat };
        }
        return p as TideSettings;
      },
    },
  ),
);

/** Transient UI state: an explicit time the background/readouts should show. */
type TideView = {
  /** null = live "now". */
  previewAt: number | null;
  setPreviewAt: (t: number | null) => void;
};

export const useTideView = create<TideView>()((set) => ({
  previewAt: null,
  setPreviewAt: (previewAt) => set({ previewAt }),
}));
