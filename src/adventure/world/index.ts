import type { World } from "../engine";
import type { ChapterModule, G, ItemDef, Reaction, SceneDef } from "../types";
import * as ch1 from "./ch1";
import * as ch2 from "./ch2";
import * as ch3 from "./ch3";
import * as ch4 from "./ch4";
import { COMBOS_BASE, ITEMS } from "./items";

const chapters: ChapterModule[] = [ch1, ch2, ch3, ch4];

const scenes: Record<string, SceneDef> = {};
const items: Record<string, ItemDef> = { ...ITEMS };
const combos: Record<string, Reaction> = { ...COMBOS_BASE };
for (const c of chapters) {
  for (const s of c.scenes) {
    if (scenes[s.id]) throw new Error("duplicate scene " + s.id);
    scenes[s.id] = s;
  }
  Object.assign(items, c.items ?? {});
  Object.assign(combos, c.combos ?? {});
}

export const world: World = {
  scenes,
  items,
  combos,
  starts: { 1: ch1.start, 2: ch2.start, 3: ch3.start, 4: ch4.start },
  titleScene: "dorfplatz",
  hint: (g: G) => {
    const ch = Number(g.flag("chapter") ?? 1);
    return (chapters[Math.max(0, Math.min(3, ch - 1))] ?? ch1).hint(g);
  },
};

export const CHAPTER_TITLES = ["Der Rabeneid", "Das Hexenmoor", "Burg Grauwacht", "Der Vulkan"];
