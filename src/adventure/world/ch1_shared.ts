import type { G, ItemDef, Reaction, Thing } from "../types";

/* Shared helpers of chapter 1 (Aschenfurt). All flags of this chapter are prefixed with c1_. */

export const F = (g: G, k: string) => !!g.flag(k);
export const N = (g: G, k: string) => Number(g.flag(k) ?? 0);
export const hasAllThree = (g: G) => g.has("schwert") && g.has("siegelbrief") && g.has("halvard_brief");

/** Extra items of this chapter (icon exists in public/g/items, but is not in the shared catalog). */
export const items: Record<string, ItemDef> = {
  stiefel_alt: { name: "Alter Stiefel", look: "Ein einzelner, steifer Lederstiefel. Wer verliert nur einen? Und warum fehlt der Fuß nicht?" },
  /* The blade is one object through the whole forge; its name follows the stage. */
  klingenbruch: {
    name: (g) => {
      const s = N(g, "c1_forge");
      return s >= 6 ? "Abgeschreckte Klinge" : s === 5 ? "Geformte Klinge" : s === 4 ? "Glühender Klingenbruch" : "Klingenbruch";
    },
    look: "Die Hälfte eines Schwertes, vom Rost zerfressen. Irgendwer hat damit mehr Mut als Glück gehabt.",
  },
};

/* ------------------------------------------------------------------ torch / darkness (gruft) */
export const TORCH_ACTIONS = 16;

export function lightTorch(g: G, source: string) {
  g.set("c1_torch_lit", true);
  g.set("c1_torch_left", TORCH_ACTIONS);
  g.sfx("fire");
  return g.say(source);
}

export const torchLit = (g: G) => F(g, "c1_torch_lit");
export const halterLit = (g: G) => F(g, "c1_halter_fackel");
/** Is there light in the crypt (carried torch or torch in the wall holder)? */
export const cryptLit = (g: G) => torchLit(g) || halterLit(g);

async function tick(g: G) {
  if (!torchLit(g)) return;
  const left = g.inc("c1_torch_left", -1);
  if (left === 4) await g.say("Die Fackel flackert unruhig. Das Pech geht zur Neige.");
  if (left <= 0) {
    g.set("c1_torch_lit", false);
    g.sfx("wrong");
    await g.say("Die Fackel spuckt, zischt und erlischt. Dunkelheit, wie sie nur Gräber kennen.");
    await g.say("Mit Feuerstein lässt sie sich wieder entzünden. Am besten oben, wo es hell ist.");
  }
}

const DARK_LINES = [
  "Stockfinster. Ich sehe meine eigene Hand nicht, und die ist mir noch am vertrautesten.",
  "Ich taste ins Nichts. Das Nichts tastet nicht zurück. Noch nicht.",
  "Ohne Licht greife ich hier höchstens in etwas, das ich später bereue.",
];

/** Wrap a reaction so it needs light (and burns torch time). */
const wrap = (r: Reaction | undefined): Reaction | undefined =>
  r === undefined
    ? undefined
    : async (g: G) => {
        if (!cryptLit(g)) {
          await g.say(DARK_LINES[Math.floor(Math.random() * DARK_LINES.length)]);
          return;
        }
        await runR(r, g);
        await tick(g);
      };

/** Everything in the crypt (except exits) needs light. */
export function needsLight(t: Thing): Thing {
  const out: Thing = { ...t };
  out.look = wrap(t.look);
  out.take = wrap(t.take);
  out.use = wrap(t.use);
  out.talk = wrap(t.talk);
  if (t.useWith) out.useWith = Object.fromEntries(Object.entries(t.useWith).map(([k, v]) => [k, wrap(v)!]));
  if (t.give) out.give = Object.fromEntries(Object.entries(t.give).map(([k, v]) => [k, wrap(v)!]));
  return out;
}

/** A reaction whose text depends on state. */
export const txt = (f: (g: G) => string): Reaction => (g: G) => g.say(f(g));

/** Run a reaction; a script may also just return the text to say. */
export async function runR(r: Reaction, g: G) {
  if (typeof r === "string") return g.say(r);
  const v = (await (r as (g: G) => unknown)(g)) as unknown;
  if (typeof v === "string") await g.say(v);
}

/** Make every reaction of a thing speak a returned string (convenience for conditional texts). */
export function speakReturns(t: Thing): Thing {
  const w = (r: Reaction | undefined): Reaction | undefined => (r === undefined || typeof r === "string" ? r : (g: G) => runR(r, g));
  const out: Thing = { ...t, look: w(t.look), take: w(t.take), use: w(t.use), talk: w(t.talk) };
  if (t.useWith) out.useWith = Object.fromEntries(Object.entries(t.useWith).map(([k, v]) => [k, w(v)!]));
  if (t.give) out.give = Object.fromEntries(Object.entries(t.give).map(([k, v]) => [k, w(v)!]));
  return out;
}
