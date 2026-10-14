/** Painting helpers. All coordinates are logical scene pixels (960×440). */
type C = CanvasRenderingContext2D;
export type Stops = [number, string][];

export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function lin(ctx: C, x0: number, y0: number, x1: number, y1: number, stops: Stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

export function rad(ctx: C, x: number, y: number, r0: number, r1: number, stops: Stops) {
  const g = ctx.createRadialGradient(x, y, r0, x, y, r1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

export function rect(ctx: C, x: number, y: number, w: number, h: number, fill: string | CanvasGradient) {
  ctx.fillStyle = fill;
  ctx.fillRect(x, y, w, h);
}

export function poly(ctx: C, pts: number[], fill?: string | CanvasGradient, stroke?: string, lw = 1) {
  ctx.beginPath();
  ctx.moveTo(pts[0], pts[1]);
  for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
  ctx.closePath();
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}

export function ellipse(ctx: C, x: number, y: number, rx: number, ry: number, fill: string | CanvasGradient) {
  ctx.beginPath();
  ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
}

export function rrect(ctx: C, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/** Additive light blob. */
export function glow(ctx: C, x: number, y: number, r: number, color: string, alpha = 1) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = alpha;
  ctx.fillStyle = rad(ctx, x, y, 0, r, [
    [0, color],
    [1, "rgba(0,0,0,0)"],
  ]);
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

export function shadow(ctx: C, x: number, y: number, w: number, h: number, a = 0.35) {
  ctx.save();
  ctx.fillStyle = rad(ctx, 0, 0, 0, 1, [
    [0, `rgba(0,0,0,${a})`],
    [1, "rgba(0,0,0,0)"],
  ]);
  ctx.translate(x, y);
  ctx.scale(w, h);
  ctx.beginPath();
  ctx.arc(0, 0, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function sky(ctx: C, y1: number, stops: Stops) {
  rect(ctx, 0, 0, 960, y1, lin(ctx, 0, 0, 0, y1, stops));
}

export function stars(ctx: C, seed: number, n: number, yMax: number, alpha = 1) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = r() * 960;
    const y = Math.pow(r(), 1.4) * yMax;
    const s = r() * r() * 1.8 + 0.3;
    ctx.globalAlpha = alpha * (0.3 + r() * 0.7) * (1 - y / yMax / 1.3);
    ellipse(ctx, x, y, s, s, "#fff8e8");
    if (s > 1.4) glow(ctx, x, y, s * 5, "rgba(190,210,255,0.5)", alpha * 0.6);
  }
  ctx.globalAlpha = 1;
}

export function twinkle(ctx: C, seed: number, n: number, yMax: number, t: number) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = r() * 960;
    const y = r() * yMax * 0.8;
    const p = r() * 10;
    const a = Math.max(0, Math.sin(t * (0.7 + r()) + p));
    glow(ctx, x, y, 4 + a * 4, "rgba(220,230,255,0.9)", a * 0.7);
  }
}

export function moon(ctx: C, x: number, y: number, r: number, tint = "#fff6dc") {
  glow(ctx, x, y, r * 7, "rgba(150,170,255,0.18)");
  glow(ctx, x, y, r * 2.6, "rgba(255,240,210,0.35)");
  ellipse(ctx, x, y, r, r, rad(ctx, x - r * 0.3, y - r * 0.3, r * 0.1, r * 1.1, [
    [0, "#ffffff"],
    [0.6, tint],
    [1, "#d8cdb0"],
  ]));
  const rr = rng(7);
  ctx.globalAlpha = 0.16;
  for (let i = 0; i < 9; i++) {
    const a = rr() * Math.PI * 2;
    const d = rr() * r * 0.7;
    ellipse(ctx, x + Math.cos(a) * d, y + Math.sin(a) * d, r * (0.08 + rr() * 0.16), r * (0.08 + rr() * 0.14), "#8a7f68");
  }
  ctx.globalAlpha = 1;
}

export function sun(ctx: C, x: number, y: number, r: number) {
  glow(ctx, x, y, r * 10, "rgba(255,170,90,0.35)");
  glow(ctx, x, y, r * 3, "rgba(255,220,150,0.6)");
  ellipse(ctx, x, y, r, r, "#fff3c8");
}

export function cloud(ctx: C, seed: number, x: number, y: number, w: number, h: number, top: string, bot: string, alpha = 1) {
  const r = rng(seed);
  ctx.save();
  ctx.globalAlpha = alpha;
  const g = lin(ctx, 0, y - h, 0, y + h * 0.4, [
    [0, top],
    [1, bot],
  ]);
  const n = 7 + Math.floor(w / 40);
  for (let i = 0; i < n; i++) {
    const cx = x + (r() - 0.5) * w;
    const k = 1 - Math.abs(cx - x) / (w * 0.6);
    const rx = (h * 0.6 + r() * h * 0.6) * Math.max(0.35, k);
    ellipse(ctx, cx, y - rx * 0.35 + r() * h * 0.2, rx * 1.4, rx * 0.8, g);
  }
  ctx.restore();
}

/** Layered island / mountain silhouette along a baseline. */
export function ridge(ctx: C, seed: number, x0: number, x1: number, base: number, h: number, fill: string | CanvasGradient, rough = 0.5) {
  const r = rng(seed);
  ctx.beginPath();
  ctx.moveTo(x0, base);
  const steps = 26;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const env = Math.sin(u * Math.PI);
    const y = base - h * env * (1 - rough + r() * rough);
    ctx.lineTo(x0 + (x1 - x0) * u, y);
  }
  ctx.lineTo(x1, base);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
}

export function seaBase(ctx: C, y0: number, y1: number, stops: Stops) {
  rect(ctx, 0, y0, 960, y1 - y0, lin(ctx, 0, y0, 0, y1, stops));
}

/** Animated shimmer: horizontal glints + light column. */
export function seaShimmer(ctx: C, t: number, y0: number, y1: number, lx: number, color: string, density = 1) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const r = rng(99);
  const n = Math.floor(160 * density);
  for (let i = 0; i < n; i++) {
    const v = r();
    const y = y0 + Math.pow(v, 1.6) * (y1 - y0);
    const depth = (y - y0) / (y1 - y0);
    const spread = 30 + depth * 140;
    const phase = r() * 6.28;
    const x = lx + (r() - 0.5) * 2 * spread + Math.sin(t * 0.8 + phase) * 6 * (1 + depth);
    const a = Math.max(0, Math.sin(t * 1.6 + phase * 3)) * (1 - Math.abs(x - lx) / (spread * 1.2));
    if (a <= 0) continue;
    ctx.globalAlpha = a * 0.75;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 4 + depth * 22 * r(), 1 + depth * 1.6);
  }
  ctx.globalAlpha = 1;
  // gentle wave lines everywhere
  for (let i = 0; i < 40 * density; i++) {
    const y = y0 + r() * (y1 - y0);
    const depth = (y - y0) / (y1 - y0);
    const x = ((r() * 1200 + t * (8 + depth * 14)) % 1100) - 70;
    ctx.globalAlpha = 0.08 + depth * 0.1;
    ctx.fillStyle = "#cfe8ff";
    ctx.fillRect(x, y, 20 + depth * 60, 1 + depth);
  }
  ctx.restore();
}

