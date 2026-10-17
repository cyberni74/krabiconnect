import { logicalSize } from "./assets";
import type { Facing, G, Pt, Reaction, Sfx, Thing } from "./types";
import { ITEMS } from "./world/items";

/* =========================================================================
 * Content DSL: small builders for the things a scene is made of.
 * Coordinates are scene units (960x440). x,y is the BOTTOM-CENTER (feet) of a sprite.
 * ========================================================================= */

export type Rect = [number, number, number, number];

/** Fixed edge zones used by edgeExit. */
export const EDGE: Record<"left" | "right", Rect> = { left: [0, 215, 86, 225], right: [874, 215, 86, 225] };

const MIN_HIT = 50;

/* ---------------------------------------------------------------- helpers */
export const says = async (g: G, who: string, ...lines: string[]) => {
  for (const l of lines) await g.say(l, who);
};
export const hero = async (g: G, ...lines: string[]) => {
  for (const l of lines) await g.say(l, "hero");
};
export const once = async (g: G, flag: string, fn: () => Promise<void> | void) => {
  if (g.flag(flag)) return false;
  g.set(flag, true);
  await fn();
  return true;
};

/* ---------------------------------------------------------------- dialogue */
export interface TalkOpt {
  text: string;
  /** Prerequisite: the topic is offered only while this holds. */
  show?: () => boolean;
  /** The topic's task is finished: the topic is no longer offered. */
  done?: () => boolean;
  run: () => Promise<void | "end"> | void | "end";
}
export async function talk(g: G, build: () => TalkOpt[]) {
  for (;;) {
    const opts = build().filter((o) => (!o.show || o.show()) && !o.done?.());
    if (!opts.length) return;
    const i = await g.choose(opts.map((o) => o.text));
    const r = await opts[i].run();
    if (r === "end") return;
  }
}
export function bye(farewell: string, who: string, g: G, label = "Auf Wiedersehen."): TalkOpt {
  return {
    text: label,
    run: async () => {
      await g.say(farewell, who);
      return "end" as const;
    },
  };
}

/* ---------------------------------------------------------------- items on the ground */
export interface GroundItemOpts {
  id: string;
  item: string;
  x: number;
  y: number;
  name?: string;
  /** Scale multiplier on top of the natural size. */
  scale?: number;
  at?: Pt;
  z?: number;
  hidden?: (g: G) => boolean;
  look?: Reaction;
  /** Line Bran says after picking it up. */
  say?: string;
  onTake?: (g: G) => Promise<void> | void;
  sfx?: Sfx;
  /** Extra take guard: return a message to refuse (item stays). */
  guard?: (g: G) => string | null | undefined;
  useWith?: Thing["useWith"];
  /** Not "pickup"-flagged (no glint). */
  quiet?: boolean;
}
export function groundItem(o: GroundItemOpts): Thing {
  const taken = `taken_${o.id}`;
  const sz = logicalSize("items", o.item) ?? [36, 36];
  const s = o.scale ?? 1;
  const w = sz[0] * s;
  const h = sz[1] * s;
  const hw = Math.max(MIN_HIT, w + 14);
  const hh = Math.max(MIN_HIT, h + 14);
  return {
    id: o.id,
    name: o.name ?? ITEMS[o.item]?.name ?? o.item,
    sprite: o.item,
    dir: "items",
    x: o.x,
    y: o.y,
    scale: s,
    hit: [o.x - hw / 2, o.y - h / 2 - hh / 2, hw, hh],
    at: o.at,
    z: o.z,
    hidden: (g) => !!g.flag(taken) || !!o.hidden?.(g),
    primary: o.quiet ? "look" : "take",
    look: o.look ?? ITEMS[o.item]?.look,
    useWith: o.useWith,
    take: async (g) => {
      const msg = o.guard?.(g);
      if (msg) return g.say(msg);
      await g.pose("pick", 600);
      g.sfx(o.sfx ?? "pickup");
      g.add(o.item);
      g.set(taken, true);
      if (o.say) await g.say(o.say);
      await o.onTake?.(g);
    },
  };
}

