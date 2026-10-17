import { bye, container, decor, edgeExit, exitThing, groundItem, hero, npc, once, says, talk } from "../dsl";
import type { G, SceneDef, Thing } from "../types";
import { becherInhalt, spot, taskCount, txt } from "./ch3_common";
import { GEO } from "./geometry";

const roderic = (g: G) => !!g.flag("c3_roderic_met");

/** Eduard's bribe test (honor!). */
export async function eduardOffer(g: G) {
  g.set("c3_eduard_offered", true);
  await g.moveNpc("eduard", Math.max(60, Math.min(880, g.hero.x + 80)), Math.max(350, Math.min(425, g.hero.y)), 700);
  await says(g, "eduard", "Na, Totengräber. Du schuftest wie ein Esel. Dabei kann man das auch einfacher haben.");
  await says(g, "eduard", "Fünf Silberlinge, und du gibst Roderic gegenüber an, dass ICH deine Aufgaben erledigt habe. Und umgekehrt.");
  for (;;) {
    const i = await g.choose(["Nein danke. Ich verdiene mir meine Ritterehre selbst.", "Fünf Silberlinge? Her damit.", "Wie viel genau?"]);
    if (i === 2) {
      await says(g, "eduard", "Fünf. Sieben, wenn du dich beeilst. Mein Vater kauft auch Ehre. Im Dutzend billiger.");
      continue;
    }
    if (i === 0) {
      g.honor(1);
      g.set("c3_eduard_resolved", true);
      await says(g, "eduard", "Du bist ein Narr. Ein ehrlicher. Das ist noch schlimmer.");
      await hero(g, "Mein Bauch sagt ja. Mein Gewissen sagt nein. Mein Gewissen hat die lauteren Argumente.");
    } else {
      g.honor(-1);
      g.add("silber");
      g.set("c3_bribed", true);
      await says(g, "eduard", "Hübsch. Du bist ein Mann nach meinem Geschmack. Käuflich.");
      await hero(g, "Das Silber brennt in der Tasche. Ich fühle mich wie ein Dieb mit Genehmigung.");
    }
    return;
  }
}

async function completeDemut(g: G) {
  if (!g.flag("c3_eduard_offered")) {
    await says(g, "roderic", "Eine Sache noch. Die wichtigste. Du wirst gleich einen Besuch bekommen.");
    await eduardOffer(g);
    if (g.flag("c3_bribed")) {
      await says(g, "roderic", "Eduard grinst wie ein Fuchs im Hühnerstall. Hat er dir etwas gegeben?");
      await hero(g, "Silber. Ich hab es genommen. Es tut mir leid.");
      await says(g, "roderic", "Dann bring es ihm zurück. Demut heißt nicht, nie zu fallen, sondern aufzustehen.");
      return;
    }
  } else if (g.flag("c3_bribed")) {
    await says(g, "roderic", "Eduard sieht zufrieden aus. Du hast sein Silber, nicht wahr? Gib es zurück oder an die Armen, dann reden wir.");
    return;
  }
  g.set("c3_demut_done", true);
  await says(g, "roderic", "Pferd beschlagen, Rüstung gerichtet, Gefangene gespeist, Hof gefegt. Und das Silber stehen lassen.", "Das ist Demut. Du hast die erste Prüfung bestanden, Bran. Ich staune. Das tue ich selten.");
  await says(g, "roderic", "Nun zur Weisheit: Der Magier Myrddin im Bibliotheksturm, rechts hinten. Er prüft nicht mit dem Schwert. Das macht ihn gefährlicher.");
}

const status = (g: G, k: string, t: string) => `${g.flag(k) ? "[x]" : "[ ]"} ${t}`;

