import { ellipse, glow, lin, poly, rad, shade, shadow } from "./art";
import type { ActorRuntime } from "./types";

type C = CanvasRenderingContext2D;

export interface PersonSpec {
  skin: string;
  hair: string;
  hairStyle: "short" | "long" | "bun" | "bald" | "pony" | "wild";
  hat?: "bandana" | "tricorn" | "cap" | "feather";
  hatColor?: string;
  shirt: string;
  stripes?: string;
  vest?: string;
  coat?: string;
  coatLong?: boolean;
  skirt?: string;
  sash?: string;
  pants: string;
  boots: string;
  beard?: string;
  mustache?: string;
  glasses?: boolean;
  earring?: boolean;
  h?: number;
  girth?: number;
  prop?: "mandolin" | "mug" | "spyglass";
}

export interface Pose {
  walk?: number; // 0..1 phase, undefined = idle
  sit?: boolean;
  lean?: number; // upper body tilt (rad) – sleeping
  talking?: boolean;
  t: number;
  gesture?: number; // 0..1 arm raised
}

function capsule(ctx: C, x0: number, y0: number, x1: number, y1: number, w0: number, w1: number, fill: string | CanvasGradient) {
  const a = Math.atan2(y1 - y0, x1 - x0) + Math.PI / 2;
  const c = Math.cos(a);
  const s = Math.sin(a);
  ctx.beginPath();
  ctx.moveTo(x0 + c * w0, y0 + s * w0);
  ctx.lineTo(x1 + c * w1, y1 + s * w1);
  ctx.arc(x1, y1, w1, a, a + Math.PI);
  ctx.lineTo(x0 - c * w0, y0 - s * w0);
  ctx.arc(x0, y0, w0, a + Math.PI, a + Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = "rgba(10,6,4,0.45)";
  ctx.lineWidth = 1.1;
  ctx.stroke();
}

const OUT = "rgba(10,6,4,0.5)";

/** Side-view character, origin at the feet, facing +x before flipping. */
export function drawPerson(ctx: C, sp: PersonSpec, a: ActorRuntime, pose: Pose) {
  const height = 118 * (sp.h ?? 1) * a.scale;
  const u = height / 8.2;
  const gi = sp.girth ?? 1;
  const ph = pose.walk;
  const walking = ph !== undefined;
  const sw = walking ? Math.sin(ph * Math.PI * 2) : 0;
  const bob = walking ? -Math.abs(Math.cos(ph * Math.PI * 2)) * 0.18 * u : Math.sin(pose.t * 1.6) * 0.04 * u;

  ctx.save();
  ctx.translate(a.x, a.y);
  shadow(ctx, 0, 0, 26 * a.scale * gi, 6 * a.scale, 0.45);
  ctx.scale(a.facing, 1);

  const hipY = (pose.sit ? -2.3 * u : -4 * u) + bob;
  const hipX = 0;

  const legW = 0.36 * u * Math.min(1.2, gi);
  const pantsG = sp.pants;
  const drawLeg = (ang: number, back: boolean) => {
    const col = back ? shade(pantsG, -0.3) : pantsG;
    let kx: number, ky: number, fx: number, fy: number;
    if (pose.sit) {
      kx = hipX + 1.9 * u;
      ky = hipY + 0.1 * u;
      fx = kx + 0.2 * u;
      fy = 0;
    } else {
      const thigh = 2.05 * u;
      kx = hipX + Math.sin(ang) * thigh;
      ky = hipY + Math.cos(ang) * thigh;
      const bend = walking ? Math.max(0, -Math.sin((ph! + (back ? 0.5 : 0)) * Math.PI * 2 + 1.2)) * 0.9 : 0;
      const sa = ang - bend;
      fx = kx + Math.sin(sa) * 2.05 * u;
      fy = Math.min(0, ky + Math.cos(sa) * 2.05 * u);
    }
    capsule(ctx, hipX, hipY, kx, ky, legW * 1.1, legW, col);
    capsule(ctx, kx, ky, fx, fy - 0.25 * u, legW, legW * 0.9, col);
    // boot
    const bc = back ? shade(sp.boots, -0.3) : sp.boots;
    capsule(ctx, fx, fy - 0.55 * u, fx, fy - 0.2 * u, legW * 0.95, legW * 0.95, bc);
    ctx.beginPath();
    ctx.ellipse(fx + 0.3 * u, fy - 0.18 * u, 0.55 * u, 0.2 * u, 0, 0, Math.PI * 2);
    ctx.fillStyle = bc;
    ctx.fill();
    ctx.strokeStyle = OUT;
    ctx.stroke();
  };

  const shoulderY = hipY - 2.5 * u;
  const armSwing = walking ? -sw * 0.5 : Math.sin(pose.t * 1.2) * 0.04;
  const gesture = pose.talking ? 0.5 + Math.sin(pose.t * 5) * 0.35 : pose.gesture ?? 0;
  const sleeve = sp.coat ?? sp.shirt;
  const drawArm = (ang: number, back: boolean) => {
    const col = back ? shade(sleeve, -0.3) : sleeve;
    const ex = 0.1 * u + Math.sin(ang) * 1.3 * u;
    const ey = shoulderY + 0.25 * u + Math.cos(ang) * 1.3 * u;
    const fa = ang + (back ? 0.15 : 0.3 + gesture * 1.4);
    const hx = ex + Math.sin(fa) * 1.25 * u;
    const hy = ey + Math.cos(fa) * 1.25 * u;
    capsule(ctx, 0.1 * u, shoulderY + 0.25 * u, ex, ey, 0.32 * u * gi, 0.27 * u, col);
    capsule(ctx, ex, ey, hx, hy, 0.27 * u, 0.24 * u, col);
    ellipse(ctx, hx, hy + 0.05 * u, 0.26 * u, 0.28 * u, back ? shade(sp.skin, -0.25) : sp.skin);
    return { hx, hy };
  };

  // upper body group (can lean)
  const upper = (fn: () => void) => {
    ctx.save();
    if (pose.lean) {
      ctx.translate(hipX, hipY);
      ctx.rotate(pose.lean);
      ctx.translate(-hipX, -hipY);
    }
    fn();
    ctx.restore();
  };

  upper(() => drawArm(-armSwing - 0.05, true));
  drawLeg(-sw * 0.42, true);

  // skirt or long coat behind front leg
  if (sp.skirt && !pose.sit) {
    poly(ctx, [-0.8 * u * gi, hipY - 0.3 * u, 0.85 * u * gi, hipY - 0.3 * u, 1.25 * u * gi + sw * 0.3 * u, -1.1 * u, -1.25 * u * gi + sw * 0.2 * u, -1.1 * u],
      lin(ctx, -u, 0, u, 0, [[0, shade(sp.skirt, -0.35)], [0.5, sp.skirt], [1, shade(sp.skirt, -0.2)]]), OUT);
  }
  drawLeg(sw * 0.42, false);
  if (sp.coat && sp.coatLong && !pose.sit) {
    poly(ctx, [-0.85 * u * gi, hipY - 0.6 * u, 0.7 * u * gi, hipY - 0.6 * u, 0.95 * u * gi + sw * 0.4 * u, hipY + 1.6 * u, -1.05 * u * gi + sw * 0.25 * u, hipY + 1.7 * u],
      lin(ctx, -u, 0, u, 0, [[0, shade(sp.coat, -0.45)], [1, shade(sp.coat, -0.1)]]), OUT);
  }

  upper(() => {
    // torso
    const tw = 0.95 * u * gi;
    const body = new Path2D();
    body.moveTo(-tw * 0.8, shoulderY);
    body.quadraticCurveTo(-tw * 1.05, hipY - 1.2 * u, -tw * 0.85, hipY + 0.3 * u);
    body.lineTo(tw * 0.9, hipY + 0.3 * u);
    body.quadraticCurveTo(tw * (gi > 1.2 ? 1.5 : 1.15), hipY - 1.2 * u, tw * 0.75, shoulderY);
    body.quadraticCurveTo(0, shoulderY - 0.35 * u, -tw * 0.8, shoulderY);
    ctx.fillStyle = lin(ctx, -tw, 0, tw, 0, [
      [0, shade(sp.shirt, -0.35)],
      [0.55, sp.shirt],
      [1, shade(sp.shirt, -0.12)],
    ]);
    ctx.fill(body);
    if (sp.stripes) {
      ctx.save();
      ctx.clip(body);
      ctx.fillStyle = sp.stripes;
      for (let k = 0; k < 7; k++) ctx.fillRect(-tw * 1.6, shoulderY + k * 0.42 * u + 0.1 * u, tw * 3.2, 0.17 * u);
      ctx.restore();
    }
    if (sp.vest || sp.coat) {
      const vc = (sp.coat ?? sp.vest)!;
      ctx.save();
      ctx.clip(body);
      const v = new Path2D();
      v.moveTo(-tw * 1.2, shoulderY - u);
      v.lineTo(tw * 0.25, shoulderY - u);
      v.lineTo(tw * 0.4, shoulderY + 0.6 * u);
      v.lineTo(tw * (sp.coat ? 0.55 : 0.2), hipY + 0.5 * u);
      v.lineTo(-tw * 1.2, hipY + 0.5 * u);
      ctx.fillStyle = lin(ctx, -tw, 0, tw * 0.5, 0, [
        [0, shade(vc, -0.45)],
        [1, shade(vc, 0.1)],
      ]);
      ctx.fill(v);
      ctx.restore();
      if (sp.coat) {
        ctx.fillStyle = "#e9c873";
        for (let k = 0; k < 3; k++) ellipse(ctx, tw * 0.5, shoulderY + (0.6 + k * 0.55) * u, 0.09 * u, 0.09 * u, "#e9c873");
      }
    }
    ctx.strokeStyle = OUT;
    ctx.lineWidth = 1.2;
    ctx.stroke(body);
    if (sp.sash) {
      poly(ctx, [-tw * 0.95, hipY - 0.5 * u, tw * 0.95, hipY - 0.55 * u, tw * 0.92, hipY - 0.05 * u, -tw * 0.9, hipY], sp.sash, OUT);
      poly(ctx, [-tw * 0.85, hipY - 0.2 * u, -tw * 1.2, hipY + 0.9 * u + Math.sin(pose.t * 3) * 0.1 * u, -tw * 0.7, hipY + 0.8 * u], shade(sp.sash, -0.2));
    } else {
      rect2(ctx, -tw * 0.95, hipY - 0.35 * u, tw * 1.9, 0.3 * u, "#2a1c14");
      rect2(ctx, tw * 0.25, hipY - 0.38 * u, 0.36 * u, 0.36 * u, "#d9b45a");
    }

    // head
    const hx = 0.15 * u;
    const hy = shoulderY - 0.95 * u;
    const hr = 0.74 * u;
    capsule(ctx, 0.05 * u, shoulderY + 0.1 * u, hx, hy + 0.3 * u, 0.24 * u, 0.24 * u, shade(sp.skin, -0.2));
    // back hair
    if (sp.hairStyle === "long") {
      poly(ctx, [hx - hr * 0.9, hy - hr * 0.4, hx + hr * 0.2, hy - hr * 0.6, hx - hr * 0.1, hy + hr * 2.3, hx - hr * 1.3, hy + hr * 2.1], shade(sp.hair, -0.15), OUT);
    }
    if (sp.hairStyle === "pony") {
      capsule(ctx, hx - hr * 0.8, hy - hr * 0.3, hx - hr * 1.6, hy + hr * 1.1 + Math.sin(pose.t * 4) * 2, hr * 0.28, hr * 0.12, sp.hair);
    }
    ctx.beginPath();
    ctx.ellipse(hx, hy, hr * 0.92, hr, 0, 0, Math.PI * 2);
    ctx.fillStyle = rad(ctx, hx + hr * 0.3, hy - hr * 0.3, hr * 0.1, hr * 1.2, [
      [0, shade(sp.skin, 0.12)],
      [0.7, sp.skin],
      [1, shade(sp.skin, -0.3)],
    ]);
    ctx.fill();
    ctx.strokeStyle = OUT;
    ctx.stroke();
    // ear
    ellipse(ctx, hx - hr * 0.15, hy + hr * 0.05, hr * 0.2, hr * 0.27, shade(sp.skin, -0.15));
    if (sp.earring) ellipse(ctx, hx - hr * 0.15, hy + hr * 0.38, hr * 0.09, hr * 0.09, "#f2cf63");
    // nose
    ctx.beginPath();
    ctx.ellipse(hx + hr * 0.9, hy + hr * 0.08, hr * 0.26, hr * 0.2, 0.3, 0, Math.PI * 2);
    ctx.fillStyle = shade(sp.skin, -0.06);
    ctx.fill();
    ctx.strokeStyle = OUT;
    ctx.stroke();
    // eye
    const blink = Math.sin(pose.t * 0.9 + a.x) > 0.985;
    if (pose.lean && pose.lean > 0.8) {
      ctx.strokeStyle = "#2a1a10";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(hx + hr * 0.45, hy - hr * 0.1, hr * 0.14, 0, Math.PI);
      ctx.stroke();
    } else if (!blink) {
      ellipse(ctx, hx + hr * 0.45, hy - hr * 0.12, hr * 0.17, hr * 0.21, "#fbf7ee");
      ellipse(ctx, hx + hr * 0.53, hy - hr * 0.1, hr * 0.09, hr * 0.12, "#1a120c");
      ellipse(ctx, hx + hr * 0.56, hy - hr * 0.15, hr * 0.03, hr * 0.03, "#fff");
    } else {
      ctx.fillStyle = "#2a1a10";
      ctx.fillRect(hx + hr * 0.3, hy - hr * 0.1, hr * 0.3, 1.4);
    }
    // brow
    ctx.strokeStyle = shade(sp.hair === "#000000" ? "#333333" : sp.hair, -0.3);
    ctx.lineWidth = Math.max(1.2, hr * 0.12);
    ctx.beginPath();
    ctx.moveTo(hx + hr * 0.28, hy - hr * 0.42);
    ctx.lineTo(hx + hr * 0.68, hy - hr * 0.38 - (pose.talking ? Math.sin(pose.t * 7) * hr * 0.06 : 0));
    ctx.stroke();
    if (sp.glasses) {
      ctx.strokeStyle = "#3a2a1a";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(hx + hr * 0.5, hy - hr * 0.1, hr * 0.26, 0, Math.PI * 2);
      ctx.moveTo(hx + hr * 0.25, hy - hr * 0.15);
      ctx.lineTo(hx - hr * 0.15, hy - hr * 0.2);
      ctx.stroke();
      glow(ctx, hx + hr * 0.45, hy - hr * 0.2, hr * 0.2, "rgba(255,255,255,0.5)");
    }
    // mouth
    const open = pose.talking ? Math.max(0, Math.sin(pose.t * 22)) * hr * 0.2 : 0;
    ctx.fillStyle = "#4a1f17";
    ctx.beginPath();
    ctx.ellipse(hx + hr * 0.55, hy + hr * 0.48, hr * 0.2, Math.max(0.6, open), 0, 0, Math.PI * 2);
    ctx.fill();
    if (sp.beard) {
      ctx.beginPath();
      ctx.moveTo(hx - hr * 0.3, hy + hr * 0.05);
      ctx.quadraticCurveTo(hx - hr * 0.2, hy + hr * 1.6, hx + hr * 0.5, hy + hr * 1.55);
      ctx.quadraticCurveTo(hx + hr * 1.05, hy + hr * 1.1, hx + hr * 0.95, hy + hr * 0.35);
      ctx.quadraticCurveTo(hx + hr * 0.55, hy + hr * 0.6 + open, hx + hr * 0.2, hy + hr * 0.3);
      ctx.closePath();
      ctx.fillStyle = lin(ctx, 0, hy, 0, hy + hr * 1.6, [
        [0, sp.beard],
        [1, shade(sp.beard, -0.25)],
      ]);
      ctx.fill();
      ctx.strokeStyle = OUT;
      ctx.stroke();
    }
    if (sp.mustache) {
      ctx.strokeStyle = sp.mustache;
      ctx.lineWidth = hr * 0.18;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(hx + hr * 0.95, hy + hr * 0.3);
      ctx.quadraticCurveTo(hx + hr * 0.5, hy + hr * 0.25, hx + hr * 0.25, hy + hr * 0.45);
      ctx.quadraticCurveTo(hx + hr * 0.1, hy + hr * 0.55, hx + hr * 0.05, hy + hr * 0.3);
      ctx.stroke();
      ctx.lineCap = "butt";
    }
    // hair / hats
    const hc = sp.hair;
    if (sp.hairStyle !== "bald") {
      ctx.beginPath();
      ctx.moveTo(hx - hr * 0.95, hy + hr * 0.15);
      ctx.quadraticCurveTo(hx - hr * 1.05, hy - hr * 1.15, hx + hr * 0.2, hy - hr * 1.05);
      ctx.quadraticCurveTo(hx + hr * 0.9, hy - hr * 0.95, hx + hr * 0.85, hy - hr * 0.45);
      ctx.quadraticCurveTo(hx + hr * 0.3, hy - hr * 0.65, hx - hr * 0.05, hy - hr * 0.35);
      ctx.quadraticCurveTo(hx - hr * 0.35, hy - hr * 0.05, hx - hr * 0.95, hy + hr * 0.15);
      ctx.fillStyle = lin(ctx, 0, hy - hr, 0, hy, [
        [0, shade(hc, 0.15)],
        [1, shade(hc, -0.2)],
      ]);
      ctx.fill();
      ctx.strokeStyle = OUT;
      ctx.stroke();
      if (sp.hairStyle === "wild") {
        for (let k = 0; k < 5; k++) {
          poly(ctx, [hx - hr * 0.6 + k * hr * 0.3, hy - hr * 0.9, hx - hr * 0.8 + k * hr * 0.32, hy - hr * 1.4 - (k % 2) * hr * 0.2, hx - hr * 0.4 + k * hr * 0.3, hy - hr * 0.85], hc);
        }
      }
      if (sp.hairStyle === "bun") ellipse(ctx, hx - hr * 0.55, hy - hr * 0.95, hr * 0.42, hr * 0.38, shade(hc, -0.05));
    } else {
      glow(ctx, hx + hr * 0.1, hy - hr * 0.6, hr * 0.5, "rgba(255,255,255,0.35)");
    }
    const hat = sp.hatColor ?? "#333333";
    if (sp.hat === "bandana") {
      ctx.beginPath();
      ctx.moveTo(hx - hr * 1.0, hy - hr * 0.1);
      ctx.quadraticCurveTo(hx - hr * 0.9, hy - hr * 1.25, hx + hr * 0.3, hy - hr * 1.12);
      ctx.quadraticCurveTo(hx + hr * 0.95, hy - hr * 0.95, hx + hr * 0.9, hy - hr * 0.5);
      ctx.quadraticCurveTo(hx, hy - hr * 0.7, hx - hr * 1.0, hy - hr * 0.1);
      ctx.fillStyle = lin(ctx, 0, hy - hr, 0, hy, [
        [0, shade(hat, 0.2)],
        [1, shade(hat, -0.25)],
      ]);
      ctx.fill();
      ctx.strokeStyle = OUT;
      ctx.stroke();
      ctx.globalAlpha = 0.55;
      for (let k = 0; k < 4; k++) ellipse(ctx, hx - hr * 0.5 + k * hr * 0.35, hy - hr * 0.85 + (k % 2) * hr * 0.12, hr * 0.06, hr * 0.06, "#fff3d8");
      ctx.globalAlpha = 1;
      const fl = Math.sin(pose.t * 5) * hr * 0.15 + (walking ? hr * 0.2 : 0);
      poly(ctx, [hx - hr * 0.95, hy - hr * 0.25, hx - hr * 1.7, hy + hr * 0.1 - fl, hx - hr * 1.55, hy + hr * 0.35 - fl * 0.5], shade(hat, -0.1), OUT);
      poly(ctx, [hx - hr * 0.95, hy - hr * 0.2, hx - hr * 1.5, hy + hr * 0.7 - fl * 0.6, hx - hr * 1.2, hy + hr * 0.8 - fl * 0.3], shade(hat, -0.25), OUT);
    } else if (sp.hat === "tricorn" || sp.hat === "feather") {
      const by = hy - hr * 0.62;
      if (sp.hat === "tricorn") {
        poly(ctx, [hx - hr * 1.55, by + hr * 0.05, hx - hr * 0.6, by - hr * 0.35, hx + hr * 0.6, by - hr * 0.35, hx + hr * 1.6, by - hr * 0.1, hx + hr * 0.9, by + hr * 0.2, hx - hr * 0.9, by + hr * 0.25], shade(hat, -0.1), OUT);
        ctx.beginPath();
        ctx.moveTo(hx - hr * 0.8, by);
        ctx.quadraticCurveTo(hx, by - hr * 1.5, hx + hr * 0.85, by - hr * 0.05);
        ctx.closePath();
        ctx.fillStyle = hat;
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = "#e3bf5c";
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(hx - hr * 1.5, by + hr * 0.03);
        ctx.lineTo(hx - hr * 0.6, by - hr * 0.32);
        ctx.lineTo(hx + hr * 0.6, by - hr * 0.32);
        ctx.lineTo(hx + hr * 1.55, by - hr * 0.1);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.ellipse(hx, by + hr * 0.05, hr * 1.7, hr * 0.32, -0.08, 0, Math.PI * 2);
        ctx.fillStyle = shade(hat, -0.15);
        ctx.fill();
        ctx.strokeStyle = OUT;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(hx - hr * 0.85, by);
        ctx.quadraticCurveTo(hx - hr * 0.7, by - hr * 1.3, hx + hr * 0.1, by - hr * 1.2);
        ctx.quadraticCurveTo(hx + hr * 0.8, by - hr * 1.1, hx + hr * 0.85, by);
        ctx.closePath();
        ctx.fillStyle = hat;
        ctx.fill();
        ctx.stroke();
        const wv = Math.sin(pose.t * 2.2) * hr * 0.15;
        ctx.beginPath();
        ctx.moveTo(hx - hr * 0.3, by - hr * 0.9);
        ctx.quadraticCurveTo(hx - hr * 1.6, by - hr * 2.1 + wv, hx - hr * 2.4, by - hr * 0.9 + wv);
        ctx.quadraticCurveTo(hx - hr * 1.4, by - hr * 1.2, hx - hr * 0.3, by - hr * 0.7);
        ctx.fillStyle = "#e8c447";
        ctx.fill();
        ctx.stroke();
        rect2(ctx, hx - hr * 0.84, by - hr * 0.42, hr * 1.68, hr * 0.22, "#c43a3a");
      }
    } else if (sp.hat === "cap") {
      ctx.beginPath();
      ctx.moveTo(hx - hr * 0.95, hy - hr * 0.25);
      ctx.quadraticCurveTo(hx - hr * 0.9, hy - hr * 1.5, hx + hr * 0.1, hy - hr * 1.35);
      ctx.quadraticCurveTo(hx + hr * 0.95, hy - hr * 1.2, hx + hr * 0.9, hy - hr * 0.5);
      ctx.closePath();
      ctx.fillStyle = lin(ctx, 0, hy - hr * 1.4, 0, hy - hr * 0.3, [
        [0, shade(hat, 0.15)],
        [1, shade(hat, -0.25)],
      ]);
      ctx.fill();
      ctx.strokeStyle = OUT;
      ctx.stroke();
      rect2(ctx, hx - hr * 0.98, hy - hr * 0.62, hr * 1.92, hr * 0.3, shade(hat, -0.3));
    }
  });

  // front arm (+ props)
  upper(() => {
    const hand = drawArm(armSwing + (pose.sit ? 0.6 : 0.05), false);
    if (sp.prop === "mandolin") {
      ctx.save();
      ctx.translate(0.45 * u, shoulderY + 1.4 * u);
      ctx.rotate(-0.6);
      ellipse(ctx, 0, 0, 0.8 * u, 0.6 * u, lin(ctx, -u, 0, u, 0, [[0, "#6e3b1c"], [1, "#c1803f"]]));
      ellipse(ctx, 0.1 * u, 0, 0.18 * u, 0.18 * u, "#1d120b");
      rect2(ctx, 0.6 * u, -0.08 * u, 1.5 * u, 0.16 * u, "#3b2414");
      ctx.restore();
    } else if (sp.prop === "mug") {
      rect2(ctx, hand.hx - 0.2 * u, hand.hy - 0.55 * u, 0.5 * u, 0.6 * u, "#8a6b48");
      rect2(ctx, hand.hx - 0.2 * u, hand.hy - 0.6 * u, 0.5 * u, 0.12 * u, "#f3ecd8");
    }
  });
  ctx.restore();
}

function rect2(ctx: C, x: number, y: number, w: number, h: number, c: string) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}

