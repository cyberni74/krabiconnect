/* Full playthrough of chapter 1 (headless). Run: sh tools/run-ts.sh tools/play-ch1.ts */
import { Harness } from "../src/adventure/testing";
import { world } from "../src/adventure/world";

const h = new Harness(world);
const g = h.g;
g.newGame(1);
await new Promise((r) => setTimeout(r, 20)); // let the async intro finish

const D = "dorfplatz", S = "schmiede", K = "kapelle", G = "gruft", W = "waldrand";
const say = (n = 1) => h.log.slice(-n).join(" | ");
const expectSay = (frag: string, n = 6) => {
  if (!h.log.slice(-n).some((l) => l.toLowerCase().includes(frag.toLowerCase()))) throw new Error(`expected log containing "${frag}" in:\n` + h.log.slice(-n).join("\n"));
};
const expectNoSay = (frag: string, n = 6) => {
  if (h.log.slice(-n).some((l) => l.includes(frag))) throw new Error(`unexpected "${frag}"`);
};
const stage = (n: number) => {
  const v = Number(g.flag("c1_forge") ?? 0);
  if (v !== n) throw new Error(`forge stage expected ${n}, got ${v}`);
};
h.expectFlag("met_brandt");
h.expectFlag("chapter", 1);

/* ---------------------------------------------------------------- dorfplatz: first look, briefing */
await h.act(D, "brandt", "talk", undefined, ["Was genau", "Wo bekomme ich eine Klinge", "Und der Segen", "Wer könnte", "komme wieder"]);
h.expectFlag("c1_halvard_bekannt");
await h.act(D, "anschlagbrett", "look");
h.expectFlag("c1_dekret_gelesen");
await h.act(D, "anschlagbrett", "take");
await h.act(D, "kiste_dorf", "use"); // locked
expectSay("Vorhängeschloss");
await h.act(D, "galgen", "take"); // raven blocks
expectSay("Rabe");
h.expectNoInv("seil");
await h.act(D, "brunnen", "use"); // no rope
expectSay("Seil");
await h.act(D, "hilda", "talk", undefined, ["Wo wächst", "Kennt Ihr eine verschlossene", "Was ist mit dem Leichenkarren", "Kennt Ihr den Ritter", "Ich suche das Kraut"]);

/* honor choices at the cart */
await h.act(D, "leichenkarren", "use", undefined, ["Tuch zurechtlegen"]);
h.expectFlag("honor", 1);
await h.act(D, "leichenkarren", "use", undefined, ["Münzbeutel nehmen"]);
h.expectFlag("honor", 0);
h.expectInv("muenzbeutel");

/* the heap and little things */
await h.act(D, "heuhaufen", "use");
h.expectInv("stiefel_alt");
await h.act(D, "d_nagel", "take");
await h.act(D, "d_tonscherbe", "take");
await h.act(D, "d_knochen", "take");
await h.act(D, "pechfass", "take");
expectSay("Schöpfen");
await h.act(D, "regentonne", "use");

/* ---------------------------------------------------------------- schmiede: tools */
await h.act(S, "gero", "talk", undefined, ["Wie schmiedet", "Was kostet", "Habt Ihr etwas zur Gruft", "Auf Wiedersehen"]);
h.expectFlag("c1_met_gero");
await h.act(S, "schrank_2", "use");
h.take("schrank_2", "feuerstein");
h.take("schrank_2", "kohlekiste_schluessel");
await h.act(S, "schrank_3", "use");
h.take("schrank_3", "eisenschluessel");
await h.act(S, "schrank_1", "use");
h.take("schrank_1", "nadel_zwirn");
h.take("schrank_1", "zinnbecher");
await h.act(S, "s_eimer", "take");
await h.act(S, "s_hammer", "take");
h.expectInv("eimer", "hammer", "eisenschluessel");

/* wrong-order attempts at the forge */
await h.act(S, "amboss", "use", "hammer");
expectSay("kalten");
await h.act(S, "blasebalg", "use");
expectSay("Loch");
await h.act(S, "kohlekiste", "use"); // locked
expectSay("abgeschlossen");
await h.act(S, "kohlekiste", "use", "eisenschluessel"); // wrong key
await h.act(S, "kohlekiste", "use", "kohlekiste_schluessel");
await h.act(S, "kohlekiste", "use");
h.take("kohlekiste", "kohle");
await h.act(S, "esse", "use", "feuerstein"); // no fuel yet
expectSay("Kohle");
stage(0);
await h.act(S, "esse", "use", "kohle");
stage(1);
await h.act(S, "esse", "use", "feuerstein");
stage(2);
await h.act(S, "blasebalg", "use", "nadel_zwirn"); // no leather yet? we do have the boot
h.expectFlag("c1_blasebalg_heil");
await h.act(S, "blasebalg", "use");
await h.act(S, "blasebalg", "use");
await h.act(S, "blasebalg", "use");
stage(3);

