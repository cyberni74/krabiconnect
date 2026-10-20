import { bye, cabinet, container, edgeExit, groundItem, hero, npc, says, talk } from "../dsl";
import type { G, SceneDef, Thing } from "../types";
import { GEO } from "./geometry";
import { F, N, lightTorch, txt } from "./ch1_shared";

/* =========================================================================
 * schmiede — Meister Gero, Klingenschmieden in erzwungener Reihenfolge
 * c1_forge: 0 kalt, 1 Kohle, 2 angezündet, 3 Glut (Blasebalg), 4 Klingenbruch glüht,
 *           5 Klinge geformt, 6 abgeschreckt, 7 geschliffen (Schwert liegt auf der Werkbank)
 * ========================================================================= */

const st = (g: G) => N(g, "c1_forge");
const gero = (g: G, ...l: string[]) => says(g, "gero", ...l);

async function pour(g: G) {
  g.remove("eimer_wasser");
  g.add("eimer");
}

async function pump(g: G) {
  if (!F(g, "c1_blasebalg_heil")) {
    g.sfx("wrong");
    return g.say("Der Blasebalg faucht, aber die Luft pfeift durch ein Loch in der Seite. Ein Windstoß für die Maus, keiner für die Esse. Das Loch muss zu: ein Stück Leder darüber, mit Nadel und Zwirn festnähen.");
  }
  const s = st(g);
  if (s < 2) return g.say("Luft in einen kalten Kamin? Nur Asche fliegt mir ins Gesicht. Zuerst muss etwas brennen.");
  if (s > 2) return g.say("Die Esse glüht schon weiß. Weiter mit dem Klingenbruch.");
  // one click = the whole forge pumping, so the player does not have to click three times
  for (let i = 0; i < 3; i++) {
    await g.pose("use", 350);
    g.sfx("fire");
  }
  g.set("c1_forge", 3);
  g.flash("#ff8030", 500);
  await g.say("Fffwuuuuusch! Die Esse glüht weiß wie ein Heiligenschein. Meine Augenbrauen sind kürzer als vorher.");
  await gero(g, "Na endlich. Jetzt hat sie Hitze. Leg den Klingenbruch hinein und lass ihn singen.");
}

async function hammerHit(g: G) {
  const s = st(g);
  if (!g.has("hammer")) return g.say("Mit der bloßen Faust? Der Amboss gewinnt immer.");
  if (s < 4) {
    g.sfx("clank");
    if (s === 0) return g.say("Ich schlage auf den kalten Amboss. Es klingt nach Arbeit und fühlt sich nach Handgelenk an.");
    return g.say("Es gibt nichts zu schmieden. Erst muss das Eisen glühen. Auf kaltes Metall zu hauen bringt nur Funken in den Ohren.");
  }
  if (s > 4) return g.say("Die Klinge ist fertig geformt. Weitere Schläge machen sie nur schiefer.");
  if (!g.has("klingenbruch")) return g.say("Der Amboss wartet auf das Eisen. Ich habe nichts in der Hand, nur den Hammer.");
  await g.pose("swing", 600);
  g.sfx("hammer");
  const n = g.inc("c1_hits");
  const lines = ["Klong! Funken sprühen, die Klinge stöhnt.", "Klong! Das Eisen beginnt, die Form eines Schwerts anzunehmen.", "Klong! Die Schneide wird gerade. Mein Arm weniger.", "Klong! Der letzte Schlag. Die Klinge liegt da wie ein Gedanke, der endlich zu Ende gedacht ist."];
  await g.say(lines[Math.min(n, 4) - 1]);
  if (n >= 4) {
    g.set("c1_forge", 5);
    await gero(g, "Nicht schön, aber sie wird halten. Jetzt ab ins Wasser, bevor sie es sich anders überlegt.");
  }
}

async function quench(g: G) {
  const s = st(g);
  if (s < 5) return g.say("Das Fass ist voller Wasser und voller Möglichkeiten. Im Moment habe ich nichts, was sich löschen ließe.");
  if (s > 5) return g.say("Die Klinge ist längst abgeschreckt. Nochmal baden hilft ihr nicht.");
  if (!F(g, "c1_fass_voll")) {
    g.sfx("wrong");
    return gero(g, "Halt! Das Fass ist leer! Wasser her, du Hornochse, sonst reißt dir die Klinge!");
  }
  await g.pose("use", 600);
  g.sfx("splash");
  g.set("c1_forge", 6);
  if (F(g, "c1_gesegnet")) await g.say("Zzzzischhh! Das Wasser singt, ein goldener Dampf steigt auf. Mir wird ganz fromm zumute.");
  else await g.say("Zzzzischhh! Dampf, Zischen, Triumph. Die Klinge ist abgeschreckt und dunkel wie ein Entschluss.");
  await gero(g, "Gut. Jetzt zum Schleifstein. Kurbeln, Junge, kurbeln!");
}