/* ---------- Cast ---------- */

export const FINN: PersonSpec = {
  skin: "#f0c39a",
  hair: "#c27030",
  hairStyle: "short",
  hat: "bandana",
  hatColor: "#2f8f5b",
  shirt: "#f1e9d6",
  vest: "#23465c",
  sash: "#c4423a",
  pants: "#b29a73",
  boots: "#3a2618",
  earring: true,
  h: 1.06,
  girth: 1.0,
};

export const BARNABAS: PersonSpec = {
  skin: "#e2ad85",
  hair: "#d9d4ca",
  hairStyle: "short",
  hat: "cap",
  hatColor: "#3c5a7a",
  shirt: "#d9b13e",
  coat: "#d0a432",
  pants: "#3a3f4a",
  boots: "#2a2420",
  beard: "#ece8df",
  girth: 1.15,
  h: 0.95,
};

export const ROSA: PersonSpec = {
  skin: "#d9a07a",
  hair: "#8a2f1c",
  hairStyle: "long",
  hat: "tricorn",
  hatColor: "#2a1c18",
  shirt: "#f5efe2",
  coat: "#a12a2a",
  coatLong: true,
  pants: "#2b2b3a",
  boots: "#1e1612",
  earring: true,
  h: 1.04,
  girth: 0.95,
};

