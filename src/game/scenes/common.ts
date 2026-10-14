import { ellipse, glow, lin, poly, rng, shade, window_ } from "../art";

type C = CanvasRenderingContext2D;

export const depth = (y0: number, s0: number, y1: number, s1: number) => (y: number) =>
  s0 + (s1 - s0) * Math.max(0, Math.min(1, (y - y0) / (y1 - y0)));

export function house(ctx: C, x: number, base: number, w: number, h: number, wall: string, roof: string, seed: number, lit = true) {
  const r = rng(seed);
  const top = base - h;
  ctx.fillStyle = lin(ctx, x, top, x + w, base, [
    [0, shade(wall, 0.1)],
    [1, shade(wall, -0.4)],
  ]);
  ctx.fillRect(x, top, w, h);
  // timber frame
  ctx.strokeStyle = shade(wall, -0.6);
  ctx.lineWidth = 3;
  ctx.strokeRect(x, top, w, h);
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + (w * i) / 3, top);
    ctx.lineTo(x + (w * i) / 3, base);
    ctx.stroke();
  }
  // roof
  const oh = w * 0.08;
  poly(ctx, [x - oh, top + 2, x + w / 2, top - h * 0.55, x + w + oh, top + 2], lin(ctx, 0, top - h * 0.55, 0, top, [
    [0, shade(roof, 0.1)],
    [1, shade(roof, -0.35)],
  ]));
  ctx.strokeStyle = shade(roof, -0.6);
  ctx.lineWidth = 1;
  for (let i = 0; i < 6; i++) {
    const yy = top - h * 0.55 + (i + 1) * (h * 0.55) / 7;
    const k = (yy - (top - h * 0.55)) / (h * 0.55);
    ctx.beginPath();
    ctx.moveTo(x + w / 2 - (w / 2 + oh) * k, yy);
    ctx.lineTo(x + w / 2 + (w / 2 + oh) * k, yy);
    ctx.stroke();
  }
  // chimney
  if (r() > 0.4) {
    ctx.fillStyle = shade(wall, -0.5);
    ctx.fillRect(x + w * 0.7, top - h * 0.5, w * 0.1, h * 0.3);
  }
  const ww = Math.min(18, w * 0.18);
  for (let i = 0; i < 2; i++) {
    const wx = x + w * (0.22 + i * 0.4);
    if (lit && r() > 0.25) window_(ctx, wx, top + h * 0.25, ww, ww * 1.2, r() > 0.5 ? "#ffcf7a" : "#ffb35a", shade(wall, -0.65));
    else {
      ctx.fillStyle = "#151520";
      ctx.fillRect(wx, top + h * 0.25, ww, ww * 1.2);
    }
  }
}

export function cobbles(ctx: C, y0: number, y1: number, base: string, seed = 5) {
  const r = rng(seed);
  ctx.fillStyle = lin(ctx, 0, y0, 0, y1, [
    [0, shade(base, -0.3)],
    [1, base],
  ]);
  ctx.fillRect(0, y0, 960, y1 - y0);
  let y = y0;
  let row = 0;
  while (y < y1) {
    const k = (y - y0) / (y1 - y0);
    const sh = 5 + k * 14;
    const sw = sh * 1.8;
    let x = (row % 2) * sw * 0.5 - sw;
    while (x < 960 + sw) {
      const c = shade(base, -0.35 + r() * 0.4);
      ellipse(ctx, x + sw / 2, y + sh / 2, sw * 0.44, sh * 0.42, c);
      ctx.globalAlpha = 0.25;
      ellipse(ctx, x + sw * 0.45, y + sh * 0.35, sw * 0.3, sh * 0.18, "#d8d0e8");
      ctx.globalAlpha = 1;
      x += sw;
    }
    y += sh;
    row++;
  }
}

export function lamppost(ctx: C, x: number, base: number, h: number) {
  ctx.fillStyle = "#1c1a1e";
  ctx.fillRect(x - 3, base - h, 6, h);
  ctx.fillRect(x - 8, base - 6, 16, 6);
  poly(ctx, [x - 12, base - h, x + 12, base - h, x + 9, base - h - 26, x - 9, base - h - 26], "#ffd98a", "#1c1a1e", 3);
  poly(ctx, [x - 14, base - h - 26, x + 14, base - h - 26, x, base - h - 38], "#1c1a1e");
}

export function lampGlow(ctx: C, x: number, y: number, t: number, r = 130) {
  const f = 0.85 + Math.sin(t * 7) * 0.05 + Math.sin(t * 13) * 0.04;
  glow(ctx, x, y, r * f, "rgba(255,180,90,0.55)");
  glow(ctx, x, y, r * 0.3, "rgba(255,230,170,0.8)");
}

export function stoneWall(ctx: C, x: number, y: number, w: number, h: number, base: string, seed: number) {
  const r = rng(seed);
  ctx.fillStyle = shade(base, -0.4);
  ctx.fillRect(x, y, w, h);
  const bh = 22;
  for (let yy = y, row = 0; yy < y + h; yy += bh, row++) {
    for (let xx = x - (row % 2) * 24; xx < x + w; xx += 48) {
      const c = shade(base, -0.2 + r() * 0.3);
      ctx.fillStyle = lin(ctx, xx, yy, xx, yy + bh, [
        [0, shade(c, 0.12)],
        [1, shade(c, -0.15)],
      ]);
      ctx.beginPath();
      ctx.roundRect(Math.max(x, xx + 2), yy + 2, Math.min(44, x + w - xx - 4), bh - 4, 4);
      ctx.fill();
    }
  }
}

export function vines(ctx: C, seed: number, x: number, y: number, w: number, len: number, col: string, t = 0) {
  const r = rng(seed);
  for (let i = 0; i < Math.floor(w / 18); i++) {
    const vx = x + r() * w;
    const l = len * (0.4 + r() * 0.6);
    const sw = Math.sin(t * 0.8 + i) * 4;
    ctx.strokeStyle = shade(col, -0.3);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(vx, y);
    ctx.quadraticCurveTo(vx + sw + (r() - 0.5) * 20, y + l * 0.5, vx + sw * 1.5, y + l);
    ctx.stroke();
    for (let k = 0; k < l / 12; k++) {
      const u = k / (l / 12);
      ellipse(ctx, vx + sw * u * 1.5 + (k % 2 ? 4 : -4), y + l * u, 5, 3, k % 3 ? col : shade(col, 0.2));
    }
  }
}