/* ---------------------------------------------------------------- dorfplatz: chest, raven, well */
await h.act(D, "kiste_dorf", "use", "kohlekiste_schluessel"); // wrong key
await h.act(D, "kiste_dorf", "use", "eisenschluessel");
await h.act(D, "kiste_dorf", "use");
h.take("kiste_dorf", "brot_alt");
h.take("kiste_dorf", "wurst");
h.take("kiste_dorf", "wuerfel");
h.take("kiste_dorf", "apfelrest");
await h.act(D, "rabe", "give", "wurst"); // raven refuses wurst
h.expectNoInv("rabenfeder");
await h.act(D, "rabe", "give", "brot_alt");
h.expectInv("rabenfeder");
h.expectNoInv("brot_alt");
await h.act(D, "rabe", "talk");
await h.act(D, "galgen", "take");
h.expectInv("seil");
await h.act(D, "brunnen", "use", "eimer"); // not rigged yet
h.expectInv("eimer");
await h.act(D, "brunnen", "use", "seil");
h.expectFlag("c1_seil_am_brunnen");
await h.act(D, "brunnen", "take"); // take the rope back (reversible)
h.expectInv("seil");
await h.act(D, "brunnen", "use", "seil");
await h.act(D, "brunnen", "use", "eimer");
h.expectInv("eimer_wasser");
h.expectNoInv("eimer");

/* ---------------------------------------------------------------- schmiede: water into barrel, bellows done earlier */
await h.act(S, "loeschfass", "use", "eimer_wasser");
h.expectFlag("c1_fass_voll");
h.expectInv("eimer");
h.expectNoInv("eimer_wasser");

/* ---------------------------------------------------------------- waldrand: wolves, trap, Halvard */
await h.act(W, "w_holzstab", "take");
await h.act(W, "w_fieberkraut", "take");
await h.act(W, "w_pilz", "take");
await h.act(W, "halvard", "talk"); // wolves block
expectSay("Wölfe", 8);
await h.act(W, "tornister", "use"); // blocked too
await h.act(W, "falle", "use", "wurst"); // not repaired
expectSay("Bolzen");
h.expectInv("wurst");
await h.act(W, "falle", "use", "nagel");
h.expectFlag("c1_falle_heil");
h.g.inv.push("knochen");
await h.act(W, "falle", "give", "knochen"); // a bone is not good enough
h.expectInv("knochen");
await h.act(W, "falle", "use", "wurst");
h.expectFlag("c1_wolves_weg");
h.expectNoInv("wurst");
await h.act(W, "steinhaufen", "use");
h.take("steinhaufen", "zinnring");
await h.act(W, "tornister", "use");
h.take("tornister", "kerze");
h.take("tornister", "kamm");
// Halvard before water: no brief
await h.act(W, "halvard", "talk", undefined, ["Wer seid Ihr", "Was ist Euch", "Ich komme wieder"]);
h.expectNoInv("halvard_brief");
// moor edge is not an exit yet
await h.act(W, "to_moor", "walk");

/* back to the well for Halvard's water */
await h.act(D, "brunnen", "use", "eimer");
h.expectInv("eimer_wasser");
await h.act(W, "halvard", "give", "eimer_wasser");
h.expectFlag("c1_halvard_wasser");
h.expectInv("eimer");
await h.act(W, "halvard", "talk", undefined, ["Würdet Ihr für mich bürgen", "Weil jemand die Schwachen", "Wovor warnt", "Was erwartet mich im Moor", "Ich komme wieder"]);
h.expectInv("halvard_brief");
h.expectFlag("have_sponsor");
console.log("hint@sponsor:", world.hint(g));
// honor 1 (Tuch) - 1 (Beutel) + 1 (answer) = 1 -> ring
h.expectInv("siegelring");

/* Hilda's side quest */
await h.act(D, "hilda", "give", "fieberkraut");
h.expectInv("hildas_brosche");
h.expectFlag("c1_hilda_belohnt");

console.log("hint@start-ish:", world.hint(g));
/* ---------------------------------------------------------------- torch: stick + pitch */
await h.act(D, "pechfass", "use", "zinnbecher");
h.expectInv("pech");
await h.combine("holzstab", "pech");
h.expectInv("fackel");
h.expectNoInv("holzstab");
h.expectNoInv("pech");