export const MO: PersonSpec = {
  skin: "#c88a62",
  hair: "#20140c",
  hairStyle: "bald",
  shirt: "#d9c9a8",
  vest: "#efe7d4",
  pants: "#3d3226",
  boots: "#211812",
  mustache: "#20140c",
  girth: 1.45,
  h: 1.05,
  prop: "mug",
};

export const PFEFFERKORN: PersonSpec = {
  skin: "#efc6a5",
  hair: "#bdb5ac",
  hairStyle: "bun",
  shirt: "#6b3d7a",
  skirt: "#5a2f68",
  pants: "#5a2f68",
  boots: "#2a1e1a",
  glasses: true,
  h: 0.92,
  girth: 1.1,
};

export const KNUT: PersonSpec = {
  skin: "#e3a987",
  hair: "#b8562a",
  hairStyle: "wild",
  hat: "cap",
  hatColor: "#7a2d2d",
  shirt: "#eeeeee",
  stripes: "#2b4a8a",
  pants: "#4a4032",
  boots: "#2a2018",
  beard: "#b8562a",
  girth: 1.1,
};

export const ZACHARIAS: PersonSpec = {
  skin: "#f0caa8",
  hair: "#1e1a2a",
  hairStyle: "pony",
  hat: "feather",
  hatColor: "#4b2a6a",
  shirt: "#f7f1e1",
  coat: "#2f5f6f",
  coatLong: true,
  pants: "#2a2230",
  boots: "#16110d",
  mustache: "#1e1a2a",
  girth: 0.82,
  h: 1.1,
  prop: "mandolin",
};

