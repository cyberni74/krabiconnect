import { bye, container, edgeExit, groundItem, npc, says, talk } from "../dsl";
import type { G, SceneDef, Thing } from "../types";
import { GEO } from "./geometry";
import { F, txt } from "./ch1_shared";

/* =========================================================================
 * waldrand — Wölfe, Wolfsfalle mit Köder, sterbender Ser Halvard (Bürge)
 * ========================================================================= */

async function bait(g: G, item: string) {
  if (F(g, "c1_falle_zu")) return g.say("Die Falle ist schon zugeschnappt. Der Köder wäre jetzt Verschwendung.");
  if (!F(g, "c1_falle_heil")) return g.say("In eine kaputte Falle einen Köder legen? Dann hole ich mir nur Mäuse. Zuerst muss der Bolzen repariert werden.");
  g.remove(item);
  g.set("c1_koeder", true);
  await g.pose("use", 600);
  await g.say(item === "wurst" ? "Ich lege die Räucherwurst auf den Auslöser. Der Duft zieht durch den Nebel wie ein Versprechen." : "Ich lege den Knochen auf den Auslöser. Er riecht nach Hoffnung und alten Zeiten.");
  await g.walk(640, 405);
  await g.say("Ich verstecke mich hinter dem Baumstumpf und halte die Luft an.");
  await g.wait(500);
  g.frame("wolf1", "idle");
  await g.moveNpc("wolf1", 470, 396, 900);
  g.sfx("clank");
  g.shake(500);
  g.set("c1_falle_zu", true);
  await g.say("KLACK! Ein Jaulen, ein Zerren. Der Wolf reißt sich los, mit eingeklemmtem Schweif und gekränkter Ehre.");
  g.frame("wolf1", "flee");
  g.frame("wolf2", "flee");
  const w1 = g.moveNpc("wolf1", -80, 380, 900);
  const w2 = g.moveNpc("wolf2", -80, 410, 1100);
  await Promise.all([w1, w2]);
  g.set("c1_wolves_weg", true);
  await g.say("Beide Wölfe sind im Wald verschwunden, mit dem Köder im Magen und einem Schwur auf Rache. Die Bahn zu Halvard ist frei.");
}

const halvard = (g: G, ...l: string[]) => says(g, "halvard", ...l);
const wolvesGone = (g: G) => F(g, "c1_wolves_weg");

/** Anything near Halvard's camp is guarded by the wolves until they are gone. */
async function wolfBlock(g: G) {
  g.frame("wolf1", "idle");
  g.sfx("roar");
  await g.say("Ein tiefes Knurren. Zwei Wölfe heben die Köpfe, die Lefzen gekräuselt. Sie stehen genau zwischen mir und dem Ritter.");
  await g.say("Ich habe zwei Beine, sie haben acht Zähne pro Schnauze. Schlechte Rechnung. Ich ziehe mich zurück.");
  await g.walk(560, 400);
}

const guarded = (t: Thing): Thing => {
  const b = (r: Thing["look"]): Thing["look"] => async (g: G) => {
    if (!wolvesGone(g)) return wolfBlock(g);
    if (typeof r === "string") await g.say(r);
    else if (r) await r(g);
  };
  return { ...t, take: b(t.take), use: b(t.use), talk: b(t.talk) };
};

async function drink(g: G) {
  if (F(g, "c1_halvard_wasser")) return halvard(g, "Danke, mein Junge. Genug für heute. Wasser ist wie Vergebung: Man bekommt nie zu viel, aber man merkt es.");
  g.remove("eimer_wasser");
  g.add("eimer");
  g.set("c1_halvard_wasser", true);
  g.sfx("splash");
  await g.pose("use", 700);
  await g.say("Ich halte Halvard den Eimer an die Lippen. Er trinkt in gierigen Zügen, dann sinkt er zurück und atmet auf.");
  await halvard(g, "Wasser. Heiliges, sauberes, wunderbares Wasser. Ich wusste nicht mehr, wie es schmeckt.");
  await halvard(g, "Du bist der erste, der nicht davongelaufen ist. Setz dich, Junge. Ich habe Zeit. Mehr als mir lieb ist.");
}

