import {
  barrel, beam, cloud, crate, ellipse, fireflies, flame, foliage, glow, grade, grain, lantern, lin, moon, palm, planks, poly, rad, rect, ridge, rng,
  rock, seaBase, seaShimmer, shade, sign, sky, stars, twinkle, vignette, window_,
} from "../art";
import { BARNABAS, drawPerson, drawWitch, KNUT, MO, PFEFFERKORN, ROSA, ZACHARIAS } from "../people";
import { bye, duel, learned, talk, teach } from "../story";
import type { G, SceneDef } from "../types";
import { cobbles, depth, house, lamppost, lampGlow } from "./common";

type C = CanvasRenderingContext2D;

const nightSky = (ctx: C, y1: number) =>
  sky(ctx, y1, [
    [0, "#060a20"],
    [0.45, "#161a44"],
    [0.78, "#3d2a5a"],
    [1, "#b0605a"],
  ]);

const questDone = (g: G) => !!(g.flag("lit") && g.has("kompass") && g.has("medaille"));

/* ===================== PIER ===================== */
export const pier: SceneDef = {
  id: "pier",
  title: "Der alte Steg",
  art: "/art/pier.png",
  ambient: "sea",
  walk: [{ x: 0, y: 332 }, { x: 960, y: 350 }, { x: 960, y: 432 }, { x: 0, y: 432 }],
  scale: depth(330, 0.9, 408, 1.04),
  staticKey: (g) => `${g.flag("rope") ? 1 : 0}${g.flag("tideGone") ? 1 : 0}`,
  paintStatic(ctx, g) {
    const gone = !!g.flag("tideGone");
    nightSky(ctx, 262);
    stars(ctx, 11, 260, 230);
    moon(ctx, 720, 86, 30);
    cloud(ctx, 3, 280, 130, 380, 30, "rgba(110,95,160,0.9)", "rgba(40,30,70,0.9)", 0.5);
    cloud(ctx, 5, 860, 180, 300, 20, "rgba(220,130,130,0.7)", "rgba(70,40,80,0.8)", 0.45);
    ridge(ctx, 21, 40, 430, 254, 52, "#241c44", 0.55);
    ridge(ctx, 22, 280, 660, 256, 26, "#33284f", 0.4);
    if (!gone) {
      seaBase(ctx, 252, 440, [[0, "#5d4a78"], [0.06, "#2d3568"], [1, "#071026"]]);
      beam(ctx, 720, 252, 30, 720, 330, 140, "rgba(255,230,190,0.35)", 0.5);
    } else {
      seaBase(ctx, 252, 440, [[0, "#4b3a52"], [0.08, "#3d3036"], [1, "#1f1812"]]);
      const r = rng(4);
      for (let i = 0; i < 26; i++) {
        const x = r() * 960;
        const y = 262 + r() * 170;
        ellipse(ctx, x, y, 20 + r() * 60, 3 + r() * 6, "rgba(120,130,190,0.25)");
      }
      for (let i = 0; i < 10; i++) {
        const x = r() * 640;
        const y = 270 + r() * 40;
        ellipse(ctx, x, y, 7, 2.5, "#b8c4d0");
        poly(ctx, [x + 6, y, x + 12, y - 4, x + 12, y + 4], "#9aa6b2");
      }
    }
    rect(ctx, 0, 250, 960, 5, "rgba(255,190,150,0.25)");
    // shore + town
    poly(ctx, [620, 440, 650, 330, 720, 300, 960, 292, 960, 440], lin(ctx, 0, 292, 0, 440, [[0, "#3c3346"], [1, "#16121c"]]));
    house(ctx, 735, 300, 70, 70, "#4a3f5a", "#2a2236", 8);
    house(ctx, 818, 296, 80, 92, "#55465e", "#30243a", 9);
    house(ctx, 905, 298, 70, 64, "#4a3d52", "#2b2033", 10);
    poly(ctx, [700, 340, 960, 330, 960, 440, 680, 440], lin(ctx, 0, 330, 0, 440, [[0, "#4b4048"], [1, "#221c24"]]));
    // back railing posts with rope
    for (let x = 20; x < 700; x += 112) {
      rect(ctx, x, 268, 10, 56, lin(ctx, x, 0, x + 10, 0, [[0, "#3a2c22"], [1, "#1c140e"]]));
      ellipse(ctx, x + 5, 268, 5, 2, "#4a3a2c");
    }
    ctx.strokeStyle = "#7a6248";
    ctx.lineWidth = 2;
    for (let x = 20; x + 112 < 700; x += 112) {
      ctx.beginPath();
      ctx.moveTo(x + 5, 278);
      ctx.quadraticCurveTo(x + 61, 298, x + 117, 278);
      ctx.stroke();
    }
    // rowboat in the back water
    ctx.save();
    if (gone) {
      ctx.translate(440, 312);
      ctx.rotate(0.12);
    } else ctx.translate(440, 306);
    poly(ctx, [-70, -14, 70, -14, 52, 10, -52, 10], lin(ctx, 0, -14, 0, 10, [[0, "#7a4b2c"], [1, "#3a2010"]]), "#1e1008", 2);
    rect(ctx, -70, -16, 140, 5, "#a0703f");
    rect(ctx, -10, -24, 4, 12, "#2a1a0e");
    ctx.restore();
    // deck
    planks(ctx, 0, 318, 700, 92, "#5c4838", "#2a1e16", true, 26, 4);
    ctx.fillStyle = lin(ctx, 0, 318, 0, 410, [[0, "rgba(10,10,30,0.45)"], [1, "rgba(0,0,0,0)"]]);
    ctx.fillRect(0, 318, 700, 92);
    poly(ctx, [690, 318, 720, 318, 720, 410, 700, 410], "#2a1e16");
    rect(ctx, 0, 408, 700, 12, "#22170f");
    for (let x = 10; x < 700; x += 70) {
      rect(ctx, x, 418, 16, 30, "#1c120b");
      if (!gone) {
        ctx.globalAlpha = 0.25;
        rect(ctx, x, 430, 16, 10, "#7a90c0");
        ctx.globalAlpha = 1;
      }
    }
    // crates & barrels
    crate(ctx, 22, 342, 58, 52, "#6e5034");
    crate(ctx, 36, 292, 40, 34, "#5e432a");
    barrel(ctx, 108, 346, 40, 54);
    // lantern post
    rect(ctx, 168, 196, 9, 150, lin(ctx, 168, 0, 177, 0, [[0, "#3a2c22"], [1, "#16100b"]]));
    rect(ctx, 168, 196, 36, 6, "#2a1e16");
    lantern(ctx, 200, 222, 28, 1);
    // bollard + rope
    ellipse(ctx, 562, 352, 22, 7, "rgba(0,0,0,0.4)");
    rect(ctx, 546, 318, 32, 34, lin(ctx, 546, 0, 578, 0, [[0, "#2c2a30"], [0.4, "#6a6670"], [1, "#1a181e"]]));
    ellipse(ctx, 562, 318, 18, 6, "#4a4650");
    if (!g.flag("rope")) {
      ctx.strokeStyle = "#b8925a";
      ctx.lineWidth = 4;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(562, 332 + i * 3, 20 - i, 6, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.moveTo(580, 340);
      ctx.quadraticCurveTo(600, 360, 590, 372);
      ctx.stroke();
    }
    vignette(ctx, 0.5);
    grain(ctx, 0.05);
  },
  paintAnim(ctx, t, g) {
    twinkle(ctx, 31, 18, 230, t);
    if (!g.flag("tideGone")) {
      seaShimmer(ctx, t, 256, 318, 720, "rgba(255,236,200,0.9)");
      seaShimmer(ctx, t + 3, 418, 440, 600, "rgba(200,210,255,0.6)", 0.3);
    }
    lampGlow(ctx, 200, 222, t, 150);
    glow(ctx, 210, 372, 120, "rgba(255,160,80,0.18)");
    // town windows twinkle
    glow(ctx, 860, 250, 60, "rgba(255,180,90,0.15)", 0.6 + 0.2 * Math.sin(t * 2));
  },
  actors: [
    {
      id: "barnabas",
      sprite: {
        frames: { idle: "/chars/barnabas-idle.png", talk: "/chars/barnabas-talk.png" },
        pick: (a) => (a.talking ? "talk" : "idle"),
      },
      name: "Opa Barnabas",
      color: "#ffe28a",
      x: 330,
      y: 382,
      facing: 1,
      box: [60, 100],
      draw: (ctx, a) => {
        crate(ctx, a.x - 30 * a.scale, a.y - 1, 46 * a.scale, 32 * a.scale, "#6a4c30");
        drawPerson(ctx, BARNABAS, a, { sit: true, talking: a.talking, t: a.t });
      },
    },
    {
      id: "morwenna",
      sprite: {
        frames: { idle: "/chars/morwenna-idle.png", talk: "/chars/morwenna-talk.png" },
        pick: (a) => (a.talking ? "talk" : "idle"),
        float: 8,
      },
      name: "Morwenna",
      color: "#8fffe0",
      x: 520,
      y: 200,
      scale: 1.1,
      hidden: (g) => !g.flag("witchShow"),
      draw: (ctx, a) => drawWitch(ctx, a, false),
    },
  ],
  hotspots: [
    { id: "moon", name: "Mond", rect: [545, 35, 60, 60], look: "Der Mond. Er hängt da oben, als würde ihm der ganze Ozean gehören." },
    { id: "boat", name: "Ruderboot", rect: [337, 265, 145, 80], at: { x: 410, y: 372 }, look: "Ein Ruderboot. Ohne Ruder. Das erklärt, warum es noch hier ist.", take: "Das Boot passt nicht in meine Hosentasche. Ich hab's ausgemessen.", use: "Ohne Ruder paddle ich nur im Kreis. Das hatte ich schon mal." },
    { id: "lantern", name: "Laterne", rect: [190, 100, 60, 70], look: "Eine Laterne. Sie flackert, als würde sie mir zuzwinkern.", take: "Opa Barnabas braucht sie zum Lesen. Er liest Wellen." },
    { id: "crates", name: "Kisten", rect: [0, 165, 200, 215], at: { x: 215, y: 372 }, look: "„Gepökelter Hering – Nicht vor 1720 öffnen.“ Lieber nicht.", take: "Viel zu schwer. Und sie riechen." , use: "Ich setze mich nicht auf Heringskisten. Grundsatz." },
    {
      id: "rope",
      name: "Seil",
      rect: [735, 300, 110, 110],
      at: { x: 790, y: 424 },
      hidden: (g) => !!g.flag("rope"),
      look: "Ein aufgerolltes Seil um den Poller. Niemand scheint es zu brauchen.",
      take: async (g) => {
        g.set("rope");
        g.add("seil");
        g.sfx("pickup");
        g.refresh();
        await g.say("Ein Seil. Jeder ordentliche Pirat braucht ein Seil.");
      },
    },
    { id: "bollard", name: "Poller", rect: [735, 300, 110, 110], hidden: (g) => !g.flag("rope"), at: { x: 790, y: 424 }, look: "Ein eiserner Poller. Kalt, rund, zuverlässig." },
    {
      id: "barnabas",
      name: "Opa Barnabas",
      actor: "barnabas",
      at: { x: 400, y: 396 },
      face: -1,
      look: "Opa Barnabas. Er sitzt hier, seit es Stege gibt. Manche sagen, der Steg wurde um ihn herum gebaut.",
      talk: (g) => barnabasTalk(g),
      give: {
        kokos: "„Danke, aber meine Zähne und ich haben uns vor Jahren getrennt.“",
        grog: "„Nicht vor dem Abendessen. Ich esse nie zu Abend.“",
      },
    },
    {
      id: "toTown",
      name: "Hafengasse",
      rect: [880, 250, 80, 170],
      exit: true,
      at: { x: 940, y: 372 },
      look: "Da geht's in die Hafengasse von Krabbenbucht.",
      walk: (g) => g.goto("street", 60, 392, 1),
    },
  ],
  async enter(g) {
    if (!g.flag("intro")) {
      g.set("intro");
      await g.say("Krabbenbucht. Endlich bin ich da!");
      await g.say("Ich bin Finn Kielwasser, und ich werde Pirat. Ein richtiger. Mit Schiff und allem.");
      await g.say("He, Jungchen! Wenn du Pirat werden willst, rede erst mal mit mir.", "barnabas");
    }
  },
};

async function barnabasTalk(g: G) {
  await talk(g, () => [
    {
      text: "Wer bist du?",
      run: async () => {
        await g.say("Barnabas. Seit sechzig Jahren sitze ich auf diesem Steg.", "barnabas");
        await g.say("Der Steg war zuerst da. Knapp.", "barnabas");
      },
    },
    {
      text: "Ich will Pirat werden!",
      run: async () => {
        await g.say("Das wollen sie alle. Geh in die Taverne „Zum Rostigen Anker“.", "barnabas");
        await g.say("Kapitänin Rosa Rumfass sucht Leute für die „Rostige Möwe“. Aber sie nimmt nicht jeden.", "barnabas");
        await g.say("Letzte Woche hat sie einen abgelehnt, weil er seekrank wurde. Beim Händewaschen.", "barnabas");
      },
    },
    {
      text: "Kennst du einen guten Konter für ein Reimduell?",
      show: () => !!g.flag("duelKnown"),
      run: async () => {
        await g.say("Und ob! Zacharias und ich hatten '52 ein legendäres Duell.", "barnabas");
        await teach(g, 0, "barnabas");
      },
    },
    {
      text: "Weißt du etwas über einen vergrabenen Kompass?",
      show: () => !!g.flag("quest") && !g.flag("gotMapA"),
      run: async () => {
        await g.say("Ein Kompass… Mein Großvater hat einen vergraben. Einen goldenen. Hier, die Karte.", "barnabas");
        await g.say("Leider nur die halbe. Die andere Hälfte hat er in eine Flasche gesteckt und ins Meer geworfen. Er hielt das für sicher.", "barnabas");
        g.set("gotMapA");
        g.add("karteA");
        g.sfx("pickup");
        await g.say("Vielleicht hat das Meer sie ja irgendwo angespült…", "barnabas");
      },
    },
    {
      text: "Was ist mit dem Meer passiert?!",
      show: () => !!g.flag("tideGone"),
      run: async () => {
        await g.say("Sechzig Jahre sitz ich hier. So was hab ich noch nie gesehen. Und ich hab einen fliegenden Hummer gesehen.", "barnabas");
      },
    },
    bye("Pass auf dich auf, Jungchen. Und auf deine Stiefel.", "barnabas", g),
  ]);
}

/* ===================== STREET ===================== */
export const street: SceneDef = {
  id: "street",
  title: "Hafengasse",
  art: "/art/street.png",
  ambient: "wind",
  walk: [{ x: 0, y: 350 }, { x: 960, y: 350 }, { x: 960, y: 432 }, { x: 0, y: 432 }],
  scale: depth(318, 0.8, 430, 1.05),
  staticKey: (g) => (g.flag("lit") ? "lit" : "dark"),
  paintStatic(ctx, g) {
    nightSky(ctx, 300);
    stars(ctx, 12, 200, 220);
    cloud(ctx, 8, 500, 60, 420, 26, "rgba(90,80,150,0.8)", "rgba(30,25,60,0.8)", 0.5);
    // hill + lighthouse
    ridge(ctx, 31, 300, 760, 300, 210, lin(ctx, 0, 90, 0, 300, [[0, "#2b2a4a"], [1, "#151828"]]), 0.25);
    const lx = 530;
    poly(ctx, [lx - 14, 150, lx + 14, 150, lx + 10, 92, lx - 10, 92], "#e6e0d6");
    rect(ctx, lx - 13, 128, 26, 8, "#b8322c");
    rect(ctx, lx - 11, 106, 22, 8, "#b8322c");
    rect(ctx, lx - 9, 80, 18, 12, g.flag("lit") ? "#fff2b0" : "#2a2f40");
    poly(ctx, [lx - 12, 80, lx + 12, 80, lx, 68], "#3a2a2a");
    if (g.flag("lit")) glow(ctx, lx, 86, 60, "rgba(255,230,140,0.8)");
    // path up
    poly(ctx, [470, 340, 610, 340, 560, 210, 520, 210], lin(ctx, 0, 210, 0, 340, [[0, "#2a2630"], [1, "#4a4048"]]));
    // tavern (left)
    const tw = 400;
    ctx.fillStyle = lin(ctx, 20, 80, 420, 340, [[0, "#6a4a36"], [1, "#2c1d14"]]);
    ctx.fillRect(20, 120, tw, 222);
    planks(ctx, 20, 120, tw, 222, "#5a3e2c", "#24170f", true, 24, 9);
    ctx.fillStyle = "rgba(10,10,30,0.35)";
    ctx.fillRect(20, 120, tw, 222);
    poly(ctx, [0, 126, 220, 30, 440, 126], lin(ctx, 0, 30, 0, 126, [[0, "#3e2c3a"], [1, "#1c1420"]]));
    for (let i = 0; i < 7; i++) {
      ctx.strokeStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.moveTo(220 - (i + 1) * 30, 30 + (i + 1) * 13.5);
      ctx.lineTo(220 + (i + 1) * 30, 30 + (i + 1) * 13.5);
      ctx.stroke();
    }
    window_(ctx, 70, 180, 50, 56, "#ffc469");
    window_(ctx, 330, 180, 50, 56, "#ffb455");
    // door
    rect(ctx, 210, 222, 82, 120, "#1a100a");
    planks(ctx, 216, 228, 70, 114, "#6a4426", "#2a180c", true, 14, 2);
    ellipse(ctx, 276, 290, 4, 4, "#d9b45a");
    // sign with anchor
    rect(ctx, 120, 120, 4, 30, "#1a1410");
    sign(ctx, 74, 146, 120, 54, "", 14);
    ctx.strokeStyle = "#e9c873";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(134, 156);
    ctx.lineTo(134, 190);
    ctx.moveTo(122, 164);
    ctx.lineTo(146, 164);
    ctx.moveTo(116, 180);
    ctx.quadraticCurveTo(134, 198, 152, 180);
    ctx.stroke();
    ctx.font = `15px "Pirata One", serif`;
    ctx.fillStyle = "#f3dfb0";
    ctx.textAlign = "center";
    ctx.fillText("Zum Rostigen Anker", 250, 110);
    // shop (right)
    ctx.fillStyle = lin(ctx, 630, 120, 930, 340, [[0, "#3f5a6a"], [1, "#1a2630"]]);
    ctx.fillRect(630, 140, 300, 202);
    ctx.strokeStyle = "#16202a";
    ctx.lineWidth = 4;
    ctx.strokeRect(630, 140, 300, 202);
    for (const bx of [705, 780, 855]) {
      ctx.beginPath();
      ctx.moveTo(bx, 140);
      ctx.lineTo(bx, 342);
      ctx.stroke();
    }
    poly(ctx, [612, 146, 780, 62, 948, 146], lin(ctx, 0, 62, 0, 146, [[0, "#5a2a2a"], [1, "#2a1414"]]));
    window_(ctx, 650, 190, 46, 60, "#ffd58a", "#16202a");
    window_(ctx, 860, 190, 46, 60, "#ffcb7a", "#16202a");
    rect(ctx, 730, 236, 74, 106, "#0f161c");
    planks(ctx, 736, 242, 62, 100, "#3a6a6a", "#152a2a", true, 15, 3);
    ellipse(ctx, 786, 296, 4, 4, "#d9b45a");
    sign(ctx, 704, 160, 150, 40, "Pfefferkorns Krimskrams", 15, "#2c4450", "#ffe2a8");
    // street
    cobbles(ctx, 330, 440, "#4a4458", 6);
    // barrels & cat
    barrel(ctx, 935, 352, 40, 52, "#5a3f2a");
    barrel(ctx, 440, 350, 34, 44, "#5e422c");
    lamppost(ctx, 615, 352, 130);
    vignette(ctx, 0.55);
    grain(ctx, 0.05);
  },
  paintAnim(ctx, t, g) {
    twinkle(ctx, 12, 14, 200, t);
    lampGlow(ctx, 615, 208, t, 170);
    glow(ctx, 615, 380, 140, "rgba(255,170,80,0.12)");
    glow(ctx, 95, 208, 70, "rgba(255,170,70,0.25)", 0.8 + Math.sin(t * 3) * 0.1);
    glow(ctx, 355, 208, 70, "rgba(255,170,70,0.25)", 0.8 + Math.sin(t * 2.4) * 0.1);
    // chimney smoke
    for (let i = 0; i < 6; i++) {
      const k = (t * 0.25 + i / 6) % 1;
      ctx.globalAlpha = 0.18 * (1 - k);
      ellipse(ctx, 330 + Math.sin(k * 6 + i) * 10 + k * 40, 50 - k * 60, 10 + k * 22, 8 + k * 16, "#9890b0");
    }
    ctx.globalAlpha = 1;
    // cat
    const cx = 936;
    const cy = 300;
    ellipse(ctx, cx, cy, 13, 10, "#0d0b10");
    ellipse(ctx, cx + 8, cy - 12, 8, 7, "#0d0b10");
    poly(ctx, [cx + 3, cy - 16, cx + 5, cy - 25, cx + 9, cy - 17], "#0d0b10");
    poly(ctx, [cx + 9, cy - 17, cx + 13, cy - 25, cx + 15, cy - 15], "#0d0b10");
    ctx.strokeStyle = "#0d0b10";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy + 4);
    ctx.quadraticCurveTo(cx - 26, cy + 10 + Math.sin(t * 2) * 6, cx - 22, cy + 24);
    ctx.stroke();
    if (Math.sin(t * 0.7) < 0.97) {
      glow(ctx, cx + 6, cy - 13, 5, "rgba(200,255,120,0.9)");
      glow(ctx, cx + 11, cy - 13, 5, "rgba(200,255,120,0.9)");
    }
    if (g.flag("lit")) {
      const a = t * 0.9;
      beam(ctx, 530, 86, 6, 530 + Math.cos(a) * 520, 86 + Math.sin(a) * 60 - 30, 120, "rgba(255,240,170,0.9)", 0.18 * Math.max(0, Math.cos(a)) + 0.04);
    }
  },
  hotspots: [
    { id: "lighthouse", name: "Leuchtturm", rect: [555, 40, 50, 100], look: (g) => g.say(g.flag("lit") ? "Der Leuchtturm strahlt! Das war ich. Ich bin quasi ein Leuchtturmwärter." : "Der Leuchtturm. Er ist dunkel. Ein dunkler Leuchtturm ist wie ein Witz ohne Pointe.") },
    { id: "toLight", name: "Pfad zum Leuchtturm", rect: [540, 170, 230, 150], exit: true, at: { x: 620, y: 380 }, look: "Ein steiler Pfad hinauf zur Klippe.", walk: (g) => g.goto("lighthouse", 110, 396, 1) },
    { id: "tavernDoor", name: "Taverne „Zum Rostigen Anker“", rect: [140, 200, 90, 125], exit: true, at: { x: 200, y: 352 }, look: "Aus der Taverne dringen Gelächter, Musik und ein Geruch nach verbranntem Zwieback.", walk: async (g) => { g.sfx("door"); await g.goto("tavern", 110, 400, 1); } },
    { id: "tavernSign", name: "Wirtshausschild", rect: [120, 70, 90, 85], look: "Ein Anker. Das Schild ist so rostig wie der Name verspricht." },
    { id: "shopDoor", name: "Pfefferkorns Krimskrams", rect: [785, 140, 85, 200], exit: true, at: { x: 820, y: 352 }, look: "Ein Laden für alles, was man braucht, und vieles, was man nicht braucht.", walk: async (g) => { g.sfx("door"); await g.goto("shop", 120, 404, 1); } },
    { id: "lamp", name: "Laterne", rect: [305, 130, 45, 170], look: "Eine Straßenlaterne. Sie brennt mit Walnussöl. Riecht nach Weihnachten." },
    {
      id: "cat",
      name: "Schwarze Katze",
      rect: [680, 60, 50, 50],
      at: { x: 700, y: 380 },
      look: "Eine schwarze Katze. Sie schaut mich an, als wüsste sie, wie das alles ausgeht.",
      talk: async (g) => {
        await g.say("Miez, miez?");
        await g.say("…");
        await g.say("Sie hat mich gerade innerlich bewertet. Zwei von zehn.");
      },
      take: "Sie hat Krallen. Ich habe Hände. Ich verliere.",
      give: { fisch: "Sie ist nicht hier.", kokos: "Die Katze schaut die Kokosnuss an. Dann mich. Dann wieder die Kokosnuss. Nein." },
    },
    { id: "toPier", name: "Zum Steg", rect: [0, 320, 50, 112], exit: true, at: { x: 10, y: 392 }, walk: (g) => g.goto("pier", 900, 372, -1) },
    { id: "toBeach", name: "Zum Strand", rect: [920, 360, 40, 80], exit: true, at: { x: 952, y: 410 }, walk: (g) => g.goto("beach", 60, 418, 1) },
  ],
};

