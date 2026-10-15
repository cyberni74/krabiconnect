import type { Facing, Flags, G, SceneDef } from "../types";
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

/** The whole game as one story: Finn in chapters 1 and 2, Nok in chapter 3. */
export interface ChapterDef {
  /** localStorage key of the save. */
  key: string;
  /** Scene shown behind the title screen's menu. */
  start: string;
  endText: string;
  /** Generated hero frames for Finn: stand, stride A, passing, stride B. */
  heroFrames?: string[];
  title: string;
  subtitle: string;
  titleArt: string;
}

export const CHAPTERS: Record<"ch1", ChapterDef> = {
  ch1: {
    key: "krabbenbucht-save-v1",
    start: "pier",
    title: "Die Gezeiten von Krabbenbucht",
    subtitle: "Ein Piraten-Abenteuer in drei Kapiteln",
    titleArt: "/art/title-krabbenbucht.png",
    heroFrames: ["/chars/finn-stand.png", "/chars/finn-walk.png", "/chars/finn-passing.png", "/chars/finn-stride-b.png"],
    endText:
      "Die Flut ist zurück, Morwenna lebt in einem Glas, und Nok hält das Logbuch ihrer Großmutter in den Händen. Die letzte Seite zeigt eine Karte zur nächsten Insel. Fortsetzung folgt.",
  },
};

export interface ChapterStart {
  scene: string;
  x: number;
  y: number;
  facing: Facing;
  inv: string[];
  flags: Flags;
  intro: (g: G) => Promise<void>;
}

/** Where each chapter begins (also used by the chapter menu to replay from there). */
export const CHAPTER_STARTS: Record<1 | 2 | 3, ChapterStart> = {
  1: {
    scene: "pier",
    x: 620,
    y: 396,
    facing: -1,
    inv: [],
    flags: {},
    intro: async (g) => {
      await g.card("Kapitel 1", "Licht, Richtung und ein Lied");
      await pier.enter?.(g);
    },
  },
  2: {
    scene: "deck",
    x: 300,
    y: 400,
    facing: 1,
    inv: ["kompass", "medaille"],
    flags: { chapter: 2, ch1done: true, quest: true, lit: true, tideGone: true },
    intro: async (g) => {
      await g.card("Kapitel 2", "Die Gezeitenperle");
      await deck.enter?.(g);
    },
  },
  3: {
    scene: "koh_pier",
    x: 780,
    y: 384,
    facing: 1,
    inv: ["lampe"],
    flags: { chapter: 3 },
    intro: async (g) => {
      await g.card("Kapitel 3", "Die Gezeitenhöhle von Koh Kham Nang");
      await kohPier.enter?.(g);
    },
  },
};
