import { bye, container, edgeExit, EDGE, groundItem, hero, npc, once, says, talk } from "../dsl";
import type { ChapterModule, G, Pt, SceneDef, Thing } from "../types";
import { spot, hiddenBox } from "./ch2_util";
import { GEO } from "./geometry";

/* =========================================================================
 * KAPITEL 4 — Der Vulkan
 *   vulkanpfad     Ascheweg, Lavastrom (state-dependent walk polygon), Skelett, Felsbrocken, Dampfspalte
 *   drachenhoehle  Aschenschlund, Malvor + Horn, Ei auf dem Altar, Hort, das Finale
 *
 * Flags (c4_*): c4_lava_cool, c4_fels, c4_diary, c4_met_malvor, c4_bribed, c4_fire (Feueratem gespiegelt,
 * Drache wach & frei), c4_ei_weg (Ei vom Altar genommen), c4_ei_zurueck, c4_horn_taken, c4_horn_gone,
 * c4_malvor_tied, c4_resolved.
 * ========================================================================= */

const V = GEO.vulkanpfad;
/** Left of the lava stream while it still flows. */
const LEFT_ONLY: Pt[] = [
  { x: 28, y: 326 },
  { x: 500, y: 326 },
  { x: 500, y: 432 },
  { x: 28, y: 432 },
];

/* ============================================================ vulkanpfad */
async function coolLava(g: G, item: "weihwasser" | "eimer_wasser") {
  if (g.flag("c4_lava_cool")) return g.say("Der Strom ist schon zu Stein erstarrt.");
  g.remove(item);
  if (item === "eimer_wasser") g.add("eimer");
  g.sfx("splash");
  await g.pose("use", 600);
  g.flash("#ffffff", 450);
  g.shake(600);
  await g.say(item === "weihwasser" ? "Das Weihwasser trifft die Lava mit einem Zischen, das fast wie ein Gebet klingt." : "Ich kippe den Eimer aus. Eine Dampfwolke schießt in den Himmel, das Wasser schreit auf.");
  await g.say("Wo eben noch Glut floss, liegt jetzt dunkler, glasiger Stein. Er knackt, aber er hält.");
  g.set("c4_lava_cool", true);
  await hero(g, "Ein Weg. Der Berg hat mich sicher nicht eingeladen. Aber er hat die Tür offen gelassen.");
}

const lavaWrong = (txt: string) => txt;

const DIARY = [
  "Ein Ritterskelett, noch in verkohlter Rüstung. Neben ihm liegt ein Ledertagebuch, die Seiten vom Ruß gebräunt.",
  "„Tag 3. Der Lavastrom versperrt den Pfad. Wasser kühlt ihn. Hinter den Felsen kondensiert Dampf an kaltem Metall. Ein Eimer genügt.“",
  "„Tag 6. Der Drache schläft. Er bewacht kein Gold. Ich sah ein Ei auf einem Altar. Es glühte. Es lebt.“",
  "„Tag 7. Ein Mann in Schwarz bläst auf einem Horn. Der Drache erwacht und folgt ihm. Mein Schild war aus Stahl. Zu stumpf. Nur ein Spiegel hält den Atem.“",
  "„Richte den Strahl auf den, der das Horn hält. Der Drache folgt dem Horn, nicht dem Herzen. Nicht vergessen: das Ei. Wer das Ei hat, hat den Drachen.“",
];

