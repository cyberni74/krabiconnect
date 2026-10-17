import { bye, cabinet, container, edgeExit, groundItem, hero, npc, once, says, talk } from "../dsl";
import type { G, SceneDef, Thing } from "../types";
import { spot, txt } from "./ch3_common";
import { GEO } from "./geometry";

const WEIGHTS: Record<string, number> = { totenkopf: 3, zinnbecher: 2, knochen: 1, rostiger_dolch: 2, schnalle: 1 };
const TARGET = 5;
const pan = (g: G): string[] => String(g.flag("c3_waage_items") ?? "").split(",").filter(Boolean);
const sum = (g: G) => pan(g).reduce((s, i) => s + (WEIGHTS[i] ?? 0), 0);
const wissenReady = (g: G) => !!(g.flag("c3_books_ok") && g.flag("c3_tuer_offen") && g.flag("c3_waage_ok"));

const BOOKS: [string, string, string, string, number][] = [
  ["rot", "Rotes Buch", "buch_rot", "Das rote Buch: 'Vom Blut der Könige'. Es ist warm, als hätte es gerade jemand zugeklappt.", 636],
  ["schwarz", "Schwarzes Buch", "buch_schwarz", "Das schwarze Buch: 'Nachtbuch der Raben'. Auf dem Einband ein Totenkopf, der freundlicher guckt als der Hausmeister.", 658],
  ["blau", "Blaues Buch", "buch_blau", "Das blaue Buch: 'Himmelskunde für Anfänger'. Nur der Titel ist für Anfänger.", 680],
  ["gruen", "Grünes Buch", "buch_gruen", "Das grüne Buch: 'Moos, Moder und Moral'. Es riecht nach Wald und Rechthaberei.", 702],
];
const SEQ = "rot,schwarz,blau,gruen";

async function pullBook(g: G, key: string, name: string) {
  if (g.flag("c3_books_ok")) return g.say("Die Bücher sind eingerastet. Ich lasse sie in Ruhe, sie sind in Frieden.");
  const cur = String(g.flag("c3_buch_seq") ?? "");
  const next = cur ? cur + "," + key : key;
  g.sfx("drawer"); await g.pose("use", 400);
  if (SEQ.startsWith(next)) {
    g.set("c3_buch_seq", next);
    if (next === SEQ) {
      g.set("c3_books_ok", true); g.sfx("unlock"); g.shake(300);
      await g.say("Das vierte Buch klickt. In der Wand rastet etwas ein. Der große Bücherschrank hinten knackt wie ein altes Knie.");
    } else await g.say(`${name}: Es klickt, und es bleibt eingedrückt. Etwas in der Wand ist zufrieden.`);
  } else {
    g.set("c3_buch_seq", "");
    g.sfx("wrong");
    await g.say("Klack. Alle Bücher springen zurück, als hätte ich ihnen die Würde genommen.");
    await says(g, "myrddin", "Falsch herum, Junge. Bücher haben eine Ordnung. Wie Sterne und Steuern.");
  }
}

async function putWaage(g: G, item: string) {
  if (!(item in WEIGHTS)) return g.say("Das Ding wiegt weniger als ein Gedanke, oder mehr als ein Gewissen. Jedenfalls gehört es nicht auf die Waage.");
  if (g.flag("c3_waage_ok") && sum(g) === TARGET) return g.say("Die Waage ist im Gleichgewicht. Wer jetzt noch etwas drauflegt, ist selber schuld.");
  g.remove(item);
  g.set("c3_waage_items", [...pan(g), item].join(","));
  g.sfx("clank"); await g.pose("use", 400);
  const s = sum(g);
  if (s === TARGET) {
    g.set("c3_waage_ok", true); g.sfx("magic");
    await g.say("Die Schalen schwingen, zittern, und stehen still. Gleichgewicht. Auf dem Beutel links steht 'V' und rechts liegen genau fünf Pfund Wahrheit.");
    await says(g, "myrddin", "Die Waage ist zufrieden. Ich bin es ein bisschen auch.");
  } else if (s < TARGET) await g.say(`Die linke Schale sinkt noch immer. Es fehlt etwas. (${item.replace("_", " ")}: ${WEIGHTS[item]})`);
  else await g.say("Zu viel! Die rechte Schale kippt. Bran, das ist keine Metzgerei.");
}

