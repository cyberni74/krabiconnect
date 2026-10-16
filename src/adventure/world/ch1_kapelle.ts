import { bye, cabinet, container, edgeExit, groundItem, hero, npc, once, says, talk } from "../dsl";
import type { G, SceneDef, Thing } from "../types";
import { GEO } from "./geometry";
import { F, lightTorch, txt } from "./ch1_shared";

/* =========================================================================
 * kapelle — Pater Anselm, Oswin, Runenschloss, Weihwasser, Falltür zur Gruft
 * ========================================================================= */

const anselm = (g: G, ...l: string[]) => says(g, "anselm", ...l);
const oswin = (g: G, ...l: string[]) => says(g, "oswin", ...l);

/* ---------------------------------------------------------------- rune lock */
const RUNES = { R: "Rabe", L: "Lamm", K: "Kreuz" } as const;
type Rune = keyof typeof RUNES;
const ACC = { R: "den Raben", L: "das Lamm", K: "das Kreuz" } as const;

const pressRune = (r: Rune) => async (g: G) => {
  if (F(g, "c1_rune_offen")) return g.say("Die Runenknöpfe sind eingesunken. Der Schrank ist offen. Mehr gibt es hier nicht zu schieben.");
  g.sfx("clank");
  await g.pose("use", 350);
  const seq = String(g.flag("c1_rune_seq") ?? "") + r;
  g.set("c1_rune_seq", seq);
  if (seq.length < 3) {
    await g.say(`Ich drücke ${ACC[r]}. Der Knopf rastet ein. Das Schloss schweigt und wartet.`);
    return;
  }
  g.set("c1_rune_seq", "");
  if (seq === "RLK") {
    g.sfx("unlock");
    g.flash("#ffe9a0", 500);
    g.set("c1_rune_offen", true);
    for (const i of [1, 2, 3]) g.set(`unlocked_sakristei_${i}`, true);
    await g.say(`Ich drücke ${ACC[r]}. Ein tiefes Klicken, ein Rumpeln: Die Knöpfe versinken, die Schubladen springen auf.`);
    await g.say("Rabe, Lamm, Kreuz. Ich hätte es auch von den Glasfenstern ablesen können. Das hätte ich merken müssen.");
    return;
  }
  g.sfx("wrong");
  g.shake(350);
  await g.say(`Ich drücke ${ACC[r]}. Funken sprühen, die Knöpfe schnellen zurück, ein Fauchen. Falsche Reihenfolge: ${seq.split("").map((c) => RUNES[c as Rune]).join(", ")}.`);
  await g.say("Das Schloss bestraft Fehler mit einer Ohrfeige. Und mit Wiederholung. Ich lese lieber noch einmal die Verordnungen nach.");
};

const knob = (r: Rune, sprite: string, x: number): Thing => ({
  id: `knopf_${r.toLowerCase()}`,
  name: `Runenknopf (${RUNES[r]})`,
  sprite,
  x,
  y: 300,
  z: 500,
  scale: 0.9,
  at: { x: 235, y: 395 },
  hidden: (g) => F(g, "c1_rune_offen"),
  primary: "use",
  look: `Ein Runenknopf mit dem Zeichen des ${RUNES[r] === "Lamm" ? "Lamms" : RUNES[r] === "Rabe" ? "Raben" : "Kreuzes"}. Er lässt sich schieben, aber nicht in beliebiger Reihenfolge.`,
  use: pressRune(r),
  take: "Der Knopf sitzt fest im Holz. Man kann ihn drücken, nicht herausreißen.",
});

