import { hero, says } from "../dsl";
import type { ChapterModule, G, Reaction, SceneDef } from "../types";
import { dorfplatz } from "./ch1_dorf";
import { gruft } from "./ch1_gruft";
import { kapelle } from "./ch1_kapelle";
import { F, items as ch1Items, lightTorch, speakReturns } from "./ch1_shared";
import { schmiede } from "./ch1_schmiede";
import { waldrand } from "./ch1_wald";

/* =========================================================================
 * KAPITEL 1 — Der Rabeneid (Aschenfurt)
 * Drei Dinge: Klinge (Schmiede), Segen (Kapelle/Gruft), Bürge (Waldrand).
 * Hand-off: Brandt, wenn schwert + siegelbrief + halvard_brief -> Kapitel 2 (moorpfad).
 * ========================================================================= */

export const scenes: SceneDef[] = [dorfplatz, schmiede, kapelle, gruft, waldrand].map((s) => ({ ...s, things: s.things.map(speakReturns) }));
export const items = ch1Items;

export const combos: Record<string, Reaction> = {
  "holzstab+pech": async (g: G) => {
    g.remove("holzstab");
    g.remove("pech");
    g.add("fackel");
    g.sfx("pickup");
    await g.say("Ich knete das Pech um das Ende des Stabs. Eine Fackel. Noch kalt, aber voller Absicht.");
  },
  "fackel+feuerstein": async (g: G) => {
    await lightTorch(g, "Ich schlage Funken auf die Fackel. Das Pech fängt, zischt und brennt. Licht! Es reicht für ein paar Handgriffe.");
  },
  "nadel_zwirn+stiefel_alt": "Leder, Nadel, Zwirn. Daraus könnte man etwas flicken. Ein Loch im Blasebalg zum Beispiel.",
  "brot_alt+wurst": "Brot und Wurst. Das Mahl eines Armen und die Hoffnung eines Wolfs. Ich esse nichts davon, es wird noch gebraucht.",
  "rattenfalle+tote_ratte": "Die Ratte ist schon tot. Die Falle schnappt aus Prinzip zu. Es ist ein Missverständnis.",
  "eimer_wasser+flasche_leer": "Wasser in die Flasche gießen? Das wäre bloß Wasser. Für etwas Gesegnetes brauche ich das Weihwasserbecken.",
  "holzstab+kerzenwachs": "Wachs an einen Stab kleben? Das gäbe eine armselige Kerze. Ich brauche Pech.",
  "feuerstein+holzstab": "Funken auf einen Holzstab? Er brennt ab, und mit ihm mein Plan. Erst Pech dran.",
  "kreide+pergamentfetzen": "Ich kritzle „Sünden“ auf den Fetzen und streiche es durch. Es wird nicht besser.",
  "knochen+tote_ratte": "Ein Knochen und eine tote Ratte. Der Anfang einer Suppe, die ich nie kochen werde.",
};

export const start = {
  scene: "dorfplatz",
  x: 520,
  y: 400,
  facing: 1 as const,
  inv: [] as string[],
  flags: { chapter: 1 },
  intro: async (g: G) => {
    await g.card("Kapitel 1", "Der Rabeneid");
    await hero(g, "Aschenfurt. Dreck, Krähen und ein Galgen, der nie Urlaub hat.", "Heute ändere ich mein Leben. Heute werde ich Ritter.");
    await says(g, "brandt", "Du da! Totengräberjunge! Lungerst du wieder herum?");
    await hero(g, "Ich will zum Rabenorden, Feldwebel. Ich will Ritter werden.");
    await says(g, "brandt", "Ha! Du? Dann beweise es. Der Orden prüft nur, wer drei Dinge vorweist:");
    await says(g, "brandt", "Eine KLINGE. Einen SEGEN der Kirche. Und einen BÜRGEN aus den Reihen des Ordens.");
    await says(g, "brandt", "Bring mir alle drei, dann reden wir. Vorher störst du nur die Raben.");
    g.set("met_brandt", true);
    g.set("q_start", true);
    await hero(g, "Klinge, Segen, Bürge. Das klingt nach einem langen Tag.");
  },
};

