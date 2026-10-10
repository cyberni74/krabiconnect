import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_LOCATION_ID } from "./locations";

export type TideLang = "de" | "en" | "th";
export const TIDE_LANGS: TideLang[] = ["de", "en", "th"];

/** Browser language -> app language. Anything unknown falls back to English. */
export function detectLang(): TideLang {
  if (typeof navigator === "undefined") return "en";
  const list = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const raw of list) {
    const code = String(raw || "")
      .toLowerCase()
      .split("-")[0];
    if (code === "de" || code === "en" || code === "th") return code;
  }
  return "en";
}

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
  /** Where the draft figure comes from; "published" = maker figure, not measured on this boat. */
  draftSource: "published" | "measured" | null;
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
  /** true once the captain picked a language by hand; then the browser setting is ignored. */
  langManual: boolean;
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
      lang: detectLang(),
      langManual: false,
      locationId: DEFAULT_LOCATION_ID,
      favorites: [DEFAULT_LOCATION_ID],
      autoGps: false,
      scene: false,
      // Maker figures for the Atomix 705 HT.
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
        // Published maker figure (hull); the drive/propeller can reach deeper.
        draft: 50,
        draftSource: "published",
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
      setLang: (lang) => set({ lang, langManual: true }),
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
      version: 4,
      migrate: (persisted, version) => {
        const p = persisted as Partial<TideSettings> & { boat?: Partial<BoatSettings> };
        if (version < 2 && p.boat && p.boat.draft === 90) p.boat.draft = null; // v1: invented default
        if (version < 3 && p.boat) {
          p.boat = { ...useTideSettings.getInitialState().boat, ...p.boat };
          // Empty draft -> the published Atomix figure, flagged as such.
          if (p.boat.draft == null) {
            p.boat.draft = 50;
            p.boat.draftSource = "published";
          }
        }
        if (version < 4) {
          // Earlier builds always stored "de". Until a language is picked by hand, follow the browser.
          p.langManual = false;
          p.lang = detectLang();
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
  /** Last GPS fix of the device (not the prediction point). */
  userFix: { lat: number; lon: number } | null;
  setUserFix: (f: { lat: number; lon: number } | null) => void;
};

export const useTideView = create<TideView>()((set) => ({
  previewAt: null,
  setPreviewAt: (previewAt) => set({ previewAt }),
  userFix: null,
  setUserFix: (userFix) => set({ userFix }),
}));