/* ---------- Creatures ---------- */

export function drawCrab(ctx: C, a: ActorRuntime, dance = 0) {
  const s = a.scale;
  ctx.save();
  ctx.translate(a.x, a.y);
  shadow(ctx, 0, 0, 70 * s, 12 * s, 0.45);
  ctx.scale(s, s);
  const t = a.t;
  const bounce = dance ? Math.abs(Math.sin(t * 8)) * 10 : Math.sin(t * 2) * 1.5;
  ctx.translate(0, -bounce);
  // legs
  for (const side of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const ox = side * (24 + i * 9);
      const wig = Math.sin(t * (dance ? 14 : 3) + i) * 4;
      ctx.strokeStyle = "#8f2116";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(ox * 0.6, -28);
      ctx.lineTo(ox + side * 18, -42 + wig);
      ctx.lineTo(ox + side * 30, bounce - 2);
      ctx.stroke();
    }
  }
  // body
  ctx.beginPath();
  ctx.ellipse(0, -40, 62, 34, 0, Math.PI, 0);
  ctx.quadraticCurveTo(50, -10, 0, -12);
  ctx.quadraticCurveTo(-50, -10, -62, -40);
  ctx.fillStyle = rad(ctx, -15, -60, 5, 80, [
    [0, "#ff7a52"],
    [0.6, "#d6402a"],
    [1, "#8a1d12"],
  ]);
  ctx.fill();
  ctx.strokeStyle = "#4a0f08";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.globalAlpha = 0.35;
  for (let i = 0; i < 6; i++) ellipse(ctx, -35 + i * 14, -55 + (i % 2) * 6, 4, 3, "#ffd2b0");
  ctx.globalAlpha = 1;
  // eyes on stalks
  for (const side of [-1, 1]) {
    const ex = side * 16;
    const ey = -88 + Math.sin(t * 3 + side) * 3;
    ctx.strokeStyle = "#a8301e";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(side * 12, -66);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ellipse(ctx, ex, ey, 9, 10, "#fffaf0");
    ellipse(ctx, ex + 2, ey + 1, 4.5, 5.5, "#140c08");
    ellipse(ctx, ex + 3, ey - 1, 1.5, 1.5, "#fff");
  }
  // monocle (Sir!)
  ctx.strokeStyle = "#e8c75a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(16, -88, 12, 0, Math.PI * 2);
  ctx.stroke();
  // claws
  for (const side of [-1, 1]) {
    const up = dance ? Math.sin(t * 8 + side) * 0.6 : Math.sin(t * 1.5 + side) * 0.1;
    ctx.save();
    ctx.translate(side * 58, -48);
    ctx.rotate(side * (-0.5 - up));
    ctx.strokeStyle = "#a8301e";
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(side * 18, -22);
    ctx.stroke();
    const snap = Math.max(0, Math.sin(t * 4)) * 0.3;
    ctx.translate(side * 22, -36);
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 22, side * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = "#d6402a";
    ctx.fill();
    ctx.strokeStyle = "#4a0f08";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.rotate(-snap * side);
    poly(ctx, [side * 4, -18, side * 22, -34, side * 14, -12], "#c2361f", "#4a0f08", 2);
    ctx.restore();
  }
  // mouth
  ctx.strokeStyle = "#4a0f08";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, -36, 10, 0.2, Math.PI - 0.2);
  ctx.stroke();
  ctx.restore();
}

