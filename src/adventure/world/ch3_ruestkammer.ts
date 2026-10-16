import { cabinet, container, edgeExit, groundItem } from "../dsl";
import type { G, SceneDef, Thing } from "../types";
import { spot, txt } from "./ch3_common";
import { GEO } from "./geometry";

const STAND = ["ruestungsstaender_leer", "ruestungsstaender_brust", "ruestungsstaender_helm", "ruestungsstaender_voll"];
const stand = (g: G) => Number(g.flag("c3_stand") ?? 0);

async function put(g: G, item: string, need: number, text: string) {
  if (stand(g) > need) return g.say("Das Teil sitzt schon. Doppelt hält nicht besser.");
  if (stand(g) < need) {
    if (need === 2) return g.say("Ein Helm auf einem nackten Gestell? Das sieht aus wie ein Vogelhäuschen. Erst den Brustpanzer.");
    return g.say("Die Armschienen brauchen etwas, woran sie hängen können. Erst Brustpanzer, dann Helm.");
  }
  g.sfx("clank"); await g.pose("use", 500);
  g.remove(item);
  g.set("c3_stand", need + 1);
  await g.say(text);
  if (need === 2) {
    g.set("c3_t_ruestung", true);
    g.sfx("fanfare");
    await g.say("Die Ordensrüstung steht komplett da. Sie ist leerer als der Ritter, der sie trägt. Aber sie glänzt.");
  }
}