const vulkanpfad: SceneDef = {
  id: "vulkanpfad",
  title: "Ascheweg am Kharn",
  bg: "vulkanpfad",
  walk: (g) => (g.flag("c4_lava_cool") ? V.walk : LEFT_ONLY),
  scale: V.scale,
  ambient: "volcano",
  fx: [
    { kind: "ash", n: 1.2 },
    { kind: "embers", area: [0, 150, 960, 250], n: 0.8 },
  ],
  things: [
    {
      id: "to_burg",
      name: "Zurück nach Grauwacht",
      sprite: null,
      x: 43,
      y: 424,
      hit: EDGE.left,
      at: { x: 38, y: 400 },
      primary: "walk",
      look: "Weit hinter dem Aschefeld liegt Grauwacht. Ein König wartet. Und ein Kanzler flieht.",
      walk: async (g) => {
        await hero(g, "Zurück? Nicht, solange Malvor mit dem Ei in diesem Berg ist.");
      },
    },
    edgeExit("right", {
      id: "to_hoehle",
      name: "Zur Drachenhöhle",
      to: "drachenhoehle",
      x: 80,
      y: 400,
      facing: 1,
      look: "Der Pfad führt zum Maul des Berges.",
      guard: (g) => (g.flag("c4_lava_cool") ? null : "Der Lavastrom versperrt den Weg. Hinüberspringen wäre mein letzter Sprung."),
    }),

    // ----- the lava stream
    {
      id: "lavastrom",
      name: "Lavastrom",
      sprite: (g) => (g.flag("c4_lava_cool") ? "lavastrom_erstarrt" : "lavastrom"),
      x: 548,
      y: 392,
      scale: 1.65,
      hit: [514, 220, 72, 180],
      at: { x: 480, y: 392 },
      look: (g) => g.say(g.flag("c4_lava_cool") ? "Erstarrte Lava, schwarz und glasig. Darunter glimmt es noch leise." : "Ein Strom aus flüssigem Feuer quert den Pfad. Die Hitze drückt mich zurück. Mit Wasser könnte man ihn bändigen."),
      take: "Die Lava nehmen? Meine Hände sind keine Zangen.",
      use: (g) => g.say(g.flag("c4_lava_cool") ? "Ich trete vorsichtig auf den Stein. Er hält." : "Ich strecke die Hand aus. Meine Augenbrauen flüchten. Ich auch."),
      useWith: {
        weihwasser: (g) => coolLava(g, "weihwasser"),
        eimer_wasser: (g) => coolLava(g, "eimer_wasser"),
        eimer: "Ein leerer Eimer vor einem Lavastrom. Mehr Verzweiflung geht nicht.",
        seil: lavaWrong("Ich werfe das Seilende hinein. Es fängt Feuer, bevor es die Lava berührt. Ich ziehe es schnell zurück."),
        fackel: "Eine Fackel an einem Lavastrom. Das ist, als würde man einem Bären die Zähne zeigen.",
        schwert: "Mein Schwert in der Lava härten? Das Eisen würde eher tanzen.",
        spiegelschild: "Der Spiegelschild zeigt mir einen Jungen vor einem Meer aus Feuer. Er sieht nervös aus.",
        flasche_leer: "Ein bisschen flüssiges Feuer in die Flasche füllen? Ich verzichte.",
      },
    },

    // ----- steam vent
    {
      id: "dampf",
      name: "Dampfspalte",
      sprite: "dampfschlot",
      x: 345,
      y: 384,
      scale: 1.7,
      look: "Ein Riss im Fels, aus dem heißer Dampf zischt. Ringsum perlt Wasser an kaltem Gestein.",
      take: "Dampf lässt sich nicht einpacken.",
      use: "Ich halte die Hand über die Spalte. Sie wärmt schön. Ich ziehe sie zurück, bevor sie kocht.",
      useWith: {
        eimer: async (g) => {
          g.sfx("splash");
          await g.pose("use", 800);
          g.remove("eimer");
          g.add("eimer_wasser");
          await g.say("Ich halte den kalten Eimer über den Dampf. Tropfen sammeln sich, einer nach dem anderen, bis der Eimer voll ist.");
          await hero(g, "Wasser aus Dampf. Selbst in der Hölle gibt es Haushaltstricks.");
        },
        eimer_wasser: "Der Eimer ist schon voll. Eine Dampfspalte macht keinen Nachschlag.",
        flasche_leer: "Eine Flasche voll Dampf? Ich sehe, wie es endet: mit einem Knall.",
      },
    },

    // ----- knight's skeleton with the diary and a pack
    {
      id: "ritterskelett",
      name: "Ritterskelett",
      sprite: "ritterskelett",
      x: 160,
      y: 390,
      scale: 1.15,
      look: async (g) => {
        g.set("c4_diary", true);
        for (const l of DIARY) await g.say(l);
        await hero(g, "Spiegel gegen Feuer. Das Ei nicht vergessen. Danke, alter Freund.");
      },
      take: "Ich lasse die Gebeine in Ruhe. Ich bin Totengräber, ich weiß, wie sensibel Tote sind.",
      use: async (g) => {
        if (!g.flag("c4_pack")) {
          g.set("c4_pack", true);
          await g.pose("use", 500);
          await g.say("Ich hebe vorsichtig seinen verkohlten Rucksack an. Ein Eimer, ein paar Kleinigkeiten, ein Gebet in Fetzen.");
        }
        if (!g.panelLeft("ritterskelett", ["eimer", "rosenkranz", "messingknopf"]).length) return g.say("Nichts mehr. Der Ritter hatte nicht viel, und ich nehme ihm nicht den Rest.");
        await g.openPanel("Im Rucksack", "ritterskelett", ["eimer", "rosenkranz", "messingknopf"]);
      },
      useWith: { seil: "Das Skelett an einem Seil ziehen? Ich bin nicht stolz auf diesen Gedanken." },
      give: { weihwasser: "Ich segne die Gebeine mit einem Tropfen Weihwasser. Der Ritter wirkt zufriedener, soweit man das bei einem Skelett sagen kann." },
    },
    groundItem({ id: "vp_zahn", item: "zahn", x: 220, y: 408, look: "Ein einzelner Zahn auf dem Aschepfad. Von einem Ritter, einem Wolf oder dem Berg selbst." }),

    // ----- boulder: pull away with the rope
    {
      id: "felsbrocken",
      name: "Felsbrocken",
      sprite: "felsbrocken",
      x: 262,
      y: 392,
      scale: 0.85,
      hidden: (g) => !!g.flag("c4_fels"),
      look: "Ein mannshoher Felsbrocken. Dahinter, im Schatten, glimmt ein dunkler Spalt. Allein bewege ich ihn nicht.",
      take: "Er wiegt mehr als eine Kuh. Und ich hatte ohnehin nie Rückenschmerzen.",
      use: "Ich stemme mich gegen den Fels. Er bewegt sich um den Bruchteil einer Zwiebel. Mit Hebelwirkung ginge es besser.",
      useWith: {
        seil: async (g) => {
          g.sfx("clank");
          await g.pose("use", 700);
          await g.say("Ich lege das Seil um den Brocken, verkeile mich gegen die Felswand und ziehe mit allem, was ein Totengräber an Kreuz hat.");
          g.shake(600);
          g.sfx("creak");
          g.set("c4_fels", true);
          await g.say("Der Fels löst sich, rollt polternd beiseite und bleibt in einer Aschewolke liegen. Dahinter öffnet sich eine kleine Nische.");
        },
        schwert: "Mein Schwert als Hebel? Es würde brechen. Und dann hätte Roderic recht über mich.",
      },
    },
    hiddenBox({
      id: "fels_nische",
      name: "Felsnische",
      hit: [225, 330, 90, 60],
      at: { x: 270, y: 395 },
      hidden: (g) => !g.flag("c4_fels"),
      contents: ["flasche_leer", "kreuzanhaenger", "spielfigur"],
      look: "Eine kleine Nische im Fels. Jemand hat hier etwas verstecken wollen. Vermutlich ein Pilger auf der Flucht.",
      title: "In der Nische",
    }),

    // ----- scenery & props
    {
      id: "schwefel",
      name: "Schwefelkruste",
      sprite: "steinhaufen",
      x: 420,
      y: 402,
      scale: 1.2,
      look: "Gelbe Kristalle, die nach faulen Eiern riechen. Der Berg schwitzt hier Schwefel aus. Man nennt es Höllenatem und lacht dabei nicht.",
      take: "Der Schwefel klebt an den Fingern und stinkt. Ein Mitbringsel, das niemand will.",
      use: "Ich kratze etwas Schwefel ab. Mein Taschentuch ist nun gelb. Es riecht wie ein Streit.",
      useWith: { fackel: "Ich halte die Fackel an den Schwefel. Eine blaue Flamme tanzt, ich huste fürchterlich. Erkenntnis: Nicht noch einmal." },
    },
    {
      id: "obsidian",
      name: "Obsidian",
      sprite: "obsidian",
      x: 585,
      y: 420,
      scale: 0.9,
      hidden: (g) => !g.flag("c4_lava_cool"),
      look: "Schwarzes Vulkanglas, scharf wie ein Rasiermesser. Die Lava hat es hier geschmiedet.",
      take: "Ich schneide mir fast den Daumen ab. Obsidian lässt sich nicht freiwillig tragen.",
      useWith: { schwert: "Ich klopfe mit dem Schwert auf den Obsidian. Er klingt wie Glas, das sich für Stahl hält." },
    },
    {
      id: "knochenpfahl",
      name: "Warnpfahl",
      sprite: "knochenpfahl",
      x: 700,
      y: 372,
      hidden: (g) => !g.flag("c4_lava_cool"),
      look: "Ein Pfahl, behängt mit Schädeln und Fetzen. Auf einem Brett steht in Kohle: „Wer weitergeht, stirbt. Gezeichnet: alle, die weitergegangen sind.“",
      take: "Ich ziehe den Pfahl nicht aus dem Boden. Er ist wohl das Einzige, was hier freiwillig steht.",
    },
    container({
      id: "vp_tierskelett",
      name: "Verkohlter Kadaver",
      x: 790,
      y: 410,
      sprites: { closed: "tierskelett", open: "tierskelett" },
      scale: 0.9,
      hidden: (g) => !g.flag("c4_lava_cool"),
      contents: ["knochen", "tonscherbe"],
      look: "Das Skelett eines Maultiers. Es trug einst ein Ritter. Zumindest bis zum Atem des Berges.",
      title: "Zwischen den Knochen",
    }),
    spot({
      id: "vulkan",
      name: "Vulkan Kharn",
      hit: [330, 20, 280, 220],
      at: { x: 480, y: 360 },
      look: "Der Kharn spuckt Rauch und Funken. Seine Hänge glühen wie ein offenes Herz. Wenn ein Berg schlafen kann, dann schläft dieser unruhig.",
    }),
    spot({
      id: "drachenmaul",
      name: "Höhlenöffnung",
      hit: [800, 15, 150, 150],
      at: { x: 840, y: 380 },
      look: "Hoch in der Felswand klafft eine Öffnung mit steinernen Zähnen. Wer da hineingeht, wird gefressen. Oder berühmt. Das schließt einander nicht aus.",
    }),
    spot({
      id: "toter_baum",
      name: "Verbrannter Baum",
      hit: [110, 80, 170, 200],
      at: { x: 190, y: 380 },
      look: "Ein verkohlter Baum, die Äste wie ein Gebet in den Himmel gestreckt. Das Gebet blieb unbeantwortet.",
      take: "Ein Ast zerfällt zu Asche, sobald ich ihn berühre. Das Leben im Allgemeinen.",
    }),
    spot({
      id: "lavafelder",
      name: "Lavafelder",
      hit: [250, 195, 220, 100],
      at: { x: 400, y: 380 },
      look: "Weit unten ziehen sich Lavaflüsse durchs Tal, wie die Adern des Berges. Kein Platz für Wanderer.",
    }),
    spot({
      id: "skelett_rechts",
      name: "Ferne Gebeine",
      hit: [880, 235, 60, 60],
      at: { x: 840, y: 380 },
      hidden: (g) => !g.flag("c4_lava_cool"),
      look: "Noch ein Ritter, noch ein Schild, noch eine Lehre. Der Berg sammelt sie.",
    }),
  ],
};