/* ---------------------------------------------------------------- containers */
export interface LockSpec {
  /** Item id that opens it. */
  key: string;
  text?: string;
  openText?: string;
  consume?: boolean;
}
export interface ContainerOpts {
  id: string;
  name: string;
  x: number;
  y: number;
  /** closed / open sprite keys under public/g/props. */
  sprites: { closed: string; open: string };
  scale?: number;
  contents: string[];
  title?: string;
  lock?: LockSpec;
  look?: Reaction;
  at?: Pt;
  face?: Facing;
  hit?: Rect;
  z?: number;
  hidden?: (g: G) => boolean;
  onOpen?: (g: G) => Promise<void> | void;
  sfx?: Sfx;
  emptyText?: string;
}
export function container(o: ContainerOpts): Thing {
  const openFlag = `open_${o.id}`;
  const unlockFlag = `unlocked_${o.id}`;
  const locked = (g: G) => !!o.lock && !g.flag(unlockFlag);
  return {
    id: o.id,
    name: o.name,
    sprite: (g) => (g.flag(openFlag) ? o.sprites.open : o.sprites.closed),
    x: o.x,
    y: o.y,
    scale: o.scale,
    hit: o.hit,
    at: o.at,
    face: o.face,
    z: o.z,
    hidden: o.hidden,
    primary: "use",
    look: o.look ?? (o.lock ? "Fest verschlossen." : "Ich könnte sie öffnen."),
    take: "Das lässt sich nicht mitnehmen. Aber vielleicht steckt etwas darin.",
    use: async (g) => {
      if (locked(g)) return g.say(o.lock!.text ?? "Verschlossen. Ich brauche einen Schlüssel.");
      if (!g.flag(openFlag)) {
        g.sfx(o.sfx ?? "creak");
        await g.pose("use", 500);
        g.set(openFlag, true);
        await o.onOpen?.(g);
      }
      if (!g.panelLeft(o.id, o.contents).length) {
        await g.say(o.emptyText ?? "Leer. Nur Staub und Spinnweben.");
        return;
      }
      await g.openPanel(o.title ?? o.name, o.id, o.contents);
    },
    useWith: o.lock
      ? {
          [o.lock.key]: async (g) => {
            if (!locked(g)) return g.say("Es ist schon offen.");
            g.sfx("unlock");
            await g.pose("use", 500);
            g.set(unlockFlag, true);
            if (o.lock!.consume) g.remove(o.lock!.key);
            await g.say(o.lock!.openText ?? "Es klickt. Offen.");
          },
        }
      : undefined,
  };
}

export interface DrawerSpec {
  /** Hit area as fractions [fx, fy, fw, fh] of the cabinet sprite (closed state). */
  hit: Rect;
  contents: string[];
  name?: string;
  lock?: LockSpec;
  look?: Reaction;
  onOpen?: (g: G) => Promise<void> | void;
}
export interface CabinetOpts {
  id: string;
  name: string;
  x: number;
  y: number;
  /** sprites[0] = closed, sprites[i] = drawer i open. */
  sprites: string[];
  scale?: number;
  drawers: DrawerSpec[];
  look?: Reaction;
  at?: Pt;
  z?: number;
  hidden?: (g: G) => boolean;
}
/** A cabinet with several drawers, each opened by tapping it. Returns [cabinet, ...drawers]. */
export function cabinet(o: CabinetOpts): Thing[] {
  const flag = `cab_${o.id}`;
  const sz = logicalSize("props", o.sprites[0]) ?? [100, 150];
  const s = o.scale ?? 1;
  const w = sz[0] * s;
  const h = sz[1] * s;
  const bx = o.x - w / 2;
  const by = o.y - h;
  const main: Thing = {
    id: o.id,
    name: o.name,
    sprite: (g) => o.sprites[Number(g.flag(flag) ?? 0)] ?? o.sprites[0],
    x: o.x,
    y: o.y,
    scale: s,
    at: o.at,
    z: o.z,
    hidden: o.hidden,
    primary: "use",
    look: o.look ?? "Ein Schrank mit Schubladen. Ich sollte sie durchsuchen.",
    take: "Viel zu schwer.",
    use: async (g) => {
      if (Number(g.flag(flag) ?? 0) > 0) {
        g.sfx("drawer");
        g.set(flag, 0);
        return;
      }
      await g.say("Ich sollte eine der Schubladen aufziehen.");
    },
  };
  const drawers = o.drawers.map((d, i): Thing => {
    const unlockFlag = `unlocked_${o.id}_${i + 1}`;
    const locked = (g: G) => !!d.lock && !g.flag(unlockFlag);
    const panelId = `${o.id}_${i + 1}`;
    return {
      id: `${o.id}_${i + 1}`,
      name: d.name ?? "Schublade",
      sprite: null,
      x: o.x,
      y: o.y,
      hit: [bx + d.hit[0] * w, by + d.hit[1] * h, d.hit[2] * w, d.hit[3] * h],
      at: o.at,
      z: o.z,
      hidden: o.hidden,
      primary: "use",
      look: d.look ?? (d.lock ? "Die Schublade ist verschlossen." : "Eine Schublade mit einem Eisengriff."),
      take: "Die Schublade lässt sich nicht herausreißen. Aber öffnen schon.",
      use: async (g) => {
        if (locked(g)) return g.say(d.lock!.text ?? "Verschlossen.");
        if (Number(g.flag(flag) ?? 0) !== i + 1) {
          g.sfx("drawer");
          await g.pose("use", 450);
          g.set(flag, i + 1);
          await d.onOpen?.(g);
        }
        if (!g.panelLeft(panelId, d.contents).length) {
          await g.say("Leer. Nur Staub und eine tote Spinne.");
          return;
        }
        await g.openPanel(d.name ?? o.name, panelId, d.contents);
      },
      useWith: d.lock
        ? {
            [d.lock.key]: async (g) => {
              if (!locked(g)) return g.say("Sie ist schon offen.");
              g.sfx("unlock");
              g.set(unlockFlag, true);
              if (d.lock!.consume) g.remove(d.lock!.key);
              await g.say(d.lock!.openText ?? "Es klickt. Die Schublade gibt nach.");
            },
          }
        : undefined,
    };
  });
  return [main, ...drawers];
}