/* ------------------------------------------------------------------ hints */
function waterHint(g: G): string | null {
  if (g.has("eimer_wasser")) return null;
  if (!g.has("eimer")) return "Ein Eimer liegt in der Schmiede. Damit könntest du am Brunnen Wasser holen.";
  if (!F(g, "c1_seil_am_brunnen")) {
    if (!g.has("seil")) {
      if (!F(g, "c1_rabe_gefuettert")) {
        if (!g.has("brot_alt") && !g.has("tote_ratte")) {
          if (!g.has("eisenschluessel") && !F(g, "unlocked_kiste_dorf")) return "Der Rabe am Galgen bewacht das Seil. Futter für ihn liegt in Kunz' Kiste auf dem Dorfplatz. Den Schlüssel dazu such in der Schmiede, im Werkzeugschrank.";
          if (!F(g, "unlocked_kiste_dorf")) return "Öffne Kunz' Kiste auf dem Dorfplatz mit dem Eisenschlüssel. Brot und Wurst liegen darin.";
          return "Nimm das Brot aus Kunz' Kiste (Kiste öffnen und herausnehmen) und füttere damit den Raben am Galgen.";
        }
        return "Gib dem Raben am Galgen etwas zu fressen, dann ist das Seil frei.";
      }
      return "Nimm jetzt das Seil vom Galgen auf dem Dorfplatz.";
    }
    return "Binde das Seil am Brunnen auf dem Dorfplatz an die Kurbel.";
  }
  return "Benutze den Eimer am Brunnen auf dem Dorfplatz, um Wasser zu holen.";
}

function lightHint(g: G): string | null {
  if (F(g, "c1_torch_lit") || F(g, "c1_halter_fackel")) return null;
  if (g.has("fackel")) return g.has("feuerstein") ? "Entzünde die Fackel: Feuerstein darauf benutzen, oder an einer Kerzenflamme in der Kapelle." : "Zum Anzünden fehlt dir Feuerstein. Er liegt im Werkzeugschrank der Schmiede.";
  if (!g.has("holzstab")) return "Du brauchst eine Fackel für die Gruft. Ein Holzstab liegt am Waldrand.";
  return "Tauche den Holzstab ins Pechfass auf dem Dorfplatz. Das gibt eine Fackel.";
}

