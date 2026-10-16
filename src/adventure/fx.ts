import type { FxDef } from "./types";
import { H, W } from "./types";

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  size: number;
  ph: number;
}

/** Small procedural particle system for ambience (fog, embers, dust, rain, ash, fireflies, drips, smoke). */
export class Fx {
  private ps: P[][] = [];
  constructor(private defs: FxDef[]) {
    this.ps = defs.map(() => []);
  }

  private area(d: FxDef): [number, number, number, number] {
    return d.area ?? [0, 0, W, H];
  }

  private target(d: FxDef): number {
    const n = d.n ?? 1;
    switch (d.kind) {
      case "fog": return Math.round(7 * n);
      case "embers": return Math.round(26 * n);
      case "dust": return Math.round(36 * n);
      case "rain": return Math.round(120 * n);
      case "ash": return Math.round(60 * n);
      case "fireflies": return Math.round(14 * n);
      case "drips": return Math.round(2 * n);
      case "smoke": return Math.round(9 * n);
    }
  }

  private spawn(d: FxDef, init: boolean): P {
    const [ax, ay, aw, ah] = this.area(d);
    const r = Math.random;
    const base: P = { x: ax + r() * aw, y: ay + r() * ah, vx: 0, vy: 0, life: 0, max: 4 + r() * 4, size: 1, ph: r() * 6.28 };
    switch (d.kind) {
      case "fog": base.vx = 4 + r() * 8; base.size = 120 + r() * 160; base.max = 40 + r() * 30; base.life = init ? r() * base.max : 0; break;
      case "embers": base.y = ay + ah - r() * 20; base.vx = (r() - 0.5) * 14; base.vy = -(18 + r() * 40); base.size = 1 + r() * 2; base.max = 2 + r() * 3; base.life = init ? r() * base.max : 0; break;
      case "dust": base.vx = (r() - 0.5) * 6; base.vy = (r() - 0.5) * 4; base.size = 0.8 + r() * 1.6; base.max = 6 + r() * 8; base.life = init ? r() * base.max : 0; break;
      case "rain": base.y = init ? ay + r() * ah : ay - 10; base.vx = -60; base.vy = 520 + r() * 120; base.size = 8 + r() * 8; base.max = 99; break;
      case "ash": base.y = init ? ay + r() * ah : ay - 5; base.vx = -10 + r() * 8; base.vy = 18 + r() * 30; base.size = 1 + r() * 2; base.max = 99; break;
      case "fireflies": base.vx = (r() - 0.5) * 12; base.vy = (r() - 0.5) * 8; base.size = 1.5 + r(); base.max = 8 + r() * 6; base.life = init ? r() * base.max : 0; break;
      case "drips": base.y = ay; base.vy = 0; base.max = 1.6 + r() * 3; base.life = init ? r() * base.max : 0; break;
      case "smoke": base.y = ay + ah - r() * 10; base.vx = 6 + r() * 6; base.vy = -(10 + r() * 14); base.size = 14 + r() * 22; base.max = 4 + r() * 4; base.life = init ? r() * base.max : 0; break;
    }
    return base;
  }

  update(dt: number) {
    this.defs.forEach((d, i) => {
      const arr = this.ps[i];
      const want = this.target(d);
      while (arr.length < want) arr.push(this.spawn(d, arr.length < want * 0.9 && arr.length === 0 ? true : arr.length < want));
      const [ax, ay, aw, ah] = this.area(d);
      for (let k = 0; k < arr.length; k++) {
        const p = arr[k];
        p.life += dt;
        p.ph += dt;
        if (d.kind === "drips") {
          if (p.life > p.max) p.vy += 900 * dt;
          p.y += p.vy * dt;
          if (p.y > ay + ah) arr[k] = this.spawn(d, false);
          continue;
        }
        p.x += (p.vx + Math.sin(p.ph * 1.3) * (d.kind === "embers" || d.kind === "fireflies" ? 10 : 2)) * dt;
        p.y += p.vy * dt;
        const out = p.x < ax - 200 || p.x > ax + aw + 200 || p.y > ay + ah + 20 || p.y < ay - 60;
        if (p.life > p.max || out) arr[k] = this.spawn(d, false);
      }
    });
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    this.defs.forEach((d, i) => {
      for (const p of this.ps[i]) {
        const t = p.life / p.max;
        const fade = Math.min(1, t * 5, (1 - t) * 3);
        switch (d.kind) {
          case "fog": {
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            const c = d.color ?? "190,200,210";
            g.addColorStop(0, `rgba(${c},${0.1 * fade})`);
            g.addColorStop(1, `rgba(${c},0)`);
            ctx.fillStyle = g;
            ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
            break;
          }
          case "embers": {
            ctx.globalCompositeOperation = "lighter";
            ctx.fillStyle = `rgba(255,${130 + Math.floor(p.ph * 20) % 80},40,${0.9 * fade})`;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            ctx.globalCompositeOperation = "source-over";
            break;
          }
          case "dust":
            ctx.fillStyle = `rgba(${d.color ?? "230,220,200"},${0.35 * fade})`;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            break;
          case "rain":
            ctx.strokeStyle = "rgba(170,190,220,0.35)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.vx * 0.02, p.y - p.size);
            ctx.stroke();
            break;
          case "ash":
            ctx.fillStyle = `rgba(${d.color ?? "200,190,185"},0.6)`;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            break;
          case "fireflies": {
            const a = 0.5 + 0.5 * Math.sin(p.ph * 2.2);
            ctx.globalCompositeOperation = "lighter";
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 8);
            const c = d.color ?? "190,255,120";
            g.addColorStop(0, `rgba(${c},${0.9 * a * fade})`);
            g.addColorStop(1, `rgba(${c},0)`);
            ctx.fillStyle = g;
            ctx.fillRect(p.x - 8, p.y - 8, 16, 16);
            ctx.globalCompositeOperation = "source-over";
            break;
          }
          case "drips":
            if (p.life > p.max) {
              ctx.fillStyle = "rgba(150,190,210,0.7)";
              ctx.fillRect(p.x, p.y, 1.5, 4);
            }
            break;
          case "smoke": {
            const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
            const c = d.color ?? "60,56,60";
            g.addColorStop(0, `rgba(${c},${0.28 * fade * (1 - t)})`);
            g.addColorStop(1, `rgba(${c},0)`);
            ctx.fillStyle = g;
            ctx.fillRect(p.x - p.size, p.y - p.size, p.size * 2, p.size * 2);
            break;
          }
        }
      }
    });
    ctx.restore();
  }
}