export const ruestkammer: SceneDef = {
  id: "ruestkammer",
  title: "Rüstkammer",
  bg: "ruestkammer",
  walk: GEO.ruestkammer.walk,
  scale: GEO.ruestkammer.scale,
  ambient: "castle",
  fx: [{ kind: "dust", n: 0.5 }],
  things: [
    edgeExit("left", { id: "to_hof", name: "Zum Burghof", to: "burghof", x: 318, y: 355, facing: 1 }),

    { id: "ruestungsstaender", name: "Rüstungsständer", sprite: (g) => STAND[stand(g)], x: 560, y: 398, scale: 0.95, at: { x: 560, y: 420 }, primary: "use",
      look: txt((g) => ["Ein hölzerner Rüstungsständer. Er ist leer und wartet. Wie ein Wirt am Wochenende.", "Der Brustpanzer sitzt. Ohne Kopf sieht der Ständer aus wie ein Ritter nach der Schlacht.", "Brustpanzer und Helm. Es fehlt noch der Arm. Die Haltung ist verzweifelt.", "Der Ständer trägt die ganze Ordensrüstung. Ein Ritter, dem nur noch das Leben fehlt."][stand(g)]),
      take: "Der Ständer ist schwerer als ein Pferd. Und weniger kooperativ.",
      use: (g) => g.say(stand(g) === 3 ? "Die Rüstung steht. Ich sollte sie nicht anfassen. Roderic würde es merken." : "Ich zupfe am Ständer. Er zupft nicht zurück. Er braucht Stahl."),
      useWith: {
        brustpanzer: (g) => put(g, "brustpanzer", 0, "Der Brustpanzer rastet auf dem Holzkreuz ein. Es klingt wie ein Pfarrer, der den Segen vergisst."),
        helm: (g) => put(g, "helm", 1, "Der Helm landet oben auf dem Pfahl. Er sitzt schief, bis ich ihn richte. Ordnung ist Demut."),
        armschienen: (g) => put(g, "armschienen", 2, "Ich hänge die Armschienen an die Querstange. Klirr, klirr. Die Rüstung ist vollständig."),
        schild: "Ein Schild an den Ständer? Der Ständer hat keine Arme dafür. Das Schild braucht eine andere Aufgabe.",
        spiegelschild: "Das Spiegelschild gehört nicht an den Ständer. Ich brauche es noch.",
        sand: "Sand auf die Rüstung? Das macht sie nur stumpf. Besser den Schild bearbeiten.",
      } },
    ...cabinet({
      id: "kommode_r", name: "Kommode", sprites: ["kommode_wk_zu", "kommode_wk_oben", "kommode_wk_unten"], x: 705, y: 352, scale: 0.8, at: { x: 705, y: 380 },
      look: "Eine schwere Kommode aus Eichenholz. Zwei Schubladen. Die untere hat ein Schloss, das eine eigene Meinung hat.",
      drawers: [
        { hit: [0.06, 0.12, 0.88, 0.38], contents: ["helm", "messingknopf", "kamm"], name: "Obere Schublade" },
        { hit: [0.06, 0.55, 0.88, 0.38], contents: ["armschienen", "schild", "spindel"], name: "Untere Schublade", lock: { key: "eisenschluessel", text: "Verschlossen. Das Schloss sieht aus, als bräuchte es einen eisernen Schlüssel.", openText: "Der Schlüssel dreht sich. Die Schublade gleitet auf, wie von einem Trauerzug geschoben." } },
      ],
    }),
    container({ id: "truhe_r", name: "Waffentruhe", x: 215, y: 356, sprites: { closed: "truhe_waffe_zu", open: "truhe_waffe_offen" }, scale: 0.9, at: { x: 215, y: 384 },
      contents: ["brustpanzer", "schnalle", "zinnring"], title: "Waffentruhe",
      look: "Eine eisenbeschlagene Truhe. Der Deckel ist schwer, das Schloss aufgebrochen, die Hoffnung eingerostet.", emptyText: "Leer, bis auf Rostflocken." }),
    container({ id: "sandkiste_r", name: "Sandkiste", x: 400, y: 346, sprites: { closed: "sandkiste", open: "sandkiste" }, scale: 0.9, at: { x: 400, y: 378 }, contents: ["sand", "kerzenstummel"], title: "Sandkiste",
      look: "Eine Kiste voll feinem Sand. Hier poliert man Rüstungen. Oder gräbt man Schatzkarten.", emptyText: "Nur Staub, wo einmal Sand war." }),
    { id: "waffenstaender_r", name: "Waffenständer", sprite: "waffenstaender", x: 850, y: 354, scale: 0.85, at: { x: 850, y: 384 }, primary: "look",
      look: "Ein Ständer mit Speeren und Schwertern. Alles stumpf, verrostet und zum Üben. So wie ich.",
      take: "Ich ziehe an einem Schwert. Es steckt fest. Der Ständer hat mehr Willenskraft als ich.",
      useWith: { schwert: "Ich lege mein Schwert dazu? Dann sieht es aus wie die anderen. Sie sind alle schlechter." } },
    { id: "kerzenstaender_r", name: "Kerzenständer", sprite: "kerzenstaender", x: 120, y: 410, scale: 0.7, look: "Ein Kerzenständer mit drei Stümpfen. Das Wachs ist so oft heruntergelaufen wie meine Hoffnung.", take: "Zu hoch, zu schwer, zu sinnlos.", at: { x: 150, y: 420 } },
    { id: "fahne_r", name: "Fahnenständer", sprite: "fahnenstaender", x: 905, y: 404, scale: 0.65, look: "Ein Raben-Banner am Ständer. Es hängt schlaff. Es wartet auf Wind oder Befehle.", at: { x: 880, y: 414 } },
    groundItem({ id: "c3_rk_nagel", item: "nagel", x: 330, y: 414, say: "Ein krummer Nagel. In einer Rüstkammer gibt es nie genug davon." }),
    groundItem({ id: "c3_rk_tonscherbe", item: "tonscherbe", x: 640, y: 424, say: "Eine Tonscherbe. Sie war mal ein Krug. Jetzt ist sie ein Zeuge." }),

    spot("rk_schwerter", "Schwertregal", [145, 160, 140, 135], "Ein Regal voller Schwerter. Alle stumpf, alle ordentlich, alle ohne Besitzer. Wie bei einem Begräbnis."),
    spot("rk_speere", "Speerregal", [318, 165, 95, 130], "Speere. Lang, spitz, unbeliebt bei Pferden."),
    spot("rk_hellebarden", "Hellebardenregal", [550, 170, 95, 125], "Hellebarden. Halb Axt, halb Speer, ganz Ausrede."),
    spot("rk_aexte", "Axtregal", [675, 165, 145, 120], "Äxte und Streitkolben. Der Orden liebt Werkzeuge, die keine Fragen stellen."),
    spot("rk_wappen", "Ordenswappen", [455, 148, 52, 72], "Das Wappen des Ordens: Lilie, Rabe, Schild. Alles, was man braucht, um Feinde zu verwirren."),
    spot("rk_fenster", "Fenster", [440, 0, 85, 130], "Ein hohes Fenster, hinter dem der Mond hängt. Er schaut zu und urteilt."),
    spot("rk_banner_l", "Banner", [10, 15, 55, 110], "Ein blaues Banner mit Löwe. Er blickt, als wüsste er, wer das Schwert vergessen hat."),
    spot("rk_banner_r", "Banner", [895, 20, 55, 100], "Ein rotes Banner. Es verrät nichts außer dem Geschmack der Ahnen."),
    spot("rk_tuer_r", "Dunkler Durchgang", [925, 150, 35, 150], "Ein Durchgang ins Dunkel. Er führt zu den Vorräten, sagt ein Schild. Es gibt keins. Ich ahne es nur."),
  ],
};
