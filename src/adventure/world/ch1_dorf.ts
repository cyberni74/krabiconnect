import { bye, container, edgeExit, exitThing, groundItem, hero, npc, once, says, talk } from "../dsl";
import type { G, SceneDef, Thing } from "../types";
import { GEO } from "./geometry";
import { F, hasAllThree, txt } from "./ch1_shared";

/* =========================================================================
 * dorfplatz — Brandt, Hilda, Brunnen, Galgen + Rabe, Leichenkarren, Anschlagbrett
 * ========================================================================= */

const wellRigged = (g: G) => F(g, "c1_seil_am_brunnen");

/** Pour a bucket of water somewhere: the empty bucket comes back. */
export const emptyBucket = (g: G) => {
  g.remove("eimer_wasser");
  g.add("eimer");
};

async function finishChapter(g: G) {
  const honor = Number(g.flag("honor") ?? 0);
  await says(g, "brandt", "Na sieh einer an. Der Totengräberjunge, und er trägt tatsächlich etwas bei sich.");
  await hero(g, "Eine Klinge. Den Segen von Pater Anselm. Und Ser Halvards Brief.");
  await says(g, "brandt", "Klinge...");
  if (g.flag("c1_gesegnet")) await says(g, "brandt", "Sie summt leise. Hast du sie in Weihwasser getauft? Unverschämt. Und klug.");
  else await says(g, "brandt", "Etwas krumm, etwas schief, aber ehrlich geschmiedet. Das ist mehr, als ich von mancher Klinge im Orden sagen kann.");
  await says(g, "brandt", "Segen... das Siegel ist echt. Der Pater hat sogar ordentlich geschrieben. Wunder über Wunder.");
  await says(g, "brandt", "Und Halvards Brief. Seine Handschrift. Er lebt also noch.");
  if (g.has("siegelring")) await says(g, "brandt", "Und sein Siegelring am Finger. Er muss dich sehr gemocht haben, Junge.");
  if (honor >= 3) await says(g, "brandt", "Man erzählt sich, du hättest den Toten Respekt erwiesen und Hilda geholfen. In Aschenfurt ist das fast schon verdächtig.");
  else if (honor < 0) await says(g, "brandt", "Man erzählt sich auch, am Leichenkarren sei ein Beutel verschwunden. Ich habe nichts gehört. Ich höre ohnehin schlecht.");
  await says(g, "brandt", "Also gut. Die Prüfung findet auf Burg Grauwacht statt. Dort sitzt der Orden, wenn er nicht gerade vergiftet wird.");
  await says(g, "brandt", "Der Weg dorthin führt durch das Hexenmoor. Es gibt keinen anderen. Die Wege drumherum sind länger als dein Leben.");
  await hero(g, "Das Hexenmoor? Mit... Hexen?");
  await says(g, "brandt", "Mit Nebel, Irrlichtern und einer Dame, die Morwenna heißt. Sei höflich, bring Brot mit, und iss nichts, was sie dir anbietet.");
  if (!g.has("fackel")) {
    g.add("fackel");
    await says(g, "brandt", "Hier, eine Fackel. Die Irrlichter mögen keine ernsthafte Konkurrenz.");
  } else await says(g, "brandt", "Deine Fackel hast du ja schon. Gut. Im Moor ist Licht wichtiger als Mut.");
  if (!g.has("eimer")) {
    g.add("eimer");
    await says(g, "brandt", "Und einen Eimer. Frag nicht. Im Moor ist alles nass, nur der Durst nicht.");
  }
  if (!g.has("rabenfeder")) {
    g.add("rabenfeder");
    g.sfx("pickup");
    await g.say("Eine schwarze Feder segelt vom Galgen und landet vor meinen Füßen. Der Rabe sieht weg, als wäre nichts gewesen.");
  }
  g.set("c1_done", true);
  await says(g, "brandt", "Geh, Bran. Und komm lebendig zurück. Ich habe schon genug Leichen zu zählen.");
  await g.card("Kapitel 2", "Das Hexenmoor");
  g.set("chapter", 2);
  await g.goto("moorpfad", 80, 395, 1);
}