/** Curved palm tree. If t given, fronds sway. */
export function palm(ctx: C, x: number, y: number, h: number, lean: number, t: number, trunk = "#5b4433", leaf = "#1f4a33", light = "#3f7f52", seed = 1) {
  const r = rng(seed);
  const tipX = x + lean * h;
  const tipY = y - h;
  const cx = x + lean * h * 0.15;
  const cy = y - h * 0.55;
  // trunk segments
  const segs = 16;
  for (let i = segs; i >= 0; i--) {
    const u = i / segs;
    const px = (1 - u) * (1 - u) * x + 2 * (1 - u) * u * cx + u * u * tipX;
    const py = (1 - u) * (1 - u) * y + 2 * (1 - u) * u * cy + u * u * tipY;
    const w = (h * 0.05) * (1 - u * 0.45);
    ellipse(ctx, px, py, w, h * 0.035, trunk);
    ctx.globalAlpha = 0.35;
    ellipse(ctx, px - w * 0.35, py - h * 0.01, w * 0.45, h * 0.016, light);
    ctx.globalAlpha = 1;
  }
  // coconuts
  ellipse(ctx, tipX - 4, tipY + 8, 7, 7, "#3d2a1c");
  ellipse(ctx, tipX + 7, tipY + 6, 6.5, 6.5, "#4a3322");
  // fronds
  const n = 9;
  for (let i = 0; i < n; i++) {
    const base = (i / n) * Math.PI * 2 + r() * 0.3;
    const sway = Math.sin(t * 1.3 + i + seed) * 0.05;
    const ang = base + sway;
    const len = h * (0.42 + r() * 0.18);
    const droop = 0.55 + r() * 0.3;
    const ex = tipX + Math.cos(ang) * len;
    const ey = tipY + Math.sin(ang) * len * 0.35 + len * droop * 0.45;
    const mx = tipX + Math.cos(ang) * len * 0.5;
    const my = tipY - len * 0.18 + Math.sin(ang) * len * 0.1;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.quadraticCurveTo(mx, my - len * 0.08, ex, ey);
    ctx.quadraticCurveTo(mx, my + len * 0.08, tipX, tipY);
    ctx.fillStyle = i % 2 ? leaf : light;
    ctx.fill();
    // leaflets
    ctx.strokeStyle = leaf;
    ctx.lineWidth = 1.4;
    for (let k = 1; k < 9; k++) {
      const u = k / 9;
      const px = (1 - u) * (1 - u) * tipX + 2 * (1 - u) * u * mx + u * u * ex;
      const py = (1 - u) * (1 - u) * tipY + 2 * (1 - u) * u * my + u * u * ey;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(ang + 1.2) * 10 * (1 - u * 0.5), py + 9);
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(ang - 1.2) * 10 * (1 - u * 0.5), py + 9);
      ctx.stroke();
    }
  }
}