export const hint = (g: G): string => {
  if (!F(g, "met_brandt")) return "Sprich mit Feldwebel Brandt auf dem Dorfplatz.";
  const all = g.has("schwert") && g.has("siegelbrief") && g.has("halvard_brief");
  if (all) return "Du hast Klinge, Segen und Bürgen. Zeige sie Feldwebel Brandt auf dem Dorfplatz.";

  // 1. the cabinet / the key to the crypt
  const needGruft = !g.has("schwert") && (!F(g, "c1_forge") || Number(g.flag("c1_forge")) < 4) || !g.has("siegelbrief");
  if (needGruft && !F(g, "c1_falltuer_offen")) {
    if (!g.has("gruftschluessel")) {
      if (!F(g, "c1_rune_offen")) {
        if (!F(g, "c1_dekret_gelesen")) return "Der Sakristeischrank in der Kapelle hat ein Runenschloss. Die richtige Reihenfolge steht irgendwo auf dem Dorfplatz geschrieben, auf dem Anschlagbrett.";
        return "Drücke die Runenknöpfe am Sakristeischrank in der Kapelle in der richtigen Reihenfolge: Rabe, Lamm, Kreuz.";
      }
      return "Nimm den Gruftschlüssel aus der oberen Schublade des Sakristeischranks.";
    }
    return "Öffne die Falltür in der Kapelle mit dem Gruftschlüssel.";
  }
  // 2. crypt supplies
  const inGruftNeeded = (!g.has("schwert") && Number(g.flag("c1_forge") ?? 0) < 4 && !g.has("klingenbruch")) || (!g.has("siegelbrief") && !g.has("reliquie"));
  if (inGruftNeeded) {
    const lh = lightHint(g);
    if (lh) return lh;
    if (!F(g, "c1_skelett_gebannt") && !g.has("siegelbrief") && !F(g, "taken_reliquie")) {
      if (!g.has("weihwasser")) {
        if (!g.has("flasche_leer")) return "Für den Skelettwächter brauchst du Weihwasser. Eine leere Flasche liegt in der unteren Schublade des Sakristeischranks.";
        if (!F(g, "c1_becken_voll")) return waterHint(g) ?? "Gieße das Wasser in das Weihwasserbecken in der Kapelle.";
        return "Fülle die leere Flasche am vollen Weihwasserbecken in der Kapelle.";
      }
    }
    if (!F(g, "c1_schrein_offen") && !g.has("siegelbrief")) return "Im Reliquienschrein der Gruft: die drei Steinplatten in der Reihenfolge Rabe, Lamm, Kreuz drücken. Vorher den Wächter mit Weihwasser besänftigen.";
    if (!g.has("reliquie") && !g.has("siegelbrief") && !F(g, "taken_reliquie")) return "Nimm die Reliquie aus dem Schrein. Den Wächter hast du besänftigt, hoffentlich.";
    if (!g.has("klingenbruch") && !g.has("schwert") && Number(g.flag("c1_forge") ?? 0) < 4) return "Auf einem Sarkophag in der Gruft liegt ein Klingenbruch. Gero in der Schmiede braucht ihn.";
  }
  if (g.has("reliquie") && !g.has("siegelbrief")) return "Bringe die Reliquie zu Pater Anselm in der Kapelle. Er siegelt dir den Segen.";

  // 3. the blade
  if (!g.has("schwert")) {
    const s = Number(g.flag("c1_forge") ?? 0);
    if (F(g, "c1_klinge_fertig")) return "Die Klinge liegt fertig auf der Werkbank. Gero will zwei Silber oder zehn Mal Blasebalg pumpen. Rede mit ihm.";
    if (s === 0) {
      if (!F(g, "unlocked_kohlekiste")) return g.has("kohlekiste_schluessel") ? "Öffne die Kohlekiste in der Schmiede mit dem kleinen Schlüssel." : "Der kleine Schlüssel zur Kohlekiste liegt im Werkzeugschrank der Schmiede.";
      return g.has("kohle") ? "Lege die Kohle in die Esse." : "Nimm die Kohle aus der Kohlekiste und lege sie in die Esse.";
    }
    if (s === 1) return g.has("feuerstein") ? "Zünde die Kohle in der Esse mit dem Feuerstein an." : "Feuerstein liegt im Werkzeugschrank der Schmiede, mittlere Schublade.";
    if (s === 2) {
      if (!F(g, "c1_blasebalg_heil")) {
        if (!g.has("stiefel_alt")) return "Der Blasebalg hat ein Loch. Du brauchst Leder: Ein alter Stiefel steckt im Heuhaufen auf dem Dorfplatz. Dazu Nadel und Zwirn aus dem Werkzeugschrank.";
        return g.has("nadel_zwirn") ? "Flicke den Blasebalg mit Stiefel und Nadel und Zwirn." : "Nadel und Zwirn liegen in der obersten Schublade des Werkzeugschranks.";
      }
      return "Pumpe den Blasebalg, bis die Esse weiß glüht.";
    }
    if (s === 3) return "Lege den Klingenbruch in die glühende Esse.";
    if (s === 4) return g.has("hammer") ? "Bearbeite den Amboss mit dem Hammer, vier Schläge." : "Nimm den Hammer von der Werkbank und schlage auf den Amboss.";
    if (s === 5) {
      if (!F(g, "c1_fass_voll")) return waterHint(g) ?? "Gieße das Wasser ins Löschfass der Schmiede. Optional: erst Weihwasser hinein.";
      return "Schrecke die Klinge im Löschfass ab. Wer Weihwasser hat, kann die Klinge segnen.";
    }
    if (s === 6) return "Schleife die Klinge am Schleifstein.";
  }

  // 4. the sponsor
  if (!g.has("halvard_brief")) {
    if (!F(g, "c1_wolves_weg")) {
      if (!F(g, "c1_falle_heil")) return g.has("nagel") ? "Repariere die Wolfsfalle am Waldrand mit dem Nagel." : "Am Waldrand lauern Wölfe. Die kaputte Falle braucht einen Nagel, einen findest du auf dem Dorfplatz.";
      if (!g.has("wurst")) {
        if (!F(g, "unlocked_kiste_dorf")) return g.has("eisenschluessel") ? "Öffne Kunz' Kiste auf dem Dorfplatz. Die Wurst darin ist der Köder für die Wölfe." : "Den Köder, eine Wurst, findest du in der Kiste auf dem Dorfplatz. Der Schlüssel liegt im Werkzeugschrank der Schmiede.";
        return "Nimm die Wurst aus Kunz' Kiste auf dem Dorfplatz, um die Wölfe am Waldrand zu ködern.";
      }
      return "Lege die Wurst als Köder in die gespannte Wolfsfalle am Waldrand.";
    }
    if (!F(g, "c1_halvard_wasser")) return waterHint(g) ?? "Gib Ser Halvard am Waldrand das Wasser.";
    return "Sprich mit Ser Halvard am Waldrand und bitte ihn um seine Bürgschaft.";
  }
  if (!g.has("siegelbrief")) return "Du brauchst noch den Segen von Pater Anselm in der Kapelle.";
  return "Zeige Feldwebel Brandt auf dem Dorfplatz deine drei Beweise.";
};

export default { scenes, items, combos, start, hint } satisfies ChapterModule;
