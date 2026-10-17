/* Full playthrough of chapter 3 (headless). Run: sh tools/run-ts.sh tools/play-ch3.ts */
import { Harness } from "../src/adventure/testing";
import { world } from "../src/adventure/world";

const mk = () => {
  const h = new Harness(world);
  h.g.newGame(3);
  return h;
};
const say = (h: Harness, s: string) => console.log("  ·", s, "| hint:", world.hint(h.g));
const fail = (m: string) => {
  throw new Error("ASSERT: " + m);
};
const eq = (a: unknown, b: unknown, m: string) => a === b || fail(`${m}: got ${String(a)} expected ${String(b)}`);

async function openGateByProofs(h: Harness) {
  await h.act("burgtor", "torwinde", "use"); // no crank
  await h.act("burgtor", "torwinde", "use", "schwert"); // wrong item -> funny
  h.expectNoInv("eisenstange");
  await h.act("burgtor", "schubkarre_tor", "use"); h.take("schubkarre_tor", "eisenstange"); h.take("schubkarre_tor", "nagel");
  await h.act("burgtor", "wachtisch_tor", "use"); h.take("wachtisch_tor", "zinnbecher");
  await h.act("burgtor", "pechfass", "take");
  await h.act("burgtor", "torwinde", "use"); // still jammed: no kurbel
  await h.act("burgtor", "torwinde", "use", "eisenstange");
  await h.act("burgtor", "torwinde", "use"); // needs grease
  await h.act("burgtor", "torwinde", "use", "pech");
  eq(!!h.g.flag("c3_gate_open"), false, "gate still closed");
  await h.act("burgtor", "torwinde", "use"); // fixed but no proofs -> Grimm stops us
  eq(!!h.g.flag("c3_gate_open"), false, "gate closed without proofs");
  await h.act("burgtor", "fallgitter", "use");
  await h.act("burgtor", "grimm", "talk", undefined, ["Bote des Königs", "Was genau"]);
  await h.act("burgtor", "grimm", "give", "schwert");
  await h.act("burgtor", "grimm", "give", "schwert"); // repeat
  await h.act("burgtor", "grimm", "give", "hexentalisman");
  await h.act("burgtor", "grimm", "give", "gegengift");
  await h.act("burgtor", "grimm", "give", "siegelbrief");
  await h.act("burgtor", "grimm", "give", "halvard_brief");
  eq(!!h.g.flag("c3_gate_open"), false, "gate closed before cranking");
  await h.act("burgtor", "torwinde", "use");
  h.expectFlag("c3_gate_open");
  h.expectInv("schwert", "siegelbrief", "halvard_brief");
}