/* ===================== TAVERN ===================== */
export const tavern: SceneDef = {
  id: "tavern",
  title: "Zum Rostigen Anker",
  art: "/art/tavern.png",
  ambient: "tavern",
  walk: [{ x: 20, y: 372 }, { x: 940, y: 372 }, { x: 940, y: 432 }, { x: 20, y: 432 }],
  scale: depth(372, 0.98, 432, 1.08),
  paintStatic(ctx) {
    planks(ctx, 0, 0, 960, 350, "#5a3a26", "#25160d", true, 30, 21);
    // beams
    for (const x of [0, 300, 640, 930]) rect(ctx, x, 0, 30, 350, lin(ctx, x, 0, x + 30, 0, [[0, "#3a2416"], [0.5, "#6a4a30"], [1, "#2a180c"]]));
    rect(ctx, 0, 40, 960, 26, lin(ctx, 0, 40, 0, 66, [[0, "#6a4a30"], [1, "#2a180c"]]));
    // window with moonlit sea
    rect(ctx, 400, 100, 140, 110, "#141030");
    ctx.save();
    ctx.beginPath();
    ctx.rect(404, 104, 132, 102);
    ctx.clip();
    rect(ctx, 404, 104, 132, 60, lin(ctx, 0, 104, 0, 164, [[0, "#0c1030"], [1, "#4a3060"]]));
    rect(ctx, 404, 164, 132, 42, "#121a40");
    ellipse(ctx, 500, 128, 12, 12, "#fff3d0");
    ctx.restore();
    rect(ctx, 466, 100, 6, 110, "#2a180c");
    rect(ctx, 400, 152, 140, 6, "#2a180c");
    // shelves with bottles
    for (const sy of [110, 170]) {
      rect(ctx, 40, sy, 250, 8, "#2a180c");
      const r = rng(sy);
      for (let i = 0; i < 9; i++) {
        const bx = 52 + i * 26;
        const hgt = 26 + r() * 14;
        const col = ["#2f6a3a", "#6a2f2f", "#3a3f7a", "#8a6a2a"][Math.floor(r() * 4)];
        ctx.fillStyle = lin(ctx, bx, 0, bx + 12, 0, [[0, shade(col, -0.4)], [0.4, shade(col, 0.3)], [1, shade(col, -0.5)]]);
        ctx.fillRect(bx, sy - hgt, 12, hgt);
        ctx.fillRect(bx + 4, sy - hgt - 10, 4, 10);
      }
    }
    // painting of a ship
    rect(ctx, 690, 90, 120, 84, "#8a6a2a");
    rect(ctx, 698, 98, 104, 68, lin(ctx, 0, 98, 0, 166, [[0, "#c9a86a"], [1, "#5a6a7a"]]));
    poly(ctx, [720, 150, 780, 150, 772, 158, 728, 158], "#3a2010");
    poly(ctx, [748, 110, 748, 148, 776, 146], "#efe6d0");
    poly(ctx, [744, 116, 744, 148, 724, 146], "#e0d6c0");
    // fireplace
    stoneHearth(ctx);
    // floor
    planks(ctx, 0, 340, 960, 100, "#4a3020", "#20130a", false, 16, 6);
    ctx.fillStyle = lin(ctx, 0, 340, 0, 440, [[0, "rgba(0,0,0,0.5)"], [1, "rgba(0,0,0,0)"]]);
    ctx.fillRect(0, 340, 960, 100);
    // door on the left
    rect(ctx, 0, 190, 54, 160, "#1a0f08");
    planks(ctx, 4, 196, 46, 154, "#6a4426", "#2a180c", true, 12, 8);
    // hanging lamps
    for (const lx of [200, 560]) {
      rect(ctx, lx - 1, 66, 2, 50, "#1a100a");
      lantern(ctx, lx, 132, 26, 1);
    }
    barrel(ctx, 900, 372, 46, 60, "#6a4a2a");
    barrel(ctx, 600, 330, 40, 50, "#5e4026");
    grade(ctx, "#ffd9a8", 0.12, "overlay");
    vignette(ctx, 0.6, "20,8,0");
    grain(ctx, 0.05);
  },
  paintAnim(ctx, t) {
    flame(ctx, 850, 300, 26, t);
    glow(ctx, 850, 290, 220, "rgba(255,130,50,0.28)", 0.85 + Math.sin(t * 8) * 0.1);
    lampGlow(ctx, 200, 132, t, 180);
    lampGlow(ctx, 560, 132, t + 1, 180);
    glow(ctx, 470, 155, 90, "rgba(140,150,255,0.15)");
  },
  actors: [
    {
      id: "mo",
      sprite: {
        frames: { idle: "/chars/mo-idle.png", talk: "/chars/mo-talk.png" },
        pick: (a) => (a.talking ? "talk" : "idle"),
      },
      name: "Mo",
      color: "#9fe6a0",
      x: 150,
      y: 254,
      facing: 1,
      scale: 0.98,
      box: [70, 128],
      draw: (ctx, a) => {
        drawPerson(ctx, MO, a, { talking: a.talking, t: a.t });
        // bar counter in front of Mo
        rect(ctx, 30, 266, 300, 90, lin(ctx, 0, 266, 0, 356, [[0, "#6a4228"], [1, "#2a160a"]]));
        planks(ctx, 34, 280, 292, 76, "#5a3820", "#22130a", true, 22, 15);
        rect(ctx, 22, 256, 316, 14, lin(ctx, 0, 256, 0, 270, [[0, "#9a6a40"], [1, "#4a2c16"]]));
        rect(ctx, 250, 236, 22, 22, "#8a6b48");
        rect(ctx, 250, 232, 22, 6, "#f3ecd8");
      },
    },
    {
      id: "rosa",
      sprite: {
        frames: { sit: "/chars/rosa-sit.png" },
        pick: () => "sit",
      },
      name: "Kapitänin Rosa",
      color: "#ff9d8a",
      x: 450,
      y: 396,
      facing: 1,
      box: [70, 110],
      draw: (ctx, a) => {
        const s = a.scale;
        rect(ctx, a.x - 26 * s, a.y - 36 * s, 6 * s, 36 * s, "#3a2010");
        drawPerson(ctx, ROSA, a, { sit: true, talking: a.talking, t: a.t });
        // table
        const tx = a.x + 70 * s;
        rect(ctx, tx - 6 * s, a.y - 46 * s, 12 * s, 46 * s, "#3a2010");
        ellipse(ctx, tx, a.y, 30 * s, 6 * s, "rgba(0,0,0,0.35)");
        ellipse(ctx, tx, a.y - 48 * s, 56 * s, 14 * s, lin(ctx, 0, a.y - 62 * s, 0, a.y - 34 * s, [[0, "#8a5a34"], [1, "#4a2c16"]]));
        rect(ctx, tx - 20 * s, a.y - 66 * s, 14 * s, 18 * s, "#8a6b48");
        poly(ctx, [tx + 2 * s, a.y - 52 * s, tx + 34 * s, a.y - 56 * s, tx + 38 * s, a.y - 46 * s, tx + 6 * s, a.y - 42 * s], "#e8d6a8");
      },
    },
    {
      id: "knut",
      sprite: {
        frames: { asleep: "/chars/knut-asleep.png", awake: "/chars/knut-awake.png" },
        pick: (a, g) => (a.talking && g.flag("knutAwake") ? "awake" : "asleep"),
      },
      name: "Knut",
      color: "#a8d0ff",
      x: 760,
      y: 380,
      facing: 1,
      box: [90, 80],
      draw: (ctx, a, g) => {
        const s = a.scale;
        const tx = a.x + 70 * s;
        rect(ctx, tx - 40 * s, a.y - 44 * s, 8 * s, 44 * s, "#3a2010");
        rect(ctx, tx + 32 * s, a.y - 44 * s, 8 * s, 44 * s, "#3a2010");
        rect(ctx, tx - 50 * s, a.y - 52 * s, 100 * s, 10 * s, lin(ctx, 0, a.y - 52 * s, 0, a.y - 42 * s, [[0, "#8a5a34"], [1, "#4a2c16"]]));
        const awake = a.talking && !!g.flag("knutAwake");
        drawPerson(ctx, KNUT, a, { sit: true, lean: awake ? 0.15 : 1.15, talking: a.talking, t: a.t });
        if (!a.talking) {
          const k = (a.t * 0.5) % 1;
          ctx.globalAlpha = 1 - k;
          ctx.font = `${12 + k * 8}px "Kanit", sans-serif`;
          ctx.fillStyle = "#e8e0ff";
          ctx.fillText("z", a.x + 60 * s + k * 20, a.y - 70 * s - k * 30);
          ctx.globalAlpha = 1;
        }
        if (!g.flag("knutGrog")) {
          rect(ctx, tx + 18 * s, a.y - 66 * s, 12 * s, 14 * s, "#6a6a6a");
        }
      },
    },
  ],
  hotspots: [
    { id: "door", name: "Tür", rect: [0, 340, 70, 92], exit: true, at: { x: 40, y: 410 }, walk: async (g) => { g.sfx("door"); await g.goto("street", 250, 352, 1); } },
    { id: "window", name: "Fenster", rect: [378, 95, 195, 110], look: (g) => g.say(g.flag("tideGone") ? "Da draußen… wo das Meer war, ist nur noch Schlamm!" : "Der Mond über der Bucht. Kitschig. Ich liebe es.") },
    { id: "painting", name: "Gemälde", rect: [235, 115, 60, 60], look: "Ein Gemälde der „Rostigen Möwe“. Der Maler hat den Rost weggelassen. Künstlerische Freiheit." },
    { id: "bottles", name: "Flaschen", rect: [0, 20, 190, 160], look: "„Seemanns Trost“, „Kielholer Spezial“, „Nicht Trinken“. Letztere ist halb leer.", take: "Mo würde mich mit dem Zapfhahn erschlagen." },
    { id: "fire", name: "Kamin", rect: [790, 100, 170, 200], look: "Ein knisterndes Feuer. Darüber hängt ein Topf mit etwas, das blubbert und mich ansieht.", use: "Mir ist warm genug, danke." },
    {
      id: "mo",
      name: "Mo",
      actor: "mo",
      at: { x: 300, y: 396 },
      face: -1,
      look: "Mo, der Wirt. Er hat Arme wie Ankerketten und poliert dasselbe Glas seit drei Jahren.",
      talk: (g) => moTalk(g),
      give: { muenzen: (g) => buyGrog(g) },
    },
    {
      id: "rosa",
      name: "Kapitänin Rosa",
      actor: "rosa",
      at: { x: 380, y: 410 },
      face: 1,
      look: "Kapitänin Rosa Rumfass. Ihr Blick sagt: „Ich habe schon Kraken verprügelt.“ Ihr Hut sagt: „Mehrere.“",
      talk: (g) => rosaTalk(g),
      give: {
        kompass: "„Behalt ihn, bis du alle drei Dinge hast. Dann reden wir.“",
        medaille: "„Hübsch. Aber eins von drei ist noch keine Mannschaft.“",
        grog: "„Im Dienst trinke ich nur Tee. Mit Rum. Ohne Tee.“",
      },
    },
    {
      id: "knut",
      name: "Knut",
      actor: "knut",
      at: { x: 700, y: 410 },
      face: 1,
      look: (g) => g.say(g.flag("knutGrog") ? "Knut schläft wieder. Er lächelt. Er träumt von Haien, die singen." : "Ein Seemann namens Knut. Er schläft auf dem Tisch. In der Hand hält er etwas fest."),
      talk: async (g) => {
        await g.say("Knut? Haaallo?");
        await g.say("Chrrr… nur noch einen Grog… chrrr…", "knut");
      },
      take: (g) => g.say(g.flag("knutGrog") ? "Den Feuerstein hab ich schon. Mehr hat er nicht. Außer Mundgeruch." : "Er hält seinen Feuerstein fest umklammert. Selbst im Schlaf."),
      give: {
        grog: async (g) => {
          g.remove("grog");
          g.set("knutAwake");
          await g.say("Grog?! *schlürf* AAAH! Wer bist du? Egal! Ich sing dir was!", "knut");
          await teach(g, 3, "knut");
          await g.say("Gute Nacht, Freund… *bonk*", "knut");
          g.set("knutAwake", false);
          g.set("knutGrog");
          g.add("feuerstein");
          g.sfx("pickup");
          await g.say("Er hat seinen Feuerstein fallen lassen. Ich… verwahre ihn.");
        },
        muenzen: "Er schläft. Geld kann man nicht im Schlaf ausgeben. Das hat er schon versucht.",
      },
    },
  ],
};

