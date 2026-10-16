import { bye, container, decor, edgeExit, hero, npc, once, says, talk } from "../dsl";
import type { G, SceneDef, Thing } from "../types";
import { becherInhalt, spot, txt } from "./ch3_common";
import { GEO } from "./geometry";

const asleep = (g: G) => !!g.flag("c3_knorr_asleep");

/** Soup for Ser Aldric: Demut task #3. Works in the dungeon and later in the throne room. */
export async function feedAldric(g: G, who: string) {
  if (becherInhalt(g) !== "suppe") {
    if (g.flag("c3_t_suppe")) return says(g, who, "Danke, ich bin satt. Das erste Mal seit Wochen.");
    return says(g, who, "Ein leerer Becher? Ich bin hungrig, nicht höflich.");
  }
  g.set("c3_becher", "");
  g.honor(1);
  g.set("c3_t_suppe", true);
  await g.pose("use", 400);
  await says(g, who, "Suppe! Kohl, Zwiebel und eine Ahnung von Fleisch. Ich habe Brot gesehen, das mir besser gefallen hat. Aber das hier ist ein Festmahl.");
  await hero(g, "Roderic hat mir aufgetragen, Gefangene zu speisen. Ich hätte nie gedacht, dass es um Euch geht.");
}

async function freeAldric(g: G) {
  g.sfx("unlock"); await g.pose("use", 600);
  g.set("c3_aldric_free", true); g.set("c3_aldric_story", true);
  await says(g, "aldric", "Der Schlüssel! Bran, du Teufelskerl. Ich war schon dabei, mit der Ratte zu verhandeln.");
  await says(g, "aldric", "Hör zu: Malvor hat mich eingesperrt, weil ich ihn beim Gift-Mischen sah. Der König ist nicht krank, er wird vergiftet.");
  await says(g, "aldric", "Sein Versteck ist ein Geheimfach hinterm Wandteppich im Thronsaal. Die Knöpfe: 'Rabe, Kreuz, Rabe, Lamm', hat er im Suff gemurmelt.");
  await says(g, "aldric", "Ich gehe hinauf in den Thronsaal und warte dort. Wenn du ihn anklagst, bezeuge ich alles.");
  await hero(g, "Ein Zeuge, ein Spruch und ein Fach. Fehlt nur noch der Kelch.");
  await g.say("Aldric humpelt die Treppe hinauf. Der Kerker wirkt plötzlich leerer.");
}

