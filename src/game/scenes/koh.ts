import { barrel, cloud, crate, ellipse, fireflies, foliage, glow, grain, lin, palm, planks, poly, rad, rect, ridge, rock, seaBase, seaShimmer, shade, sky, twinkle, vignette } from "../art";
import { MONKEY, NOK, PLOY, SORN, drawSprite, spriteShadow } from "../sprites";
import { bye, talk } from "../story";
import type { ActorRuntime, G, SceneDef } from "../types";

type C = CanvasRenderingContext2D;

/** One sprite pixel = 4 logical pixels = one pixel of the 240×110 pixel buffer. */
const PX = 4;

/** Sprite legs cycle: two frames while walking. */
const legsFor = (walking: boolean, phase: number): "a" | "b" | "idle" => (walking ? (Math.floor(phase * 2) % 2 === 0 ? "a" : "b") : "idle");

/** Gentle breathing for standing characters: one pixel up every few beats. */
const breath = (t: number) => (Math.sin(t * 2.5) > 0.75 ? -PX : 0);

/** Generated pixel sprites for Nok: standing and mid-stride (72 px tall, drawn at 2 logical px per sprite pixel). */
const nokStand: HTMLImageElement | null = typeof Image !== "undefined" ? Object.assign(new Image(), { src: "/insel/nok-stand.png" }) : null;
const nokWalk: HTMLImageElement | null = typeof Image !== "undefined" ? Object.assign(new Image(), { src: "/insel/nok-walk.png" }) : null;

function drawImageSprite(ctx: C, img: HTMLImageElement, x: number, y: number, facing: 1 | -1, bob: number) {
  const w = img.naturalWidth * 2;
  const h = img.naturalHeight * 2;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(Math.round(x), Math.round(y));
  if (facing === -1) ctx.scale(-1, 1);
  ctx.drawImage(img, Math.round(-w / 2), Math.round(-h + bob), w, h);
  ctx.restore();
}

const heroSprite = (ctx: C, a: ActorRuntime, pose: { walking: boolean; phase: number; t: number }) => {
  spriteShadow(ctx, a.x, a.y, PX);
  if (nokStand?.complete && nokWalk?.complete) {
    const img = pose.walking ? nokWalk : nokStand;
    const bob = pose.walking ? -2 * Math.abs(Math.sin(pose.phase * Math.PI * 2)) * 2 : breath(pose.t);
    drawImageSprite(ctx, img, a.x, a.y, a.facing, bob);
    return;
  }
  const step = Math.floor(pose.phase * 2) % 2 === 0;
  drawSprite(ctx, NOK, a.x, a.y, PX, {
    facing: a.facing,
    legs: legsFor(pose.walking, pose.phase),
    bob: pose.walking ? -PX * 0.5 * Math.abs(Math.sin(pose.phase * Math.PI * 2)) : breath(pose.t),
    arms: pose.walking ? (step ? 1 : -1) : 0,
  });
};

/** Simple bamboo stilt hut, roof of palm thatch. */
function hut(ctx: C, x: number, base: number, w: number, h: number, wall: string, roof: string) {
  rect(ctx, x, base - h, w, h, lin(ctx, x, 0, x + w, 0, [[0, shade(wall, 0.12)], [1, shade(wall, -0.35)]]));
  for (let i = 1; i < 6; i++) rect(ctx, x + (w * i) / 6, base - h, 2, h, shade(wall, -0.5));
  poly(ctx, [x - 16, base - h + 4, x + w / 2, base - h - h * 0.75, x + w + 16, base - h + 4], lin(ctx, 0, base - h - h * 0.75, 0, base - h, [[0, shade(roof, 0.1)], [1, shade(roof, -0.4)]]));
  for (let i = 0; i < 9; i++) {
    const k = (i + 1) / 10;
    ctx.strokeStyle = shade(roof, -0.5);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 16 + k * 12, base - h + 4 - k * h * 0.2);
    ctx.lineTo(x + w + 16 - k * 12, base - h + 4 - k * h * 0.2);
    ctx.stroke();
  }
  rect(ctx, x + w * 0.4, base - h * 0.45, w * 0.2, h * 0.45, "#0e0a08");
}

