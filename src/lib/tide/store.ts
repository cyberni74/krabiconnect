import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_LOCATION_ID } from "./locations";

export type TideLang = "de" | "en" | "th";
export const TIDE_LANGS: TideLang[] = ["de", "en", "th"];

export type BoatSettings = {
  name: string;
  /** Draft in cm. */
  draft: number;
  /** Desired under-keel reserve in cm. */
  reserve: number;
  homePort: string;
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
  alerts: AlertSettings;
  setLang: (lang: TideLang) => void;
  setLocation: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setAutoGps: (on: boolean) => void;
  setScene: (on: boolean) => void;
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
      boat: { name: "", draft: 90, reserve: 50, homePort: "krabi-town" },
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
      setBoat: (patch) => set((s) => ({ boat: { ...s.boat, ...patch } })),
      setAlerts: (patch) => set((s) => ({ alerts: { ...s.alerts, ...patch } })),
    }),
    { name: "captain-tide-settings", version: 1 },
  ),
);

/** Transient UI state: an explicit time the background/readouts should show. */
type TideView = {
  /** null = live "now". */
  previewAt: number | null;
  setPreviewAt: (t: number | null) => void;
  /** Planned tour window shown on the instrument while the tour sheet is open. */
  tour: { from: number; to: number } | null;
  setTour: (w: { from: number; to: number } | null) => void;
};

export const useTideView = create<TideView>()((set) => ({
  previewAt: null,
  setPreviewAt: (previewAt) => set({ previewAt }),
  tour: null,
  setTour: (tour) => set({ tour }),
}));