/* ============================================================ drachenhoehle */
const honor = (g: G) => Number(g.flag("honor") ?? 0);
const hornAvailableToMalvor = (g: G) => !g.flag("c4_horn_taken") && !g.flag("c4_horn_gone");

async function failFire(g: G, why: string) {
  g.sfx("roar");
  g.shake(900);
  g.flash("#ff7a2a", 900);
  await g.say(why);
  g.set("c4_tries", (Number(g.flag("c4_tries") ?? 0) as number) + 1);
  g.frame("drache", "idle");
  g.set("c4_wach", false);
  await says(g, "malvor", "Hah! Der Drache braucht Schlaf, nicht Beschäftigung. Mach dich fort, bevor ich es mir anders überlege.");
  await g.walk(100, 400);
  await hero(g, "Das war nicht klug. Der Atem hat mir die Brauen genommen und den Stolz gleich mit. Ich brauche etwas, das Feuer zurückwirft.");
}

async function confront(g: G) {
  const retry = Number(g.flag("c4_tries") ?? 0) > 0;
  if (!retry) {
    await says(g, "malvor", "Genug geredet. Ich habe die Macht, du hast ein Schwert. Siehst du den Unterschied?");
  } else {
    await says(g, "malvor", "Du schon wieder. Gut. Eine Lektion, die nicht bleibt, ist keine.");
  }
  g.sfx("bell");
  g.frame("malvor", "cast");
  await g.say("Malvor setzt das Horn an. Ein tiefer Ton, fast ein Brüllen, rollt durch die Höhle. Die Lava schlägt Blasen.");
  g.shake(800);
  g.flash("#ffb050", 500);
  g.set("c4_wach", true);
  g.frame("drache", "roar");
  g.sfx("roar");
  await g.wait(600);
  await g.say("Aschenschlund erhebt sich aus seiner Asche. Seine Augen glühen wie zwei Schmelzöfen. Das Horn spricht zu ihm, und er gehorcht.");
  g.frame("malvor", "idle");
  g.frame("drache", "idle");
  await says(g, "malvor", "Verbrenne ihn!");
  await g.say("Der Drache holt Luft. Die Höhle wird heiß, die Luft flimmert, dann öffnet er das Maul.");
  const opts = ["Den Spiegelschild heben", "Hinter den Altar werfen", "Das Schwert ziehen und angreifen"];
  const i = await g.choose(opts);
  if (i === 0 && g.has("spiegelschild")) {
    g.sfx("magic");
    await g.say("Ich reiße den Spiegelschild hoch. Der Feuerstrahl prallt auf das blanke Metall, bricht sich und schießt zurück.");
    g.flash("#ffffff", 700);
    g.shake(900);
    g.sfx("fire");
    await says(g, "malvor", "Nein! Nicht auf mich! Du Bestie, nicht auf mich!");
    await g.say("Das Feuer fegt über Malvors Talar. Er schreit, das Horn springt ihm aus der Hand und klirrt über den Boden.");
    g.set("c4_fire", true);
    g.frame("malvor", "idle");
    g.moveNpc("malvor", 540, 392, 600);
    await g.say("Ohne den Ton des Horns zögert der Drache. Er senkt den Kopf, schnuppert, sieht Malvor an. Dann mich.");
    await hero(g, "Der Bann ist gebrochen. Aber ob er mich als Freund oder als Frühstück ansieht, weiß ich nicht.");
    return;
  }
  if (i === 0) return failFire(g, "Ich greife nach dem Spiegelschild und finde nur leere Luft. Der Atem trifft mich mit voller Wucht.");
  if (i === 1) return failFire(g, "Ich werfe mich hinter den Altar. Der Stein glüht rot, schmilzt und verbrennt mir die Sohlen. Das war keine Deckung, das war ein Backofen.");
  return failFire(g, "Ich ziehe das Schwert und renne los. Der Feuerstrahl trifft die Klinge, die Hitze reißt sie mir fast aus der Hand. Ich stürze rückwärts.");
}