export function drawHeron(ctx: C, a: ActorRuntime, hasHorn: boolean) {
  const s = a.scale;
  const t = a.t;
  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.scale(a.facing * s, s);
  ctx.strokeStyle = "#6a5a40";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(-4, 0);
  ctx.lineTo(-2, -58);
  ctx.moveTo(6, 0);
  ctx.lineTo(4, -58);
  ctx.stroke();
  ellipse(ctx, 0, -78, 26, 20, lin(ctx, 0, -98, 0, -58, [[0, "#f4f1ea"], [1, "#9aa6ad"]]));
  poly(ctx, [-18, -82, -46, -70, -20, -66], "#7c8a92");
  const nod = Math.sin(t * 1.3) * 3;
  ctx.strokeStyle = "#e9e5dc";
  ctx.lineWidth = 7;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(14, -88);
  ctx.quadraticCurveTo(34, -106, 18, -126 + nod);
  ctx.stroke();
  ellipse(ctx, 20, -130 + nod, 10, 8, "#f4f1ea");
  poly(ctx, [27, -133 + nod, 58, -128 + nod, 27, -126 + nod], "#e0a43a");
  ellipse(ctx, 22, -132 + nod, 2, 2, "#111");
  poly(ctx, [12, -134 + nod, -6, -128 + nod, 10, -130 + nod], "#2b2b2b");
  ctx.lineCap = "butt";
  if (hasHorn) {
    ctx.save();
    ctx.translate(16, 2);
    ctx.rotate(-0.2);
    ellipse(ctx, 0, -6, 18, 9, lin(ctx, -18, 0, 18, 0, [[0, "#f6d7c4"], [1, "#d08f73"]]));
    poly(ctx, [12, -12, 30, -4, 12, 0], "#e3b19a");
    ctx.restore();
  }
  ctx.restore();
}

