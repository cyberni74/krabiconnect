import { bye, container, decor, edgeExit, exitThing, groundItem, hero, npc, once, says, talk } from "../dsl";
import type { G, SceneDef } from "../types";
import { becherInhalt, spot, txt } from "./ch3_common";
import { GEO } from "./geometry";

const proofs = (g: G) => !!(g.flag("c3_proof_schwert") && g.flag("c3_proof_siegel") && g.flag("c3_proof_brief"));
const kurbelOk = (g: G) => !!g.flag("c3_winde_kurbel");
const fettOk = (g: G) => !!g.flag("c3_winde_fett");
const windeFixed = (g: G) => kurbelOk(g) && fettOk(g);

async function openGate(g: G) {
  g.sfx("clank");
  await g.pose("use", 900);
  g.shake(700);
  g.sfx("creak");
  g.set("c3_gate_open", true);
}

async function crank(g: G) {
  if (g.flag("c3_gate_open")) return g.say("Das Gitter hängt oben. Ich kurbele es nicht ohne Not wieder herunter.");
  if (!kurbelOk(g)) return g.say("Die Welle dreht sich ins Leere. Da sitzt kein Griff dran. Irgendetwas Langes, Festes wäre gut.");
  if (!fettOk(g)) return g.say("Die Winde kreischt, ruckt und gibt auf. Sie braucht Schmiere, und zwar viel.");
  if (proofs(g)) {
    await says(g, "grimm", "Klinge, Segen, Bürge. Gut. Wilm, hilf dem Jungen. Und fass nicht den Hauptmann an.");
    await openGate(g);
    await hero(g, "Es rattert, es quietscht, und das Gitter schwebt nach oben. Ich bin selbst überrascht.");
    return says(g, "grimm", "Das Tor ist offen. Willkommen auf Burg Grauwacht, Anwärter. Benimm dich.");
  }
  if (g.flag("c3_wilm_drunk")) {
    await hero(g, "Wilm grölt, der Hauptmann brüllt. Das ist meine Chance.");
    await g.moveNpc("grimm", 330, 372, 700);
    await says(g, "grimm", "WILM! Du singst im Dienst! Du singst FALSCH im Dienst!");
    await says(g, "wilm", "Hicks. Die Gedanken sind frei, Herr Hauptmann!");
    await openGate(g);
    g.set("c3_sneaked", true);
    await hero(g, "Das Gitter rutscht hoch. Niemand sieht her. Ich huste einmal und gehe.");
    await g.moveNpc("grimm", 640, 378, 700);
    return;
  }
  g.frame("wilm", "alert");
  await says(g, "grimm", "Finger weg von der Winde, Junge! Erst die Beweise, dann die Kurbelei!");
  g.frame("wilm", "idle");
}

const proofGive = (flag: string, first: string[], again: string) => async (g: G) => {
  if (g.flag(flag)) return says(g, "grimm", again);
  await says(g, "grimm", ...first);
  g.set(flag, true);
  if (proofs(g)) {
    await says(g, "grimm", "Damit hättest du alles. Bleibt das Fallgitter: Die Winde klemmt seit Michaeli.", "Fix sie, dann lasse ich dich rauf. Wilm hat die Kurbel versoffen. Frag nicht.");
  } else await says(g, "grimm", "Ein Beweis. Bleiben " + (3 - ["c3_proof_schwert", "c3_proof_siegel", "c3_proof_brief"].filter((k) => g.flag(k)).length) + ".");
};