/** Return the egg: the Gnade ending. */
async function endGnade(g: G) {
  g.remove("drachenei");
  g.set("c4_ei_zurueck", true);
  g.set("c4_resolved", true);
  g.honor(1);
  g.sfx("magic");
  await g.say("Ich trete vor den Drachen und halte ihm das Ei hin. Es glüht warm in meinen Händen, als schlüge ein winziges Herz.");
  await hero(g, "Es gehört dir. Es hat dir immer gehört. Er hat es nur gestohlen.");
  g.frame("drache", "idle");
  g.flash("#ffd890", 700);
  await g.say("Der Drache senkt den gewaltigen Kopf, sehr langsam, fast zärtlich. Ich lege das Ei auf den Altar zurück. Er atmet warm darüber.");
  await says(g, "drache", "Ein Mensch. Einer, der gibt, statt zu nehmen. Das ist selten. Ich werde mich daran erinnern.");
  // Malvor's fate
  if (g.flag("c4_malvor_tied")) {
    await g.say("Malvor liegt gefesselt am Boden, die Augen weit. Der Drache beachtet ihn nicht. Er hat Wichtigeres im Arm.");
    g.honor(1);
  } else if (hornAvailableToMalvor(g)) {
    await g.say("Malvor kriecht zum Horn, packt es, setzt es an die Lippen, und bläst. Ein hässlicher, dünner Ton, ohne Macht.");
    await says(g, "malvor", "Gehorche! Gehorche mir, du Wurm!");
    await g.say("Der Drache dreht langsam den Kopf. Ein Schnappen, ein Schlucken, ein kurzer Schrei. Die Höhle ist wieder still.");
    await hero(g, "Er hat das Horn mit dem Falschen verwechselt. Das passiert Leuten, die nie fragen, wem etwas gehört.");
  } else {
    await g.say("Malvor stolpert Richtung Ausgang, die Hände verbrannt, den Talar zerfetzt. Ohne das Horn ist er nur ein Mann in schwarzen Lumpen.");
  }
  await epilogue(g, "gnade");
}

/** Kill the dragon: the Rache ending. */
async function endRache(g: G) {
  g.set("c4_resolved", true);
  g.honor(-2);
  g.sfx("clank");
  await g.say("Ich ziehe das Schwert. Der Drache sieht mich an, ohne zu fliehen. Er weiß, was jetzt kommt, und er ist müde.");
  const i = await g.choose(["Zustoßen.", "Das Schwert sinken lassen."]);
  if (i === 1) {
    g.set("c4_resolved", false);
    g.honor(2);
    await hero(g, "Nein. Nicht so. Nicht vor einem Ei.");
    return;
  }
  g.frame("drache", "roar");
  g.sfx("roar");
  g.shake(1200);
  g.flash("#ff4400", 800);
  await g.say("Ich stoße zu, genau dorthin, wo der Panzer die Lücke hat. Aschenschlund brüllt, einmal, so laut, dass die Lavafälle verstummen.");
  g.set("c4_dead", true);
  g.frame("drache", "idle");
  await g.say("Dann sackt er zusammen, still, in die Asche seines eigenen Nestes. Der Berg hält den Atem an.");
  if (g.has("drachenei")) await g.say("Das Ei in meinem Rucksack wird langsam kalt. Ich versuche, nicht daran zu denken.");
  else await g.say("Auf dem Altar liegt das Ei und wird langsam kalt. Ich sehe nicht hin.");
  if (g.flag("c4_malvor_tied")) g.honor(1);
  await epilogue(g, "rache");
}