async function bless(g: G) {
  const s = st(g);
  if (F(g, "c1_gesegnet")) return g.say("Die Klinge ist schon gesegnet. Mehr Segen verträgt kein Schwert, nur ein Pfarrer.");
  if (s < 5 || s > 6) return g.say("Weihwasser auf ein Fass? Es gibt nichts, das ich segnen könnte. Außer meiner Schmiede, und die ist ein verlorener Fall.");
  if (!F(g, "c1_fass_voll")) return g.say("Das Fass ist trocken. Ich kippe Weihwasser doch nicht auf den Boden. Gero würde schreien. Der Pater auch.");
  g.remove("weihwasser");
  g.add("flasche_leer");
  g.set("c1_gesegnet", true);
  g.sfx("magic");
  g.flash("#cfe8ff", 600);
  await g.say("Ich kippe das Weihwasser ins Löschfass. Es perlt golden und riecht nach Stein und Kirche.");
  await gero(g, "Was zum... das ist Ketzerei! Das ist Verschwendung! ... Das ist, Moment, das ist ziemlich klug.");
  await gero(g, "Eine gesegnete Klinge. Die schlägt auch Dinge, die man mit Eisen nicht schlägt. Frag mich nicht, woher ich das weiß.");
}

const gero_talk = async (g: G) => {
  if (!F(g, "c1_met_gero")) {
    g.set("c1_met_gero", true);
    await gero(g, "Was willst du, Bursche? Kohle ist keine da, Eisen ist keins da, und die Laune ist auch aufgebraucht.");
    await hero(g, "Ich brauche ein Schwert. Ich will in den Rabenorden.");
    await gero(g, "Ha! Ein Totengräber. Ich habe schon Särge für größere Träume gezimmert.");
    await gero(g, "Hör zu. Ich kann seit dem Unfall keinen Hammer mehr heben. Aber ich weiß noch jeden Handgriff.");
    await gero(g, "Du schmiedest. Ich sage dir, was du tust. Dafür zwei Silber, oder du pumpst mir zehn Mal den Blasebalg, wenn es fertig ist. Abgemacht?");
    await hero(g, "Abgemacht.");
  }
  await talk(g, () => [
    {
      text: "Wie schmiedet man ein Schwert?",
      done: () => F(g, "have_blade"),
      run: async () => {
        const s = st(g);
        if (s === 0 && !F(g, "unlocked_kohlekiste")) await gero(g, "Zuerst Feuer. Kohle liegt in der Kohlekiste. Den Schlüssel dazu habe ich irgendwo in meinem Werkzeugschrank verstaut. Unten oder in der Mitte, such halt.");
        else if (s === 0) await gero(g, "Kohle in die Esse. Dann anzünden, dafür brauchst du Feuerstein und Schlageisen. Auch im Schrank.");
        else if (s === 1) await gero(g, "Angezündet muss sie werden. Feuerstein, Junge. Der liegt im Werkzeugschrank, wo auch sonst.");
        else if (s === 2 && !F(g, "c1_blasebalg_heil")) await gero(g, "Jetzt brauchst du Wind. Aber mein Blasebalg hat ein Loch. Flick es mit Leder und Zwirn. Ein alter Stiefel tut es. Irgendwo liegt immer einer im Heu.");
        else if (s === 2) await gero(g, "Pump den Blasebalg, dreimal mindestens, bis die Esse weiß glüht.");
        else if (s === 3) await gero(g, "Jetzt der Klingenbruch. Ich hatte mal einen, aber der liegt in der Gruft unter der Kapelle, bei den Toten. Frag nicht. Leg ihn in die Glut.");
        else if (s === 4) await gero(g, "Hammer, Amboss. Vier saubere Schläge. Der Hammer liegt auf der Werkbank. Wie kann man ihn übersehen?");
        else if (s === 5) await gero(g, "Ins Löschfass damit, aber das Fass braucht Wasser. Frisches, vom Brunnen. Die Klinge reißt sonst.");
        else if (s === 6) await gero(g, "Zum Schleifstein. Kurbeln, bis es funkt.");
        else await gero(g, "Fertig ist sie. Zahl mich oder pump mir den Blasebalg. Dann gehört sie dir.");
      },
    },
    {
      text: "Was kostet mich das?",
      done: () => F(g, "c1_gero_bezahlt"),
      run: async () => {
        await gero(g, "Zwei Silber, oder zehn Mal pumpen. Mir ist beides recht. Mein Rücken zieht das Pumpen vor, mein Magen das Silber.");
        await gero(g, "Wenn du Dreckiges anbietest, etwa einen Beutel vom Karren, sage ich nichts. Ich sehe nur, dass er schwer ist.");
      },
    },
    {
      text: "Wo ist Euer Klingenbruch?",
      show: () => st(g) >= 3 && !g.has("klingenbruch") && st(g) < 4,
      run: async () => {
        await gero(g, "Der alte Klingenbruch? In der Gruft unter der Kapelle, auf einem Sarkophag. Ein Ritter hat ihn dort liegen lassen, als er starb. Ich habe ihn nie zurückgeholt, weil ich Skelette nicht mag.");
        await gero(g, "Die Falltür hat einen Schlüssel. Pater Anselm hat ihn im Sakristeischrank eingeschlossen.");
      },
    },
    {
      text: "Habt Ihr etwas zur Gruft zu sagen?",
      run: async () => {
        await gero(g, "Die Gruft ist feucht, finster und voller Ritter, die sich nicht gern stören lassen. Nimm eine Fackel mit. Und etwas Weihwasser.");
        await gero(g, "Für die Fackel brauchst du einen Stab, etwas Pech und Feuerstein. Pech steht auf dem Dorfplatz im Fass, das schlägt alles Mögliche in den Boden.");
      },
    },
    {
      text: "Das Weihwasser: kann man damit etwas anfangen?",
      show: () => g.has("weihwasser") && !F(g, "c1_gesegnet"),
      run: async () => {
        await gero(g, "Weihwasser? Ins Löschfass gegossen, wenn die Klinge geformt ist? Das wäre... nun, nicht nützlich. Mäßig nützlich. Äußerst nützlich, wenn man Dinge jagt, die sich nicht gern erschlagen lassen.");
      },
    },
    {
      text: "Ich will bezahlen. Zwei Silber.",
      show: () => F(g, "c1_klinge_fertig") && !F(g, "c1_gero_bezahlt") && g.has("silber"),
      run: async () => {
        g.remove("silber");
        g.set("c1_gero_bezahlt", true);
        g.sfx("coin");
        await gero(g, "Zwei Silber. Gut. Dann gehört sie dir. Geh mir aus dem Licht, Ritterlein.");
      },
    },
    {
      text: "Nehmt diesen Beutel. (Münzbeutel)",
      show: () => F(g, "c1_klinge_fertig") && !F(g, "c1_gero_bezahlt") && g.has("muenzbeutel"),
      run: async () => {
        g.remove("muenzbeutel");
        g.set("c1_gero_bezahlt", true);
        g.sfx("coin");
        await gero(g, "Hm. Der Beutel vom Karren. Schweres Totengeld, kein Silber. Ich frage nicht.");
        await gero(g, "Ich rieche Erde daran. Na gut. Das reicht. Die Klinge gehört dir. Und geh mir aus den Augen.");
      },
    },
    {
      text: "Ich pumpe den Blasebalg zehn Mal.",
      show: () => F(g, "c1_klinge_fertig") && !F(g, "c1_gero_bezahlt") && F(g, "c1_blasebalg_heil"),
      run: async () => {
        await g.say("Ich nehme den Blasebalg und pumpe. Eins. Zwei. Drei.");
        await g.pose("use", 500);
        await g.say("Vier. Fünf. Sechs. Mein Rücken meldet Widerspruch an.");
        await g.pose("use", 500);
        await g.say("Sieben. Acht. Neun. Zehn.");
        await gero(g, "Sieh an, der Junge hat Rückgrat. Fast so viel wie ich früher. Die Klinge gehört dir.");
        g.set("c1_gero_bezahlt", true);
      },
    },
    {
      text: "Erzählt mir etwas über Aschenfurt.",
      run: async () => {
        await gero(g, "Aschenfurt war mal eine Stadt. Jetzt ist es ein Friedhof mit Gewerbe. Ich lebe vom Hufbeschlag und von Särgen, wenn Oswin keine Nägel hat.");
        await gero(g, "Die alte Hilda will immer, dass ich ihr Fieber heile. Ich bin Schmied, keine Hexe. Aber die Hexe im Moor, die kann es.");
      },
    },
    {
      text: "Habt Ihr noch Hinweise zur Kiste auf dem Dorfplatz?",
      done: () => F(g, "unlocked_kiste_dorf"),
      show: () => !!g.flag("c1_kiste_bekannt"),
      run: async () => {
        await gero(g, "Kunz' Kiste? Den Schlüssel dazu hat er mir damals im Suff gegeben. Ich habe ihn weggelegt. In die unterste Schublade, glaube ich, zu den toten Ratten und anderem Gerümpel.");
      },
    },
    bye("Wenn du das Schwert verhunzt, melde dich nie wieder.", "gero", g, "Auf Wiedersehen."),
  ]);
};