function stoneHearth(ctx: C) {
  const r = rng(77);
  rect(ctx, 770, 150, 170, 200, "#3a3236");
  for (let y = 150; y < 350; y += 20) {
    for (let x = 770 + ((y / 20) % 2) * 15; x < 940; x += 30) {
      ctx.fillStyle = shade("#6a5f60", -0.2 + r() * 0.3);
      ctx.beginPath();
      ctx.roundRect(x + 1, y + 1, 28, 18, 4);
      ctx.fill();
    }
  }
  rect(ctx, 790, 230, 130, 110, "#120806");
  ctx.fillStyle = rad(ctx, 855, 330, 5, 90, [[0, "#ff9a40"], [1, "#2a0c04"]]);
  ctx.fillRect(790, 230, 130, 110);
  rect(ctx, 760, 220, 190, 14, "#4a3a30");
  ctx.strokeStyle = "#1a1210";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(855, 234);
  ctx.lineTo(855, 262);
  ctx.stroke();
  ellipse(ctx, 855, 276, 26, 16, "#1c1c22");
  ellipse(ctx, 855, 264, 24, 5, "#4a8a3a");
}

async function buyGrog(g: G) {
  if (g.has("grog")) return g.say("Ich habe schon einen Krug. Mehr kann ich nicht tragen, ohne zu schwanken.");
  if (g.coins() < 1) {
    await g.say("Einen Grog, bitte.");
    await g.say("Ohne Gold kein Grog. Ohne Grog keine Freude. So ist das Leben.", "mo");
    return;
  }
  g.addCoins(-1);
  g.add("grog");
  g.sfx("coin");
  await g.say("Ein Krug „Kielholer Spezial“. Halt ihn vom Gesicht weg.", "mo");
}