/* ---------------------------------------------------------------- kapelle */
await h.act(K, "falltuer", "walk"); // locked
expectSay("Verschlossen");
await h.act(K, "sakristei_1", "use"); // locked by runes
expectSay("Runenschloss");
await h.act(K, "knopf_k", "use");
await h.act(K, "knopf_l", "use");
await h.act(K, "knopf_r", "use"); // wrong: K L R
expectSay("falsche", 4);
await h.act(K, "knopf_r", "use");
await h.act(K, "knopf_l", "use");
await h.act(K, "knopf_k", "use");
h.expectFlag("c1_rune_offen");
await h.act(K, "sakristei_1", "use");
h.take("sakristei_1", "gruftschluessel");
h.take("sakristei_1", "gaensefeder");
h.take("sakristei_1", "haarlocke");
await h.act(K, "sakristei_2", "use");
h.take("sakristei_2", "flasche_leer");
h.take("sakristei_2", "pergamentfetzen");
await h.act(K, "sakristei_3", "use");
h.take("sakristei_3", "weihrauch");
h.take("sakristei_3", "rosenkranz");
await h.act(K, "falltuer", "use", "eisenschluessel"); // wrong key
await h.act(K, "falltuer", "use", "gruftschluessel");
h.expectFlag("c1_falltuer_offen");
await h.act(K, "pult", "use");
await h.act(K, "beichtstuhl", "use");
h.take("beichtstuhl", "kreuzanhaenger");
await h.act(K, "k_kerzenrest", "take");
await h.act(K, "opferstock", "use");
await h.act(K, "altar", "look");
await h.act(K, "fenster_rabe", "look");

/* holy water: pour bucket into the basin, fill the bottle */
await h.act(K, "becken", "use", "flasche_leer"); // empty basin
expectSay("leer");
h.expectNoInv("weihwasser");
await h.act(D, "brunnen", "use", "eimer");
await h.act(K, "becken", "use", "eimer_wasser");
h.expectInv("eimer");
await h.act(K, "becken", "use", "flasche_leer");
h.expectInv("weihwasser");

/* Oswin's job: 3 graves, honor, silver */
await h.act(K, "grab_1", "use"); // no job yet
await h.act(K, "oswin", "talk", undefined, ["Braucht Ihr Hilfe", "Was wisst Ihr über die Gruft", "Bis später"]);
h.expectInv("schaufel");
await h.act(K, "grab_1", "use");
await h.act(K, "grab_2", "use", "schaufel");
await h.act(K, "oswin", "talk", undefined, ["Braucht Ihr Hilfe", "Bis später"]); // 2/3
expectSay("2 von 3");
await h.act(K, "grab_3", "use");
await h.act(K, "oswin", "talk", undefined, ["Braucht Ihr Hilfe", "Bis später"]);
h.expectInv("silber");
h.expectFlag("c1_oswin_bezahlt");
await h.act(K, "opferstock", "give", "silber");
h.expectNoInv("silber");
h.expectFlag("c1_almosen");

/* ---------------------------------------------------------------- gruft: darkness */
await h.act(G, "skelett", "look"); // dark: refused
if (!/Stockfinster|ins Nichts|Ohne Licht greife/.test(say())) throw new Error("expected darkness line: " + say());
await h.act(K, "kerzenstaender", "use", "fackel");
h.expectFlag("c1_torch_lit");
await h.act(G, "skelett", "look");
await h.act(G, "reliquie", "take").catch(() => {}); // hidden: expected to throw
await h.act(G, "schrein", "use");
// wrong rune order -> reset
await h.act(G, "platte_k", "use");
await h.act(G, "platte_l", "use");
await h.act(G, "platte_r", "use");
expectSay("falsche", 5);
// right order
await h.act(G, "platte_r", "use");
await h.act(G, "platte_l", "use");
await h.act(G, "platte_k", "use");
h.expectFlag("c1_schrein_offen");
// take the relic WITHOUT blessing the guardian: setback to the chapel, relic stays
await h.act(G, "reliquie", "take");
h.expectNoInv("reliquie");
h.expectScene("kapelle");
// back down, bless the guardian
await h.act(G, "skelett", "use", "weihwasser");
h.expectFlag("c1_skelett_gebannt");
h.expectInv("flasche_leer");
await h.act(G, "reliquie", "take");
h.expectInv("reliquie");
await h.act(G, "g_klingenbruch", "take");
await h.act(G, "skelett", "talk", undefined, ["Was bewacht", "Danke, Wächter"]);
await h.act(G, "sarkophag_b", "use");
h.take("sarkophag_b", "zahn");
h.take("sarkophag_b", "schnalle");
h.take("sarkophag_b", "rostiger_dolch");
await h.act(G, "knochenhaufen", "use");
h.take("knochenhaufen", "totenkopf");
h.take("knochenhaufen", "glasauge");
await h.act(G, "ritterskelett", "use");
h.take("ritterskelett", "spielfigur");
await h.act(G, "g_rabenkralle", "take");
await h.act(G, "sarkophag_a", "look");
// torch burns down; room is dark again; relight with flint
g.set("c1_torch_left", 1);
await h.act(G, "tierskelett", "look");
if (g.flag("c1_torch_lit")) throw new Error("torch should have burnt out");
await h.act(G, "tierskelett", "look");
if (!/Stockfinster|ins Nichts|Ohne Licht greife/.test(say())) throw new Error("expected darkness line: " + say());
await h.combine("fackel", "feuerstein");
h.expectFlag("c1_torch_lit");
// torch holder: park the torch, work with free hands, take it back
await h.act(G, "fackelhalter", "use", "fackel");
h.expectFlag("c1_halter_fackel");
await h.act(G, "spinnweben", "look");
await h.act(G, "fackelhalter", "take");
h.expectInv("fackel");