export const schmiede: SceneDef = {
  id: "schmiede",
  title: "Die Schmiede",
  bg: "schmiede",
  walk: GEO.schmiede.walk,
  scale: GEO.schmiede.scale,
  ambient: "forge",
  fx: [
    { kind: "embers", n: 0.9 },
    { kind: "smoke", area: [240, 120, 240, 120], n: 0.6 },
  ],
  things: [
    edgeExit("right", { id: "to_dorf", name: "Zum Dorfplatz", to: "dorfplatz", x: 110, y: 405, facing: 1, look: "Der Ausgang zum Dorfplatz. Draußen ist es kälter, aber weniger heiß für meine Augenbrauen." }),

    /* -------- Gero */
    npc({
      id: "gero",
      name: "Meister Gero",
      x: 705,
      y: 408,
      facing: -1,
      frames: { idle: "gero_idle", talk: "gero_talk" },
      look: "Meister Gero, der Schmied. Brummig, bärtig, mit Armen wie Brückenpfeiler, aber die Hand will nicht mehr.",
      talk: gero_talk,
      give: {
        silber: async (g) => {
          if (F(g, "c1_gero_bezahlt")) return gero(g, "Ich habe schon bekommen, was mir zusteht. Behalte dein Silber für schlechte Zeiten, also für immer.");
          if (!F(g, "c1_klinge_fertig")) return gero(g, "Erst die Arbeit, dann das Geld. Zuerst die Klinge, Junge.");
          g.remove("silber");
          g.set("c1_gero_bezahlt", true);
          g.sfx("coin");
          await gero(g, "Zwei Silber. Du bist ehrlicher als der Bürgermeister. Die Klinge ist dein.");
        },
        muenzbeutel: async (g) => {
          if (F(g, "c1_gero_bezahlt")) return gero(g, "Ich habe schon bekommen, was mir zusteht.");
          if (!F(g, "c1_klinge_fertig")) return gero(g, "Erst die Klinge, dann die Bezahlung, und frag nicht, woher der Beutel kommt.");
          g.remove("muenzbeutel");
          g.set("c1_gero_bezahlt", true);
          g.sfx("coin");
          await gero(g, "Totengeld. Ich nehme es und frage nicht. Die Klinge ist dein.");
        },
        hildas_brosche: "„Eine Brosche? Das ist ein Geschenk, Junge. Und Geschenke verkauft man nicht, auch nicht an Schmiede.“",
        wurst: "Gero riecht an der Wurst und seufzt. „Behalt sie. Ich habe einen Magen, der nur Zorn verdaut.“",
      },
    }),

    /* -------- the forge itself */
    {
      id: "esse",
      name: "Esse",
      sprite: (g) => ["esse_kalt", "esse_kohle", "esse_feuer", "esse_glut", "esse_glut", "esse_feuer", "esse_feuer", "esse_feuer"][Math.min(7, st(g))],
      x: 340,
      y: 330,
      scale: 1.3,
      at: { x: 340, y: 355 },
      look: (g) => {
        const s = st(g);
        if (s === 0) return "Die Esse, kalt wie Geros Humor. Ohne Brennstoff passiert hier nichts.";
        if (s === 1) return "Kohle liegt in der Esse. Es fehlt ein Funke.";
        if (s === 2) return "Die Kohle brennt, aber nur gemütlich. Für Eisen braucht es Wind: den Blasebalg.";
        if (s === 3) return "Die Esse glüht weiß. Jetzt gehört ein Stück Eisen hinein.";
        if (s === 4) return "Der Klingenbruch glüht orange in der Glut. Zeit für den Amboss.";
        return "Die Esse brennt ruhig vor sich hin. Das Wichtigste ist erledigt.";
      },
      use: (g) => {
        const s = st(g);
        if (s === 0) return "Ich halte die Hand hinein. Kalt. Ich bräuchte Brennstoff. Kohle, am besten.";
        if (s === 1) return "Ich puste hinein. Staub, kein Feuer. Ich brauche Feuerstein.";
        if (s === 2) return "Es brennt. Aber die Glut ist träge. Mit dem Blasebalg wird sie heiß.";
        if (s === 3) return "Weißglut. Ich lege besser etwas Brauchbares hinein, bevor sie sich langweilt.";
        if (s === 4) return "Das Eisen glüht. Der Amboss wartet. Der Hammer auch.";
        return "Die Esse ist zufrieden. Ich lasse sie.";
      },
      take: "Eine ganze Esse? Selbst Gero würde mich auslachen. Und der kann nicht lachen.",
      useWith: {
        kohle: async (g) => {
          if (st(g) >= 1) return g.say("Es liegt schon Kohle drin. Mehr würde die Esse nur beleidigen.");
          g.remove("kohle");
          g.set("c1_forge", 1);
          g.sfx("pickup");
          await g.pose("use", 500);
          await g.say("Ich lege die Kohle in die Esse. Schwarz auf schwarz, aber voller Hoffnung.");
        },
        feuerstein: async (g) => {
          const s = st(g);
          if (s === 0) return g.say("Ich schlage Funken, aber nichts fängt Feuer. Ich brauche etwas zum Brennen. Kohle.");
          if (s >= 2) return g.say("Sie brennt doch schon. Funken sparen, Junge.");
          g.set("c1_forge", 2);
          g.sfx("fire");
          await g.pose("use", 500);
          await g.say("Klick. Klick. Funke. Die Kohle fängt, glimmt und faucht. Aschenfurt hat ein Feuer mehr, immerhin eins, das nicht von der Pest kommt.");
          await gero(g, "Gut. Aber das ist nur ein Kamin. Für Stahl braucht es Wind: Der Blasebalg hat leider ein Loch.");
        },
        fackel: async (g) => {
          if (st(g) < 2) return g.say("Die Esse ist noch kalt. Wie soll ich da meine Fackel anzünden?");
          await lightTorch(g, "Ich halte die Fackel in die Glut. Sie fängt sofort. Das Licht tanzt über die Wände.");
        },
        klingenbruch: async (g) => {
          const s = st(g);
          if (s < 3) {
            g.sfx("wrong");
            return gero(g, "Halt! Den Bruch in eine lauwarme Esse? Das gibt Pfusch! Erst Weißglut, du Dummkopf.");
          }
          if (s > 3) return g.say("Der Klingenbruch glüht schon in meiner Hand. Ich habe keinen zweiten.");
          g.set("c1_forge", 4);
          g.sfx("clank");
          await g.pose("use", 500);
          await g.say("Ich halte den rostigen Klingenbruch in die Glut und lasse ihn nicht los. Der Rost fällt ab wie schlechte Gewissen.");
          await g.say("Das Eisen wird rot, orange und dann gelb. Ich warte, bis es singt.");
          await gero(g, "Gut so. Jetzt zum Amboss, solange es glüht. Hammer ist auf der Werkbank.");
        },
        eimer_wasser: "Die Esse löschen? Gero würde mich löschen. Und das Feuer wäre dann wohl das kleinere Problem.",
        weihwasser: "Weihwasser auf die Esse? Ein Zischen, eine Wolke, und Gero schnaubt. Das hebe ich mir lieber auf.",
        schwert: "Das Schwert ist schon fertig. Zurück in die Glut? Dann fängt Gero von vorn an.",
        holzstab: "Ich halte den Holzstab in die Glut. Er brennt ab wie meine Geduld. Besser nicht.",
      },
    },
    {
      id: "blasebalg",
      name: "Blasebalg",
      sprite: (g) => (F(g, "c1_blasebalg_heil") ? "blasebalg_heil" : "blasebalg_kaputt"),
      x: 448,
      y: 352,
      look: (g) => (F(g, "c1_blasebalg_heil") ? "Der Blasebalg, notdürftig mit Stiefelleder geflickt. Er hält. Meistens." : "Ein riesiger Blasebalg mit einem Loch von der Größe einer Faust. Ein Stück Leder darüber, mit Nadel und Zwirn festgenäht, und er hält. Benutze Stiefel oder Nadel und Zwirn darauf."),
      take: "Zu schwer, zu groß, zu festgenagelt.",
      use: (g) => pump(g),
      useWith: {
        stiefel_alt: async (g) => {
          if (F(g, "c1_blasebalg_heil")) return g.say("Der Blasebalg ist schon geflickt.");
          if (!g.has("nadel_zwirn")) return g.say("Das Leder passt. Aber womit nähe ich es fest? Ich brauche Nadel und Zwirn.");
          await flickBlasebalg(g);
        },
        nadel_zwirn: async (g) => {
          if (F(g, "c1_blasebalg_heil")) return g.say("Der Blasebalg ist schon geflickt.");
          if (!g.has("stiefel_alt")) return g.say("Nadel und Zwirn habe ich. Aber wo ist das Leder? Ein Flicken aus Luft hält nicht.");
          await flickBlasebalg(g);
        },
        schwert: "Mit dem Schwert in den Blasebalg stechen? Das Loch ist schon groß genug.",
      },
    },
    {
      id: "amboss",
      name: "Amboss",
      sprite: "amboss",
      x: 365,
      y: 405,
      look: (g) => (st(g) === 4 ? "Der Amboss, bereit für glühendes Eisen und kräftige Arme." : "Ein Amboss, schwer wie ein schlechtes Gewissen. Er hat mehr Schläge hinter sich als ich Mahlzeiten."),
      take: "Der Amboss rührt sich nicht. Er ist ein Amboss. Nehmen ist nicht sein Beruf.",
      use: (g) => hammerHit(g),
      useWith: {
        hammer: (g) => hammerHit(g),
        klingenbruch: (g) => (st(g) >= 4 ? hammerHit(g) : g.say("Den Klingenbruch kalt auf den Amboss legen? Er bleibt, was er ist: Schrott. Erst muss er glühen.")),
      },
    },
    {
      id: "loeschfass",
      name: "Löschfass",
      sprite: "loeschfass",
      x: 218,
      y: 350,
      look: (g) => (F(g, "c1_fass_voll") ? "Das Löschfass, bis zum Rand voll mit klarem Wasser. Ein stilles, gefährliches Bad." : "Das Löschfass. Ein feuchter Rest am Boden, mehr nicht. Gero hat seit Wochen kein Wasser mehr geschleppt."),
      take: "Es ist ein Fass. Es ist voll oder leer, und trotzdem viel zu schwer.",
      use: (g) => g.say(g.has("klingenbruch") ? "Die Klinge muss ins Wasser. Benutze sie mit dem Fass." : "Das Wasser ist still. Was soll ich hineinhalten?"),
      useWith: {
        eimer_wasser: async (g) => {
          if (F(g, "c1_fass_voll")) return g.say("Das Fass ist randvoll. Mehr Wasser macht es nur nass.");
          await g.pose("use", 600);
          g.sfx("splash");
          await pour(g);
          g.set("c1_fass_voll", true);
          await g.say("Ich kippe den Eimer ins Löschfass. Plätschern, Wellen, Zufriedenheit. Jetzt ist es bereit.");
        },
        eimer: "Der Eimer ist leer. Ein leerer Eimer in ein leeres Fass zu kippen, das ist Philosophie, aber kein Löschwasser.",
        weihwasser: (g) => bless(g),
        klingenbruch: (g) => quench(g),
        schwert: "Das Schwert ist schon abgeschreckt, oder noch gar nicht da. Ich lasse es im Trockenen.",
      },
    },
    {
      id: "schleifstein",
      name: "Schleifstein",
      sprite: "schleifstein",
      x: 130,
      y: 385,
      look: "Ein Schleifstein mit Kurbel. Er sieht aus wie ein Mühlstein, der Karriere in der Waffenindustrie gemacht hat.",
      take: "Der Stein wiegt mehr als ich. Ich lasse ihn arbeiten.",
      use: async (g) => {
        const s = st(g);
        if (s < 6) {
          if (s === 0) return g.say("Ich drehe die Kurbel. Der Stein kreischt nur vor Leere. Er will eine Klinge.");
          return g.say("Ohne fertige, abgeschreckte Klinge hat der Stein nichts zu schleifen.");
        }
        if (s >= 7) return g.say("Die Klinge ist fertig. Der Schleifstein ruht sich aus, der Faulpelz.");
        if (!g.has("klingenbruch")) return g.say("Die Klinge muss ich schon in der Hand halten, sonst schleife ich nur Luft.");
        await g.pose("use", 800);
        g.sfx("clank");
        await g.say("Ich drehe die Kurbel. Funken sprühen wie ein kleines Feuerwerk. Das Schwert wird immer schärfer.");
        g.remove("klingenbruch");
        g.sfx("magic");
        g.set("c1_forge", 7);
        g.set("c1_klinge_fertig", true);
        await g.say("Fertig. Mein Schwert liegt blank auf der Werkbank. Es ist nicht schön, aber ehrlich.");
        if (!F(g, "c1_gero_bezahlt")) await gero(g, "Nicht so schnell, Bursche! Erst die Bezahlung: zwei Silber oder zehn Mal pumpen, dann gehört sie dir.");
        else await gero(g, "Nimm sie, Junge. Aber lass sie nicht am Esel fallen.");
      },
    },

    /* -------- the sword on the bench */
    {
      id: "schwert_bank",
      name: "Schwert",
      sprite: "schwert",
      dir: "items",
      x: 620,
      y: 305,
      at: { x: 620, y: 345 },
      hidden: (g) => !F(g, "c1_klinge_fertig") || F(g, "taken_schwert_bank"),
      primary: "take",
      look: "Mein Schwert. Blank und schief wie mein Selbstvertrauen.",
      take: async (g) => {
        if (!F(g, "c1_gero_bezahlt")) {
          g.sfx("wrong");
          await gero(g, "Finger weg! Erst bezahlen. Zwei Silber oder zehn Mal Blasebalg.");
          return;
        }
        await g.pose("pick", 600);
        g.sfx("fanfare");
        g.add("schwert");
        g.set("taken_schwert_bank", true);
        g.set("have_blade", true);
        await g.say("Ich nehme das Schwert. Es liegt gut in der Hand. Der erste Schritt zum Ritter ist getan.");
      },
    },

    /* -------- bench with the hammer */
    {
      id: "werkbank",
      name: "Werkbank",
      sprite: "werkbank",
      x: 620,
      y: 345,
      at: { x: 620, y: 372 },
      look: "Eine breite Werkbank mit Brandflecken und Messerspuren. Hier liegt alles, was ein Schmied braucht, und einiges, was er nicht braucht.",
      use: "Ich wische mit der Hand über das Holz. Staub, Rußflecken, ein vergessener Nagel. Nichts, was mir hilft.",
      take: "Die Werkbank bleibt, wo sie ist. Sie ist die Einzige in Aschenfurt, die noch Arbeit hat.",
    },
    groundItem({ id: "s_hammer", item: "hammer", x: 580, y: 306, at: { x: 590, y: 372 }, say: "Ein schwerer Schmiedehammer. Er ist glatt vom Schweiß unzähliger Hände. Gero beobachtet mich.", guard: (g) => (F(g, "c1_met_gero") ? null : "Ich sollte erst mit dem Schmied reden, bevor ich seine Werkzeuge einsacke.") }),

    /* -------- cabinet of drawers */
    ...cabinet({
      id: "schrank",
      name: "Werkzeugschrank",
      sprites: ["werkzeugschrank_zu", "werkzeugschrank_s1", "werkzeugschrank_s2", "werkzeugschrank_s3"],
      x: 760,
      y: 380,
      at: { x: 760, y: 400 },
      drawers: [
        { hit: [0.08, 0.1, 0.84, 0.25], contents: ["nadel_zwirn", "kreide", "zinnbecher"], look: "Die oberste Schublade. Sie klemmt ein bisschen, aber sie gibt nach." },
        { hit: [0.08, 0.38, 0.84, 0.25], contents: ["feuerstein", "kohlekiste_schluessel", "rattenfalle"], look: "Die mittlere Schublade. Sie riecht nach Öl und Schicksal." },
        { hit: [0.08, 0.66, 0.84, 0.25], contents: ["eisenschluessel", "tote_ratte", "messingknopf"], look: "Die unterste Schublade. Ein Rattennest, das sich als Schublade tarnt." },
      ],
      look: "Ein großer Werkzeugschrank mit drei Schubladen. Gero sagt, es herrsche eine Ordnung. Die Ordnung ist das Chaos.",
    }),

    /* -------- chest with coal */
    container({
      id: "kohlekiste",
      name: "Kohlekiste",
      x: 200,
      y: 412,
      sprites: { closed: "kohlekiste", open: "kohlekiste_offen" },
      contents: ["kohle"],
      lock: { key: "kohlekiste_schluessel", text: "Die Kohlekiste ist abgeschlossen. Gero ist geizig, selbst mit Kohle.", openText: "Das kleine Schloss klickt. Dunkel und bereit." },
      emptyText: "Leer. Nur ein bisschen Kohlenstaub und das Echo meiner Hoffnung.",
      look: txt((g) => (F(g, "unlocked_kohlekiste") ? "Die Kohlekiste, offen. Es liegen drei Klumpen darin. Mehr gibt es nicht." : "Eine verschlossene Kohlekiste. Mit einem kleinen Schloss gesichert. Kohle ist hier kostbarer als Gold.")),
    }),
    {
      ...(container({
        id: "lumpenkorb",
        name: "Lumpenkorb",
        x: 470,
        y: 436,
        sprites: { closed: "lumpenkorb", open: "lumpenkorb" },
        contents: ["holzloeffel", "spindel"],
        look: "Ein Korb voller Lumpen. Geros Wäsche, Geros Verbandszeug und Geros Geheimnisse.",
      }) as Thing),
    },
    {
      id: "kohlesack",
      name: "Kohlesack",
      sprite: "kohlesack",
      x: 90,
      y: 335,
      look: "Ein halb leerer Kohlesack. Er ist zu leer für die Esse und zu voll von Spinnweben.",
      use: "Ich schüttle den Sack. Eine Schabe flieht, sonst nichts.",
      take: "Ein leerer Sack. Ich habe schon genug Last im Leben.",
    },
    {
      id: "strohlager",
      name: "Geros Strohlager",
      sprite: "strohlager",
      x: 760,
      y: 430,
      hit: [725, 400, 70, 32],
      look: "Geros Lager aus Stroh. Er schläft neben der Esse, damit er nicht auskühlt. Oder damit er nie zu weit von der Arbeit weg ist.",
      use: "Ich lege mich kurz hin. Das Stroh pikst. Ich stehe auf. Das Leben ist nichts für Weichlinge.",
    },
    {
      id: "weinfass",
      name: "Weinfass",
      sprite: "weinfass",
      x: 855,
      y: 352,
      look: "Ein kleines Weinfass, mit Kreide beschriftet: „Nur für Notfälle.“ Es ist leer. Die Notfälle waren zahlreich.",
      use: "Ich klopfe an das Fass. Es hallt hohl. Gero hustet laut in meine Richtung.",
      take: "Gero würde mich erschlagen. Mit dem Fass. Wahrscheinlich leer.",
    },
    groundItem({ id: "s_eimer", item: "eimer", x: 262, y: 394, say: "Ein hölzerner Eimer. Er hat bessere Tage gesehen, aber noch nicht den schlechtesten.", at: { x: 275, y: 400 } }),

    /* -------- painted features as hotspots */
    { id: "fenster", name: "Fenster", sprite: null, x: 100, y: 200, hit: [55, 85, 90, 120], at: { x: 100, y: 330 }, look: "Ein vergittertes Fenster. Der Mond schaut herein wie ein neugieriger Henker." },
    { id: "ketten", name: "Ketten", sprite: null, x: 700, y: 150, hit: [670, 60, 80, 120], at: { x: 700, y: 340 }, look: "Schwere Ketten an einem Flaschenzug. Man hebt damit Eisen, Amboss, und gelegentlich Gero.", use: "Ich ziehe an den Ketten. Sie klirren und lösen eine Staubwolke aus. Weiter passiert nichts." },
    { id: "hufeisenwand", name: "Hufeisen", sprite: null, x: 570, y: 200, hit: [495, 130, 150, 110], at: { x: 570, y: 330 }, look: "Ein Dutzend Hufeisen an der Wand, alle abgenutzt. Ob sie Glück bringen? Den Pferden brachten sie jedenfalls keins.", take: "Hufeisen? Die hängen so fest, dass selbst Gero sie nicht mehr loskriegt." },
    { id: "kamin", name: "Kaminabzug", sprite: null, x: 340, y: 90, hit: [250, 0, 190, 110], at: { x: 340, y: 345 }, look: "Der gewaltige Rauchfang über der Esse. Irgendwo da oben wohnt der Schornsteinfeger. Er ist seit dem Frühjahr verschollen." },
  ] as Thing[],
};

async function flickBlasebalg(g: G) {
  g.remove("stiefel_alt");
  g.set("c1_blasebalg_heil", true);
  g.sfx("creak");
  await g.pose("use", 800);
  await g.say("Ich schneide eine Sohle aus dem Stiefel, lege sie über das Loch und nähe sie fest. Stich für Stich, wie ein Chirurg ohne Diplom.");
  await g.say("Der Blasebalg hält. Er wölbt sich stolz und faucht einmal zur Probe.");
  await gero(g, "Du hast tatsächlich zwei Hände. Gut gemacht, für einen Totengräber.");
}
