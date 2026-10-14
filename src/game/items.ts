import { ellipse, glow, lin, poly, rad } from "./art";
import type { G, Reaction } from "./types";

type C = CanvasRenderingContext2D;

export interface ItemDef {
  name: string | ((g: G) => string);
  look: string;
  icon: (ctx: C) => void;
}

const paper = (ctx: C, half: 0 | 1 | 2) => {
  ctx.save();
  ctx.rotate(-0.08);
  const x0 = half === 2 ? 30 : 0;
  const w = half === 0 ? 72 : 36;
  const xs = half === 0 ? -36 : half === 1 ? -30 : -6;
  poly(ctx, [xs, -26, xs + w, -24, xs + w - 2, 26, xs + 2, 28], lin(ctx, 0, -26, 0, 28, [[0, "#f3e1b4"], [1, "#c9a76c"]]), "#6b4a24", 1.5);
  ctx.strokeStyle = "#8a3a1e";
  ctx.lineWidth = 2;
  ctx.setLineDash([4, 3]);
  ctx.beginPath();
  ctx.moveTo(xs + 6, 16);
  ctx.quadraticCurveTo(xs + w / 2, -14 + x0 * 0, xs + w - 8, 4);
  ctx.stroke();
  ctx.setLineDash([]);
  if (half !== 1) {
    ctx.strokeStyle = "#b0261b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(xs + w - 16, -2);
    ctx.lineTo(xs + w - 6, 8);
    ctx.moveTo(xs + w - 6, -2);
    ctx.lineTo(xs + w - 16, 8);
    ctx.stroke();
  }
  ctx.restore();
};