export const dorfplatz: SceneDef = {
  id: "dorfplatz",
  title: "Dorfplatz von Aschenfurt",
  bg: "dorfplatz",
  walk: GEO.dorfplatz.walk,
  scale: GEO.dorfplatz.scale,
  ambient: "village",
  fx: [
    { kind: "fog", area: [0, 250, 960, 190], n: 0.8 },
    { kind: "dust", n: 0.6 },
  ],
  things: [
    /* ---------------------------------------------------------- exits */
    edgeExit("left", { id: "to_schmiede", name: "Zur Schmiede", to: "schmiede", x: 860, y: 405, facing: -1, look: "Dort hinten qualmt die Schmiede. Der Rauch riecht nach Arbeit und Ärger." }),
    edgeExit("right", { id: "to_waldrand", name: "Zum Waldrand", to: "waldrand", x: 110, y: 405, facing: 1, look: "Der Pfad zum Waldrand. Dort, sagt man, fressen die Wölfe das, was die Pest übrig lässt." }),
    exitThing([748, 258, 56, 54], { id: "to_kapelle", name: "Kapelle", to: "kapelle", x: 80, y: 400, facing: 1, at: { x: 775, y: 330 }, look: "Die Kapelle von Aschenfurt. Das Dach hat Löcher, der Glaube auch." }),

    /* ---------------------------------------------------------- npcs */
    npc({
      id: "brandt",
      name: "Feldwebel Brandt",
      x: 665,
      y: 398,
      facing: -1,
      frames: { idle: "brandt_idle", talk: "brandt_talk", point: "brandt_point" },
      look: "Feldwebel Brandt. Er sieht aus, als hätte er den Krieg gewonnen und dabei sich selbst verloren.",
      give: {
        schwert: "Brandt winkt ab. „Behalte es. Zeig mir alles auf einmal, ich bin kein Pfandleiher.“",
        siegelbrief: "„Behalte es, Junge. Zeig mir Klinge, Segen und Bürgen zusammen. Der Orden liebt Vollständigkeit.“",
        halvard_brief: "„Nicht einzeln. Wenn du alles hast, komm zu mir. Ich vergesse sonst die Hälfte.“",
        wurst: "Brandt schnuppert, schluckt hörbar und schiebt sie zurück. „Dienstvergehen. Behalte sie. Ich habe nichts gesehen.“",
        muenzbeutel: "Brandt wägt den Beutel in der Hand, wird blass und drückt ihn dir zurück. „Ich kenne diesen Beutel. Ich kenne den Karren. Ich habe nichts gesehen.“",
      },
      talk: async (g) => {
        if (hasAllThree(g) && !F(g, "c1_done")) return finishChapter(g);
        await talk(g, () => [
          {
            text: "Was genau brauche ich für die Prüfung?",
            run: async () => {
              await says(g, "brandt", "Drei Dinge, Totengräberjunge. Eine Klinge, einen Segen und einen Bürgen.");
              await says(g, "brandt", "Die Klinge muss von dir sein. Der Orden prüft, ob du Hitze und Hammerschlag verträgst.");
              await says(g, "brandt", "Der Segen ist ein Siegelbrief vom Pater. Und der Bürge muss ein Ritter des Ordens sein, der seinen Namen für dich verpfändet.");
              g.set("q_start", true);
            },
          },
          {
            text: "Wo bekomme ich eine Klinge?",
            run: async () => {
              await says(g, "brandt", "Gero, der Schmied. Brummig, lahm, und er hat noch nie freiwillig jemandem geholfen.");
              await says(g, "brandt", "Er schmiedet nicht selbst, seit die Hand nicht mehr will. Aber er weiß genau, wie es geht. Und er sagt es dir. Meistens laut.");
            },
          },
          {
            text: "Und der Segen?",
            run: async () => {
              await says(g, "brandt", "Pater Anselm in der Kapelle. Er sitzt auf seinem Segen wie ein Geizhals auf dem Gold.");
              await says(g, "brandt", "Man munkelt, in der Gruft fehle etwas. Ein Heiligtum. Er wird dir mehr sagen, wenn du ihm einen Gefallen tust.");
            },
          },
          {
            text: "Wer könnte für mich bürgen?",
            run: async () => {
              await says(g, "brandt", "Ser Halvard. Ritter des Ordens, ein ehrlicher Mann. Er ritt vor Wochen zum Waldrand und kam nie zurück.");
              await says(g, "brandt", "Wenn die Wölfe ihn nicht haben, dann liegt er noch dort. Aber ich schicke keinen meiner Männer. Die Wölfe haben Hunger und ich Familie.");
              g.set("c1_halvard_bekannt", true);
            },
          },
          {
            text: "Wie steht es um Aschenfurt?",
            run: async () => {
              await says(g, "brandt", "Die Pest nimmt, der Hunger nimmt, der Steuereintreiber nimmt auch. Nur der Galgen gibt noch Arbeit.");
              await says(g, "brandt", "Und oben auf Grauwacht liegt der König im Sterben. Man flüstert, es sei kein Fieber.");
              await hero(g, "Kein Fieber?");
              await says(g, "brandt", "Ich sagte nichts. Ich bin Soldat, kein Schwätzer.");
            },
          },
          {
            text: "Was ist mit dem Leichenkarren?",
            show: () => true,
            run: async () => {
              await says(g, "brandt", "Der steht seit gestern da. Der Fuhrmann ist an Schlimmerem gestorben als am Karren.");
              await says(g, "brandt", "Wer noch Anstand hat, deckt ihn zu. Wer keinen hat, durchsucht ihn. Ich schaue nicht hin, ich bin im Dienst.");
            },
          },
          {
            text: "Warum sollte ich ein Ritter werden wollen?",
            run: async () => {
              await says(g, "brandt", "Ha! Frag mich in zehn Jahren, wenn du noch lebst.");
              await says(g, "brandt", "Man bekommt ein Pferd, ein Schwert und ein Dach. Dafür bekommt man auch Dinge hineingerammt. Ich war nie Ritter. Ich war nur sein Schatten.");
            },
          },
          bye("Dann hol sie dir. Und zieh dir was Sauberes an.", "brandt", g, "Ich komme wieder."),
        ]);
      },
    }),

    npc({
      id: "hilda",
      name: "Hilda",
      x: 150,
      y: 402,
      frames: { idle: "hilda_idle", talk: "hilda_talk" },
      look: "Hilda, alt wie der Brunnen und doppelt so zäh. Sie trägt ein Kopftuch und die Sorgen eines ganzen Dorfes.",
      give: {
        fieberkraut: (g) => hildaKraut(g),
        wurst: "„Wurst? Behalte sie. Mein Kunz hatte auch eine. Er war so stolz auf sie, dass er sie nie gegessen hat.“",
      },
      talk: async (g) => {
        await once(g, "c1_met_hilda", async () => {
          await says(g, "hilda", "Junge! Du bist doch der von Oswin, der mit der Schaufel. Hast du zufällig Fieberkraut?");
          await hero(g, "Fieberkraut? Nein. Warum?");
          await says(g, "hilda", "Mein Enkel brennt wie eine Kerze. Der Bader sagt, nur Fieberkraut hilft. Der Bader sagt auch, er sei kein Arzt.");
          g.set("q_hilda", true);
        });
        await talk(g, () => [
          {
            text: "Wo wächst Fieberkraut?",
            show: () => !F(g, "c1_hilda_belohnt"),
            run: async () => {
              await says(g, "hilda", "Am Waldrand, bei den Fliegenpilzen, wo die Erde schwarz ist. Das Kraut hat kleine gelbe Blüten.");
              await says(g, "hilda", "Aber die Wölfe, Junge. Bleib am Rand, auf der rechten Seite. Dort, wo die Sonne untergeht, haben sie keinen Hunger.");
              g.set("c1_kraut_bekannt", true);
            },
          },
          {
            text: "Ich habe das Fieberkraut gefunden.",
            show: () => g.has("fieberkraut") && !F(g, "c1_hilda_belohnt"),
            run: () => hildaKraut(g),
          },
          {
            text: "Was könnt Ihr mir über Aschenfurt erzählen?",
            run: async () => {
              await says(g, "hilda", "Früher gab es hier einen Markt, Musik und Mädchen. Jetzt gibt es einen Galgen, einen Karren und Brandt.");
              await says(g, "hilda", "Der Galgen ist am fleißigsten. Der Rabe darauf hat mehr Freunde als ich.");
            },
          },
          {
            text: "Kennt Ihr eine verschlossene Kiste?",
            run: async () => {
              await says(g, "hilda", "Die Kiste da unten gehörte meinem seligen Kunz. Er hat sie vor Jahren mit einem Eisenschlüssel zugesperrt.");
              await says(g, "hilda", "Den Schlüssel hat er beim Schmied verloren, als er betrunken war. Gero hat ihn bestimmt irgendwo verstaut, in einer Schublade, wo er niemanden stört.");
              await says(g, "hilda", "Drin liegen Brot und eine Wurst, für schlechte Zeiten. Die Zeiten sind schlecht genug. Nimm sie, wenn du kannst. Er braucht sie nicht mehr.");
              g.set("c1_kiste_bekannt", true);
            },
          },
          {
            text: "Was ist mit dem Leichenkarren?",
            run: async () => {
              await says(g, "hilda", "Der arme Bertold. Fuhrmann, immer pünktlich. Nur diesmal zu pünktlich.");
              await says(g, "hilda", "Keiner deckt ihn zu. Ich würde es tun, aber meine Knie... Wenn du Anstand hast, Junge, hilf ihm. Die Toten merken sich so etwas.");
            },
          },
          {
            text: "Kennt Ihr den Ritter Halvard?",
            run: async () => {
              await says(g, "hilda", "Ser Halvard? Er hat vor Jahren meinem Kunz ein Fass Bier ausgegeben. Seitdem bete ich für ihn.");
              await says(g, "hilda", "Wenn er am Waldrand liegt, brauchen ihn die Wölfe nicht. Aber Wasser, Wasser braucht er bestimmt. Brunnenwasser, nicht das Zeug aus der Regentonne.");
            },
          },
          bye("Geh mit Gott, Kind. Oder wenigstens mit Fieberkraut.", "hilda", g, "Ich suche das Kraut."),
        ]);
      },
    }),

    /* ---------------------------------------------------------- the gallows with the raven */
    {
      id: "galgen",
      name: "Galgen",
      sprite: (g) => (F(g, "galgen_leer") ? "galgen_leer" : "galgen"),
      x: 425,
      y: 366,
      look: (g) =>
        F(g, "galgen_leer")
          ? "Der Galgen von Aschenfurt, jetzt ohne Strick. Er sieht beleidigt aus."
          : "Der Galgen von Aschenfurt. Er hat öfter Arbeit als der Bäcker. Der Strick wippt leicht im Wind.",
      take: async (g) => {
        if (F(g, "galgen_leer")) return g.say("Hier hängt nichts mehr. Außer meiner Laune.");
        if (!F(g, "c1_rabe_gefuettert")) {
          g.sfx("wrong");
          await g.say("Ich greife nach dem Seil, da stürzt der Rabe herab und hackt nach meiner Hand.");
          await g.say("„Krah!“ heißt hier ganz klar: mein Seil, mein Galgen.");
          await g.say("Ich sollte ihn irgendwie ablenken. Raben sind bestechlich. Wie alle anderen auch.");
          return;
        }
        await g.pose("pick");
        g.sfx("pickup");
        g.set("galgen_leer", true);
        g.add("seil");
        await g.say("Ein gutes Seil. Der Henker wird es vermissen. Oder auch nicht.");
      },
      use: (g) => (F(g, "galgen_leer") ? "Ich probiere die Falltür. Sie ist in tadellosem Zustand. Wie beruhigend." : "Ich ziehe am Strick. Er hält. Wie die meisten Dinge in Aschenfurt, nur nicht die Hoffnung."),
      primary: "take",
    },
    npc({
      id: "rabe",
      name: "Rabe",
      x: 452,
      y: 164,
      scale: 1.5,
      frames: { idle: "rabe_idle", talk: "rabe_caw", flap: "rabe_flap" },
      hit: [420, 112, 66, 56],
      at: { x: 440, y: 380 },
      look: txt((g) =>
        F(g, "c1_rabe_gefuettert")
          ? "Der Rabe ist satt und sieht aus, als überlege er, ob er jetzt Mitleid haben sollte. Er entscheidet sich dagegen."
          : "Ein Rabe auf dem Galgen. Er mustert mich so, wie ein Henker einen Hals mustert."),
      take: "Ich greife nach dem Raben. Er greift nach meinem Finger. Wir einigen uns auf Abstand.",
      talk: async (g) => {
        await says(g, "rabe", "Krah.");
        if (!F(g, "c1_rabe_gefuettert")) {
          await hero(g, "Ich verstehe: Du willst etwas. Brot, vermute ich. Oder etwas Totes.");
          await says(g, "rabe", "Krah. Krah.");
          await hero(g, "Das war eindeutig ein Ja.");
        } else {
          await hero(g, "Danke für die Feder.");
          await says(g, "rabe", "Krah.");
          await hero(g, "Das war eindeutig ein „Gern geschehen“. Oder eine Drohung.");
        }
      },
      give: {
        brot_alt: async (g) => {
          if (F(g, "c1_rabe_gefuettert")) return g.say("Er ist satt. Selbst Raben haben ihre Grenzen. Nur Menschen nicht.");
          await rabeFuettern(g, "brot_alt", "Das Brot ist hart wie ein Pestkarren-Rad. Der Rabe hackt es genüsslich in Stücke.");
        },
        tote_ratte: async (g) => {
          if (F(g, "c1_rabe_gefuettert")) return g.say("Er ist satt. Die Ratte kann bleiben, wo sie ist. Ich ebenfalls.");
          await rabeFuettern(g, "tote_ratte", "Der Rabe stürzt sich auf die tote Ratte wie ein Bürgermeister auf Steuergelder.");
        },
        wurst: "Der Rabe wendet den Kopf ab. Er ist offenbar Feinschmecker. Räucherwurst hat er unter seiner Würde, Aas ist er gewohnt.",
        apfelrest: "Der Rabe stochert in dem Apfelrest herum und lässt ihn liegen. Würmer hat er selbst genug.",
      },
      useWith: {},
    }),

    /* ---------------------------------------------------------- the well */
    {
      id: "brunnen",
      name: "Brunnen",
      sprite: (g) => (wellRigged(g) ? "brunnen_seil" : "brunnen"),
      x: 605,
      y: 362,
      look: (g) =>
        wellRigged(g)
          ? "Der Brunnen, jetzt mit Seil an der Kurbel. Fehlt nur noch ein Eimer, der nicht davonläuft."
          : "Der Dorfbrunnen. Die Kurbel hängt ohne Seil, vom Eimer fehlt jede Spur. Jemand hat gründlich aufgeräumt, oder gründlich geplündert.",
      take: async (g) => {
        if (!wellRigged(g)) return g.say("Der Brunnen bleibt, wo er ist. Er hat Wurzeln.");
        g.set("c1_seil_am_brunnen", false);
        g.add("seil");
        g.sfx("pickup");
        await g.say("Ich wickle das Seil von der Kurbel. Es hat dem Brunnen nichts gebracht, vielleicht bringt es mir etwas.");
      },
      use: async (g) => {
        if (!wellRigged(g)) return g.say("Die Kurbel dreht sich leer im Kreis. Ein Brunnen ohne Seil ist nur ein tiefes Loch mit Meinung.");
        await g.say("Die Kurbel läuft, das Seil sinkt. Ohne Eimer ziehe ich nur nasses Hanfseil nach oben. Ich brauche etwas zum Schöpfen.");
      },
      useWith: {
        seil: async (g) => {
          if (wellRigged(g)) return g.say("Das Seil hängt schon an der Kurbel.");
          g.remove("seil");
          g.set("c1_seil_am_brunnen", true);
          g.sfx("creak");
          await g.pose("use", 500);
          await g.say("Ich knote das Seil fest an die Kurbel. Es hält. Mehr kann man von einem Seil nicht verlangen.");
        },
        eimer: async (g) => {
          if (!wellRigged(g)) return g.say("Ein Eimer ohne Seil im Brunnen? Der Eimer fällt hinunter, ich sehe ihn nie wieder.");
          await g.pose("use", 700);
          g.sfx("splash");
          g.remove("eimer");
          g.add("eimer_wasser");
          await g.say("Der Eimer taucht ein und kommt voll Wasser zurück. Es ist erstaunlich klar. Für Aschenfurt fast verdächtig.");
        },
        eimer_wasser: "Ich schütte das Wasser zurück? Da hätte ich es nie hochholen müssen.",
        flasche_leer: "Eine Flasche in den Brunnen tauchen? Das wäre nur Wasser. Für etwas Besonderes brauche ich das Weihwasserbecken in der Kapelle.",
      },
    },

    /* ---------------------------------------------------------- notice board */
    {
      id: "anschlagbrett",
      name: "Anschlagbrett",
      sprite: "anschlagbrett",
      x: 225,
      y: 350,
      look: async (g) => {
        g.set("c1_dekret_gelesen", true);
        await g.say("Das Anschlagbrett. Lauter Verordnungen, die niemand befolgt.");
        await g.say("„§1: Die Pest ist verboten. Zuwiderhandlungen werden mit dem Tod bestraft.“ Ich bin beeindruckt von der Logik.");
        await g.say("„§2: Wer stirbt, zahlt Leichensteuer. Hinterbliebene haften.“");
        await g.say("„§3: In jeder Sakristei des Reiches sind die Heiligen Zeichen mit Ehrfurcht zu betätigen:“");
        await g.say("„Zuerst der RABE, der wacht. Dann das LAMM, das duldet. Zuletzt das KREUZ, das erlöst.“");
        await g.say("Das klingt wichtig. Ich merke mir die Reihenfolge: Rabe, Lamm, Kreuz.");
        await g.say("„§4: Wer den Rabenorden begehrt, melde sich bei Feldwebel Brandt. Klinge, Segen und Bürge sind vorzuweisen.“ Und darunter: „§5: Nichts abreißen.“");
      },
      use: "Ich lese es noch einmal. Der Paragraf mit den Heiligen Zeichen ist der einzige, der aussieht, als meine er es ernst.",
      take: "Nicht abreißen. Das steht ausdrücklich da, und es ist der einzige Paragraf, den Brandt tatsächlich durchsetzt.",
    },

    /* ---------------------------------------------------------- pitch barrel */
    {
      id: "pechfass",
      name: "Pechfass",
      sprite: "pechfass",
      x: 742,
      y: 352,
      look: "Ein Fass voll zähem, schwarzem Pech. Man dichtet damit Dächer ab und, wenn man Pech hat, Särge.",
      take: "Mit bloßen Händen? Ich klebe dann bis Pfingsten an Aschenfurt fest. Ich brauche etwas zum Schöpfen.",
      use: "Das Pech blubbert zufrieden. Ich fasse es nicht an. Ich habe nur diese eine Hand, die ich noch brauche.",
      useWith: {
        holzstab: async (g) => {
          await g.pose("use", 600);
          g.remove("holzstab");
          g.add("fackel");
          g.sfx("pickup");
          await g.say("Ich tauche den Stab tief ins Pech. Fertig ist eine Fackel. Sie ist noch nicht angezündet.");
          await g.say("Mit Feuerstein oder an einer Flamme lässt sie sich entzünden.");
        },
        holzloeffel: async (g) => {
          if (g.has("pech") || F(g, "c1_pech_geholt")) return g.say("Ich habe schon genug Pech. Mehr ist Verschwendung.");
          g.set("c1_pech_geholt", true);
          g.add("pech");
          g.sfx("pickup");
          await g.say("Ich schöpfe einen Klumpen Pech mit dem Löffel. Der Löffel ist danach ein Mahnmal.");
        },
        zinnbecher: async (g) => {
          if (g.has("pech") || F(g, "c1_pech_geholt")) return g.say("Ich habe schon genug Pech. Mehr ist Verschwendung.");
          g.set("c1_pech_geholt", true);
          g.add("pech");
          g.sfx("pickup");
          await g.say("Ich schöpfe Pech in den Zinnbecher und kratze einen Klumpen heraus. Der Becher ist hinüber, aber er hatte ein erfülltes Leben.");
        },
      },
    },

    /* ---------------------------------------------------------- haystack */
    {
      id: "heuhaufen",
      name: "Heuhaufen",
      sprite: "heuhaufen",
      x: 140,
      y: 340,
      look: "Ein Heuhaufen. In jedem steckt angeblich eine Nadel. In diesem auch noch etwas anderes.",
      take: "Ich nehme eine Hand voll Heu. Nützlich für Pferde, die es hier nicht mehr gibt.",
      use: async (g) => {
        if (F(g, "taken_c1_stiefel")) return g.say("Ich wühle noch einmal. Nur Heu, Mäuse und die Erinnerung an bessere Zeiten.");
        g.set("taken_c1_stiefel", true);
        await g.pose("pick", 600);
        g.add("stiefel_alt");
        g.sfx("pickup");
        await g.say("Ich wühle bis zum Ellbogen... und ziehe einen alten Lederstiefel heraus. Nur einen.");
        await g.say("Wer verliert hier nur einen Stiefel? Und woher kommt der zweite Fuß? Besser, ich frage nicht.");
      },
    },

    /* ---------------------------------------------------------- the hearse cart (honor choice) */
    {
      id: "leichenkarren",
      name: "Leichenkarren",
      sprite: "leichenkarren",
      x: 345,
      y: 426,
      look: "Der Leichenkarren von Aschenfurt. Darauf liegt Bertold, der Fuhrmann, unter einem fadenscheinigen Tuch. Ein Zipfel von einem Geldbeutel schaut hervor.",
      take: (g) => karrenWahl(g),
      use: (g) => karrenWahl(g),
    },

    /* ---------------------------------------------------------- chest with lock */
    container({
      id: "kiste_dorf",
      name: "Kiste",
      x: 510,
      y: 408,
      sprites: { closed: "kiste_dorf", open: "kiste_dorf_offen" },
      contents: ["brot_alt", "wurst", "wuerfel", "apfelrest"],
      lock: { key: "eisenschluessel", text: "Mit einem Vorhängeschloss gesichert. Ein Eisenschlüssel wäre schön.", openText: "Das Schloss springt auf, als hätte es nur darauf gewartet." },
      look: txt((g) => (F(g, "unlocked_kiste_dorf") ? "Kunz' Kiste. Offen und erstaunlich bescheiden." : "Eine Kiste mit einem schweren Vorhängeschloss. Wem sie gehört, hat sie nicht mehr abgeholt.")),
    }),

    /* ---------------------------------------------------------- misc props */
    {
      id: "regentonne",
      name: "Regentonne",
      sprite: "regentonne",
      x: 790,
      y: 418,
      look: "Eine Regentonne mit grünem Wasser. Mückenlarven schwimmen darin wie kleine, unzufriedene Fische.",
      use: "Ich schaue hinein. Das Wasser schaut zurück und riecht nach Pestgrube. Das ist nichts zum Trinken, nicht einmal für Wölfe.",
      take: "Ich nehme eine Tonne Wasser mit? Ich bin Totengräber, kein Brunnenbauer.",
      useWith: {
        eimer: "Wasser aus der Regentonne? Das ist grün und lebt. Ich suche etwas Klareres, den Brunnen etwa.",
        eimer_wasser: "Ich schütte das gute Wasser in die schlechte Tonne? Das wäre eine Verschwendung wie eine Beichte bei Brandt.",
      },
    },
    {
      id: "wohnhaus_tuer",
      name: "Haustür",
      sprite: null,
      x: 321,
      y: 300,
      hit: [300, 248, 42, 56],
      at: { x: 321, y: 330 },
      look: "Eine verschlossene Haustür. Dahinter hört man Husten. Ich klopfe lieber nicht.",
      use: "Ich klopfe an. Von innen ruft jemand: „Wir sind alle tot! Kommt morgen wieder!“",
    },
    {
      id: "burg_fern",
      name: "Burg Grauwacht",
      sprite: null,
      x: 585,
      y: 120,
      hit: [524, 25, 120, 120],
      at: { x: 585, y: 345 },
      look: "Burg Grauwacht, hoch auf ihrem Felsen. Dort wohnt der König, und dort sitzt der Rabenorden. Weit weg, und doch zum Greifen nah.",
      use: "Ich winke der Burg zu. Sie winkt nicht zurück. Burgen sind so.",
    },
    {
      id: "wirtshausschild",
      name: "Wappenschild",
      sprite: null,
      x: 98,
      y: 165,
      hit: [78, 120, 40, 60],
      at: { x: 120, y: 330 },
      look: "Ein Wirtshausschild mit einem Löwen. Das Wirtshaus ist seit der Pest geschlossen. Der Löwe lächelt tapfer.",
    },
    {
      id: "kirchturm",
      name: "Glockenturm",
      sprite: null,
      x: 782,
      y: 130,
      hit: [754, 40, 56, 100],
      at: { x: 775, y: 335 },
      look: "Der Glockenturm. Die Glocke läutet nur noch bei Beerdigungen. Also ständig.",
    },

    /* ---------------------------------------------------------- items on the ground */
    groundItem({ id: "d_tonscherbe", item: "tonscherbe", x: 430, y: 418, say: "Eine Scherbe. Sie wird mich nicht reich machen." }),
    groundItem({ id: "d_nagel", item: "nagel", x: 460, y: 384, say: "Ein krummer Nagel, aus dem Galgengerüst gefallen. Nützlich für Särge, Schlösser und Fallen." }),
    groundItem({ id: "d_knochen", item: "knochen", x: 690, y: 420, say: "Ein abgenagter Knochen. Ob Hund oder Mensch, will ich nicht wissen." }),
  ] as Thing[],
};

