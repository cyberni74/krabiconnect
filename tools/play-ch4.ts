import { Harness } from "../src/adventure/testing";
import { world } from "../src/adventure/world";

/** Plays chapter 4 twice: Gnade (lava by bucket, Malvor tied, horn destroyed) and Rache (lava by holy water). Includes failures. */
async function run(kind: "gnade" | "rache") {
  const h = new Harness(world);
  const g = h.g;
  g.newGame(4);
  let ended: { title: string; text: string } | null = null;
  g.end = (title: string, text: string) => { ended = { title, text }; };
  const V = "vulkanpfad", D = "drachenhoehle";
  await h.at(V);
  await h.act(V, "to_hoehle", "walk"); h.expectScene(V); // blocked by lava
  if (g.walkPoly().some((p) => p.x > 600)) throw new Error("walk polygon should exclude the far side before cooling");
  await h.act(V, "lavastrom", "use", "fackel");
  await h.act(V, "lavastrom", "use", "seil"); h.expectInv("seil");
  await h.act(V, "ritterskelett", "look"); h.expectFlag("c4_diary");
  await h.act(V, "felsbrocken", "use");
  await h.act(V, "felsbrocken", "use", "seil"); h.expectFlag("c4_fels");
  await h.act(V, "fels_nische", "use"); h.take("fels_nische", "flasche_leer");
  await h.act(V, "schwefel", "look");
  if (kind === "gnade") {
    await h.act(V, "ritterskelett", "use"); h.take("ritterskelett", "eimer");
    await h.act(V, "dampf", "use", "eimer"); h.expectInv("eimer_wasser");
    await h.act(V, "lavastrom", "use", "eimer_wasser");
    h.expectInv("weihwasser", "eimer");
  } else {
    await h.act(V, "lavastrom", "use", "weihwasser"); h.expectNoInv("weihwasser");
  }
  h.expectFlag("c4_lava_cool");
  if (!g.walkPoly().some((p) => p.x > 900)) throw new Error("walk polygon should be open after cooling");
  await h.act(V, "knochenpfahl", "look");
  await h.act(V, "to_hoehle", "walk"); h.expectScene(D);

  await h.act(D, "goldhaufen", "use"); h.take("goldhaufen", "zinnring");
  await h.act(D, "altruestung", "use");
  await h.act(D, "knochenhaufen", "use");
  await h.act(D, "dh_silber", "take");
  await h.act(D, "drache", "talk"); // asleep
  // 1st failure: grab the egg too early, then hide behind the altar
  await h.act(D, "altar", "take", undefined, ["Hinter den Altar"]);
  h.expectNoInv("drachenei"); h.expectFlag("c4_wach", false);
  // 2nd failure: sword
  await h.act(D, "malvor", "talk", undefined, ["Was habt Ihr", "Das Horn", "Siegel", "Was wollt", "Niemals", "Ich halte", "Schwert ziehen"]);
  h.expectFlag("c4_wach", false);
  // exit while not awake is allowed; check guard when awake later
  await h.act(D, "malvor", "talk", undefined, ["Ich halte", "Spiegelschild"]);
  h.expectFlag("c4_fire");
  await h.act(D, "to_pfad", "walk"); h.expectScene(D); // guarded: dragon awake
  await h.act(D, "malvor", "talk", undefined, ["Warum", ...(kind === "gnade" ? ["Ich werde Euch"] : []), "Genug"]);
  await h.act(D, "horn_boden", "take"); h.expectInv("horn");
  if (kind === "gnade") {
    h.expectFlag("c4_malvor_tied");
    await h.act(D, "lavasee", "use", "horn"); h.expectFlag("c4_horn_gone");
    await h.act(D, "altar", "take"); h.expectInv("drachenei");
    await h.act(D, "drache", "talk", undefined, ["Was ist hier", "Wo ist", "Ich bringe"]);
    h.expectNoInv("drachenei"); h.expectFlag("c4_ei_zurueck");
  } else {
    await h.act(D, "drache", "talk", undefined, ["Was ist hier", "Nimm das Ei", "Ich bin gekommen", "Das Schwert sinken", "Ich bin gekommen", "Zustoßen"]);
    h.expectFlag("c4_dead");
  }
  if (!ended) throw new Error("no ending");
  const e = ended as { title: string; text: string };
  console.log(`[${kind}] honor=${g.flag("honor")} ending: ${e.title}\n${e.text}\n`);
  console.log(h.log.filter((l) => l.startsWith("[CARD]")).join(" | "));
  console.log(world.hint(g));
}
await run("gnade");
await run("rache");
console.log("OK");