export const bibliothek: SceneDef = {
  id: "bibliothek",
  title: "Myrddins Bibliothek",
  bg: "bibliothek",
  walk: GEO.bibliothek.walk,
  scale: GEO.bibliothek.scale,
  ambient: "library",
  fx: [{ kind: "dust", n: 0.7 }],
  things: [
    edgeExit("right", { id: "to_hof", name: "Zum Burghof", to: "burghof", x: 800, y: 395, facing: -1 }),

    npc({ id: "myrddin", name: "Magier Myrddin", x: 305, y: 386, frames: { idle: "myrddin_idle", talk: "myrddin_talk", cast: "myrddin_cast" },
      look: "Myrddin, Magier des Ordens. Ein Bart, in dem sich Spinnen und Sterne verirren. Seine Augen glühen leise, wenn er lügt. Oder nachdenkt.",
      give: {
        gegengift: async (g) => {
          await says(g, "myrddin", "Ein Gegengift. Moorhexe, Schierlingsbann, ein Hauch Wehmut. Sehr gut gebraut.");
          await says(g, "myrddin", "Aber wie willst du es in den König bekommen? Der Kanzler reicht ihm jeden Abend den Kelch. Persönlich.", "Lenke Malvor ab. Ein Mann, der liest, schaut nicht auf Kelche. Und Hexenzeug schreckt ihn ab, merk dir das.");
          g.set("c3_myrddin_tipp", true);
        },
        hexentalisman: "Myrddin: Ein Moortalisman! Er riecht nach Kröte. Behalte ihn. Ich brauche meine Nase noch.",
        weisheitssiegel: "Myrddin: Mein Siegel. Es steht dir besser als mir.",
        schwert: "Myrddin: Hübsch geschmiedet. Schief, aber ehrlich. Wie die meisten Wahrheiten.",
      },
      talk: async (g) => {
        await once(g, "c3_met_myrddin", async () => {
          await says(g, "myrddin", "Ah. Der Totengräberjunge. Roderic hat mich vorgewarnt. 'Schlicht, stur, vom Moor gezeichnet.' Ich mag solche.");
          await says(g, "myrddin", "Die Prüfung der Weisheit besteht aus drei Dingen: Ordne die Bücher, wiege die Wahrheit, beantworte die Tür.");
        });
        await talk(g, () => [
          { text: "Ich habe alle drei Prüfungen bestanden.", show: () => wissenReady(g) && !g.flag("c3_wissen_done"), run: async () => {
            g.set("c3_wissen_done", true); g.set("c3_myrddin_malvor", true);
            await says(g, "myrddin", "Bücher geordnet, Wahrheit gewogen, Tür beantwortet. Du bist weniger dumm, als du aussiehst.");
            g.sfx("fanfare"); g.add("weisheitssiegel");
            await says(g, "myrddin", "Hier, das Siegel der Weisheit. Es trägt ein offenes Auge. Du solltest deins auch geöffnet halten.");
            await says(g, "myrddin", "Und etwas, das ich dir schulde: Kanzler Malvor vergiftet den König. Ich rieche es seit Wochen. Ich habe nur keinen Beweis.");
            await says(g, "myrddin", "Hinter dem Wandteppich im Thronsaal hat er ein Geheimfach. Mehr weiß ich nicht. Das Fach hat vier Runenknöpfe. Man müsste die Reihenfolge kennen.");
          } },
          { text: "Wie funktioniert die Prüfung?", run: async () => { await says(g, "myrddin", "Erstens: Vier Bücher liegen auf dem Tisch. Zieh sie in der richtigen Reihenfolge. Das öffnet den Geheimschrank.", "Zweitens: Die Waage links. Gleiche die linke Schale mit Gewichten aus dem Messkasten aus.", "Drittens: Der Geheimschrank stellt eine Frage. Antworte, und er öffnet sich. Ein Tipp: In der Bibliothek verbirgt sich alles in Büchern."); } },
          { text: "Welche Reihenfolge haben die Bücher?", done: () => !!g.flag("c3_books_ok"), run: async () => { await says(g, "myrddin", "Ich verrate nicht, nur: Lies das Zeitalter-Buch auf dem Pult. Und sieh dir den Globus an. Er weiß, wo die Welt anfängt.", "Die Farben sind kein Zufall. Das Rot trägt Wärme, das Schwarz Kälte, das Blau Weite, das Grün Wucherung."); } },
          { text: "Und die Waage?", done: () => !!g.flag("c3_waage_ok"), run: async () => { await says(g, "myrddin", "Links der Beutel mit der Aufschrift. Rechts legst du Gewichte. Die Eichtafel daneben sagt, was ein Schädel wiegt.", "Aber hüte dich: Ein Becher ist nicht nur ein Becher. Er wiegt etwas. Und ein Knochen auch."); } },
          { text: "Zum Rätsel der Tür ...", show: () => !!g.flag("c3_books_ok") && !g.flag("c3_tuer_offen"), done: () => !!g.flag("c3_tuer_offen"), run: async () => { await says(g, "myrddin", "Die Tür fragt, was mehr wird, je mehr man nimmt. Ich sage nur: Ich gehe viel davon. Im Alter braucht man mehr davon.", "Tipp: Wer geht, hinterlässt sie. Wer bleibt, hat sie nicht."); } },
          { text: "Was wisst Ihr über den Kanzler?", show: () => !!g.flag("c3_myrddin_malvor"), run: async () => { await says(g, "myrddin", "Malvor wollte schon früh Macht. Er misst alles in Gold und alle in Nützlichkeit.", "Wenn er den König vergiftet hat, hat er das Gift selbst gemischt. Er rührt nur, was er selbst bereitet."); } },
          { text: "Der König ist krank, nicht wahr?", done: () => !!g.flag("c3_king_cured"), run: async () => { await says(g, "myrddin", "Er ist nicht krank, er wird kränker gemacht. Schierling, in kleinen Dosen. Jeden Abend im Wein.", "Gegen Schierling hilft ein Trank aus Moorwasser, Rabenfeder und Alraune. Hast du so etwas?"); await hero(g, "Ich hätte da etwas Türkisfarbenes. Eine Hexe hat es gebraut."); await says(g, "myrddin", "Dann zeig es mir. Gib es mir kurz in die Hand."); } },
          { text: "Was ist das für ein Turm?", run: async () => { await says(g, "myrddin", "Mein Turm. Hunderttausend Bücher, tausend Staubflocken pro Buch und eine Geschichte für jeden, der nicht schläft.", "Der Orden bezahlt mich dafür, dass ich ihnen nicht erkläre, was ich weiß."); } },
          bye("Gib auf die Sterne acht. Sie sind die einzigen, die nie lügen.", "myrddin", g, "Auf Wiedersehen."),
        ]);
      } }),

    // Waage
    { id: "waage", name: "Waage", sprite: (g) => { const s = sum(g); return s === TARGET ? "waage_neutral" : s > TARGET ? "waage_rechts" : "waage_links"; }, x: 195, y: 394, scale: 0.95, at: { x: 195, y: 420 }, primary: "use",
      look: txt((g) => (g.flag("c3_waage_ok") ? "Die Waage steht im Gleichgewicht. Links hängt ein Beutel mit einem 'V'. Rechts liegt die Lösung." : "Eine Waage. Links hängt ein schwerer Beutel mit einem aufgestickten 'V'. Die linke Schale sinkt. Es fehlt etwas auf der rechten.")),
      use: (g) => g.say(pan(g).length ? "Ich muss Gewichte auflegen oder wegnehmen. Mit der Hand wiegt man nur das Gewissen." : "Ich lege Dinge auf die rechte Schale, bis sie zur linken passt. Der Messkasten hat Gewichte."),
      take: async (g) => {
        const p = pan(g);
        if (!p.length) return g.say("Es liegt nichts auf der Schale.");
        for (const i of p) g.add(i);
        g.set("c3_waage_items", "");
        g.sfx("pickup");
        await g.say(g.flag("c3_waage_ok") ? "Ich nehme alles wieder weg. Myrddin hat das Gleichgewicht schon gesehen. Es zählt." : "Ich räume die Schale leer. Ordnung ist der Anfang der Weisheit. Oder des Mittagessens.");
      },
      useWith: Object.fromEntries(Object.keys(WEIGHTS).map((k) => [k, (g: G) => putWaage(g, k)])) as Thing["useWith"] },
    spot("eichtafel", "Eichtafel", [230, 330, 60, 38], "Eine kleine Messingtafel: 'Eichgewichte: Totenschädel III. Zinnbecher II. Knochen I.' Darunter, kleiner: 'Der Beutel V.'", { at: { x: 255, y: 425 } }),
    container({ id: "messkasten", name: "Messkasten", x: 262, y: 430, sprites: { closed: "kohlekiste", open: "kohlekiste_offen" }, scale: 0.7, at: { x: 262, y: 432 }, contents: ["totenkopf", "zinnbecher", "knochen", "schnalle"], title: "Messkasten",
      look: "Ein Kasten mit Gewichten und Makabrem. Myrddin wiegt nichts mit Metall, wenn er einen Schädel haben kann.", emptyText: "Alle Gewichte sind weg. Myrddin wird das bemerken." }),

    // Bücher
    { id: "tisch_bib", name: "Lesetisch", sprite: "tisch_bib", x: 668, y: 374, at: { x: 668, y: 410 }, primary: "look",
      look: "Ein langer Lesetisch mit Kerzen. Vier Bücher liegen aufgereiht. Man spürt, dass hier Reihenfolge gilt.", take: "Ein Tisch. Zu schwer, zu festgeschraubt, zu viel Geschichte." },
    ...BOOKS.map(([k, n, spr, look, x]): Thing => ({ id: `buch_${k}`, name: n, sprite: spr, x, y: 342, scale: 0.9, z: 343, hit: [x - 15, 306, 30, 42], at: { x: 668, y: 410 }, primary: "use", look, use: (g) => pullBook(g, k, n), take: "Ich ziehe es. Es klickt. Wegnehmen geht nicht, es steckt in einem Mechanismus." })),
    { id: "pult", name: "Lesepult", sprite: "pult_bibel", x: 590, y: 418, scale: 0.85, at: { x: 590, y: 430 }, primary: "look",
      look: "Ein Pult mit einem aufgeschlagenen Folianten: 'Das Buch der Zeitalter'. Eine Zeile ist unterstrichen: 'Am Anfang war das Blut, dann kam die Nacht, dann der Himmel, zuletzt das Moos.'",
      use: "Ich blättere. Staub. Fußnoten. Eine Fußnote zu einer Fußnote. Weise Leute lieben das.", take: "Das Pult bleibt. Der Foliant auch. Beide wiegen mehr als mein Mut." },
    { id: "globus", name: "Globus", sprite: "globus", x: 405, y: 390, scale: 0.9, at: { x: 405, y: 420 }, primary: "use",
      look: "Ein alter Globus. Rot für die Feuerberge, schwarz für den Norden, blau für die Meere, grün für die Moore.",
      use: async (g) => { g.sfx("creak"); await g.say("Ich drehe den Globus. Auf dem Sockel kratzt eine Randnotiz in Myrddins Schrift: 'Glut, Nacht, Tiefe, Moos. So wurde die Welt.'"); },
      take: "Die Welt im Rucksack? Das bringt Unglück." },

    // Geheimtür
    { id: "geheimtuer", name: "Bücherschrank", sprite: (g) => (g.flag("c3_tuer_offen") ? "geheimtuer_offen" : "geheimtuer_zu"), x: 800, y: 346, at: { x: 800, y: 380 }, primary: "use",
      look: txt((g) => (g.flag("c3_tuer_offen") ? "Der Schrank steht offen. Eine Treppe führt in die Dunkelheit, wo sie vermutlich Myrddins Geheimnisse sammelt." : g.flag("c3_books_ok") ? "Der Bücherschrank ist entriegelt. Er scheint zu flüstern: eine Frage." : "Ein Bücherschrank, etwas zu tief. Aus der Fuge zieht kalte Luft. Dahinter ist mehr als Pergament.")),
      take: "Zu schwer, zu groß, zu geheimnisvoll.",
      use: async (g) => {
        if (g.flag("c3_tuer_offen")) return g.say("Er steht offen. Ich muss nur noch hindurch. Dunkelheit, Staub und ein Fläschchen.");
        if (!g.flag("c3_books_ok")) return g.say("Verschlossen. Ich schiebe, ich rüttle, ich flehe. Irgendwo muss ein Mechanismus sein. Die Bücher am Tisch vielleicht?");
        await g.say("Der Schrank knarzt. Eine Stimme aus dem Holz: 'Je mehr man nimmt, desto mehr bleibt zurück. Was ist es?'");
        for (;;) {
          const i = await g.choose(["Schritte", "Gold", "Wein", "Schulden", "Zeit", "Weg mit dem Schrank!"]);
          if (i === 0) {
            g.set("c3_tuer_offen", true); g.sfx("door");
            await g.say("'Schritte. Ja.' Der Schrank schwingt auf. Dahinter: eine Treppe, ein Fläschchen und ein Hauch Moder.");
            return;
          }
          const t = [, "'Gold? Je mehr man nimmt, desto weniger bleibt. Denk nach.'", "'Wein? Nur bei mir.'", "'Schulden? Ja, auch. Aber das ist nicht die Antwort.'", "'Zeit? Fast schön. Aber nicht richtig.'", "'Beleidigungen sind keine Antworten. Ich notiere es.'"][i]!;
          await g.say(t);
          if (i === 5) return;
        }
      } },
    groundItem({ id: "c3_weihwasser", item: "weihwasser", x: 800, y: 340, scale: 0.9, hidden: (g) => !g.flag("c3_tuer_offen"), say: "Ein Fläschchen Weihwasser, das Myrddin gegen Dämonen aufbewahrt. Er wird es nicht vermissen. Er hat Dämonen genug." }),

    // Apotheke, Kamin, Dekor
    ...cabinet({ id: "kommode_b", name: "Apothekerschrank", sprites: ["kommode_wk_zu", "kommode_wk_oben", "kommode_wk_unten"], x: 500, y: 362, scale: 0.7, at: { x: 500, y: 392 },
      look: "Myrddins Apothekerschrank. Zwei Schubladen, in denen Dinge liegen, die einmal lebendig waren. Oder noch sind.",
      drawers: [
        { hit: [0.06, 0.12, 0.88, 0.38], contents: ["pilz", "kerzenwachs", "haarlocke"], name: "Obere Schublade" },
        { hit: [0.06, 0.55, 0.88, 0.38], contents: ["flasche_leer", "glasauge", "fieberkraut"], name: "Untere Schublade" },
      ] }),
    { id: "sessel", name: "Sessel", sprite: "sessel", x: 120, y: 384, scale: 0.85, at: { x: 120, y: 410 }, primary: "use",
      look: "Ein Ledersessel mit Mulde. Hier sitzt Myrddin und schläft, während er nachdenkt.",
      use: async (g) => { await g.say("Ich setze mich. Der Sessel schluckt mich. Als ich aufstehe, habe ich sieben Minuten und eine Idee verloren."); },
      take: "Ein Sessel. Den nehme ich höchstens im Traum." },
    { id: "kamin", name: "Kamin", sprite: null, x: 55, y: 340, hit: [0, 150, 110, 190], at: { x: 150, y: 420 }, primary: "look",
      look: "Ein Kamin mit grünem Feuer. Es wärmt nicht, aber es leuchtet. Wie Hoffnung.",
      use: "Ich halte die Hand ins Feuer. Es ist kalt. Das macht es noch unheimlicher.",
      useWith: { pergamentfetzen: "Pergament ins grüne Feuer? Es wäre ein Mord an der Geschichte. Ich lasse es.", kerzenstummel: "Ich zünde den Stummel an. Er brennt grün. Ich glaube, das ist nicht gut." } },
    spot("bib_sphaere", "Armillarsphäre", [235, 25, 85, 95], "Eine goldene Sphäre aus Ringen, die langsam kreist. Sie zeigt die Bahnen der Gestirne. Oder Myrddins Gedankengänge."),
    spot("bib_sternenkarte", "Sternenkarte", [380, 0, 300, 60], "Die Sternbilder an der Decke: Rabe, Drache, Waage, Schwert. Der Drache ist größer gemalt als die anderen."),
    spot("bib_fenster", "Fenster", [440, 80, 90, 220], "Ein hohes Fenster mit Blick auf Sterne und die Silhouette einer Burg. Ich bin froh, dass sie keine Gesichter hat."),
    spot("bib_treppe", "Wendeltreppe", [885, 20, 75, 190], "Eine Wendeltreppe, die in den Dachboden des Turms führt. Dort wohnen die Bücher, die zu gefährlich für unten sind."),
    spot("bib_schaedel", "Schädel im Regal", [145, 130, 25, 25], "Ein Schädel zwischen den Büchern. Er hat mehr gelesen als ich."),
    spot("bib_regal", "Bücherregale", [225, 100, 160, 210], "Tausend Bücher. Titel wie 'Von den Wirkungen des Nichtstuns' und 'Vierzig Arten, einen Trank zu verpfuschen'."),
  ],
};
