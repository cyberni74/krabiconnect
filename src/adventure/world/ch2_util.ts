import type { Rect } from "../dsl";
import type { Facing, G, Pt, Reaction, Sfx, Thing } from "../types";

/** Helpers shared by chapter 2 and chapter 4 (invisible hit areas painted into the backgrounds). */

/** A look-only spot over something painted into the background. */
export function spot(o: {
  id: string;
  name: string;
  hit: Rect;
  at: Pt;
  look: Reaction;
  use?: Reaction;
  take?: Reaction;
  talk?: Reaction;
  useWith?: Thing["useWith"];
  hidden?: (g: G) => boolean;
  face?: Facing;
}): Thing {
  return {
    id: o.id,
    name: o.name,
    sprite: null,
    x: o.hit[0] + o.hit[2] / 2,
    y: o.hit[1] + o.hit[3],
    hit: o.hit,
    at: o.at,
    face: o.face,
    hidden: o.hidden,
    primary: "look",
    look: o.look,
    use: o.use,
    take: o.take,
    talk: o.talk,
    useWith: o.useWith,
  };
}

/** An invisible container (shelf, hollow, pocket) painted into the background. */
export function hiddenBox(o: {
  id: string;
  name: string;
  hit: Rect;
  at: Pt;
  contents: string[];
  title?: string;
  look: Reaction;
  openText?: string;
  emptyText?: string;
  lock?: { key: string; text: string; openText: string; consume?: boolean };
  sfx?: Sfx;
  hidden?: (g: G) => boolean;
  onOpen?: (g: G) => Promise<void> | void;
  useWith?: Thing["useWith"];
}): Thing {
  const unlockFlag = `unlocked_${o.id}`;
  const locked = (g: G) => !!o.lock && !g.flag(unlockFlag);
  return {
    id: o.id,
    name: o.name,
    sprite: null,
    x: o.hit[0] + o.hit[2] / 2,
    y: o.hit[1] + o.hit[3],
    hit: o.hit,
    at: o.at,
    hidden: o.hidden,
    primary: "use",
    look: o.look,
    take: "Das Ganze mitnehmen? Ich suche lieber gezielt.",
    use: async (g) => {
      if (locked(g)) return g.say(o.lock!.text);
      if (!g.flag(`open_${o.id}`)) {
        g.set(`open_${o.id}`, true);
        g.sfx(o.sfx ?? "drawer");
        await g.pose("use", 450);
        if (o.openText) await g.say(o.openText);
        await o.onOpen?.(g);
      }
      if (!g.panelLeft(o.id, o.contents).length) return g.say(o.emptyText ?? "Leer. Nur Staub und eine tote Spinne.");
      await g.openPanel(o.title ?? o.name, o.id, o.contents);
    },
    useWith: {
      ...(o.useWith ?? {}),
      ...(o.lock
        ? {
            [o.lock.key]: async (g: G) => {
              if (!locked(g)) return g.say("Es ist schon offen.");
              g.sfx("unlock");
              await g.pose("use", 450);
              g.set(unlockFlag, true);
              if (o.lock!.consume) g.remove(o.lock!.key);
              await g.say(o.lock!.openText);
            },
          }
        : {}),
    },
  };
}
