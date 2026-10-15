import {
  barrel, beam, cloud, crate, ellipse, fireflies, foliage, glow, grade, grain, lin, planks, poly, rad, rect, ridge, rng, rock, seaBase,
  seaShimmer, shade, sky, sun, vignette,
} from "../art";
import { drawCrab, drawHeron, drawParrot, drawPerson, drawWitch, ROSA } from "../people";
import { bye, talk } from "../story";
import type { G, SceneDef } from "../types";
import { depth, drawPatch, patchReady, preloadPatches, stoneWall, vines } from "./common";

preloadPatches("grotto-pearl");

type C = CanvasRenderingContext2D;

/* ===================== DECK ===================== */
export const deck: SceneDef = {
  id: "deck",
  title: "Deck der Rostigen Möwe",
  art: "/art/deck.png",
  artOverlay(ctx, g) {
    if (!g.flag("scope")) {
      ctx.save();
      ctx.translate(375, 352);
      ctx.rotate(-0.1);
      rect(ctx, -26, -5, 52, 10, lin(ctx, 0, -5, 0, 5, [[0, "#ffe9a0"], [0.5, "#c8932c"], [1, "#7a5410"]]));
      ctx.restore();
    }
  },
  ambient: "ship",
  walk: [{ x: 40, y: 360 }, { x: 900, y: 360 }, { x: 900, y: 430 }, { x: 40, y: 430 }],
  scale: depth(360, 0.96, 430, 1.06),
  staticKey: (g) => `${g.flag("fish") ? 1 : 0}${g.flag("scope") ? 1 : 0}`,
  paintStatic(ctx, g) {
    sky(ctx, 250, [[0, "#2a3a7a"], [0.4, "#8a6aa0"], [0.75, "#f08a6a"], [1, "#ffd08a"]]);
    sun(ctx, 640, 236, 30);
    cloud(ctx, 101, 300, 120, 400, 30, "rgba(255,200,180,0.9)", "rgba(160,90,120,0.9)", 0.7);
    cloud(ctx, 102, 820, 80, 300, 22, "rgba(255,220,190,0.9)", "rgba(170,100,130,0.9)", 0.6);
    ridge(ctx, 103, 60, 300, 252, 30, "#5a4a6a", 0.5);
    seaBase(ctx, 248, 340, [[0, "#f0a070"], [0.1, "#6a6a9a"], [1, "#2a3a6a"]]);
    beam(ctx, 640, 248, 40, 640, 340, 200, "rgba(255,210,150,0.6)", 0.5);
    // mast & sails
    const mx = 560;
    rect(ctx, mx - 9, 0, 18, 360, lin(ctx, mx - 9, 0, mx + 9, 0, [[0, "#3a2414"], [0.5, "#8a5a34"], [1, "#2a180c"]]));
    rect(ctx, mx - 220, 40, 440, 10, "#4a2c16");
    ctx.beginPath();
    ctx.moveTo(mx - 210, 50);
    ctx.quadraticCurveTo(mx, 90, mx + 210, 50);
    ctx.lineTo(mx + 190, 200);
    ctx.quadraticCurveTo(mx, 240, mx - 190, 200);
    ctx.closePath();
    ctx.fillStyle = lin(ctx, mx - 200, 0, mx + 200, 0, [[0, "#c9b496"], [0.5, "#f4e6cc"], [1, "#b09a7c"]]);
    ctx.fill();
    ctx.strokeStyle = "#6a5a44";
    ctx.lineWidth = 2;
    ctx.stroke();
    for (let i = 1; i < 4; i++) {
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.moveTo(mx - 200 + i * 100, 60);
      ctx.lineTo(mx - 190 + i * 95, 214);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    // patch with a gull
    ellipse(ctx, mx + 60, 130, 22, 18, "#a08a6c");
    ctx.strokeStyle = "#3a2a1a";
    ctx.beginPath();
    ctx.moveTo(mx + 46, 132);
    ctx.quadraticCurveTo(mx + 53, 122, mx + 60, 132);
    ctx.quadraticCurveTo(mx + 67, 122, mx + 74, 132);
    ctx.stroke();
    // rigging
    ctx.strokeStyle = "rgba(40,24,12,0.8)";
    ctx.lineWidth = 1.5;
    for (const [x0, y0, x1, y1] of [[mx, 10, 60, 300], [mx, 10, 1000, 300], [mx, 60, 160, 300], [mx, 60, 900, 300]]) {
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
    // railing
    rect(ctx, 0, 286, 960, 14, lin(ctx, 0, 286, 0, 300, [[0, "#9a6a40"], [1, "#4a2c16"]]));
    for (let x = 10; x < 960; x += 48) rect(ctx, x, 300, 10, 50, lin(ctx, x, 0, x + 10, 0, [[0, "#6a4228"], [1, "#2a160a"]]));
    rect(ctx, 0, 340, 960, 14, "#3a2010");
    // deck boards
    planks(ctx, 0, 352, 960, 88, "#7a5636", "#2e1c0e", false, 14, 12);
    ctx.fillStyle = lin(ctx, 0, 352, 0, 440, [[0, "rgba(40,10,0,0.45)"], [1, "rgba(0,0,0,0)"]]);
    ctx.fillRect(0, 352, 960, 88);
    // barrel of fish
    barrel(ctx, 140, 380, 60, 74, "#7a5432");
    if (!g.flag("fish")) {
      for (let i = 0; i < 4; i++) {
        ctx.save();
        ctx.translate(124 + i * 10, 308 - (i % 2) * 4);
        ctx.rotate(-0.8 + i * 0.4);
        ellipse(ctx, 0, 0, 5, 14, "#b8c8d4");
        ctx.restore();
      }
    }
    // spyglass crate
    crate(ctx, 410, 384, 56, 40, "#8a6440");
    if (!g.flag("scope")) {
      ctx.save();
      ctx.translate(438, 334);
      ctx.rotate(-0.1);
      rect(ctx, -26, -5, 52, 10, lin(ctx, 0, -5, 0, 5, [[0, "#ffe9a0"], [0.5, "#c8932c"], [1, "#7a5410"]]));
      ctx.restore();
    }
    // wheel
    const wx = 830;
    const wy = 300;
    rect(ctx, wx - 8, wy, 16, 70, "#4a2c16");
    ctx.strokeStyle = "#6a4024";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(wx, wy, 40, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(wx + Math.cos(a) * 56, wy + Math.sin(a) * 56);
      ctx.stroke();
    }
    ellipse(ctx, wx, wy, 10, 10, "#c8932c");
    grade(ctx, "#ffb080", 0.12, "overlay");
    vignette(ctx, 0.45, "40,10,0");
    grain(ctx, 0.05);
  },
  paintAnim(ctx, t) {
    seaShimmer(ctx, t, 252, 290, 640, "rgba(255,230,170,0.95)", 0.7);
    // gulls
    for (let i = 0; i < 3; i++) {
      const x = ((t * (18 + i * 6) + i * 300) % 1100) - 70;
      const y = 60 + i * 30 + Math.sin(t + i) * 8;
      const f = Math.sin(t * 6 + i) * 6;
      ctx.strokeStyle = "#3a2a3a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 10, y - f);
      ctx.quadraticCurveTo(x - 5, y - 4, x, y);
      ctx.quadraticCurveTo(x + 5, y - 4, x + 10, y - f);
      ctx.stroke();
    }
    glow(ctx, 640, 236, 160, "rgba(255,190,120,0.25)", 0.8 + Math.sin(t) * 0.1);
  },
  actors: [
    {
      id: "rosa",
      sprite: {
        frames: { idle: "/chars/rosa-idle.png", talk: "/chars/rosa-talk.png" },
        pick: (a) => (a.talking ? "talk" : "idle"),
      },
      name: "Kapitänin Rosa",
      color: "#ff9d8a",
      x: 700,
      y: 392,
      facing: 1,
      box: [60, 134],
      draw: (ctx, a) => drawPerson(ctx, ROSA, a, { talking: a.talking, t: a.t }),
    },
    {
      id: "parrot",
      sprite: {
        frames: { idle: "/chars/parrot-idle.png", squawk: "/chars/parrot-squawk.png" },
        pick: (a) => (a.talking ? "squawk" : "idle"),
        scale: 1.6,
      },
      name: "Krächz",
      color: "#7dff9a",
      x: 300,
      y: 352,
      facing: 1,
      scale: 1.1,
      box: [36, 60],
      draw: (ctx, a) => drawParrot(ctx, a),
    },
  ],
  hotspots: [
    { id: "sunD", name: "Sonnenaufgang", rect: [560, 155, 70, 50], look: "Ein Sonnenaufgang auf See. Wenn Oma mich jetzt sehen könnte! Sie würde fragen, warum ich nicht an Deck schrubbe." },
    { id: "sail", name: "Segel", rect: [150, 0, 570, 125], look: "Das Großsegel. Jemand hat ein Loch mit einem Möwen-Flicken repariert. Daher der Name, schätze ich." },
    {
      id: "barrelD",
      name: "Fass mit Heringen",
      rect: [0, 255, 115, 150],
      at: { x: 160, y: 400 },
      face: -1,
      look: "Ein Fass voll gepökelter Heringe. Die Bordverpflegung. Für drei Monate. Oder drei Tage, wenn Knut mitfährt.",
      take: async (g) => {
        if (g.flag("fish")) return g.say("Einer reicht. Die anderen schauen mich schon so an.");
        g.set("fish");
        g.add("fisch");
        g.sfx("pickup");
        g.refresh();
        await g.say("Ein Pökelhering. Er riecht nach Abenteuer. Und nach Hering.");
      },
    },
    {
      id: "scope",
      name: "Fernrohr",
      rect: [340, 330, 70, 35],
      at: { x: 375, y: 400 },
      hidden: (g) => !!g.flag("scope"),
      look: "Ein Messing-Fernrohr auf einer Kiste.",
      take: async (g) => {
        g.set("scope");
        g.add("fernrohr");
        g.sfx("pickup");
        g.refresh();
        await g.say("Darf ich das Fernrohr nehmen?");
        await g.say("Nimm's. Aber wenn du es verlierst, wirst du kielgeholt. Mit Liebe.", "rosa");
      },
    },
    {
      id: "wheel",
      name: "Steuerrad",
      rect: [742, 190, 185, 190],
      at: { x: 640, y: 400 },
      face: 1,
      look: "Das Steuerrad der Möwe. Rosa lässt keinen dran. Außer, man hat einen sehr guten Grund.",
      use: (g) => g.say("Ich weiß ja nicht mal, wohin wir segeln sollen. Ich brauche eine Richtung."),
      useWith: {
        kompass: async (g) => {
          await g.say("Ich halte den Kompass ans Steuerrad… Die Nadel zittert… und zeigt nach Südwesten!");
          await g.say("Südwesten? Da liegt die Mangroveninsel. Da wohnt keiner. Nur Krabben und Reiher und… Hexen.", "rosa");
          await g.say("Volle Fahrt voraus!", "rosa");
          g.sfx("horn");
          await g.card("Einen halben Tag später…", "Die Mangroveninsel");
          g.set("arrived");
          await g.goto("mangrove", 140, 412, 1);
        },
      },
    },
    {
      id: "rosa",
      name: "Kapitänin Rosa",
      actor: "rosa",
      at: { x: 600, y: 402 },
      face: 1,
      look: "Rosa steht am Steuer, als wäre sie dort festgewachsen. Der Wind macht ihren Hut nur noch beeindruckender.",
      talk: (g) => rosaDeck(g),
      give: { perle: "„Bring sie zurück in die Bucht, Finn!“" },
    },
    {
      id: "parrot",
      name: "Krächz",
      actor: "parrot",
      at: { x: 330, y: 392 },
      face: -1,
      look: "Krächz, der Bordpapagei. Er hat schon alles gehört, was auf diesem Schiff gesagt wurde. Leider.",
      talk: async (g) => {
        const lines = [
          "Krääh! Spieglein, Spieglein! Hexe hasst Spieglein!",
          "Krääh! Mondlicht! Mondlicht! Wo ist mein Keks?",
          "Krääh! Rosa ist die Beste! Rosa hat mir das beigebracht!",
          "Krääh! Hexe sieht sich selbst! Huiii! Weg ist sie!",
        ];
        const n = Number(g.flag("parrotN") ?? 0);
        g.set("parrotN", n + 1);
        await g.say("Na, Krächz? Was weißt du denn so?");
        await g.say(lines[n % lines.length], "parrot");
      },
      give: { fisch: "„Krääh! Ich bin Vegetarier! Seit heute Morgen!“", kokos: "Krächz pickt einmal drauf. Dann schaut er mich an, als hätte ich ihn beleidigt." },
    },
    {
      id: "seaD",
      name: "Meer",
      rect: [0, 190, 735, 60],
      look: "Wenigstens hier draußen gibt es noch Wasser.",
      useWith: { fernrohr: "Am Horizont im Südwesten: Mangroven. Und ein Reiher mit etwas Glänzendem unter dem Fuß." },
    },
  ],
  async enter(g) {
    if (!g.flag("deckIntro")) {
      g.set("deckIntro");
      await g.say("Willkommen auf der „Rostigen Möwe“, Matrose Kielwasser.", "rosa");
      await g.say("Morwenna hat die Gezeitenperle. Wir brauchen einen Kurs. Hast du nicht einen goldenen Kompass ausgegraben?", "rosa");
    }
  },
};

async function rosaDeck(g: G) {
  await talk(g, () => [
    {
      text: "Wohin segeln wir?",
      run: async () => {
        if (g.flag("arrived")) return g.say("Die Mangroveninsel liegt direkt vor uns. Nimm das Beiboot!", "rosa");
        await g.say("Das sagst du mir! Du bist der mit dem Kompass. Benutz ihn am Steuerrad.", "rosa");
      },
    },
    {
      text: "Wie besiegt man eine Meerhexe?",
      run: async () => {
        await g.say("Meine Oma sagte immer: „Morwenna fürchtet nur eines – sich selbst im Mondlicht zu sehen.“", "rosa");
        await g.say("Sie war nämlich mal die schönste Nixe der Andamanensee. Dann hat sie zu viel geflucht. Das sieht man.", "rosa");
      },
    },
    {
      text: "Wo ist eigentlich Knut?",
      run: async () => {
        await g.say("Unter Deck. Er schläft. Wir glauben, er hat nicht mal gemerkt, dass er an Bord ist.", "rosa");
      },
    },
    {
      text: "Zurück zur Insel!",
      show: () => !!g.flag("arrived"),
      run: async () => {
        await g.goto("mangrove", 140, 412, 1);
        return "end";
      },
    },
    bye("Aye, Matrose.", "rosa", g),
  ]);
}

/* ===================== MANGROVE ===================== */
export const mangrove: SceneDef = {
  id: "mangrove",
  title: "Mangroveninsel",
  art: "/art/mangrove.png",
  artOverlay(ctx, g) {
    if (!g.flag("hornDropped") || g.flag("horn")) return;
    ctx.save();
    ctx.translate(382, 405);
    ctx.rotate(-0.25);
    ellipse(ctx, 0, 9, 26, 6, "rgba(0,0,0,0.35)");
    // spiral conch: pointed spire on the left, wide mouth on the right
    poly(ctx, [-24, 4, -6, -10, 14, -9, 26, 2, 16, 11, -6, 10], lin(ctx, 0, -10, 0, 11, [[0, "#f8e2d0"], [0.6, "#e3ab90"], [1, "#b96f55"]]), "#6a3a2a", 1.5);
    ctx.strokeStyle = "rgba(120,60,40,0.55)";
    ctx.lineWidth = 1.5;
    for (const x of [-14, -6, 2, 10]) {
      ctx.beginPath();
      ctx.moveTo(x, -8 + Math.abs(x) * 0.05);
      ctx.quadraticCurveTo(x + 4, 0, x, 9);
      ctx.stroke();
    }
    ellipse(ctx, 22, 3, 5, 7, "#d9777a");
    ellipse(ctx, 23, 3, 2.5, 4, "#7a2a3a");
    ctx.restore();
  },
  ambient: "jungle",
  walk: [{ x: 40, y: 372 }, { x: 700, y: 362 }, { x: 900, y: 360 }, { x: 944, y: 372 }, { x: 944, y: 430 }, { x: 40, y: 430 }],
  scale: depth(360, 0.9, 430, 1.04),
  staticKey: (g) => `${g.flag("hornDropped") ? 1 : 0}${g.flag("horn") ? 1 : 0}`,
  paintStatic(ctx, g) {
    sky(ctx, 260, [[0, "#7ac0c8"], [0.6, "#c0e0d0"], [1, "#e8f0d8"]]);
    sun(ctx, 760, 70, 22);
    cloud(ctx, 111, 300, 80, 360, 26, "rgba(255,255,255,0.95)", "rgba(180,210,210,0.9)", 0.8);
    ridge(ctx, 112, 0, 600, 250, 70, "#7aa89a", 0.5);
    ridge(ctx, 113, 300, 960, 252, 90, "#5a8a7a", 0.45);
    // haze
    rect(ctx, 0, 200, 960, 60, lin(ctx, 0, 200, 0, 260, [[0, "rgba(230,245,235,0)"], [1, "rgba(230,245,235,0.7)"]]));
    seaBase(ctx, 250, 440, [[0, "#9ac8b8"], [0.2, "#4a8a7a"], [1, "#1a4a44"]]);
    // mangrove trees: root arches
    const tree = (x: number, base: number, s: number, seed: number) => {
      const r = rng(seed);
      ctx.strokeStyle = "#3a3024";
      for (let i = 0; i < 9; i++) {
        const dx = (r() - 0.5) * 140 * s;
        ctx.lineWidth = (3 + r() * 4) * s;
        ctx.beginPath();
        ctx.moveTo(x, base - 90 * s);
        ctx.quadraticCurveTo(x + dx * 0.6, base - 110 * s, x + dx, base + r() * 10);
        ctx.stroke();
      }
      ctx.lineWidth = 14 * s;
      ctx.beginPath();
      ctx.moveTo(x, base - 80 * s);
      ctx.lineTo(x + 4, base - 200 * s);
      ctx.stroke();
      foliage(ctx, seed + 1, x - 110 * s, base - 300 * s, 220 * s, 130 * s, "#1e4a34", "#2e6a46", "#4a8a5a", 50);
    };
    tree(120, 300, 0.9, 121);
    tree(420, 300, 0.7, 122);
    tree(660, 296, 0.8, 123);
    // muddy bank (walkable)
    poly(ctx, [0, 360, 300, 350, 700, 344, 960, 346, 960, 440, 0, 440], lin(ctx, 0, 344, 0, 440, [[0, "#6a6a4a"], [1, "#3a3a28"]]));
    // shallow water pool for the heron
    ellipse(ctx, 340, 404, 120, 22, "rgba(70,130,120,0.7)");
    // bridge to the right
    ctx.save();
    for (let i = 0; i < 9; i++) {
      const x = 760 + i * 24;
      rect(ctx, x, 330 - i * 3, 20, 12, shade("#8a6a44", -0.2 + (i % 2) * 0.1));
    }
    ctx.strokeStyle = "#5a4028";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(760, 300);
    ctx.quadraticCurveTo(860, 300, 980, 270);
    ctx.stroke();
    rect(ctx, 756, 296, 8, 46, "#4a3020");
    ctx.restore();
    foliage(ctx, 124, 840, 140, 140, 150, "#1a3a2a", "#2a5a3a", "#3a7a4a", 40);
    // rowboat
    ctx.save();
    ctx.translate(70, 420);
    poly(ctx, [-60, -12, 60, -12, 44, 10, -44, 10], lin(ctx, 0, -12, 0, 10, [[0, "#7a4b2c"], [1, "#3a2010"]]), "#1e1008", 2);
    rect(ctx, -60, -14, 120, 5, "#a0703f");
    ctx.restore();
    // horn on the ground
    if (g.flag("hornDropped") && !g.flag("horn")) {
      ctx.save();
      ctx.translate(380, 408);
      ctx.rotate(-0.2);
      ellipse(ctx, 0, -6, 18, 9, lin(ctx, -18, 0, 18, 0, [[0, "#f6d7c4"], [1, "#d08f73"]]));
      poly(ctx, [12, -12, 30, -4, 12, 0], "#e3b19a");
      ctx.restore();
    }
    vignette(ctx, 0.35, "10,30,20");
    grain(ctx, 0.05);
  },
  paintAnim(ctx, t) {
    seaShimmer(ctx, t, 256, 340, 760, "rgba(255,255,230,0.8)", 0.6);
    // dragonflies
    fireflies(ctx, t, 125, 6, 200, 220, 600, 100, "rgba(120,220,255,0.6)");
    // drifting mist
    for (let i = 0; i < 4; i++) {
      const x = ((t * 8 + i * 280) % 1300) - 200;
      ctx.globalAlpha = 0.18;
      ellipse(ctx, x, 300 + i * 12, 200, 18, "#f0fff8");
    }
    ctx.globalAlpha = 1;
  },
  actors: [
    {
      id: "crab",
      sprite: {
        frames: { idle: "/chars/crab-idle.png", dance: "/chars/crab-dance.png" },
        pick: (_a, g) => (g.flag("crabDance") ? "dance" : "idle"),
      },
      name: "Sir Kneifzange",
      color: "#ff8a6a",
      x: 830,
      y: 378,
      scale: 0.95,
      box: [160, 110],
      pos: (g) => (g.flag("crabGone") ? { x: 620, y: 420 } : { x: 830, y: 378 }),
      draw: (ctx, a, g) => drawCrab(ctx, a, g.flag("crabDance") ? 1 : 0),
    },
    {
      id: "heron",
      sprite: {
        frames: { idle: "/chars/heron-idle.png" },
        pick: () => "idle",
        after: (ctx, a, g) => {
          if (!g.flag("hornDropped")) {
            ctx.save();
            ctx.translate(a.x + 16, a.y - 4);
            ctx.rotate(-0.2);
            ellipse(ctx, 0, -6, 18, 9, lin(ctx, -18, 0, 18, 0, [[0, "#f6d7c4"], [1, "#d08f73"]]));
            poly(ctx, [12, -12, 30, -4, 12, 0], "#e3b19a");
            ctx.restore();
          }
        },
      },
      name: "Reiher",
      color: "#e0f0ff",
      x: 340,
      y: 404,
      facing: 1,
      scale: 1,
      box: [60, 140],
      draw: (ctx, a, g) => drawHeron(ctx, a, !g.flag("hornDropped")),
    },
  ],
  hotspots: [
    { id: "boatM", name: "Beiboot", rect: [20, 200, 150, 90], exit: true, at: { x: 120, y: 420 }, look: "Unser Beiboot. Damit komme ich zurück zur Möwe.", walk: (g) => g.goto("deck", 300, 400, 1) },
    { id: "trees", name: "Mangroven", rect: [20, 0, 720, 200], look: "Mangroven. Sie stehen auf Stelzen im Wasser, wie Bäume, die nasse Füße hassen." },
    {
      id: "horn",
      name: "Muschelhorn",
      rect: [356, 390, 52, 26],
      at: { x: 420, y: 414 },
      hidden: (g) => !g.flag("hornDropped") || !!g.flag("horn"),
      look: "Das Muschelhorn, das der Reiher bewacht hat.",
      take: async (g) => {
        g.set("horn");
        g.add("horn");
        g.sfx("pickup");
        g.refresh();
        await g.say("Ein Muschelhorn! Ich frage mich, wie es klingt. Wahrscheinlich laut.");
      },
    },
    {
      id: "heron",
      name: "Reiher",
      actor: "heron",
      at: { x: 440, y: 414 },
      face: -1,
      look: (g) => g.say(g.flag("hornDropped") ? "Der Reiher kaut zufrieden auf seinem Hering herum." : "Ein Reiher. Unter seinem Fuß liegt ein großes, gewundenes Muschelhorn. Er bewacht es wie einen Schatz."),
      talk: async (g) => {
        await g.say("Hallo, Herr Reiher. Darf ich mal das Horn…?");
        await g.say("…");
        await g.say("Er starrt mich an. Ich glaube, er hat Hunger.");
      },
      take: (g) => g.say(g.flag("hornDropped") ? "Den Reiher nehme ich nicht mit. Er würde Rosas Heringe fressen." : "Ich versuche, das Horn unter seinem Fuß wegzuziehen… Er hackt nach mir! Autsch."),
      give: {
        fisch: async (g) => {
          if (g.flag("hornDropped")) return g.say("Er hat schon einen Hering. Er ist bescheiden.");
          g.remove("fisch");
          g.set("hornDropped");
          g.sfx("splash");
          g.refresh();
          await g.say("Ich werfe dem Reiher den Hering zu…");
          await g.say("Schnapp! Er lässt das Muschelhorn liegen und stolziert zufrieden zur Seite.");
        },
      },
    },
    {
      id: "crab",
      name: "Sir Kneifzange",
      actor: "crab",
      at: { x: 720, y: 392 },
      face: 1,
      look: (g) => g.say(g.flag("crabGone") ? "Sir Kneifzange tanzt immer noch. Er hat einen Rhythmus gefunden und lässt ihn nicht mehr los." : "Eine riesige Krabbe mit Monokel. Sie sitzt mitten auf der Brücke wie ein gepanzerter Türsteher."),
      talk: (g) => crabTalk(g),
      give: {
        fisch: "„Ein Hering? Bin ich ein Möwenvogel? Ich bin eine Krabbe von Stand!“",
        kokos: "„Eine Kokosnuss? Ich habe schon eine Schale, danke.“",
      },
      useWith: {
        horn: async (g) => {
          if (g.flag("crabGone")) return g.say("Er tanzt schon. Noch mehr Musik und er hebt ab.");
          await g.say("Ich hole tief Luft…");
          g.sfx("horn");
          await g.say("TRÖÖÖÖÖÖÖÖÖT!");
          g.set("crabDance");
          await g.say("Musik! MUSIK! Nach vierzig Jahren! Meine Scheren! Sie bewegen sich von ganz allein!", "crab");
          await g.moveActor("crab", 620, 420, 1800);
          g.set("crabGone");
          await g.say("Tanzen! Ich muss TANZEN! Geh nur, geh! Die Brücke gehört dir!", "crab");
        },
      },
    },
    {
      id: "bridge",
      name: "Brücke",
      rect: [800, 130, 160, 150],
      exit: true,
      at: { x: 930, y: 366 },
      look: "Eine wackelige Brücke tiefer in den Dschungel. Dahinter: Steine. Uralte Steine.",
      walk: async (g) => {
        if (!g.flag("crabGone")) {
          await g.say("Halt! Niemand passiert die Brücke ohne Einladung von Sir Kneifzange!", "crab");
          return;
        }
        await g.goto("temple", 60, 404, 1);
      },
    },
  ],
};

async function crabTalk(g: G) {
  if (g.flag("crabGone")) {
    await g.say("Links, rechts, Schere hoch! Ich bin wieder JUNG!", "crab");
    return;
  }
  await talk(g, () => [
    {
      text: "Wer sind Sie?",
      run: async () => {
        await g.say("Sir Kneifzange der Dritte, Hüter der Brücke, Freiherr der Gezeitentümpel.", "crab");
        await g.say("Morwenna hat mich hier eingesetzt. Bezahlung: ein Tümpel und ein Monokel. Das Monokel war ein Fehler. Ich sehe doppelt.", "crab");
      },
    },
    {
      text: "Wie bekomme ich eine Einladung?",
      run: async () => {
        await g.say("Gar nicht! Es sei denn, jemand bringt mich zum Tanzen.", "crab");
        await g.say("Früher, als junge Krabbe, habe ich jede Nacht getanzt. Aber hier gibt es keine Musik. Seit vierzig Jahren nur Möwen und Gemecker.", "crab");
      },
    },
    {
      text: "Hübsches Monokel.",
      run: async () => {
        await g.say("Danke! Es ist aus echtem Glas. Ich habe es einem Kapitän abgenommen. Mitsamt Kapitän.", "crab");
      },
    },
    bye("Hmpf. Leb wohl, Weichtier.", "crab", g),
  ]);
}

/* ===================== TEMPLE ===================== */
const SYMBOLS = ["voll", "sichel", "halb"] as const;
const ORDER = ["sichel", "halb", "voll"];

export const temple: SceneDef = {
  id: "temple",
  title: "Tempel der Gezeiten",
  art: "/art/temple.png",
  artOverlay(ctx, g) {
    if (!g.flag("doorOpen")) {
      // bottom disc: a clear half moon (the painted one looks like a second crescent)
      ctx.save();
      ctx.beginPath();
      ctx.arc(469, 305, 16, 0, Math.PI * 2);
      ctx.fillStyle = "#25231b";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(469, 305, 14, Math.PI / 2, -Math.PI / 2);
      ctx.closePath();
      ctx.fillStyle = lin(ctx, 455, 291, 469, 319, [[0, "#e4d6aa"], [1, "#a89a72"]]);
      ctx.fill();
      // pressed stones glow
      const pressed = String(g.flag("seq") ?? "").split(",");
      const spots: Record<string, number> = { sichel: 204, voll: 255, halb: 305 };
      for (const k of pressed) if (spots[k]) glow(ctx, 469, spots[k], 34, "rgba(150,230,255,0.75)");
      ctx.restore();
    }
    if (g.flag("doorOpen")) {
      ctx.fillStyle = rad(ctx, 470, 300, 10, 150, [[0, "#1a3a4a"], [1, "#04080a"]]);
      ctx.fillRect(404, 154, 134, 172);
      rect(ctx, 452, 312, 36, 16, "#5a5a48");
      if (!g.flag("mirror")) {
        ellipse(ctx, 470, 296, 18, 18, "#c9b36a");
        ellipse(ctx, 470, 296, 14, 14, lin(ctx, 456, 282, 484, 310, [[0, "#f0f6ff"], [1, "#5a6c8c"]]));
      }
    }
  },
  ambient: "jungle",
  walk: [{ x: 20, y: 376 }, { x: 720, y: 376 }, { x: 720, y: 432 }, { x: 20, y: 432 }],
  scale: depth(372, 0.95, 432, 1.05),
  staticKey: (g) => `${g.flag("doorOpen") ? 1 : 0}${g.flag("mirror") ? 1 : 0}${String(g.flag("seq") ?? "")}`,
  paintStatic(ctx, g) {
    sky(ctx, 440, [[0, "#9ad0b8"], [0.5, "#4a8a6a"], [1, "#1a3a2a"]]);
    foliage(ctx, 131, -40, 0, 1040, 240, "#143a26", "#22583a", "#3a7a4a", 90);
    // temple facade
    stoneWall(ctx, 280, 110, 400, 270, "#8a8a74", 132);
    poly(ctx, [260, 116, 480, 30, 700, 116], lin(ctx, 0, 30, 0, 116, [[0, "#a0a088"], [1, "#5a5a48"]]));
    // carved face over door
    ellipse(ctx, 480, 82, 36, 24, "#6a6a56");
    ellipse(ctx, 468, 78, 6, 4, "#2a2a20");
    ellipse(ctx, 492, 78, 6, 4, "#2a2a20");
    ctx.strokeStyle = "#2a2a20";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(480, 88, 10, 0.2, Math.PI - 0.2);
    ctx.stroke();
    // pillars
    for (const x of [300, 640]) rect(ctx, x, 120, 30, 260, lin(ctx, x, 0, x + 30, 0, [[0, "#5a5a48"], [0.5, "#b0b098"], [1, "#4a4a3a"]]));
    // doorway
    rect(ctx, 400, 170, 160, 210, "#0c0a08");
    if (!g.flag("doorOpen")) {
      rect(ctx, 404, 174, 152, 206, lin(ctx, 404, 0, 556, 0, [[0, "#5a5a48"], [0.5, "#8a8a72"], [1, "#4a4a3a"]]));
      const seq = String(g.flag("seq") ?? "");
      SYMBOLS.forEach((s, i) => {
        const x = 434 + i * 46;
        const pressed = seq.split(",").includes(s);
        ellipse(ctx, x, 260, 19, 19, pressed ? "#3a6a6a" : "#4a4a3a");
        ellipse(ctx, x, 260, 15, 15, pressed ? "#6ad0c8" : "#b8b8a0");
        moonGlyph(ctx, x, 260, s, pressed ? "#0c3a38" : "#3a3a2a");
      });
    } else {
      ctx.fillStyle = rad(ctx, 480, 300, 10, 160, [[0, "#1a3a4a"], [1, "#050808"]]);
      ctx.fillRect(404, 174, 152, 206);
      // pedestal
      rect(ctx, 462, 320, 36, 60, "#5a5a48");
      rect(ctx, 454, 312, 52, 10, "#7a7a64");
      if (!g.flag("mirror")) {
        ellipse(ctx, 480, 292, 18, 18, "#c9b36a");
        ellipse(ctx, 480, 292, 14, 14, lin(ctx, 466, 278, 494, 306, [[0, "#f0f6ff"], [1, "#5a6c8c"]]));
      }
    }
    // mural on left
    stoneWall(ctx, 40, 150, 200, 200, "#7a7a66", 133);
    rect(ctx, 56, 168, 168, 120, "#4a4a3a");
    rect(ctx, 60, 172, 160, 112, lin(ctx, 0, 172, 0, 284, [[0, "#c8b890"], [1, "#9a8a6a"]]));
    ["sichel", "halb", "voll"].forEach((s, i) => {
      moonGlyph(ctx, 90 + i * 50, 204, s, "#3a2a1a");
      if (i < 2) {
        ctx.fillStyle = "#3a2a1a";
        ctx.font = "20px serif";
        ctx.fillText("→", 108 + i * 50, 210);
      }
    });
    ctx.strokeStyle = "#2a5a7a";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 64; x < 216; x += 4) ctx.lineTo(x, 252 + Math.sin(x * 0.12) * 6);
    ctx.stroke();
    // ground
    ctx.fillStyle = lin(ctx, 0, 360, 0, 440, [[0, "#4a5a3a"], [1, "#22301c"]]);
    ctx.fillRect(0, 370, 960, 70);
    for (let i = 0; i < 9; i++) rect(ctx, 330 + i * 34, 380 + (i % 2) * 6, 30, 10, "#7a7a64");
    vines(ctx, 134, 260, 110, 440, 140, "#2a6a3a");
    // broken statue right
    rock(ctx, 135, 820, 380, 120, 120, "#8a8a74", "#3a3a2e");
    ellipse(ctx, 820, 290, 30, 28, "#7a7a66");
    foliage(ctx, 136, 700, 300, 260, 90, "#143a26", "#22583a", "#3a7a4a", 30);
    grade(ctx, "#ffe8b0", 0.12, "overlay");
    vignette(ctx, 0.45, "0,20,10");
    grain(ctx, 0.05);
  },
  paintAnim(ctx, t, g) {
    beam(ctx, 620, 0, 60, 520, 380, 200, "rgba(255,250,200,0.8)", 0.18);
    beam(ctx, 180, 0, 40, 120, 380, 140, "rgba(255,250,200,0.8)", 0.12);
    // butterflies
    for (let i = 0; i < 4; i++) {
      const x = 200 + i * 180 + Math.sin(t * 0.7 + i) * 60;
      const y = 200 + Math.cos(t * 0.9 + i * 2) * 50;
      const f = Math.abs(Math.sin(t * 10 + i));
      ellipse(ctx, x - 5 * f, y, 6 * f + 1, 5, i % 2 ? "#ffcf4a" : "#6ae0ff");
      ellipse(ctx, x + 5 * f, y, 6 * f + 1, 5, i % 2 ? "#ffcf4a" : "#6ae0ff");
    }
    if (g.flag("doorOpen") && !g.flag("mirror")) glow(ctx, 480, 292, 50, "rgba(200,220,255,0.6)", 0.6 + Math.sin(t * 2) * 0.2);
    vines(ctx, 137, 0, 0, 960, 90, "#2a6a3a", t);
  },
  hotspots: [
    { id: "toMangrove", name: "Zur Brücke", rect: [0, 340, 40, 100], exit: true, at: { x: 22, y: 410 }, walk: (g) => g.goto("mangrove", 900, 380, -1) },
    {
      id: "mural",
      name: "Wandbild",
      rect: [0, 115, 285, 170],
      at: { x: 150, y: 392 },
      look: async (g) => {
        await g.say("Ein Wandbild: eine schmale Sichel, ein halber Mond, ein voller Mond. Darunter Wellen.");
        await g.say("Und eine Inschrift: „Wächst die Sichel bis zur Hälfte und die Hälfte bis zum Rund, öffnet sich des Meeres Mund.“");
      },
    },
    { id: "face", name: "Steingesicht", rect: [430, 20, 80, 80], look: "Ein steinernes Gesicht. Es lächelt so, als wüsste es, dass ich gleich etwas falsch mache." },
    ...SYMBOLS.map((s, i) => ({
      id: "sym_" + s,
      name: s === "voll" ? "Vollmond-Stein" : s === "sichel" ? "Sichelmond-Stein" : "Halbmond-Stein",
      rect: (s === "sichel" ? [450, 187, 40, 40] : s === "voll" ? [450, 235, 40, 40] : [450, 280, 40, 40]) as [number, number, number, number],
      at: { x: 392, y: 396 },
      face: 1 as const,
      hidden: (g: G) => !!g.flag("doorOpen"),
      look: "Ein runder Stein mit einem Mondsymbol. Er sitzt fest im Tor. Mit „Benutze“ kann man ihn hineindrücken.",
      use: (g: G) => pressSymbol(g, s),
      take: "Er ist fest im Tor verankert. Aber man kann ihn drücken.",
    })),
    {
      id: "door",
      name: (g) => (g.flag("doorOpen") ? "Tempeleingang" : "Steintor"),
      rect: [398, 140, 145, 190],
      at: { x: 480, y: 392 },
      exit: true,
      zone: (g) => !!g.flag("doorOpen") && !!g.flag("mirror"),
      look: async (g) => {
        await g.say(g.flag("doorOpen") ? "Das Tor ist offen. Von drinnen weht kalte, salzige Luft." : "Ein Steintor mit drei runden Mondsteinen. Kein Schlüsselloch. Nur Rätsel. Ich hasse Rätsel. Ich liebe Rätsel.");
        if (!g.flag("doorOpen")) await g.say("Die Mondsteine sitzen fest im Tor. Ich muss sie drücken – nur in welcher Reihenfolge? Das Wandbild links verrät es bestimmt.");
      },
      walk: async (g) => {
        if (!g.flag("doorOpen")) return g.say("Das Tor ist verschlossen. Ich muss die drei Mondsteine im Tor drücken – das Wandbild links verrät die Reihenfolge.");
        if (!g.flag("mirror")) await g.say("Erst sollte ich mir das Ding auf dem Sockel ansehen.");
        await g.goto("grotto", 80, 410, 1);
      },
      use: (g) => g.say(g.flag("doorOpen") ? "Es ist schon offen." : "Ich sollte die Mondsteine drücken."),
    },
    {
      id: "mirror",
      name: "Mondspiegel",
      rect: [456, 270, 48, 44],
      at: { x: 480, y: 392 },
      hidden: (g) => !g.flag("doorOpen") || !!g.flag("mirror"),
      look: "Ein runder Spiegel auf einem Sockel. Er schimmert silbern wie Mondlicht.",
      take: async (g) => {
        g.set("mirror");
        g.add("spiegel");
        g.sfx("magic");
        g.refresh();
        await g.say("Ein Mondspiegel! Rosas Oma: „Zeig ihr den Spiegel.“ Krächz: „Hexe hasst Spieglein!“ Langsam ergibt alles Sinn.");
      },
    },
    { id: "statue", name: "Zerbrochene Statue", rect: [758, 160, 200, 240], look: "Eine Statue einer Nixe. Ihr Gesicht wurde weggekratzt. Jemand mochte sein Spiegelbild nicht." },
  ],
};

function moonGlyph(ctx: C, x: number, y: number, s: string, col: string) {
  ctx.save();
  ctx.fillStyle = col;
  if (s === "voll") {
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI * 2);
    ctx.fill();
  } else if (s === "halb") {
    ctx.beginPath();
    ctx.arc(x, y, 10, -Math.PI / 2, Math.PI / 2);
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.beginPath();
    ctx.arc(x, y, 10, -Math.PI / 2, Math.PI / 2);
    ctx.arc(x - 6, y, 9, Math.PI / 2, -Math.PI / 2, true);
    ctx.fill();
  }
  ctx.restore();
}

