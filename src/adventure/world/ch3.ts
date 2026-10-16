import { hero } from "../dsl";
import type { ChapterModule, G, ItemDef, Reaction } from "../types";
import { burgtor } from "./ch3_burgtor";
import { burghof } from "./ch3_burghof";
import { becherInhalt, taskCount } from "./ch3_common";
import { bibliothek } from "./ch3_bibliothek";
import { kerker } from "./ch3_kerker";
import { ruestkammer } from "./ch3_ruestkammer";
import { thronsaal } from "./ch3_thronsaal";

/* =========================================================================
 * KAPITEL 3 — Burg Grauwacht
 *   burgtor      Grimm, Torwinde (Eisenstange + Pech), 3 Beweise ODER betrunkene Wache
 *   burghof      Roderic, Prüfung der Demut (4 Aufgaben + Eduards Bestechung), Hub
 *   ruestkammer  Rüstungsständer (4 Zustände), Spiegelschild (Sand + Lappen)
 *   bibliothek   Myrddin, Prüfung der Weisheit (Bücher, Waage, Rätsel) -> weisheitssiegel
 *   thronsaal    Kelch + Gegengift, Geheimfach (Runen), Malvor entlarven, Aufbruch -> Kapitel 4
 *   kerker       Knorr (Wein + Schlafkraut), Aldric (Zeuge), Zellenschlüssel
 *
 * Flags (c3_*): gate_open sneaked proof_{schwert,siegel,brief} winde_{kurbel,fett} wilm_drunk
 *   roderic_met t_{pferd,ruestung,suppe,hof} eduard_offered/resolved bribed demut_done
 *   stand(0..3) schild_sand books_ok tuer_offen waage_ok wissen_done
 *   malvor_away letter_out antidote king_cured fach_sichtbar fach_offen ev_{flasche,aldric,koenig}
 *   knorr_asleep wein_praep key_taken aldric_free exposed malvor_gone
 * ========================================================================= */

export const scenes = [burgtor, burghof, ruestkammer, bibliothek, thronsaal, kerker];

/** Overrides: the cup and the jug carry state (name shown depends on contents). */
export const items: Record<string, ItemDef> = {
  zinnbecher: {
    name: (g: G) => (becherInhalt(g) === "wein" ? "Becher mit Wein" : becherInhalt(g) === "suppe" ? "Becher mit Suppe" : "Zinnbecher"),
    look: "Ein verbeulter Zinnbecher. Er hat schon Wein, Suppe und Schlimmeres gesehen.",
  },
  wein: {
    name: (g: G) => (g.flag("c3_wein_praep") ? "Gewürzter Weinkrug" : "Weinkrug"),
    look: "Ein Tonkrug mit schwerem, rotem Wein. Er riecht nach Pflaumen und Entschuldigungen.",
  },
};

const polish: Record<string, Reaction> = {
  "sand+schild": async (g: G) => {
    if (g.flag("c3_schild_sand")) return g.say("Der Schild ist blank gescheuert. Mehr Sand macht ihn nur ärgerlicher.");
    g.set("c3_schild_sand", true);
    g.sfx("dig"); await g.pose("use", 800);
    await g.say("Ich scheuere den Schild mit Sand, bis der Rost nachgibt. Darunter blitzt Stahl. Jetzt noch glänzen.");
  },
  "lappen+schild": async (g: G) => {
    if (!g.flag("c3_schild_sand")) return g.say("Der Lappen verschmiert nur den Rost. Erst mit Sand scheuern, dann polieren.");
    g.sfx("magic"); await g.pose("use", 900);
    g.remove("schild"); g.add("spiegelschild");
    await g.say("Ich poliere, bis ich mein Gesicht sehe. Ein bleicher Junge starrt zurück. Ein Spiegelschild! Der Drache wird sein eigenes Feuer lieben.");
  },
  "lappen+sand": "Sand auf einen Lappen? Das gibt Schmirgel. Praktisch, aber ich brauche etwas, das ich polieren kann.",
  "schlafkraut+wein": async (g: G) => {
    if (g.flag("c3_wein_praep")) return g.say("Der Wein ist schon gewürzt. Mehr Kraut macht nur das Gewissen schwerer.");
    g.remove("schlafkraut"); g.set("c3_wein_praep", true);
    await g.say("Ich zerkrümele das Kraut im Krug und schüttle. Der Wein wird trüb und riecht nach Heu. Ein Opfer für jeden, der ihn trinkt.");
  },
  "totenkopf+zinnbecher": "Ein Zinnbecher auf einem Totenkopf? Sehr stimmungsvoll. Aber Wilm würde lachen.",
};
export const combos: Record<string, Reaction> = polish;