export const burgtor: SceneDef = {
  id: "burgtor",
  title: "Das Tor von Burg Grauwacht",
  bg: "burgtor",
  walk: GEO.burgtor.walk,
  scale: GEO.burgtor.scale,
  ambient: "castle",
  fx: [{ kind: "dust", n: 0.5 }, { kind: "fog", area: [0, 340, 960, 100], n: 0.5 }],
  things: [
    edgeExit("left", { id: "to_moor", name: "Zurück ins Moor", to: "burgtor", guard: () => "Zurück ins Moor? Nie wieder. Das Moor hat mich genug gemocht." }),
    exitThing([436, 232, 96, 112], { id: "to_hof", name: "Zum Burghof", to: "burghof", x: 440, y: 385, facing: 1, at: { x: 487, y: 360 }, hidden: (g) => !g.flag("c3_gate_open") }),

    // gate
    { id: "fallgitter", name: "Fallgitter", sprite: "fallgitter_unten", x: 487, y: 346, scale: 0.78, at: { x: 487, y: 372 }, hidden: (g) => !!g.flag("c3_gate_open"),
      look: "Ein Fallgitter mit Zähnen wie ein Hecht. Dahinter ein dunkler Torweg, der nicht freundlicher aussieht.",
      take: "Es ist ein Gitter und ich bin ein Junge. Das wird nichts.",
      use: "Ich rüttle daran. Es rüttelt nicht zurück. Es braucht die Winde.",
      useWith: { seil: "Ein Seil um das Gitter? Dann stehe ich vor einem Gitter mit Seil. Das ist kein Fortschritt.", schwert: "Mein Schwert gegen Eisenstäbe? Das Schwert hat einen Namen und ich möchte ihn nicht beleidigen." } },
    decor({ id: "fallgitter_auf", sprite: "fallgitter_oben", x: 487, y: 262, scale: 0.9, hidden: (g) => !g.flag("c3_gate_open") }),
    { id: "torwinde", name: "Torwinde", sprite: "torwinde", x: 392, y: 396, scale: 0.85, at: { x: 440, y: 400 }, primary: "use",
      look: txt((g) => (g.flag("c3_gate_open") ? "Die Winde hält das Gitter oben. Sie knarzt zufrieden." : !kurbelOk(g) ? "Eine mächtige Winde mit rostiger Kette. Die Kurbel fehlt. Nur ein Stumpf ragt heraus." : !fettOk(g) ? "Mit Griff, aber die Zahnräder sind trocken wie ein Beichtvater." : "Die Winde ist geschmiert und bereit.")),
      use: crank, take: "Die Winde ist an den Boden genagelt. Von Leuten mit mehr Nägeln als Ideen.",
      useWith: {
        eisenstange: async (g) => {
          if (kurbelOk(g)) return g.say("Da steckt schon eine Stange drin.");
          g.sfx("clank"); await g.pose("use", 500);
          g.set("c3_winde_kurbel", true); g.remove("eisenstange");
          await g.say("Die Eisenstange passt in die Nabe wie ein Zahn in die Lücke. Eine Kurbel! Fast.");
        },
        pech: async (g) => {
          if (fettOk(g)) return g.say("Mehr Pech braucht niemand. Ich auch nicht.");
          g.sfx("splash"); await g.pose("use", 500);
          g.set("c3_winde_fett", true); g.remove("pech");
          await g.say("Pech ist kein Schmierfett, aber es ist zäh und schwarz. Die Zahnräder schlucken es gierig.");
        },
        seil: "Das Seil ist länger als die Kette. Aber wie die Kette will es nicht kurbeln.",
        wein: "Wein in die Zahnräder? Wilm würde weinen. Ich auch.",
        schwert: "Das Schwert als Kurbel? Es ist zu kurz, zu scharf und zu wertvoll.",
      } },

    // guards
    npc({ id: "grimm", name: "Hauptmann Grimm", x: 640, y: 378, facing: -1, frames: { idle: "grimm_idle", talk: "grimm_talk" },
      look: "Hauptmann Grimm. Er sieht aus, als hätte er schon dreimal die Pest überlebt und es jedes Mal persönlich genommen.",
      give: {
        schwert: proofGive("c3_proof_schwert", ["Die Klinge. Selbst geschmiedet? Schief, aber scharf.", "Der Orden nimmt Handwerker lieber als Poeten. Weiter."], "Ich habe es gesehen. Steck es weg."),
        siegelbrief: proofGive("c3_proof_siegel", ["Der Segensbrief der Kirche. Das Siegel stimmt.", "Pater Anselm segnet selten. Er muss Mitleid mit dir gehabt haben."], "Das Siegel ist echt. Ich habe es mir gemerkt."),
        halvard_brief: proofGive("c3_proof_brief", ["Ser Halvards Handschrift. Der alte Sturkopf bürgt für einen Grünschnabel?", "Lebt er noch? Nein, sag nichts. Ich möchte es mir schönreden."], "Halvards Brief. Ja. Genug davon."),
        hexentalisman: async (g) => { await says(g, "grimm", "WEG DAMIT! Hexenzeug am Burgtor! Wilm, mach das Kreuzzeichen!"); await says(g, "wilm", "Ich kann es nicht, ich bin Linkshänder."); await says(g, "grimm", "Steck es ein. Und rede mit niemandem darüber."); },
        gegengift: async (g) => { await says(g, "grimm", "Ein Trank, der leuchtet? Für den König, vermute ich.", "Dann beeil dich. Aber trag ihn nicht offen: Der Kanzler mag keine fremden Fläschchen am Hof."); g.set("c3_grimm_warn", true); },
        fackel: "Grimm: Eine Fackel? Wir haben hier viele. Aber danke, dass du dich um unser Licht sorgst.",
      },
      talk: async (g) => {
        await once(g, "c3_met_grimm", async () => {
          await says(g, "grimm", "Halt! Wer da? Name, Stand, Absicht. In dieser Reihenfolge, und ohne Gedichte.");
          await hero(g, "Bran, Totengräberlehrling aus Aschenfurt. Ich will zur Prüfung des Rabenordens.");
          await says(g, "grimm", "Totengräber. Das spart uns später die Kosten. Aber die Regeln gelten.", "Klinge, Segen, Bürge. Zeig sie vor, dann sehen wir weiter.");
        });
        await talk(g, () => [
          { text: "Was genau muss ich vorzeigen?", done: () => !!g.flag("c3_gate_open"), run: () => says(g, "grimm", "Eine Klinge, den Segen der Kirche und einen Bürgen. Das hast du in Aschenfurt schon gehört.", "Zeig es mir einfach. Gib mir die Dinge.") },
          { text: "Ich bin ein Bote des Königs.", show: () => !proofs(g), run: async () => { await says(g, "grimm", "Aha. Dann zeig mir das königliche Siegel."); await hero(g, "Ich hatte es hier. Irgendwo. Es war da."); await says(g, "grimm", "Ich schlafe seit drei Nächten schlecht, aber so schlecht schlafe ich nicht."); } },
          { text: "Was ist mit dem Fallgitter?", done: () => !!g.flag("c3_gate_open"), run: async () => { if (proofs(g)) await says(g, "grimm", "Das Gitter hängt, die Winde klemmt, die Kurbel ist weg. Wilm behauptet, sie sei ihm 'abhandengekommen'.", "Wenn du sie flickst, kurbeln wir. Kram in der Wachstube, Schubkarre, Fass. Schau dich um."); else await says(g, "grimm", "Erst die Beweise. Dann reden wir über Gitter."); } },
          { text: "Wie steht es in der Burg?", run: async () => { await says(g, "grimm", "Der König ist krank. Der Kanzler regiert. Die Köchin gibt der Suppe die Schuld.", "Ich gebe der Pest die Schuld. Aber das ist nur mein Dienstgrad."); } },
          { text: "Wer ist der Kanzler?", show: () => !!g.flag("c3_met_grimm"), run: async () => { await says(g, "grimm", "Malvor. Ein Mann mit schönen Händen und leerem Blick. Er lässt alle Briefe durch seine Hände gehen.", "Ich sage nichts weiter. Meine Stiefel haben Ohren."); } },
          { text: "Ihr seht müde aus, Hauptmann.", run: async () => { await says(g, "grimm", "Ich bin müde, seit der König krank ist. Und der König war schon vorher müde. Das ist ansteckend."); } },
          bye("Wenn du reinkommst, halt dich an die Mauern. Die sind ehrlich.", "grimm", g, "Auf Wiedersehen."),
        ]);
      } }),
    npc({ id: "wilm", name: "Wache Wilm", x: 285, y: 372, facing: 1, frames: { idle: "wache_idle", talk: "wache_idle", alert: "wache_alert" },
      look: txt((g) => (g.flag("c3_wilm_drunk") ? "Wilm lehnt an der Mauer und singt der Hellebarde etwas vor. Sie hört geduldig zu." : "Wache Wilm. Er riecht nach Wein, den er nie getrunken haben will.")),
      give: {
        zinnbecher: async (g) => {
          const w = becherInhalt(g);
          if (g.flag("c3_wilm_drunk")) return says(g, "wilm", "Hicks. Heute nicht mehr. Morgen vielleicht doppelt.");
          if (w === "wein") {
            await says(g, "wilm", "Ist das Wein? Für mich? Medizin, ganz bestimmt. Gegen Dienst.");
            g.set("c3_becher", ""); g.set("c3_wilm_drunk", true);
            await g.pose("use", 400);
            await says(g, "wilm", "Hicks. Das Leben ist schön! Soll ich ein Lied singen? ICH SINGE EIN LIED!");
            await hero(g, "Er singt. Es ist kein Lied. Aber es ist laut.");
            return;
          }
          if (w === "suppe") return says(g, "wilm", "Suppe? Davon wird man nur satt. Ich will glücklich werden.");
          await says(g, "wilm", "Ein leerer Becher? Das ist keine Spende, das ist eine Beleidigung.");
        },
      },
      talk: async (g) => {
        await once(g, "c3_met_wilm", async () => { await says(g, "wilm", "Psst. Wenn der Hauptmann fragt: Ich stehe aufrecht und nüchtern. Beides.", "Wilm, Torwache. Ich habe vier Dienstjahre und zwei Kinder, von denen eines von mir ist."); });
        await talk(g, () => [
          { text: "Was stimmt mit der Winde nicht?", done: () => !!g.flag("c3_winde_kurbel"), run: async () => { await says(g, "wilm", "Die klemmt. Rost, Pech, Bosheit. Die Kurbel hat der Winter geholt. Oder ich.", "Ein Stück Eisen, lang und stark, sollte reichen. Die Schubkarre da hinten ist voll damit."); } },
          { text: "Brauche ich Schmiere für die Winde?", done: () => !!g.flag("c3_winde_fett"), run: () => says(g, "wilm", "Schmiere? Unser Pechfass! Pech ist zäh und stinkt. Wie unser Hauptmann.") },
          { text: "Du siehst durstig aus.", show: () => !g.flag("c3_wilm_drunk"), run: async () => { await says(g, "wilm", "Durstig? Ich? Ein Mann des Dienstes, der niemals trinkt? Ha.", "Gut, da steht das Weinfass des Hauptmanns. Ein Becher hängt unterm Wachtisch. Ich habe nichts gesagt."); } },
          { text: "Wie ist der Hauptmann so?", run: () => says(g, "wilm", "Grimm? Der beste. Er brüllt nur, wenn ihn jemand sieht, der ihn dafür bezahlt.") },
          { text: "Wie läuft's in der Burg?", run: () => says(g, "wilm", "Der König liegt im Bett. Der Kanzler im Ohr des Königs. Und die Köchin in Dauerfehde mit dem Knappen Eduard.") },
          bye("Wenn der Hauptmann fragt: Du warst nie hier.", "wilm", g, "Auf Wiedersehen."),
        ]);
      } }),

    // containers
    container({ id: "wachtisch_tor", name: "Wachtisch", x: 780, y: 392, sprites: { closed: "wachtisch", open: "wachtisch" }, contents: ["zinnbecher", "wuerfel", "kerzenstummel"],
      look: "Ein Tisch mit Bechern, Würfeln und einem Kerzenstumpf. Dienstvorschrift sieht anders aus.", title: "Wachtisch", at: { x: 780, y: 410 }, emptyText: "Leergefegt. Wilm ist gründlich." }),
    container({ id: "schubkarre_tor", name: "Schubkarre", x: 175, y: 404, sprites: { closed: "schubkarre", open: "schubkarre" }, contents: ["eisenstange", "nagel", "tote_ratte"],
      look: "Eine Schubkarre voller Krempel. Mauerkalk, Moos, und das Leid vieler Wachen.", title: "Schubkarre", scale: 0.9, at: { x: 175, y: 420 }, emptyText: "Nur Dreck." }),
    { id: "pechfass", name: "Pechfass", sprite: "pechfass", x: 850, y: 396, at: { x: 850, y: 416 }, primary: "use",
      look: "Ein Fass voll schwarzem Pech. Für die Verteidigung der Burg. Oder für Hexen, je nach Laune.",
      take: (g) => (g.flag("c3_pech") ? g.say("Genug Pech für heute. Ich habe schon genug davon im Leben.") : (async () => { g.set("c3_pech", true); g.add("pech"); g.sfx("pickup"); await g.say("Ich kratze einen Klumpen heraus. Er klebt. Er klebt wirklich."); })()),
      use: (g) => (g.flag("c3_pech") ? g.say("Pech. Es blubbert zufrieden.") : (async () => { g.set("c3_pech", true); g.add("pech"); await g.say("Ich nehme einen Pechklumpen. Meine Finger kleben jetzt für alle Ewigkeit."); })()),
      useWith: { fackel: "Die Fackel an das Pechfass? Dann brennt Burg Grauwacht, und ich war's. Besser nicht." } },
    { id: "weinfass", name: "Weinfass", sprite: "weinfass", x: 215, y: 372, at: { x: 245, y: 394 }, primary: "use",
      look: "Ein grünliches Fass mit Zapfhahn. Auf dem Deckel steht 'Eigentum des Hauptmanns' und darunter 'Wilm war nicht hier'.",
      use: "Ich drehe am Hahn. Nichts kommt. Ich bräuchte ein Gefäß.",
      useWith: {
        zinnbecher: async (g) => {
          if (becherInhalt(g) === "wein") return g.say("Der Becher ist voll. Mehr passt nicht hinein. Leider.");
          if (becherInhalt(g) === "suppe") return g.say("Da ist noch Suppe drin. Suppe und Wein vertragen sich nicht. Nur in der Küche.");
          g.sfx("splash"); await g.pose("use", 500);
          g.set("c3_becher", "wein");
          await g.say("Der Becher füllt sich mit dunklem Roten. Ich verschütte nur einen Tropfen. Ein Opfer für die Götter.");
        },
      } },
    { id: "steinhaufen_tor", name: "Steinhaufen", sprite: "steinhaufen", x: 905, y: 420, scale: 0.9, look: "Ein Haufen Steine, bereit für Belagerer. Oder für Wilm, wenn der Hauptmann schreit.", take: "Ich nehme keine Steine. Ich habe schon genug Sorgen.", at: { x: 880, y: 420 } },
    groundItem({ id: "c3_tor_knopf", item: "messingknopf", x: 560, y: 412, say: "Ein Messingknopf. Von einem Soldatenrock, der längst ... na ja." }),
    groundItem({ id: "c3_tor_zahn", item: "zahn", x: 330, y: 424, say: "Ein Zahn. Ob der Hauptmann ihn vermisst?" }),

    // painted things
    spot("tor_banner_l", "Rabenbanner", [296, 112, 46, 140], "Ein schwarzes Banner mit weißem Raben. Der Orden hängt seine Wappen höher als seine Hoffnung."),
    spot("tor_banner_r", "Rabenbanner", [612, 112, 46, 140], "Noch ein Rabe. Offensichtlich ist die Burg stolz auf ihre Vogelzucht."),
    spot("tor_fackel_l", "Wandfackel", [362, 228, 28, 36], "Eine Fackel an der Mauer. Sie brennt, damit die Wachen sich wärmen und die Diebe sehen, wo sie hinmüssen."),
    spot("tor_fackel_r", "Wandfackel", [562, 228, 28, 36], "Die zweite Fackel. Sie flackert, als würde sie lügen."),
    spot("tor_burg", "Burg Grauwacht", [400, 0, 340, 125], "Die Burg Grauwacht auf ihrem Felsen. Hunderte Fenster, aber nur wenige erleuchtet. Die Pest spart Kerzen."),
    spot("tor_flagge", "Wimpel", [30, 118, 40, 120], "Ein Wimpel am Mast. Er hängt traurig, als wüsste er mehr als wir."),
    spot("tor_zinnen", "Wehrgang", [0, 200, 245, 40], "Die Zinnen. Von dort oben haben schon viele ihre letzte Aussicht genossen."),
    spot("tor_graben", "Burggraben", [0, 318, 240, 22], "Der Graben. Wasser, Schlamm, und ein Gerücht von einer Leiche. Man kann nicht alles haben."),
  ],
};