/* ------------------------------------------------------------------ helpers */
async function hildaKraut(g: G) {
  if (F(g, "c1_hilda_belohnt")) return g.say("Hilda hat schon ihr Kraut. Mehr Fieber hat der Kleine nicht.");
  g.remove("fieberkraut");
  g.set("c1_hilda_belohnt", true);
  await says(g, "hilda", "Fieberkraut! Vom Waldrand! Du hast dich zu den Wölfen getraut, für ein altes Weib?");
  await says(g, "hilda", "Da, nimm das. Meine Brosche. Sie war meiner Mutter. Sie sagte immer: Ein Silber, das glänzt, ist ein Silber, das jemand liebt.");
  g.add("hildas_brosche");
  g.add("apfel");
  g.honor(1);
  g.sfx("coin");
  await g.say("Ich bekomme eine silberne Rosenbrosche. Und einen Apfel. Ein guter Tag für einen Totengräber.");
}

async function rabeFuettern(g: G, item: string, line: string) {
  g.remove(item);
  g.set("c1_rabe_gefuettert", true);
  g.frame("rabe", "flap");
  g.sfx("pickup");
  await g.say(line);
  await says(g, "rabe", "Krah!");
  g.add("rabenfeder");
  g.sfx("magic");
  g.frame("rabe", "idle");
  await g.say("Zum Dank zupft er sich eine schwarze Feder aus und lässt sie vor mir fallen. Eine Rabenfeder. Man sagt, sie bringt Unglück. Oder Tinte.");
  await g.say("Jetzt ist er mit dem Fressen beschäftigt. Das Seil am Galgen gehört mir, wenn ich will.");
}