export function drawParrot(ctx: C, a: ActorRuntime) {
  const t = a.t;
  const s = a.scale;
  ctx.save();
  ctx.translate(a.x, a.y);
  ctx.scale(a.facing * s, s);
  const bob = Math.sin(t * 3) * 1.5;
  poly(ctx, [-6, -6, -14, 24, -2, 22, 2, -4], "#2a5bc4");
  ellipse(ctx, 0, -22 + bob, 12, 18, lin(ctx, 0, -40, 0, -4, [[0, "#ff4d3a"], [1, "#c8261b"]]));
  ellipse(ctx, -4, -16 + bob, 7, 12, "#2fae5a");
  ellipse(ctx, 2, -40 + bob, 10, 10, "#ff5a40");
  ellipse(ctx, 5, -42 + bob, 4, 4, "#fff");
  ellipse(ctx, 6, -42 + bob, 2, 2, "#111");
  ctx.beginPath();
  ctx.moveTo(10, -42 + bob);
  ctx.quadraticCurveTo(20, -38 + bob, 12, -30 + bob);
  ctx.lineTo(9, -36 + bob);
  ctx.closePath();
  ctx.fillStyle = "#f0e6c8";
  ctx.fill();
  ctx.strokeStyle = "#3a3020";
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.restore();
}