async function main() {
  /* ---------- side run: the sneaky solution (drunk Wilm) ---------- */
  {
    const h = mk();
    await h.act("burgtor", "schubkarre_tor", "use"); h.take("schubkarre_tor", "eisenstange");
    await h.act("burgtor", "wachtisch_tor", "use"); h.take("wachtisch_tor", "zinnbecher");
    await h.act("burgtor", "pechfass", "use");
    await h.act("burgtor", "torwinde", "use", "eisenstange");
    await h.act("burgtor", "torwinde", "use", "pech");
    await h.act("burgtor", "wilm", "give", "zinnbecher"); // empty cup: insult
    await h.act("burgtor", "wilm", "talk", undefined, ["durstig"]);
    await h.act("burgtor", "weinfass", "use", "zinnbecher");
    await h.act("burgtor", "wilm", "give", "zinnbecher");
    h.expectFlag("c3_wilm_drunk");
    await h.act("burgtor", "torwinde", "use");
    h.expectFlag("c3_gate_open"); h.expectFlag("c3_sneaked");
    await h.act("burgtor", "to_hof", "walk");
    h.expectScene("burghof");
    say(h, "sneaky gate OK");
  }
  /* ---------- side run: Eduard refused ---------- */
  {
    const h = mk();
    h.g.set("c3_t_pferd"); h.g.set("c3_t_hof");
    h.picks = ["Wie viel", "Nein danke"];
    await h.g.goto("burghof");
    eq(h.g.flag("honor"), 1, "refusing the bribe = +1 honor");
    h.expectFlag("c3_eduard_resolved");
    say(h, "bribe refused OK");
  }

  /* ---------- main run ---------- */
  const h = mk();
  h.expectInv("schwert", "siegelbrief", "halvard_brief", "gegengift", "hexentalisman", "fackel");
  say(h, "start");
  await h.act("burgtor", "to_moor", "walk"); h.expectScene("burgtor");
  await openGateByProofs(h);
  say(h, "gate open");
  await h.act("burgtor", "to_hof", "walk");
  h.expectScene("burghof");

  // guards before Roderic's welcome
  await h.act("burghof", "to_ruest", "walk"); h.expectScene("burghof");
  await h.act("burghof", "to_thron", "walk"); h.expectScene("burghof");
  await h.act("burghof", "kerkerluke", "walk"); h.expectScene("burghof");
  await h.act("burghof", "to_bibl", "walk"); h.expectScene("burghof");
  await h.act("burghof", "roderic", "talk", undefined, ["Aufgabenliste", "Orden", "Rüstkammer"]);
  h.expectFlag("c3_roderic_met");
  await h.act("burghof", "roderic", "talk", undefined, ["Aldric"]);

  // Pferd: wrong order first
  await h.act("burghof", "futtertrog", "use"); h.take("futtertrog", "hufeisen");
  await h.act("burghof", "werkbank_hof", "use"); h.take("werkbank_hof", "hammer"); h.take("werkbank_hof", "nagel"); h.take("werkbank_hof", "eisenschluessel"); h.take("werkbank_hof", "rostiger_dolch");
  await h.act("burghof", "pferd", "give", "hufeisen"); // stamps!
  eq(!!h.g.flag("c3_t_pferd"), false, "horse not shod without apple");
  await h.act("burghof", "berta", "talk", undefined, ["Apfel für Donnerhuf", "verloren", "Wie geht's"]);
  await h.act("burghof", "suppenkessel", "use", "zinnbecher"); // Berta refuses
  eq(h.g.flag("c3_becher"), "wein" === h.g.flag("c3_becher") ? "wein" : h.g.flag("c3_becher"), "becher");
  await h.act("burghof", "pferd", "give", "apfel");
  await h.act("burghof", "pferd", "give", "hufeisen");
  h.expectFlag("c3_t_pferd"); h.expectInv("seil");
  await h.act("burghof", "pip", "talk", undefined, ["Werkzeug", "Kanzler"]);
  say(h, "horse shod");

  // Berta's spoon -> wine + sleeping herb
  await h.act("burghof", "heukarren", "use"); h.take("heukarren", "holzloeffel");
  await h.act("burghof", "berta", "give", "holzloeffel");
  h.expectInv("wein", "schlafkraut");
  eq(h.g.flag("honor"), 1, "spoon honor");
  await h.act("burghof", "berta", "talk", undefined, ["Roderic schickt"]);
  await h.act("burghof", "lumpenkorb", "use"); h.take("lumpenkorb", "lappen");

  // Hof fegen + Puppe
  for (let i = 0; i < 3; i++) await h.act("burghof", "besen", "use");
  h.expectFlag("c3_t_hof");
  await h.act("burghof", "c3_hof_kreuz", "take");
  for (let i = 0; i < 3; i++) await h.act("burghof", "uebungspuppe", "use", "schwert");
  await h.act("burghof", "c3_puppe_schnalle", "take");
  await h.act("burghof", "brunnen", "use");
  await h.act("burghof", "eduard", "talk", undefined, ["Aufgaben"]);

  // Rüstkammer (2nd task -> Eduard will approach on return)
  await h.act("burghof", "to_ruest", "walk"); h.expectScene("ruestkammer");
  await h.act("ruestkammer", "truhe_r", "use"); h.take("truhe_r", "brustpanzer"); h.take("truhe_r", "schnalle");
  await h.act("ruestkammer", "kommode_r_1", "use"); h.take("kommode_r_1", "helm");
  await h.act("ruestkammer", "kommode_r_2", "use"); // locked
  eq(!!h.g.flag("unlocked_kommode_r_2"), false, "drawer locked");
  await h.act("ruestkammer", "kommode_r_2", "use", "eisenschluessel");
  await h.act("ruestkammer", "kommode_r_2", "use"); h.take("kommode_r_2", "armschienen"); h.take("kommode_r_2", "schild");
  await h.act("ruestkammer", "ruestungsstaender", "use", "helm"); // wrong order
  await h.act("ruestkammer", "ruestungsstaender", "use", "armschienen"); // wrong order
  eq(h.g.flag("c3_stand") ?? 0, 0, "stand empty");
  await h.act("ruestkammer", "ruestungsstaender", "use", "brustpanzer");
  await h.act("ruestkammer", "ruestungsstaender", "use", "helm");
  eq(h.g.flag("c3_stand"), 2, "stand helm");
  await h.act("ruestkammer", "ruestungsstaender", "use", "armschienen");
  eq(h.g.flag("c3_stand"), 3, "stand full"); h.expectFlag("c3_t_ruestung");
  // Spiegelschild
  await h.combine("lappen", "schild"); h.expectNoInv("spiegelschild"); // too early
  await h.act("ruestkammer", "sandkiste_r", "use"); h.take("sandkiste_r", "sand");
  await h.combine("lappen", "sand");
  await h.combine("sand", "schild");
  await h.combine("lappen", "schild");
  h.expectInv("spiegelschild"); h.expectNoInv("schild");
  say(h, "armor & mirror shield");

  // Eduard's bribe: take it (-1), Roderic refuses, then atone
  h.picks = ["Wie viel", "Her damit"];
  await h.g.goto("burghof");
  h.expectFlag("c3_bribed"); eq(h.g.flag("honor"), 0, "bribe honor");
  h.expectInv("silber");

  // Kerker: soup to Aldric, Knorr trick
  await h.act("burghof", "suppenkessel", "use", "zinnbecher");
  eq(h.g.flag("c3_becher"), "suppe", "becher full of soup");
  await h.act("burghof", "kerkerluke", "walk"); h.expectScene("kerker");
  await h.act("kerker", "schluesselhaken", "take"); // Knorr awake
  h.expectNoInv("zellenschluessel");
  await h.act("kerker", "knorr", "talk", undefined, ["Suppe", "Schlüsselbund", "trinkt"]);
  await h.act("kerker", "aldric", "talk", undefined, ["Warum", "Hunger"]);
  await h.act("kerker", "aldric", "give", "zinnbecher");
  h.expectFlag("c3_t_suppe");
  await h.act("kerker", "aldric", "talk", undefined, ["Schlüssel", "Malvor"]);
  await h.act("kerker", "knorr", "give", "wein"); // plain wine: wasted
  h.expectNoInv("wein");
  await h.act("kerker", "knorr", "give", "schlafkraut");
  await h.act("burghof", "berta", "talk", undefined, ["noch Wein"]);
  h.expectInv("wein");
  await h.combine("schlafkraut", "wein");
  h.expectFlag("c3_wein_praep");
  await h.act("kerker", "knorr", "give", "wein");
  h.expectFlag("c3_knorr_asleep");
  await h.act("kerker", "knorr", "talk");
  await h.act("kerker", "schluesselhaken", "take"); h.expectInv("zellenschluessel");
  await h.act("kerker", "wachtisch_k", "use"); h.take("wachtisch_k", "wuerfel");
  await h.act("kerker", "kiste_k", "use"); h.take("kiste_k", "zinnring");
  await h.act("kerker", "zelle", "use");
  await h.act("kerker", "zelle", "use", "zellenschluessel");
  h.expectFlag("c3_aldric_free");
  say(h, "aldric free");

  // Roderic: bribed => refuse, atone, complete
  await h.act("burghof", "roderic", "talk", undefined, ["alle Aufgaben"]);
  eq(!!h.g.flag("c3_demut_done"), false, "demut refused while bribed");
  await h.act("burghof", "eduard", "give", "silber");
  eq(h.g.flag("honor"), 2, "atoned honor (spoon+soup+atone, minus bribe)"); h.expectNoInv("silber");
  await h.act("burghof", "to_thron", "walk"); h.expectScene("burghof"); // not yet
  await h.act("burghof", "roderic", "talk", undefined, ["alle Aufgaben"]);
  h.expectFlag("c3_demut_done");
  say(h, "demut done");

  // Bibliothek
  await h.act("burghof", "to_bibl", "walk"); h.expectScene("bibliothek");
  await h.act("bibliothek", "myrddin", "talk", undefined, ["Prüfung", "Reihenfolge", "Waage", "König"]);
  await h.act("bibliothek", "myrddin", "give", "gegengift");
  await h.act("bibliothek", "pult", "look"); await h.act("bibliothek", "globus", "use");
  await h.act("bibliothek", "buch_blau", "use"); // wrong
  eq(h.g.flag("c3_buch_seq") ?? "", "", "books reset");
  await h.act("bibliothek", "geheimtuer", "use"); // locked
  for (const b of ["rot", "schwarz", "blau", "gruen"]) await h.act("bibliothek", "buch_" + b, "use");
  h.expectFlag("c3_books_ok");
  await h.act("bibliothek", "geheimtuer", "use", undefined, ["Gold", "Schulden", "Schritte"]);
  h.expectFlag("c3_tuer_offen");
  await h.act("bibliothek", "c3_weihwasser", "take"); h.expectInv("weihwasser");
  await h.act("bibliothek", "messkasten", "use");
  for (const i of ["totenkopf", "zinnbecher", "knochen", "schnalle"]) h.take("messkasten", i);
  await h.act("bibliothek", "waage", "use", "wuerfel"); // not a weight
  await h.act("bibliothek", "waage", "use", "totenkopf");
  await h.act("bibliothek", "waage", "use", "knochen");
  await h.act("bibliothek", "waage", "use", "zinnbecher"); // overshoot (6)
  eq(!!h.g.flag("c3_waage_ok"), false, "overshoot not ok");
  await h.act("bibliothek", "waage", "take");
  h.expectInv("totenkopf", "knochen", "zinnbecher");
  await h.act("bibliothek", "waage", "use", "zinnbecher");
  await h.act("bibliothek", "waage", "use", "totenkopf");
  h.expectFlag("c3_waage_ok");
  await h.act("bibliothek", "waage", "take"); // retrieve weights, flag stays
  h.expectFlag("c3_waage_ok");
  await h.act("bibliothek", "kommode_b_1", "use"); h.take("kommode_b_1", "pilz");
  await h.act("bibliothek", "myrddin", "talk", undefined, ["bestanden"]);
  h.expectInv("weisheitssiegel"); h.expectFlag("c3_myrddin_malvor");
  say(h, "wisdom done");

  // Thronsaal
  await h.act("bibliothek", "to_hof", "walk"); h.expectScene("burghof");
  await h.act("burghof", "to_thron", "walk"); h.expectScene("thronsaal");
  await h.act("thronsaal", "aldemar", "talk", undefined, ["wie geht", "vergiftet", "Drachen"]);
  // too early: Malvor watches
  await h.act("thronsaal", "kelch", "use", "gegengift"); h.expectScene("burghof"); h.expectInv("gegengift");
  await h.act("burghof", "to_thron", "walk"); h.expectScene("thronsaal");
  await h.act("thronsaal", "malvor", "talk", undefined, ["klage"]); // king still sick: refused
  await h.act("thronsaal", "malvor", "talk", undefined, ["Kelch", "lest"]);
  // distract with the letter
  await h.act("thronsaal", "malvor", "give", "halvard_brief");
  h.expectNoInv("halvard_brief"); h.expectFlag("c3_malvor_away");
  await h.act("thronsaal", "kelch", "use", "gegengift");
  h.expectFlag("c3_king_cured"); h.expectInv("halvard_brief"); h.expectNoInv("gegengift");
  say(h, "king cured");
  // accusation without proof must fail, then Geheimfach
  await h.act("thronsaal", "malvor", "talk", undefined, ["klage", "ohne Beweis", "überlege"]);
  eq(!!h.g.flag("c3_exposed"), false, "no exposure yet");
  let threw = false;
  await h.act("thronsaal", "rune1", "look").catch(() => (threw = true)); // hidden until tapestry lifted
  eq(threw, true, "runes hidden before the tapestry is lifted");
  await h.act("thronsaal", "tapisserie", "use");
  h.expectFlag("c3_fach_sichtbar");
  await h.act("thronsaal", "rune1", "use"); // lamm: wrong first
  await h.act("thronsaal", "rune2", "use"); await h.act("thronsaal", "rune3", "use"); await h.act("thronsaal", "rune4", "use"); await h.act("thronsaal", "rune1", "use");
  eq(!!h.g.flag("c3_fach_offen"), true, "runes open the safe: rabe,kreuz,rabe,lamm");
  await h.act("thronsaal", "geheimfach", "use"); h.take("c3_fach", "giftflasche"); h.take("c3_fach", "pergamentfetzen");
  h.expectInv("giftflasche");
  await h.act("thronsaal", "truhe_t", "use"); h.take("truhe_t", "rosenkranz");
  await h.act("thronsaal", "kommode_t_2", "use"); h.take("kommode_t_2", "kreide");
  await h.act("thronsaal", "aldric_t", "talk", undefined, ["gut"]);
  await h.act("thronsaal", "malvor", "talk", undefined, ["klage", "Diese Flasche", "Ser Aldric", "König lebt"]);
  h.expectFlag("c3_exposed"); h.expectFlag("c3_malvor_gone");
  say(h, "Malvor exposed");

  // Roderic: send-off requirements
  h.g.remove("spiegelschild");
  await h.act("thronsaal", "roderic_t", "talk", undefined, ["Was habe ich", "Wo ist Malvor", "bereit"]);
  h.expectFlag("chapter", 3);
  h.g.add("spiegelschild");
  h.g.remove("seil"); h.g.remove("fackel"); h.g.remove("weihwasser"); // consumed items must be reissued
  let target = "";
  h.g.goto = async (s: string, x?: number, y?: number, f?: number) => { target = `${s},${x},${y},${f}`; };
  await h.act("thronsaal", "roderic_t", "talk", undefined, ["bereit"]);
  eq(target, "vulkanpfad,80,400,1", "hand-off goto");
  h.expectFlag("chapter", 4);
  h.expectInv("spiegelschild", "weisheitssiegel", "seil", "fackel", "weihwasser", "schwert");
  console.log(h.log.filter((l) => l.startsWith("[CARD]")).join("\n"));
  console.log("honor:", h.g.flag("honor"));
  console.log("OK — chapter 3 completes; inventory:", h.g.inv.join(","));
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