export const burghof: SceneDef = {
  id: "burghof",
  title: "Burghof von Grauwacht",
  bg: "burghof",
  walk: GEO.burghof.walk,
  scale: GEO.burghof.scale,
  ambient: "castle",
  fx: [{ kind: "dust", n: 0.6 }, { kind: "smoke", area: [690, 320, 80, 40], n: 0.5 }],
  enter: async (g: G) => {
    if (taskCount(g) >= 2 && !g.flag("c3_eduard_offered")) await eduardOffer(g);
  },
  things: [
    edgeExit("left", { id: "to_tor", name: "Zum Burgtor", to: "burgtor", x: 487, y: 375, facing: 1 }),
    exitThing([290, 232, 58, 100], { id: "to_ruest", name: "Rüstkammer", to: "ruestkammer", x: 120, y: 380, facing: 1, at: { x: 318, y: 350 }, guard: (g) => (roderic(g) ? null : "Die Rüstkammer ist abgeschlossen. Ich sollte zuerst den Ordensmeister begrüßen.") }),
    exitThing([490, 215, 140, 115], { id: "to_thron", name: "Zum Thronsaal", to: "thronsaal", x: 480, y: 395, facing: 1, at: { x: 560, y: 345 }, guard: (g) => (g.flag("c3_demut_done") ? null : "Die Palaswache kreuzt die Hellebarde: 'Audienz nur für Anwärter, die Demut bewiesen haben. Frag Ser Roderic.'") }),
    edgeExit("right", { id: "to_bibl", name: "Bibliotheksturm", to: "bibliothek", x: 880, y: 390, facing: -1, guard: (g) => (roderic(g) ? null : "Der Turm ist für Anwärter nach der Begrüßung des Ordensmeisters. Ich hole die zuerst.") }),

    // Luke
    { id: "kerkerluke", name: "Kerkerluke", sprite: (g) => (g.flag("c3_luke") ? "falltuer_offen" : "falltuer_zu"), x: 705, y: 424, scale: 0.8, at: { x: 705, y: 400 }, primary: "walk",
      look: "Eine Eisenluke im Hof. Darunter der Kerker. Von dort kommt ein Geruch, den kein Gärtner möchte.",
      take: "Die Luke ist größer als meine Zukunft.",
      exit: { to: "kerker", x: 120, y: 400, facing: 1, guard: (g) => { if (!roderic(g)) return "Der Kerker? Ich möchte erst den Ordensmeister fragen, ob das erlaubt ist."; g.set("c3_luke", true); return null; } } },

    // npcs
    npc({ id: "pferd", name: "Streitross Donnerhuf", x: 135, y: 352, scale: 0.88, frames: { idle: "pferd_idle", stamp: "pferd_stamp" },
      look: txt((g) => (g.flag("c3_t_pferd") ? "Donnerhuf mit vier gesunden Hufen. Er sieht sogar dankbar aus. Für ein Pferd." : "Ein Streitross mit drei Schuhen. Der vierte Huf scharrt unglücklich im Stroh.")),
      talk: async (g) => { await hero(g, g.flag("c3_t_pferd") ? "Na, Donnerhuf. Gute Hufe, schlechter Charakter?" : "Hallo, Donnerhuf. Ich bin nur ein harmloser Totengräber."); await g.say("Donnerhuf schnaubt. Er ist offenbar nicht für Konversation gezüchtet."); },
      give: {
        apfel: async (g) => {
          if (g.flag("c3_pferd_ruhig")) return g.say("Er hat seinen Apfel schon. Er schaut, als wolle er einen zweiten.");
          g.remove("apfel"); g.set("c3_pferd_ruhig", true);
          await g.say("Crunch. Donnerhuf wird weich wie Butter. Zumindest für einen Apfel lang.");
        },
        hufeisen: async (g) => {
          if (g.flag("c3_t_pferd")) return g.say("Er hat vier Schuhe. Sein Selbstwertgefühl ist wiederhergestellt.");
          if (!g.flag("c3_pferd_ruhig")) {
            g.frame("pferd", "stamp"); g.sfx("clank");
            await g.say("Ich nähere mich dem Huf. Donnerhuf tritt aus. Ich fliege durch die Luft und lande in einem Heuhaufen.");
            await g.say("Vielleicht erst mit etwas Süßem bestechen.");
            g.frame("pferd", "idle");
            return;
          }
          if (!g.has("hammer")) return g.say("Womit soll ich nageln? Mit der Faust? Ein Hammer wäre gut. Pip hat doch eine Werkbank.");
          if (!g.has("nagel")) return g.say("Ein Hufeisen ohne Nägel ist ein Schmuckstück. Ich brauche einen Nagel.");
          g.sfx("hammer"); await g.pose("use", 900); g.sfx("hammer");
          g.remove("hufeisen"); g.remove("nagel"); g.set("c3_t_pferd", true);
          await g.say("Klong, klong, klong. Donnerhuf steht auf vier Schuhen und prüft den Boden wie ein Adliger den Bodensatz.");
          await says(g, "pip", "Das hat noch niemand geschafft! Er hat dich nicht mal gebissen! Nimm das Seil, ich hab zwei.");
          g.add("seil");
        },
        nagel: "Das Pferd frisst keine Nägel. Dafür gibt es Hufschmiede.",
      } }),
    npc({ id: "pip", name: "Stallmeister Pip", x: 285, y: 376, frames: { idle: "pip_idle", talk: "pip_talk" },
      look: "Pip, der Stallmeister. Zwölf Jahre alt, zwei Zähne Lücke, das Selbstbewusstsein eines Bischofs.",
      talk: async (g) => {
        await once(g, "c3_met_pip", async () => { await says(g, "pip", "Neu hier? Ich bin Pip, der Stallmeister. Das sage ich, weil mir sonst keiner glaubt."); });
        await talk(g, () => [
          { text: "Was ist mit dem Pferd los?", done: () => !!g.flag("c3_t_pferd"), run: async () => { await says(g, "pip", "Donnerhuf hat sein Eisen verloren. Irgendwo im Stall, glaube ich. Vielleicht im Futtertrog.", "Aber er tritt. Er tritt jeden, der nicht nach Apfel riecht. Berta hat Äpfel."); } },
          { text: "Wo finde ich Werkzeug?", run: () => says(g, "pip", "Auf meiner Werkbank da vorn: Hammer, Nägel und anderes Zeug. Pass auf die Zange auf. Sie beißt.") },
          { text: "Wer ist Ser Eduard?", run: () => says(g, "pip", "Der Knappe, der immer den besten Platz in der Schlange hat. Er mag mich nicht. Ich mag ihn nicht. So sind wir Freunde.") },
          { text: "Hast du ein Seil?", show: () => !g.flag("c3_t_pferd"), run: () => says(g, "pip", "Klar. Aber nur für Leute, die dem Pferd helfen. Das ist die Regel. Meine Regel.") },
          { text: "Wie ist der Kanzler?", run: () => says(g, "pip", "Malvor? Der guckt, als würde er mir Karotten wegnehmen. Aber er riecht immer nach Wein. Er rührt selbst den Kelch des Königs.") },
          bye("Wenn du tritt kriegst, sag nicht, ich hätte dich gewarnt. Doch, sag es.", "pip", g, "Auf Wiedersehen."),
        ]);
      } }),
    npc({ id: "roderic", name: "Ser Roderic", x: 575, y: 376, frames: { idle: "roderic_idle", talk: "roderic_talk" },
      look: "Ser Roderic, Ordensmeister. Silberhaar, Raben auf dem Brustpanzer, und Augen, die schon alles gesehen und dann vergessen haben, warum.",
      talk: async (g) => {
        await once(g, "c3_roderic_met", async () => {
          await says(g, "roderic", "Du bist Bran aus Aschenfurt. Hauptmann Grimm hat mir einen Raben geschickt. Er schreibt, du seist 'hartnäckig, schmutzig und ehrlich'.");
          await hero(g, "Das trifft es. Mehr oder weniger.");
          await says(g, "roderic", "Der Orden kennt drei Eide: Demut, Weisheit, Mut. Mut wirst du am Vulkan zeigen. Aber das ist später.", "Heute: Demut und Weisheit. Fang mit der Demut an. Hier ist deine Liste.");
          await says(g, "roderic", "Erstens: Das Pferd Donnerhuf beschlagen. Zweitens: Die Ordensrüstung in der Rüstkammer herrichten. Drittens: Suppe zu den Gefangenen bringen.", "Viertens: Den Hof fegen. Und fünftens, aber das erfährst du von selbst.");
        });
        await talk(g, () => [
          { text: "Wie steht meine Aufgabenliste?", done: () => !!g.flag("c3_demut_done"), run: () => says(g, "roderic", status(g, "c3_t_pferd", "Donnerhuf beschlagen"), status(g, "c3_t_ruestung", "Ordensrüstung in der Rüstkammer richten"), status(g, "c3_t_suppe", "Suppe zu den Gefangenen bringen"), status(g, "c3_t_hof", "Hof fegen")) },
          { text: "Ich habe alle Aufgaben erledigt.", show: () => taskCount(g) === 4 && !g.flag("c3_demut_done"), run: async () => { await completeDemut(g); } },
          { text: "Was ist das für ein Orden?", run: () => says(g, "roderic", "Der Orden der Raben schützt die Schwachen, bewacht die Toten und verwaltet die Schulden der Lebenden.", "Meistens ist das Letzte das Anstrengendste.") },
          { text: "Wie geht es dem König?", run: async () => { await says(g, "roderic", "Schlecht. Schon seit Wochen. Die Ärzte sagen Fieber. Die Köchin sagt Schierling. Ich sage nichts, aus Gewohnheit.", "Der Kanzler lässt niemanden zu ihm außer sich selbst."); } },
          { text: "Wo ist Ser Aldric?", run: async () => { g.set("c3_met_roderic_aldric", true); await says(g, "roderic", "Aldric? Mein bester Mann. Vor Wochen zur Grenze gesandt, seither kein Wort. Der Kanzler sagt: gefallen.", "Ich sage: Aldric fällt nicht. Er stolpert höchstens, und das auch nur auf Befehl."); } },
          { text: "Wo kann ich suchen?", run: () => says(g, "roderic", "Der Burghof gehört dir. Rüstkammer links, Bibliothek rechts, Kerkerluke vorn. Der Thronsaal steht dir offen, wenn du demütig warst.") },
          { text: "Was soll ich in der Rüstkammer?", done: () => !!g.flag("c3_t_ruestung"), run: () => says(g, "roderic", "Der Rüstungsständer ist leer. Brustpanzer, Helm, Armschienen liegen irgendwo. Ordnung ist die Demut des Soldaten.", "Und poliere den alten Schild, wenn du schon da bist. Du wirst nicht oft einen Spiegel in der Hand haben.") },
          bye("Geh. Und schlafe nicht im Stehen. Das tun nur Pferde und Hauptleute.", "roderic", g, "Auf Wiedersehen."),
        ]);
      } }),
    npc({ id: "berta", name: "Köchin Berta", x: 700, y: 384, facing: -1, frames: { idle: "berta_idle", talk: "berta_talk" },
      look: "Köchin Berta, Löffel in der Hand, Fleck auf der Schürze. Man traut ihr die Pest nicht zu, aber das Kochen schon.",
      give: {
        holzloeffel: async (g) => {
          if (g.flag("c3_loeffel")) return says(g, "berta", "Mein Löffel! Zum zweiten Mal gefunden, zum zweiten Mal gerührt.");
          g.remove("holzloeffel"); g.set("c3_loeffel", true); g.honor(1);
          await says(g, "berta", "MEIN LÖFFEL! Der gute Löffel! Wo hast du den gefunden?", "Im Heukarren? Dieser Pip! Ich schlage ihn mit seinem eigenen Heu.");
          await says(g, "berta", "Hier. Ein Krug Wein, und Schlafkraut gegen die Albträume des Königs. Ich habe immer zu viel davon.");
          g.add("wein"); g.add("schlafkraut");
        },
        silber: async (g) => {
          if (!g.flag("c3_bribed")) return says(g, "berta", "Silber? Behalt es, du siehst aus, als bräuchtest du es.");
          g.remove("silber"); g.honor(1); g.set("c3_bribed", false); g.set("c3_eduard_resolved", true);
          await says(g, "berta", "Für die Armenspeise? Von Eduards Silber? Das schmeckt wie Gerechtigkeit mit Salz.");
          await hero(g, "Besser bei den Armen als in meiner Tasche.");
        },
      },
      talk: async (g) => {
        await once(g, "c3_met_berta", async () => { await says(g, "berta", "Ah, ein Neuer! Zu dünn. Setz dich nicht, ich habe nichts, was dich satt macht."); });
        await talk(g, () => [
          { text: "Roderic schickt mich. Suppe für die Gefangenen.", show: () => !g.flag("c3_berta_ok"), run: async () => { g.set("c3_berta_ok", true); await says(g, "berta", "Die armen Seelen im Keller! Nimm einen Becher und fülle ihn aus dem Kessel."); if (!g.has("zinnbecher")) { g.add("zinnbecher"); await says(g, "berta", "Hier, ein Becher. Verbeult, aber er hält. Wie ich."); } } },
          { text: "Habt Ihr einen Apfel für Donnerhuf?", show: () => !g.flag("c3_apfel"), run: async () => { g.set("c3_apfel", true); g.add("apfel"); await says(g, "berta", "Für dieses Biest? Einen. Und wenn er dich beißt, mir nicht die Schuld geben."); } },
          { text: "Habt Ihr noch einen Apfel?", show: () => !!g.flag("c3_apfel") && !g.has("apfel") && !g.flag("c3_pferd_ruhig"), run: async () => { g.add("apfel"); await says(g, "berta", "Du hast ihn verloren? Du bist wie mein Mann. Hier."); } },
          { text: "Ihr habt etwas verloren?", show: () => !g.flag("c3_loeffel"), run: async () => { await says(g, "berta", "Mein Rührlöffel! Seit dem Dienstag weg. Pip bestreitet alles. Das ist ein Geständnis.", "Der Kerl wohnt im Heu. Ich wette, er hat ihn zum Wenden benutzt."); } },
          { text: "Habt Ihr noch Wein?", show: () => !!g.flag("c3_loeffel") && !g.has("wein") && !g.flag("c3_knorr_asleep"), run: async () => { g.add("wein"); await says(g, "berta", "Schon wieder? Du trinkst für zwei. Hier."); } },
          { text: "Habt Ihr noch Schlafkraut?", show: () => !!g.flag("c3_loeffel") && !g.has("schlafkraut") && !g.flag("c3_wein_praep") && !g.flag("c3_knorr_asleep"), run: async () => { g.add("schlafkraut"); await says(g, "berta", "Da. Aber wenn du den König damit einschläferst, bin ich es nicht gewesen."); } },
          { text: "Wie geht's dem König?", run: async () => { await says(g, "berta", "Er isst nichts mehr. Er trinkt nur Wein, den der Kanzler selbst einschenkt. Jeden Abend.", "Das Fieber kommt immer gegen Mitternacht. Als hätte es einen Plan."); } },
          { text: "Was haltet Ihr vom Kanzler?", run: async () => { await says(g, "berta", "Ein Mann, der nie hungrig aussieht. Das ist verdächtig. Wer nicht isst, hat etwas anderes im Kopf."); } },
          { text: "Was ist mit Ser Eduard?", run: async () => { await says(g, "berta", "Der? Er isst alles, bezahlt nichts und lobt trotzdem nie. Wie ein Adliger."); } },
          bye("Iss was, Junge. Der Orden braucht Ritter, keine Gespenster.", "berta", g, "Auf Wiedersehen."),
        ]);
      } }),
    npc({ id: "eduard", name: "Ser Eduard", x: 480, y: 412, facing: 1, frames: { idle: "brandt_idle", talk: "brandt_talk" },
      look: "Ser Eduard, Knappe. Glänzende Stiefel, glänzende Zähne, glänzende Aussichten. Sein Vater hat Land und Meinungen.",
      give: {
        silber: async (g) => {
          if (!g.flag("c3_bribed")) return says(g, "eduard", "Silber? Du brauchst es dringender als ich. Das ist wahr, leider.");
          g.remove("silber"); g.honor(1); g.set("c3_bribed", false); g.set("c3_eduard_resolved", true);
          await says(g, "eduard", "Du gibst es zurück? Das Geschäft ist geplatzt? Wie unhöflich!");
          await hero(g, "Ein Geschäft, das ich nie hätte machen sollen.");
        },
      },
      talk: async (g) => {
        await once(g, "c3_met_eduard", async () => { await says(g, "eduard", "Du bist der Neue aus dem Dorf. Du riechst nach Erde. Das ist kein Vorwurf. Eher eine Beobachtung."); });
        await talk(g, () => [
          { text: "Wie kommt man hier zum Ritter?", run: () => says(g, "eduard", "Mit Beziehungen. Und mit Geld. Und notfalls mit Talent, aber das ist teuer.") },
          { text: "Was machst du hier?", run: () => says(g, "eduard", "Ich warte auf die Rüstung, die mir mein Vater schickt. Die alte hat einen Kratzer. Einen. Skandalös.") },
          { text: "Du hast mir was angeboten ...", show: () => !!g.flag("c3_eduard_offered") && !g.flag("c3_eduard_resolved") && !g.flag("c3_bribed"), run: async () => { await eduardOffer(g); } },
          { text: "Hast du die Aufgaben schon erledigt?", run: () => says(g, "eduard", "Ich? Wozu gibt es Knechte? Ich lasse arbeiten, das nennt man Führung.") },
          { text: "Was weißt du über den Kanzler?", run: () => says(g, "eduard", "Malvor? Der will Burggraf werden, schätze ich. Oder König. Aber wer will das nicht?") },
          bye("Kümmere dich nicht um mich, ich bin beschäftigt. Mit Nichtstun.", "eduard", g, "Auf Wiedersehen."),
        ]);
      } }),
    npc({ id: "palaswache", name: "Palaswache", x: 650, y: 352, frames: { idle: "wache_idle", talk: "wache_idle" },
      look: "Eine Wache am Fuß der Treppe. Sie steht seit Stunden so, dass die Sehnen knacken.",
      talk: async (g) => { await says(g, "palaswache", g.flag("c3_demut_done") ? "Ordensmeister Roderic hat dich angekündigt. Geh hinauf. Aber fass nichts an." : "Der Thronsaal ist nur für Anwärter, die Demut bewiesen haben. Frag Roderic. Nicht mich. Ich bin nur eine Treppe mit Beinen."); } }),

    // props
    { id: "uebungspuppe", name: "Übungspuppe", sprite: "uebungspuppe", x: 365, y: 368, scale: 0.9, at: { x: 365, y: 392 }, primary: "use",
      look: "Eine Strohpuppe mit Schild. Sie hat mehr Hiebe überlebt als ich Mahlzeiten.",
      use: "Ich boxe sie. Das Stroh lacht nicht, aber ich bin sicher, es denkt es sich.",
      useWith: { schwert: async (g) => {
        const n = g.inc("c3_hiebe");
        g.sfx("clank"); await g.pose("swing", 600);
        if (n < 3) await g.say(n === 1 ? "Ein Hieb. Die Puppe wackelt. Ich auch." : "Noch ein Hieb. Stroh fliegt. Ich habe Schwung.");
        else if (n === 3) { await g.say("Dritter Hieb. Ein Ding fällt aus dem Stroh. Die Puppe ist schwer beleidigt."); g.set("c3_puppe_auf", true); }
        else await g.say("Die Puppe hat sich ergeben. Ich auch, vor Müdigkeit.");
      } } },
    groundItem({ id: "c3_puppe_schnalle", item: "schnalle", x: 395, y: 400, hidden: (g) => !g.flag("c3_puppe_auf"), say: "Eine Gürtelschnalle aus der Puppe. Sie hat gekämpft und Schmuck behalten." }),
    { id: "suppenkessel", name: "Suppenkessel", sprite: "suppenkessel", x: 770, y: 384, scale: 0.85, at: { x: 770, y: 408 }, primary: "use",
      look: "Ein Kessel, in dem etwas brodelt. Es ist braun, riecht nach Kohl und Absicht.",
      use: "Ich rühre mit dem Finger? Nein. Berta würde mich mit dem Löffel erschlagen.",
      useWith: { zinnbecher: async (g) => {
        if (!g.flag("c3_berta_ok")) return says(g, "berta", "Finger weg vom Kessel! Wenn du Suppe willst, sag, wofür.");
        const w = becherInhalt(g);
        if (w === "suppe") return g.say("Der Becher ist voll. Suppe vom Feinsten. Fast.");
        if (w === "wein") return g.say("Wein in die Suppe? Das würde sie süß machen. Ich lasse es.");
        g.sfx("splash"); await g.pose("use", 500);
        g.set("c3_becher", "suppe");
        await g.say("Ich fülle den Becher. Die Suppe dampft, riecht nach Kohl und Resten. Ein Fest für Gefangene.");
      } } },
    { id: "brunnen", name: "Brunnen", sprite: "brunnen_burg", x: 850, y: 380, scale: 0.8, at: { x: 850, y: 404 }, primary: "use",
      look: "Der Burgbrunnen. Das Wasser ist kalt, tief und gesprächig. Das Echo antwortet höflicher als der Kanzler.",
      use: async (g) => { g.sfx("splash"); await g.say(g.inc("c3_trunk") > 1 ? "Ich trinke noch einmal. Es schmeckt nach Stein und Demut." : "Ich trinke einen Schluck. Das Wasser ist eiskalt und nach Stein schmeckt es."); },
      take: "Den Brunnen nehme ich nicht mit. Er hat Wurzeln.",
      useWith: { lappen: "Ich tauche den Lappen kurz ein. Er wird nass und gewinnt dadurch nicht an Würde.", eimer: "Ich habe keinen Eimer mehr. Der Brunnen schon." } },
    container({ id: "futtertrog", name: "Futtertrog", x: 215, y: 356, sprites: { closed: "futtertrog", open: "futtertrog" }, scale: 0.9, contents: ["hufeisen", "apfelrest", "knochen"], title: "Futtertrog", at: { x: 215, y: 392 },
      look: "Ein Trog mit altem Heu. Man erkennt etwas Rundes, Glänzendes darin. Oder ist das nur die Hoffnung?", emptyText: "Nur Heu und ein Mäuseskelett." }),
    container({ id: "werkbank_hof", name: "Werkbank", x: 405, y: 428, sprites: { closed: "werkbank", open: "werkbank" }, scale: 0.85, contents: ["hammer", "nagel", "eisenschluessel", "rostiger_dolch"], title: "Werkbank", at: { x: 405, y: 428 },
      look: "Pips Werkbank. Hammer, Zangen, Nägel und ein Schlüssel an einem Haken. Alles in einer Unordnung, die System hat.", emptyText: "Die Werkbank ist leer. Pip wird wütend." }),
    container({ id: "lumpenkorb", name: "Lumpenkorb", x: 330, y: 430, sprites: { closed: "lumpenkorb", open: "lumpenkorb" }, contents: ["lappen", "tote_ratte", "gaensefeder"], title: "Lumpenkorb", at: { x: 330, y: 430 },
      look: "Ein Korb voller Lumpen. Einer davon ist sauber. Das ist suspekt.", emptyText: "Nur noch Staub." }),
    container({ id: "heukarren", name: "Heukarren", x: 235, y: 424, sprites: { closed: "heukarren", open: "heukarren" }, scale: 0.55, contents: ["holzloeffel", "apfelrest", "kamm"], title: "Heukarren", at: { x: 235, y: 428 },
      look: "Ein Heukarren. Im Heu steckt eine Forke und sonst alles, was Pip verloren glaubt.", emptyText: "Nur Heu. Aber ich habe es gründlich durchwühlt." }),
    { id: "besen", name: "Besen", sprite: "besen", x: 640, y: 415, scale: 0.9, at: { x: 625, y: 424 }, primary: "use",
      look: "Ein Besen aus Reisig. Er wartet darauf, jemanden zu demütigen. Heute: mich.",
      use: async (g) => {
        if (g.flag("c3_t_hof")) return g.say("Der Hof ist gefegt. Er sieht aus, als hätte ihn nie jemand betreten.");
        const n = g.inc("c3_fegen");
        g.sfx("creak"); await g.pose("use", 500);
        if (n < 3) await g.say(n === 1 ? "Ich fege den Hof. Staub, Stroh, Stolz." : "Noch eine Ecke. Der Hof ist größer, als er aussieht.");
        else { g.set("c3_t_hof", true); await g.say("Fertig. Im Staub lag ein Holzkreuz. Der Orden hat auch Dinge, die er nicht vermisst."); }
      },
      take: "Der Besen bleibt hier. Ich will den Hof nicht im Stich lassen." },
    groundItem({ id: "c3_hof_kreuz", item: "kreuzanhaenger", x: 560, y: 426, hidden: (g) => !g.flag("c3_t_hof"), say: "Ein Holzkreuz vom Boden. Gefunden beim Fegen. Auch Demut wirft Beute ab." }),
    groundItem({ id: "c3_hof_pilz", item: "pilz", x: 870, y: 424, say: "Ein Fliegenpilz am Brunnenrand. Hübsch und tödlich, wie der Hof." }),

    // painted things
    spot("hof_stall", "Stall", [15, 245, 150, 90], "Der Stall. Dunkel, warm, voller Heu und schlechter Laune."),
    spot("hof_turm", "Bibliotheksturm", [740, 190, 145, 140], "Der Turm der Bibliothek. Fenster, in denen nachts Licht brennt, das nicht von Kerzen kommt.", { at: { x: 800, y: 405 } }),
    spot("hof_palas", "Palas", [525, 100, 90, 110], "Das Portal des Palas. Dahinter der Thronsaal und ein König, der nicht mehr aufsteht."),
    spot("hof_banner_l", "Banner", [205, 205, 40, 95], "Ein blaues Banner mit Raben. Offensichtlich lieben sie ihn hier."),
    spot("hof_banner_r", "Banner", [680, 130, 45, 70], "Noch ein Banner. Es hängt schief, damit man merkt, dass es echt ist."),
  ],
};