/** Cluster of leafy blobs (bushes, jungle). */
export function foliage(ctx: C, seed: number, x: number, y: number, w: number, h: number, dark: string, mid: string, hi: string, count = 30) {
  const r = rng(seed);
  for (let pass = 0; pass < 3; pass++) {
    const col = [dark, mid, hi][pass];
    for (let i = 0; i < count / (pass + 1); i++) {
      const px = x + r() * w;
      const py = y + h - Math.pow(r(), 0.7) * h * (1 - pass * 0.15);
      const s = 8 + r() * 22 * (1 - pass * 0.25);
      leaf(ctx, px, py - pass * 4, s, r() * 6.28, col);
    }
  }
}

export function leaf(ctx: C, x: number, y: number, s: number, a: number, col: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(a);
  ctx.beginPath();
  ctx.moveTo(-s, 0);
  ctx.quadraticCurveTo(0, -s * 0.55, s, 0);
  ctx.quadraticCurveTo(0, s * 0.55, -s, 0);
  ctx.fillStyle = col;
  ctx.fill();
  ctx.restore();
}

export function rock(ctx: C, seed: number, x: number, y: number, w: number, h: number, light: string, dark: string) {
  const r = rng(seed);
  const pts: number[] = [];
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const a = Math.PI + (i / n) * Math.PI;
    const k = 0.75 + r() * 0.3;
    pts.push(x + Math.cos(a) * w * 0.5 * k, y + Math.sin(a) * h * k);
  }
  poly(ctx, pts, lin(ctx, x - w / 2, y - h, x + w / 2, y, [
    [0, light],
    [1, dark],
  ]));
  ctx.globalAlpha = 0.25;
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = dark;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    const sx = x + (r() - 0.5) * w * 0.6;
    const sy = y - r() * h * 0.7;
    ctx.moveTo(sx, sy);
    ctx.lineTo(sx + (r() - 0.5) * 20, sy + 10 + r() * 14);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/** Wood plank surface with grain. */
