import { bye, cabinet, container, edgeExit, hero, npc, once, says, talk } from "../dsl";
import type { G, SceneDef, Thing } from "../types";
import { ensureKit, spot, txt } from "./ch3_common";
import { feedAldric } from "./ch3_kerker";
import { GEO } from "./geometry";

const AWAY = { x: 800, y: 392 };
const POST = { x: 650, y: 366 };
const CODE = "rabe,kreuz,rabe,lamm";

const away = (g: G) => !!g.flag("c3_malvor_away");

async function malvorReturns(g: G) {
  g.set("c3_malvor_away", false);
  await g.moveNpc("malvor", POST.x, POST.y, 800);
  if (g.flag("c3_letter_out")) {
    g.set("c3_letter_out", false);
    g.add("halvard_brief");
    await says(g, "malvor", "Ein rührendes Schriftstück. Ritter schreiben stets so, als stürben sie morgen. Hier, Euer Brief.");
  }
}

async function pourAntidote(g: G) {
  if (g.flag("c3_king_cured")) return g.say("Der Kelch ist leer getrunken. Es liegt nichts mehr zu tun. Außer Anklage.");
  if (!away(g)) {
    g.frame("malvor", "talk");
    await says(g, "malvor", "Was machst du am Kelch Seiner Majestät, Bursche? Wachen!");
    await g.say("Zwei Hellebarden schieben mich höflich, aber nachdrücklich zur Tür. Ich fliege nicht, aber fast.");
    g.frame("malvor", "idle");
    await g.goto("burghof", 560, 378, 1);
    await g.say("Das war zu auffällig. Ich muss Malvor erst ablenken. Etwas zum Lesen? Oder etwas zum Fürchten?");
    return;
  }
  g.remove("gegengift");
  g.set("c3_antidote", true);
  g.sfx("magic");
  await g.pose("use", 600);
  await g.say("Ein Schwung türkis ins Rot. Der Wein leuchtet kurz, wie ein Geheimnis, und wird wieder dunkel. Der Kelch sieht unschuldig aus.");
  await malvorReturns(g);
  await says(g, "malvor", "Majestät, Euer Abendtrunk. Wie jeden Tag.");
  await says(g, "aldemar", "Hmm. Schmeckt ... anders. Bitter und süß. Wie die Jugend, die ich verlor.");
  g.flash("#9fffd8", 600);
  g.set("c3_king_cured", true);
  await says(g, "aldemar", "Merkwürdig. Die Kälte in meinen Fingern weicht. Als erwachte ich aus einem langen Winter.");
  await says(g, "malvor", "Eure Majestät ist verwirrt. Ich lasse nach dem Arzt schicken.");
  await hero(g, "Es wirkt. Und Malvor kneift die Augen zusammen. Ich sollte seine Maske jetzt abreißen.");
}

async function runePress(g: G, sym: string) {
  const cur = String(g.flag("c3_rune_seq") ?? "");
  const next = cur ? cur + "," + sym : sym;
  g.sfx("clank"); await g.pose("use", 350);
  if (CODE.startsWith(next)) {
    g.set("c3_rune_seq", next);
    if (next === CODE) {
      g.set("c3_fach_offen", true); g.sfx("unlock"); g.shake(300);
      await g.say("Der vierte Knopf versinkt. Im Stein knackt es, das Fach springt auf. Dahinter liegt etwas Schwarzes, Kleines.");
    } else await g.say("Der Knopf sinkt ein und bleibt unten. Ein leises Klicken im Stein.");
  } else {
    g.set("c3_rune_seq", "");
    g.sfx("wrong");
    await g.say("Die Knöpfe springen heraus. Hinter mir räuspert sich eine Wache.");
    await says(g, "wache_l", "Was war das für ein Klacken?");
    await hero(g, "Mäuse, Herr Wache. Sehr, sehr große Mäuse.");
  }
}