export const start = {
  scene: "burgtor",
  x: 80,
  y: 400,
  facing: 1 as const,
  inv: ["schwert", "siegelbrief", "halvard_brief", "gegengift", "hexentalisman", "fackel"],
  flags: { chapter: 3 },
  intro: async (g: G) => {
    await g.card("Kapitel 3", "Burg Grauwacht");
    await hero(g, "Burg Grauwacht. Mauern aus grauem Stein, Banner mit Raben, und ein Fallgitter, das aussieht, als hätte es Zähne.", "Das Moor liegt hinter mir. Das Schlimmste kommt vermutlich noch.");
  },
};

export const hint = (g: G): string => {
  if (!g.flag("c3_gate_open")) {
    const proofs = g.flag("c3_proof_schwert") && g.flag("c3_proof_siegel") && g.flag("c3_proof_brief");
    if (!g.flag("c3_winde_kurbel")) return "Das Fallgitter hängt an einer Winde ohne Kurbel. Such in der Schubkarre nach etwas Langem aus Eisen.";
    if (!g.flag("c3_winde_fett")) return "Die Winde klemmt: Nimm Pech aus dem Pechfass und schmiere sie.";
    if (!proofs) return "Zeige Hauptmann Grimm Schwert, Siegelbrief und Halvards Brief. Oder bring die Wache Wilm mit Wein dazu, den Hauptmann abzulenken.";
    return "Benutze die Torwinde und kurbele das Fallgitter hoch.";
  }
  if (g.flag("c3_exposed")) {
    if (!g.flag("c3_demut_done")) return "Schließe die Prüfung der Demut bei Ser Roderic im Burghof ab.";
    if (!g.has("weisheitssiegel")) return "Hol dir bei Myrddin im Bibliotheksturm das Siegel der Weisheit.";
    if (!g.has("spiegelschild")) return "Poliere den Schild aus der Rüstkammer mit Sand und Lappen zum Spiegelschild.";
    return "Sprich mit Ser Roderic im Thronsaal: Es geht zum Vulkan.";
  }
  if (!g.flag("c3_roderic_met")) return "Sprich im Burghof mit Ser Roderic, dem Ordensmeister.";
  if (!g.flag("c3_demut_done")) {
    if (!g.flag("c3_t_pferd")) return "Beschlage das Pferd Donnerhuf: Hufeisen im Futtertrog, Hammer und Nagel an der Werkbank, Apfel von Berta.";
    if (!g.flag("c3_t_ruestung")) return "Setze in der Rüstkammer die Rüstung zusammen: Brustpanzer, Helm, Armschienen. Der Schlüssel liegt auf der Werkbank im Hof.";
    if (!g.flag("c3_t_suppe")) return "Fülle einen Becher mit Suppe aus Bertas Kessel (erst mit ihr reden) und bringe ihn in den Kerker.";
    if (!g.flag("c3_t_hof")) return "Fege den Hof mit dem Besen.";
    return "Melde Ser Roderic, dass du alle Aufgaben erledigt hast. Gib Eduards Silber zurück, falls du es genommen hast.";
  }
  if (!g.has("weisheitssiegel")) {
    if (!g.flag("c3_books_ok")) return "Myrddins Prüfung: Zieh die Bücher in der Reihenfolge Rot, Schwarz, Blau, Grün.";
    if (!g.flag("c3_tuer_offen")) return "Beantworte das Rätsel des Bücherschranks: Was nimmt man, und es bleibt zurück?";
    if (!g.flag("c3_waage_ok")) return "Bringe die Waage ins Gleichgewicht: Die linke Schale wiegt fünf. Gewichte liegen im Messkasten.";
    return "Sprich mit Myrddin: Du hast alle drei Prüfungen bestanden.";
  }
  if (!g.flag("c3_king_cured")) {
    if (!g.flag("c3_antidote") && !g.flag("c3_malvor_away")) return "Lenke Kanzler Malvor ab (Halvards Brief oder der Hexentalisman) und träufle das Gegengift in den Weinkelch.";
    return "Gib im Thronsaal das Gegengift in den Kelch, solange Malvor abgelenkt ist.";
  }
  if (!g.has("spiegelschild")) return "Poliere den Schild aus der Rüstkammer mit Sand und Lappen zum Spiegelschild.";
  if (!g.flag("c3_aldric_free")) return "Befreie Ser Aldric im Kerker: Wein mit Schlafkraut (Berta) macht Knorr müde, der Schlüssel hängt am Haken.";
  if (!g.has("giftflasche") && !g.flag("c3_fach_offen")) return "Finde das Geheimfach hinter dem Wandteppich im Thronsaal. Die Runenfolge kennt Ser Aldric.";
  if (!g.flag("c3_exposed")) return "Klage Malvor an: Giftflasche, Aldrics Zeugnis und der genesene König.";
  return "Sprich mit Ser Roderic.";
};

export default { scenes, items, combos, start, hint } satisfies ChapterModule;
