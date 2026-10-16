import { bye, cabinet, container, decor, EDGE, edgeExit, exitThing, groundItem, hero, npc, once, says, talk } from "../dsl";
import type { ChapterModule, G, SceneDef, Thing } from "../types";
import { hiddenBox, spot } from "./ch2_util";
import { GEO } from "./geometry";

/* =========================================================================
 * KAPITEL 2 — Das Hexenmoor
 *   moorpfad     Steg, Moorlaternen (Reihenfolge!), Alraune, Schlange, Totem
 *   hexenhuette  Morwenna, Kessel-Alchemie, Kommode, Truhe, Katze, Käfig
 *
 * Flags (alle c2_*):
 *   c2_seq / c2_lit_{m,r,l}  Laternenfolge        c2_lamps_done   Irrlichter vertrieben
 *   c2_ohren                 Wachs in den Ohren   c2_schlange_ab  Schlange abgelenkt
 *   c2_kn                    Kesselschritt 0..4   c2_kocht        Gebräu kocht
 *   c2_gegengift             Gegengift abgefüllt (+ hexentalisman erhalten)
 * ========================================================================= */

const POEM = [
  "Erst des Mondes bleiches Licht,",
  "dann der Hexe Haus im Moor,",
  "zuletzt der Heimat schwacher Schein –",
  "dann ziehen die Irrlichter fort.",
];
const SEQ = "mrl"; // Mitte (Mond), Rechts (Hexenhaus), Links (Heimat)

/* ------------------------------------------------------------ helpers */
const litAll = (g: G) => ["m", "r", "l"].forEach((k) => g.set(`c2_lit_${k}`, false));

async function lightLamp(g: G, k: "m" | "r" | "l") {
  if (g.flag("c2_lamps_done")) return g.say("Sie brennt friedlich. Die Irrlichter schmollen irgendwo im Nebel.");
  if (g.flag(`c2_lit_${k}`)) return g.say("Diese Laterne brennt schon.");
  const seq = String(g.flag("c2_seq") ?? "");
  const next = seq + k;
  if (SEQ.startsWith(next)) {
    g.sfx("fire");
    await g.pose("use", 500);
    g.set(`c2_lit_${k}`, true);
    g.set("c2_seq", next);
    if (next === SEQ) {
      g.set("c2_lamps_done", true);
      g.flash("#9fffd8", 700);
      g.sfx("magic");
      await g.say("Die dritte Flamme faucht auf. Ein Pfeifen geht durch das Moor, dann Stille.");
      await g.say("Die Irrlichter sinken ins Wasser wie beleidigte Hofdamen. Der Steg zur Hütte ist frei.");
      await hero(g, "Nach Stein sieht das Ganze nicht aus. Aber nach Anstand.");
    } else if (next.length === 1) {
      await g.say("Die Flamme brennt ruhig und grünlich. Irgendwo im Nebel zischt etwas verärgert.");
    } else {
      await g.say("Zwei Flammen. Die Irrlichter weichen ein Stück zurück. Das scheint zu stimmen.");
    }
    return;
  }
  // wrong order
  g.sfx("wrong");
  g.shake(500);
  g.flash("#6fe8c0", 400);
  litAll(g);
  g.set("c2_seq", "");
  await g.say("Die Flamme zuckt. Ein hohes Kichern geht über das Wasser, und alle Laternen erlöschen auf einmal.");
  await hero(g, "Das war die falsche Reihenfolge. Die Irrlichter lachen mich aus. Sehr professionell.");
  await g.walk(110, 392);
}

/** Cauldron: strictly Wasser, Feder, Wurzel, Zunge, Feuer. */
const ORDER = ["moorwasser", "rabenfeder", "alraune", "schlangenzunge", "fackel"] as const;
const STEP_TEXT: Record<string, string[]> = {
  moorwasser: ["Das Moorwasser platscht in den Kessel und blubbert träge zurück.", "Morwenna nickt kaum merklich: „Das Nasse zuerst. Immerhin.“"],
  rabenfeder: ["Die Feder schwebt auf dem Wasser wie ein kleines schwarzes Schiff.", "Das Wasser färbt sich tintig."],
  alraune: ["Die Alraune sinkt in den Kessel. Für einen Augenblick glaube ich, sie seufzt.", "Das Gebräu wird dick und riecht nach nasser Erde und schlechtem Gewissen."],
  schlangenzunge: ["Ich werfe die Zunge hinein. Es zischt, als würde sie noch Meinungen haben.", "Die Brühe schimmert türkis. Es fehlt nur noch das Feuer."],
};
function restoreBrew(g: G) {
  for (const it of ORDER) {
    if (g.flag(`c2_in_${it}`)) {
      g.set(`c2_in_${it}`, false);
      if (it === "moorwasser") {
        g.remove("eimer");
        g.add("moorwasser");
      } else if (it !== "fackel") g.add(it);
    }
  }
  g.set("c2_kn", 0);
}
async function brew(g: G, item: (typeof ORDER)[number]) {
  if (g.flag("c2_kocht")) return g.say("Der Kessel kocht schon. Jetzt fehlt nur ein Gefäß für das Gegengift.");
  const n = Number(g.flag("c2_kn") ?? 0);
  if (!g.flag("c2_recipe") && n === 0) {
    await says(g, "morwenna", "Halt! Du wirfst nicht blind Zeug in meinen Kessel. Frag erst, wie man es richtig macht.");
    return;
  }
  if (ORDER[n] === item) {
    g.set(`c2_in_${item}`, true);
    g.set("c2_kn", n + 1);
    if (item === "fackel") {
      g.sfx("fire");
      g.set("c2_kocht", true);
      g.flash("#8fffe0", 600);
      await g.pose("use", 600);
      await g.say("Ich halte die Fackel unter den Kessel. Die Flammen lecken am Eisen, das Gebräu beginnt zu kochen.");
      await says(g, "morwenna", "Fertig gekocht. Türkis wie ein toter Fisch – genau richtig.", "Jetzt brauchst du etwas, worin du es nach Grauwacht tragen kannst. Eine Flasche.");
      return;
    }
    g.sfx("splash");
    await g.pose("use", 500);
    g.remove(item);
    if (item === "moorwasser") g.add("eimer");
    for (const l of STEP_TEXT[item]) await g.say(l, l.startsWith("Morwenna") || l.includes("„") ? "morwenna" : "hero");
    return;
  }
  // wrong order -> setback, everything is returned
  if (item === "fackel" && n === 0) return g.say("Feuer unter einem leeren Kessel? Ich würde nur Luft kochen.");
  g.sfx("wrong");
  g.shake(700);
  g.flash("#9be86a", 600);
  await g.say("Der Kessel faucht, würgt und speit eine grüne Wolke bis zur Decke. Ich lande rücklings auf dem Boden.");
  restoreBrew(g);
  await says(g, "morwenna", "Falsche Reihenfolge! Ich sagte: erst das Nasse, dann das Leichte, das Tiefe, das Böse – zuletzt das Feuer.");
  await g.say("Sie fischt mit dem Löffel alles aus dem Qualm und drückt es mir in die Hand. „Von vorn. Und diesmal mit Verstand.“", "morwenna");
}

const brewRoute = (it: (typeof ORDER)[number]) => (g: G) => brew(g, it);

