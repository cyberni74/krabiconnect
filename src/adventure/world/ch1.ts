import { bye, cabinet, container, decor, edgeExit, exitThing, groundItem, hero, npc, once, says, talk } from "../dsl";
import type { ChapterModule, G, SceneDef } from "../types";
import { GEO } from "./geometry";

/* =========================================================================
 * KAPITEL 1 — Aschenfurt   (REFERENCE SKELETON: shows every DSL pattern once)
 * ========================================================================= */

const dorfplatz: SceneDef = {
  id: "dorfplatz",
  title: "Dorfplatz von Aschenfurt",
  bg: "dorfplatz",
  walk: GEO.dorfplatz.walk,
  scale: GEO.dorfplatz.scale,
  ambient: "village",
  fx: [{ kind: "fog", area: [0, 250, 960, 190], n: 0.8 }, { kind: "dust", n: 0.6 }],
  things: [
    // --- exits
    edgeExit("left", { id: "to_schmiede", name: "Zur Schmiede", to: "schmiede", x: 880, y: 405, facing: -1 }),
    edgeExit("right", { id: "to_waldrand", name: "Zum Waldrand", to: "waldrand", x: 80, y: 405, facing: 1 }),
    exitThing([748, 262, 52, 48], { id: "to_kapelle", name: "Kapelle", to: "kapelle", x: 480, y: 395, facing: 1, at: { x: 775, y: 322 } }),

    // --- an item lying around (separate sprite, vanishes when taken)
    groundItem({ id: "d_tonscherbe", item: "tonscherbe", x: 330, y: 400, say: "Eine Scherbe. Sie wird mich nicht reich machen." }),

    // --- a prop whose sprite changes with state; taking something from it
    {
      id: "galgen",
      name: "Galgen",
      sprite: (g) => (g.flag("galgen_leer") ? "galgen_leer" : "galgen"),
      x: 372,
      y: 372,
      look: "Der Galgen von Aschenfurt. Er hat öfter Arbeit als der Bäcker.",
      take: async (g) => {
        if (g.flag("galgen_leer")) return g.say("Hier hängt nichts mehr. Außer meiner Laune.");
        await g.pose("pick");
        g.sfx("pickup");
        g.set("galgen_leer", true);
        g.add("seil");
        await g.say("Ein gutes Seil. Der Henker wird es vermissen. Oder auch nicht.");
      },
      primary: "take",
    },

    // --- a drawer cabinet (tap a drawer to open; items are shown in a panel)
    ...cabinet({
      id: "schrank_demo",
      name: "Schrank",
      sprites: ["werkzeugschrank_zu", "werkzeugschrank_s1", "werkzeugschrank_s2", "werkzeugschrank_s3"],
      x: 560,
      y: 345,
      scale: 0.8,
      drawers: [
        { hit: [0.08, 0.1, 0.84, 0.25], contents: ["nadel_zwirn", "kreide"] },
        { hit: [0.08, 0.38, 0.84, 0.25], contents: ["feuerstein"], lock: { key: "eisenschluessel", text: "Abgeschlossen." } },
        { hit: [0.08, 0.66, 0.84, 0.25], contents: ["tote_ratte"] },
      ],
    }),

    // --- a chest with a lock
    container({
      id: "kiste_dorf",
      name: "Kiste",
      x: 460,
      y: 392,
      sprites: { closed: "kiste_dorf", open: "kiste_dorf_offen" },
      contents: ["brot_alt", "wuerfel"],
      lock: { key: "eisenschluessel", text: "Mit einem Vorhängeschloss gesichert.", openText: "Das Schloss springt auf." },
    }),

    // --- an npc with a dialogue tree
    npc({
      id: "brandt",
      name: "Feldwebel Brandt",
      x: 690,
      y: 372,
      facing: -1,
      frames: { idle: "brandt_idle", talk: "brandt_talk", point: "brandt_point" },
      look: "Feldwebel Brandt. Er sieht aus, als hätte er den Krieg gewonnen und dabei sich selbst verloren.",
      talk: async (g) => {
        await once(g, "met_brandt", async () => {
          await says(g, "brandt", "Du da! Totengräberjunge! Lungerst du wieder herum?");
          await hero(g, "Ich will zum Rabenorden, Feldwebel. Ich will Ritter werden.");
          await says(g, "brandt", "Ha! Du? Dann beweise es: Eine Klinge, den Segen der Kirche und einen Bürgen.");
        });
        await talk(g, () => [
          { text: "Was genau brauche ich?", run: () => says(g, "brandt", "Klinge, Segen, Bürge. Drei Dinge. Fehlt eins, gibt es keine Prüfung.") },
          { text: "Kennt Ihr einen Bürgen?", show: () => !!g.flag("met_brandt"), run: () => says(g, "brandt", "Ser Halvard lag zuletzt am Waldrand. Wenn er noch lebt.") },
          bye("Dann hol sie dir. Und zieh dir was Sauberes an.", "brandt", g, "Ich komme wieder."),
        ]);
      },
    }),
  ],
};

export const scenes: SceneDef[] = [dorfplatz];

export const start = {
  scene: "dorfplatz",
  x: 520,
  y: 400,
  facing: 1 as const,
  inv: [] as string[],
  flags: { chapter: 1 },
  intro: async (g: G) => {
    await g.card("Kapitel 1", "Der Rabeneid");
    await hero(g, "Aschenfurt. Dreck, Krähen und ein Galgen, der nie Urlaub hat.", "Heute ändere ich mein Leben. Heute werde ich Ritter.");
  },
};

export const hint = (g: G): string => {
  if (!g.flag("met_brandt")) return "Sprich mit Feldwebel Brandt auf dem Dorfplatz.";
  return "Beschaffe Klinge, Segen und einen Bürgen.";
};

export default { scenes, start, hint } satisfies ChapterModule;