export const ITEMS: Record<string, ItemDef> = {
  seil: {
    name: "Seil",
    look: "Gutes, altes Hanfseil. Riecht nach Teer und Abenteuer.",
    icon: (ctx) => {
      ctx.strokeStyle = "#b7915a";
      ctx.lineWidth = 6;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(0, 4 - i * 4, 26 - i * 3, 14 - i * 2, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = "#7a5c33";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 4, 26, 14, 0, 0, Math.PI * 2);
      ctx.stroke();
    },
  },
  karteA: { name: "Kartenfetzen (links)", look: "Die linke Hälfte einer Schatzkarte. „…drei Schritt vom schiefen Felsen…“", icon: (ctx) => paper(ctx, 1) },
  karteB: { name: "Kartenfetzen (rechts)", look: "Die rechte Hälfte. „…wo der Mond die Palme küsst.“ Und ein großes X.", icon: (ctx) => paper(ctx, 2) },
  karte: { name: "Schatzkarte", look: "Zusammengesetzt! „Drei Schritt vom schiefen Felsen, wo der Mond die Palme küsst.“ Das muss am Strand sein.", icon: (ctx) => paper(ctx, 0) },
  flasche: {
    name: "Flaschenpost",
    look: "Eine verkorkte Flasche. Da ist Papier drin!",
    icon: (ctx) => {
      ctx.rotate(-0.6);
      ctx.beginPath();
      ctx.roundRect(-14, -18, 28, 44, 10);
      ctx.fillStyle = "rgba(90,170,120,0.75)";
      ctx.fill();
      ctx.strokeStyle = "#2a5a3a";
      ctx.stroke();
      ctx.fillStyle = "rgba(90,170,120,0.85)";
      ctx.fillRect(-6, -32, 12, 16);
      ctx.fillStyle = "#a0763f";
      ctx.fillRect(-6, -38, 12, 8);
      ctx.fillStyle = "#efdca8";
      ctx.fillRect(-8, -6, 16, 24);
      glow(ctx, -6, -6, 14, "rgba(255,255,255,0.6)");
    },
  },
  kokos: {
    name: "Kokosnuss",
    look: "Hart, haarig und überraschend schwer. Wie Opa Barnabas.",
    icon: (ctx) => {
      ellipse(ctx, 0, 2, 24, 22, rad(ctx, -8, -8, 2, 30, [[0, "#8a5e3a"], [1, "#3b2617"]]));
      ctx.strokeStyle = "#2a1a0f";
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * 10, 2 + Math.sin(a) * 10);
        ctx.lineTo(Math.cos(a) * 22, 2 + Math.sin(a) * 20);
        ctx.stroke();
      }
      for (const [x, y] of [[-6, -6], [6, -6], [0, 4]]) ellipse(ctx, x, y, 3, 3, "#1a0f08");
    },
  },
  schaufel: {
    name: "Schaufel",
    look: "Eine solide Schaufel. Perfekt zum Graben, Klopfen und dramatischen Posieren.",
    icon: (ctx) => {
      ctx.rotate(0.7);
      ctx.fillStyle = "#7a5230";
      ctx.fillRect(-3, -34, 6, 44);
      ctx.fillRect(-10, -38, 20, 6);
      poly(ctx, [-14, 8, 14, 8, 10, 34, 0, 40, -10, 34], lin(ctx, -14, 0, 14, 0, [[0, "#7c8790"], [0.5, "#d6dde2"], [1, "#6a737a"]]), "#3a3f44", 1.5);
    },
  },
  muenzen: {
    name: (g) => `${g.coins()} Dublone${g.coins() === 1 ? "" : "n"}`,
    look: "Echtes Piratengold. Klimpert befriedigend.",
    icon: (ctx) => {
      for (const [x, y] of [[-10, 8], [10, 10], [0, -6]]) {
        ellipse(ctx, x, y, 16, 12, "#a87a1c");
        ellipse(ctx, x, y - 2, 16, 12, rad(ctx, x - 5, y - 6, 1, 18, [[0, "#fff1a8"], [0.6, "#e9b93a"], [1, "#a87a1c"]]));
        ctx.strokeStyle = "#8a5e10";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(x, y - 2, 10, 7, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    },
  },
  kompass: {
    name: "Goldener Kompass",
    look: "Seine Nadel zeigt nicht nach Norden. Sie zittert in Richtung Meer – als ob sie etwas sucht.",
    icon: (ctx) => {
      ellipse(ctx, 0, 0, 28, 28, rad(ctx, -8, -8, 2, 32, [[0, "#fff2a8"], [0.6, "#e0a92c"], [1, "#8a5e10"]]));
      ellipse(ctx, 0, 0, 21, 21, "#f5ecd5");
      poly(ctx, [0, -18, 5, 0, 0, 18, -5, 0], "#b0261b");
      poly(ctx, [0, 18, 5, 0, -5, 0], "#2a3a5a");
      ellipse(ctx, 0, 0, 3, 3, "#8a5e10");
      glow(ctx, -8, -10, 14, "rgba(255,255,255,0.7)");
    },
  },
  grog: {
    name: "Krug Grog",
    look: "Brodelt leicht. Ich glaube, er hat gerade den Löffel angeknabbert.",
    icon: (ctx) => {
      ctx.beginPath();
      ctx.roundRect(-18, -20, 32, 44, 4);
      ctx.fillStyle = lin(ctx, -18, 0, 14, 0, [[0, "#5a3c22"], [0.5, "#9a6e42"], [1, "#4a3018"]]);
      ctx.fill();
      ctx.strokeStyle = "#2a1a0c";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.lineWidth = 5;
      ctx.strokeStyle = "#5a3c22";
      ctx.beginPath();
      ctx.arc(16, 2, 10, -1.2, 1.2);
      ctx.stroke();
      ellipse(ctx, -2, -20, 16, 6, "#7bd34a");
      glow(ctx, -2, -24, 20, "rgba(140,255,80,0.7)");
      ellipse(ctx, -6, -26, 4, 4, "#b8ff8a");
    },
  },
  oel: {
    name: "Lampenöl",
    look: "Feinstes Walnuss-Lampenöl. „Brennt hell, riecht nach Keksen“, steht auf dem Etikett.",
    icon: (ctx) => {
      ctx.beginPath();
      ctx.roundRect(-20, -12, 34, 36, 6);
      ctx.fillStyle = lin(ctx, -20, 0, 14, 0, [[0, "#3c5a3a"], [0.5, "#6f9a5c"], [1, "#2f4a2c"]]);
      ctx.fill();
      ctx.strokeStyle = "#1a2a18";
      ctx.stroke();
      poly(ctx, [10, -6, 30, -24, 33, -21, 14, 0], "#4b6b47", "#1a2a18");
      ctx.fillStyle = "#e8d8a8";
      ctx.fillRect(-15, 0, 24, 14);
      ctx.fillStyle = "#c46a1a";
      ctx.beginPath();
      ctx.arc(-3, 7, 4, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  feuerstein: {
    name: "Feuerstein",
    look: "Feuerstein und Stahl. Damit kann man Funken schlagen. Oder sich auf die Finger.",
    icon: (ctx) => {
      poly(ctx, [-24, 10, -14, -14, 4, -18, 12, 0, -2, 18], lin(ctx, -24, -18, 12, 18, [[0, "#9aa0a8"], [1, "#3f444a"]]), "#22262a", 1.5);
      ctx.fillStyle = "#6a6f75";
      ctx.fillRect(4, 6, 26, 7);
      glow(ctx, 8, 0, 14, "rgba(255,200,80,0.9)");
    },
  },
  medaille: {
    name: "Shanty-Medaille",
    look: "„Goldene Kehle von Krabbenbucht“. Ich habe sie mir ersungen.",
    icon: (ctx) => {
      poly(ctx, [-12, -32, 0, -14, 12, -32, 6, -32, 0, -22, -6, -32], "#2f6fb0");
      ellipse(ctx, 0, 4, 20, 20, rad(ctx, -6, -4, 2, 24, [[0, "#fff2a8"], [0.6, "#e0a92c"], [1, "#8a5e10"]]));
      ctx.fillStyle = "#8a5e10";
      ctx.font = "bold 22px serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("♪", 0, 6);
    },
  },
  fernrohr: {
    name: "Fernrohr",
    look: "Ein Messing-Fernrohr. Ich sehe damit meine Zukunft. Sie ist verschwommen.",
    icon: (ctx) => {
      ctx.rotate(-0.5);
      ctx.fillStyle = lin(ctx, 0, -8, 0, 8, [[0, "#ffe9a0"], [0.5, "#c8932c"], [1, "#7a5410"]]);
      ctx.fillRect(-34, -6, 26, 12);
      ctx.fillRect(-10, -8, 22, 16);
      ctx.fillRect(10, -10, 22, 20);
      ctx.fillStyle = "#3a2410";
      ctx.fillRect(-12, -8, 3, 16);
      ctx.fillRect(9, -10, 3, 20);
      ellipse(ctx, 32, 0, 3, 10, "#8fd0ff");
    },
  },
  fisch: {
    name: "Pökelhering",
    look: "Ein gepökelter Hering. Er schaut mich vorwurfsvoll an.",
    icon: (ctx) => {
      ctx.beginPath();
      ctx.moveTo(-26, 0);
      ctx.quadraticCurveTo(0, -18, 20, 0);
      ctx.quadraticCurveTo(0, 18, -26, 0);
      ctx.fillStyle = lin(ctx, 0, -14, 0, 14, [[0, "#9fb6c4"], [0.5, "#dfe9ee"], [1, "#7c8f9a"]]);
      ctx.fill();
      ctx.strokeStyle = "#3c4a52";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      poly(ctx, [18, 0, 32, -12, 30, 12], "#8aa0ad", "#3c4a52");
      ellipse(ctx, -16, -3, 3, 3, "#fff");
      ellipse(ctx, -16, -3, 1.5, 1.5, "#111");
    },
  },
  horn: {
    name: "Muschelhorn",
    look: "Ein großes, gewundenes Muschelhorn. Wenn man hineinbläst, klingt es wie ein Nebelhorn mit Liebeskummer.",
    icon: (ctx) => {
      ctx.rotate(-0.3);
      ctx.beginPath();
      ctx.moveTo(-30, 4);
      ctx.quadraticCurveTo(-10, -26, 24, -14);
      ctx.quadraticCurveTo(34, 0, 24, 14);
      ctx.quadraticCurveTo(-10, 22, -30, 4);
      ctx.fillStyle = lin(ctx, -30, 0, 30, 0, [[0, "#f7e2d2"], [0.6, "#e8a88c"], [1, "#c86f5a"]]);
      ctx.fill();
      ctx.strokeStyle = "#7a3a2a";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ellipse(ctx, 22, 0, 7, 12, "#ffd7c8");
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.arc(-14 + i * 9, 0, 9, -1.2, 1.2);
        ctx.stroke();
      }
    },
  },
  spiegel: {
    name: "Mondspiegel",
    look: "Ein runder Spiegel aus poliertem Mondsilber. Mein Spiegelbild sieht heldenhafter aus als ich.",
    icon: (ctx) => {
      ctx.fillStyle = "#6a5a8a";
      ctx.fillRect(-4, 14, 8, 20);
      ellipse(ctx, 0, -4, 26, 26, rad(ctx, 0, -4, 18, 28, [[0, "#c9b36a"], [1, "#7a5f20"]]));
      ellipse(ctx, 0, -4, 20, 20, lin(ctx, -20, -24, 20, 16, [[0, "#f0f6ff"], [0.5, "#a9bbd6"], [1, "#5a6c8c"]]));
      glow(ctx, -6, -12, 18, "rgba(255,255,255,0.8)");
    },
  },
  perle: {
    name: "Gezeitenperle",
    look: "Sie pulsiert wie Ebbe und Flut. Das Herz des Meeres – zurück in guten Händen. In meinen.",
    icon: (ctx) => {
      glow(ctx, 0, 0, 34, "rgba(140,230,255,0.8)");
      ellipse(ctx, 0, 0, 20, 20, rad(ctx, -7, -7, 2, 22, [[0, "#ffffff"], [0.5, "#c8eef8"], [1, "#6ab0d0"]]));
    },
  },
};

export function itemName(id: string, g: G): string {
  const n = ITEMS[id]?.name ?? id;
  return typeof n === "function" ? n(g) : n;
}

const iconCache = new Map<string, string>();
export function itemIcon(id: string): string {
  const hit = iconCache.get(id);
  if (hit) return hit;
  if (typeof document === "undefined") return "";
  const c = document.createElement("canvas");
  c.width = 160;
  c.height = 160;
  const ctx = c.getContext("2d")!;
  ctx.scale(2, 2);
  ctx.translate(40, 40);
  ctx.shadowColor = "rgba(0,0,0,0.5)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 3;
  ITEMS[id]?.icon(ctx);
  const url = c.toDataURL();
  iconCache.set(id, url);
  return url;
}

/** Item-on-item combinations. Key: ids sorted and joined by "+". */
export const COMBOS: Record<string, Reaction> = {
  "karteA+karteB": async (g) => {
    g.remove("karteA");
    g.remove("karteB");
    g.add("karte");
    g.sfx("pickup");
    await g.say("Passt wie Kopf und Kopftuch! Eine vollständige Schatzkarte.");
  },
  "flasche+kokos": "Kokosnuss trifft Flasche. Beide gehen nicht kaputt. Unentschieden.",
  "grog+schaufel": "Die Schaufel fängt an zu rauchen. Ich lasse das lieber.",
  "feuerstein+oel": "Öl anzünden – in meiner Hosentasche? Lieber nicht.",
  "fernrohr+spiegel": "Ich sehe mich selbst, wie ich mich durch ein Fernrohr ansehe. Mir wird schwindelig.",
  "fisch+horn": "Der Hering passt nicht ins Horn. Glaub mir, ich hab's versucht.",
};

export function comboKey(a: string, b: string) {
  return [a, b].sort().join("+");
}