/* ============================================================ moorpfad */
const lampThing = (k: "m" | "r" | "l", x: number, name: string, look: string): Thing => ({
  id: `laterne_${k}`,
  name,
  sprite: (g) => (g.flag(`c2_lit_${k}`) ? "moorlaterne_an" : "moorlaterne_aus"),
  x,
  y: 372,
  look: (g) => g.say(g.flag(`c2_lit_${k}`) ? "Die Laterne brennt mit grünlichem Schein. Sehr gemütlich, wenn man Sumpfgas mag." : look),
  take: "Sie ist am Steg festgenagelt. Wer stiehlt schon Laternen im Moor? Nur Irrlichter.",
  use: (g) => g.say(g.flag(`c2_lit_${k}`) ? "Sie brennt schon." : "Ohne Flamme gibt sie nichts her. Meine Fackel vielleicht?"),
  useWith: {
    fackel: (g) => lightLamp(g, k),
    kerzenwachs: "Wachs auf die Laterne? Dann brennt sie schlechter, nicht besser.",
    eimer: "Wasser auf eine Laterne. Das ist der Gegenbeweis zu allem, wofür sie gebaut wurde.",
  },
});
const lampGlow = (k: "m" | "r" | "l", x: number) => decor({ id: `glow_${k}`, sprite: () => null, x, y: 372, hidden: (g) => !g.flag(`c2_lit_${k}`), light: { r: 120, color: "rgba(120,255,200,0.55)", flicker: 0.2, dy: -85 } });

const irrlicht = (n: number, x: number, y: number, look: string): Thing =>
  spot({
    id: `irrlicht_${n}`,
    name: "Irrlicht",
    hit: [x - 20, y - 20, 40, 40],
    at: { x: Math.max(110, Math.min(780, x)), y: 380 },
    hidden: (g) => !!g.flag("c2_lamps_done"),
    look,
    use: "Ich greife nach dem Licht. Es kichert und tanzt eine Handbreit weiter. Typisch Irrlicht.",
    take: "Ein Licht fangen? Dann wäre ich der erste, der es überlebt.",
    useWith: { fackel: "Es lacht über meine kleine Fackel. Neid der Größe." },
  });