/** Longtail boat: wooden hull, engine and a long shaft. */
function longtail(ctx: C, x: number, y: number, s: number, hull: string, t: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  poly(ctx, [-90, -20, 90, -22, 70, 6, -70, 6], lin(ctx, 0, -22, 0, 6, [[0, shade(hull, 0.2)], [1, shade(hull, -0.5)]]), "#1a0e06", 2);
  rect(ctx, -90, -24, 180, 5, "#c8a060");
  rect(ctx, 60, -62, 6, 40, "#3a2a1a");
  rect(ctx, 52, -66, 22, 16, "#2a2a30");
  ctx.strokeStyle = "#2a2a30";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(62, -50);
  ctx.lineTo(110, 10 + Math.sin(t * 6) * 1.5);
  ctx.stroke();
  // little canopy with a flag
  rect(ctx, -40, -58, 4, 36, "#3a2a1a");
  poly(ctx, [-44, -60, 20, -60, 14, -48, -40, -48], "#e8b040");
  poly(ctx, [-26, -60, -26, -72, -16, -66], "#c4422e");
  ctx.restore();
}

/* ===================== KOH PIER ===================== */
const tideEbb = (g: G) => g.flag("tide") === "ebbe";

/** Hand-made pixel background (generated, then cropped to the scene size). Falls back to the painted scene until loaded. */
const pierArt: HTMLImageElement | null = typeof Image !== "undefined" ? Object.assign(new Image(), { src: "/insel/koh-pier.png" }) : null;