async function moTalk(g: G) {
  await talk(g, () => [
    { text: "Einen Grog, bitte!", run: () => buyGrog(g) },
    {
      text: "Was ist mit dem Seemann da drüben?",
      run: async () => {
        await g.say("Knut? Der ist seit Dienstag eingeschlafen. Welcher Dienstag, weiß keiner.", "mo");
        await g.say("Er wacht nur für Grog auf. Und für Shantys.", "mo");
      },
    },
    {
      text: "Kennst du einen guten Konter für ein Reimduell?",
      show: () => !!g.flag("duelKnown"),
      run: async () => {
        await g.say("Zacharias? Der Kerl hat mal meinen Grog beleidigt. Ich hab ihm geantwortet.", "mo");
        await teach(g, 1, "mo");
      },
    },
    bye("Komm wieder, wenn du Durst hast. Oder Gold. Am besten beides.", "mo", g),
  ]);
}

async function rosaTalk(g: G) {
  if (g.flag("ch1done")) {
    await g.say("Wir müssen los, Finn! Ab zur Möwe!", "rosa");
    return;
  }
  await talk(g, () => [
    {
      text: "Ich will auf dein Schiff!",
      show: () => !g.flag("quest"),
      run: async () => {
        await g.say("Ha! Jeder will auf die „Rostige Möwe“.", "rosa");
        await g.say("Aber ein Schiff braucht drei Dinge, Kleiner: Licht, Richtung und ein Lied.", "rosa");
        await g.say("LICHT: Der Leuchtturm ist dunkel, seit der Wärter in Rente ist. Ohne Licht kommt keiner aus der Bucht.", "rosa");
        await g.say("RICHTUNG: Mein Kompass ist über Bord gegangen. Ich brauche einen neuen. Einen guten.", "rosa");
        await g.say("LIED: Ohne Shanty rudert keiner. Schlag Zacharias Zunge im Reimduell, dann glaub ich dir, dass du singen kannst.", "rosa");
        await g.say("Bring mir Licht, Richtung und ein Lied – dann bist du dabei.", "rosa");
        g.set("quest");
      },
    },
    {
      text: "Was brauchst du nochmal?",
      show: () => !!g.flag("quest") && !questDone(g),
      run: async () => {
        await g.say(g.flag("lit") ? "Licht: erledigt. Der Leuchtturm brennt. Gut gemacht." : "Licht: Bring den Leuchtturm auf der Klippe wieder zum Leuchten.", "rosa");
        await g.say(g.has("kompass") ? "Richtung: Der Kompass sieht prächtig aus." : "Richtung: Einen guten Kompass. Frag die Alten im Hafen – irgendwer hat immer was vergraben.", "rosa");
        await g.say(g.has("medaille") ? "Lied: Du hast Zacharias besiegt. Respekt." : "Lied: Besiege Zacharias im Reimduell. Er übt hinterm Strand auf der Lichtung.", "rosa");
      },
    },
    {
      text: "Licht, Richtung und ein Lied – ich habe alles!",
      show: () => questDone(g),
      run: async () => {
        await chapterOneEnd(g);
        return "end";
      },
    },
    {
      text: "Erzähl mir von dir.",
      run: async () => {
        await g.say("Ich bin auf einem Schiff geboren, im Sturm, bei Ebbe. Seitdem habe ich keine Angst und kein Geduld.", "rosa");
        await g.say("Meine Oma war die größte Kapitänin der Andamanensee. Sie hat mir immer gesagt…", "rosa");
        await g.say("„Rosa, wenn du einer Hexe begegnest – zeig ihr den Spiegel.“ Ich hab nie verstanden, was sie meinte.", "rosa");
      },
    },
    bye("Trödel nicht. Die Flut wartet auf niemanden.", "rosa", g),
  ]);
}