export function planks(ctx: C, x: number, y: number, w: number, h: number, base: string, dark: string, vertical = false, size = 22, seed = 3) {
  const r = rng(seed);
  rect(ctx, x, y, w, h, base);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  const n = Math.ceil((vertical ? w : h) / size);
  for (let i = 0; i < n; i++) {
    const p = i * size;
    ctx.globalAlpha = 0.12 + r() * 0.18;
    if (vertical) rect(ctx, x + p, y, size, h, r() > 0.5 ? "#fff" : "#000");
    else rect(ctx, x, y + p, w, size, r() > 0.5 ? "#fff" : "#000");
    ctx.globalAlpha = 0.7;
    if (vertical) rect(ctx, x + p, y, 1.5, h, dark);
    else rect(ctx, x, y + p, w, 1.5, dark);
    // grain
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = dark;
    ctx.lineWidth = 1;
    for (let k = 0; k < 4; k++) {
      ctx.beginPath();
      if (vertical) {
        const gx = x + p + 3 + r() * (size - 6);
        ctx.moveTo(gx, y);
        ctx.bezierCurveTo(gx + 3, y + h * 0.3, gx - 3, y + h * 0.7, gx, y + h);
      } else {
        const gy = y + p + 3 + r() * (size - 6);
        ctx.moveTo(x, gy);
        ctx.bezierCurveTo(x + w * 0.3, gy + 2, x + w * 0.7, gy - 2, x + w, gy);
      }
      ctx.stroke();
    }
    // nails / joints
    ctx.globalAlpha = 0.5;
    const j = r() * (vertical ? h : w);
    if (vertical) rect(ctx, x + p, y + j, size, 1.5, dark);
    else rect(ctx, x + j, y + p, 1.5, size, dark);
  }
  ctx.restore();
  ctx.globalAlpha = 1;
}

export function barrel(ctx: C, x: number, y: number, w: number, h: number, wood = "#6b4a2f", band = "#2c2622") {
  ctx.save();
  ellipse(ctx, x, y, w / 2, h * 0.08, "rgba(0,0,0,0.35)");
  ctx.beginPath();
  ctx.moveTo(x - w * 0.42, y);
  ctx.bezierCurveTo(x - w * 0.56, y - h * 0.35, x - w * 0.56, y - h * 0.65, x - w * 0.42, y - h);
  ctx.lineTo(x + w * 0.42, y - h);
  ctx.bezierCurveTo(x + w * 0.56, y - h * 0.65, x + w * 0.56, y - h * 0.35, x + w * 0.42, y);
  ctx.closePath();
  ctx.fillStyle = lin(ctx, x - w / 2, 0, x + w / 2, 0, [
    [0, shade(wood, -0.45)],
    [0.35, shade(wood, 0.15)],
    [0.7, wood],
    [1, shade(wood, -0.5)],
  ]);
  ctx.fill();
  ctx.clip();
  ctx.globalAlpha = 0.25;
  for (let i = -3; i <= 3; i++) rect(ctx, x + i * w * 0.14, y - h, 1, h, "#000");
  ctx.globalAlpha = 1;
  for (const k of [0.15, 0.85]) rect(ctx, x - w, y - h * k - 3, w * 2, 6, band);
  ctx.restore();
  ellipse(ctx, x, y - h, w * 0.42, h * 0.07, shade(wood, -0.25));
  ctx.globalAlpha = 0.5;
  ellipse(ctx, x, y - h, w * 0.36, h * 0.05, shade(wood, -0.5));
  ctx.globalAlpha = 1;
}