async function pressSymbol(g: G, s: string) {
  const seq = String(g.flag("seq") ?? "").split(",").filter(Boolean);
  if (seq.includes(s)) return g.say("Der ist schon gedrückt.");
  seq.push(s);
  g.sfx("door");
  const ok = seq.every((v, i) => ORDER[i] === v);
  if (!ok) {
    g.set("seq", seq.join(","));
    g.refresh();
    await g.say("*klack*");
    await g.wait(300);
    g.set("seq", "");
    g.sfx("wrong");
    g.refresh();
    await g.say("Rrrumpel… Alle Steine springen wieder heraus. Falsche Reihenfolge.");
    return;
  }
  g.set("seq", seq.join(","));
  g.refresh();
  if (seq.length === 3) {
    await g.say("*klack*");
    g.sfx("magic");
    g.set("doorOpen");
    g.refresh();
    await g.say("RRRRUMMMBLE! Das Tor gleitet in den Boden. Ha! Sichel, Hälfte, Rund!");
    await g.say("Auf einem Sockel im Eingang liegt etwas Glänzendes.");
  } else await g.say("*klack* Der Stein bleibt drin.");
}

/* ===================== GROTTO ===================== */
export const grotto: SceneDef = {
  id: "grotto",
  title: "Morwennas Grotte",
  art: "/art/grotto.png",
  artOverlay(ctx, g) {
    if (g.flag("pearl")) drawPatch(ctx, "grotto-pearl", 705, 159);
  },
  ambient: "cave",
  walk: [{ x: 20, y: 372 }, { x: 420, y: 364 }, { x: 560, y: 404 }, { x: 940, y: 404 }, { x: 940, y: 432 }, { x: 20, y: 432 }],
  scale: depth(364, 0.95, 432, 1.05),
  staticKey: (g) => `${g.flag("witchDone") ? 1 : 0}${g.flag("pearl") ? 1 : 0}${patchReady("grotto-pearl") ? 1 : 0}`,
  paintStatic(ctx, g) {
    rect(ctx, 0, 0, 960, 440, lin(ctx, 0, 0, 0, 440, [[0, "#04080e"], [0.6, "#0a1a2a"], [1, "#061018"]]));
    // cave walls
    const r = rng(141);
    for (let i = 0; i < 20; i++) {
      const x = r() * 960;
      rock(ctx, 142 + i, x, 40 + r() * 60, 120 + r() * 100, -120 - r() * 60, "#1a2a3a", "#060a10");
    }
    // ceiling hole with moon (always midnight in here)
    ctx.fillStyle = rad(ctx, 240, 20, 4, 70, [[0, "#3a4a8a"], [1, "rgba(10,20,40,0)"]]);
    ctx.fillRect(160, 0, 160, 80);
    ellipse(ctx, 240, 18, 40, 18, "#0c1430");
    ellipse(ctx, 252, 14, 10, 6, "#fff6dc");
    // stalactites
    for (let i = 0; i < 26; i++) {
      const x = r() * 960;
      const l = 30 + r() * 70;
      poly(ctx, [x - 8, 0, x + 8, 0, x + 1, l], shade("#1e2e3e", -0.2 + r() * 0.3));
    }
    // ground
    poly(ctx, [0, 360, 300, 350, 440, 356, 560, 396, 960, 392, 960, 440, 0, 440], lin(ctx, 0, 350, 0, 440, [[0, "#1e2e3a"], [1, "#0a1218"]]));
    // pool
    ellipse(ctx, 660, 330, 260, 60, lin(ctx, 0, 270, 0, 390, [[0, "#0a4a5a"], [1, "#02161e"]]));
    ellipse(ctx, 660, 330, 250, 54, "rgba(60,200,220,0.15)");
    // moon-lit rock in the beam
    rock(ctx, 150, 250, 366, 70, 26, "#4a5a7a", "#1a2230");
    // bioluminescence
    for (let i = 0; i < 70; i++) {
      const x = r() * 960;
      const y = 60 + r() * 300;
      glow(ctx, x, y, 3 + r() * 6, r() > 0.5 ? "rgba(80,255,220,0.8)" : "rgba(120,160,255,0.8)", 0.6);
    }
    if (g.flag("witchDone")) glow(ctx, 660, 300, 300, "rgba(120,200,255,0.15)");
    vignette(ctx, 0.6);
    grain(ctx, 0.05);
  },
  paintAnim(ctx, t, g) {
    // moonbeam
    beam(ctx, 248, 12, 30, 252, 372, 90, "rgba(220,230,255,0.95)", 0.28 + Math.sin(t * 0.8) * 0.03);
    glow(ctx, 252, 364, 60, "rgba(220,230,255,0.6)", 0.5);
    // whirlpool
    if (!g.flag("pearl")) {
      ctx.save();
      ctx.translate(660, 330);
      ctx.scale(1, 0.22);
      for (let i = 0; i < 6; i++) {
        ctx.strokeStyle = `rgba(140,240,255,${0.35 - i * 0.05})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, 30 + i * 30, t * (2 - i * 0.2) + i, t * (2 - i * 0.2) + i + 4);
        ctx.stroke();
      }
      ctx.restore();
      const py = 220 + Math.sin(t * 1.5) * 8;
      glow(ctx, 660, py, 90, "rgba(140,230,255,0.7)", 0.8 + Math.sin(t * 3) * 0.2);
      ellipse(ctx, 660, py, 14, 14, rad(ctx, 655, py - 5, 1, 16, [[0, "#ffffff"], [0.5, "#c8eef8"], [1, "#6ab0d0"]]));
      beam(ctx, 660, py, 4, 660, 330, 60, "rgba(140,230,255,0.8)", 0.12);
    }
    if (g.flag("reflect")) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.strokeStyle = "rgba(230,240,255,0.9)";
      ctx.lineWidth = 8;
      ctx.beginPath();
      const hx = g.hero.x + 14;
      const hy = g.hero.y - 70;
      ctx.moveTo(hx, hy);
      ctx.lineTo(800, 220);
      ctx.stroke();
      ctx.restore();
      glow(ctx, 800, 220, 120, "rgba(230,240,255,0.9)");
    }
    fireflies(ctx, t, 151, 14, 100, 100, 800, 220, "rgba(90,255,220,0.8)");
  },
  actors: [
    {
      id: "morwenna",
      sprite: {
        frames: { idle: "/chars/morwenna-idle.png", talk: "/chars/morwenna-talk.png", cucumber: "/chars/morwenna-cucumber.png" },
        pick: (a, g) => (g.flag("witchDone") ? "cucumber" : a.talking ? "talk" : "idle"),
        float: (g) => (g.flag("witchDone") ? 0 : 6),
      },
      name: "Morwenna",
      color: "#8fffe0",
      x: 800,
      y: 360,
      facing: -1,
      scale: 1.05,
      box: [100, 220],
      pos: (g) => (g.flag("witchDone") ? { x: 860, y: 412 } : { x: 800, y: 360 }),
      draw: (ctx, a, g) => drawWitch(ctx, a, !!g.flag("witchDone")),
    },
  ],
  hotspots: [
    { id: "toTemple", name: "Ausgang", rect: [0, 300, 40, 140], exit: true, at: { x: 22, y: 410 }, walk: (g) => g.goto("temple", 480, 396, -1) },
    {
      id: "beamG",
      name: "Mondstrahl",
      rect: [105, 10, 200, 350],
      at: { x: 252, y: 384 },
      look: "Ein Mondstrahl fällt durch ein Loch in der Decke. In Morwennas Grotte ist immer Mitternacht.",
      use: "Ich stelle mich ins Mondlicht. Ich fühle mich sehr bedeutungsvoll. Sonst passiert nichts.",
      useWith: {
        spiegel: async (g) => {
          if (g.flag("witchDone")) return g.say("Sie ist schon eine Seegurke. Mehr Spiegel braucht's nicht.");
          await g.say("Ich halte den Mondspiegel in den Strahl… und drehe ihn… genau auf Morwenna!");
          g.sfx("magic");
          g.set("reflect");
          await g.say("Was soll das? Licht? In MEINER Grotte? Nimm das weg!", "morwenna");
          await g.say("Was ist… WER ist DAS? Diese Haare! Diese Warze! DAS BIN JA ICH!", "morwenna");
          g.flash("#e8f4ff", 1200);
          await g.say("NEEEEIIIIIIN! Ich hab mich seit dreihundert Jahren nicht mehr angesehen!", "morwenna");
          g.set("witchDone");
          g.set("reflect", false);
          g.refresh();
          await g.moveActor("morwenna", 860, 412, 900);
          await g.wait(600);
          await g.say("…Sie ist zu einer kleinen, sehr beleidigten Seegurke geschrumpft.");
          await g.say("Blubb. Ich hasse dich. Blubb.", "morwenna");
          await g.say("Jetzt kann ich mir die Gezeitenperle holen!");
        },
      },
    },
    {
      id: "pearl",
      name: "Gezeitenperle",
      rect: [700, 150, 65, 65],
      at: { x: 700, y: 404 },
      hidden: (g) => !!g.flag("pearl"),
      look: "Die Gezeitenperle! Sie schwebt über dem Strudel und pulsiert wie ein Herz aus Meerwasser.",
      take: async (g) => {
        if (!g.flag("witchDone")) {
          await g.say("Ich strecke die Hand aus…");
          g.flash("#3affd0", 500);
          g.sfx("wrong");
          await g.say("FINGER WEG, Möchtegern! Die Perle gehört mir! Noch ein Schritt und du wirst zu Seetang!", "morwenna");
          await g.walk(460, 400);
          await g.say("Autsch. Ich brauche einen Plan. Einen, bei dem ich kein Seetang werde.");
          return;
        }
        g.set("pearl");
        g.add("perle");
        g.sfx("fanfare");
        g.refresh();
        await g.say("Die Gezeitenperle! Sie ist warm wie eine Hand und kühl wie die Flut zugleich.");
        await finale(g);
      },
    },
    {
      id: "pool",
      name: "Strudel",
      rect: [495, 235, 435, 140],
      look: "Ein Strudel im Grottenteich. Er dreht sich um die Perle wie ein Wachhund um seinen Knochen.",
      use: "Schwimmen im Hexenstrudel? Ich habe gerade erst gelernt, auf dem Steg zu stehen.",
    },
    {
      id: "morwenna",
      name: (g) => (g.flag("witchDone") ? "Seegurke Morwenna" : "Morwenna"),
      actor: "morwenna",
      at: { x: 560, y: 410 },
      face: 1,
      look: (g) => g.say(g.flag("witchDone") ? "Eine Seegurke mit einem sehr bösen Blick." : "Morwenna, die Meerhexe. Ihre Haare schweben, ihre Augen glühen, ihre Laune ist katastrophal."),
      talk: (g) => witchTalk(g),
      useWith: {
        spiegel: (g) => g.say(g.flag("witchDone") ? "Sie hat genug gesehen." : "Hier drin ist es zu dunkel. Sie würde sich im Spiegel gar nicht sehen. Ich brauche Licht – Mondlicht!"),
        horn: "Ich blase ins Horn. Morwenna hält sich die Ohren zu. „Schräg! Und nicht mal im Takt!“",
      },
      give: { fisch: "„Ein Hering? Ich bin die Herrin der Meere, kein Pinguin!“" },
    },
  ],
  async enter(g) {
    if (!g.flag("grottoIntro")) {
      g.set("grottoIntro");
      await g.say("Sieh an, sieh an. Der kleine Leuchtturm-Junge.", "morwenna");
      await g.say("Du kommst, um die Perle zu holen? Hier unten, in meiner ewigen Mitternacht? Wie niedlich.", "morwenna");
    }
  },
};

async function witchTalk(g: G) {
  if (g.flag("witchDone")) {
    await g.say("Blubb. Sprich mich nicht an. Blubb.", "morwenna");
    return;
  }
  await talk(g, () => [
    {
      text: "Gib die Gezeitenperle zurück!",
      run: async () => {
        await g.say("Zurück? Die Menschen haben sie nie verdient. Sie haben das Meer vermüllt, gefischt, beschallt mit ihren schiefen Shantys!", "morwenna");
        await g.say("Na gut, die Shantys waren schon schief.");
      },
    },
    {
      text: "Warum versteckst du dich hier im Dunkeln?",
      run: async () => {
        await g.say("Im Dunkeln sieht man keine Spiegelbilder. Das Dunkel ist ehrlich. Das Dunkel schmeichelt.", "morwenna");
        await g.say("Interessant. Sehr interessant.");
      },
    },
    {
      text: "Du hast da was im Gesicht.",
      run: async () => {
        await g.say("WAS? Wo? Nein! Ich sehe nicht nach! Ich sehe NIE nach!", "morwenna");
      },
    },
    bye("Geh nur. Und komm nie wieder. Oder als Seetang.", "morwenna", g),
  ]);
}

async function finale(g: G) {
  await g.fade(1, 600);
  await g.card("Am Abend…", "Die Flut kehrt nach Krabbenbucht zurück");
  g.set("tideGone", false);
  await g.goto("pier", 560, 380, 1);
  await g.say("Das Meer ist wieder da! Und wie! Mit Wellen und allem!", "barnabas");
  await g.say("Ich hab's geschafft. Licht, Richtung, ein Lied – und eine Perle obendrauf.");
  await g.say("Und Morwenna? Sie wohnt jetzt in einem Glas in Pfefferkorns Laden. Neben dem Kugelfisch. Die zwei verstehen sich prächtig.");
  await g.wait(500);
  await g.fade(1, 700);
  await g.card("Monate später…", "Eine Insel vor Krabi, weit im Süden");
  g.beginChapter(["lampe"]);
  await g.card("Kapitel 3", "Die Gezeitenhöhle von Koh Kham Nang");
  await g.goto("koh_pier", 780, 384, 1);
}

