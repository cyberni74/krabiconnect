import { container, edgeExit, groundItem, hero, npc, says, talk, bye } from "../dsl";
import type { G, SceneDef, Thing } from "../types";
import { GEO } from "./geometry";
import { F, cryptLit, halterLit, needsLight, txt } from "./ch1_shared";

/* =========================================================================
 * gruft — dunkel (SceneDef.dark), Skelettwächter, Runen-Reliquienschrein
 * ========================================================================= */

const RUNES = { R: "Rabe", L: "Lamm", K: "Kreuz" } as const;
type Rune = keyof typeof RUNES;

const plate = (r: Rune, sprite: string, x: number): Thing =>
  needsLight({
    id: `platte_${r.toLowerCase()}`,
    name: `Steinplatte (${RUNES[r]})`,
    sprite,
    x,
    y: 232,
    at: { x: 500, y: 372 },
    hidden: (g) => F(g, "c1_schrein_offen"),
    primary: "use",
    look: `Eine Steinplatte mit dem Zeichen: ${RUNES[r]}. Sie lässt sich eindrücken. Die Frage ist nur: wann.`,
    take: "Die Platte sitzt fest im Stein.",
    use: async (g) => {
      g.sfx("clank");
      await g.pose("use", 350);
      const seq = String(g.flag("c1_s_seq") ?? "") + r;
      g.set("c1_s_seq", seq);
      if (seq.length < 3) return g.say(`Ich drücke die Platte: ${RUNES[r]}. Sie rastet ein. Stille.`);
      g.set("c1_s_seq", "");
      if (seq === "RLK") {
        g.sfx("unlock");
        g.flash("#ffe9a0", 500);
        g.set("c1_schrein_offen", true);
        await g.say("Ein tiefes Mahlen im Stein. Die Platten versinken, die Türen des Schreins schwingen auf und enthüllen warmes, goldenes Licht.");
        await g.say("Rabe, Lamm, Kreuz. Wer einmal die Fenster der Kapelle gesehen hat, vergisst sie nicht.");
        return;
      }
      g.sfx("wrong");
      g.shake(400);
      await g.say(`Die falsche Folge: ${seq.split("").map((c) => RUNES[c as Rune]).join(", ")}. Die Platten schnellen zurück, Staub rieselt von der Decke.`);
      if (!F(g, "c1_skelett_gebannt")) {
        g.frame("skelett", "wach");
        g.sfx("roar");
        await g.say("Hinter mir klappert etwas. Das Skelett hat den Kopf gehoben und mustert mich. Dann senkt es ihn wieder, gnädig, vorläufig.");
        g.frame("skelett", "idle");
      } else await g.say("Das Skelett schüttelt langsam den Schädel, als sei es mir peinlich. Es ist mir vermutlich peinlich.");
    },
  });

async function wake(g: G) {
  g.frame("skelett", "wach");
  g.sfx("roar");
  g.shake(700);
  g.flash("#40c8ff", 400);
  await g.say("Kaum hebe ich den Knochen, reißt der Wächter die Augen auf. Blaues Feuer in leeren Höhlen.");
  await says(g, "skelett", "WER... STÖRT... MEINE... WACHE?");
  await hero(g, "Entschuldigung! Ich wollte nur... ich gehe schon!");
  await g.say("Der Schild kracht neben mir in den Boden. Ich renne, was meine Beine hergeben, die Treppe hinauf, in Sicherheit.");
  g.frame("skelett", "idle");
  await g.goto("kapelle", 420, 405, 1);
  await g.say("Puh. Der Wächter ist ein schlechter Gastgeber. Ich brauche etwas, um ihn zu besänftigen. Weihwasser, hieß es.");
}