async function bürgschaft(g: G) {
  await halvard(g, "Du willst also, dass ich für dich bürge. Ein Ritter bürgt nur für den, den er kennt.");
  await halvard(g, "Also sag mir, Junge: Warum willst du Ritter werden?");
  const c = await g.choose(["Wegen des Ruhms und der Lieder, die man über mich singen wird.", "Weil jemand die Schwachen schützen muss. Und ich kann nicht wegsehen.", "Weil der Orden ein Dach, Suppe und ein Bett bietet. Ich bin Waise."]);
  if (c === 0) {
    await halvard(g, "Ha! Ruhm. Ich kannte viele, die für Ruhm starben. Man erinnert sich an keinen. Aber du bist wenigstens ehrlich dumm.");
  } else if (c === 1) {
    g.honor(1);
    await halvard(g, "Hm. So reden sie alle, bis die erste Klinge kommt. Aber du sagst es, als meintest du es. Das ist selten.");
  } else {
    g.honor(1);
    await halvard(g, "Endlich einer, der nicht lügt! Ein Dach, Suppe, ein Bett. Das ist mehr Wahrheit, als der halbe Orden aufbringt.");
  }
  await halvard(g, "Hier, mein Brief. Ich habe ihn schon geschrieben, bevor die Wölfe kamen. Für den Fall, dass ich jemanden finde, der es wert ist.");
  g.add("halvard_brief");
  g.set("have_sponsor", true);
  g.sfx("fanfare");
  await g.say("Ich bekomme einen gefalteten Brief mit rotem Siegel. Halvards Wort für mich. Die Hand, die ihn schrieb, zitterte.");
  await ringCheck(g);
}

async function ringCheck(g: G) {
  if (g.has("siegelring")) return;
  if (Number(g.flag("honor") ?? 0) >= 1) {
    g.add("siegelring");
    g.sfx("magic");
    await halvard(g, "Und nimm meinen Ring. Er hat einen Raben. Wer ihn trägt, hat Freunde, die zählen. Ich brauche ihn nicht mehr.");
    await g.say("Ein schwerer Siegelring mit Rabenwappen liegt in meiner Hand. Es fühlt sich an wie ein Versprechen.");
  } else {
    await halvard(g, "Den Ring gebe ich nur einem, der Ehre gezeigt hat. Du bist ehrlich, aber noch nicht erprobt. Zeig mir Ehre, und er gehört dir.");
    g.set("c1_ring_offen", true);
  }
}