const moorpfad: SceneDef = {
  id: "moorpfad",
  title: "Moorpfad",
  bg: "moorpfad",
  walk: GEO.moorpfad.walk,
  scale: GEO.moorpfad.scale,
  ambient: "swamp",
  fx: [
    { kind: "fog", area: [0, 240, 960, 200], n: 1.1 },
    { kind: "fireflies", area: [0, 140, 960, 220], n: 0.6 },
  ],
  things: [
    // ----- exits
    exitThing([836, 40, 110, 125], {
      id: "to_huette",
      name: "Hexenhütte",
      to: "hexenhuette",
      x: 130,
      y: 385,
      facing: 1,
      at: { x: 852, y: 374 },
      look: "Eine windschiefe Hütte auf Stelzen. Hinter dem Fenster brennt ein Licht, das nicht nach Kerze aussieht.",
      guard: (g) => (g.flag("c2_lamps_done") ? null : "Die letzten Planken zur Hütte tanzen unter Irrlichtern. Wer ihnen folgt, endet im Schlamm. Ich brauche Licht, das sie vertreibt."),
    }),
    {
      id: "to_grauwacht",
      name: "Weg nach Grauwacht",
      sprite: null,
      x: 917,
      y: 424,
      hit: EDGE.right,
      at: { x: 922, y: 395 },
      primary: "walk",
      look: "Der Steg führt nach Osten, aus dem Moor hinaus. Irgendwo dahinter liegt Burg Grauwacht.",
      walk: leaveMoor,
    },
    {
      id: "to_aschenfurt",
      name: "Zurück nach Westen",
      sprite: null,
      x: 43,
      y: 424,
      hit: EDGE.left,
      at: { x: 38, y: 395 },
      primary: "walk",
      look: "Dort liegt Aschenfurt. Dort liegt auch alles, was ich hinter mir lassen wollte.",
      walk: async (g) => {
        await hero(g, "Zurück nach Aschenfurt? Mit leeren Händen? Brandt würde mich auslachen.", "Der König stirbt dort drüben. Ich gehe nach Osten.");
      },
    },

    // ----- Totem with the riddle + a feather
    {
      id: "totem",
      name: "Krähenschädel-Totem",
      sprite: "totem",
      x: 175,
      y: 368,
      scale: 0.95,
      look: async (g) => {
        g.set("c2_poem", true);
        await g.say("Ein Pfahl voller Krähenschädel. Zwischen den Knochen sind Zeilen eingeritzt:");
        for (const l of POEM) await g.say(l);
        await hero(g, "Mond, Hexenhaus, Heimat. Und die Laternen am Steg kennen die Reihenfolge, nehme ich an.");
      },
      take: "Das Totem ist tief im Torf verwurzelt. Die Schädel starren mich an, als wüssten sie, wie das ausgeht.",
      use: "Ich klopfe leise an einen Schädel. Er klappert. Der Nachbar auch. Eine Gemeinschaft.",
      useWith: { fackel: "Ein brennendes Holzstück neben Knochen und Federn. Das wäre ein kurzer Zauber." },
    },
    groundItem({ id: "m_rabenfeder", item: "rabenfeder", x: 218, y: 396, say: "Eine Rabenfeder vom Totem. Die Krähen hier sind entweder großzügig oder in der Mauser." }),

    // ----- three lanterns
    lampThing("l", 312, "Moorlaterne", "Eine tote Laterne. Am Sockel hat jemand ein Haus mit Rauchfaden eingeritzt: die Heimat?"),
    lampThing("m", 500, "Moorlaterne", "Eine tote Laterne. In ihr Eisen ist ein Halbmond geritzt. Der Mond, wenn man es poetisch sehen will."),
    lampThing("r", 712, "Moorlaterne", "Eine tote Laterne. Am Sockel ist eine Hütte auf Stelzen eingeritzt. Sie zeigt nach Osten."),
    lampGlow("l", 312),
    lampGlow("m", 500),
    lampGlow("r", 712),

    // ----- Irrlichter (painted into the background)
    irrlicht(1, 232, 203, "Ein bläuliches Licht über dem Wasser. Es schwebt genau so, dass man ihm folgen will."),
    irrlicht(2, 452, 182, "Ein Irrlicht. Es blinkt zweimal, als würde es mir etwas zuflüstern. Vermutlich eine Lüge."),
    irrlicht(3, 464, 284, "Ein Irrlicht dicht über dem Steg. Es riecht nach Schwefel und Schadenfreude."),
    irrlicht(4, 662, 180, "Ein fahles Licht. Wo es hinführt, wartet Schlamm. Das weiß ich, weil es gleich hinter mir kichert."),

    // ----- snake, tongue, rat
    {
      id: "schlange",
      name: "Moorschlange",
      sprite: "schlange",
      x: 405,
      y: 378,
      scale: 1.3,
      hit: [380, 336, 52, 46],
      look: (g) => g.say(g.flag("c2_schlange_ab") ? "Die Schlange verdaut die Ratte. Sie sieht aus wie ein Seil mit einer Beule und guten Gründen, in Ruhe gelassen zu werden." : "Eine fette Moorschlange. Sie bewacht eine vertrocknete Zunge neben sich und blickt mich an, als wüsste sie, was ich will."),
      take: "Eine Schlange mit der Hand greifen? Der Friedhof ist voll von Leuten, die das auch versucht haben.",
      use: (g) => g.say(g.flag("c2_schlange_ab") ? "Ich stupse sie an. Sie öffnet ein Auge, schließt es wieder. Die Ratte war ein gutes Geschäft." : "Sie zischt, und ich ziehe die Hand sofort zurück. Ich habe meinen Arm noch gern."),
      useWith: {
        tote_ratte: async (g) => {
          if (g.flag("c2_schlange_ab")) return g.say("Eine Ratte reicht ihr. Sie ist keine Ritterin der unersättlichen Tafel.");
          g.remove("tote_ratte");
          g.set("c2_schlange_ab", true);
          g.sfx("splash");
          await g.pose("use", 500);
          await g.say("Ich lege die tote Ratte ein Stück entfernt aufs Holz. Die Schlange vergisst mich augenblicklich.");
          await g.say("Sie schluckt die Ratte im Ganzen, langsam und selbstzufrieden, und wird träge.");
          await hero(g, "Menschen sind weniger leicht zu bestechen. Aber nur weil sie keine Ratten mögen.");
        },
        wurst: "Eine Wurst? Sie sieht mich an, als hätte ich ihr ein Gedicht vorgelesen. Schlangen wollen Beute, die vorher gelebt hat.",
        brot_alt: "Brot interessiert sie nicht. Offenbar bin ich der Einzige, der in diesem Moor Kohlenhydrate schätzt.",
      },
    },
    groundItem({
      id: "m_zunge",
      item: "schlangenzunge",
      x: 462,
      y: 392,
      look: "Eine vertrocknete, gespaltene Zunge. Die Schlange behält sie im Blick.",
      guard: (g) => (g.flag("c2_schlange_ab") ? null : "Die Schlange schnellt vor, ihr Kopf kaum eine Handbreit von meinen Fingern. Ich sollte sie erst ablenken."),
      say: "Die Zunge ist hart wie Leder und riecht nach Pökelsalz. Morwenna wird sich freuen. Ich weniger.",
    }),
    groundItem({ id: "m_ratte", item: "tote_ratte", x: 152, y: 404, say: "Eine tote Ratte im Schilf. Gefunden, nicht gestohlen. Ich fasse sie mit dem Zipfel meines Ärmels.", look: "Eine tote Ratte, steif wie ein Gebet. Für manche ein Ekel, für andere ein Abendessen." }),

    // ----- alraune
    {
      id: "alraune",
      name: "Alraune",
      sprite: "alraune",
      x: 612,
      y: 384,
      scale: 1.5,
      hit: [586, 320, 56, 70],
      hidden: (g) => !!g.flag("c2_alraune_got"),
      primary: "take",
      look: "Eine Wurzel mit Armen, Beinen und einem Gesicht, das mich vorwurfsvoll ansieht. Ihr Schrei soll Menschen töten. Wer sie ausgräbt, braucht Wachs in den Ohren.",
      take: async (g) => {
        if (!g.flag("c2_ohren")) {
          g.sfx("roar");
          g.flash("#ffffff", 300);
          g.shake(700);
          await g.pose("pick", 500);
          await g.say("Kaum berühre ich die Blätter, öffnet die Wurzel den Mund. Der Schrei geht mir durch Mark und Bein.");
          await g.say("Ich taumele rückwärts über den Steg, mit klingelndem Schädel. Das war zu früh und zu laut.");
          await hero(g, "Ich brauche etwas in den Ohren. Etwas Weiches, Dichtes. Wachs vielleicht, wie es die Seeleute tun.");
          await g.walk(540, 396);
          return;
        }
        g.sfx("dig");
        await g.pose("dig", 900);
        g.sfx("roar");
        g.shake(500);
        await g.say("Ich ziehe. Die Wurzel kreischt, ich höre es nur als fernes Summen. Dann hält sie still, beleidigt.");
        g.add("alraune");
        g.set("c2_alraune_got", true);
        g.set("c2_ohren", false);
        await hero(g, "Ein guter Moment, kein Held zu sein und Wachs zu benutzen.");
      },
      use: (g) => g.say("Ich betrachte sie aus sicherer Entfernung. Ihre geschlossenen Augen sind kein Grund, ihr zu trauen."),
      useWith: {
        kerzenwachs: async (g) => {
          if (g.flag("c2_ohren")) return g.say("Meine Ohren sind schon dicht. Ich höre nur noch mein Blut.");
          g.remove("kerzenwachs");
          g.set("c2_ohren", true);
          await g.pose("use", 500);
          await g.say("Ich knete das Wachs weich und stopfe es mir in die Ohren. Die Welt wird zu einem warmen, dumpfen Brummen.");
          await hero(g, "Jetzt kann sie schreien, wie sie will.");
        },
        eimer: "Alraunen brauchen kein Wasser. Sie leben vom Zorn.",
        fackel: "Alraune verbrennen? Die Hexe würde mich verfluchen. Und ich schon die Alraune.",
      },
    },

    // ----- water
    spot({
      id: "tuempel",
      name: "Tümpel",
      hit: [490, 285, 190, 55],
      at: { x: 560, y: 360 },
      look: "Trübes, grünes Moorwasser. Kleine Blasen steigen auf, als atme dort unten etwas.",
      use: "Ich tauche eine Hand hinein. Etwas Lebendiges streift meine Finger. Ich beschließe, kein Wasser mit der Hand zu holen.",
      take: "Wasser mit den Händen tragen? Ich bin Totengräber, kein Wunder.",
      useWith: {
        eimer: async (g) => {
          if (g.has("moorwasser")) return g.say("Ich habe schon einen Eimer voll Moorwasser.");
          g.sfx("splash");
          await g.pose("use", 600);
          g.remove("eimer");
          g.add("moorwasser");
          await g.say("Der Eimer taucht ein, und das Wasser kommt grün, dickflüssig und leise murmelnd wieder heraus.");
          await hero(g, "Sieht aus wie Suppe. Riecht wie die Suppe vom letzten Hungerjahr.");
        },
        fackel: "Wenn das Gas hier brennt, ist es das letzte Licht, das ich sehe.",
      },
    }),

    // ----- containers & decoration
    container({
      id: "moor_stumpf",
      name: "Hohler Baumstumpf",
      x: 842,
      y: 400,
      sprites: { closed: "baumstumpf", open: "baumstumpf" },
      scale: 0.9,
      contents: ["brot_alt", "pilz", "zinnbecher", "apfelrest"],
      look: "Ein hohler Baumstumpf, glatt wie ein Mund. Jemand benutzt ihn als Vorratskammer, und ich ahne, wer.",
      title: "Im Stumpf",
      emptyText: "Leer. Selbst die Würmer sind ausgezogen.",
    }),
    container({
      id: "moor_skelett",
      name: "Ochsenskelett",
      x: 740,
      y: 406,
      sprites: { closed: "tierskelett", open: "tierskelett" },
      scale: 0.85,
      contents: ["knochen", "rostiger_dolch", "messingknopf"],
      look: "Das Skelett eines Zugochsen. Er hat wohl Geduld bewiesen, bis zum letzten Schritt. Zwischen den Rippen liegt etwas.",
      title: "Zwischen den Rippen",
    }),
    spot({
      id: "moor_burg",
      name: "Ferne Türme",
      hit: [545, 55, 120, 75],
      at: { x: 560, y: 380 },
      look: "Hinter Nebel und Wasser ragen Türme auf: Burg Grauwacht. So nah, dass man sie sehen kann, so fern, dass man vorher sterben könnte.",
    }),
    spot({
      id: "moor_baum",
      name: "Toter Riesenbaum",
      hit: [0, 0, 250, 300],
      at: { x: 150, y: 375 },
      look: "Ein gewaltiger, toter Baum, behängt mit Moos wie mit Trauerfahnen. Er sieht aus, als hätte er früher Krieg gegen den Himmel geführt.",
      take: "Ich nehme einen Ast mit? Das ganze Moor ist aus Ästen gemacht. Ich nehme lieber Abstand.",
    }),
    spot({
      id: "moor_pfaehle",
      name: "Verrottete Pfähle",
      hit: [800, 185, 70, 110],
      at: { x: 800, y: 380 },
      look: "Schwarze, schiefe Pfähle ragen aus dem Wasser. Einst ein Steg, ein Zaun oder ein Galgen. Im Moor sind die Grenzen fließend.",
    }),
    spot({
      id: "moor_schilf",
      name: "Schilf",
      hit: [570, 240, 130, 90],
      at: { x: 640, y: 365 },
      look: "Dichtes Schilf mit braunen Kolben. Es raschelt, auch wenn kein Wind geht. Ich gehe davon aus, dass das nicht der Wind ist.",
      use: "Ich teile das Schilf. Dahinter ist nur noch mehr Schilf. Und etwas, das sich hastig wegbewegt.",
    }),
  ],
};