async function chapterOneEnd(g: G) {
  await g.say("Licht. Richtung. Lied. Hm.", "rosa");
  await g.say("Finn Kielwasser – willkommen an Bord der „Rostigen Möwe“!", "rosa");
  g.sfx("fanfare");
  g.set("ch1done");
  await g.say("JAAA! Ich bin Pirat! Ich bin ein echter…");
  await g.wait(400);
  g.flash("#9affea", 900);
  g.sfx("magic");
  await g.say("Was war DAS?!", "rosa");
  await g.say("Das Meer! DAS MEER IST WEG!", "mo");
  g.set("tideGone");
  await g.goto("pier", 600, 380, 1);
  g.set("witchShow");
  g.sfx("magic");
  await g.say("Ha ha ha! Kleiner Möchtegern-Pirat! Du hast meinen Leuchtturm wieder angezündet…", "morwenna");
  await g.say("…und damit genau das beleuchtet, was ich gesucht habe: die Gezeitenperle auf dem Grund der Bucht!", "morwenna");
  await g.say("Ohne Perle keine Flut. Ohne Flut kein Hafen. Ohne Hafen keine Piraten! Ich bin Morwenna, und das Meer gehört jetzt MIR!", "morwenna");
  g.flash("#9affea", 700);
  g.set("witchShow", false);
  await g.wait(600);
  await g.say("Morwenna, die Meerhexe… Das hat Oma Rumfass gemeint.", "barnabas");
  await g.say("Die Möwe liegt draußen vor der Bucht im tiefen Wasser. Wir holen uns die Perle zurück!");
  await g.card("Kapitel 2", "Die Gezeitenperle");
  g.set("chapter", 2);
  await g.goto("deck", 300, 400, 1);
}

/* ===================== SHOP ===================== */
export const shop: SceneDef = {
  id: "shop",
  title: "Pfefferkorns Krimskrams",
  art: "/art/shop.png",
  ambient: "tavern",
  walk: [{ x: 20, y: 376 }, { x: 940, y: 376 }, { x: 940, y: 432 }, { x: 20, y: 432 }],
  scale: depth(376, 0.98, 432, 1.08),
  staticKey: (g) => `${g.flag("shovelTraded") ? 1 : 0}${g.flag("oilBought") ? 1 : 0}`,
  paintStatic(ctx, g) {
    planks(ctx, 0, 0, 960, 350, "#2f4a52", "#122228", true, 34, 30);
    ctx.fillStyle = "rgba(20,10,40,0.35)";
    ctx.fillRect(0, 0, 960, 350);
    // shelves
    const r = rng(5);
    for (const sy of [100, 170, 240]) {
      rect(ctx, 140, sy, 300, 10, "#2a180c");
      for (let i = 0; i < 10; i++) {
        const x = 150 + i * 29;
        const kind = r();
        if (kind < 0.4) {
          const col = ["#c8a05a", "#7a9a5a", "#a05a5a", "#5a7aa0"][Math.floor(r() * 4)];
          ctx.fillStyle = lin(ctx, x, 0, x + 22, 0, [[0, shade(col, -0.4)], [0.5, shade(col, 0.25)], [1, shade(col, -0.5)]]);
          ctx.beginPath();
          ctx.roundRect(x, sy - 30, 22, 30, 4);
          ctx.fill();
          rect(ctx, x - 1, sy - 34, 24, 6, "#8a6a4a");
        } else if (kind < 0.7) {
          ctx.fillStyle = "#d9c7a0";
          ctx.fillRect(x, sy - 18, 24, 18);
          ctx.strokeStyle = "#8a3a2a";
          ctx.strokeRect(x + 2, sy - 16, 20, 14);
        } else {
          ellipse(ctx, x + 11, sy - 10, 11, 10, shade("#c9b080", -0.2 + r() * 0.3));
        }
      }
    }
    // oil can on lowest shelf (for sale)
    if (!g.flag("oilBought")) {
      ctx.save();
      ctx.translate(470, 226);
      ctx.fillStyle = lin(ctx, -16, 0, 16, 0, [[0, "#2f4a2c"], [0.5, "#6f9a5c"], [1, "#2a3a26"]]);
      ctx.beginPath();
      ctx.roundRect(-16, -28, 30, 30, 5);
      ctx.fill();
      poly(ctx, [10, -24, 24, -38, 27, -35, 14, -20], "#4b6b47");
      rect(ctx, -12, -18, 20, 10, "#e8d8a8");
      ctx.restore();
      rect(ctx, 446, 228, 50, 8, "#2a180c");
      sign(ctx, 446, 238, 50, 20, "2 Dbl.", 12, "#d9c7a0", "#5a2a1a");
    }
    // hanging stuff
    ctx.strokeStyle = "#1a1210";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(620, 0);
    ctx.lineTo(620, 60);
    ctx.moveTo(760, 0);
    ctx.lineTo(760, 46);
    ctx.stroke();
    // pufferfish
    ellipse(ctx, 620, 84, 28, 24, rad(ctx, 610, 74, 3, 30, [[0, "#f0d48a"], [1, "#a0783a"]]));
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * Math.PI * 2;
      poly(ctx, [620 + Math.cos(a) * 24, 84 + Math.sin(a) * 20, 620 + Math.cos(a + 0.12) * 36, 84 + Math.sin(a + 0.12) * 30, 620 + Math.cos(a + 0.24) * 24, 84 + Math.sin(a + 0.24) * 20], "#8a6a2a");
    }
    ellipse(ctx, 638, 78, 6, 6, "#fff");
    ellipse(ctx, 640, 78, 3, 3, "#111");
    // ship in a bottle
    ctx.save();
    ctx.translate(760, 64);
    ellipse(ctx, 0, 0, 44, 18, "rgba(160,220,200,0.35)");
    rect(ctx, 40, -6, 18, 12, "rgba(160,220,200,0.45)");
    rect(ctx, 56, -5, 8, 10, "#8a5a2a");
    poly(ctx, [-24, 6, 20, 6, 14, 12, -18, 12], "#5a3010");
    poly(ctx, [-4, -12, -4, 6, 14, 4], "#f0e8d8");
    ctx.restore();
    // map on wall
    poly(ctx, [520, 110, 600, 104, 606, 168, 524, 174], lin(ctx, 0, 104, 0, 174, [[0, "#e8d6a8"], [1, "#b08a50"]]));
    ctx.strokeStyle = "#8a3a2a";
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(534, 160);
    ctx.quadraticCurveTo(560, 120, 594, 134);
    ctx.stroke();
    ctx.setLineDash([]);
    // window
    rect(ctx, 820, 110, 100, 120, "#101830");
    ellipse(ctx, 880, 140, 8, 8, "#fff3d0");
    rect(ctx, 866, 110, 6, 120, "#1a2228");
    rect(ctx, 820, 166, 100, 6, "#1a2228");
    // door left
    rect(ctx, 0, 190, 60, 162, "#0f161c");
    planks(ctx, 4, 196, 52, 156, "#3a6a6a", "#152a2a", true, 13, 3);
    // floor
    planks(ctx, 0, 344, 960, 96, "#4a3424", "#1e120a", false, 16, 7);
    ctx.fillStyle = lin(ctx, 0, 344, 0, 440, [[0, "rgba(0,0,0,0.5)"], [1, "rgba(0,0,0,0)"]]);
    ctx.fillRect(0, 344, 960, 96);
    // shovel leaning
    if (!g.flag("shovelTraded")) {
      ctx.save();
      ctx.translate(900, 360);
      ctx.rotate(-0.18);
      rect(ctx, -3, -140, 6, 110, "#7a5230");
      rect(ctx, -12, -146, 24, 8, "#5a3a20");
      poly(ctx, [-16, -34, 16, -34, 12, 0, 0, 8, -12, 0], lin(ctx, -16, 0, 16, 0, [[0, "#6a737a"], [0.5, "#c6cdd2"], [1, "#5a636a"]]), "#2a2f34");
      ctx.restore();
    }
    grade(ctx, "#ffd0a0", 0.1, "overlay");
    vignette(ctx, 0.6, "10,4,20");
    grain(ctx, 0.05);
  },
  paintAnim(ctx, t) {
    for (const [x, y] of [[560, 270], [360, 262]]) {
      flame(ctx, x, y, 6, t + x);
      glow(ctx, x, y - 6, 120, "rgba(255,170,80,0.35)", 0.85 + Math.sin(t * 9 + x) * 0.08);
    }
    glow(ctx, 870, 160, 90, "rgba(150,160,255,0.12)");
  },
  actors: [
    {
      id: "pfeffer",
      sprite: {
        frames: { idle: "/chars/pfeffer-idle.png", talk: "/chars/pfeffer-talk.png" },
        pick: (a) => (a.talking ? "talk" : "idle"),
        crop: 0.78,
      },
      name: "Frau Pfefferkorn",
      color: "#f0b8ff",
      x: 770,
      y: 287,
      facing: -1,
      scale: 0.98,
      box: [60, 124],
      draw: (ctx, a) => {
        drawPerson(ctx, PFEFFERKORN, a, { talking: a.talking, t: a.t });
        rect(ctx, 520, 270, 260, 86, lin(ctx, 0, 270, 0, 356, [[0, "#5a3a5a"], [1, "#22122a"]]));
        planks(ctx, 524, 284, 252, 72, "#4a2e4a", "#1c0e20", true, 21, 11);
        rect(ctx, 512, 260, 276, 14, lin(ctx, 0, 260, 0, 274, [[0, "#9a6a8a"], [1, "#4a2a40"]]));
        // candles + bell
        rect(ctx, 556, 248, 8, 14, "#f3ecd8");
        ellipse(ctx, 720, 258, 10, 4, "#2a1a10");
        ctx.beginPath();
        ctx.arc(720, 252, 8, Math.PI, 0);
        ctx.fillStyle = "#e0b850";
        ctx.fill();
        rect(ctx, 356, 252, 8, 12, "#f3ecd8");
      },
    },
  ],
  hotspots: [
    { id: "door", name: "Tür", rect: [0, 80, 115, 230], exit: true, at: { x: 60, y: 404 }, walk: async (g) => { g.sfx("door"); await g.goto("street", 766, 352, 1); } },
    { id: "puffer", name: "Kugelfisch", rect: [360, 25, 80, 75], look: "Ein ausgestopfter Kugelfisch. Er wirkt beleidigt. Vermutlich wegen des Ausstopfens." },
    { id: "bottleship", name: "Buddelschiff", rect: [490, 25, 130, 70], look: "Ein Schiff in einer Flasche. Wie kommt es da rein? Wie komme ICH auf ein Schiff? Fragen über Fragen." },
    { id: "wallmap", name: "Landkarte", rect: [470, 110, 155, 125], look: "Eine Karte der Andamanensee. Ganz unten links steht: „Hier wohnt eine Hexe. Nicht hinfahren.“" },
    { id: "shelves", name: "Regale", rect: [150, 60, 210, 240], look: "Gläser mit eingelegten Dingen. Ich glaube, eins davon hat mir zugezwinkert.", take: "„Finger weg vom Kram, der kostet!“ ruft Frau Pfefferkorn, ohne aufzusehen." },
    {
      id: "oil",
      name: "Lampenöl",
      rect: [690, 60, 70, 90],
      hidden: (g) => !!g.flag("oilBought"),
      look: "Eine Kanne Lampenöl. Preisschild: 2 Dublonen.",
      take: (g) => buyOil(g),
    },
    {
      id: "shovel",
      name: "Schaufel",
      rect: [880, 350, 80, 82],
      at: { x: 850, y: 410 },
      hidden: (g) => !!g.flag("shovelTraded"),
      look: "Eine prächtige Schaufel. Ein Schild sagt: „Unverkäuflich. Außer vielleicht.“",
      take: async (g) => {
        await g.say("Die Schaufel bleibt, wo sie ist, Schätzchen! Es sei denn, wir werden uns handelseinig.", "pfeffer");
      },
    },
    {
      id: "pfeffer",
      name: "Frau Pfefferkorn",
      actor: "pfeffer",
      at: { x: 700, y: 404 },
      face: 1,
      look: "Frau Pfefferkorn. Sie verkauft alles. Sogar Dinge, die ihr nicht gehören, munkelt man.",
      talk: (g) => pfefferTalk(g),
      give: {
        kokos: (g) => tradeCoconut(g),
        muenzen: (g) => buyOil(g),
      },
    },
  ],
};

