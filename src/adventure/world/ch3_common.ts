import type { G, Reaction, Thing } from "../types";

export type Rect = [number, number, number, number];

/** Invisible hit area over something painted into the background (look text, optional use). */
export function spot(id: string, name: string, hit: Rect, look: Reaction, o: Partial<Thing> = {}): Thing {
  return {
    id,
    name,
    sprite: null,
    x: hit[0] + hit[2] / 2,
    y: Math.min(hit[1] + hit[3], 420),
    hit,
    at: { x: Math.max(60, Math.min(900, hit[0] + hit[2] / 2)), y: 400 },
    look,
    ...o,
  };
}

export const TASKS = ["c3_t_pferd", "c3_t_ruestung", "c3_t_suppe", "c3_t_hof"] as const;
export const taskCount = (g: G) => TASKS.filter((k) => g.flag(k)).length;

/** Items Bran must carry into chapter 4. Seil/Fackel/Weihwasser are re-issued if missing. */
export function ensureKit(g: G) {
  for (const i of ["seil", "fackel", "weihwasser"]) if (!g.has(i)) g.add(i);
}

export const becherInhalt = (g: G) => String(g.flag("c3_becher") ?? "");

/** A look/use text that depends on state. */
export const txt = (f: (g: G) => string): Reaction => (g) => g.say(f(g));