/* ---------------------------------------------------------------- segen */
await h.act(K, "anselm", "talk", undefined, ["Ich brauche den Segen", "Wie komme ich in die Gruft", "Der Herr sei mit Euch"]);
await h.act(K, "anselm", "give", "reliquie");
h.expectInv("siegelbrief", "kerzenwachs");
h.expectFlag("have_blessing");

/* ---------------------------------------------------------------- schmiede: forge finish */
await h.act(S, "esse", "use", "feuerstein").catch(() => {});
await h.act(S, "amboss", "use"); // hammer before the glowing bruch: nothing to forge
await h.act(S, "loeschfass", "use"); // nothing to quench
await h.act(S, "schleifstein", "use"); // nothing to grind
await h.act(S, "esse", "use", "klingenbruch");
stage(4);
await h.act(S, "amboss", "use", "hammer");
await h.act(S, "amboss", "use", "hammer");
await h.act(S, "amboss", "use", "hammer");
stage(4);
await h.act(S, "amboss", "use", "hammer");
stage(5);
await h.act(S, "schleifstein", "use"); // too early (not quenched)
stage(5);
// bless the blade: refill the bottle first
await h.act(K, "becken", "use", "flasche_leer");
h.expectInv("weihwasser");
await h.act(S, "loeschfass", "use", "weihwasser");
h.expectFlag("c1_gesegnet");
h.expectInv("flasche_leer");
await h.act(S, "loeschfass", "use"); // no item chosen: just a hint
stage(5);
await h.act(S, "loeschfass", "use", "klingenbruch"); // quench the blade in the bucket
stage(6);
await h.act(S, "schleifstein", "use");
stage(7);
h.expectFlag("c1_klinge_fertig");
await h.act(S, "schwert_bank", "take"); // unpaid -> refused
h.expectNoInv("schwert");
await h.act(S, "gero", "talk", undefined, ["Nehmt diesen Beutel", "Auf Wiedersehen"]);
h.expectFlag("c1_gero_bezahlt");
await h.act(S, "schwert_bank", "take");
h.expectInv("schwert");
h.expectFlag("have_blade");

/* ---------------------------------------------------------------- Brandt: hand-off */
const orig = g.goto.bind(g);
let handoff: unknown[] | null = null;
g.goto = async (scene: string, x?: number, y?: number, f?: 1 | -1) => {
  if (scene === "moorpfad" && !world.scenes.moorpfad) {
    handoff = [scene, x, y, f];
    return;
  }
  return orig(scene, x, y, f);
};
await h.act(D, "brandt", "talk");
h.expectFlag("chapter", 2);
h.expectFlag("c1_done");
h.expectInv("fackel", "eimer", "schwert", "siegelbrief", "halvard_brief", "rabenfeder");
const gotoCalled = handoff as unknown[] | null;
if (!world.scenes.moorpfad && JSON.stringify(gotoCalled) !== JSON.stringify(["moorpfad", 80, 395, 1])) throw new Error("hand-off goto missing: " + JSON.stringify(gotoCalled));
if (!h.log.some((l) => l.includes("[CARD] Kapitel 2"))) throw new Error("no chapter 2 card");

console.log(h.log.slice(-14).join("\n"));
console.log("hint:", world.hint(g));
console.log("CHAPTER 1 PLAYTHROUGH OK  honor=" + g.flag("honor"));