export function crate(ctx: C, x: number, y: number, w: number, h: number, wood = "#7a5a3a") {
  ctx.save();
  rect(ctx, x, y - h, w, h, lin(ctx, x, y - h, x + w, y, [
    [0, shade(wood, 0.15)],
    [1, shade(wood, -0.35)],
  ]));
  ctx.strokeStyle = shade(wood, -0.55);
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 1.5, y - h + 1.5, w - 3, h - 3);
  ctx.beginPath();
  ctx.moveTo(x + 3, y - h + 3);
  ctx.lineTo(x + w - 3, y - 3);
  ctx.stroke();
  // top face
  poly(ctx, [x, y - h, x + w * 0.18, y - h - h * 0.18, x + w * 1.18, y - h - h * 0.18, x + w, y - h], shade(wood, 0.3));
  poly(ctx, [x + w, y - h, x + w * 1.18, y - h - h * 0.18, x + w * 1.18, y - h * 0.18, x + w, y], shade(wood, -0.45));
  ctx.restore();
}

export function lantern(ctx: C, x: number, y: number, s: number, lit: number) {
  ctx.save();
  rect(ctx, x - s * 0.08, y - s * 0.75, s * 0.16, s * 0.15, "#2a2420");
  poly(ctx, [x - s * 0.35, y - s * 0.6, x + s * 0.35, y - s * 0.6, x + s * 0.28, y + s * 0.3, x - s * 0.28, y + s * 0.3], "#2a2420");
  poly(ctx, [x - s * 0.26, y - s * 0.5, x + s * 0.26, y - s * 0.5, x + s * 0.2, y + s * 0.22, x - s * 0.2, y + s * 0.22], `rgba(255,${180 + lit * 50},${90 + lit * 40},${0.6 + lit * 0.4})`);
  ellipse(ctx, x, y - s * 0.05, s * 0.08, s * 0.16, "#fff7d0");
  rect(ctx, x - s * 0.36, y + s * 0.28, s * 0.72, s * 0.08, "#2a2420");
  ctx.restore();
}

export function flame(ctx: C, x: number, y: number, s: number, t: number) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 5; i++) {
    const f = Math.sin(t * 9 + i * 1.7) * 0.15 + Math.sin(t * 17 + i) * 0.08;
    const h = s * (1.4 - i * 0.18 + f);
    const w = s * (0.55 - i * 0.07);
    const col = ["rgba(255,90,20,0.55)", "rgba(255,140,40,0.55)", "rgba(255,190,70,0.6)", "rgba(255,230,140,0.7)", "rgba(255,255,220,0.8)"][i];
    ctx.beginPath();
    ctx.moveTo(x - w, y);
    ctx.quadraticCurveTo(x - w * 0.9, y - h * 0.5, x + f * s, y - h);
    ctx.quadraticCurveTo(x + w * 0.9, y - h * 0.5, x + w, y);
    ctx.closePath();
    ctx.fillStyle = col;
    ctx.fill();
  }
  ctx.restore();
}

export function vignette(ctx: C, strength = 0.55, color = "0,0,0") {
  ctx.fillStyle = rad(ctx, 480, 220, 260, 620, [
    [0, `rgba(${color},0)`],
    [1, `rgba(${color},${strength})`],
  ]);
  ctx.fillRect(0, 0, 960, 440);
}

let grainCanvas: HTMLCanvasElement | null = null;
/** Fine painterly grain over the whole frame. */
export function grain(ctx: C, alpha = 0.06) {
  if (typeof document === "undefined") return;
  if (!grainCanvas) {
    grainCanvas = document.createElement("canvas");
    grainCanvas.width = 256;
    grainCanvas.height = 256;
    const g = grainCanvas.getContext("2d")!;
    const img = g.createImageData(256, 256);
    const r = rng(42);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = Math.floor(r() * 255);
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }
  const p = ctx.createPattern(grainCanvas, "repeat");
  if (!p) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = p;
  ctx.fillRect(0, 0, 960, 440);
  ctx.restore();
}