/* ---------------------------------------------------------------- blessing */
async function segen(g: G) {
  g.remove("reliquie");
  g.sfx("bell");
  g.frame("anselm", "pray");
  await anselm(g, "Der Fingerknochen des heiligen Corvin! Zurück in Gottes Haus! Ich dachte, die Räuber hätten ihn längst in Suppe gekocht.");
  await hero(g, "Er lag in der Gruft, im Reliquienschrein, bewacht von einem Skelett.");
  await anselm(g, "Bewacht! Natürlich. Ich hätte selbst gehen sollen, aber meine Knie... meine Nerven... Meine Knie und meine Nerven.");
  g.frame("anselm", "idle");
  await anselm(g, "Du hast mehr Mut als der halbe Orden. Warte, ich siegle dir den Segen.");
  await g.say("Pater Anselm kramt in seinem Gewand, entrollt Pergament, kritzelt, taucht Wachs ein und drückt sein Siegel hinein.");
  g.sfx("magic");
  g.add("siegelbrief");
  g.add("kerzenwachs");
  g.set("have_blessing", true);
  await anselm(g, "Hier. Der Segen der Kirche, schwarz auf weiß und rot gesiegelt. Und der Rest vom Wachs. Für Kerzen. Oder Ohren.");
  await anselm(g, "Geh mit Gott, Bran. Und wenn Gott gerade nicht erreichbar ist, geh trotzdem.");
}

/* ---------------------------------------------------------------- Oswin's graves */
const graveFlag = (n: number) => `c1_grab_${n}`;
const gravesDone = (g: G) => [1, 2, 3].filter((n) => F(g, graveFlag(n))).length;

function grab(n: number, x: number, y: number): Thing {
  return {
    id: `grab_${n}`,
    name: (g) => (F(g, graveFlag(n)) ? "Ausgehobenes Grab" : "Grabstelle"),
    sprite: (g) => (F(g, graveFlag(n)) ? "grabloch" : "steinhaufen"),
    x,
    y,
    hit: [x - 40, y - 34, 80, 44],
    at: { x, y: y + 6 },
    look: txt((g) => (F(g, graveFlag(n)) ? "Ein sauber ausgehobenes Grab. Ich bin stolz darauf. Das ist vermutlich ungesund." : "Eine Bodenplatte, die Oswin schon gelockert hat. Darunter wartet Erde, die niemand mehr in den überfüllten Friedhof bringen kann.")),
    use: async (g) => {
      if (!g.has("schaufel")) return g.say(F(g, "c1_oswin_job") ? "Ohne Schaufel kann ich hier nur mit den Fingern graben. Meine Schaufel liegt anderswo." : "Mit bloßen Händen? Und ohne Auftrag? Oswin weiß mehr darüber.");
      return grabUse(g, n);
    },
    take: "Das Grab nehme ich nicht mit. Es gehört schon jemandem, nur weiß er es noch nicht.",
    useWith: { schaufel: (g) => grabUse(g, n) },
  };
}
const grabUse = async (g: G, n: number) => {
  if (!F(g, "c1_oswin_job")) return g.say("Ich kann nicht einfach in einer Kapelle Löcher graben. Oswin weiß mehr darüber.");
  if (F(g, graveFlag(n))) return g.say("Das Grab ist fertig. Es wartet auf seinen Gast.");
  g.sfx("dig");
  await g.pose("dig", 900);
  g.set(graveFlag(n));
  const left = 3 - gravesDone(g);
  await g.say(left ? `Ich grabe. Erde fliegt, der Rücken protestiert. Noch ${left === 2 ? "zwei" : "eines"}.` : "Das dritte Grab ist fertig. Ich lehne mich auf die Schaufel wie ein Meister.");
  if (!left) await oswin(g, "Gut gemacht, Junge. Komm her, ich bezahle dich.");
};