async function epilogue(g: G, kind: "gnade" | "rache") {
  const h = honor(g);
  const tied = !!g.flag("c4_malvor_tied");
  const horn = g.has("horn") ? "gehalten" : g.flag("c4_horn_gone") ? "gone" : "left";
  g.set("c4_end", kind);
  await g.fade(1, 600);
  await g.card("Epilog", kind === "gnade" ? "Das Nest" : "Der Preis");
  const malvorTxt = tied
    ? "Malvor wurde gefesselt vor den König geführt. Das Gericht war kurz. Die Rechtschaffenen nannten es Gerechtigkeit, die anderen Erleichterung."
    : kind === "gnade" && hornAvailableToMalvor(g) && !tied
      ? "Malvor blieb im Berg. Das Horn fand man nie wieder."
      : "Malvor entkam in die Aschewüste. Wer ihn dort fand, sprach nie darüber.";
  const hornTxt = horn === "gone" ? "Das Horn ist zu Schlacke geworden. Kein Mensch befiehlt je wieder einen Drachen." : horn === "gehalten" ? "Das Horn liegt in Roderics Schatzkammer, hinter drei Schlössern. Du hoffst, es bleibt ein Souvenir." : "";
  let title: string;
  let text: string;
  if (kind === "gnade") {
    await g.card("Epilog", "Der König erwacht");
    if (h >= 0) {
      title = "Der wahre Ritter";
      text =
        "Der König trank das Gegengift und stand drei Tage später wieder auf. Ser Roderic schlug Bran vor dem versammelten Orden zum Ritter des Raben, und die Klinge war leicht wie eine Feder auf seiner Schulter.\n\n" +
        "„Der Drache hätte Euch verbrennen können“, sagte der König. „Und Ihr gabt ihm sein Kind zurück.“ „Es gehörte nicht mir“, sagte Bran. „Das ist der ganze Eid.“\n\n" +
        malvorTxt + (hornTxt ? " " + hornTxt : "") +
        "\n\nIn den Ascheländern wohnt seither ein Drache, der niemanden mehr frisst, solange man höflich bleibt. Und in Aschenfurt hängt, über der Tür des Totengräbers, ein Schild: „Ritter Bran. Bitte klopfen.“";
    } else {
      title = "Ritter mit Schatten";
      text =
        "Der König genas, der Drache blieb friedlich, und Bran wurde Ritter des Raben. Doch auf seinem Weg hatte er zu oft genommen, was ihm nicht gehörte, und der Orden vergaß es nicht.\n\n" +
        malvorTxt + (hornTxt ? " " + hornTxt : "") +
        "\n\nEr trug den Mantel mit Würde, aber nicht mit Frieden. Der Drache hat ihm vergeben. Die Menschen haben es nicht getan. Vielleicht lernt er, damit zu leben. Manche Gnade ist genau das.";
    }
  } else {
    await g.card("Epilog", "Das Schweigen im Berg");
    if (h >= 0) {
      title = "Der Drachentöter";
      text =
        "Bran kehrte nach Grauwacht zurück, mit dem Zahn des Drachen am Gürtel und Ruß auf dem Gesicht. Der König genas, Roderic schlug ihn zum Ritter, und das Volk jubelte vor dem Tor.\n\n" +
        malvorTxt + (hornTxt ? " " + hornTxt : "") +
        "\n\nIn der Nacht danach hörte Bran das Schweigen im Berg. Das Ei in seinem Rucksack ist kalt. Er hat es nie mehr ausgepackt.\n\nEin Ritter ist, wer Mut hat. Ein wahrer Ritter ist, wer weiß, wann er ihn nicht braucht.";
    } else {
      title = "Rache ohne Ehre";
      text =
        "Der Drache war tot, der König gerettet, und Bran stand mit blutiger Klinge vor einem Orden, der wusste, wie er dorthin gekommen war. Roderic schlug ihn zum Ritter. Er tat es mit abgewandtem Gesicht.\n\n" +
        malvorTxt + (hornTxt ? " " + hornTxt : "") +
        "\n\nIn den Ascheländern ist es still. Kein Drache, kein Ei, keine Antwort. Nur ein Junge, der Ritter wurde, und die Frage, ob er es verdient hat.";
    }
  }
  await g.card("Rabenschwur", "Ende");
  g.end(title, text);
}

const drachenPick = (n: { frame: string; facing: 1 | -1 }, g: G) => {
  n.facing = g.flag("c4_wach") && !g.flag("c4_dead") ? -1 : 1;
  return g.flag("c4_dead") ? "idle" : n.frame !== "idle" ? null : g.flag("c4_wach") ? "wach" : null;
};