async function karrenWahl(g: G) {
  await g.say("Bertold, der Fuhrmann, liegt unter einem fadenscheinigen Tuch. Das Tuch ist verrutscht. Der Geldbeutel an seinem Gürtel lockt.");
  const c = await g.choose(["Den Münzbeutel nehmen.", "Das Tuch zurechtlegen.", "Lieber die Finger davonlassen."]);
  if (c === 0) {
    if (F(g, "c1_beutel_genommen")) return g.say("Ich habe ihn schon genommen. Er brennt in meiner Tasche wie ein schlechtes Gewissen.");
    g.set("c1_beutel_genommen", true);
    g.add("muenzbeutel");
    g.honor(-1);
    g.sfx("coin");
    await g.say("Ich nehme den Beutel. Es ist Grabraub, kein Zweifel. Bertold hätte ihn mir wahrscheinlich geschenkt. Wahrscheinlich.");
    await g.say("In diesem Moment krächzt irgendwo ein Rabe. Ich fühle mich beobachtet. Von allen.");
  } else if (c === 1) {
    if (F(g, "c1_tuch_gelegt")) return g.say("Das Tuch liegt ordentlich. Bertold würde sich bedanken, wenn er könnte.");
    g.set("c1_tuch_gelegt", true);
    await g.pose("use", 700);
    g.honor(1);
    await g.say("Ich ziehe das Tuch gerade und streiche es glatt. „Ruhe in Frieden, Bertold. Und danke für die Fuhren.“");
    await g.say("Ein Windstoß hebt den Zipfel, als wollte er nicken. Vielleicht war es nur der Wind. Aber ich glaube es nicht.");
  } else {
    await g.say("Ich lasse die Finger davon. Manche Dinge sollte man den Toten lassen. Und den Würmern.");
  }
}