export const kohPier: SceneDef = {
  id: "koh_pier",
  title: "Bootssteg von Koh Kham Nang",
  ambient: "sea",
  walk: [{ x: 620, y: 330 }, { x: 960, y: 330 }, { x: 960, y: 430 }, { x: 620, y: 430 }],
  scale: () => 1,
  hero: heroSprite,
  staticKey: (g) => `${String(g.flag("tide") ?? "flut")}|${pierArt?.complete ? 1 : 0}`,
  paintStatic(ctx, g) {
    if (pierArt?.complete && pierArt.naturalWidth) {
      ctx.drawImage(pierArt, 0, 0, 960, 440);
      return;
    }
    sky(ctx, 300, [[0, "#2a4a8a"], [0.45, "#8a6aa0"], [0.8, "#f08a6a"], [1, "#ffd08a"]]);
    sun(ctx, 760, 180);
    cloud(ctx, 201, 240, 110, 360, 26, "rgba(255,200,180,0.9)", "rgba(160,90,120,0.9)", 0.6);
    cloud(ctx, 202, 820, 70, 280, 18, "rgba(255,220,190,0.9)", "rgba(170,100,130,0.9)", 0.5);
    // Karst cliffs of Koh Kham Nang
    ridge(ctx, 203, 0, 520, 300, 150, "#4a4a6a", 0.25);
    ridge(ctx, 204, 420, 960, 300, 170, "#3a3a58", 0.2);
    // rock wall left (cave is behind it)
    poly(ctx, [0, 300, 40, 150, 120, 120, 190, 200, 220, 300], lin(ctx, 0, 120, 0, 300, [[0, "#6a6070"], [1, "#2a2430"]]));
    rock(ctx, 205, 110, 300, 90, 40, "#7a7080", "#2a2430");
    // water line depends on the tide
    const ebb = tideEbb(g);
    const wl = ebb ? 362 : 300;
    if (ebb) {
      // low tide: a wide wet beach and a dry path to the cave, clearly visible
      rect(ctx, 0, 300, 960, 62, lin(ctx, 0, 300, 0, 362, [[0, "#d8b888"], [1, "#9a7a52"]]));
      poly(ctx, [0, 330, 230, 338, 300, 362, 0, 362], "#b89868");
      for (let i = 0; i < 9; i++) ellipse(ctx, 30 + i * 50, 344 + (i % 3) * 5, 14, 4, "#4a6a7a");
      // foam line at the new waterline
      rect(ctx, 0, 360, 960, 3, "rgba(255,250,240,0.8)");
    }
    seaBase(ctx, wl, 440, [[0, "#3a6aa0"], [0.2, "#1a4a7a"], [1, "#0a2044"]]);
    // stilts and deck
    for (let x = 240; x < 960; x += 90) rect(ctx, x, 330, 8, 110, "#3a2a1a");
    planks(ctx, 0, 318, 960, 36, "#7a5a3a", "#2a1a0a", false, 14, 31);
    rect(ctx, 0, 352, 960, 6, "#2a1a0a");
    // stilt huts on the water
    hut(ctx, 300, 300, 92, 62, "#c8a070", "#9a7a3a");
    hut(ctx, 440, 300, 80, 56, "#b89060", "#8a6a2a");
    // tide clock post
    rect(ctx, 470, 180, 12, 150, "#5a4028");
    ellipse(ctx, 476, 176, 26, 22, "#f0e0c0");
    ellipse(ctx, 476, 176, 20, 16, "#e0c890");
    ctx.strokeStyle = "#7a5a38";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(476, 176);
    ctx.lineTo(ebb ? 476 : 470, ebb ? 166 : 186);
    ctx.stroke();
    // market stall on the right, under lanterns
    rect(ctx, 630, 300, 150, 8, "#4a2c16");
    rect(ctx, 630, 308, 6, 48, "#3a2010");
    rect(ctx, 774, 308, 6, 48, "#3a2010");
    poly(ctx, [620, 300, 640, 258, 770, 258, 790, 300], lin(ctx, 0, 258, 0, 300, [[0, "#c4422e"], [1, "#7a2a1e"]]));
    for (let i = 0; i < 6; i++) rect(ctx, 630 + i * 26, 264, 13, 14, i % 2 ? "#f2e6c0" : "#c4422e");
    for (let i = 0; i < 5; i++) ellipse(ctx, 650 + i * 26, 296, 9, 7, i % 2 ? "#f6d040" : "#e8a02a");
    // moored boat
    longtail(ctx, 180, 376, 1, "#7a4a22", 0);
    // sand path marker
    if (ebb) ctx.fillStyle = "rgba(255,240,200,0.4)", ctx.fillRect(120, 352, 100, 4);
    // sign
    rect(ctx, 905, 268, 4, 60, "#3a2a1a");
    poly(ctx, [880, 260, 930, 260, 938, 272, 930, 284, 880, 284], "#6a4a2a", "#2a1a0a", 2);
    vignette(ctx, 0.4, "30,10,20");
    grain(ctx, 0.04);
  },
  paintAnim(ctx, t, g) {
    twinkle(ctx, 205, 6, 120, t);
    if (!tideEbb(g)) seaShimmer(ctx, t, 300, 360, 560, "rgba(255,230,190,0.85)", 0.5);
    longtail(ctx, 180, 376, 1, "#7a4a22", t);
    // lanterns over the market
    for (const x of [640, 700, 760]) {
      const f = 0.85 + Math.sin(t * 6 + x) * 0.08;
      glow(ctx, x, 290, 60 * f, "rgba(255,170,80,0.55)");
      ellipse(ctx, x, 290, 5, 7, "#ffd27a");
    }
    fireflies(ctx, t, 207, 8, 200, 260, 360, 60, "rgba(200,255,140,0.9)");
  },
  actors: [
    {
      id: "sorn",
      name: "Kapitän Sorn",
      color: "#ffb36b",
      x: 860,
      y: 372,
      facing: 1,
      box: [48, 96],
      draw: (ctx, a) => {
        spriteShadow(ctx, a.x, a.y, PX);
        drawSprite(ctx, SORN, a.x, a.y, PX, { facing: a.facing, legs: "idle", bob: breath(a.t), arms: Math.sin(a.t * 1.3) > 0 ? 1 : 0 });
      },
    },
  ],
  hotspots: [
    {
      id: "clock",
      name: "Gezeitenuhr",
      rect: [456, 170, 52, 160],
      at: { x: 500, y: 380 },
      look: (g) => g.say(tideEbb(g) ? "Die Muschelscheibe zeigt Ebbe. Das Wasser ist weit draußen, der Sand liegt frei." : "Die Muschelscheibe zeigt Flut. Das Wasser steht hoch am Steg."),
      take: "Die Uhr ist am Pfahl festgebunden. Nur ein Dreh genügt.",
      walk: async (g) => {
        g.set("tide", tideEbb(g) ? "flut" : "ebbe");
        g.sfx("splash");
        g.refresh();
        await g.say(tideEbb(g) ? "Ebbe! Das Wasser zieht sich zurück und gibt den Sand frei." : "Flut! Das Wasser steigt wieder über den Sand.");
      },
    },
    {
      id: "toCave",
      name: "Felsweg zur Höhle",
      rect: [0, 290, 70, 150],
      exit: true,
      at: { x: 40, y: 384 },
      look: "Ein Felsweg führt in den Schatten der Klippe. Dort liegt die Höhle, wenn das Wasser sich zurückzieht.",
      walk: async (g) => {
        if (!tideEbb(g)) return g.say("Der Weg liegt unter Wasser. Erst die Ebbe an der Gezeitenuhr.");
        if (!g.has("lampe")) return g.say("Die Höhle ist stockdunkel. Ohne Licht stolpere ich ins Wasser.");
        g.sfx("door");
        await g.goto("koh_cave", 110, 388, 1);
      },
    },
    {
      id: "toJungle",
      name: "Dschungelpfad",
      rect: [920, 250, 40, 180],
      exit: true,
      at: { x: 932, y: 384 },
      look: "Der Pfad führt von der Hafenmole in den dichten Dschungel.",
      walk: (g) => g.goto("koh_jungle", 60, 396, 1),
    },
    {
      id: "stall",
      name: "Marktstand",
      rect: [620, 255, 170, 60],
      look: "Früchte, Kokosnüsse und Zigaretten. Ein Schild sagt: „Keine Auskunft über Boote.“",
    },
    {
      id: "boat",
      name: "Longtail-Boot",
      rect: [110, 330, 150, 60],
      at: { x: 180, y: 396 },
      look: "Ein Longtail-Boot mit einem Motor aus alter Nähmaschine. Solide, laut, und riecht nach Diesel.",
    },
    {
      id: "sorn",
      name: "Kapitän Sorn",
      actor: "sorn",
      at: { x: 840, y: 398 },
      face: 1,
      look: "Kapitän Sorn. Schnurrbart, Strohhut und ein Blick, der jede Ware sofort abschätzt.",
      talk: (g) => sornTalk(g),
      give: {
        muenzen: "„Ich verkaufe nichts an Kinder, die ihre Dublonen noch zählen müssen.“",
        banane: async (g) => {
          g.remove("banane");
          await g.say("Eine Banane? Für mich? Danke, Kleine. Ich bin nicht so ein schlechter Kerl, wie alle sagen.", "sorn");
        },
      },
    },
  ],
  async enter(g) {
    if (!g.flag("kohIntro")) {
      g.set("kohIntro");
      await g.say("Koh Kham Nang. Die Insel meiner Großmutter Ploy.");
      await g.say("Sie hat ihr Logbuch hier versteckt, in der Höhle an der Klippe. Die Höhle ist nur bei Ebbe zu erreichen.");
      await g.say("Die Muschelscheibe am Pfahl dreht die Gezeiten. Und Sorn, der Bootsmann am Stand, sieht aus, als wüsste er alles.", "hero");
    }
  },
};

