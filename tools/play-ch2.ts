import { Harness } from "../src/adventure/testing";
import { world } from "../src/adventure/world";

const h = new Harness(world);
h.g.newGame(2);
const g = h.g;
const M = "moorpfad", H = "hexenhuette";
const gotos: unknown[][] = [];
const realGoto = g.goto.bind(g);
g.goto = async (s: string, x?: number, y?: number, f?: 1 | -1) => {
  if (s === "burgtor") gotos.push([s, x, y, f]);
  else await realGoto(s, x, y, f);
};
const fails = async (name: string, fn: () => Promise<void>) => { await fn(); console.log("ok:", name); };

await h.at(M);
// exits guarded
await h.act(M, "to_huette", "walk"); h.expectScene(M);
await h.act(M, "to_grauwacht", "walk"); if (gotos.length) throw new Error("left too early");
// lanterns: wrong order first
await h.act(M, "totem", "look"); h.expectFlag("c2_poem");
await h.act(M, "laterne_r", "use", "fackel");
h.expectFlag("c2_seq", "");
await h.act(M, "laterne_m", "use", "fackel");
await h.act(M, "laterne_l", "use", "fackel"); // wrong
h.expectFlag("c2_seq", "");
for (const k of ["m", "r", "l"]) await h.act(M, "laterne_" + k, "use", "fackel");
h.expectFlag("c2_lamps_done");
// pickups
await h.act(M, "m_rabenfeder", "take"); h.expectInv("rabenfeder");
await h.act(M, "m_ratte", "take"); h.expectInv("tote_ratte");
// snake: tongue refused first
await h.act(M, "m_zunge", "take"); h.expectNoInv("schlangenzunge");
await h.act(M, "schlange", "use", "eimer");
await h.act(M, "schlange", "use", "tote_ratte");
await h.act(M, "m_zunge", "take"); h.expectInv("schlangenzunge");
// water
await h.act(M, "tuempel", "use", "eimer"); h.expectInv("moorwasser"); h.expectNoInv("eimer");
// alraune without wax -> setback
await h.act(M, "alraune", "take"); h.expectNoInv("alraune");
// stump bread
await h.act(M, "moor_stumpf", "use"); h.take("moor_stumpf", "brot_alt");
// to hut
await h.act(M, "to_huette", "walk"); h.expectScene(H);
await h.act(H, "morwenna", "talk", undefined, ["Wer seid", "Gegengift", "Wo finde", "Rabe", "Spiegel", "Malvor", "Talisman", "Ich gehe"]);
h.expectFlag("c2_recipe");
// kessel before everything: wrong order test
await h.act(H, "kessel", "use", "alraune").catch(() => {}); // not in inv -> throws, fine
await h.act(H, "kessel", "use", "rabenfeder"); // wrong (water first)
h.expectInv("rabenfeder", "moorwasser");
await h.act(H, "kessel", "use", "moorwasser"); h.expectInv("eimer");
await h.act(H, "kessel", "use", "rabenfeder");
await h.act(H, "kessel", "use", "schlangenzunge"); // wrong: restore all
h.expectInv("moorwasser", "rabenfeder", "schlangenzunge"); h.expectNoInv("eimer"); h.expectFlag("c2_kn", 0);
// kommode drawers
await h.act(H, "kommode_1", "use"); h.take("kommode_1", "wurst");
await h.act(H, "kommode_2", "use"); h.take("kommode_2", "kerzenwachs");
await h.act(H, "kommode_3", "use");
// cat + key + chest
await h.act(H, "truhe", "use");
await h.act(H, "katze", "give", "tote_ratte").catch(() => {});
await h.act(H, "katze", "give", "wurst"); h.expectFlag("c2_katze_gefuettert");
await h.act(H, "hex_schluessel", "take"); h.expectInv("eisenschluessel");
await h.act(H, "truhe", "use", "eisenschluessel");
await h.act(H, "truhe", "use"); h.take("truhe", "fieberkraut"); h.take("truhe", "trank_rot");
await h.act(H, "morwenna", "give", "trank_rot");
await h.act(H, "hex_silber", "take"); // honor -1
h.expectFlag("honor", -1);
await h.act(H, "regal_l", "use"); h.expectInv("flasche_leer");
await h.act(H, "spiegel", "use"); await h.act(H, "besen", "use"); await h.act(H, "kaefig", "talk");
await h.act(H, "kaefig", "give", "brot_alt");
// back to moor for alraune
await h.act(H, "to_moor", "walk"); h.expectScene(M);
await h.act(M, "alraune", "use", "kerzenwachs"); h.expectFlag("c2_ohren");
await h.act(M, "alraune", "take"); h.expectInv("alraune");
await h.act(M, "to_huette", "walk");
// brew correct
for (const it of ["moorwasser", "rabenfeder", "alraune", "schlangenzunge", "fackel"]) await h.act(H, "kessel", "use", it);
h.expectFlag("c2_kocht");
g.picks = [];
h.picks = ["Ja, hier ist"];
h.log.push("## bottle");
await g.act(g.scene.things.find((t) => t.id === "kessel")!, "use", "flasche_leer");
h.expectInv("gegengift", "hexentalisman"); h.expectFlag("honor", 1);
await h.act(H, "morwenna", "talk", undefined, ["Drachen", "Ich gehe"]); h.expectFlag("c2_dragon_hint");
// leave
await h.act(H, "to_moor", "walk");
await h.act(M, "to_grauwacht", "walk");
h.expectFlag("chapter", 3);
const l = gotos[0];
if (!l || l[0] !== "burgtor" || l[1] !== 80 || l[2] !== 400 || l[3] !== 1) throw new Error("bad handoff " + JSON.stringify(gotos));
console.log(world.hint(g));
console.log(h.log.slice(-6).join("\n"), "\nOK");