async function accuse(g: G) {
  if (!g.flag("c3_king_cured")) {
    await says(g, "malvor", "Eine Anklage? Gegen mich? Der König ist krank, mein Junge. Wer glaubt dir Gift, wenn ein Mann vom Fieber geplagt wird?");
    return hero(g, "Er hat recht. Erst muss der König bei Verstand sein.");
  }
  for (;;) {
    const opts: { t: string; k: string }[] = [];
    if (g.has("giftflasche") && !g.flag("c3_ev_flasche")) opts.push({ t: "Diese Flasche lag in Eurem Geheimfach hinterm Wandteppich.", k: "flasche" });
    if (g.flag("c3_aldric_free") && !g.flag("c3_ev_aldric")) opts.push({ t: "Ser Aldric, den Ihr im Kerker versteckt habt, kann gegen Euch aussagen.", k: "aldric" });
    if (!g.flag("c3_ev_koenig")) opts.push({ t: "Der König lebt und ist klar im Kopf. Euer Gift hilft nicht mehr.", k: "koenig" });
    opts.push({ t: "Ihr habt den König vergiftet! (ohne Beweis)", k: "bluff" });
    opts.push({ t: "Ich überlege noch.", k: "exit" });
    const i = await g.choose(opts.map((o) => o.t));
    const k = opts[i].k;
    if (k === "exit") return;
    if (k === "bluff") {
      await says(g, "malvor", "Wie amüsant! Wo sind deine Beweise, Totengräberjunge? Wachen, bringt dem Bengel etwas zum Nachdenken. Einen Becher Wasser.");
      await hero(g, "Ein Bluff reicht nicht. Ich brauche Beweise.");
      continue;
    }
    g.set("c3_ev_" + k, true);
    if (k === "flasche") {
      await says(g, "malvor", "Eine Flasche? Man findet überall Flaschen. Ich bin ein Mann mit Interessen. Medizin, Hobbys.");
      await says(g, "aldemar", "Die Flasche trägt einen Totenkopf. Und die Rune Malvors am Boden. Du solltest dich erklären, Kanzler.");
    } else if (k === "aldric") {
      await says(g, "aldric", "Ich bezeuge es. Er ließ mich einsperren, nachdem ich ihn beim Mischen sah. Er nannte es 'Arzneimittel'.");
      await says(g, "malvor", "Ein Verräter, verbittert und müde. Sein Wort wiegt nichts.");
    } else {
      await says(g, "aldemar", "Mein Kopf ist klar wie Quellwasser. Und ich erinnere mich an jedes Wort, das du mir seit Wochen eingeflüstert hast, Malvor.");
      await says(g, "malvor", "Das ... ist unmöglich. Der Trank war ...");
    }
    if (g.flag("c3_ev_flasche") && g.flag("c3_ev_aldric") && g.flag("c3_ev_koenig")) {
      await expose(g);
      return;
    }
  }
}

async function expose(g: G) {
  g.frame("malvor", "cast");
  await says(g, "malvor", "Genug. Ihr seid alle blind. Ein sterbender Greis, ein Magier mit Staub im Kopf, ein Grubenjunge. Ihr versteht nichts.");
  await says(g, "malvor", "Das Reich braucht einen Herrn, der führt. Das Ei des Drachen Aschenschlund liegt in meiner Tasche, das Horn ist im Vulkan versteckt.");
  await says(g, "malvor", "Wer das Horn bläst, gebietet dem Drachen. Und wer dem Drachen gebietet, gebietet allen. Folgt mir, wenn ihr leben wollt!");
  g.flash("#ff3030", 500); g.shake(500); g.sfx("roar");
  await g.moveNpc("malvor", 905, 400, 900);
  g.set("c3_malvor_gone", true);
  await says(g, "aldemar", "Wachen, ihm nach! ... Zu spät. Er ist fort. Zum Vulkan, ich ahne es.");
  g.set("c3_exposed", true);
  g.honor(1);
  await g.moveNpc("roderic_t", 540, 372, 900);
  await says(g, "roderic_t", "Majestät! Ich komme, so schnell der Orden eben ist. Was ist geschehen?");
  await says(g, "aldemar", "Malvor hat mich vergiftet und will das Drachenhorn. Der Junge hat mich gerettet. Sende die Anwärter zum Vulkan, Roderic.");
  await says(g, "roderic_t", "Bran. Weisheit und Demut hast du bewiesen. Es bleibt der Mut. Sprich mit mir, wenn du bereit bist.");
}