/** East exit: only with antidote + talisman. */
async function leaveMoor(g: G) {
  if (!g.has("gegengift")) {
    await hero(g, "Ohne Gegengift nach Grauwacht? Dann komme ich mit leeren Händen. Der König wartet nicht ewig.");
    return;
  }
  if (!g.has("hexentalisman")) {
    await hero(g, "Der Weg hinaus führt an den Geistern des Moores vorbei. Ohne Schutz gehe ich nicht.");
    return;
  }
  await hero(g, "Ein Gegengift, ein Rabenschädel an einer Schnur und ein Schwert, das ich selbst gemacht habe.", "Das hätte ich Brandt gerne gezeigt. Nun gut. Grauwacht.");
  await g.card("Kapitel 3", "Burg Grauwacht");
  g.set("chapter", 3);
  await g.goto("burgtor", 80, 400, 1);
}

/* ============================================================ hexenhuette */
const hexenhuette: SceneDef = {
  id: "hexenhuette",
  title: "Morwennas Hütte",
  bg: "hexenhuette",
  walk: GEO.hexenhuette.walk,
  scale: GEO.hexenhuette.scale,
  ambient: "hut",
  fx: [{ kind: "dust", n: 0.5 }, { kind: "embers", area: [380, 250, 220, 80], n: 0.5 }],
  enter: async (g) => {
    await once(g, "c2_huette_intro", async () => {
      await g.say("Drinnen ist es warm, es riecht nach Kräutern, Kerzenwachs und etwas, das früher ein Tier war.");
    });
  },
  things: [
    edgeExit("left", { id: "to_moor", name: "Hinaus ins Moor", to: "moorpfad", x: 820, y: 384, facing: -1, look: "Die Tür zum Moor. Draußen warten Nebel und Schlamm." }),

    // ----- Morwenna
    npc({
      id: "morwenna",
      name: "Morwenna",
      x: 392,
      y: 376,
      frames: { idle: "morwenna_idle", talk: "morwenna_talk", stir: "morwenna_stir" },
      look: "Morwenna, die Moorhexe. Sie sieht aus wie jemand, der drei Pestjahre überlebt hat und den Rest für unhöflich hält.",
      pick: (_n, g) => (g.flag("c2_kn") && !g.flag("c2_gegengift") ? "stir" : null),
      talk: async (g) => {
        await once(g, "c2_met_morwenna", async () => {
          await says(g, "morwenna", "Sieh an. Ein Totengräberjunge, der freiwillig durchs Moor spaziert. Die Irrlichter haben dich nicht gefressen.");
          await hero(g, "Ich habe ihnen ein paar Laternen gezeigt. Sie waren beeindruckt.");
          await says(g, "morwenna", "Die Laternen. Hm. Der Reim vom Totem. Du kannst lesen, oder du bist zufällig klug. Setz dich nicht, du verschmutzt die Stühle.");
        });
        await talk(g, () => [
          {
            text: "Wer seid Ihr?",
            run: () =>
              says(g, "morwenna", "Morwenna. Heilerin, Hexe, Nachbarin. Je nachdem, wen du fragst und ob gerade jemand krank ist.", "Die Leute aus dem Dorf holen mich, wenn sie sterben. Und verbrennen mich, wenn sie nicht sterben."),
          },
          {
            text: "Ich brauche ein Gegengift gegen Schierling.",
            show: () => !g.flag("c2_recipe"),
            run: async () => {
              await says(g, "morwenna", "Schierling. Der König, nehme ich an. Der Rabenorden sucht Hilfe, wenn es zu spät ist.");
              await hero(g, "Wenn Ihr es nicht tut, stirbt er. Und ich werde nie Ritter.");
              await says(g, "morwenna", "Zwei gute Gründe, einer davon egoistisch. Ich mag dich schon fast.", "Ich braue es nicht für dich. Du brauchst es selbst, mit deinen Händen, unter meinen Augen. Fünf Dinge, in genau dieser Reihenfolge:");
              await says(g, "morwenna", "„Erst das Nasse aus dem Moor. Dann das Leichte, das fliegt. Dann das Tiefe, das schreit. Dann das Böse, das züngelt. Und zuletzt das Feuer.“");
              g.set("c2_recipe", true);
              await hero(g, "Wasser, Feder, Wurzel, Zunge, Feuer. Ich kann mir Reihenfolgen merken. Mein Beruf besteht daraus.");
              await says(g, "morwenna", "Gib die Dinge in den Kessel, wenn du sie hast. Einmal falsch, und er spuckt. Ich habe schon eine Katze verloren, aber nur an eine Ratte.");
            },
          },
          {
            text: "Wie war die Reihenfolge noch mal?",
            show: () => !!g.flag("c2_recipe") && !g.flag("c2_kocht"),
            run: () =>
              says(g, "morwenna", "Das Nasse. Das Leichte. Das Tiefe. Das Böse. Das Feuer.", "Nasses ist im Moor, Leichtes hat Flügel, Tiefes hat Wurzeln, Böses hat eine gespaltene Zunge."),
          },
          {
            text: "Wo finde ich die Zutaten?",
            show: () => !!g.flag("c2_recipe") && !g.flag("c2_kocht"),
            run: async () => {
              await says(g, "morwenna", "Draußen auf dem Steg, nicht in meiner Hütte. Ich lasse mich nicht ausrauben, ich lasse mich nur besuchen.");
              if (!g.has("moorwasser") && !g.flag("c2_in_moorwasser")) await says(g, "morwenna", "Das Wasser: Dein Eimer tut es im Tümpel. Ich trinke es nicht, aber das ist Geschmackssache.");
              if (!g.has("rabenfeder") && !g.flag("c2_in_rabenfeder")) await says(g, "morwenna", "Federn: Wo Krähen auf Schädeln sitzen, fallen sie. Das Totem am Anfang des Stegs.");
              if (!g.has("alraune") && !g.flag("c2_in_alraune")) await says(g, "morwenna", "Alraune: Wächst am Steg. Zieh sie nie aus ohne Wachs in den Ohren. Mein Kommodenwachs steht dir in der mittleren Schublade zu.");
              if (!g.has("schlangenzunge") && !g.flag("c2_in_schlangenzunge")) await says(g, "morwenna", "Zunge: Die Schlange sitzt drauf. Lenk sie ab. Schlangen mögen, was gestorben ist. Wie ich.");
            },
          },
          {
            text: "Wieso ist da ein Rabe im Käfig?",
            run: () =>
              says(g, "morwenna", "Weil er mir gestern noch die Perlen für den Rosenkranz gestohlen hat. Jetzt ist er mein Berater. Er redet mehr als ich und hat selten recht.", "Er mag Brot. Wer ihn füttert, bekommt gute Ratschläge. Meistens."),
          },
          {
            text: "Was verbirgt das Tuch auf dem Spiegel?",
            run: () =>
              says(g, "morwenna", "Was ich gestern gesehen habe, will ich heute nicht wiedersehen. Der Spiegel zeigt nicht, was ist. Er zeigt, was kommt.", "Fass ihn an, wenn du es wagst. Aber heul mir nicht vor."),
          },
          {
            text: "Der Kanzler Malvor. Kennt Ihr ihn?",
            run: async () => {
              g.set("c2_malvor_klatsch", true);
              await says(g, "morwenna", "Malvor. Ein Mann in schwarzem Talar, der aufs Moor starrte, als wollte er es kaufen.", "Er war letzten Winter hier. Wollte Schierling „gegen Ratten“. Ich habe Ratten gesehen, die ihm sehr ähnlich sehen.");
              await hero(g, "Ihr habt ihm Schierling gegeben?");
              await says(g, "morwenna", "Nein. Ich habe ihm Nesseltee gegeben. Und ein Gefühl, ich hätte ihn durchschaut. Jetzt weiß ich es sicher.");
            },
          },
          {
            text: "Was verlangt Ihr für Euren Talisman?",
            show: () => !!g.flag("c2_recipe") && !g.has("hexentalisman") && !g.flag("c2_gegengift"),
            run: () => says(g, "morwenna", "Erst das Gegengift. Dann reden wir. Ich verschenke nichts, bevor ich weiß, ob du es wert bist."),
          },
          {
            text: "Könnte ich ein Gefäß für das Gegengift bekommen?",
            show: () => !!g.flag("c2_kocht") && !g.flag("c2_gegengift") && !g.has("flasche_leer"),
            run: async () => {
              await says(g, "morwenna", "Ohne Flasche? Dann schöpfst du es mit den Händen. Nein. Hier.");
              g.add("flasche_leer");
              await g.say("Sie wirft mir eine staubige Flasche zu. Ich fange sie knapp.");
            },
          },
          {
            text: "Was wisst Ihr über den Drachen im Vulkan?",
            show: () => !!g.flag("c2_gegengift"),
            run: async () => {
              await says(g, "morwenna", "Aschenschlund. Man erzählt, er hütet ein Vermögen aus Gold. Nein. Ich war einmal in meiner Jugend in seinem Rauch.");
              await says(g, "morwenna", "Der Drache hütet kein Gold, Junge. Er hütet ein Ei. Das Gold ist sein Nestpolster.");
              await hero(g, "Ein Ei? Dann ist er kein Ungeheuer. Er ist ein Vater. Oder eine Mutter.");
              await says(g, "morwenna", "Er ist beides, wenn es sein muss. Denk daran, wenn dein Schwert zu laut wird.");
              g.set("c2_dragon_hint", true);
            },
          },
          bye("Geh, bevor die Katze dich verflucht. Und nimm dein Schwert mit. Am besten auch ein bisschen Verstand.", "morwenna", g, "Ich gehe jetzt."),
        ]);
      },
      give: {
        trank_rot: async (g) => {
          g.remove("trank_rot");
          await says(g, "morwenna", "Mein Liebestrank! Der war für Hans, den Köhler. Er hat ihn nie bekommen. Gut, dass du ihn gefunden hast, bevor er sich verliebt.");
          await g.say("Morwenna steckt die Flasche weg. Die Truhe schließt sich von selbst, jemand sollte sich vor ihr in Acht nehmen.");
        },
        silber: async (g) => {
          g.remove("silber");
          await says(g, "morwenna", "Silber für mich? Das ist die erste ehrliche Geste seit Jahren. Aber ich brauche es nicht. Behalte es für deine Zukunft.");
          g.add("silber");
        },
        tote_ratte: "Eine tote Ratte? Danke, aber ich esse zu Mittag keine Nagetiere. Gib sie der Schlange.",
      },
    }),

    // ----- Kessel
    {
      id: "kessel",
      name: "Hexenkessel",
      sprite: (g) => (g.flag("c2_gegengift") ? "kessel_gegengift" : g.flag("c2_kocht") ? "kessel_kocht" : "kessel_kalt"),
      x: 482,
      y: 338,
      scale: 1.35,
      look: (g) =>
        g.say(
          g.flag("c2_gegengift")
            ? "Der Kessel ist leer, nur ein türkiser Rand erinnert an das Gegengift."
            : g.flag("c2_kocht")
              ? "Das Gebräu kocht türkis und ruhig. Es fehlt nur noch ein Gefäß."
              : "Ein dreibeiniger Eisenkessel in der Feuerstelle. Er riecht nach vielen Versuchen und manchen Opfern.",
        ),
      take: "Er wiegt mehr als ein Ochse. Und er gehört einer Hexe.",
      use: async (g) => {
        if (g.flag("c2_gegengift")) return g.say("Er ist leer. Mehr kann ich hier nicht tun.");
        if (g.flag("c2_kocht")) return g.say("Ich brauche eine Flasche, um das Gegengift abzufüllen.");
        const n = Number(g.flag("c2_kn") ?? 0);
        await g.say(n ? `Der Kessel hat schon ${n} Zutat${n > 1 ? "en" : ""} geschluckt. Es geht weiter, wenn ich die nächste habe.` : "Ein leerer Kessel, kalt. Die Zutaten müssten erst hinein, in der richtigen Reihenfolge.");
      },
      useWith: {
        moorwasser: brewRoute("moorwasser"),
        rabenfeder: brewRoute("rabenfeder"),
        alraune: brewRoute("alraune"),
        schlangenzunge: brewRoute("schlangenzunge"),
        fackel: brewRoute("fackel"),
        eimer: "Ein leerer Eimer in den Kessel? Das hilft niemandem. Er muss voller Moorwasser sein.",
        kerzenwachs: "Wachs im Gegengift? Dann sterbe ich an Verstopfung.",
        wurst: async (g) => says(g, "morwenna", "Meine Wurst! Aus meinem Kessel! Nur über meine Leiche!"),
        tote_ratte: "Rattensuppe. Ich habe schon Schlimmeres gerochen, aber nur bei Beerdigungen.",
        pilz: "Der Fliegenpilz würde das Gegengift nicht heilen, sondern lustig machen.",
        fieberkraut: "Fieberkraut im Gegengift? Das ist eine andere Krankheit, Bran.",
        flasche_leer: async (g) => {
          if (g.flag("c2_gegengift")) return g.say("Der Kessel ist leer. Die Flasche kann sich ausruhen.");
          if (!g.flag("c2_kocht")) return g.say("Der Kessel ist noch nicht fertig. Ein leeres Fläschchen in einer kalten Suppe hilft nicht.");
          g.remove("flasche_leer");
          g.sfx("magic");
          await g.pose("use", 700);
          g.add("gegengift");
          g.set("c2_gegengift", true);
          g.flash("#8fffe0", 600);
          await g.say("Ich tauche die Flasche ein. Das Gebräu fließt hinein, leuchtend türkis, warm wie frisches Blut.");
          await says(g, "morwenna", "Sieh an. Du hast es nicht verdorben. Das kommt höchstens bei einem von zehn vor. Und die anderen neun sind gestorben.");
          if (g.flag("taken_hex_silber")) {
            await says(g, "morwenna", "Eine Frage noch: Fehlt mir eigentlich Silber? Ich zähle meine Münzen jeden Abend.");
            const i = await g.choose(["Ja, hier ist Euer Silber zurück.", "Ich weiß nicht, wovon Ihr sprecht."]);
            if (i === 0 && g.has("silber")) {
              g.remove("silber");
              g.honor(2);
              await says(g, "morwenna", "Ehrlichkeit. Der Rabenorden wird einen Narren mehr bekommen. Aber einen guten.");
            } else if (i === 0) {
              await hero(g, "Ich habe es leider schon ausgegeben. Es tut mir leid.");
              g.honor(1);
              await says(g, "morwenna", "Dann schuldest du mir etwas. Ich schreibe es auf. Schulden sind das Einzige, was Ritter nicht überleben.");
            } else {
              g.honor(-1);
              await says(g, "morwenna", "Du lügst schlecht. Aber ich lasse es dir durchgehen. Der Talisman schützt dich nicht vor deinem Gewissen.");
            }
          }
          await says(g, "morwenna", "Nimm. Das hier ist der Talisman. Er hält die Geister des Moores fern, wenn du wieder hinausgehst. Und die Irrlichter sowieso.");
          g.add("hexentalisman");
          await g.say("Ein winziger Rabenschädel an einer Lederschnur. Er ist kalt, aber nicht unfreundlich.");
          await says(g, "morwenna", "Geh jetzt nach Osten. Und Junge: Wenn du es nicht brauchst, trink es nicht selbst.");
          await hero(g, "Ich werde es nicht trinken. Aber danke. Wirklich.");
          await says(g, "morwenna", "Frag mich nach dem Drachen, bevor du gehst. Du wirst es brauchen.");
        },
      },
    },

    // ----- Kommode (3 drawers)
    ...cabinet({
      id: "kommode",
      name: "Kommode",
      sprites: ["kommode_wk_zu", "kommode_wk_oben", "kommode_wk_oben", "kommode_wk_unten"],
      x: 745,
      y: 352,
      scale: 1.05,
      at: { x: 745, y: 372 },
      look: "Eine breite Kommode aus dunklem Holz, gekrönt von Mäuseköttel. Die Schubladen haben Griffe aus Rabenfüßen.",
      drawers: [
        { name: "Obere Schublade", hit: [0.06, 0.08, 0.88, 0.3], contents: ["wurst", "kamm", "haarlocke"], look: "Die oberste Schublade. Der Griff ist ein vertrockneter Rabenfuß. Er zuckt nicht, soweit ich sehe." },
        { name: "Mittlere Schublade", hit: [0.06, 0.4, 0.88, 0.28], contents: ["kerzenwachs", "kerzenstummel", "rattenfalle"], look: "Die mittlere Schublade. Sie klemmt ein wenig, als wollte sie ihre Geheimnisse behalten." },
        { name: "Untere Schublade", hit: [0.06, 0.7, 0.88, 0.26], contents: ["zinnring", "spindel", "pergamentfetzen"], look: "Die unterste Schublade. Staub und Spinnweben haben sie zusammengeklebt." },
      ],
    }),

    // ----- Truhe (locked)
    container({
      id: "truhe",
      name: "Verschlossene Truhe",
      x: 858,
      y: 366,
      sprites: { closed: "kiste_dorf", open: "kiste_dorf_offen" },
      scale: 1.1,
      contents: ["fieberkraut", "trank_rot", "zinnbecher"],
      lock: { key: "eisenschluessel", text: "Mit einem schweren Schloss gesichert. Ohne Schlüssel keine Chance, und mit dem Schwert breche ich lieber keine Hexenkiste auf.", openText: "Der Schlüssel dreht sich, und das Schloss gibt mit einem Seufzer nach." },
      look: "Eine alte Holztruhe mit Eisenbeschlägen. Das Schloss ist größer als mein Gesicht. Kratzspuren am Rand: Die Katze hat es versucht.",
      title: "In der Truhe",
    }),
    groundItem({
      id: "hex_silber",
      item: "silber",
      x: 818,
      y: 404,
      say: "Silber, offen auf dem Boden. Für eine Hexe etwas leichtsinnig. Für mich ein Problem.",
      onTake: (g) => {
        g.honor(-1);
      },
    }),

    // ----- Katze
    npc({
      id: "katze",
      name: "Schwarze Katze",
      x: 628,
      y: 380,
      frames: { idle: "katze_sit", stretch: "katze_stretch" },
      hit: [602, 338, 52, 48],
      look: (g) => g.say(g.flag("c2_katze_gefuettert") ? "Die Katze streckt sich zufrieden. Sie sieht aus, als hätte sie einen Handel gewonnen." : "Eine pechschwarze Katze. Sie sitzt auf etwas Glänzendem und starrt mich an, als hielte sie mich für sehr dumm. Vielleicht hat sie recht."),
      pick: (_n, g) => (g.flag("c2_katze_gefuettert") ? "stretch" : null),
      talk: (g) => g.say(g.flag("c2_katze_gefuettert") ? "Miau. Ich übersetze: „Gern geschehen.“" : "Ich rede mit der Katze. Sie blinzelt langsam. Entweder Verachtung oder Zuneigung. Bei Katzen ist es dasselbe."),
      take: "Ich greife nach ihr. Sie faucht. Die Handnarbe wird mir eine Lehre sein.",
      use: (g) => g.say(g.flag("c2_katze_gefuettert") ? "Sie lässt sich kurz streicheln und dann nie wieder." : "Sie sitzt auf einem Schlüssel, da bin ich fast sicher. Sie wird ihn nicht freiwillig hergeben. Vielleicht gegen etwas Essbares."),
      give: {
        wurst: async (g) => {
          if (g.flag("c2_katze_gefuettert")) return g.say("Sie hat schon genug. Die Katze hat immer genug, wenn man es nicht anbietet.");
          g.remove("wurst");
          g.set("c2_katze_gefuettert", true);
          await g.pose("use", 500);
          await g.say("Die Katze riecht an der Wurst. Dann nimmt sie sie, zieht sie in einen Winkel und verschwindet damit.");
          await g.say("An der Stelle, wo sie saß, liegt ein schwerer Eisenschlüssel.");
          await hero(g, "Ein Handel. Ich habe schon unter Menschen schlechtere erlebt.");
        },
        tote_ratte: "Die Katze betrachtet die tote Ratte. Dann mich. Das ist eine Beleidigung, soweit ich Katzen verstehe.",
        knochen: "Sie gähnt. Knochen sind etwas für Hunde.",
        brot_alt: "Katzen und Brot. Das ist wie Mönche und Alkohol: In der Theorie ablehnend.",
      },
    }),
    groundItem({
      id: "hex_schluessel",
      item: "eisenschluessel",
      x: 615,
      y: 392,
      hidden: (g) => !g.flag("c2_katze_gefuettert"),
      say: "Ein schwerer Eisenschlüssel, noch warm von der Katze. Er passt zur Truhe, schätze ich.",
    }),

    // ----- Käfig mit Rabe
    {
      id: "kaefig",
      name: "Rabenkäfig",
      sprite: "kaefig_rabe",
      x: 575,
      y: 346,
      scale: 1.15,
      look: "Ein Käfig, und darin ein Rabe, der aussieht, als hätte er viele Ratschläge für die Welt, aber niemand fragt ihn.",
      take: "Ich nehme der Hexe nicht ihren Raben. Ich möchte weiterhin einen Kopf haben.",
      use: "Ich öffne den Riegel einen Spalt. „Kraah! Lass das, Totengräber!“ sagt der Rabe. Die Tür fällt wieder zu.",
      talk: async (g) => {
        await says(g, "kaefig", "Kraah! Totengräber! Frischer Totengräber! Erst nass! Dann leicht! Dann tief! Dann böse! Dann heiß! Kraah!");
        await hero(g, "Der Rabe kennt das Rezept. Beeindruckend, und beunruhigend.");
        g.set("c2_rabe_rezept", true);
      },
      give: {
        brot_alt: async (g) => {
          g.remove("brot_alt");
          g.sfx("pickup");
          await g.say("Der Rabe stürzt sich auf das Brot, kaut mit schiefem Kopf und blinzelt mich an.");
          await says(g, "kaefig", "Gut! Gut! Hör zu: Nicht den Kessel füttern, bevor die Rechnung stimmt! Nass, leicht, tief, böse, Feuer! Kraah!");
          g.set("c2_rabe_rezept", true);
        },
        wurst: "Der Rabe starrt auf die Wurst und dann auf die Katze. „Teile nie mit der Katze!“ krächzt er. Eine weise Warnung.",
      },
    },

    // ----- Verhüllter Spiegel
    {
      id: "spiegel",
      name: "Verhüllter Spiegel",
      sprite: "spiegel_verhuellt",
      x: 235,
      y: 346,
      scale: 0.95,
      look: "Ein hoher Spiegel, unter schwarzem Tuch versteckt. An den Rändern schimmert etwas wie Silber und schlechtes Gewissen.",
      take: "Der Spiegel ist festgenagelt, aus gutem Grund.",
      use: async (g) => {
        await g.say("Ich ziehe das Tuch ein Stück zur Seite. Im Glas liegt kein Gesicht, sondern Rauch.");
        if (!g.flag("c2_spiegel")) {
          g.set("c2_spiegel", true);
          g.flash("#ff9a4a", 500);
          await g.say("Im Rauch erscheinen Bilder: ein glühender Berg, ein riesiger Schatten, der etwas Rundes wärmt. Eine schwarze Gestalt nähert sich ihm.");
          await g.say("Die schwarze Gestalt hält ein goldenes Horn. Dann reißt der Rauch.");
          await hero(g, "Ein Drache. Und ein Ei. Und der Kanzler Malvor mit einem Horn, wenn mich nicht alles täuscht.");
        } else {
          await g.say("Der Rauch zeigt noch einmal denselben Berg. Ich ziehe das Tuch wieder zu, bevor er mir mehr verrät, als ich wissen will.");
        }
        await says(g, "morwenna", "Finger weg vom Spiegel! Er verbraucht dich, wenn du zu oft hineinschaust.");
      },
      useWith: { kerzenwachs: "Wachs auf einen Zauberspiegel. Das sollte ich nie gesagt haben." },
    },

    // ----- Besen
    {
      id: "besen",
      name: "Hexenbesen",
      sprite: "besen",
      x: 128,
      y: 350,
      scale: 1.0,
      look: "Ein alter Reisigbesen. Er lehnt an der Wand wie ein Betrunkener an der Kirchentür. Ob er fliegt? Ich frage lieber nicht.",
      take: "Ein Besen nützt mir nichts. Ich fliege nicht. Ich gehe zu Fuß, mit Blasen.",
      use: async (g) => {
        if (g.flag("c2_gefegt")) return g.say("Der Boden ist so sauber, wie er in einem Hexenhaus sein kann. Also nicht.");
        g.set("c2_gefegt", true);
        await g.pose("use", 600);
        await g.say("Ich fege die Ecke neben der Tür. Staub, Spinnweben, ein Mäuseskelett. Und etwas Kleines, Glänzendes.");
        await says(g, "morwenna", "Ich bin immer wieder froh, wenn jemand mein Elend sichtbar macht.");
      },
    },
    groundItem({ id: "hex_knopf", item: "messingknopf", x: 170, y: 398, hidden: (g) => !g.flag("c2_gefegt"), say: "Ein Messingknopf, unter dem Staub verborgen. Von einem Soldatenrock vielleicht. Oder von einem Ritter, der sein Hemd verlor." }),

    // ----- more props
    {
      id: "sessel",
      name: "Alter Sessel",
      sprite: "sessel",
      x: 312,
      y: 352,
      scale: 0.95,
      look: "Ein durchgesessener Lehnstuhl mit einem Kissen aus Rabenfedern. Die Feder da sieht beinahe frisch aus.",
      use: "Ich setze mich kurz. Das Kissen knirscht. Ich stehe wieder auf.",
      take: "Der Sessel ist zu schwer. Außerdem sitzt vermutlich gerade ein Geist darin.",
    },
    container({
      id: "korb",
      name: "Lumpenkorb",
      x: 905,
      y: 352,
      sprites: { closed: "lumpenkorb", open: "lumpenkorb" },
      scale: 1.2,
      contents: ["lappen", "nagel", "spielfigur"],
      look: "Ein Korb voller zerschlissener Lappen. Ein Hexenhaushalt ist auch nur ein Haushalt.",
      title: "Im Korb",
      at: { x: 880, y: 372 },
    }),
    {
      id: "strohlager",
      name: "Strohlager",
      sprite: "strohlager",
      x: 690,
      y: 394,
      scale: 1.1,
      look: "Ein Lager aus Stroh. Wer dort schläft? Die Katze, nehme ich an. Morwenna schläft wohl im Stehen.",
      use: "Ich lasse mich nicht aufs Hexenstroh nieder. Man weiß nie, was darin wohnt.",
    },
    spot({
      id: "regal_l",
      name: "Linkes Regal",
      hit: [175, 85, 175, 225],
      at: { x: 262, y: 345 },
      look: "Ein Regal voller Gläser: Augen, Zungen, Finger. Der Inhalt scheint nicht zu verderben, was mich beunruhigt.",
      take: "Ein Glas voll Augen. Nein, danke. Die starren mich schon an.",
      use: async (g) => {
        if (g.flag("c2_regal_l")) return g.say("Ich habe schon gesucht. Mehr gibt das Regal nicht her.");
        await g.say("Ich schiebe ein paar Gläser zur Seite. Hinter ihnen steht eine leere Flasche, nur ein wenig staubig.");
        g.set("c2_regal_l", true);
        if (!g.flag("taken_hex_flasche") && !g.has("flasche_leer")) {
          g.add("flasche_leer");
          g.set("taken_hex_flasche", true);
          await g.say("Sie ist leer und sauber. Eine Flasche, die auf etwas wartet. Ich nehme sie mit.");
        }
      },
    }),
    spot({
      id: "regal_r",
      name: "Rechtes Regal",
      hit: [645, 85, 135, 225],
      at: { x: 640, y: 345 },
      look: "Noch mehr Gläser, Knochen und ein Totenschädel mit Brille. Die Brille ist neu. Das Schlimmste daran.",
      use: "Ich suche zwischen Wurzeln und Knochen. Alles beschriftet, in einer Schrift, die ich nicht lesen kann, aus Prinzip.",
    }),
    spot({
      id: "kamin",
      name: "Feuerstelle",
      hit: [360, 120, 250, 190],
      at: { x: 482, y: 372 },
      look: "Ein gewaltiger Steinkamin. Der Kessel steht mitten in der Asche. Das Feuer ist kaum mehr als eine Erinnerung.",
      use: "Ich stochere in der Asche. Warm. Das Feuer ist aus, aber nicht tot.",
      useWith: { fackel: "Ich könnte den Kamin anzünden, aber Morwenna hat ihn dafür sicher aufgespart." },
    }),
    spot({
      id: "schaedel_tuer",
      name: "Schädel über der Tür",
      hit: [55, 70, 40, 55],
      at: { x: 120, y: 372 },
      look: "Ein Tierschädel über dem Türsturz. Er schützt vor bösem Besuch. Ich bin der Beweis, dass es nicht funktioniert.",
    }),
    spot({
      id: "hirsch",
      name: "Geweih über dem Kamin",
      hit: [440, 30, 110, 75],
      at: { x: 480, y: 372 },
      look: "Ein Hirschschädel mit gewaltigem Geweih. Er sieht aus, als würde er jeden Satz beurteilen.",
    }),
    spot({
      id: "kraeuter",
      name: "Kräuterbündel",
      hit: [360, 0, 240, 90],
      at: { x: 480, y: 372 },
      look: "Getrocknete Kräuter und Wurzeln hängen von den Balken. Vieles davon weiß ich zu nennen, vieles zu meiden.",
      take: "Ich reiße nichts ab. Ich möchte nicht, dass meine Haut anschwillt, weil ich das falsche Kraut erwische.",
    }),
    spot({
      id: "fenster",
      name: "Rundes Fenster",
      hit: [855, 100, 90, 95],
      at: { x: 860, y: 372 },
      look: "Ein rundes Fenster. Dahinter hängt ein grüner Mond. Oder eine sehr große Laterne. Das Moor macht keine Unterschiede.",
    }),
    spot({
      id: "laterne_wand",
      name: "Wandlaterne",
      hit: [88, 125, 38, 80],
      at: { x: 130, y: 372 },
      look: "Eine kleine Laterne an der Wand. Ihr Licht ist warm und gelb, die einzige freundliche Farbe im Haus.",
    }),
    groundItem({ id: "hex_pilz", item: "pilz", x: 440, y: 412, say: "Ein Fliegenpilz, der mitten im Zimmer wächst. Eine Hexe ist eben Hausherrin der Natur." }),
    groundItem({ id: "hex_nagel", item: "nagel", x: 840, y: 420, look: "Ein rostiger Nagel am Boden. Er wartet auf einen Zeh, der ihn zu schätzen weiß." }),
    // hidden contents of the lower shelf
    hiddenBox({
      id: "regal_kiste",
      name: "Ritze unter dem Regal",
      hit: [175, 300, 175, 20],
      at: { x: 262, y: 345 },
      contents: ["tonscherbe", "glasauge"],
      look: "Zwischen Regal und Boden klafft eine Ritze. Etwas Kleines liegt darin.",
      title: "In der Ritze",
    }),
  ],
};

