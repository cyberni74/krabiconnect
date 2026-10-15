import type { Facing, G, SceneDef } from "../types";
import { beach, clearing, lighthouse, pier, shop, street, tavern } from "./ch1";
import { deck, grotto, mangrove, temple } from "./ch2";
import { kohCave, kohJungle, kohPier } from "./koh";

export const SCENES: Record<string, SceneDef> = {
  pier,
  street,
  tavern,
  shop,
  beach,
  clearing,
  lighthouse,
  deck,
  mangrove,
  temple,
  grotto,
  koh_pier: kohPier,
  koh_jungle: kohJungle,
  koh_cave: kohCave,
};

export interface ChapterDef {
  /** localStorage key of this chapter's save. */
  key: string;
  start: string;
  x: number;
  y: number;
  facing: Facing;
  inv: string[];
  intro: (g: G) => Promise<void>;
  endText: string;
}

export const CHAPTERS: Record<"ch1" | "insel", ChapterDef> = {
  ch1: {
    key: "krabbenbucht-save-v1",
    start: "pier",
    x: 760,
    y: 384,
    facing: -1,
    inv: [],
    intro: async (g) => {
      await g.card("Kapitel 1", "Licht, Richtung und ein Lied");
      await pier.enter?.(g);
    },
    endText: "Die Flut ist zurück, Morwenna ist eine Seegurke, und Finn Kielwasser ist offiziell Pirat. Ein bisschen jedenfalls.",
  },
  insel: {
    key: "koh-kham-nang-save-v1",
    start: "koh_pier",
    x: 780,
    y: 384,
    facing: 1,
    inv: ["lampe"],
    intro: async (g) => {
      await g.card("Kapitel 3", "Die Gezeitenhöhle von Koh Kham Nang");
      await kohPier.enter?.(g);
    },
    endText: "Nok hat das Logbuch ihrer Großmutter. Die letzte Seite zeigt eine Karte zur nächsten Insel. Fortsetzung folgt.",
  },
};