/* ---------------------------------------------------------------- scene */
export const kapelle: SceneDef = {
  id: "kapelle",
  title: "Kapelle von Aschenfurt",
  bg: "kapelle",
  walk: GEO.kapelle.walk,
  scale: GEO.kapelle.scale,
  ambient: "church",
  fx: [{ kind: "dust", n: 0.7 }],
  things: [
    /* ---------- exits */
    edgeExit("left", { id: "kapellentuer", name: "Zum Dorfplatz", to: "dorfplatz", x: 775, y: 335, facing: -1, look: "Das schwere Eichenportal. Draußen warten Pest, Wind und Brandt. Drinnen nur Pest und Anselm." }),
    {
      id: "friedhofstuer",
      name: "Friedhofstür",
      sprite: null,
      x: 917,
      y: 340,
      hit: [880, 215, 80, 130],
      at: { x: 840, y: 392 },
      look: "Die Tür zum Friedhof, mit einem Balken von innen verriegelt. Draußen ist kein Platz mehr für Tote, sagt Oswin. Drinnen schon.",
      use: "Verriegelt. Oswin sagt, Pestgefahr. Und kein Platz. Der Friedhof ist so voll, dass selbst die Maulwürfe auswandern.",
    },

    /* ---------- npcs */
    npc({
      id: "anselm",
      name: "Pater Anselm",
      x: 415,
      y: 392,
      frames: { idle: "anselm_idle", talk: "anselm_talk", pray: "anselm_pray" },
      look: "Pater Anselm, hager, mit einem Schal vor dem Gesicht gegen die Pest. Er sieht aus wie ein Gebet auf zwei Beinen. Einem sehr müden Gebet.",
      give: {
        reliquie: (g) => segen(g),
        silber: "„Almosen? Wirf sie in den Opferstock, mein Sohn. Der Himmel führt Buch. Ich auch.“",
        weihwasser: "„Das ist Weihwasser! Aus meinem Becken? Wunderbar! Nein, behalte es, du wirst es noch brauchen.“",
      },
      talk: async (g) => {
        await once(g, "c1_met_anselm", async () => {
          await anselm(g, "Ah, eine lebende Seele! Die erste seit Tagen, die nicht beichten will, weil es zu spät ist.");
          await hero(g, "Pater Anselm, ich bin Bran, Oswins Lehrling.");
          await anselm(g, "Der Totengräberjunge. Ja. Willkommen in der Kapelle von Aschenfurt. Bitte nicht atmen. Oder atmen, aber leise.");
        });
        await talk(g, () => [
          {
            text: "Ich brauche den Segen der Kirche.",
            show: () => !F(g, "have_blessing"),
            run: async () => {
              await anselm(g, "Den Segen für den Rabenorden. Natürlich. Der Orden ist streng, aber gerecht. Und ich bin geizig, aber großzügig.");
              await anselm(g, "Ich siegle dir den Brief, wenn du mir etwas zurückbringst: den Fingerknochen des heiligen Corvin.");
              await anselm(g, "Er lag im Reliquienschrein in der Gruft unter der Falltür. Räuber haben ihn gestohlen, aber sie fanden die Gruft nicht wieder und ließen ihn zurück. Eine lange Geschichte. Ich habe sie nie ganz geglaubt.");
              g.set("c1_anselm_quest", true);
            },
          },
          {
            text: "Wie komme ich in die Gruft?",
            show: () => !!g.flag("c1_anselm_quest") || F(g, "c1_met_anselm"),
            run: async () => {
              await anselm(g, "Die Falltür ist verschlossen. Den Schlüssel bewahre ich im Sakristeischrank auf, dem mit dem Runenschloss.");
              await anselm(g, "Die Zeichen müssen in der richtigen Reihenfolge gedrückt werden. Ich habe sie vergessen. Ich weiß nur, dass es auf einem Anschlag steht. Auf dem Dorfplatz.");
              await anselm(g, "In der Gruft ist es dunkel. Nimm Licht mit. Und denk an den Wächter. Er mag keine Diebe. Weihwasser, mein Sohn, Weihwasser besänftigt ihn.");
              g.set("c1_gruft_bekannt", true);
            },
          },
          {
            text: "Das Weihwasserbecken ist leer.",
            run: async () => {
              await anselm(g, "Seit der letzten Messe. Kein Wasser mehr, die Brunnen sind verseucht. Der auf dem Dorfplatz ist der einzige, der noch klar ist, aber ihm fehlt Seil und Eimer.");
              await anselm(g, "Gieß das Wasser einfach hinein, ich segne es dann mit meinem Glauben. Das reicht für die Flasche. Eine leere liegt in der Sakristei.");
            },
          },
          {
            text: "Was wisst Ihr über Ser Halvard?",
            run: async () => {
              await anselm(g, "Ein guter Mann. Er beichtete oft und sündigte selten. Sehr verdächtig. Wenn er am Waldrand liegt, schicke ich ihm meinen Segen. Mehr kann ich nicht tun, ich habe Knie.");
            },
          },
          {
            text: "Was ist mit der Pest?",
            run: async () => {
              await anselm(g, "Die Pest ist Gottes Prüfung. Ich bin durchgefallen, aber ich bleibe sitzen.");
              await anselm(g, "Ich trage den Schal, weil ich gelesen habe, dass er hilft. Gelesen habe ich es von einem Mann, der danach gestorben ist.");
            },
          },
          {
            text: "Was ist mit dem Sakristeischrank?",
            show: () => !!g.flag("c1_anselm_quest") || F(g, "c1_gruft_bekannt"),
            run: async () => {
              await anselm(g, "Mein Küster, Gott hab ihn selig, hat das Schloss gebaut. Drei Runen: Rabe, Lamm, Kreuz. In welcher Reihenfolge? Fragt mich nicht.");
              await anselm(g, "Es steht an den Fenstern, wenn man genau hinsieht, und auf den Verordnungen im Dorf, wenn man lesen kann.");
            },
          },
          {
            text: "Was macht ein Pater, wenn keiner mehr betet?",
            run: async () => {
              await anselm(g, "Er betet selbst. Lauter. Damit es auffällt.");
              await anselm(g, "Und er sammelt Kerzenstummel. Eines Tages, Bran, werde ich eine ganze Kerze daraus bauen.");
            },
          },
          bye("Der Herr behüte dich. Falls er gerade Zeit hat.", "anselm", g, "Der Herr sei mit Euch."),
        ]);
      },
    }),
    npc({
      id: "oswin",
      name: "Totengräber Oswin",
      x: 800,
      y: 400,
      facing: -1,
      frames: { idle: "oswin_idle", talk: "oswin_talk" },
      look: "Oswin, mein Meister. Er hat mehr Menschen begraben als jeder andere in der Grafschaft und ist trotzdem fröhlich. Er sagt, das liege an der Gesellschaft.",
      give: { silber: "Oswin hebt die Hand. „Behalte dein Silber, Junge. Ich nehme von Lehrlingen nichts. Nur Arbeit.“" },
      talk: async (g) => {
        await once(g, "c1_met_oswin", async () => {
          await oswin(g, "Bran! Mein Lehrling, mein Sorgenkind. Was treibt dich in die Kapelle, außer dem Segen, den du nicht brauchst?");
          await hero(g, "Ich will Ritter werden, Meister.");
          await oswin(g, "Ritter. Hm. Als Totengräber hast du wenigstens am Ende noch Arbeit. Als Ritter bist du die Arbeit.");
        });
        await talk(g, () => [
          {
            text: "Braucht Ihr Hilfe beim Graben?",
            show: () => !F(g, "c1_oswin_bezahlt"),
            run: async () => {
              if (!F(g, "c1_oswin_job")) {
                g.set("c1_oswin_job", true);
                await oswin(g, "Und wie! Der Friedhof ist voll. Also graben wir in der Kapelle, unter den Bodenplatten. Drei Gräber, Junge, bis zum Abend.");
                await oswin(g, "Hier, meine Reserveschaufel. Zwei Silber für dich, wenn alle drei fertig sind. Und die Ehre, Gottes Boden zu öffnen.");
                g.add("schaufel");
                g.sfx("pickup");
                await g.say("Oswin drückt mir die Schaufel in die Hand. Sie ist warm von seiner Hand und kalt von der Arbeit.");
              } else if (gravesDone(g) < 3) {
                await oswin(g, `Du hast ${gravesDone(g)} von 3 Gräbern ausgehoben. Die Toten warten nicht, auch wenn sie es gut können.`);
              } else {
                g.remove("schaufel");
                g.add("schaufel");
                g.add("silber");
                g.set("c1_oswin_bezahlt", true);
                g.honor(1);
                g.sfx("coin");
                await oswin(g, "Drei Gräber, sauber und tief. Du hast Talent, Junge. Das ist keine Schande, auch wenn es sich so anfühlt. Hier, zwei Silber.");
                await g.say("Zwei Silbermünzen. Für einen Totengräberlehrling ist das ein Vermögen. Und ehrlich verdient.");
              }
            },
          },
          {
            text: "Was wisst Ihr über die Gruft?",
            run: async () => {
              await oswin(g, "Unter der Falltür? Die alten Ritter liegen da. Und ein Wächter, der sich nie hingelegt hat.");
              await oswin(g, "Ein Skelett im Panzer, steht stramm wie Brandt. Er wacht über den Reliquienschrein. Wenn du etwas nimmst, ohne ihn zu besänftigen, wird er unfreundlich.");
              await oswin(g, "Ich sage immer: Weihwasser auf den Schädel und leise hinaus. Hat bei Brandt auch funktioniert.");
            },
          },
          {
            text: "Habt Ihr eine Fackel für mich?",
            run: async () => {
              await oswin(g, "Eine Fackel? Nein, aber ich weiß, wie man eine macht. Einen Stab, Pech vom Dorfplatz, und Feuer. Am Waldrand liegt genug Holz.");
              await oswin(g, "Und denk dran: Pech brennt nicht ewig. In der Gruft hast du Licht für ein paar Handgriffe. Dann musst du wieder hoch und neu anzünden.");
            },
          },
          {
            text: "Warum seid Ihr noch hier in Aschenfurt?",
            run: async () => {
              await oswin(g, "Weil die Toten bleiben. Und wo Tote sind, braucht man Totengräber. Es ist das einzige Geschäft ohne Konkurrenz und ohne Reklamationen.");
            },
          },
          {
            text: "Was haltet Ihr vom Rabenorden?",
            run: async () => {
              await oswin(g, "Ehrenwerte Männer. Sie sind immer bestens beritten, wenn sie vor der Pest fliehen. Aber es gibt auch gute darunter, wie Halvard. Der hat mir mal ein Grab bezahlt, für einen Fremden.");
            },
          },
          bye("Pass auf deinen Rücken auf. Es gibt nur einen.", "oswin", g, "Bis später, Meister."),
        ]);
      },
    }),

    /* ---------- altar and window hotspots */
    { id: "altar", name: "Altar", sprite: null, x: 480, y: 335, hit: [372, 262, 216, 82], at: { x: 480, y: 372 }, look: "Der Altar, kalt und schmucklos. Der Kelch ist leer, die Kerzen auch. Es fehlt der Glaube. Und der Wein.", use: "Ich berühre den Altar. Er ist so kalt wie der Papst in Rom. Ich lasse ihn in Ruhe.", take: "Vom Altar etwas nehmen? In dieser Kapelle? Nicht mit meinem Karma." },
    { id: "fenster_rabe", name: "Fenster: Rabe", sprite: null, x: 402, y: 240, hit: [372, 60, 62, 180], at: { x: 402, y: 372 }, look: "Das Glasfenster zeigt einen schwarzen Raben mit klugem Blick. Er ist der erste im Reigen der drei. Der Wächter." },
    { id: "fenster_lamm", name: "Fenster: Lamm", sprite: null, x: 480, y: 240, hit: [446, 80, 68, 160], at: { x: 480, y: 372 }, look: "Das Glasfenster zeigt ein weißes Lamm mit Heiligenschein. In der Mitte, sanft und geduldig." },
    { id: "fenster_kreuz", name: "Fenster: Kreuz", sprite: null, x: 558, y: 240, hit: [526, 70, 64, 170], at: { x: 558, y: 372 }, look: "Das Glasfenster zeigt ein goldenes Kreuz, das über allem leuchtet. Das Letzte der drei Zeichen, der Abschluss." },
    { id: "banner_l", name: "Banner", sprite: null, x: 200, y: 260, hit: [180, 55, 40, 210], at: { x: 200, y: 372 }, look: "Ein verblichenes blaues Banner mit einer Lilie. Der Rand ist ausgefranst, die Hoffnung auch." },
    { id: "banner_r", name: "Banner", sprite: null, x: 762, y: 260, hit: [740, 55, 40, 210], at: { x: 762, y: 372 }, look: "Ein zweites Banner, ebenso zerschlissen. Motten haben Schlimmeres angerichtet als die Pest." },
    { id: "kerzen_wand", name: "Wandleuchter", sprite: null, x: 130, y: 220, hit: [105, 170, 55, 70], at: { x: 130, y: 372 }, look: "Ein Wandleuchter mit drei Kerzen. Sie flackern tapfer. Eine der drei ist bereits ein Märtyrer." },

    /* ---------- the rune cabinet */
    ...cabinet({
      id: "sakristei",
      name: "Sakristeischrank",
      sprites: ["sakristei_zu", "sakristei_s_oben", "sakristei_s_unten", "sakristei_fach"],
      x: 195,
      y: 385,
      at: { x: 235, y: 395 },
      look: txt((g) => (F(g, "c1_rune_offen") ? "Der Sakristeischrank, offen. Das Runenschloss ist ein Häufchen Eisen. Drei Fächer wollen durchsucht werden." : "Ein hoher Sakristeischrank mit drei Runenknöpfen, Rabe, Lamm und Kreuz. Das Schloss reagiert nur auf die richtige Reihenfolge.")),
      drawers: [
        { hit: [0.08, 0.7, 0.84, 0.12], name: "Obere Schublade", contents: ["gruftschluessel", "gaensefeder", "haarlocke"], lock: { key: "__rune", text: "Die Schublade rührt sich nicht. Das Runenschloss hält sie fest." } },
        { hit: [0.08, 0.84, 0.84, 0.12], name: "Untere Schublade", contents: ["flasche_leer", "pergamentfetzen"], lock: { key: "__rune", text: "Auch diese Schublade bleibt zu. Das Runenschloss." } },
        { hit: [0.1, 0.32, 0.8, 0.34], name: "Fach", contents: ["weihrauch", "rosenkranz"], lock: { key: "__rune", text: "Das Fach ist verschlossen. Das Runenschloss." }, look: "Das Fach hinter der Tür. Es duftet nach altem Weihrauch." },
      ],
    }),
    knob("R", "knopf_rabe", 166),
    knob("L", "knopf_lamm", 195),
    knob("K", "knopf_kreuz", 224),

    /* ---------- holy water, bible, confessional, candles */
    {
      id: "becken",
      name: "Weihwasserbecken",
      sprite: (g) => (F(g, "c1_becken_voll") ? "weihwasser_voll" : "weihwasser_leer"),
      x: 335,
      y: 385,
      look: (g) => (F(g, "c1_becken_voll") ? "Das Weihwasserbecken, gefüllt mit klarem Wasser. Es schimmert leicht. Ein Wunder, oder der Mond." : "Das Weihwasserbecken, trocken wie Anselms Humor. Am Grund klebt ein Rest Moos."),
      take: "Das Becken ist aus Stein und schwerer als meine Sünden.",
      use: (g) => (F(g, "c1_becken_voll") ? "Ich tauche zwei Finger ins Wasser und bekreuzige mich. Es tut nicht weh. Das ist ein gutes Zeichen." : "Ich greife hinein. Nur Staub. Ohne Wasser wird das nichts mit dem Segen."),
      useWith: {
        eimer_wasser: async (g) => {
          if (F(g, "c1_becken_voll")) return g.say("Das Becken ist schon voll. Mehr Segen passt nicht hinein.");
          await g.pose("use", 600);
          g.sfx("splash");
          g.remove("eimer_wasser");
          g.add("eimer");
          g.set("c1_becken_voll", true);
          await g.say("Ich gieße das Wasser in das Becken. Es leuchtet kurz silbern auf, als hätte jemand im Himmel genickt.");
          await g.say("Mit einer leeren Flasche kann ich nun Weihwasser schöpfen.");
        },
        flasche_leer: async (g) => {
          if (!F(g, "c1_becken_voll")) return g.say("Das Becken ist leer. Ich kann keine Flasche mit Staub füllen. Das wäre Betrug am Glauben.");
          await g.pose("use", 500);
          g.sfx("magic");
          g.remove("flasche_leer");
          g.add("weihwasser");
          await g.say("Ich tauche die Flasche ein und verkorke sie. Weihwasser, geschimmert wie Mondlicht auf Stein.");
        },
        weihwasser: "Das Weihwasser zurückgießen? Es ist kein Wein, und ich kein Alkoholiker des Glaubens.",
        eimer: "Ein leerer Eimer. Ich brauche Wasser, am besten aus dem Brunnen auf dem Dorfplatz.",
      },
    },
    {
      id: "pult",
      name: "Bibelpult",
      sprite: "pult_bibel",
      x: 585,
      y: 388,
      look: "Ein Lesepult mit einer riesigen, aufgeschlagenen Bibel. Zwischen den Seiten steckt ein Lesezeichen.",
      use: async (g) => {
        await g.say("Ich blättere. Latein, Latein, noch mehr Latein. Beim Lesezeichen halte ich an.");
        await g.say("„Et corvus vigilabat, et agnus patiebatur, et crux consummabat.“ Mein Latein reicht für „Rabe“, „Lamm“ und „Kreuz“.");
        await g.say("Wieder diese Reihenfolge. Anscheinend meinen es die Heiligen ernst.");
      },
      take: "Die Bibel wiegt mehr als ich. Und sie ist nicht mein Eigentum.",
    },
    container({
      id: "beichtstuhl",
      name: "Beichtstuhl",
      x: 735,
      y: 388,
      sprites: { closed: "beichtstuhl", open: "beichtstuhl" },
      contents: ["kreuzanhaenger"],
      title: "Beichtstuhl",
      look: "Ein Beichtstuhl aus dunklem Holz, mit Vorhang. Hier haben Menschen ihre Sünden abgelegt. Manche haben auch etwas vergessen.",
      emptyText: "Nur ein Abdruck auf der Bank und der Nachhall hundert gemurmelter Sünden.",
      onOpen: async (g) => {
        await g.say("Ich ziehe den Vorhang zur Seite. Auf der Bank liegt etwas, das ein Beichtender vergessen hat.");
      },
    }),
    {
      id: "kerzenstaender",
      name: "Kerzenständer",
      sprite: "kerzenstaender",
      x: 285,
      y: 392,
      look: "Ein dreiarmiger Kerzenständer aus schwarzem Eisen. Drei Kerzen brennen, eine davon unter Protest.",
      use: "Die Flammen tanzen. Ich könnte hier eine Fackel entzünden, wenn ich eine hätte.",
      take: "Der Kerzenständer ist zu schwer, und Pater Anselm schaut mich an wie ein Pfarrer einen Dieb.",
      useWith: {
        fackel: async (g) => {
          await lightTorch(g, "Ich halte die Fackel an die Kerzenflamme. Sie fängt sofort. Das Licht tanzt an den Gewölben.");
        },
        holzstab: "Ein Holzstab an die Kerzenflamme? Der brennt ab, und mit ihm meine Idee. Erst Pech dran.",
      },
    },
    {
      id: "opferstock",
      name: "Opferstock",
      sprite: "opferstock",
      x: 650,
      y: 396,
      look: "Ein Opferstock, mit Eisen beschlagen. Ein Schlitz zum Einwerfen, nichts zum Herausnehmen. Ein Konzept, das ich nur bewundern kann.",
      use: "Ich schüttle ihn. Es klirrt einmal. Ein Messingknopf, vermute ich. Jemand hat Hoffnung gespendet.",
      take: "Den Opferstock stehlen? Ich bin Totengräber, kein Kirchenräuber. Noch nicht.",
      give: {
        silber: async (g) => {
          if (F(g, "c1_almosen")) return g.say("Ich habe schon gespendet. Der Rest bleibt in meiner Tasche, schon aus Selbstschutz.");
          g.remove("silber");
          g.set("c1_almosen", true);
          g.honor(1);
          g.sfx("coin");
          await g.say("Ich werfe die Münzen in den Schlitz. Es klingt hell und hoffnungsvoll.");
          await anselm(g, "Gott segne dich, mein Sohn. Und dein Silber. Die Kirche braucht es mehr als du.");
        },
      },
      useWith: {
        silber: async (g) => {
          if (F(g, "c1_almosen")) return g.say("Ich habe schon gespendet. Der Rest bleibt in meiner Tasche, schon aus Selbstschutz.");
          g.remove("silber");
          g.set("c1_almosen", true);
          g.honor(1);
          g.sfx("coin");
          await g.say("Ich werfe die Münzen in den Schlitz. Es klingt hell und hoffnungsvoll.");
          await anselm(g, "Gott segne dich, mein Sohn. Und dein Silber. Die Kirche braucht es mehr als du.");
        },
      },
    },
    {
      id: "besen",
      name: "Besen",
      sprite: "besen",
      x: 122,
      y: 395,
      hit: [100, 255, 44, 140],
      look: "Ein Besen, lehnt an der Wand. Pater Anselm kehrt damit Sünden unter den Teppich. Es gibt keinen Teppich.",
      take: "Ich nehme den Besen mit? Anselm würde mich verfluchen. Er hängt sehr an seinen Putzmitteln.",
      use: "Ich kehre ein bisschen. Der Staub zieht um, mehr nicht.",
    },
    {
      id: "kelch_tisch",
      name: "Kelchtisch",
      sprite: "tischchen_kelch",
      x: 540,
      y: 392,
      look: "Ein kleines Tischchen mit einem Messkelch. Der Kelch ist leer, seit der Wein im Bauch des Paters landete. Wie das bei Kelchen so ist.",
      take: "Den Kelch nehmen? Das wäre Kirchenraub, und der Gestank von Weihrauch würde mich verraten.",
      use: "Ich schaue in den Kelch. Ein einsamer Tropfen. Der Rest ist Erinnerung.",
    },

    /* ---------- trapdoor */
    {
      id: "falltuer",
      name: "Falltür zur Gruft",
      sprite: (g) => (F(g, "c1_falltuer_offen") ? "falltuer_offen" : "falltuer_zu"),
      x: 495,
      y: 428,
      hit: [440, 385, 110, 50],
      at: { x: 495, y: 405 },
      primary: "walk",
      look: (g) => (F(g, "c1_falltuer_offen") ? "Die Falltür steht offen. Von unten weht kalter Gruftatem. Es riecht nach Stein, Jahrhunderten und Spinnen." : "Eine schwere Falltür im Kapellenboden, mit einem Vorhängeschloss gesichert. Darunter beginnt die Gruft."),
      use: async (g) => {
        if (!F(g, "c1_falltuer_offen")) return g.say("Verschlossen. Ich brauche den Gruftschlüssel, silbern, mit Rabenkopf. Pater Anselm hat ihn irgendwo eingeschlossen.");
        await g.goto("gruft", 140, 405, 1);
      },
      walk: async (g) => {
        if (!F(g, "c1_falltuer_offen")) return g.say("Verschlossen. Ich brauche den Gruftschlüssel, silbern, mit Rabenkopf. Pater Anselm hat ihn irgendwo eingeschlossen.");
        g.sfx("door");
        await g.goto("gruft", 140, 405, 1);
      },
      useWith: {
        gruftschluessel: async (g) => {
          if (F(g, "c1_falltuer_offen")) return g.say("Die Falltür ist schon offen.");
          g.sfx("unlock");
          await g.pose("use", 500);
          g.set("c1_falltuer_offen", true);
          g.sfx("creak");
          await g.say("Der Schlüssel dreht sich, das Schloss springt auf. Ich hebe die Falltür an: Eine Treppe führt hinab in die Dunkelheit.");
          await g.say("Ich sollte Licht mitnehmen. Und vielleicht einen Gruß an die Hausherren.");
        },
        eisenschluessel: "Der eiserne Schlüssel ist viel zu klein für dieses Schloss. Hier ist Silber gefragt, mit Rabenkopf.",
        kohlekiste_schluessel: "Der kleine Kohlekistenschlüssel passt nicht. Das Schloss will etwas Edleres.",
      },
    },
    grab(1, 640, 424),
    grab(2, 730, 428),
    grab(3, 820, 422),

    /* ---------- ground */
    groundItem({ id: "k_kerzenrest", item: "kerzenstummel", x: 360, y: 425, say: "Ein Kerzenstummel. Anselm sammelt diese. Er wird es nie erfahren.", at: { x: 360, y: 425 } }),
  ] as Thing[],
};