async function tradeCoconut(g: G) {
  g.remove("kokos");
  g.set("shovelTraded");
  g.add("schaufel");
  g.sfx("pickup");
  g.refresh();
  await g.say("Eine frische Kokosnuss! Endlich kann ich meine berühmten Makronen backen.", "pfeffer");
  await g.say("Abgemacht – die Schaufel gehört dir. Grab nichts aus, was mir gehört.", "pfeffer");
}

async function buyOil(g: G) {
  if (g.flag("oilBought")) return;
  if (g.coins() < 2) {
    await g.say("Zwei Dublonen für das Öl, Schätzchen. Ich sehe keine zwei Dublonen. Ich sehe einen Jungen mit leeren Taschen.", "pfeffer");
    return;
  }
  g.addCoins(-2);
  g.set("oilBought");
  g.add("oel");
  g.sfx("coin");
  g.refresh();
  await g.say("Feinstes Walnuss-Lampenöl. Brennt hell und riecht nach Keksen.", "pfeffer");
}

async function pfefferTalk(g: G) {
  await talk(g, () => [
    {
      text: "Was verkaufen Sie hier?",
      run: async () => {
        await g.say("Alles! Gläser, Karten, Kugelfische, Lampenöl…", "pfeffer");
        await g.say("…und die Schaufel. Aber die tausche ich nur. Gegen eine frische Kokosnuss. Ich bin süchtig nach Makronen.", "pfeffer");
      },
    },
    {
      text: "Ich nehme das Lampenöl.",
      show: () => !g.flag("oilBought"),
      run: () => buyOil(g),
    },
    {
      text: "Hier, eine Kokosnuss für die Schaufel!",
      show: () => g.has("kokos") && !g.flag("shovelTraded"),
      run: () => tradeCoconut(g),
    },
    {
      text: "Kennen Sie einen guten Konter für ein Reimduell?",
      show: () => !!g.flag("duelKnown"),
      run: async () => {
        await g.say("Oh, Zacharias! Der hat mal behauptet, er hätte einen Hai besiegt. Ich hab ihm gesagt…", "pfeffer");
        await teach(g, 2, "pfeffer");
      },
    },
    bye("Komm bald wieder! Und bring Gold mit. Oder Kokosnüsse.", "pfeffer", g),
  ]);
}

/* ===================== BEACH ===================== */
const SAND: number[] = [0, 404, 200, 374, 420, 316, 700, 266, 960, 254, 960, 440, 0, 440];
export const beach: SceneDef = {
  id: "beach",
  title: "Mondscheinstrand",
  art: "/art/beach.png",
  artOverlay(ctx, g) {
    if (!g.flag("bottle") && !g.flag("tideGone")) {
      ctx.save();
      ctx.translate(128, 360);
      ctx.rotate(0.9);
      ctx.fillStyle = "rgba(90,170,120,0.9)";
      ctx.beginPath();
      ctx.roundRect(-6, -14, 12, 24, 5);
      ctx.fill();
      rect(ctx, -3, -22, 6, 9, "#4a8a6a");
      rect(ctx, -3, -26, 6, 4, "#a0763f");
      ctx.restore();
    }
    if (g.flag("dug")) {
      ellipse(ctx, 700, 372, 34, 10, "#2c2638");
      ellipse(ctx, 742, 382, 18, 6, "#cbb58a");
      crate(ctx, 676, 384, 40, 22, "#5a3a20");
    }
  },
  ambient: "sea",
  walk: [{ x: 0, y: 392 }, { x: 300, y: 360 }, { x: 700, y: 340 }, { x: 960, y: 340 }, { x: 960, y: 432 }, { x: 0, y: 432 }],
  scale: depth(284, 0.7, 432, 1.06),
  staticKey: (g) => `${g.flag("bottle") ? 1 : 0}${g.flag("dug") ? 1 : 0}${g.flag("tideGone") ? 1 : 0}`,
  paintStatic(ctx, g) {
    sky(ctx, 220, [[0, "#060a22"], [0.5, "#16204a"], [1, "#4a3a6e"]]);
    stars(ctx, 41, 240, 200);
    moon(ctx, 230, 70, 34);
    cloud(ctx, 14, 640, 90, 360, 24, "rgba(120,110,180,0.8)", "rgba(30,30,70,0.8)", 0.45);
    ridge(ctx, 51, 500, 960, 214, 44, "#1d1b3c", 0.5);
    seaBase(ctx, 212, 440, [[0, "#4c4f86"], [0.08, "#243066"], [1, "#0a1430"]]);
    beam(ctx, 230, 212, 30, 260, 400, 200, "rgba(255,236,200,0.4)", 0.45);
    poly(ctx, SAND, lin(ctx, 0, 254, 0, 440, [[0, "#6c6688"], [0.4, "#8a7f8e"], [1, "#4a4258"]]));
    // wet sand edge
    ctx.globalAlpha = 0.5;
    poly(ctx, [0, 404, 200, 374, 420, 316, 700, 266, 960, 254, 960, 262, 700, 276, 420, 328, 200, 388, 0, 418], "#3a3a60");
    ctx.globalAlpha = 1;
    // jungle edge at the back right
    foliage(ctx, 61, 700, 160, 260, 110, "#0c1a1c", "#13282a", "#1d3a38", 46);
    // leaning rock
    rock(ctx, 71, 820, 332, 120, 90, "#6a6684", "#24223a");
    rock(ctx, 72, 880, 340, 60, 40, "#5a5674", "#24223a");
    // driftwood
    ctx.save();
    ctx.translate(520, 392);
    ctx.rotate(-0.12);
    rect(ctx, -60, -6, 120, 12, lin(ctx, 0, -6, 0, 6, [[0, "#a89a8a"], [1, "#5a4e44"]]));
    rect(ctx, 30, -16, 6, 14, "#7a6e60");
    ctx.restore();
    // dig spot
    if (g.flag("dug")) {
      ellipse(ctx, 752, 372, 34, 10, "#2c2638");
      ellipse(ctx, 790, 382, 18, 6, "#8a7f8e");
      crate(ctx, 726, 382, 40, 22, "#5a3a20");
    }
    // bottle in the surf
    if (!g.flag("bottle") && !g.flag("tideGone")) {
      ctx.save();
      ctx.translate(176, 392);
      ctx.rotate(0.9);
      ctx.fillStyle = "rgba(90,170,120,0.85)";
      ctx.beginPath();
      ctx.roundRect(-6, -14, 12, 24, 5);
      ctx.fill();
      rect(ctx, -3, -22, 6, 9, "#4a8a6a");
      rect(ctx, -3, -26, 6, 4, "#a0763f");
      ctx.restore();
    }
    vignette(ctx, 0.5);
    grain(ctx, 0.05);
  },
  paintAnim(ctx, t, g) {
    twinkle(ctx, 42, 14, 200, t);
    seaShimmer(ctx, t, 216, 400, 240, "rgba(255,236,200,0.9)");
    // rolling foam along the shore
    const shore = [[0, 404], [200, 374], [420, 316], [700, 266], [960, 254]];
    const k = (Math.sin(t * 0.9) + 1) / 2;
    ctx.save();
    ctx.globalAlpha = 0.55 * (1 - k * 0.6);
    ctx.strokeStyle = "#e8ecff";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    shore.forEach(([x, y], i) => (i ? ctx.lineTo(x, y - 6 + k * 8) : ctx.moveTo(x, y - 6 + k * 8)));
    ctx.stroke();
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    shore.forEach(([x, y], i) => (i ? ctx.lineTo(x, y - 18 + k * 6) : ctx.moveTo(x, y - 18 + k * 6)));
    ctx.stroke();
    ctx.restore();
    palm(ctx, 600, 330, 220, -0.42, t, "#3a2e2c", "#14302a", "#245040", 3);
    palm(ctx, 930, 300, 180, -0.25, t + 2, "#2e2426", "#102620", "#1d3d34", 5);
    if (g.flag("readMap") && !g.flag("dug")) {
      const a = 0.5 + 0.5 * Math.sin(t * 3);
      glow(ctx, 752, 372, 40, "rgba(255,240,200,0.7)", a * 0.7);
    }
    // little crab
    const cx = 340 + Math.sin(t * 0.4) * 60;
    ellipse(ctx, cx, 412, 9, 5, "#c0402a");
    ellipse(ctx, cx - 4, 406, 2, 2, "#fff");
    ellipse(ctx, cx + 4, 406, 2, 2, "#fff");
  },
  hotspots: [
    { id: "moonB", name: "Mond", rect: [185, 35, 70, 70], look: "Der Mond küsst das Meer. Und vielleicht auch eine Palme, wenn er sich vorlehnt." },
    { id: "sea", name: "Meer", rect: [0, 200, 300, 110], look: (g) => g.say(g.flag("tideGone") ? "Wo das Meer war, glänzt nur noch Schlick." : "Das Meer. Ganz schön groß, aus der Nähe.") },
    {
      id: "bottle",
      name: "Flasche",
      rect: [100, 340, 60, 45],
      at: { x: 140, y: 408 },
      hidden: (g) => !!g.flag("bottle") || !!g.flag("tideGone"),
      look: "Eine Flasche, die im Spülsaum schaukelt. Da ist etwas drin!",
      take: async (g) => {
        g.set("bottle");
        g.add("flasche");
        g.sfx("splash");
        g.refresh();
        await g.say("Flaschenpost! Vielleicht ist es ein Liebesbrief. Oder eine Rechnung.");
      },
    },
    {
      id: "palm",
      name: "Palme",
      rect: [300, 60, 310, 300],
      at: { x: 560, y: 380 },
      look: "Eine große Palme. Oben hängen Kokosnüsse. Ganz oben. Unerreichbar oben.",
      take: "Die Palme ist fest verwurzelt. Ich auch. Das wird nichts.",
      use: "Ich klettere hoch? Ohne Hilfsmittel? Ich habe die Arme eines Geigers.",
      useWith: {
        seil: async (g) => {
          if (g.flag("gotCoconut")) return g.say("Die restlichen Kokosnüsse hängen zu hoch. Eine reicht.");
          await g.say("Ich werfe das Seil um den Stamm und… hepp… hepp…");
          g.sfx("dig");
          await g.wait(500);
          await g.say("Ich ruckle die ganze Palme durch!");
          g.sfx("pickup");
          g.set("gotCoconut");
          g.add("kokos");
          await g.say("BONK! Eine Kokosnuss. Direkt auf den Kopf. Aber ich habe sie!");
        },
        schaufel: "Ich fälle doch keine Palme! Sie hat mir nichts getan. Außer der Kokosnuss.",
      },
    },
    {
      id: "rock",
      name: "Schiefer Felsen",
      rect: [735, 120, 225, 230],
      at: { x: 720, y: 392 },
      look: "Ein schiefer Felsen. Er lehnt sich, als wollte er der Palme etwas zuflüstern.",
      take: "Der Felsen wiegt etwa so viel wie ein Elefant. Ich wiege etwa so viel wie ein Elefantenohr.",
    },
    {
      id: "spot",
      name: (g) => (g.flag("readMap") ? "Mondbeschienene Stelle" : "Sand"),
      rect: [640, 350, 120, 50],
      at: { x: 690, y: 392 },
      face: 1,
      look: (g) => g.say(g.flag("dug") ? "Ein Loch und eine leere Kiste. Mein Werk." : g.flag("readMap") ? "Drei Schritt vom schiefen Felsen, genau da, wo das Mondlicht hinfällt. HIER!" : "Sand. Sehr viel Sand. Und Mondlicht."),
      useWith: {
        schaufel: async (g) => {
          if (g.flag("dug")) return g.say("Hier ist nichts mehr. Außer meinem Stolz.");
          if (!g.flag("readMap")) return g.say("Einfach irgendwo graben? Ich brauche einen Hinweis. Eine Karte wäre schön.");
          g.sfx("dig");
          await g.say("Graben, graben, graben…");
          await g.wait(700);
          g.sfx("dig");
          await g.wait(700);
          g.set("dug");
          g.refresh();
          g.sfx("fanfare");
          await g.say("KLONK! Eine Kiste!");
          g.add("kompass");
          g.addCoins(5);
          await g.say("Ein goldener Kompass… und fünf Dublonen! Ich bin reich! Kurzzeitig.");
        },
      },
      use: "Mit den Händen graben? Ich bin Pirat, kein Hund.",
    },
    { id: "jungle", name: "Pfad in den Dschungel", rect: [880, 160, 80, 200], exit: true, at: { x: 940, y: 392 }, look: "Ein Pfad in den Dschungel. Von dort klingt Mandolinenmusik.", walk: (g) => g.goto("clearing", 80, 400, 1) },
    { id: "toStreet", name: "Zur Hafengasse", rect: [0, 380, 40, 60], exit: true, at: { x: 34, y: 426 }, walk: (g) => g.goto("street", 900, 392, -1) },
    { id: "drift", name: "Treibholz", rect: [30, 360, 340, 70], look: "Treibholz. Es ist weit gereist, um hier nutzlos herumzuliegen. Wie mein Onkel.", take: "Damit kann ich nichts anfangen." },
  ],
};