const drachenhoehle: SceneDef = {
  id: "drachenhoehle",
  title: "Höhle des Aschenschlund",
  bg: "drachenhoehle",
  walk: GEO.drachenhoehle.walk,
  scale: GEO.drachenhoehle.scale,
  ambient: "volcano",
  fx: [
    { kind: "embers", n: 1.2 },
    { kind: "smoke", area: [300, 150, 300, 200], n: 0.5 },
  ],
  enter: async (g) => {
    await once(g, "c4_hoehle_intro", async () => {
      await g.say("Die Höhle atmet. Heiße Luft strömt mir entgegen, und weit hinten, auf dem Knochenring, hebt und senkt sich ein Berg aus Schuppen.");
      await hero(g, "Aschenschlund. Er schläft. Und Malvor steht keine zehn Schritte neben ihm.");
    });
  },
  things: [
    edgeExit("left", {
      id: "to_pfad",
      name: "Zurück zum Ascheweg",
      to: "vulkanpfad",
      x: 880,
      y: 400,
      facing: -1,
      look: "Der Weg zurück. Der Ausgang ist weit, und Malvor wird mich beobachten.",
      guard: (g) => (g.flag("c4_wach") && !g.flag("c4_resolved") ? "Ich kehre keinem wachen Drachen den Rücken zu." : null),
    }),

    // ----- dragon
    npc({
      id: "drache",
      name: "Aschenschlund",
      x: 790,
      y: 356,
      scale: 0.7,
      frames: { idle: "drache_sleep", wach: "drache_wach", roar: "drache_roar" },
      pick: drachenPick,
      hit: [700, 215, 180, 140],
      at: { x: 706, y: 372 },
      look: (g) =>
        g.say(
          g.flag("c4_dead")
            ? "Der Drache liegt still. Selbst im Tod ist er größer als jeder König."
            : g.flag("c4_wach")
              ? "Aschenschlund. Er überragt mich um das Zehnfache, und seine Augen glühen wie Schmiedeessen. Er sieht nicht böse aus. Er sieht müde aus."
              : "Aschenschlund, der Drache des Kharn. Er schläft auf einem Bett aus Knochen und Asche, der Kopf unter einem Flügel. Sein Atem fegt Staub durch die Höhle.",
        ),
      take: "Ich nehme einen Zahn, wenn er mir einen leiht. Er schläft.",
      use: (g) => g.say(g.flag("c4_wach") ? "Anfassen? Er könnte mich missverstehen. Als Mahlzeit." : "Ich lege die Hand auf eine Schuppe. Sie ist warm wie ein Ofen. Der Drache schnarcht auf. Ich ziehe die Hand zurück."),
      talk: async (g) => {
        if (g.flag("c4_dead")) return g.say("Er antwortet nicht. Er wird es nie wieder.");
        if (!g.flag("c4_fire")) {
          await g.say("Ich flüstere ihm zu. Der Drache schnarcht. Er ist nicht neugierig auf einen Totengräberlehrling.");
          return;
        }
        await once(g, "c4_drache_gespraech", async () => {
          await g.say("Das Siegel der Weisheit glüht in meiner Tasche. Plötzlich verstehe ich das Grollen. Es sind Worte.");
          await says(g, "drache", "Kleiner Mensch. Du trägst einen Spiegel und ein Siegel. Du hättest mich auch ohne beides erschlagen können. Warum hast du es nicht?");
        });
        await talk(g, () => [
          {
            text: "Was ist hier geschehen?",
            run: () =>
              says(g, "drache", "Der Mann in Schwarz kam, als ich schlief. Er nahm mein Ei und ließ sein Horn zurück, das mich zwingt. Das Ei hielt mich fest: Solange er es hat, folge ich dem Ton.", "Ich habe Gold gesammelt, damit es warm liegt. Nicht aus Gier. Aus Liebe."),
          },
          {
            text: "Wo ist dein Ei jetzt?",
            show: () => !g.flag("c4_ei_zurueck"),
            run: () => says(g, "drache", g.flag("c4_ei_weg") ? "In deinen Händen. Ich spüre es. Es ist warm. Es lebt." : "Auf dem Altar dort. Er wollte es nutzen, um mich zu binden."),
          },
          {
            text: "Ich bringe dir dein Ei zurück.",
            show: () => g.has("drachenei"),
            run: async () => {
              await endGnade(g);
              return "end" as const;
            },
          },
          {
            text: "Nimm das Ei. Es liegt auf dem Altar.",
            show: () => !g.has("drachenei") && !g.flag("c4_ei_weg"),
            run: () => says(g, "drache", "Ich darf es nicht berühren, solange der Bann nicht gebrochen ist. Du musst es mir bringen. Du allein."),
          },
          {
            text: "Ich bin gekommen, um dich zu erschlagen.",
            run: async () => {
              await says(g, "drache", "Dann tu es. Ich bin müde. Aber das Ei stirbt dann mit mir.");
              await endRache(g);
              return g.flag("c4_resolved") ? ("end" as const) : undefined;
            },
          },
          {
            text: "Ich muss noch einmal nachdenken.",
            run: async () => {
              await says(g, "drache", "Denke. Ich habe Zeit. Mein Kind nicht.");
              return "end" as const;
            },
          },
        ]);
      },
      useWith: {
        spiegelschild: "Ich halte den Spiegelschild vor mich. Der Drache sieht sein eigenes Auge darin. Er blinzelt irritiert, und ich fühle mich albern.",
        drachenei: async (g) => {
          if (!g.flag("c4_fire")) return g.say("Mit dem Ei vor einen schlafenden Drachen treten? Erst sollte ich mich um den Mann kümmern, der ihn besitzt.");
          await endGnade(g);
        },
        schwert: async (g) => {
          if (!g.flag("c4_fire")) return g.say("Auf einen schlafenden Drachen einschlagen? Das wäre nicht mutig, nur laut. Und Malvor sieht zu.");
          await endRache(g);
        },
        weihwasser: "Weihwasser auf einen Drachen. Er schnarcht weiter. Immerhin ein friedlicher Gläubiger.",
        horn: "Ich halte das Horn hoch. Er sieht mich traurig an. Ich lasse es sinken, es fühlt sich falsch an.",
      },
      give: {
        drachenei: async (g) => {
          if (!g.flag("c4_fire")) return g.say("Noch nicht. Erst muss Malvor den Bann verlieren.");
          await endGnade(g);
        },
      },
    }),

    // ----- Malvor
    npc({
      id: "malvor",
      name: "Kanzler Malvor",
      x: 500,
      y: 376,
      scale: 1,
      frames: { idle: "malvor_idle", talk: "malvor_talk", cast: "malvor_cast" },
      hit: [468, 235, 66, 142],
      look: (g) =>
        g.say(
          g.flag("c4_fire")
            ? g.flag("c4_malvor_tied")
              ? "Malvor, gefesselt wie ein Paket. Der Talar ist verbrannt, der Stolz auch."
              : "Malvor, der Talar verkohlt, die Hände verbrannt. Sein Blick hängt am Horn."
            : "Kanzler Malvor. Der Mann, der den König vergiftete und jetzt einen Drachen befehligen will. Er hält das goldene Horn wie eine Reliquie.",
        ),
      talk: async (g) => {
        if (g.flag("c4_fire")) {
          await talk(g, () => [
            {
              text: "Warum das alles?",
              run: () => says(g, "malvor", "Macht. Ein König, der zögert, ist ein Hindernis. Ein Drache, der gehorcht, ist ein Heer. Ich wollte nur ein Land, das tut, was ich sage."),
            },
            {
              text: "Wo ist dein Gift jetzt?",
              run: () => says(g, "malvor", "Es war nicht giftig genug. Das ist meine Lehre. Eine, die ich nicht mehr brauche."),
            },
            {
              text: "Ich werde Euch binden.",
              show: () => !g.flag("c4_malvor_tied") && g.has("seil"),
              run: async () => {
                await g.pose("use", 600);
                g.remove("seil");
                g.set("c4_malvor_tied", true);
                g.honor(1);
                await g.say("Ich binde ihm die Hände mit meinem Seil. Er wehrt sich nicht mehr, sieht nur auf das Horn, das außer Reichweite liegt.");
                await says(g, "malvor", "Ein Seil. Welche Ironie. Ich wollte Drachen binden, und ein Totengräberjunge bindet mich.");
              },
            },
            bye("Du bist klüger, als du aussiehst, Junge. Das ist kein Kompliment.", "malvor", g, "Genug."),
          ]);
          return;
        }
        await once(g, "c4_met_malvor", async () => {
          await says(g, "malvor", "Bran. Der Totengräberjunge. Ich hätte nicht gedacht, dass du so weit kommst. Ich habe dich unterschätzt.");
          await hero(g, "Ihr habt den König vergiftet. Und das Ei gestohlen.");
          await says(g, "malvor", "Den König habe ich nicht vergiftet, ich habe ihm lediglich etwas zu trinken gegeben. Und das Ei? Das habe ich geliehen.");
        });
        await talk(g, () => [
          {
            text: "Was habt Ihr mit dem Ei vor?",
            run: () => says(g, "malvor", "Es ist der Schlüssel. Solange ich es habe, bindet das Horn den Drachen. Er wird für mich brennen, wo ich es will."),
          },
          {
            text: "Das Horn. Was kann es?",
            run: () => says(g, "malvor", "Es ruft. Und Drachen gehorchen dem, der ihr Kind besitzt. Die Alten haben es vergessen. Ich nicht."),
          },
          {
            text: "Das Siegel der Weisheit zeigt mir etwas über das Horn.",
            show: () => g.has("weisheitssiegel"),
            run: async () => {
              await hero(g, "Das Horn bindet nur, solange das Ei in Reichweite ist. Und es ist rund. Und es hat einen Besitzer.");
              await says(g, "malvor", "Du hast zu viel gelesen. Und wenig Verstand, das richtig zu nutzen.");
            },
          },
          {
            text: "Was wollt Ihr von mir?",
            show: () => !g.flag("c4_bribed"),
            run: async () => {
              await says(g, "malvor", "Dass du gehst. Nimm das Gold, das hier liegt, so viel du tragen kannst. Ich nenne dich Ritter, noch vor Roderic. Niemand erfährt, was du gesehen hast.");
              const i = await g.choose(["Ich nehme Euer Angebot an.", "Niemals."]);
              if (i === 0) {
                g.set("c4_bribed", true);
                g.honor(-2);
                await hero(g, "Gold. Ein Titel. Und eine Nacht Ruhe. Das klingt nach einem schlechten Geschäft, das gut aussieht.");
                await says(g, "malvor", "Ausgezeichnet. Nun, Zeugen sind lästig. Sieh zu, wie der Drache gehorcht.");
                await confront(g);
              } else {
                await says(g, "malvor", "Schade. Ein Totengräber, der Prinzipien hat, ist wie ein Hund, der Latein spricht.");
              }
            },
          },
          {
            text: "Ich halte Euch auf. Hier und jetzt.",
            run: async () => {
              await confront(g);
              return "end" as const;
            },
          },
          bye("Du kommst nicht wieder, Junge. Aber geh nur.", "malvor", g, "Ich komme wieder."),
        ]);
      },
      give: { silber: "Malvor lacht. Silber von einem Totengräber? Er hält es für Spott." },
      useWith: {
        seil: async (g) => {
          if (!g.flag("c4_fire")) return g.say("Malvor mit einem Seil fesseln, solange der Drache auf seinen Befehl lauscht? Ich wäre als Zunder wertvoller.");
          if (g.flag("c4_malvor_tied")) return g.say("Er ist schon gefesselt.");
          await g.pose("use", 600);
          g.remove("seil");
          g.set("c4_malvor_tied", true);
          g.honor(1);
          await g.say("Ich binde Malvors Hände zusammen. Er wehrt sich nicht mehr. Das Horn liegt außer Reichweite.");
        },
        schwert: (g) => g.say(g.flag("c4_fire") ? "Ich halte ihm die Klinge an die Kehle. Er rührt sich nicht. Ich habe keine Lust auf Mord." : "Ich ziehe das Schwert, aber Malvor lächelt nur und hebt das Horn. Besser nicht."),
        spiegelschild: "Ich hebe den Schild. Malvor sieht sein Gesicht darin und wendet den Blick ab. Er mag keinen Spiegel.",
        gegengift: "Das Gegengift gehört dem König. Malvor bekommt höchstens den Geruch.",
      },
    }),

    // ----- altar with egg
    {
      id: "altar",
      name: "Nest-Altar",
      sprite: (g) => (g.flag("c4_ei_zurueck") ? "altar_ei_ei" : g.flag("c4_ei_weg") ? "altar_ei_leer" : "altar_ei_ei"),
      x: 640,
      y: 360,
      scale: 1.15,
      hit: [600, 290, 82, 72],
      at: { x: 640, y: 385 },
      primary: "look",
      look: (g) =>
        g.say(
          g.flag("c4_ei_zurueck")
            ? "Das Ei liegt wieder im Nest. Es leuchtet leise, wie eine kleine Sonne."
            : g.flag("c4_ei_weg")
              ? "Ein leeres Nest aus Asche und Gold. Der Abdruck des Eies ist noch warm."
              : "Ein Steinaltar mit einem Nest aus Asche. Darin ruht ein glühendes Ei, so groß wie ein Kürbis. Etwas darin pocht.",
        ),
      take: async (g) => {
        if (g.flag("c4_ei_weg") || g.flag("c4_ei_zurueck")) return g.say("Das Ei ist nicht mehr hier.");
        if (!g.flag("c4_fire")) {
          await says(g, "malvor", "Finger weg vom Altar, Junge!");
          await confront(g);
          return;
        }
        await g.pose("pick", 600);
        g.sfx("magic");
        g.add("drachenei");
        g.set("c4_ei_weg", true);
        await g.say("Ich hebe das Ei vorsichtig auf. Es ist warm wie ein schlagendes Herz. Etwas scharrt leise gegen die Schale.");
        await hero(g, "Kleiner Drache, ich bringe dich nach Hause.");
      },
      use: (g) => g.say(g.flag("c4_ei_zurueck") ? "Das Ei ruht. Ich lasse es in Frieden." : "Ich streiche über den Rand des Altars. Er ist warm. Als würde etwas darunter atmen."),
      useWith: {
        drachenei: async (g) => {
          if (!g.flag("c4_fire")) return g.say("Noch nicht. Erst muss Malvor das Horn verlieren.");
          await endGnade(g);
        },
        schwert: "Ich halte das Schwert über das Ei. Der Gedanke, es zu zerschlagen, ist mir unerträglich. Ich stecke es weg.",
      },
    },

    // ----- the horn on the floor (after Malvor loses it)
    {
      id: "horn_boden",
      name: "Drachenhorn",
      sprite: "horn_liegend",
      x: 575,
      y: 405,
      scale: 1.0,
      hit: [540, 380, 70, 40],
      hidden: (g) => !g.flag("c4_fire") || !!g.flag("c4_horn_taken"),
      primary: "take",
      look: "Das goldverzierte Drachenhorn. Es liegt da, wo Malvor es fallen ließ, und scheint noch zu summen.",
      take: async (g) => {
        await g.pose("pick", 600);
        g.sfx("pickup");
        g.add("horn");
        g.set("c4_horn_taken", true);
        await g.say("Ich nehme das Horn an mich. Es ist schwerer, als es aussieht. Wer es hält, hört das Flüstern der Macht.");
        await hero(g, "Ich sollte es entweder zerstören oder sehr weit weg bringen.");
      },
    },

    // ----- hoard
    container({
      id: "goldhaufen",
      name: "Goldhaufen",
      x: 120,
      y: 372,
      sprites: { closed: "goldhaufen", open: "goldhaufen" },
      scale: 1.9,
      hit: [30, 290, 180, 90],
      at: { x: 190, y: 392 },
      contents: ["zinnring", "kreuzanhaenger", "zahn", "messingknopf", "rosenkranz"],
      look: "Ein Hügel aus Münzen, Pokalen und Rüstungsresten. Der Drache liegt nicht auf dem Gold. Das Gold liegt auf dem Nest, wie eine Decke.",
      title: "Im Hort",
      onOpen: async (g) => {
        await g.say("Ich greife in den Haufen. Die Münzen sind alt, glatt und warm. Der Drache schnauft im Schlaf auf, und ich erstarre.");
      },
    }),
    groundItem({
      id: "dh_silber",
      item: "silber",
      x: 235,
      y: 408,
      say: "Silber vom Hort des Drachen. Es fühlt sich warm an. Und schwer.",
      onTake: (g) => {
        g.honor(-1);
      },
    }),
    container({
      id: "altruestung",
      name: "Alte Rüstungen",
      x: 345,
      y: 395,
      sprites: { closed: "altruestung", open: "altruestung" },
      scale: 1.2,
      contents: ["rostiger_dolch", "pergamentfetzen", "schnalle"],
      look: "Ein Haufen verbeulter Rüstungen. Helme, Brustpanzer, ein Handschuh mit noch einem Knochen darin. Die Ritter, die es versuchten.",
      title: "Zwischen den Rüstungen",
    }),
    container({
      id: "knochenhaufen",
      name: "Knochenhaufen",
      x: 430,
      y: 410,
      sprites: { closed: "knochenhaufen", open: "knochenhaufen" },
      scale: 1.1,
      contents: ["knochen", "zahn", "totenkopf"],
      look: "Ein Haufen Knochen. Tiere, Ritter, ein Pferd. Der Drache war nicht wählerisch, bis er satt wurde.",
      title: "Im Knochenhaufen",
    }),
    spot({
      id: "lavasee",
      name: "Lavasee",
      hit: [330, 230, 190, 90],
      at: { x: 420, y: 345 },
      look: "Ein See aus flüssigem Feuer, hinter dem Wasserfälle aus Lava herabstürzen. Es ist schön, auf eine Art, die ich nicht beschreiben will.",
      use: "Ich beuge mich vor. Die Hitze nimmt mir die Luft. Ich überlege es mir anders.",
      take: "Man nimmt kein Feuer mit. Man hat es oder man hat es nicht.",
      useWith: {
        horn: async (g) => {
          g.remove("horn");
          g.set("c4_horn_gone", true);
          g.honor(1);
          g.sfx("fire");
          g.flash("#ff8a30", 500);
          await g.say("Ich werfe das Horn in den Lavasee. Es glüht auf, schmilzt, und ein letzter, tiefer Ton zittert durch die Höhle.");
          await hero(g, "Kein Mann wird je wieder einen Drachen auf diese Weise zwingen.");
        },
        seil: "Das Seil in Lava tauchen? Es wäre das letzte, was ich brauche, und das Letzte, was es sieht.",
        schwert: "Mein Schwert in den Lavasee tauchen? Es würde glühen, aber danach nie wieder gerade sein.",
        eimer_wasser: "Das bisschen Wasser würde verdampfen, bevor es den See erreicht.",
        weihwasser: "Das Weihwasser verdampft, bevor es den See erreicht. Eine Verschwendung, auch für Gott.",
      },
    }),
    spot({
      id: "lavafall",
      name: "Lavafälle",
      hit: [345, 120, 190, 110],
      at: { x: 440, y: 350 },
      look: "Zwei Wasserfälle aus Lava stürzen in den See. Die Hitze drückt auf meine Brust.",
    }),
    spot({
      id: "knochensaeule",
      name: "Knochensäule",
      hit: [225, 0, 85, 295],
      at: { x: 270, y: 372 },
      look: "Eine Säule aus verschlungenen Drachenwirbeln. Am oberen Ende grinst ein Schädel. Die Architekten des Berges hatten Humor.",
    }),
    spot({
      id: "knochenring",
      name: "Knochenring",
      hit: [585, 190, 340, 105],
      at: { x: 640, y: 375 },
      look: "Der Nestring aus Drachenrippen, in dem Aschenschlund schläft. Es ist größer als die Dorfkirche und hat bessere Akustik.",
    }),
    spot({
      id: "stalaktiten",
      name: "Tropfsteine",
      hit: [0, 0, 225, 70],
      at: { x: 150, y: 372 },
      look: "Glühende Stalaktiten hängen von der Decke. Sie sehen aus wie die Zähne einer sehr großen Falle.",
    }),
  ],
};