export const gruft: SceneDef = {
  id: "gruft",
  title: "Die Gruft unter der Kapelle",
  bg: "gruft",
  walk: GEO.gruft.walk,
  scale: GEO.gruft.scale,
  ambient: "crypt",
  fx: [
    { kind: "drips", n: 0.8 },
    { kind: "fog", area: [0, 330, 960, 110], n: 0.5 },
    { kind: "dust", n: 0.4 },
  ],
  dark: (g) => {
    if (F(g, "c1_torch_lit")) return { amount: 0.62, radius: 270 };
    if (halterLit(g)) return { amount: 0.8, radius: 110 };
    return { amount: 0.96, radius: 60 };
  },
  enter: async (g) => {
    if (!cryptLit(g)) {
      await g.say("Es ist stockfinster hier unten. Ich höre Tropfen, Ratten und mein Herz. In dieser Reihenfolge.");
      await g.say("Ohne Licht kann ich hier nichts tun. Ich brauche eine Fackel. Und Feuer.");
    } else if (!F(g, "c1_gruft_besucht")) {
      g.set("c1_gruft_besucht", true);
      await g.say("Das Fackellicht kriecht über Sarkophage, Spinnweben und Knochen. Der Raum hat mehr Bewohner, als ich dachte.");
      await g.say("In der mittleren Nische steht ein Reliquienschrein. Daneben ein Skelett im Panzer. Es rührt sich nicht. Noch nicht.");
    }
  },
  things: [
    edgeExit("left", { id: "treppe", name: "Treppe zur Kapelle", to: "kapelle", x: 420, y: 408, facing: 1, look: "Die Treppe zurück nach oben, ins Licht. Ein bisschen Optimismus auf dreißig Stufen." }),
    {
      id: "seitengang",
      name: "Verschütteter Gang",
      sprite: null,
      x: 917,
      y: 340,
      hit: [880, 215, 80, 130],
      at: { x: 840, y: 392 },
      look: "Ein Seitengang, bis zur Decke verschüttet. Oswin sagt, dahinter liegt die Pestgrube von 1342. Ich bin nicht neugierig.",
      use: "Ich räume ein paar Steine weg. Dahinter sind noch mehr Steine. Weiter komme ich nicht, zum Glück.",
    },

    /* --- the guardian */
    needsLight(
      npc({
        id: "skelett",
        name: "Skelettwächter",
        x: 425,
        y: 380,
        frames: { idle: "skelett_still", wach: "skelett_wach" },
        look: txt((g) => (F(g, "c1_skelett_gebannt") ? "Der Skelettwächter steht stramm, ein Rest Weihwasser glänzt auf dem Schädel. Er sieht beinahe friedlich aus." : "Ein Ritterskelett mit Schild und Schwert, stramm wie Feldwebel Brandt. Die Augenhöhlen folgen mir, hundertprozentig.")),
        talk: async (g) => {
          if (!F(g, "c1_skelett_gebannt")) {
            await g.say("Ich spreche ihn an. Er rührt sich nicht. Aber ich habe das Gefühl, dass er jedes Wort zählt.");
            return;
          }
          await says(g, "skelett", "Weihwasser. Lange nicht gefühlt. Sprich, Sterblicher.");
          await talk(g, () => [
            {
              text: "Was bewacht Ihr?",
              run: async () => {
                await says(g, "skelett", "Die Reliquie des heiligen Corvin. Seit dreihundert Jahren.");
                await says(g, "skelett", "Räuber kamen. Ich habe sie verscheucht. Sie ließen den Finger zurück und nahmen die Beine in die Hand.");
              },
            },
            {
              text: "Wie öffnet man den Schrein?",
              done: () => F(g, "c1_schrein_offen"),
              run: async () => {
                await says(g, "skelett", "Drei Steinplatten. Das Zeichen des Wächters zuerst, dann des Sanften, dann des Erlösers.");
                await says(g, "skelett", "Ich bin Skelett. Ich habe das alles auswendig gelernt. Es gibt hier unten sonst nichts zu tun.");
              },
            },
            {
              text: "Darf ich die Reliquie mitnehmen?",
              done: () => F(g, "taken_reliquie"),
              run: async () => {
                await says(g, "skelett", "Für den Pater? Für den Segen? Nimm sie. Ich werde sie vermissen. Und dann kommt jemand anderes, um sie zu stehlen.");
              },
            },
            {
              text: "Wie ist es, ein Skelett zu sein?",
              run: async () => {
                await says(g, "skelett", "Kühl. Und man spart eine Menge Geld für Essen.");
              },
            },
            bye("Geh in Frieden. Und nimm die Treppe leise.", "skelett", g, "Danke, Wächter."),
          ]);
        },
        use: "Ich klopfe dem Skelett auf die Schulter. Es klappert. Vermutlich aus Prinzip.",
        take: "Ich nehme es mit? Ein Skelett im Rucksack? Das gäbe unangenehme Fragen.",
        useWith: {
          weihwasser: async (g) => {
            if (F(g, "c1_skelett_gebannt")) return g.say("Ich habe ihn schon gesegnet. Mehr Wasser gibt es für ihn nicht, sonst wird er noch rostig.");
            g.remove("weihwasser");
            g.add("flasche_leer");
            g.set("c1_skelett_gebannt", true);
            g.sfx("magic");
            g.flash("#cfe8ff", 600);
            await g.pose("use", 600);
            await g.say("Ich besprenge den Skelettwächter mit Weihwasser. Es zischt leise, ein Seufzen geht durch den Brustpanzer.");
            await g.say("Die Augenhöhlen erlöschen, das Skelett steht still und friedlich. Es verbeugt sich sogar, ein bisschen.");
            await g.say("Jetzt habe ich Ruhe. Und die leere Flasche behalte ich gleich, für das nächste Mal.");
          },
        },
      }),
    ),

    /* --- the shrine */
    needsLight({
      id: "schrein",
      name: "Reliquienschrein",
      sprite: (g) => (F(g, "c1_schrein_offen") ? "reliquienschrein_offen" : "reliquienschrein_zu"),
      x: 510,
      y: 355,
      at: { x: 510, y: 390 },
      look: txt((g) => (F(g, "c1_schrein_offen") ? "Der Reliquienschrein steht offen. Im Inneren brennt ein einsames, goldenes Licht." : "Ein Reliquienschrein aus Stein. Darüber drei Steinplatten mit Zeichen: Rabe, Lamm, Kreuz. Zwei steinerne Türen verbergen das Heiligtum.")),
      take: "Ich nehme den Schrein nicht mit. Er ist aus Stein. Den Inhalt vielleicht.",
      use: txt((g) => (F(g, "c1_schrein_offen") ? "Der Schrein ist offen. Der Fingerknochen liegt da, golden und bescheiden." : "Die Türen sind verschlossen. Die Steinplatten darüber sind das Schloss: Drei Zeichen, in der richtigen Reihenfolge.")),
    }),
    plate("R", "knopf_rabe", 468),
    plate("L", "knopf_lamm", 510),
    plate("K", "knopf_kreuz", 552),
    needsLight({
      id: "reliquie",
      name: "Reliquie",
      sprite: "reliquie",
      dir: "items",
      x: 510,
      y: 328,
      at: { x: 510, y: 390 },
      hidden: (g) => !F(g, "c1_schrein_offen") || F(g, "taken_reliquie"),
      primary: "take",
      look: "Ein Fingerknochen in einem goldenen Schrein. Heilig, behauptet das Etikett. Der Knochen schweigt.",
      take: async (g) => {
        if (!F(g, "c1_skelett_gebannt")) return wake(g);
        await g.pose("pick", 600);
        g.sfx("pickup");
        g.add("reliquie");
        g.set("taken_reliquie", true);
        await g.say("Ich nehme den Fingerknochen. Das Skelett sieht zu und rührt sich nicht. Ich glaube, es lächelt. Schwer zu sagen.");
      },
    }),

    /* --- sarcophagi */
    needsLight({
      id: "sarkophag_a",
      name: "Sarkophag des Ritters Tankred",
      sprite: "sarkophag",
      x: 225,
      y: 385,
      look: "Ein steinerner Sarkophag. Die Inschrift: „Ser Tankred, genannt der Stets-zu-spät. Er kam, sah und starb.“",
      use: "Ich versuche, den Deckel zu heben. Er bewegt sich keinen Zoll. Tankred will nicht gestört werden. Verständlich.",
      take: "Tankred nehme ich nicht mit.",
    }),
    needsLight(
      groundItem({
        id: "g_klingenbruch",
        item: "klingenbruch",
        x: 225,
        y: 328,
        at: { x: 225, y: 405 },
        say: "Der halbe Rest eines Schwerts. Rost, Staub und ein Hauch Mut. Gero wird es lieben.",
        look: "Die Hälfte eines Schwerts, auf dem Sarkophag liegen gelassen. Ob es Tankred gehörte? Er braucht es nicht mehr.",
      }),
    ),
    needsLight(
      container({
        id: "sarkophag_b",
        name: "Offener Sarkophag",
        x: 700,
        y: 390,
        sprites: { closed: "sarkophag_offen", open: "sarkophag_offen" },
        contents: ["zahn", "schnalle", "rostiger_dolch"],
        title: "Offener Sarkophag",
        look: "Ein Sarkophag mit verschobenem Deckel. Jemand hat hier nachgesehen, vor sehr langer Zeit und mit schlechten Manieren.",
        emptyText: "Nur Staub, Knochenreste und das Gefühl, bestohlen zu werden, obwohl man selbst der Dieb ist.",
        onOpen: async (g) => {
          await g.say("Ich spähe in den Sarkophag. Ein Gerippe in Fetzen von Seide, die Hände auf der Brust gefaltet. Daneben liegt einiges, was sich zu nehmen lohnt, wenn man keine Skrupel hat.");
        },
      }),
    ),
    needsLight(
      container({
        id: "knochenhaufen",
        name: "Knochenhaufen",
        x: 330,
        y: 428,
        sprites: { closed: "knochenhaufen", open: "knochenhaufen" },
        contents: ["totenkopf", "glasauge"],
        title: "Knochenhaufen",
        look: "Ein Haufen Knochen. Menschlich, tierisch, unentschlossen. Hier hat jemand aufgeräumt, indem er nicht aufgeräumt hat.",
        emptyText: "Nur Knochen. Nichts, was ich noch brauchen könnte.",
      }),
    ),
    needsLight(
      container({
        id: "ritterskelett",
        name: "Ritterskelett",
        x: 790,
        y: 420,
        sprites: { closed: "ritterskelett", open: "ritterskelett" },
        contents: ["spielfigur"],
        title: "Ritterskelett",
        look: "Ein Ritterskelett, quer über den Boden hingestreckt. Sein Panzer ist verrostet, seine Pläne auch. Er hat es nicht bis zur Treppe geschafft.",
        emptyText: "Nichts mehr. Er hat nur noch seine Würde, und die ist auch durchlöchert.",
      }),
    ),
    needsLight({
      id: "sargdeckel",
      name: "Steinplatte",
      sprite: "sargdeckel",
      x: 885,
      y: 405,
      hit: [860, 285, 50, 125],
      look: "Ein aufrecht stehender Grabdeckel mit eingemeißeltem Ritter. Er sieht aus, als wolle er jemandem etwas sagen: „Lass mich raus“ oder „Lass mich in Ruhe“.",
      take: "Die Steinplatte wiegt mehr als eine Kuh. Ich bin kein Kuhfreund.",
    }),
    needsLight({
      id: "tierskelett",
      name: "Tierskelett",
      sprite: "tierskelett",
      x: 120,
      y: 428,
      look: "Das Skelett eines Hundes, vielleicht eines Wolfs. Er kam herunter, um zu fressen, und blieb, um zu verhungern. Eine Lehre, die ich gern teile.",
    }),
    needsLight({
      id: "fackelhalter",
      name: "Fackelhalter",
      sprite: "fackelhalter",
      x: 610,
      y: 260,
      at: { x: 610, y: 372 },
      look: txt((g) => (F(g, "c1_halter_fackel") ? "Meine Fackel steckt im Halter und brennt ruhig. So habe ich beide Hände frei." : "Ein eiserner Fackelhalter an der Wand. Er ist leer und wartet auf Licht.")),
      take: async (g) => {
        if (!F(g, "c1_halter_fackel")) return g.say("Der Halter sitzt fest in der Wand. Ich lasse ihn dort. Er hat Wichtigeres zu tun.");
        g.set("c1_halter_fackel", false);
        g.set("c1_torch_lit", true);
        g.set("c1_torch_left", 10);
        g.add("fackel");
        await g.say("Ich nehme die brennende Fackel wieder aus dem Halter.");
      },
      use: txt((g) => (F(g, "c1_halter_fackel") ? "Ich nehme die Fackel nicht heraus. Hier hängt sie gut." : "Der Halter ist leer. Eine brennende Fackel würde ihn schmücken.")),
      useWith: {
        fackel: async (g) => {
          if (!F(g, "c1_torch_lit")) return g.say("Die Fackel ist nicht angezündet. In den Halter gesteckt bringt sie niemandem etwas.");
          g.remove("fackel");
          g.set("c1_torch_lit", false);
          g.set("c1_halter_fackel", true);
          g.sfx("fire");
          await g.say("Ich stecke die brennende Fackel in den Halter. Sie leuchtet stetig und brennt nicht ab, solange sie dort bleibt. Immerhin etwas.");
        },
      },
    }),
    {
      id: "halter_licht",
      name: "",
      sprite: null,
      x: 610,
      y: 260,
      decor: true,
      hidden: (g) => !F(g, "c1_halter_fackel"),
      light: { r: 230, color: "rgba(255,170,70,0.55)", flicker: 0.2, dy: 10 },
    },
    needsLight({
      id: "spinnweben",
      name: "Spinnweben",
      sprite: null,
      x: 235,
      y: 110,
      hit: [190, 70, 120, 120],
      at: { x: 235, y: 372 },
      look: "Dichte Spinnweben, groß wie Fischernetze. Wer hier haust, hat hundert Augen und keinen Hunger. Hoffentlich.",
    }),
    needsLight({
      id: "deckenloch",
      name: "Lichtschacht",
      sprite: null,
      x: 585,
      y: 40,
      hit: [545, 0, 80, 120],
      at: { x: 585, y: 372 },
      look: "Ein schmaler Schacht in der Decke, durch den ein bisschen Mondlicht fällt. Ein Gruß von oben, wo die Lebenden sind.",
    }),
    needsLight(groundItem({ id: "g_rabenkralle", item: "rabenkralle", x: 585, y: 410, say: "Eine Rabenkralle. Vermutlich vom letzten Raben, der sich hierher verirrt hat. Ich frage nicht." })),
  ] as Thing[],
};