export function drawWitch(ctx: C, a: ActorRuntime, defeated: boolean) {
  const t = a.t;
  const s = a.scale;
  ctx.save();
  ctx.translate(a.x, a.y);
  if (defeated) {
    // grumpy sea cucumber
    ctx.scale(s, s);
    ellipse(ctx, 0, -10, 34, 14, lin(ctx, 0, -24, 0, 4, [[0, "#c27ad6"], [1, "#6a2f80"]]));
    for (let i = 0; i < 6; i++) ellipse(ctx, -24 + i * 10, -22 + Math.sin(t * 4 + i) * 1.5, 3, 4, "#e2a6f0");
    ellipse(ctx, 16, -14, 4, 4, "#fff");
    ellipse(ctx, 26, -14, 4, 4, "#fff");
    ellipse(ctx, 17, -13, 2, 2, "#111");
    ellipse(ctx, 27, -13, 2, 2, "#111");
    ctx.strokeStyle = "#2a0f30";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(12, -22);
    ctx.lineTo(20, -19);
    ctx.moveTo(30, -22);
    ctx.lineTo(23, -19);
    ctx.stroke();
    ctx.restore();
    return;
  }
  const hover = Math.sin(t * 1.4) * 8;
  ctx.translate(0, -30 + hover);
  ctx.scale(a.facing * s, s);
  glow(ctx, 0, -70, 150, "rgba(60,255,200,0.18)");
  // robe of kelp strands
  for (let i = 0; i < 14; i++) {
    const x = -40 + i * 6;
    const sway = Math.sin(t * 2 + i * 0.7) * 10;
    ctx.beginPath();
    ctx.moveTo(x * 0.6, -110);
    ctx.quadraticCurveTo(x + sway, -50, x * 1.2 + sway * 1.6, 20 + (i % 3) * 8);
    ctx.lineTo(x * 1.2 + sway * 1.6 + 8, 14 + (i % 3) * 8);
    ctx.quadraticCurveTo(x + 8 + sway, -50, x * 0.6 + 6, -110);
    ctx.fillStyle = i % 2 ? "#0f5a4e" : "#1b7a5c";
    ctx.fill();
  }
  ellipse(ctx, 0, -112, 30, 22, "#13463e");
  // arms raised
  const up = Math.sin(t * 2.5) * 0.2;
  for (const side of [-1, 1]) {
    ctx.strokeStyle = "#5fb3a0";
    ctx.lineWidth = 7;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(side * 24, -112);
    ctx.quadraticCurveTo(side * 56, -140 - up * 40, side * 52, -176 - up * 30);
    ctx.stroke();
    glow(ctx, side * 52, -180 - up * 30, 24, "rgba(120,255,220,0.8)");
  }
  ctx.lineCap = "butt";
  // head
  ellipse(ctx, 0, -146, 22, 26, rad(ctx, 6, -152, 3, 30, [[0, "#9fe0cf"], [1, "#3d8a7a"]]));
  // floating hair
  for (let i = 0; i < 9; i++) {
    const ang = -Math.PI + (i / 8) * Math.PI;
    const sw = Math.sin(t * 1.8 + i) * 0.25;
    ctx.strokeStyle = "#1c2f4a";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(Math.cos(ang) * 18, -150 + Math.sin(ang) * 22);
    ctx.quadraticCurveTo(Math.cos(ang + sw) * 50, -170 + Math.sin(ang) * 40, Math.cos(ang + sw * 2) * 70, -150 + Math.sin(ang + sw) * 55);
    ctx.stroke();
  }
  // crown of coral
  for (let i = -2; i <= 2; i++) poly(ctx, [i * 8 - 4, -168, i * 9, -186 - Math.abs(i) * -3, i * 8 + 4, -168], "#ff6f7d");
  // eyes
  for (const side of [-1, 1]) {
    ellipse(ctx, 6 + side * 8, -148, 4.5, 3, "#eaffff");
    glow(ctx, 6 + side * 8, -148, 12, "rgba(160,255,240,0.9)");
  }
  ctx.strokeStyle = "#16302a";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-2, -134);
  ctx.quadraticCurveTo(8, -128 + (a.talking ? Math.sin(t * 20) * 3 : 0), 16, -134);
  ctx.stroke();
  ctx.restore();
}
