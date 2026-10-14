import type { G } from "./types";

export interface Opt {
  text: string;
  show?: () => boolean;
  run: () => Promise<void | "end">;
}

/** Dialogue tree loop: hero speaks the chosen line, then the option runs. */
export async function talk(g: G, opts: () => Opt[]) {
  for (;;) {
    const list = opts().filter((o) => !o.show || o.show());
    const i = await g.choose(list.map((o) => o.text));
    await g.say(list[i].text);
    if ((await list[i].run()) === "end") return;
  }
}

export const bye = (line: string, who: string, g: G): Opt => ({
  text: "Bis später.",
  run: async () => {
    await g.say(line, who);
    return "end";
  },
});

/* ---------- Shanty duel ---------- */

export const VERSES = [
  {
    id: "v1",
    insult: "Dein Kahn ist so leck, er sinkt schon im Hafenbecken!",
    answer: "Doch deiner treibt kieloben – man sieht ihn von allen Ecken!",
  },
  {
    id: "v2",
    insult: "Mein Säbel ist schneller als ein Blitz im Gewitter!",
    answer: "Und trotzdem schmeckt dein Grog wie Spülwasser – bitter!",
  },
  {
    id: "v3",
    insult: "Ich habe schon Haie mit bloßen Händen bezwungen!",
    answer: "Die Haie erzählen, du hast sie nur müde gesungen!",
  },
  {
    id: "v4",
    insult: "Vor meinem Namen erzittert die ganze Flotte!",
    answer: "Weil deine Socken so stinken – nach Moder und Motte!",
  },
] as const;

const FLOPS = [
  "Äh… selber!",
  "Das sag ich meiner Oma!",
  "Schöner Hut übrigens.",
  "Reimt sich das? Ich bin verwirrt.",
  "Ich… ähm… Krabbe!",
  "Lalala, ich hör dich nicht!",
];

function shuffle<T>(a: T[]): T[] {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export function learned(g: G) {
  return VERSES.filter((v) => g.flag("learned_" + v.id)).length;
}

export async function teach(g: G, idx: number, who: string) {
  const v = VERSES[idx];
  await g.say(`Wenn dir einer kommt mit: „${v.insult}“`, who);
  await g.say(`Dann sag: „${v.answer}“`, who);
  if (!g.flag("learned_" + v.id)) {
    g.set("learned_" + v.id);
    g.sfx("pickup");
    await g.say(`Gemerkt! Das sind ${learned(g)} von 4 Strophen.`);
  }
}

/** Returns true when the hero wins all four rounds. */
export async function duel(g: G, who: string): Promise<boolean> {
  const rounds = shuffle([...VERSES]);
  await g.say("Musik, Maestro! *klimper* *klimper*", who);
  for (const v of rounds) {
    await g.say(v.insult, who);
    const known = VERSES.filter((x) => g.flag("learned_" + x.id)).map((x) => x.answer);
    const flops = shuffle(FLOPS).slice(0, 2);
    const opts = shuffle([...known, ...flops]);
    const i = await g.choose(opts);
    await g.say(opts[i]);
    if (opts[i] !== v.answer) {
      g.sfx("wrong");
      await g.say("HA! Das reimt sich ja nicht mal auf sich selbst!", who);
      await g.say("Komm wieder, wenn du ein paar ordentliche Strophen gelernt hast.", who);
      if (learned(g) < 4) await g.say("Hm. In Krabbenbucht kennt jeder irgendeinen Konter. Ich sollte mich umhören.");
      return false;
    }
    await g.say(["Argh! Getroffen!", "Nicht schlecht, Grünschnabel…", "Hmpf. Zufall!", "Meine Mandoline weint!"][VERSES.indexOf(v)], who);
  }
  return true;
}