export const scenes: SceneDef[] = [vulkanpfad, drachenhoehle];

export const start = {
  scene: "vulkanpfad",
  x: 80,
  y: 400,
  facing: 1 as const,
  inv: ["schwert", "spiegelschild", "weisheitssiegel", "seil", "fackel", "weihwasser"] as string[],
  flags: { chapter: 4 },
  intro: async (g: G) => {
    await g.card("Kapitel 4", "Der Vulkan");
    await hero(g, "Der Kharn. Wenn die Hölle einen Vorgarten hat, dann ist das hier der.");
    await hero(g, "Malvor ist vor mir hier. Mit dem Ei. Und einem Horn. Und ich habe einen Spiegel, ein Siegel und ein Seil. Es gab schon schlechtere Pläne.");
  },
};

export const hint = (g: G): string => {
  if (g.flag("c4_resolved")) return "Es ist vollbracht.";
  if (g.sceneId() === "vulkanpfad") {
    if (!g.flag("c4_lava_cool")) return g.has("eimer_wasser") ? "Gieße das Wasser auf den Lavastrom." : g.has("eimer") ? "Der Eimer kann an der Dampfspalte Wasser sammeln. Oder das Weihwasser kühlt die Lava." : "Der Lavastrom lässt sich mit Wasser kühlen. Das Weihwasser genügt, oder du suchst einen Eimer beim Ritterskelett.";
    return "Der Weg ist frei. Gehe nach rechts zur Drachenhöhle.";
  }
  if (!g.flag("c4_fire")) return "Sprich mit Malvor. Gegen den Feuerstrahl des Drachen hilft dein Spiegelschild, und der Strahl muss Malvor treffen.";
  if (!g.has("drachenei") && !g.flag("c4_ei_zurueck")) return "Nimm das Ei vom Altar und bring es dem Drachen. Oder entscheide anders.";
  return "Gib dem Drachen sein Ei zurück. Oder folge deiner Rache.";
};

export default { scenes, start, hint } satisfies ChapterModule;