async function sornTalk(g: G) {
  await talk(g, () => [
    {
      text: "Was verkaufst du hier?",
      run: async () => {
        await g.say("Früchte, Bootsfahrten und Auskünfte. Die Früchte sind frisch. Die Auskünfte kosten extra.", "sorn");
      },
    },
    {
      text: "Kennst du die Höhle an der Klippe?",
      run: async () => {
        await g.say("Hm. Jeder kennt sie. Keiner geht rein. Zu viel Wasser, zu viele Geister.", "sorn");
        await g.say("Ich sag nur: Nimm eine gute Lampe mit.", "sorn");
      },
    },
    {
      text: "Hast du Ploys Logbuch gesehen?",
      run: async () => {
        g.set("sornAsked");
        await g.say("Ein Logbuch? Nein, nie gehört. Und wenn doch, würde ich es nicht mit Kindern besprechen.", "sorn");
      },
    },
    {
      text: "Tschüss, Kapitän.",
      run: async () => {
        await g.say("Aye, aye. Pass auf die Strömung auf.", "sorn");
        return "end";
      },
    },
  ]);
}

/* ===================== JUNGLE ===================== */
export const kohJungle: SceneDef = {
  id: "koh_jungle",
  title: "Dschungelpfad",
  ambient: "jungle",
  walk: [{ x: 0, y: 344 }, { x: 960, y: 344 }, { x: 960, y: 430 }, { x: 0, y: 430 }],
  scale: () => 1,
  hero: heroSprite,
  staticKey: (g) => `${g.flag("bananaTaken") ? 1 : 0}`,
  paintStatic(ctx, g) {
    sky(ctx, 260, [[0, "#1a4a5a"], [0.6, "#3a7a7a"], [1, "#8ac0a0"]]);
    ridge(ctx, 210, 0, 960, 260, 70, "#2a5a4a", 0.35);
    // dense jungle behind
    foliage(ctx, 211, -40, 120, 1040, 170, "#0c2a1c", "#1a4a30", "#2e6a40", 90);
    palm(ctx, 90, 330, 230, 0.2, 0, "#3a2a1a", "#143a22", "#2a6a3a", 213);
    palm(ctx, 870, 330, 240, -0.2, 0, "#3a2a1a", "#143a22", "#2a6a3a", 214);
    // path
    poly(ctx, [0, 350, 960, 350, 960, 430, 0, 430], lin(ctx, 0, 350, 0, 430, [[0, "#8a6a40"], [1, "#4a3a20"]]));
    foliage(ctx, 215, 0, 330, 960, 60, "#14361e", "#245a34", "#3a7a48", 40);
    // Mae Ploy's hut
    hut(ctx, 560, 352, 200, 170, "#b08050", "#6a7a2a");
    // banana plant with fruit
    palm(ctx, 300, 350, 150, -0.1, 0, "#4a3a1a", "#1a5a2a", "#2e8a3e", 216);
    if (!g.flag("bananaTaken")) {
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.translate(290 + i * 8, 240 + (i % 2) * 6);
        ctx.rotate(0.4 + i * 0.15);
        ctx.fillStyle = "#f6e05a";
        ctx.beginPath();
        ctx.ellipse(0, 0, 4, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
    // monkey palm
    palm(ctx, 430, 360, 210, 0.15, 0, "#4a3a1a", "#143a22", "#2a6a3a", 217);
    vignette(ctx, 0.5, "10,20,10");
    grain(ctx, 0.04);
  },
  paintAnim(ctx, t) {
    palm(ctx, 90, 330, 230, 0.2, t, "#3a2a1a", "#143a22", "#2a6a3a", 213);
    palm(ctx, 870, 330, 240, -0.2, t, "#3a2a1a", "#143a22", "#2a6a3a", 214);
    fireflies(ctx, t, 218, 10, 60, 180, 840, 150, "rgba(190,255,130,0.9)");
    glow(ctx, 680, 300, 120, "rgba(255,190,110,0.15)", 0.8 + Math.sin(t * 2) * 0.1);
  },
  actors: [
    {
      id: "ploy",
      name: "Mae Ploy",
      color: "#9fe6a0",
      x: 650,
      y: 384,
      facing: -1,
      box: [48, 96],
      draw: (ctx, a) => {
        spriteShadow(ctx, a.x, a.y, PX);
        drawSprite(ctx, PLOY, a.x, a.y, PX, { facing: a.facing, legs: "idle", bob: breath(a.t), arms: Math.sin(a.t * 1.1) > 0 ? 1 : 0 });
      },
    },
    {
      id: "monkey",
      name: "Affe",
      color: "#ffd27a",
      x: 430,
      y: 200,
      facing: -1,
      box: [40, 40],
      pos: (g) => (g.flag("monkeyHasLamp") ? { x: 440, y: 360 } : { x: 430, y: 200 }),
      draw: (ctx, a, g) => {
        const bob = Math.sin(a.t * 5) * PX * 0.5;
        // tail
        ctx.strokeStyle = "#7a4a2a";
        ctx.lineWidth = PX;
        ctx.beginPath();
        ctx.moveTo(a.x - 8, a.y - 6 * PX);
        ctx.quadraticCurveTo(a.x - 36, a.y - 8 * PX, a.x - 26, a.y - 2 * PX + Math.sin(a.t * 3) * 3);
        ctx.stroke();
        drawSprite(ctx, MONKEY, a.x, a.y, PX, { facing: a.facing, bob });
        if (g.flag("monkeyHasLamp")) glow(ctx, a.x + 12, a.y - 3 * PX, 14, "rgba(255,240,160,0.8)");
      },
    },
  ],
  hotspots: [
    {
      id: "toPier",
      name: "Zurück zum Steg",
      rect: [0, 290, 50, 150],
      exit: true,
      at: { x: 40, y: 392 },
      look: "Der Pfad zurück zur Hafenmole.",
      walk: (g) => g.goto("koh_pier", 880, 384, -1),
    },
    {
      id: "banana",
      name: "Bananenstaude",
      rect: [270, 230, 60, 110],
      at: { x: 300, y: 392 },
      hidden: (g) => !!g.flag("bananaTaken"),
      look: "Eine Bananenstaude mit reifen, gelben Früchten. Der Affe am Nachbarbaum beobachtet jede Bewegung.",
      take: async (g) => {
        g.set("bananaTaken");
        g.add("banane");
        g.sfx("pickup");
        g.refresh();
        await g.say("Eine reife Banane! Ich schmeiß sie nicht weg.");
      },
    },
    {
      id: "hut",
      name: "Hütte von Mae Ploy",
      rect: [560, 180, 200, 172],
      look: "Die Hütte von Mae Ploy. Trockene Kräuter hängen an der Wand. Unter dem Dach hängt ein Glockenspiel aus Bambus.",
    },
    {
      id: "ploy",
      name: "Mae Ploy",
      actor: "ploy",
      at: { x: 620, y: 396 },
      face: -1,
      look: "Mae Ploy. Sie sieht aus wie jemand, dem die Insel gehört, und der das nicht laut sagen muss.",
      talk: (g) => ployTalk(g),
      give: {
        banane: "„Ich esse keine Bananen vom Affen. Aber danke.“",
      },
    },
    {
      id: "monkey",
      name: "Affe",
      actor: "monkey",
      at: { x: 470, y: 396 },
      face: -1,
      look: (g) => g.say(g.flag("monkeyHasLamp") ? "Der Affe hält meine Stirnlampe fest und schaut frech zurück." : "Ein frecher Affe mit Ohrringen aus Muscheln. Er mustert mich, als wäre ich das Problem."),
      take: "Den Affen nehme ich nicht. Der beißt.",
      talk: async (g) => {
        await g.say("Ooo-ooh!", "monkey");
        if (g.flag("monkeyHasLamp")) await g.say("Der Affe hält die Lampe fest und wedelt damit. Eine Banane wäre ein fairer Tausch.");
      },
      give: {
        banane: async (g) => {
          if (!g.flag("monkeyHasLamp")) return g.say("Der Affe nimmt die Banane und schaut mich an, als wäre das schon alles.");
          g.remove("banane");
          g.sfx("pickup");
          await g.moveActor("monkey", 500, 392, 900);
          g.set("monkeyHasLamp", false);
          g.add("lampe");
          g.refresh();
          await g.say("Der Affe lässt die Lampe fallen, schnappt sich die Banane und verschwindet im Blätterdach.");
          await g.moveActor("monkey", 430, 200, 900);
          g.refresh();
        },
        lampe: "Die Lampe brauche ich. Die gebe ich nicht her.",
      },
    },
  ],
  async enter(g) {
    // Monkey steals the headlamp on the first visit with it.
    if (!g.flag("lampStolen") && g.has("lampe")) {
      g.set("lampStolen");
      await g.wait(400);
      await g.say("Huch! Da war was. Schau mal nach oben…", "hero");
      await g.moveActor("monkey", 110, 396, 1000);
      g.remove("lampe");
      g.set("monkeyHasLamp");
      g.refresh();
      g.sfx("wrong");
      await g.say("Der Affe hat meine Stirnlampe geklaut! Ohne Licht kommt niemand in die Höhle.");
      await g.moveActor("monkey", 440, 360, 800);
      await g.say("Ich brauche eine Banane als Tauschmittel. Die Staude ist gleich hier.");
    }
  },
};

async function ployTalk(g: G) {
  await talk(g, () => [
    {
      text: "Kanntest du meine Großmutter?",
      run: async () => {
        await g.say("Kanntest? Sie ist meine beste Freundin. Oder eher: meine Feindin, die am besten schweigen kann.", "ploy");
        await g.say("Sie hat mir ihr Logbuch vor einem Jahr gegeben. Dann ist sie einfach verschwunden. Nur das Buch ist geblieben.", "ploy");
      },
    },
    {
      text: "Wo ist das Logbuch?",
      run: async () => {
        g.set("ployHint");
        await g.say("In der Höhle an der Klippe. Bei Ebbe kommst du zu Fuß hinein. Die Uhr am Steg zeigt dir die Ebbe.", "ploy");
        await g.say("Nimm eine Lampe mit. Die Höhle ist tief und ohne Licht kommst du nicht heraus.", "ploy");
      },
    },
    {
      text: "Was ist mit Kapitän Sorn?",
      run: async () => {
        await g.say("Sorn verschifft Dinge, die auf keiner Karte stehen. Er hat schon zu viele Boote versenkt, um nicht gefährlich zu sein.", "ploy");
        await g.say("Sei vorsichtig, Kind. Er mag keine Leute, die seine Kisten kennen.", "ploy");
      },
    },
    bye("Geh mit den Geistern des Waldes. Und bring das Logbuch zurück.", "ploy", g),
  ]);
}

/* ===================== CAVE ===================== */
export const kohCave: SceneDef = {
  id: "koh_cave",
  title: "Gezeitenhöhle",
  ambient: "cave",
  walk: [{ x: 20, y: 360 }, { x: 940, y: 360 }, { x: 940, y: 430 }, { x: 20, y: 430 }],
  scale: () => 1,
  hero: heroSprite,
  staticKey: (g) => `${g.flag("logbook") ? 1 : 0}${g.flag("sornHere") ? 1 : 0}`,
  paintStatic(ctx, g) {
    rect(ctx, 0, 0, 960, 440, lin(ctx, 0, 0, 0, 440, [[0, "#0a1218"], [0.6, "#14262a"], [1, "#0a1418"]]));
    // cave ceiling and stalactites
    for (let i = 0; i < 26; i++) {
      const x = (i * 97) % 960;
      const l = 30 + ((i * 53) % 70);
      poly(ctx, [x - 10, 0, x + 10, 0, x, l], shade("#2a3a40", -0.2 + ((i * 17) % 10) / 30));
    }
    // back wall with cracks
    for (let i = 0; i < 16; i++) rock(ctx, 230 + i, (i * 61) % 960, 120 + (i % 4) * 30, 140, 90, "#24343a", "#0a1418");
    // floor and water pool
    poly(ctx, [0, 360, 960, 360, 960, 440, 0, 440], lin(ctx, 0, 360, 0, 440, [[0, "#26343a"], [1, "#0c1418"]]));
    ellipse(ctx, 520, 396, 230, 26, lin(ctx, 0, 370, 0, 420, [[0, "#0a4a5a"], [1, "#02161e"]]));
    // Sorn's smuggling stash
    crate(ctx, 150, 392, 60, 46, "#5a3a20");
    crate(ctx, 210, 392, 60, 46, "#6a4a2a");
    barrel(ctx, 300, 390, 46, 58, "#4a3020");
    // ledge with the logbook
    rect(ctx, 740, 330, 120, 16, lin(ctx, 0, 330, 0, 346, [[0, "#4a3a2a"], [1, "#2a1e14"]]));
    if (!g.flag("logbook")) {
      rect(ctx, 790, 306, 22, 24, "#8a5a32");
      rect(ctx, 792, 308, 18, 20, "#f4e6c0");
      rect(ctx, 798, 310, 2, 16, "#c4422e");
    }
    vignette(ctx, 0.7, "0,6,10");
    grain(ctx, 0.05);
  },
  paintAnim(ctx, t) {
    seaShimmer(ctx, t, 372, 420, 520, "rgba(120,220,220,0.5)", 0.5);
    // dripping water
    for (let i = 0; i < 3; i++) {
      const k = (t * 0.6 + i / 3) % 1;
      ctx.globalAlpha = 1 - k;
      ellipse(ctx, 260 + i * 240, 36 + k * 300, 1.5, 3, "#9ad8e0");
    }
    ctx.globalAlpha = 1;
  },
  paintFront(ctx, _t, g) {
    // darkness with the headlamp light around the hero
    const hx = g.hero.x;
    const hy = g.hero.y - 3 * PX * 2;
    ctx.save();
    ctx.fillStyle = rad(ctx, hx, hy, 110, 380, [[0, "rgba(0,0,0,0)"], [0.45, "rgba(0,0,0,0.25)"], [1, "rgba(0,0,0,0.78)"]]);
    ctx.fillRect(0, 0, 960, 440);
    ctx.restore();
    glow(ctx, hx + 26, hy - 10, 28, "rgba(255,240,170,0.5)");
  },
  actors: [
    {
      id: "sorn",
      name: "Kapitän Sorn",
      color: "#ffb36b",
      x: 30,
      y: 390,
      facing: 1,
      box: [48, 96],
      hidden: (g) => !g.flag("sornHere"),
      draw: (ctx, a) => {
        spriteShadow(ctx, a.x, a.y, PX);
        drawSprite(ctx, SORN, a.x, a.y, PX, { facing: a.facing, legs: "idle", bob: breath(a.t), arms: Math.sin(a.t * 1.3) > 0 ? 1 : 0 });
      },
    },
  ],
  hotspots: [
    {
      id: "toPierW",
      name: "Ausgang zum Steg",
      rect: [0, 290, 70, 150],
      exit: true,
      at: { x: 40, y: 390 },
      look: "Der Ausgang zur Klippe. Dahinter das Licht des Tages.",
      walk: async (g) => {
        g.sfx("door");
        await g.goto("koh_pier", 120, 384, 1);
      },
    },
    {
      id: "logbuch",
      name: "Logbuch",
      rect: [780, 300, 60, 46],
      at: { x: 800, y: 392 },
      hidden: (g) => !!g.flag("logbook"),
      look: "Das Logbuch meiner Großmutter! Auf dem Ledereinband steht ihr Name: Ploy Kham Nang.",
      take: async (g) => {
        g.set("logbook");
        g.add("logbuch");
        g.sfx("fanfare");
        g.refresh();
        await g.say("Das Logbuch! Die Seiten sind feucht, aber lesbar. Ich blättere…");
        await g.say("„Die Schatzkarte ist keine Karte. Sie ist ein Gezeitenkalender. Wer die Ebbe liest, liest die Insel.“", "hero");
        await sornArrives(g);
      },
    },
    {
      id: "crates",
      name: "Kisten",
      rect: [140, 340, 140, 52],
      at: { x: 220, y: 396 },
      look: "Versiegelte Kisten mit Stempeln aus Bangkok. Eine trägt die Aufschrift „Vorsicht: Fische sind nicht die Fracht.“",
      take: "Die Kisten sind nagelfest. Oder eher: Sorn ist nagelfest, wenn es um die Kisten geht.",
    },
    {
      id: "pool",
      name: "Gezeitenbecken",
      rect: [300, 370, 440, 60],
      look: "Ein tiefes Becken aus Salzwasser. Es hebt und senkt sich – ganz langsam, als würde die Insel atmen.",
      use: "Schwimmen in der Höhle? Ohne Taucheranzug? Nein danke.",
    },
  ],
};

async function sornArrives(g: G) {
  g.set("sornHere");
  g.refresh();
  g.sfx("door");
  await g.moveActor("sorn", 720, 396, 2200);
  await g.say("Na, na. Ploys Buch. Gib es mir, Kleine, dann geht ihr beiden in Frieden.", "sorn");
  await g.say("Das Buch bleibt bei mir. Es gehört meiner Familie.", "hero");
  await g.say("Dann eben nicht. Die Flut kommt bald, und Sorn wartet nicht auf Kinder.", "sorn");
  await g.moveActor("sorn", 20, 396, 1800);
  await g.say("Ich hör ihn noch fluchen. Das Logbuch ist sicher bei mir.", "hero");
  g.sfx("horn");
  g.set("sornHere", false);
  g.refresh();
  await g.card("Die Flut kehrt zurück", "Nok verlässt die Höhle mit dem Logbuch");
  g.finish();
}

function sun(ctx: C, x: number, y: number) {
  glow(ctx, x, y, 90, "rgba(255,170,90,0.35)");
  ellipse(ctx, x, y, 22, 22, "#fff3c8");
}