/** Atmospheric light shaft. */
export function beam(ctx: C, x0: number, y0: number, w0: number, x1: number, y1: number, w1: number, color: string, alpha = 0.25) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = alpha;
  ctx.fillStyle = lin(ctx, x0, y0, x1, y1, [
    [0, color],
    [1, "rgba(0,0,0,0)"],
  ]);
  ctx.beginPath();
  ctx.moveTo(x0 - w0 / 2, y0);
  ctx.lineTo(x0 + w0 / 2, y0);
  ctx.lineTo(x1 + w1 / 2, y1);
  ctx.lineTo(x1 - w1 / 2, y1);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function fireflies(ctx: C, t: number, seed: number, n: number, x: number, y: number, w: number, h: number, color = "rgba(200,255,140,0.95)") {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const bx = x + r() * w;
    const by = y + r() * h;
    const p = r() * 6.28;
    const sp = 0.3 + r() * 0.5;
    const fx = bx + Math.sin(t * sp + p) * 26;
    const fy = by + Math.cos(t * sp * 1.3 + p) * 14;
    const a = 0.5 + 0.5 * Math.sin(t * 2.3 + p * 2);
    glow(ctx, fx, fy, 10, color, a * 0.9);
    ellipse(ctx, fx, fy, 1.4, 1.4, "#fbffe0");
  }
}

export function text(ctx: C, s: string, x: number, y: number, size: number, color: string, font = "Pirata One", align: CanvasTextAlign = "center") {
  ctx.save();
  ctx.font = `${size}px "${font}", serif`;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  ctx.fillStyle = color;
  ctx.fillText(s, x, y);
  ctx.restore();
}

/** Lighten (k>0) or darken (k<0) a #rrggbb colour. */
export function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255;
  let g = (n >> 8) & 255;
  let b = n & 255;
  if (k >= 0) {
    r += (255 - r) * k;
    g += (255 - g) * k;
    b += (255 - b) * k;
  } else {
    r *= 1 + k;
    g *= 1 + k;
    b *= 1 + k;
  }
  const h = (v: number) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** Multiply-tint the whole frame (night/dusk grading). */
export function grade(ctx: C, color: string, alpha: number, mode: GlobalCompositeOperation = "multiply") {
  ctx.save();
  ctx.globalCompositeOperation = mode;
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 960, 440);
  ctx.restore();
}

/** Wooden window with warm light. */
export function window_(ctx: C, x: number, y: number, w: number, h: number, light: string, frame = "#2a1d14") {
  rect(ctx, x - 4, y - 4, w + 8, h + 8, frame);
  rect(ctx, x, y, w, h, lin(ctx, x, y, x, y + h, [
    [0, light],
    [1, shade(light, -0.35)],
  ]));
  rect(ctx, x + w / 2 - 2, y, 4, h, frame);
  rect(ctx, x, y + h / 2 - 2, w, 4, frame);
  glow(ctx, x + w / 2, y + h / 2, Math.max(w, h) * 1.5, "rgba(255,170,70,0.35)");
}

export function sign(ctx: C, x: number, y: number, w: number, h: number, label: string, size = 18, wood = "#6a4a2e", ink = "#f3dfb0") {
  rrect(ctx, x, y, w, h, 6);
  ctx.fillStyle = lin(ctx, x, y, x, y + h, [
    [0, shade(wood, 0.15)],
    [1, shade(wood, -0.3)],
  ]);
  ctx.fill();
  ctx.strokeStyle = shade(wood, -0.6);
  ctx.lineWidth = 2.5;
  ctx.stroke();
  text(ctx, label, x + w / 2, y + h / 2 + 1, size, ink);
}