/* ---------------------------------------------------------------- npcs */
export interface NpcOpts {
  id: string;
  name: string;
  x: number;
  y: number;
  /** frame name -> sprite key in public/g/chars. "idle" required, "talk" recommended. */
  frames: Record<string, string>;
  /** Start facing (art faces right). */
  facing?: Facing;
  scale?: number;
  look?: Reaction;
  talk?: Reaction;
  take?: Reaction;
  use?: Reaction;
  give?: Thing["give"];
  useWith?: Thing["useWith"];
  at?: Pt;
  hit?: Rect;
  hidden?: (g: G) => boolean;
  z?: number;
  light?: Thing["light"];
  pick?: (n: import("./types").NpcRuntime, g: G) => string | null;
}
export function npc(o: NpcOpts): Thing {
  const { frames, facing, pick, ...rest } = o;
  return { ...rest, npc: { frames, facing, pick }, primary: "talk" };
}

/* ---------------------------------------------------------------- props & decor */
export interface PropOpts extends Omit<Thing, "sprite" | "name"> {
  name: string | ((g: G) => string);
  sprite: string | ((g: G) => string | null);
}
export const prop = (o: PropOpts): Thing => o;
/** Pure decoration: drawn, never clickable. */
export const decor = (o: { id: string; sprite: string | ((g: G) => string | null); x: number; y: number; scale?: number; z?: number; flip?: boolean; dir?: Thing["dir"]; hidden?: (g: G) => boolean; light?: Thing["light"] }): Thing => ({
  ...o,
  name: "",
  decor: true,
});

/* ---------------------------------------------------------------- exits */
export interface ExitOpts {
  id: string;
  name: string;
  to: string;
  /** Hero position in the target scene. */
  x?: number;
  y?: number;
  facing?: Facing;
  at?: Pt;
  look?: Reaction;
  guard?: (g: G) => string | null | undefined | Promise<string | null | undefined>;
  hidden?: (g: G) => boolean;
  z?: number;
}
/** A door/passage with an explicit hit rect. */
export function exitThing(hit: Rect, o: ExitOpts): Thing {
  return {
    id: o.id,
    name: o.name,
    sprite: null,
    x: hit[0] + hit[2] / 2,
    y: Math.min(hit[1] + hit[3], 424),
    hit,
    at: o.at,
    hidden: o.hidden,
    z: o.z,
    look: o.look ?? `Der Weg führt weiter: ${o.name}.`,
    exit: { to: o.to, x: o.x, y: o.y, facing: o.facing, guard: o.guard },
  };
}
/** An exit on the left or right edge of the screen. */
export function edgeExit(side: "left" | "right", o: ExitOpts): Thing {
  const t = exitThing(EDGE[side], { at: o.at ?? { x: side === "left" ? 38 : 922, y: 410 }, ...o });
  return t;
}
