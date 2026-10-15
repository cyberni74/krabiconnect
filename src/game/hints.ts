import type { G } from "./types";
import { learned } from "./story";

/** One contextual nudge for the current story state. */
export function hint(g: G): string {
  const ch = g.flag("chapter");
  if (ch === 3) return hintCh3(g);
  if (ch === 2 || g.flag("ch1done")) return hintCh2(g);
  return hintCh1(g);
}

function hintCh1(g: G): string {
  if (!g.flag("quest")) return "Sprich in der Taverne mit Kapitänin Rosa. Sie sucht Leute für ihr Schiff.";
  const lit = !!g.flag("lit");
  const compass = g.has("kompass");
  const medal = g.has("medaille");
  if (lit && compass && medal) return "Du hast Licht, Richtung und ein Lied. Geh zu Rosa in die Taverne.";
  if (!lit) {
    if (!g.flag("oilBought") && !g.has("oel") && !g.flag("oilIn")) {
      return g.coins() < 2
        ? "Für das Lampenöl bei Frau Pfefferkorn brauchst du 2 Münzen. Am Strand liegt ein Schatz vergraben."
        : "Kaufe Lampenöl bei Frau Pfefferkorn im Laden.";
    }
    if (!g.flag("oilIn")) return "Bring das Lampenöl über die Brücke zum Leuchtturm.";
    if (!g.has("feuerstein")) return "Knut in der Taverne hält einen Feuerstein fest. Mit einem Grog von Mo (1 Münze) wacht er auf.";
    return "Benutze den Feuerstein am Leuchtturm.";
  }
  if (!compass) {
    if (!g.flag("gotMapA")) return "Opa Barnabas am Steg weiß etwas über einen vergrabenen Kompass.";
    if (!g.has("karte")) {
      if (g.has("karteA") && g.has("karteB")) return "Setze die beiden Kartenhälften zusammen: Benutze eine mit der anderen.";
      if (g.has("flasche")) return "Schau dir die Flasche im Rucksack an. Darin steckt Papier.";
      return "Die zweite Kartenhälfte steckt in einer Flasche am Strand.";
    }
    if (!g.has("schaufel")) {
      if (!g.flag("gotCoconut")) return g.has("seil") ? "Benutze das Seil an der Palme am Strand, dann fällt eine Kokosnuss herunter." : "Das Seil liegt am Poller auf dem Steg. Damit holst du am Strand eine Kokosnuss von der Palme.";
      if (!g.flag("shovelTraded")) return "Tausche die Kokosnuss bei Frau Pfefferkorn gegen die Schaufel.";
    }
    return "Grabe mit der Schaufel am Strand: drei Schritt vom schiefen Felsen, wo der Mond die Palme küsst.";
  }
  if (!g.flag("duelKnown")) return "Zacharias Zunge übt auf der Lichtung hinter dem Strand. Sprich ihn an.";
  if (learned(g) < 4) return "Lerne alle vier Konter: Opa Barnabas, Mo, Frau Pfefferkorn und Rosa kennen je einen. Knut kennt auch einen, wenn du ihm einen Grog gibst.";
  return "Fordere Zacharias auf der Lichtung zum Reimduell heraus.";
}

function hintCh2(g: G): string {
  if (!g.flag("arrived")) {
    if (!g.flag("fish")) return "Nimm einen Pökelhering aus dem Fass an Deck.";
    if (!g.flag("scope")) return "Das Fernrohr liegt auf der Kiste an Deck. Nimm es mit.";
    return "Benutze den Goldenen Kompass am Steuerrad, um Kurs zu setzen.";
  }
  if (!g.flag("hornDropped")) return g.has("fisch") ? "Gib dem Reiher auf der Mangroveninsel den Hering." : "Du brauchst einen Hering von Rosas Schiff, um den Reiher abzulenken.";
  if (!g.flag("horn")) return "Nimm das Muschelhorn vom Boden, das der Reiher bewacht hat.";
  if (!g.flag("crabGone")) return "Benutze das Muschelhorn bei der Krabbe an der Brücke.";
  if (!g.flag("doorOpen")) return "Im Tempel: Das Wandbild verrät die Reihenfolge der Mondsteine im Tor. Wähle „Benutze“ und tippe sie an.";
  if (!g.flag("mirror")) return "Geh ins Tempeltor und nimm den Mondspiegel vom Sockel.";
  if (!g.flag("witchDone")) return "In der Grotte: Benutze den Mondspiegel im Lichtstrahl, sodass er auf Morwenna fällt.";
  return "Nimm die Gezeitenperle.";
}

function hintCh3(g: G): string {
  if (g.flag("logbook")) return "Das Logbuch ist in Sicherheit. Das Kapitel ist geschafft.";
  if (g.flag("monkeyHasLamp")) {
    return g.has("banane") ? "Gib dem Affen die Banane. Er tauscht sie gegen deine Lampe." : "Der Affe hat deine Lampe. Pflücke im Dschungel eine Banane und tausche sie.";
  }
  if (g.flag("tide") !== "ebbe") return "Die Höhle ist nur bei Ebbe zugänglich. Dreh die Gezeitenuhr am Steg.";
  return "Geh den Felsweg links in die Höhle und nimm das Logbuch.";
}