export const waldrand: SceneDef = {
  id: "waldrand",
  title: "Am Waldrand",
  bg: "waldrand",
  walk: GEO.waldrand.walk,
  scale: GEO.waldrand.scale,
  ambient: "forest",
  fx: [
    { kind: "fog", area: [0, 240, 960, 200], n: 1.1 },
    { kind: "fireflies", area: [600, 200, 360, 160], n: 0.5 },
  ],
  things: [
    edgeExit("left", { id: "to_dorf", name: "Zum Dorfplatz", to: "dorfplatz", x: 840, y: 405, facing: -1, look: "Der Pfad zurück nach Aschenfurt. Dort warten Pest, Brandt und Brot." }),
    {
      id: "to_moor",
      primary: "walk",
      name: "Pfad ins Moor",
      sprite: null,
      x: 917,
      y: 400,
      hit: [874, 215, 86, 225],
      at: { x: 922, y: 410 },
      look: "Dort hinten glimmt das Moor grün unter dem Nebel. Hübsch, wie ein Gruselmärchen.",
      walk: (g) => g.say("Das Moor. Dort will ich erst hin, wenn ich Klinge, Segen und Bürgen habe. Und Feldwebel Brandt mich schickt."),
      use: "Das Moor. Dort will ich erst hin, wenn ich Klinge, Segen und Bürgen habe. Und Feldwebel Brandt mich schickt.",
    },

    /* --- Halvard + wolves */
    guarded(
      npc({
        id: "halvard",
        name: "Ser Halvard",
        x: 170,
        y: 392,
        frames: { idle: "halvard_idle", talk: "halvard_talk" },
        at: { x: 330, y: 404 },
        look: txt((g) => (F(g, "c1_halvard_wasser") ? "Ser Halvard, in Rüstung an eine Eiche gelehnt. Das Gesicht ist grau, die Augen aber wach. Er trinkt Wasser, als sei es Wein." : "Ein Ritter in Rüstung, an einen Baum gelehnt. Er atmet noch, flach und mühsam. Ein Wappen mit Raben auf der Brust.")),
        give: {
          eimer_wasser: (g) => (wolvesGone(g) ? drink(g) : wolfBlock(g)),
          halvard_brief: "Halvard schüttelt den Kopf. „Behalte ihn, Junge. Ein Brief gehört dem, der ihn braucht.“",
        },
        talk: async (g) => {
          await talk(g, () => [
            {
              text: "Wer seid Ihr?",
              run: async () => {
                await halvard(g, "Ser Halvard vom Orden des Raben. Oder was von ihm übrig ist. Ich lehne seit drei Tagen an diesem Baum und ordne meine Sünden.");
                await halvard(g, "Es sind weniger, als ich dachte. Das ist enttäuschend.");
              },
            },
            {
              text: "Was ist Euch zugestoßen?",
              run: async () => {
                await halvard(g, "Ich ritt von Grauwacht nach Aschenfurt, mit einer Warnung für Brandt. Männer im schwarzen Mantel, ein vergifteter Pfeil, und mein Pferd ging mit ihnen durch. Ich habe es ihnen nicht verübelt.");
                await halvard(g, "Dann kamen die Wölfe. Sie dachten, ich wäre Abendessen. Ich bin zäh, sie haben aufgegeben und warten jetzt.");
                g.set("c1_halvard_story", true);
              },
            },
            {
              text: "Ich habe Wasser für Euch.",
              show: () => g.has("eimer_wasser") && !F(g, "c1_halvard_wasser"),
              run: () => drink(g),
            },
            {
              text: "Würdet Ihr für mich bürgen?",
              show: () => F(g, "c1_halvard_wasser") && !F(g, "have_sponsor"),
              run: () => bürgschaft(g),
            },
            {
              text: "Und der Ring?",
              show: () => F(g, "have_sponsor") && !g.has("siegelring") && !!g.flag("c1_ring_offen"),
              run: () => ringCheck(g),
            },
            {
              text: "Wovor warnt Ihr Brandt?",
              show: () => !!g.flag("c1_halvard_story"),
              run: async () => {
                await halvard(g, "Vor dem Kanzler Malvor. Der König trinkt seinen Wein nicht aus Durst. Der Kelch ist vergiftet, Junge, und niemand will es hören.");
                await halvard(g, "Wenn du nach Grauwacht kommst: Trau keinem, der zu freundlich lächelt. Und hüte deinen Becher.");
              },
            },
            {
              text: "Was erwartet mich im Moor?",
              show: () => F(g, "c1_halvard_wasser"),
              run: async () => {
                await halvard(g, "Das Hexenmoor? Nebel, Irrlichter, Schlangen. Und Morwenna. Eine alte Frau, die Kräuter kennt, vor denen selbst der Teufel einen Bogen macht.");
                await halvard(g, "Sie braut Gegengifte. Wenn der König noch zu retten ist, dann von ihr. Bring Gaben mit und sei höflich.");
              },
            },
            {
              text: "Haltet durch. Ich hole Hilfe.",
              show: () => F(g, "have_sponsor"),
              run: async () => {
                await halvard(g, "Hilfe? In Aschenfurt? Ha. Sag Brandt, er soll zwei Männer schicken, die weniger Angst vor Wölfen haben als vor mir.");
              },
            },
            bye("Geh, Junge. Und lass dich nicht beißen.", "halvard", g, "Ich komme wieder."),
          ]);
        },
      }),
    ),
    npc({
      id: "wolf1",
      name: "Wolf",
      x: 290,
      y: 388,
      frames: { idle: "wolf_growl", flee: "wolf_flee" },
      hidden: wolvesGone,
      look: "Ein grauer Wolf mit gelben Augen. Er bewacht Halvard wie ein Hund einen Knochen: mit viel Zuneigung und Zähnen.",
      talk: "Der Wolf knurrt. Ein wunderbares Gespräch, aber einseitig.",
      take: "Ich greife nach dem Wolf? Ich habe zwei Hände und sehr gern beide.",
      use: "Ich bin ein einfacher Totengräber. Kein Wolfsflüsterer. Er knurrt, ich weiche zurück.",
      give: { wurst: "Ich werfe dem Wolf die Wurst zu? Dann ist er satt, und meine Waden sind dran. Ich brauche eine Falle.", brot_alt: "Der Wolf schnuppert am Brot und wendet sich angewidert ab. Selbst Wölfe haben Standards." },
    }),
    npc({
      id: "wolf2",
      name: "Wolf",
      x: 240,
      y: 420,
      frames: { idle: "wolf_growl", flee: "wolf_flee" },
      hidden: wolvesGone,
      look: "Ein zweiter, kleinerer Wolf. Er knurrt weniger, schaut dafür öfter zu meiner Wade.",
      talk: "Der Wolf legt die Ohren an. Er ist kein Gesprächspartner.",
      take: "Das ist nicht mein Haustier. Und ich werde auch keins daraus machen.",
      use: "Ich gehe lieber auf Abstand. Der Wolf auch, aber in meine Richtung.",
    }),

    /* --- the trap */
    {
      id: "falle",
      name: "Wolfsfalle",
      sprite: (g) => (F(g, "c1_falle_zu") ? "falle_zu" : F(g, "c1_falle_heil") ? "falle_offen" : "falle_zu"),
      x: 450,
      y: 404,
      scale: 1.6,
      hit: [405, 366, 90, 44],
      look: (g) => (F(g, "c1_falle_zu") ? "Die Falle ist zugeschnappt. Ein paar graue Haare hängen noch dran. Sie hat ihre Pflicht getan." : F(g, "c1_falle_heil") ? (F(g, "c1_koeder") ? "Die Falle ist gespannt und mit Wurst bestückt." : "Die Wolfsfalle, gespannt und bereit. Es fehlt nur ein Köder.") : "Eine rostige Wolfsfalle, zugeschnappt. Der Bolzen, der sie spannen würde, ist abgebrochen. Mit einem Nagel ließe sich das beheben."),
      take: "Die Falle nehme ich nicht mit. Sie beißt auch Besitzer.",
      use: (g) => {
        if (F(g, "c1_falle_zu")) return "Die Falle ist zugeschnappt. Sie hat ihre Arbeit getan und ruht sich aus.";
        if (!F(g, "c1_falle_heil")) return "Ich ziehe an den Zähnen. Sie klappen nicht auf, der Bolzen fehlt. Ich brauche etwas, das ihn ersetzt: einen Nagel, vielleicht.";
        return "Die Falle ist gespannt. Ich fasse sie lieber nicht an. Ich brauche noch zehn Finger.";
      },
      useWith: {
        nagel: async (g) => {
          if (F(g, "c1_falle_heil")) return g.say("Die Falle ist schon repariert. Mehr Nägel braucht sie nicht, außer für meinen Sarg.");
          g.remove("nagel");
          g.set("c1_falle_heil", true);
          g.sfx("clank");
          await g.pose("use", 700);
          await g.say("Ich schiebe den Nagel durch das Scharnier. Dann spanne ich die Federn auseinander, vorsichtig, wie eine Kreuzotter. Klack.");
          await g.say("Die Falle steht offen wie ein Maul. Jetzt fehlt noch ein Köder.");
        },
        wurst: (g) => bait(g, "wurst"),
        knochen: "Ein abgenagter Knochen? Den hat schon jemand verschmäht. Der Wolf will etwas mit Fleisch dran. Wurst, am besten.",
        brot_alt: "Brot als Köder? Wölfe sind keine Raben. Sie wollen etwas, das einmal gelebt hat.",
        tote_ratte: "Eine tote Ratte als Köder? Der Wolf schaut mich beleidigt an. Es muss mehr sein. Wurst, am besten.",
      },
    },

    /* --- camp and props */
    { id: "baumstumpf", name: "Baumstumpf", sprite: "baumstumpf", x: 660, y: 385, look: "Ein knorriger Baumstumpf. Seine Jahresringe erzählen von besseren Zeiten. Und von Äxten.", use: "Ich setze mich kurz darauf. Es ist unbequem. Ein Baumstumpf kennt keine Gnade.", take: "Der Stumpf hängt noch an den Wurzeln. Ich auch, an meinem Leben." },
    guarded(
      container({
        id: "tornister",
        name: "Halvards Tornister",
        x: 105,
        y: 428,
        sprites: { closed: "lumpenkorb", open: "lumpenkorb" },
        contents: ["kerze", "kamm"],
        title: "Halvards Tornister",
        look: "Ein ledernes Bündel neben dem Ritter. Wolfszähne haben es durchbohrt. Das Wenige, was drin ist, hat den Angriff überlebt.",
        emptyText: "Leer. Der Rest war wohl Abendessen.",
      }),
    ),
    { id: "strohlager", name: "Lager", sprite: "strohlager", x: 360, y: 438, hit: [325, 408, 70, 32], look: "Das Lager der Wölfe: zertrampeltes Stroh und Knochen. Ein Albtraum für Allergiker.", use: "Ich stochere im Stroh. Haare, Knochen und der Geruch nasser Wolle." },
    { id: "knochenhaufen", name: "Knochenhaufen", sprite: "knochenhaufen", x: 560, y: 436, look: "Knochen. Kleine, große, mittelgroße. Die Wölfe haben hier gespeist, und zwar ausgiebig.", take: "Es sind genug Knochen in Aschenfurt. Ich brauche keine weiteren." },
    { id: "tierskelett", name: "Hirschskelett", sprite: "tierskelett", x: 690, y: 436, look: "Das Skelett eines Hirsches. Er wollte in den Wald und kam nur bis hierher. Ein Leben in einem Satz.", take: "Die Knochen sind sauber abgenagt. Nichts mehr zu holen." },
    container({
      id: "steinhaufen",
      name: "Steinhaufen",
      x: 540,
      y: 360,
      sprites: { closed: "steinhaufen", open: "steinhaufen" },
      contents: ["zinnring"],
      title: "Steinhaufen",
      look: "Ein Haufen loser Steine. Jemand hat hier etwas versteckt. Oder die Steine haben es selbst versteckt.",
      emptyText: "Nur Steine, Käfer und eine Menge Geduld.",
      onOpen: async (g) => {
        await g.say("Ich wälze ein paar Steine zur Seite. Etwas Rundes liegt dazwischen.");
      },
    }),
    { id: "schubkarre", name: "Umgekippte Schubkarre", sprite: "schubkarre", x: 825, y: 372, look: "Eine umgekippte Schubkarre, halb im Moos versunken. Wer sie hierher geschoben hat, wollte nicht weit.", take: "Eine Schubkarre mitnehmen? Ich habe keinen Platz für ein Fahrzeug im Gepäck.", use: "Ich richte sie auf. Sie kippt sofort wieder um, aus Prinzip." },
    { id: "eiche", name: "Alte Eiche", sprite: null, x: 150, y: 280, hit: [70, 100, 160, 200], at: { x: 120, y: 400 }, look: "Eine uralte, riesige Eiche. Ihre Äste greifen nach dem Himmel. Die Wurzeln greifen nach Halvard." },
    { id: "moorlicht", name: "Grünes Leuchten", sprite: null, x: 780, y: 250, hit: [700, 200, 220, 80], at: { x: 780, y: 372 }, look: "Ein grünliches Leuchten über dem fernen Moor. Es lockt wie ein Wirtshaus, in dem man nie wieder bezahlen muss." },

    /* --- ground items */
    groundItem({ id: "w_holzstab", item: "holzstab", x: 625, y: 412, say: "Ein gerader Ast, so lang wie mein Arm. Noch kein Werkzeug, aber voller Hoffnung.", at: { x: 620, y: 415 } }),
    groundItem({ id: "w_fieberkraut", item: "fieberkraut", x: 790, y: 392, say: "Gelbe Blüten, schwarze Erde: Fieberkraut. Hildas Enkel wird es freuen.", at: { x: 790, y: 400 } }),
    groundItem({ id: "w_pilz", item: "pilz", x: 835, y: 405, say: "Ein Fliegenpilz. Wunderschön, giftig, ehrlich. Ich esse ihn nicht.", at: { x: 835, y: 410 } }),
  ] as Thing[],
};