export const scenes: SceneDef[] = [moorpfad, hexenhuette];

export const start = {
  scene: "moorpfad",
  x: 80,
  y: 395,
  facing: 1 as const,
  inv: ["schwert", "siegelbrief", "halvard_brief", "fackel", "eimer"] as string[],
  flags: { chapter: 2 },
  intro: async (g: G) => {
    await g.card("Kapitel 2", "Das Hexenmoor");
    await hero(g, "Das Moor von Grauwacht. Wer es kennt, nennt es einen Ort zum Sterben. Wer es nicht kennt, hält es für Nebel.");
    await hero(g, "Halvard sagte: Der König siecht, und das Gift heißt Schierling. Nur eine Hexe kennt die Antwort.");
  },
};

export const hint = (g: G): string => {
  if (g.has("gegengift") && g.has("hexentalisman")) return "Du hast Gegengift und Talisman. Verlasse das Moor nach Osten, Richtung Grauwacht.";
  if (!g.flag("c2_lamps_done")) {
    if (!g.flag("c2_poem")) return "Die Irrlichter blockieren den Steg. Das Totem am Anfang verrät vielleicht, wie man sie vertreibt.";
    return "Entzünde die drei Moorlaternen mit deiner Fackel: erst der Mond, dann das Hexenhaus, zuletzt die Heimat.";
  }
  if (!g.flag("c2_met_morwenna")) return "Geh zur Hexenhütte am Ende des Stegs und sprich mit Morwenna.";
  if (!g.flag("c2_recipe")) return "Frag Morwenna nach einem Gegengift gegen Schierling.";
  if (g.flag("c2_gegengift") && !g.has("hexentalisman")) return "Sprich mit Morwenna über den Talisman.";
  if (g.flag("c2_kocht")) return "Füll das Gebräu mit einer leeren Flasche in das Gegengift ab.";
  const missing: string[] = [];
  const have = (i: string) => g.has(i) || g.flag(`c2_in_${i}`);
  if (!have("moorwasser")) missing.push(g.has("eimer") ? "Moorwasser (Eimer im Tümpel)" : "Moorwasser");
  if (!have("rabenfeder")) missing.push("eine Rabenfeder (beim Totem)");
  if (!have("alraune")) missing.push(g.has("kerzenwachs") || g.flag("c2_ohren") ? "die Alraune (jetzt mit Wachs in den Ohren)" : "die Alraune (erst Kerzenwachs aus der Kommode)");
  if (!have("schlangenzunge")) missing.push(g.flag("c2_schlange_ab") ? "die Schlangenzunge" : "die Schlangenzunge (Schlange erst mit etwas Totem ablenken)");
  if (missing.length) return "Dir fehlen noch: " + missing.join(", ") + ".";
  return "Gib die Zutaten in den Kessel: erst das Nasse, dann das Leichte, das Tiefe, das Böse, zuletzt das Feuer.";
};

export default { scenes, start, hint } satisfies ChapterModule;