/* ===================== CLEARING ===================== */
export const clearing: SceneDef = {
  id: "clearing",
  title: "Lichtung der Reime",
  art: "/art/clearing.png",
  ambient: "jungle",
  walk: [{ x: 20, y: 364 }, { x: 940, y: 364 }, { x: 940, y: 432 }, { x: 20, y: 432 }],
  scale: depth(364, 0.95, 432, 1.06),
  paintStatic(ctx) {
    sky(ctx, 440, [[0, "#04101a"], [0.5, "#0a2026"], [1, "#0c1a1a"]]);
    stars(ctx, 81, 80, 120, 0.8);
    // deep jungle layers
    foliage(ctx, 82, -40, 40, 1040, 260, "#061214", "#0a1c1e", "#0f2a2a", 90);
    foliage(ctx, 83, -40, 120, 1040, 240, "#081a18", "#0e2a24", "#16403a", 80);
    // giant tree left
    ctx.fillStyle = lin(ctx, 40, 0, 200, 0, [[0, "#0f0c0a"], [0.4, "#3a2c22"], [1, "#120c08"]]);
    ctx.beginPath();
    ctx.moveTo(40, 440);
    ctx.bezierCurveTo(90, 300, 70, 160, 100, 0);
    ctx.lineTo(200, 0);
    ctx.bezierCurveTo(190, 160, 200, 300, 250, 440);
    ctx.fill();
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.moveTo(110 + i * 14, 0);
      ctx.bezierCurveTo(100 + i * 14, 150, 110 + i * 16, 300, 90 + i * 22, 440);
      ctx.stroke();
    }
    // ground
    ctx.fillStyle = lin(ctx, 0, 330, 0, 440, [[0, "#14261e"], [1, "#0a140f"]]);
    ctx.fillRect(0, 340, 960, 100);
    ellipse(ctx, 560, 392, 300, 40, "rgba(120,160,140,0.18)");
    foliage(ctx, 84, 260, 300, 700, 60, "#0a1a14", "#123024", "#1c4834", 40);
    // stumps as seats
    for (const [x, y] of [[380, 360], [770, 360]]) {
      ellipse(ctx, x, y, 30, 10, "#3a2c20");
      rect(ctx, x - 30, y, 60, 22, lin(ctx, x - 30, 0, x + 30, 0, [[0, "#1a120c"], [0.5, "#4a3626"], [1, "#1a120c"]]));
      ellipse(ctx, x, y, 26, 8, "#6a5038");
    }
    // sign
    rect(ctx, 880, 260, 6, 100, "#2a1e14");
    sign(ctx, 820, 236, 130, 46, "Reimduelle!", 20, "#5a4028", "#f3dfb0");
    vignette(ctx, 0.6);
    grain(ctx, 0.05);
  },
  paintAnim(ctx, t) {
    beam(ctx, 560, 0, 80, 560, 400, 300, "rgba(190,220,255,0.6)", 0.16 + Math.sin(t * 0.5) * 0.02);
    fireflies(ctx, t, 85, 26, 200, 120, 760, 260);
  },
  actors: [
    {
      id: "zach",
      sprite: {
        frames: { idle: "/chars/zach-idle.png", talk: "/chars/zach-talk.png" },
        pick: (a) => (a.talking ? "talk" : "idle"),
      },
      name: "Zacharias Zunge",
      color: "#ffb36b",
      x: 600,
      y: 388,
      facing: -1,
      box: [60, 134],
      draw: (ctx, a) => drawPerson(ctx, ZACHARIAS, a, { talking: a.talking, t: a.t, gesture: a.talking ? undefined : 0.3 }),
    },
  ],
  hotspots: [
    { id: "tree", name: "Riesenbaum", rect: [20, 0, 270, 330], look: "Ein uralter Baum. In die Rinde ist geritzt: „Z. war hier. Z. ist der Beste. Z. hat das geschrieben.“" },
    { id: "signC", name: "Schild", rect: [850, 180, 100, 115], look: "„Reimduelle! Eintritt frei, Austritt peinlich.“" },
    { id: "beamC", name: "Mondlicht", rect: [440, 0, 170, 300], look: "Ein Mondstrahl fällt durch das Blätterdach. Sehr dramatisch. Zacharias hat sich garantiert extra hier hingestellt." },
    {
      id: "zach",
      name: "Zacharias Zunge",
      actor: "zach",
      at: { x: 520, y: 396 },
      face: 1,
      look: "Zacharias Zunge, Meister des Reimduells. Sein Schnurrbart ist so gepflegt, dass er vermutlich eine eigene Kabine hat.",
      talk: (g) => zachTalk(g),
      give: { grog: "„Grog? Vor einem Duell? Meine Stimmbänder sind ein Tempel!“", medaille: "„Die hast du gewonnen. Behalt sie, bevor ich weine.“" },
    },
    { id: "toBeach2", name: "Zum Strand", rect: [0, 330, 40, 110], exit: true, at: { x: 22, y: 410 }, walk: (g) => g.goto("beach", 900, 300, -1) },
  ],
};