export const thronsaal: SceneDef = {
  id: "thronsaal",
  title: "Thronsaal von Grauwacht",
  bg: "thronsaal",
  walk: GEO.thronsaal.walk,
  scale: GEO.thronsaal.scale,
  ambient: "hall",
  fx: [{ kind: "dust", n: 0.4 }],
  enter: async (g: G) => {
    g.set("c3_rune_seq", "");
    if (away(g)) {
      g.set("c3_malvor_away", false);
      if (g.flag("c3_letter_out")) {
        g.set("c3_letter_out", false);
        g.add("halvard_brief");
        await g.say("Ein Diener drückt mir den Brief in die Hand. 'Der Kanzler hat gelesen. Er lässt ausrichten: rührend.'");
      }
    }
  },
  things: [
    edgeExit("left", { id: "to_hof", name: "Zum Burghof", to: "burghof", x: 560, y: 378, facing: 1 }),

    npc({ id: "aldemar", name: "König Aldemar", x: 505, y: 332, frames: { idle: "aldemar_idle", talk: "aldemar_talk" },
      look: txt((g) => (g.flag("c3_king_cured") ? "König Aldemar steht auf seinen Stock gestützt. Die Farbe kehrt in sein Gesicht zurück. Sein Blick ist wieder der eines Königs." : "König Aldemar. Dünn wie eine Kerze, bleich wie das Wachs. Er stützt sich auf einen Stock und auf die Gunst seines Kanzlers.")),
      give: {
        gegengift: async (g) => {
          await says(g, "aldemar", "Was hast du da? Ein Trank? Ich bin müde, mein Junge. Gib es mir nicht vor den Augen meines Kanzlers.");
          await hero(g, "Er will es trinken, aber Malvor darf es nicht sehen. Der Kelch ... das ist die Gelegenheit.");
        },
        giftflasche: async (g) => { await says(g, "aldemar", "Die Flasche mit dem Totenkopf? Stelle sie dem Kanzler vor. Aber nicht, bevor mein Kopf klar ist."); },
      },
      talk: async (g) => {
        await once(g, "c3_met_king", async () => { await says(g, "aldemar", "Ein Anwärter. Wie lange es her ist, dass einer kam. Ich war auch einmal jung und dumm."); });
        await talk(g, () => [
          { text: "Majestät, wie geht es Euch?", show: () => !g.flag("c3_king_cured"), run: () => says(g, "aldemar", "Schlecht. Jede Nacht fiebert mein Blut. Der Kanzler pflegt mich. Er ist ... aufmerksam. Allzu aufmerksam.") },
          { text: "Ich glaube, man vergiftet Euch.", show: () => !g.flag("c3_king_cured"), run: async () => { await says(g, "aldemar", "Psst. Ich ahne es. Aber ohne Beweis kann ich nichts tun. Wer außer dem Kanzler kennt die Küche?"); g.set("c3_king_warned", true); } },
          { text: "Was ist Euer Orden für Euch?", run: () => says(g, "aldemar", "Der Orden ist mein Gewissen mit Schwertern. Er sagt nein, wenn ich ja sagen will.") },
          { text: "Was wisst Ihr über Drachen?", run: async () => { await says(g, "aldemar", "Aschenschlund schläft seit hundert Jahren im Vulkan Kharn. Er hütet kein Gold, sondern sein Ei.", "Wer das Ei raubt, weckt den Zorn. Wer es zurückbringt, wird Gnade ernten. So sagt die Legende."); } },
          { text: "Danke, Majestät. Ich fühle mich geehrt.", show: () => !!g.flag("c3_king_cured"), run: () => says(g, "aldemar", "Ich bin es, der zu danken hat. Ein Totengräberjunge rettet einen König. Das wird die Barden ärgern: zu unwahrscheinlich.") },
          { text: "Wie geht es Euch jetzt?", show: () => !!g.flag("c3_king_cured"), run: () => says(g, "aldemar", "Besser. Die Hände sind warm. Ich habe Hunger. Der Kanzler hat mich wochenlang ausgehungert, sagt Berta.") },
          bye("Geh, Junge. Und denke an das Ei.", "aldemar", g, "Auf Wiedersehen."),
        ]);
      } }),
    { id: "kelch", name: "Weinkelch", sprite: "tischchen_kelch", x: 590, y: 350, scale: 0.95, at: { x: 590, y: 380 }, primary: "look",
      look: txt((g) => (g.flag("c3_king_cured") ? "Der Tisch mit dem Kelch. Er ist leer und unschuldig." : "Ein Tischchen mit Kelch und Weinkrug. Der Wein ist dunkel. Zu dunkel.")),
      use: (g) => g.say(g.flag("c3_antidote") ? "Der Kelch ist leer. Das Gegengift wirkt schon." : "Ich nippe nicht. Wer weiß, was darin ist."),
      take: "Den Kelch des Königs klauen? Das wäre selbst für mich zu dreist.",
      useWith: { gegengift: pourAntidote, giftflasche: "Das Gift zurück in den Kelch? Bran, was denkst du?", wein: "Noch mehr Wein? Das wäre ein Anschlag auf die Leber." } },
    npc({ id: "malvor", name: "Kanzler Malvor", x: POST.x, y: POST.y, facing: -1, hidden: (g) => !!g.flag("c3_malvor_gone"), frames: { idle: "malvor_idle", talk: "malvor_talk", cast: "malvor_cast" },
      look: "Kanzler Malvor. Schwarzer Talar, schmale Finger, ein Ring mit Rabenkopf. Er lächelt wie jemand, der gerade eine Rechnung beglichen hat.",
      give: {
        halvard_brief: async (g) => {
          if (away(g) || g.flag("c3_king_cured")) return says(g, "malvor", "Ich habe ihn schon gelesen. Ritter und ihre Briefe ...");
          await says(g, "malvor", "Ein Brief von Ser Halvard? Zeigt her. Hm, kaum lesbar. Ich muss ans Licht.");
          g.remove("halvard_brief"); g.set("c3_letter_out", true); g.set("c3_malvor_away", true);
          await g.moveNpc("malvor", AWAY.x, AWAY.y, 900);
          await hero(g, "Er liest am Fackelkorb. Der Kelch steht ungeschützt. Das wird nicht lange halten.");
        },
        hexentalisman: async (g) => {
          if (away(g) || g.flag("c3_king_cured")) return says(g, "malvor", "Wirf das Ding weg! Es stinkt nach Moor.");
          g.frame("malvor", "cast");
          await says(g, "malvor", "Hexenzeug! Hier, im Thronsaal! Wachen, ich hole sofort den Bischof ... Bleibt weg mit dem Ding!");
          g.set("c3_malvor_away", true);
          await g.moveNpc("malvor", AWAY.x, AWAY.y, 700);
          g.frame("malvor", "idle");
          await hero(g, "Er hat sich in die Ecke geflüchtet. Der Kelch ist unbewacht.");
        },
        giftflasche: async (g) => { await accuse(g); },
      },
      talk: async (g) => {
        if (away(g) && !g.flag("c3_king_cured")) {
          await says(g, "malvor", "Ja? Was willst du, Bursche?");
          await malvorReturns(g);
          return;
        }
        await once(g, "c3_met_malvor", async () => { await says(g, "malvor", "Ein Anwärter aus der Gosse. Wie rührend. Der Orden hat sich in den letzten Jahren offenbar sehr geöffnet."); });
        await talk(g, () => [
          { text: "Ich klage Euch an, Kanzler.", run: async () => { await accuse(g); } },
          { text: "Wie geht es dem König wirklich?", run: () => says(g, "malvor", "Er ist alt. Und krank. Und ich pflege ihn Tag und Nacht. Ein Jammer, dass niemand Dank kennt.") },
          { text: "Ihr rührt den Kelch selbst?", run: () => says(g, "malvor", "Natürlich. Aus Sorge. Niemand außer mir darf an Seiner Majestät Wein. Man weiß ja nie.") },
          { text: "Was lest Ihr da?", show: () => !g.flag("c3_malvor_read"), run: async () => { g.set("c3_malvor_read", true); await says(g, "malvor", "Berichte. Briefe. Verträge. Wer Briefe liest, der lenkt das Reich. Auch Ritter schreiben mir. Manchmal."); } },
          { text: "Was habt Ihr mit Ser Aldric gemacht?", show: () => !!g.flag("c3_aldric_story"), run: async () => { await says(g, "malvor", "Aldric? Gefallen an der Grenze. Ein Held. Man weint noch um ihn."); await hero(g, "Er lügt. Aldric ist unten im Kerker, am Leben."); } },
          bye("Verschwende nicht meine Zeit, Junge. Sie ist kostbarer als deine.", "malvor", g, "Auf Wiedersehen."),
        ]);
      } }),
    npc({ id: "roderic_t", name: "Ser Roderic", x: 905, y: 380, facing: -1, hidden: (g) => !g.flag("c3_exposed"), frames: { idle: "roderic_idle", talk: "roderic_talk" },
      look: "Ser Roderic ist hergeeilt. Sein Umhang weht noch. Der Ordensmeister sieht aus wie ein Mann, der heute viel zu früh aufgestanden ist.",
      talk: async (g) => {
        await talk(g, () => [
          { text: "Ich bin bereit. Zum Vulkan!", run: async () => {
            const miss: string[] = [];
            if (!g.flag("c3_demut_done")) miss.push("die Prüfung der Demut");
            if (!g.has("weisheitssiegel")) miss.push("das Siegel der Weisheit (Myrddin)");
            if (!g.has("spiegelschild")) miss.push("einen Spiegelschild gegen das Drachenfeuer (Rüstkammer)");
            if (miss.length) return says(g, "roderic_t", "Noch nicht. Dir fehlt: " + miss.join(", ") + ".");
            await says(g, "roderic_t", "Hier, nimm das Ordensgeschenk. Die Feldflasche mit Weihwasser, ein Seil, eine Fackel. Wer zum Vulkan geht, braucht Gnade und Zubehör.");
            ensureKit(g);
            await says(g, "roderic_t", "Malvor ist vorausgeeilt. Folge ihm, Bran. Bring das Ei zurück, wenn du kannst. Und zerstöre das Horn, wenn du musst.");
            g.set("chapter", 4);
            await g.card("Kapitel 4", "Der Vulkan");
            await g.goto("vulkanpfad", 80, 400, 1);
            return "end" as const;
          } },
          { text: "Was erwartet mich am Vulkan?", run: () => says(g, "roderic_t", "Asche, Schwefel, Lava. Und ein Drache, der seit hundert Jahren schlecht schläft. Der Mut ist keine Tugend, sondern eine Verpflichtung.") },
          { text: "Was habe ich noch zu tun?", run: async () => { await says(g, "roderic_t", g.flag("c3_demut_done") ? "Demut ist erledigt." : "Demut fehlt: Rede mit mir im Burghof."); await says(g, "roderic_t", g.has("weisheitssiegel") ? "Weisheit hast du." : "Weisheit fehlt: Myrddin wartet im Turm."); await says(g, "roderic_t", g.has("spiegelschild") ? "Der Spiegelschild glänzt." : "Ein Spiegelschild fehlt. Sand, Lappen und ein alter Schild aus der Rüstkammer."); } },
          { text: "Wo ist Malvor jetzt?", run: () => says(g, "roderic_t", "Er floh nach Osten. Zum Vulkan. Dort hat er ein Ei gestohlen und ein Horn gefunden. Mehr muss ich nicht wissen.") },
          bye("Komm zurück, wenn du alles hast.", "roderic_t", g, "Ich gehe noch einmal los."),
        ]);
      } }),
    npc({ id: "aldric_t", name: "Ser Aldric", x: 720, y: 390, facing: -1, hidden: (g) => !g.flag("c3_aldric_free"), frames: { idle: "aldric_idle", talk: "aldric_talk" },
      give: { zinnbecher: async (g) => { await feedAldric(g, "aldric_t"); } },
      look: "Ser Aldric, frisch aus dem Kerker. Ausgemergelt, aber aufrecht. Der Stolz ist stärker als der Hunger.",
      talk: async (g) => {
        await talk(g, () => [
          { text: "Geht es Euch gut?", run: () => says(g, "aldric_t", "Ich lebe. Das ist mehr, als die meisten Gefangenen sagen können. Danke, Bran.") },
          { text: "Wie war es im Kerker?", run: () => says(g, "aldric_t", "Feucht, laut und sehr, sehr langweilig. Der Wärter sang jede Nacht dasselbe Lied. Ich kann es jetzt auswendig.") },
          { text: "Wisst Ihr, wo Malvor das Gift versteckt?", show: () => !g.flag("c3_fach_offen"), run: () => says(g, "aldric_t", "Hinter dem Wandteppich. Er murmelte immer den Spruch: Rabe, Kreuz, Rabe, Lamm.") },
          bye("Ich bleibe hier. Und lasse Malvor nicht aus den Augen.", "aldric_t", g, "Auf Wiedersehen."),
        ]);
      } }),
    npc({ id: "wache_l", name: "Thronwache", x: 300, y: 356, facing: 1, frames: { idle: "wache_idle", talk: "wache_idle" },
      look: "Eine Thronwache. Sie steht so steif, dass man ihr Staub vom Helm wischen könnte. Vermutlich bewegt sie sich nur, wenn der König niest.",
      talk: async (g) => { await says(g, "wache_l", "Ich sehe nichts, höre nichts, sage nichts. Das ist mein Beruf. Die Bezahlung ist entsprechend."); } }),
    npc({ id: "wache_r", name: "Thronwache", x: 760, y: 350, facing: -1, frames: { idle: "wache_idle", talk: "wache_idle" },
      look: "Noch eine Wache. Sie schläft im Stehen, mit offenen Augen. Das ist eine Kunst.",
      talk: async (g) => { await says(g, "wache_r", "Der Kanzler hat gesagt: Keiner geht durch die Tür dort. Ich weiß nicht, was dahinter ist. Ich bin glücklich damit."); } }),

    // Tapisserie & Fach
    spot("tapisserie", "Wandteppich", [90, 10, 125, 150], txt((g) => (g.flag("c3_fach_sichtbar") ? "Der Wandteppich hängt schief. Dahinter schimmert ein Stein mit vier Knöpfen. Der Teppich zeigt einen Raben, ein Kreuz, ein Lamm. Die Reihenfolge ist verwischt." : "Ein riesiger Wandteppich: Burg, Rabe, Kreuz, Lamm. Der Rahmen ist auffällig sauber. Als hätte ihn jemand regelmäßig angehoben.")), {
      at: { x: 130, y: 345 },
      use: async (g) => {
        if (g.flag("c3_fach_sichtbar")) return g.say("Der Teppich bleibt oben. Er ist froh, einmal Luft zu bekommen.");
        g.set("c3_fach_sichtbar", true); g.sfx("creak"); await g.pose("use", 500);
        await g.say("Ich hebe den Teppich an. Dahinter: ein Steinfeld mit vier Runenknöpfen, ein Rabe, ein Kreuz, ein Lamm und noch ein Rabe. Ein Geheimfach!");
      },
      take: "Der Teppich ist zu schwer und zu historisch. Ich würde ihn nicht tragen können.",
    }),
    { id: "geheimfach", name: "Geheimfach", sprite: (g) => (!g.flag("c3_fach_sichtbar") ? null : g.flag("c3_fach_offen") ? "geheimfach_offen" : "geheimfach_zu"), x: 120, y: 244, at: { x: 125, y: 345 }, primary: "use", z: 300,
      hidden: (g) => !g.flag("c3_fach_sichtbar"),
      look: txt((g) => (g.flag("c3_fach_offen") ? "Das Geheimfach steht offen. Darin liegt, was Malvor vor aller Welt verbarg." : "Eine Steinplatte mit vier Knöpfen: Rabe, Kreuz, Rabe, Lamm in dieser Anordnung? Nein, die Reihenfolge der Knöpfe ist es, nicht die Anordnung.")),
      take: "Das Fach ist fest im Stein. Aber ich kann es öffnen, wenn ich die Reihenfolge kenne.",
      use: async (g) => {
        if (!g.flag("c3_fach_offen")) return g.say("Vier Runenknöpfe. Ich muss sie in der richtigen Reihenfolge drücken. Aldric kennt vielleicht einen Spruch.");
        if (!g.panelLeft("c3_fach", ["giftflasche", "pergamentfetzen"]).length) return g.say("Das Fach ist leer. Malvor hat nur noch Spinnweben.");
        await g.openPanel("Geheimfach", "c3_fach", ["giftflasche", "pergamentfetzen"]);
      } },
    ...(["lamm", "rabe", "kreuz", "rabe"] as const).map((s, i): Thing => ({ id: `rune${i + 1}`, name: `Rune (${s})`, sprite: `knopf_${s}`, x: [81, 108, 136, 162][i], y: 222, scale: 0.72, z: 301, hit: [[81, 108, 136, 162][i] - 14, 198, 28, 28], at: { x: 125, y: 345 }, primary: "use",
      hidden: (g) => !g.flag("c3_fach_sichtbar") || !!g.flag("c3_fach_offen"), look: `Ein Runenknopf mit ${s === "rabe" ? "einem Raben" : s === "kreuz" ? "einem Kreuz" : "einem Lamm"}.`, use: (g) => runePress(g, s) })),

    // Containers
    container({ id: "truhe_t", name: "Hoftruhe", x: 215, y: 392, sprites: { closed: "truhe_waffe_zu", open: "truhe_waffe_offen" }, scale: 0.85, at: { x: 215, y: 420 }, contents: ["rosenkranz", "zinnring", "spielfigur"], title: "Hoftruhe",
      look: "Eine Hoftruhe mit Wappen. Hier verwahren Könige das, was sie nie wieder sehen wollen.", emptyText: "Die Truhe ist leer, bis auf einen verzweifelten Silberfisch." }),
    ...cabinet({ id: "kommode_t", name: "Schreibkommode", sprites: ["kommode_wk_zu", "kommode_wk_oben", "kommode_wk_unten"], x: 900, y: 360, scale: 0.7, at: { x: 880, y: 395 },
      look: "Malvors Schreibkommode. Alles in Reih und Glied, jede Schublade peinlich ordentlich. Das ist verdächtig.",
      drawers: [
        { hit: [0.06, 0.12, 0.88, 0.38], contents: ["gaensefeder", "pergamentfetzen", "haarlocke"], name: "Obere Schublade" },
        { hit: [0.06, 0.55, 0.88, 0.38], contents: ["kerzenwachs", "kreide", "zahn"], name: "Untere Schublade" },
      ] }),

    // painted things
    spot("thron", "Thron", [440, 20, 140, 250], "Der Thron von Grauwacht. Zwei Raben thronen auf den Lehnen, grimmig, wie der Rest.", { at: { x: 505, y: 345 } }),
    spot("th_banner_l", "Raben-Banner", [300, 40, 70, 200], "Ein schwarzes Banner mit weißem Raben. Der Stoff ist zerfetzt. Es wurde schon oft durch Feuer getragen."),
    spot("th_banner_r", "Raben-Banner", [685, 40, 70, 200], "Das Gegenstück des Banners. Der Rabe schaut nach links, also weg von Malvor."),
    spot("th_korb_l", "Feuerkorb", [280, 235, 55, 80], "Ein Feuerkorb mit lodernden Scheiten. Er wärmt den Saal und verbrennt gelegentlich ein Gerücht."),
    spot("th_korb_r", "Feuerkorb", [718, 235, 55, 80], "Der zweite Feuerkorb. Ein Funke fliegt heraus und stirbt auf dem Teppich."),
    spot("th_gemach", "Tür zu Malvors Gemach", [835, 120, 100, 185], txt((g) => (g.flag("c3_exposed") ? "Die Tür steht einen Spalt offen. Malvors Gemach ist leer, bis auf den Geruch von Schwefel." : "Eine schwere Doppeltür. Dahinter liegt das Gemach des Kanzlers. Eine Wache steht davor, die nichts weiß.")), { at: { x: 860, y: 410 }, use: "Die Tür ist verschlossen. Die Wache lächelt freundlich. Es ist das Lächeln eines Mannes mit einer Hellebarde." }),
    spot("th_fenster", "Fenster", [400, 0, 270, 250], "Hohe Spitzbogenfenster. Dahinter liegt das verschneite Land, kalt und friedlich."),
    spot("th_saeule", "Säule", [235, 20, 55, 285], "Eine Steinsäule mit eingemeißelten Raben. Sie hält das Dach. Mehr kann man von Säulen nicht verlangen."),
  ],
};