export const kerker: SceneDef = {
  id: "kerker",
  title: "Kerker von Grauwacht",
  bg: "kerker",
  walk: GEO.kerker.walk,
  scale: GEO.kerker.scale,
  ambient: "dungeon",
  fx: [{ kind: "drips", n: 0.8 }, { kind: "fog", area: [0, 300, 960, 140], n: 0.5 }],
  things: [
    edgeExit("left", { id: "to_hof", name: "Treppe zum Burghof", to: "burghof", x: 705, y: 390, facing: -1 }),

    npc({ id: "knorr", name: "Wärter Knorr", x: 415, y: 352, facing: -1, frames: { idle: "knorr_idle", talk: "knorr_idle", sleep: "knorr_sleep" },
      pick: (_n, g) => (g.flag("c3_knorr_asleep") ? "sleep" : null),
      look: txt((g) => (asleep(g) ? "Knorr schnarcht wie ein Ochse im Winter. Aus dem Maul hängt ein Faden Spucke. Er träumt von Wein." : "Wärter Knorr. Rund, rot und im Besitz eines Schlüsselbunds, das lauter klimpert als sein Gewissen.")),
      give: {
        wein: async (g) => {
          if (asleep(g)) return g.say("Er schläft. Man weckt keinen Wärter, der friedlich schläft. Das ist ein ungeschriebenes Gesetz.");
          g.remove("wein");
          if (g.flag("c3_wein_praep")) {
            g.set("c3_wein_praep", false);
            await says(g, "knorr", "Wein! Für mich? Von wem? Egal. Prost auf den Kanzler, der uns alle ... hicks ... bezahlt.");
            await g.say("Knorr trinkt in einem Zug. Er blinzelt, schwankt, summt, und sackt langsam auf den Schemel. Dann kommt das Schnarchen.");
            g.set("c3_knorr_asleep", true); g.sfx("magic");
            await hero(g, "Das Schlafkraut wirkt. Der Schlüssel am Haken gehört mir.");
          } else {
            g.set("c3_knorr_drunk", true);
            await says(g, "knorr", "Wein! Du bist ein Gentleman, Junge. Hicks. Ich sag dir was: Der Kanzler besucht den Gefangenen jede Woche.");
            await says(g, "knorr", "Er sagt, er kontrolliert die Haft. Ich sage: Er hat Angst vor einem Mann in Ketten. Hicks. Aber ich sage nichts.");
            await hero(g, "Er ist betrunken, aber nicht müde genug. Es muss etwas Stärkeres her. Berta hat Schlafkraut ...");
          }
        },
        schlafkraut: "Knorr: Kraut? Ich bin doch kein Kaninchen! Gib mir was zum Trinken, Junge.",
        zinnbecher: async (g) => {
          if (becherInhalt(g) === "wein" && !asleep(g)) {
            g.set("c3_becher", ""); g.set("c3_knorr_drunk", true);
            await says(g, "knorr", "Wein im Becher! Ein Gentleman! Hicks. Aber das reicht nicht, um mich umzuhauen. Ich vertrage mehr als das Königshaus.");
          } else await says(g, "knorr", "Ein leerer Becher? Ich bin Wärter, nicht Wasserträger.");
        },
      },
      talk: async (g) => {
        if (asleep(g)) return hero(g, "Knorr schnarcht. Es ist das ehrlichste Gespräch, das ich seit Tagen hatte.");
        await once(g, "c3_met_knorr", async () => { await says(g, "knorr", "Wer kommt da? Besuch? Ich habe keine Besuchszeiten. Ich habe nur Zeiten, in denen ich nicht besoffen bin. Und die sind selten."); });
        await talk(g, () => [
          { text: "Wer ist im Kerker?", run: () => says(g, "knorr", "Ein Ritter, den keiner kennt. Die Ratten sind meine Freunde. Und ein Skelett in der Zelle da hinten, das zahlt keine Miete.") },
          { text: "Darf ich den Gefangenen Suppe bringen?", run: () => says(g, "knorr", "Suppe? Meinetwegen. Aber ich bekomme einen Schluck vom Kanzlerwein, wenn der Gefangene satt wird. Das ist Brauch.") },
          { text: "Kann ich den Gefangenen sprechen?", run: () => says(g, "knorr", "Von mir aus. Er kann nirgendwohin. Und ich will nicht wissen, was ihr redet.") },
          { text: "Was ist das für ein Schlüsselbund?", run: () => says(g, "knorr", "Hier? Der Schlüssel der Zelle hängt am Haken dort drüben, hinterm Tisch. Ich trage nur den Bund, damit ich wichtig aussehe.") },
          { text: "Was trinkt Ihr da?", run: () => says(g, "knorr", "Medizin. Gegen Langeweile, Nüchternheit und Familie. Hast du Medizin dabei? Ich würde sie nehmen.") },
          { text: "Der Kanzler besucht den Gefangenen?", show: () => !!g.flag("c3_knorr_drunk"), run: () => says(g, "knorr", "Hicks. Immer nachts. Er bringt Wein und Papiere. Und er geht ohne beides. Aber ich sage nichts.") },
          bye("Wenn du Wein siehst, bring ihn mit. Wenn nicht, bring dich selbst. Hicks.", "knorr", g, "Auf Wiedersehen."),
        ]);
      } }),
    { id: "schluesselhaken", name: "Schlüsselhaken", sprite: "schluesselhaken", x: 300, y: 214, scale: 0.8, at: { x: 330, y: 380 }, primary: "take",
      look: txt((g) => (g.flag("c3_key_taken") ? "Ein Schlüsselhaken mit vier Ringen. Drei Haken sind leer, der vierte auch." : "Ein Brett mit vier riesigen Schlüsseln. Einer glänzt, der Zellenschlüssel. Knorr beobachtet ihn wie eine Henne ihr Ei.")),
      take: async (g) => {
        if (g.flag("c3_key_taken")) return g.say("Der Haken ist leer. Ich habe schon alles, was ich wollte. Und noch ein Stück schlechtes Gewissen.");
        if (!asleep(g)) {
          g.sfx("wrong");
          await says(g, "knorr", "Pfoten weg vom Haken, Bursche! Die Schlüssel zähle ich jeden Abend. Zweimal.");
          await hero(g, "Er sieht aus, als wäre er betrunken, aber er hat Augen wie ein Habicht. Ich muss ihn erst ausschalten.");
          return;
        }
        await g.pose("pick", 600); g.sfx("pickup");
        g.add("zellenschluessel"); g.set("c3_key_taken", true);
        await g.say("Der Zellenschlüssel kommt mit einem leisen Klirren. Er ist schwer. Und für einen Moment auch ich.");
      },
      use: (g) => g.say("Ich fasse an den Haken. Er hängt, wie Haken eben hängen.") },
    { id: "zelle", name: "Zelle", sprite: null, x: 548, y: 300, hit: [480, 60, 135, 240], at: { x: 548, y: 330 }, primary: "look",
      look: txt((g) => (g.flag("c3_aldric_free") ? "Die Zelle steht offen. Das Stroh liegt noch, wo der Gefangene lag." : "Eine Zelle mit Gitter und Schloss. Dahinter steht ein Mann in zerlumpter Rüstung.")),
      use: (g) => g.say(g.flag("c3_aldric_free") ? "Offen. Ein trauriger Raum, aber ein ehrlicher." : "Verschlossen. Das Schloss hat die Größe meines Kopfes. Es braucht einen Schlüssel von gleichem Format."),
      useWith: { zellenschluessel: (g) => (g.flag("c3_aldric_free") ? g.say("Offen ist offen.") : freeAldric(g)), eisenstange: "Ich drücke die Stange gegen das Schloss. Es biegt sich. Nicht das Schloss." } },
    decor({ id: "zelle_auf", sprite: "zelle_offen", x: 640, y: 306, scale: 0.9, hidden: (g) => !g.flag("c3_aldric_free") }),
    npc({ id: "aldric", name: "Ser Aldric", x: 548, y: 312, facing: 1, hidden: (g) => !!g.flag("c3_aldric_free"), frames: { idle: "aldric_idle", talk: "aldric_talk" },
      look: "Ein Ritter in zerrissener Rüstung. Ketten an den Händen, aber der Blick ist ungebrochen. Er sieht aus wie jemand, der zu lange nicht geschlafen hat und zu viel gedacht.",
      give: {
        zinnbecher: async (g) => { await feedAldric(g, "aldric"); },
        gegengift: "Aldric: Ein Trank? Für den König? Dann trink ihn nicht selbst. Er soll in den Kelch.",
        wein: "Aldric: Wein? Behalte ihn. Ein Wärter, der Wein will, ist ein besserer Verbündeter als ich.",
      },
      talk: async (g) => {
        await once(g, "c3_met_aldric", async () => {
          await says(g, "aldric", "Ein Junge? Hat Knorr dich hereingelassen oder hast du dich nur verlaufen?");
          await hero(g, "Bran aus Aschenfurt, Anwärter des Ordens. Wer seid Ihr?");
          await says(g, "aldric", "Ser Aldric vom Raben. Roderic hat mich vor Wochen zur Grenze gesandt. Ich kam nie an. Ich bin hier.");
        });
        await talk(g, () => [
          { text: "Warum seid Ihr eingesperrt?", run: async () => { await says(g, "aldric", "Ich sah Malvor in der Küche, wie er etwas Schwarzes in den Wein des Königs goss. Am nächsten Tag war ich hier."); g.set("c3_aldric_know", true); } },
          { text: "Habt Ihr Hunger?", show: () => !g.flag("c3_t_suppe"), run: () => says(g, "aldric", "Hunger? Ich habe seit Tagen nur Ratten gehört. Wenn du etwas Warmes hast, ich wäre dir ewig dankbar.") },
          { text: "Wie komme ich an den Schlüssel?", run: async () => { await says(g, "aldric", "Er hängt dort am Haken. Knorr hütet ihn mit seinem Leben. Und seinem Bierkrug. Der ist sein Schwachpunkt.", "Gib ihm Wein. Viel Wein. Und etwas Schlafkraut, falls Berta welches hat. Dann ist er ein sanftes Lamm."); } },
          { text: "Was wisst Ihr über Malvor?", show: () => !!g.flag("c3_t_suppe") || !!g.flag("c3_aldric_know"), run: async () => { g.set("c3_aldric_story", true); await says(g, "aldric", "Er will das Drachenhorn. Den Vulkan Kharn, das Ei, die Macht. Er baut an einem Plan.", "Sein Geheimfach hat vier Runenknöpfe: Rabe, Kreuz, Rabe, Lamm. Das hat er im Rausch gemurmelt, als er hier war."); } },
          { text: "Seid Ihr verletzt?", run: () => says(g, "aldric", "Nur mein Stolz. Und ein Zahn. Aber den habe ich schon verschmerzt.") },
          bye("Beeil dich. Der König hat nicht mehr viele Abende.", "aldric", g, "Auf Wiedersehen."),
        ]);
      } }),

    container({ id: "wachtisch_k", name: "Wachtisch", x: 305, y: 336, sprites: { closed: "wachtisch", open: "wachtisch" }, scale: 0.9, at: { x: 305, y: 372 }, contents: ["wuerfel", "kerzenstummel", "brot_alt", "rattenfalle"], title: "Wachtisch",
      look: "Ein Tisch mit Würfeln, Kerzenstummel und Krümeln. Ein Wärterleben in Stillleben.", emptyText: "Leer. Knorr hat alles verfuttert." }),
    container({ id: "kiste_k", name: "Kiste", x: 730, y: 345, sprites: { closed: "kohlekiste", open: "kohlekiste_offen" }, scale: 0.75, at: { x: 730, y: 380 }, contents: ["zinnring", "rosenkranz", "apfelrest"], title: "Kiste",
      look: "Eine Kiste mit abgegriffenem Schloss. Man spürt: Hier liegt, was Gefangene verloren haben.", emptyText: "Leer. Selbst Armut war hier schon zu Besuch." }),
    { id: "weinfass_k", name: "Weinfass", sprite: "weinfass", x: 215, y: 350, scale: 0.9, at: { x: 245, y: 380 }, primary: "look",
      look: "Knorrs Weinfass. Der Hahn tropft. Der Boden ist klebrig, die Luft süßlich.",
      use: "Der Hahn tropft einen Tropfen. Ich fange ihn mit der Zunge. Das ist kein Gewinn.",
      take: "Das Fass ist größer als meine Moral.",
      useWith: { zinnbecher: "Der Hahn ist trocken. Knorr hat ihn schon leergesaugt." } },
    { id: "skelett_k", name: "Skelett", sprite: "ritterskelett", x: 820, y: 330, scale: 0.9, at: { x: 780, y: 400 },
      look: "Ein Ritterskelett, an die Wand gelehnt. Es grinst, weil ihm nichts Besseres einfällt. Der letzte Gefangene, der nicht mehr redet.",
      take: "Ich nehme seinen Helm nicht. Der hat schon sein Schicksal.", talk: "Er antwortet nicht. Höflich, aber ohne Substanz." },
    { id: "knochen_k", name: "Knochenhaufen", sprite: "knochenhaufen", x: 765, y: 322, scale: 0.7, look: "Ein Haufen Knochen vor der Zelle. Man hat sie nicht entsorgt, nur sortiert.", take: "Ich nehme keine Knochen. Nur Respekt.", at: { x: 740, y: 380 } },

    spot("k_zelle2", "Leere Zelle", [735, 60, 160, 230], "Eine leere Zelle. Auf dem Boden liegt Stroh, in der Ecke ein Eimer. Auch Verzweiflung wohnt hier nur zur Miete."),
    spot("k_nische", "Wachnische", [215, 85, 150, 130], "Eine gemauerte Nische mit Steinbank. Hier sitzt der Wärter, wenn er nicht gerade liegt."),
    spot("k_ketten_a", "Ketten", [168, 110, 25, 125], "Eisenketten an der Wand. Sie halten niemanden mehr, aber sie erinnern sich noch gut."),
    spot("k_ketten_b", "Ketten", [428, 125, 25, 100], "Ketten mit Fußschellen. Sie sind so gepflegt wie Knorrs Schlüsselbund. Dazu hat er Zeit."),
    spot("k_fackel_a", "Fackel", [135, 90, 32, 55], "Eine Fackel, die mehr rußt als leuchtet. Der Kerker spart an Licht, weil er an Hoffnung spart."),
    spot("k_fackel_b", "Fackel", [398, 90, 32, 55], "Noch eine Fackel. Sie flackert, als wollte sie flüchten."),
    spot("k_treppe", "Treppe", [0, 30, 110, 190], "Die Treppe in den Burghof. Von oben fällt ein Streifen Tageslicht, das so tut, als gäbe es noch Hoffnung."),
  ],
};