async function zachTalk(g: G) {
  if (g.has("medaille")) {
    await g.say("Du schon wieder! Ich übe gerade neue Reime. Auf „Niederlage“ reimt sich leider nichts Schönes.", "zach");
    return;
  }
  if (!g.flag("duelKnown")) {
    await g.say("Halt, Fremder! Du stehst auf der Lichtung von Zacharias Zunge, ungeschlagener Meister des Reimduells!", "zach");
    await g.say("Ich singe eine Zeile. Du antwortest mit einer, die sich reimt und mich schlägt. Wer zuerst danebenliegt, verliert.", "zach");
    await g.say("Ein Reimduell? Und was bekomme ich, wenn ich gewinne?");
    await g.say("Die Shanty-Medaille! Die „Goldene Kehle von Krabbenbucht“. Seit elf Jahren meine.", "zach");
    g.set("duelKnown");
  }
  await talk(g, () => [
    {
      text: "Ich fordere dich heraus!",
      run: async () => {
        if (learned(g) === 0) {
          await g.say("Du kennst ja nicht mal eine einzige Strophe! Hör dich in Krabbenbucht um, Grünschnabel.", "zach");
          return "end";
        }
        const won = await duel(g, "zach");
        if (won) {
          g.sfx("fanfare");
          await g.say("Nein… NEIN! Vier zu null?! Meine Kehle… meine Ehre… meine Mandoline!", "zach");
          await g.say("Nimm sie. Die Medaille. Du hast sie dir ersungen.", "zach");
          g.add("medaille");
          await g.say("Die Shanty-Medaille! Lied: erledigt!");
        }
        return "end";
      },
    },
    {
      text: "Wie funktioniert das nochmal?",
      run: async () => {
        await g.say("Ich singe eine Zeile, du antwortest mit dem passenden Reim. Vier Runden, kein Fehler erlaubt.", "zach");
        await g.say(`Du kennst bisher ${learned(g)} von 4 Strophen. Die Leute im Hafen kennen alle meine Lieblingszeilen. Leider.`, "zach");
      },
    },
    bye("Übe, Grünschnabel. Übe!", "zach", g),
  ]);
}

/* ===================== LIGHTHOUSE ===================== */
export const lighthouse: SceneDef = {
  id: "lighthouse",
  title: "Klippe am Leuchtturm",
  art: "/art/lighthouse.png",
  ambient: "wind",
  walk: [{ x: 0, y: 340 }, { x: 960, y: 340 }, { x: 960, y: 432 }, { x: 0, y: 432 }],
  scale: depth(352, 0.92, 432, 1.06),
  staticKey: (g) => `${g.flag("lit") ? 1 : 0}${g.flag("oilIn") ? 1 : 0}`,
  paintStatic(ctx, g) {
    sky(ctx, 330, [[0, "#050a1e"], [0.5, "#121a44"], [1, "#3a2e5e"]]);
    stars(ctx, 91, 280, 300);
    moon(ctx, 160, 90, 22);
    cloud(ctx, 92, 380, 70, 400, 26, "rgba(100,95,160,0.8)", "rgba(30,25,60,0.8)", 0.5);
    seaBase(ctx, 290, 440, [[0, "#3a3c70"], [0.1, "#1c2858"], [1, "#081028"]]);
    rock(ctx, 93, 120, 420, 120, 50, "#3a3650", "#141224");
    rock(ctx, 94, 260, 440, 90, 36, "#3a3650", "#141224");
    // cliff
    ctx.beginPath();
    ctx.moveTo(380, 440);
    ctx.bezierCurveTo(420, 380, 460, 360, 560, 340);
    ctx.lineTo(960, 330);
    ctx.lineTo(960, 440);
    ctx.closePath();
    ctx.fillStyle = lin(ctx, 0, 330, 0, 440, [[0, "#2a3a2e"], [1, "#0c1410"]]);
    ctx.fill();
    ctx.fillStyle = lin(ctx, 0, 340, 0, 440, [[0, "#30402e"], [1, "#141c14"]]);
    poly(ctx, [0, 380, 300, 360, 600, 344, 960, 352, 960, 440, 0, 440]);
    ctx.fill();
    // lighthouse
    const x = 720;
    ctx.fillStyle = lin(ctx, x - 50, 0, x + 50, 0, [[0, "#8a8490"], [0.45, "#f2ece2"], [1, "#6a6470"]]);
    poly(ctx, [x - 48, 348, x + 48, 348, x + 32, 104, x - 32, 104]);
    ctx.fill();
    ctx.save();
    poly(ctx, [x - 48, 348, x + 48, 348, x + 32, 104, x - 32, 104]);
    ctx.clip();
    for (const sy of [140, 220, 300]) rect(ctx, x - 60, sy, 120, 34, lin(ctx, x - 50, 0, x + 50, 0, [[0, "#6a1c1a"], [0.45, "#c43a32"], [1, "#4a1210"]]));
    ctx.restore();
    // gallery + lamp room
    rect(ctx, x - 44, 96, 88, 10, "#1e1c24");
    for (let i = -40; i <= 40; i += 10) rect(ctx, x + i, 80, 2, 16, "#1e1c24");
    rect(ctx, x - 44, 78, 88, 4, "#1e1c24");
    rect(ctx, x - 24, 48, 48, 48, g.flag("lit") ? "#fff6c8" : "#1a2236");
    for (const i of [-12, 0, 12]) rect(ctx, x + i - 1, 48, 2, 48, "#1e1c24");
    poly(ctx, [x - 30, 50, x + 30, 50, x, 22], "#2a2028");
    rect(ctx, x - 2, 10, 4, 14, "#2a2028");
    // door
    rect(ctx, x - 16, 300, 32, 48, "#2a1a10");
    planks(ctx, x - 14, 304, 28, 44, "#5a3a20", "#24140a", true, 7, 4);
    ctx.beginPath();
    ctx.arc(x, 304, 16, Math.PI, 0);
    ctx.fillStyle = "#2a1a10";
    ctx.fill();
    // bench + sign
    rect(ctx, 520, 352, 70, 8, "#5a4028");
    rect(ctx, 526, 360, 6, 16, "#3a2818");
    rect(ctx, 578, 360, 6, 16, "#3a2818");
    rect(ctx, 290, 300, 5, 66, "#2a1e14");
    sign(ctx, 240, 280, 110, 40, "Leuchtturm", 18);
    // grass tufts
    const r = rng(95);
    for (let i = 0; i < 120; i++) {
      const gx = r() * 960;
      const gy = 352 + r() * 88;
      ctx.strokeStyle = shade("#3a5a3a", -0.3 + r() * 0.3);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(gx, gy);
      ctx.lineTo(gx + 4, gy - 10 - r() * 8);
      ctx.stroke();
    }
    if (g.flag("lit")) glow(ctx, x, 72, 200, "rgba(255,230,150,0.5)");
    vignette(ctx, 0.55);
    grain(ctx, 0.05);
  },
  paintAnim(ctx, t, g) {
    twinkle(ctx, 96, 16, 280, t);
    seaShimmer(ctx, t, 296, 440, 160, "rgba(255,236,200,0.8)", 0.7);
    if (g.flag("lit")) {
      const a = t * 0.9;
      const c = Math.cos(a);
      beam(ctx, 720, 72, 20, 720 + c * 900, 72 + Math.sin(a) * 40, 220, "rgba(255,240,170,0.95)", 0.25 * Math.abs(c));
      glow(ctx, 720, 72, 70 + Math.abs(c) * 50, "rgba(255,240,180,0.9)", 0.9);
    }
    // wind-swept grass foreground
    for (let i = 0; i < 26; i++) {
      const gx = i * 38 + 10;
      const sw = Math.sin(t * 2 + i) * 5;
      ctx.strokeStyle = "#1a2a1a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(gx, 440);
      ctx.quadraticCurveTo(gx + sw, 425, gx + sw * 2 + 6, 412);
      ctx.stroke();
    }
  },
  hotspots: [
    {
      id: "lamp",
      name: "Leuchtfeuer",
      rect: [800, 25, 70, 50],
      at: { x: 820, y: 376 },
      look: (g) => g.say(g.flag("lit") ? "Es brennt! Hell wie… ein Leuchtturm." : g.flag("oilIn") ? "Das Öl ist drin. Jetzt fehlt nur noch ein Funke." : "Das Leuchtfeuer oben im Turm. Der Brenner ist trocken wie Opa Barnabas' Humor."),
      use: (g) => g.say(g.flag("lit") ? "Es brennt schon. Ich will es nicht noch heller machen, sonst wacht die ganze Stadt auf." : "Ich brauche etwas zum Brennen. Und etwas zum Anzünden."),
      useWith: {
        oel: (g) => climb(g, async () => {
          g.remove("oel");
          g.set("oilIn");
          await g.say("Ich fülle das Öl in den Brenner. Riecht wirklich nach Keksen.");
        }),
        feuerstein: (g) => climb(g, async () => {
          if (!g.flag("oilIn")) {
            await g.say("Ich schlage Funken, aber ohne Öl brennt hier nichts. Außer meinen Fingern.");
            return;
          }
          g.remove("feuerstein");
          g.set("lit");
          g.sfx("fanfare");
          await g.say("Funke… Funke… FUUUMP!");
        }),
      },
    },
    {
      id: "lh",
      name: "Leuchtturm",
      rect: [785, 30, 100, 200],
      look: "Ein rot-weißer Leuchtturm. Er sieht aus wie eine riesige Zuckerstange mit Verantwortung.",
    },
    {
      id: "lhDoor",
      name: "Turmtür",
      rect: [800, 215, 60, 60],
      at: { x: 820, y: 376 },
      look: "Die Tür zum Turm. Dahinter: 127 Stufen. Ich hab sie nicht gezählt. Doch, hab ich.",
      use: "Ohne Öl und Feuer brauche ich da oben nicht hinauf.",
      useWith: { oel: (g) => climb(g, async () => { g.remove("oel"); g.set("oilIn"); await g.say("Öl eingefüllt!"); }) },
    },
    { id: "bench", name: "Bank", rect: [100, 230, 165, 95], at: { x: 200, y: 380 }, look: "Eine Bank mit Inschrift: „Für Wärter Henning. Er hat geleuchtet.“", use: "Keine Zeit zum Ausruhen! Piraten ruhen nie. Außer Knut." },
    { id: "signL", name: "Schild", rect: [10, 205, 70, 60], look: "„Leuchtturm. Bitte nicht dagegenlaufen.“ Hilfreich." },
    { id: "seaL", name: "Meer", rect: [440, 160, 300, 100], look: "Tief unter mir rollt das Meer gegen die Felsen. Mir wird ein bisschen schwindelig." },
    { id: "toStreet2", name: "Pfad hinunter", rect: [0, 340, 40, 100], exit: true, at: { x: 16, y: 404 }, walk: (g) => g.goto("street", 545, 330, 1) },
  ],
};

async function climb(g: G, inner: () => Promise<void>) {
  await g.fade(1, 300);
  g.set("heroHidden");
  await g.fade(0, 300);
  await g.say("*stapf* *stapf* *stapf*… 127 Stufen später…");
  g.refresh();
  await inner();
  g.refresh();
  await g.fade(1, 300);
  g.set("heroHidden", false);
  await g.fade(0, 300);
  if (g.flag("lit") && !g.flag("litSaid")) {
    g.set("litSaid");
    await g.say("Der Leuchtturm strahlt wieder! Licht: erledigt!");
  }
}

