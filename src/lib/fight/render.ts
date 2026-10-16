import {
  CHARS,
  CHAR_IDS,
  FX_IDS,
  SPRITES,
  STAGES,
  STAGE_IDS,
  fxUrl,
  spriteUrl,
  stageUrl,
  type CharId,
  type FxId,
  type PoseId,
  type StageId,
} from "./data";
import {
  ARENA_W,
  GROUND_Y,
  VIEW_H,
  VIEW_W,
  fighterHeight,
  moveOf,
  poseOf,
  type Fighter,
  type GameEvent,
  type GameState,
  type Projectile,
} from "./engine";

export const FONT = `"Bungee", "Impact", "Arial Black", sans-serif`;

// ── image cache ─────────────────────────────────────────────────────────────
const POSES: PoseId[] = ["idle", "punch", "kick", "block", "hit", "crouch", "jump", "ko", "special"];
const cache = new Map<string, HTMLImageElement>();

function img(url: string) {
  let i = cache.get(url);
  if (!i) {
    i = new Image();
    i.decoding = "async";
    i.src = url;
    cache.set(url, i);
  }
  return i;
}

/** Preload the sprites for the given fighters plus a stage; resolves when decoded. */
export function preload(chars: CharId[], stage?: StageId): Promise<void> {
  const urls = chars.flatMap((c) => POSES.map((p) => spriteUrl(c, p)));
  if (stage) urls.push(stageUrl(stage));
  if (chars.length) urls.push(...FX_IDS.map(fxUrl));
  return Promise.all(
    urls.map(
      (u) =>
        new Promise<void>((res) => {
          const i = img(u);
          if (i.complete && i.naturalWidth) res();
          else {
            i.addEventListener("load", () => res(), { once: true });
            i.addEventListener("error", () => res(), { once: true });
          }
        }),
    ),
  ).then(() => undefined);
}

export function preloadAll() {
  return preload(CHAR_IDS).then(() => Promise.all(STAGE_IDS.map((s) => preload([], s))));
}

// ── render state (client-side only, never networked) ────────────────────────
interface Particle {
  kind: "spark" | "dust" | "ring" | "text" | "ember" | "streak" | "bolt" | "sprite";
  fx?: FxId;
  /** Sprite growth: scale goes from s0 to s1 over the particle's life. */
  s0?: number;
  s1?: number;
  flip?: boolean;
  /** Anchor the sprite at its bottom edge (dust, quake). */
  bottom?: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
  size: number;
  text?: string;
  rot?: number;
}

interface Trail {
  x: number;
  y: number;
  pose: PoseId;
  facing: 1 | -1;
}

export interface RenderState {
  particles: Particle[];
  ambient: Particle[];
  trails: [Trail[], Trail[]];
  shownHp: [number, number];
  camX: number;
  flashT: number;
  flashColor: string;
  superName: string;
  superColor: string;
  superOwner: 0 | 1;
  superT: number;
  comboShow: [{ n: number; dmg: number; t: number }, { n: number; dmg: number; t: number }];
  labels: [string, string];
}

export function createRenderState(labels: [string, string] = ["P1", "P2"]): RenderState {
  return {
    particles: [],
    ambient: [],
    trails: [[], []],
    shownHp: [1, 1],
    camX: (ARENA_W - VIEW_W) / 2,
    flashT: 0,
    flashColor: "#fff",
    superName: "",
    superColor: "#fff",
    superOwner: 0,
    superT: 0,
    comboShow: [
      { n: 0, dmg: 0, t: 0 },
      { n: 0, dmg: 0, t: 0 },
    ],
    labels,
  };
}

const rand = (a: number, b: number) => a + Math.random() * (b - a);

function burst(rs: RenderState, x: number, y: number, n: number, color: string, speed: number, size = 3) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const v = rand(speed * 0.4, speed);
    rs.particles.push({
      kind: "spark",
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      life: 0,
      max: rand(12, 24),
      color,
      size: rand(size * 0.6, size * 1.4),
      rot: a,
    });
  }
}

function fxSprite(
  rs: RenderState,
  fx: FxId,
  x: number,
  y: number,
  size: number,
  max: number,
  opts: { s0?: number; s1?: number; rot?: number; flip?: boolean; bottom?: boolean; vx?: number; vy?: number } = {},
) {
  rs.particles.push({
    kind: "sprite",
    fx,
    x,
    y,
    vx: opts.vx ?? 0,
    vy: opts.vy ?? 0,
    life: 0,
    max,
    color: "",
    size,
    s0: opts.s0 ?? 0.5,
    s1: opts.s1 ?? 1.1,
    rot: opts.rot ?? 0,
    flip: opts.flip,
    bottom: opts.bottom,
  });
}

function floatText(rs: RenderState, x: number, y: number, text: string, color: string, size = 30) {
  rs.particles.push({ kind: "text", x, y, vx: 0, vy: -1.2, life: 0, max: 50, color, size, text });
}

/** Turn engine events into particles / flashes. Coordinates: world x, height y. */
export function processEvents(rs: RenderState, s: GameState, events: GameEvent[]) {
  for (const e of events) {
    const sy = GROUND_Y - e.y;
    const attacker = s.f[e.who];
    const col = CHARS[attacker.char].color;
    switch (e.type) {
      case "hit":
        fxSprite(rs, "hit", e.x, sy, 120, 11, { rot: rand(-0.6, 0.6) });
        burst(rs, e.x, sy, 10, "#fff6c2", 9);
        burst(rs, e.x, sy, 6, col, 7);
        rs.particles.push({ kind: "ring", x: e.x, y: sy, vx: 0, vy: 0, life: 0, max: 12, color: "#fff", size: 40 });
        if (e.text) floatText(rs, e.x, sy - 50, e.text, "#facc15", 26);
        break;
      case "heavyHit":
        fxSprite(rs, "heavy", e.x, sy, 210, 15, { rot: rand(-0.4, 0.4), s0: 0.4, s1: 1.2 });
        burst(rs, e.x, sy, 18, "#fff6c2", 14, 4);
        burst(rs, e.x, sy, 10, col, 10, 4);
        rs.particles.push({ kind: "ring", x: e.x, y: sy, vx: 0, vy: 0, life: 0, max: 16, color: "#fff", size: 80 });
        for (let i = 0; i < 5; i++) {
          const a = rand(-0.5, 0.5) + (attacker.facing === 1 ? 0 : Math.PI);
          rs.particles.push({ kind: "streak", x: e.x, y: sy, vx: Math.cos(a) * 22, vy: Math.sin(a) * 22, life: 0, max: 10, color: "#fff", size: 3, rot: a });
        }
        if (e.text) floatText(rs, e.x, sy - 60, e.text, "#facc15", 28);
        break;
      case "block": {
        const atkLeft = s.f[e.who === 0 ? 1 : 0].x < s.f[e.who].x;
        fxSprite(rs, "block", e.x, sy, 130, 12, { flip: atkLeft, s0: 0.8, s1: 1.05 });
        burst(rs, e.x, sy, 8, "#7dd3fc", 6, 2.5);
        rs.particles.push({ kind: "ring", x: e.x, y: sy, vx: 0, vy: 0, life: 0, max: 10, color: "#7dd3fc", size: 34 });
        break;
      }
      case "parry":
        fxSprite(rs, "block", e.x, sy, 200, 20, { flip: s.f[e.who === 0 ? 1 : 0].x < s.f[e.who].x, s0: 0.6, s1: 1.3 });
        rs.particles.push({ kind: "ring", x: e.x, y: sy, vx: 0, vy: 0, life: 0, max: 22, color: "#ffffff", size: 120 });
        burst(rs, e.x, sy, 16, "#e0f2fe", 10, 3);
        floatText(rs, e.x, sy - 70, "PARRY!", "#38bdf8", 34);
        rs.flashT = 6;
        rs.flashColor = "rgba(186,230,253,0.45)";
        break;
      case "armor":
        floatText(rs, e.x, sy - 60, "ARMOR", "#a3e635", 26);
        burst(rs, e.x, sy, 10, "#a3e635", 6);
        break;
      case "throw":
        fxSprite(rs, "heavy", e.x, sy, 180, 14);
        burst(rs, e.x, sy, 14, "#fde68a", 9);
        floatText(rs, e.x, sy - 60, "WURF!", "#fb923c", 32);
        break;
      case "tech":
        floatText(rs, e.x, sy - 60, "TECH!", "#e5e7eb", 28);
        burst(rs, e.x, sy, 10, "#fff", 7);
        break;
      case "land":
      case "dash":
      case "jump":
        fxSprite(rs, "dust", e.x, GROUND_Y + 6, (e.power ?? 1) > 1 ? 190 : 120, 26, {
          bottom: true,
          s0: 0.5,
          s1: 1.15,
          flip: Math.random() < 0.5,
        });
        for (let i = 0; i < ((e.power ?? 1) > 1 ? 14 : 6); i++) {
          rs.particles.push({
            kind: "dust",
            x: e.x + rand(-30, 30),
            y: GROUND_Y - rand(0, 8),
            vx: rand(-2.5, 2.5),
            vy: rand(-1.5, -0.2),
            life: 0,
            max: rand(18, 30),
            color: "rgba(230,220,200,0.55)",
            size: rand(8, 16),
          });
        }
        break;
      case "special":
        rs.particles.push({ kind: "ring", x: attacker.x, y: sy, vx: 0, vy: 0, life: 0, max: 18, color: col, size: 110 });
        floatText(rs, attacker.x, sy - 140, e.text ?? "", col, 22);
        break;
      case "super":
        rs.superT = 46;
        rs.superName = e.text ?? "";
        rs.superColor = e.color ?? col;
        rs.superOwner = e.who;
        break;
      case "projClash":
        fxSprite(rs, "heavy", e.x, sy, 220, 16, { rot: rand(-0.5, 0.5) });
        burst(rs, e.x, sy, 20, "#fff", 12, 4);
        rs.particles.push({ kind: "ring", x: e.x, y: sy, vx: 0, vy: 0, life: 0, max: 16, color: "#fff", size: 90 });
        break;
      case "guardBreak":
        floatText(rs, e.x, sy - 40, "GUARD BREAK!", "#f87171", 30);
        burst(rs, e.x, sy, 22, "#93c5fd", 12, 3);
        break;
      case "ko":
        fxSprite(rs, "ko", e.x, sy, 420, 34, { s0: 0.3, s1: 1.3 });
        rs.flashT = 14;
        rs.flashColor = "rgba(255,255,255,0.8)";
        burst(rs, e.x, sy, 30, "#fff6c2", 16, 5);
        break;
      case "burn":
        for (let i = 0; i < 3; i++) {
          rs.particles.push({
            kind: "ember",
            x: e.x + rand(-25, 25),
            y: sy + rand(-60, 60),
            vx: rand(-0.6, 0.6),
            vy: rand(-2.5, -1),
            life: 0,
            max: rand(20, 34),
            color: Math.random() < 0.5 ? "#fb923c" : "#facc15",
            size: rand(3, 6),
          });
        }
        break;
      default:
        break;
    }
  }

  // Combo counters.
  for (const i of [0, 1] as const) {
    const f = s.f[i];
    const c = rs.comboShow[i];
    if (f.combo >= 2) {
      c.n = f.combo;
      c.dmg = Math.round(f.comboDmg);
      c.t = 80;
    } else if (c.t > 0) c.t--;
  }
}

// ── drawing ─────────────────────────────────────────────────────────────────
function drawStage(ctx: CanvasRenderingContext2D, s: GameState, rs: RenderState, camX: number, now: number) {
  const st = STAGES[s.stage];
  const bg = img(stageUrl(s.stage));
  if (bg.complete && bg.naturalWidth) {
    const scale = (VIEW_H * 1.1) / bg.naturalHeight;
    const w = bg.naturalWidth * scale;
    const h = VIEW_H * 1.1;
    const range = w - VIEW_W;
    const ox = -(camX / (ARENA_W - VIEW_W)) * range;
    ctx.drawImage(bg, ox, VIEW_H - h + 6 + st.shift, w, h);
  } else {
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  }
  // Ground contact shade.
  const g = ctx.createLinearGradient(0, GROUND_Y - 30, 0, VIEW_H);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.35)");
  ctx.fillStyle = g;
  ctx.fillRect(0, GROUND_Y - 30, VIEW_W, VIEW_H);

  // Ambient particles per stage.
  const kind = st.ambient;
  if (kind === "none") return;
  const amb = rs.ambient;
  const target = kind === "rain" ? 80 : kind === "confetti" ? 40 : kind === "embers" ? 36 : 18;
  while (amb.length < target) {
    if (kind === "rain") {
      amb.push({ kind: "streak", x: rand(0, VIEW_W), y: rand(-VIEW_H, 0), vx: -1.5, vy: rand(13, 17), life: 0, max: 999, color: "rgba(254,205,211,0.35)", size: 1, rot: 0 });
    } else if (kind === "embers") {
      amb.push({ kind: "ember", x: rand(0, VIEW_W), y: rand(GROUND_Y - 40, VIEW_H), vx: rand(-0.4, 0.4), vy: rand(-1.6, -0.6), life: rand(0, 200), max: 300, color: Math.random() < 0.5 ? "#fb923c" : "#fde047", size: rand(1.2, 2.6) });
    } else if (kind === "confetti") {
      amb.push({ kind: "spark", x: rand(0, VIEW_W), y: rand(-VIEW_H, 0), vx: rand(-0.6, 0.6), vy: rand(0.8, 1.8), life: 0, max: 999, color: Math.random() < 0.5 ? "#60a5fa" : "#f8fafc", size: rand(3, 6), rot: rand(0, 6) });
    } else {
      amb.push({ kind: "ember", x: rand(0, VIEW_W), y: rand(60, GROUND_Y), vx: rand(0.1, 0.4), vy: rand(-0.15, 0.15), life: rand(0, 300), max: 600, color: "rgba(226,232,240,0.45)", size: rand(1, 2) });
    }
  }
  for (const p of amb) {
    p.x += p.vx;
    p.y += p.vy;
    p.life++;
    if (kind === "rain") {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x - p.vx * 1.5, p.y - p.vy * 1.5);
      ctx.stroke();
      if (p.y > GROUND_Y + 30) {
        p.y = rand(-80, 0);
        p.x = rand(0, VIEW_W + 60);
      }
    } else if (kind === "confetti") {
      p.rot = (p.rot ?? 0) + 0.08;
      ctx.save();
      ctx.translate(p.x + Math.sin(now / 400 + p.size) * 6, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.abs(Math.sin(p.rot)));
      ctx.fillStyle = p.color;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
      ctx.restore();
      if (p.y > GROUND_Y + 20) {
        p.y = rand(-60, 0);
        p.x = rand(0, VIEW_W);
      }
    } else {
      const a = kind === "embers" ? 1 - p.life / p.max : 0.5 + 0.5 * Math.sin(now / 300 + p.x);
      ctx.globalAlpha = Math.max(0, a);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      if (p.x > VIEW_W + 10) p.x = -10;
      if (p.x < -10) p.x = VIEW_W + 10;
      if (p.life > p.max) {
        p.life = 0;
        p.x = rand(0, VIEW_W);
        if (kind === "embers") p.y = rand(GROUND_Y - 40, VIEW_H);
      }
    }
  }
}

/** Draw an effect sprite centred at (x, y), or bottom-anchored. */
function drawFx(
  ctx: CanvasRenderingContext2D,
  fx: FxId,
  x: number,
  y: number,
  size: number,
  opts: { rot?: number; flip?: boolean; bottom?: boolean; alpha?: number; additive?: boolean } = {},
) {
  const im = img(fxUrl(fx));
  if (!im.complete || !im.naturalWidth) return false;
  const w = size;
  const h = (size * im.naturalHeight) / im.naturalWidth;
  ctx.save();
  ctx.translate(x, y);
  if (opts.rot) ctx.rotate(opts.rot);
  if (opts.flip) ctx.scale(-1, 1);
  if (opts.alpha !== undefined) ctx.globalAlpha = opts.alpha;
  if (opts.additive) ctx.globalCompositeOperation = "lighter";
  ctx.drawImage(im, -w / 2, opts.bottom ? -h : -h / 2, w, h);
  ctx.restore();
  return true;
}

function spriteBox(f: Fighter, pose: PoseId) {
  const meta = SPRITES[f.char][pose];
  const H = fighterHeight(f);
  let dw: number;
  let dh: number;
  if (meta.wr) {
    dw = H * meta.wr;
    dh = (dw * meta.h) / meta.w;
  } else {
    dh = H * (meta.hr ?? 1);
    dw = (dh * meta.w) / meta.h;
  }
  return { dw, dh, ax: meta.ax };
}

function drawSprite(
  ctx: CanvasRenderingContext2D,
  f: Fighter,
  pose: PoseId,
  x: number,
  y: number,
  facing: 1 | -1,
  opts: { alpha?: number; bob?: number; rot?: number; squash?: number; filter?: string; glow?: string } = {},
) {
  const image = img(spriteUrl(f.char, pose));
  if (!image.complete || !image.naturalWidth) return;
  const { dw, dh, ax } = spriteBox(f, pose);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  if (opts.rot) ctx.rotate(opts.rot);
  const sy = 1 + (opts.bob ?? 0);
  const sx = 1 - (opts.bob ?? 0) * 0.5;
  ctx.scale(sx, sy * (opts.squash ?? 1));
  if (opts.alpha !== undefined) ctx.globalAlpha = opts.alpha;
  if (opts.glow) {
    ctx.shadowColor = opts.glow;
    ctx.shadowBlur = 24;
  }
  if (opts.filter) ctx.filter = opts.filter;
  ctx.drawImage(image, -ax * dw, -dh, dw, dh);
  ctx.restore();
}

function drawFighter(ctx: CanvasRenderingContext2D, s: GameState, rs: RenderState, i: 0 | 1, camX: number, now: number) {
  const f = s.f[i];
  const pose = poseOf(f);
  const x = f.x - camX;
  const y = GROUND_Y - f.y;
  const c = CHARS[f.char];

  // Shadow.
  const sh = Math.max(0.3, 1 - f.y / 300);
  ctx.fillStyle = `rgba(0,0,0,${0.35 * sh})`;
  ctx.beginPath();
  ctx.ellipse(x, GROUND_Y + 2, 58 * c.size * sh, 11 * sh, 0, 0, Math.PI * 2);
  ctx.fill();

  // After-images for rush moves and dashes.
  const m = moveOf(f);
  const trailOn = f.state === "dash" || f.state === "backdash" || (m && (m.dashV || m.isSuper));
  const tr = rs.trails[i];
  if (trailOn) {
    tr.push({ x: f.x, y: f.y, pose, facing: f.facing });
    if (tr.length > 6) tr.shift();
  } else if (tr.length) tr.shift();
  tr.forEach((t, k) => {
    drawSprite(ctx, f, t.pose, t.x - camX, GROUND_Y - t.y, t.facing, {
      alpha: 0.08 + (k / tr.length) * 0.22,
      filter: "brightness(1.6) saturate(2)",
    });
  });

  let bob = 0;
  let rot = 0;
  if (f.state === "idle" || f.state === "win") bob = Math.sin(now / 260 + i * 2) * 0.012;
  if (f.state === "win") bob = Math.abs(Math.sin(now / 180)) * 0.04;
  if (f.state === "walk") {
    bob = Math.abs(Math.sin(now / 110)) * 0.02;
    rot = Math.sin(now / 110) * 0.025;
  }
  if (f.state === "dash") rot = 0.12;
  if (f.state === "backdash") rot = -0.1;
  if (f.state === "hitstun" && f.y > 0) rot = -0.25;

  let filter: string | undefined;
  if (f.flash > 0) filter = "brightness(2.4) saturate(0.4)";
  else if (f.state === "guardbreak") filter = `brightness(${1 + 0.3 * Math.sin(now / 50)})`;
  else if (f.invuln > 0 && f.state === "getup") filter = "brightness(1.3)";

  let glow: string | undefined;
  if (m?.isSuper) glow = c.color;
  else if (f.burn > 0) glow = "#fb923c";
  else if (f.meter >= 100 && s.phase === "fight") glow = `${c.color}aa`;

  const squash = m?.fx === "sweep" ? 0.92 : 1;
  drawSprite(ctx, f, pose, x, y, f.facing, { bob, rot, filter, glow, squash });

  // Low attack swooshes.
  if (m?.fx && f.t >= m.startup - 1 && f.t < m.startup + m.active + 3) {
    const prog = (f.t - m.startup + 1) / (m.active + 4);
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(f.facing, 1);
    ctx.strokeStyle = m.fx === "sweep" ? `${c.color}` : "#fff";
    ctx.globalAlpha = 1 - prog;
    ctx.lineWidth = m.fx === "sweep" ? 10 : 6;
    ctx.lineCap = "round";
    ctx.beginPath();
    if (m.fx === "sweep") ctx.ellipse(30, -14, 120 * c.size, 18, 0, Math.PI * 0.9, Math.PI * 2.05);
    else ctx.arc(70 * c.size, -70 * c.size, 50 * c.size, -0.9, 0.9);
    ctx.stroke();
    ctx.restore();
  }

  // Water vortex around Kai's rush moves.
  if (m && (m.id === "tidalKnee" || m.id === "monsoonRush") && f.t >= m.startup - 2) {
    drawFx(ctx, "water", x + f.facing * 25, y - 115 * c.size, 210 * c.size, {
      rot: (now / 90) * f.facing,
      alpha: 0.9,
      flip: f.facing < 0,
    });
  }

  // Super aura.
  if (m?.isSuper && f.state === "attack") {
    drawFx(ctx, "aura", x, y + 12, 300 * c.size, {
      bottom: true,
      additive: true,
      alpha: 0.55 + 0.25 * Math.sin(now / 60),
    });
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    const g = ctx.createRadialGradient(x, y - 120, 10, x, y - 120, 170);
    g.addColorStop(0, `${c.color}88`);
    g.addColorStop(1, `${c.color}00`);
    ctx.fillStyle = g;
    ctx.fillRect(x - 180, y - 300, 360, 340);
    ctx.restore();
  }
}

function drawProjectile(ctx: CanvasRenderingContext2D, p: Projectile, camX: number, now: number) {
  const cx = p.x - camX;
  const cy = GROUND_Y - p.y - p.h / 2;
  const flip = p.dir < 0;
  const pulse = 1 + 0.06 * Math.sin(now / 45);
  // Painted effect sprites; the procedural shapes below are the fallback.
  if (p.kind === "volt" && drawFx(ctx, "volt", cx - p.dir * 70, cy, 230 * pulse, { flip })) return;
  if (p.kind === "blaze" && drawFx(ctx, "fire", cx - p.dir * 75, cy, 240 * pulse, { flip })) return;
  if (p.kind === "inferno" && drawFx(ctx, "fire", cx - p.dir * 150, cy, 480 * pulse, { flip })) {
    drawFx(ctx, "ko", cx, cy, 200 * pulse, { additive: true, alpha: 0.5, rot: now / 200 });
    return;
  }
  if (p.kind === "quake" && drawFx(ctx, "quake", cx - p.dir * 50, GROUND_Y + 6, 230, { flip, bottom: true })) return;
  if (p.kind === "titan" && drawFx(ctx, "quake", cx - p.dir * 90, GROUND_Y + 8, 440 * pulse, { flip, bottom: true })) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  switch (p.kind) {
    case "volt": {
      const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, 50);
      g.addColorStop(0, "rgba(255,255,255,1)");
      g.addColorStop(0.3, "rgba(34,211,238,0.9)");
      g.addColorStop(1, "rgba(59,130,246,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, 50, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#e0f2fe";
      ctx.lineWidth = 2;
      for (let k = 0; k < 4; k++) {
        ctx.beginPath();
        let lx = cx;
        let ly = cy;
        ctx.moveTo(lx, ly);
        for (let j = 0; j < 5; j++) {
          lx -= p.dir * rand(8, 16);
          ly += rand(-12, 12);
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();
      }
      break;
    }
    case "blaze":
    case "inferno": {
      const r = p.kind === "inferno" ? 95 : 48;
      for (let k = 0; k < 5; k++) {
        const tx = cx - p.dir * k * r * 0.35;
        const g = ctx.createRadialGradient(tx, cy, 2, tx, cy, r * (1 - k * 0.15));
        g.addColorStop(0, `rgba(255,250,220,${0.9 - k * 0.15})`);
        g.addColorStop(0.35, `rgba(251,146,60,${0.8 - k * 0.14})`);
        g.addColorStop(1, "rgba(220,38,38,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(tx, cy + Math.sin(now / 60 + k) * 4, r * (1 - k * 0.15), 0, Math.PI * 2);
        ctx.fill();
      }
      if (p.kind === "inferno") {
        // Phoenix wings.
        ctx.fillStyle = "rgba(250,204,21,0.45)";
        for (const side of [-1, 1]) {
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.quadraticCurveTo(cx - p.dir * 80, cy + side * 140, cx - p.dir * 170, cy + side * 60 + Math.sin(now / 80) * 20);
          ctx.quadraticCurveTo(cx - p.dir * 60, cy + side * 40, cx, cy);
          ctx.fill();
        }
      }
      break;
    }
    case "quake":
    case "titan": {
      const big = p.kind === "titan";
      const hgt = big ? 170 : 60;
      const base = GROUND_Y;
      ctx.fillStyle = big ? "rgba(132,204,22,0.5)" : "rgba(163,230,53,0.55)";
      for (let k = 0; k < 4; k++) {
        const kx = cx - p.dir * k * 26;
        const kh = hgt * (1 - k * 0.2) * (0.85 + 0.15 * Math.sin(now / 40 + k));
        ctx.beginPath();
        ctx.moveTo(kx - 24, base);
        ctx.lineTo(kx - 6, base - kh);
        ctx.lineTo(kx + 10, base - kh * 0.7);
        ctx.lineTo(kx + 26, base);
        ctx.closePath();
        ctx.fill();
      }
      ctx.strokeStyle = "rgba(236,252,203,0.8)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(cx, base, big ? 90 : 50, 10, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case "beam": {
      const x0 = cx;
      const x1 = cx + p.dir * p.w;
      const top = GROUND_Y - p.y - p.h;
      const fade = Math.min(1, p.life / 8);
      const g = ctx.createLinearGradient(0, top, 0, top + p.h);
      g.addColorStop(0, "rgba(59,130,246,0)");
      g.addColorStop(0.5, `rgba(224,242,254,${fade})`);
      g.addColorStop(1, "rgba(59,130,246,0)");
      ctx.fillStyle = g;
      ctx.fillRect(Math.min(x0, x1), top - 10, Math.abs(x1 - x0), p.h + 20);
      ctx.strokeStyle = `rgba(165,243,252,${fade})`;
      ctx.lineWidth = 3;
      for (let k = 0; k < 3; k++) {
        ctx.beginPath();
        let lx = x0;
        ctx.moveTo(lx, top + p.h / 2);
        while (Math.abs(lx - x0) < p.w) {
          lx += p.dir * rand(20, 40);
          ctx.lineTo(lx, top + p.h / 2 + rand(-p.h * 0.6, p.h * 0.6));
        }
        ctx.stroke();
      }
      break;
    }
  }
  ctx.restore();
}

function drawParticles(ctx: CanvasRenderingContext2D, rs: RenderState, camX: number, freeze: boolean) {
  const keep: Particle[] = [];
  for (const p of rs.particles) {
    if (!freeze || p.kind === "text") {
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      if (p.kind === "spark") {
        p.vx *= 0.88;
        p.vy = p.vy * 0.88 + 0.3;
      }
      if (p.kind === "dust") p.size += 0.6;
    }
    const k = p.life / p.max;
    if (k >= 1) continue;
    keep.push(p);
    const x = p.x - camX;
    ctx.save();
    ctx.globalAlpha = 1 - k;
    switch (p.kind) {
      case "spark":
      case "streak":
        ctx.strokeStyle = p.color;
        ctx.lineWidth = p.size;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x, p.y);
        ctx.lineTo(x - p.vx * 1.8, p.y - p.vy * 1.8);
        ctx.stroke();
        break;
      case "dust":
      case "ember":
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "ring":
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 4 * (1 - k) + 1;
        ctx.beginPath();
        ctx.arc(x, p.y, p.size * (0.3 + k), 0, Math.PI * 2);
        ctx.stroke();
        break;
      case "sprite": {
        const sc = (p.s0 ?? 0.5) + ((p.s1 ?? 1) - (p.s0 ?? 0.5)) * Math.sqrt(k);
        ctx.restore();
        drawFx(ctx, p.fx ?? "hit", x, p.y, p.size * sc, {
          rot: p.rot,
          flip: p.flip,
          bottom: p.bottom,
          alpha: 1 - k * k,
        });
        ctx.save();
        break;
      }
      case "text":
        ctx.font = `${p.size}px ${FONT}`;
        ctx.textAlign = "center";
        ctx.lineWidth = 6;
        ctx.strokeStyle = "rgba(0,0,0,0.85)";
        ctx.strokeText(p.text ?? "", x, p.y);
        ctx.fillStyle = p.color;
        ctx.fillText(p.text ?? "", x, p.y);
        break;
      default:
        break;
    }
    ctx.restore();
  }
  rs.particles = keep.length > 400 ? keep.slice(-400) : keep;
}

function parallelogram(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, skew: number) {
  ctx.beginPath();
  ctx.moveTo(x + skew, y);
  ctx.lineTo(x + w + skew, y);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.closePath();
}

function drawBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  frac: number,
  lag: number,
  colors: [string, string],
  mirror: boolean,
) {
  const skew = mirror ? -10 : 10;
  ctx.save();
  parallelogram(ctx, x, y, w, h, skew);
  ctx.fillStyle = "rgba(10,10,20,0.75)";
  ctx.fill();
  ctx.clip();
  const fill = (fr: number, style: string | CanvasGradient) => {
    const fw = w * Math.max(0, Math.min(1, fr));
    ctx.fillStyle = style;
    if (mirror) ctx.fillRect(x + w - fw - 12, y, fw + 24, h);
    else ctx.fillRect(x - 12, y, fw + 24, h);
  };
  fill(lag, "#dc2626");
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, colors[0]);
  g.addColorStop(1, colors[1]);
  fill(frac, g);
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.fillRect(x - 12, y, w + 24, h * 0.35);
  ctx.restore();
  ctx.save();
  parallelogram(ctx, x, y, w, h, skew);
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

function drawHud(ctx: CanvasRenderingContext2D, s: GameState, rs: RenderState, now: number) {
  const barW = 370;
  const barY = 24;
  for (const i of [0, 1] as const) {
    const f = s.f[i];
    const c = CHARS[f.char];
    const frac = f.hp / f.maxHp;
    rs.shownHp[i] += (frac - rs.shownHp[i]) * (rs.shownHp[i] > frac ? 0.04 : 0.3);
    if (rs.shownHp[i] < frac) rs.shownHp[i] = frac;
    const mirror = i === 1;
    const x = mirror ? VIEW_W - 30 - barW : 30;
    const low = frac < 0.25;
    drawBar(
      ctx,
      x,
      barY,
      barW,
      24,
      frac,
      rs.shownHp[i],
      low ? ["#fde047", "#f97316"] : ["#fef08a", "#eab308"],
      mirror,
    );
    // Guard bar.
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    const gx = mirror ? VIEW_W - 30 - 200 : 30;
    ctx.fillRect(gx, barY + 30, 200, 5);
    ctx.fillStyle = f.guard < 30 ? "#f87171" : "#93c5fd";
    const gw = 200 * (f.guard / 100);
    ctx.fillRect(mirror ? gx + 200 - gw : gx, barY + 30, gw, 5);

    // Name + label.
    ctx.font = `20px ${FONT}`;
    ctx.textAlign = mirror ? "right" : "left";
    ctx.lineWidth = 5;
    ctx.strokeStyle = "rgba(0,0,0,0.8)";
    const nx = mirror ? VIEW_W - 32 : 32;
    ctx.strokeText(c.name, nx, barY + 60);
    ctx.fillStyle = "#fff";
    ctx.fillText(c.name, nx, barY + 60);
    const lw = ctx.measureText(c.name).width;
    const lx = mirror ? nx - lw - 10 : nx + lw + 10;
    ctx.font = `12px ${FONT}`;
    ctx.fillStyle = c.color;
    ctx.strokeText(rs.labels[i], lx, barY + 58);
    ctx.fillText(rs.labels[i], lx, barY + 58);

    // Round pips.
    for (let k = 0; k < 2; k++) {
      const px = mirror ? VIEW_W / 2 + 62 + k * 22 : VIEW_W / 2 - 62 - k * 22;
      ctx.beginPath();
      ctx.arc(px, barY + 48, 7, 0, Math.PI * 2);
      ctx.fillStyle = k < f.wins ? "#facc15" : "rgba(0,0,0,0.6)";
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Super meter.
    const mw = 230;
    const mx = mirror ? VIEW_W - 30 - mw : 30;
    const my = VIEW_H - 34;
    const full = f.meter >= 100;
    drawBar(
      ctx,
      mx,
      my,
      mw,
      14,
      f.meter / 100,
      f.meter / 100,
      full ? [c.color2, c.color] : ["#60a5fa", "#2563eb"],
      mirror,
    );
    ctx.font = `13px ${FONT}`;
    ctx.textAlign = mirror ? "right" : "left";
    const tx = mirror ? mx - 8 : mx + mw + 22;
    ctx.textAlign = mirror ? "right" : "left";
    ctx.lineWidth = 4;
    const label = full ? "SUPER ↓+S" : `${Math.floor(f.meter)}%`;
    ctx.strokeText(label, tx, my + 12);
    ctx.fillStyle = full ? (Math.floor(now / 200) % 2 ? "#fff" : c.color2) : "#e5e7eb";
    ctx.fillText(label, tx, my + 12);

    // Combo counter.
    const cs = rs.comboShow[i];
    if (cs.t > 0 && cs.n >= 2) {
      const cx = mirror ? VIEW_W - 40 : 40;
      ctx.globalAlpha = Math.min(1, cs.t / 20);
      ctx.textAlign = mirror ? "right" : "left";
      ctx.font = `44px ${FONT}`;
      ctx.lineWidth = 7;
      ctx.strokeText(`${cs.n}`, cx, 190);
      ctx.fillStyle = c.color2;
      ctx.fillText(`${cs.n}`, cx, 190);
      ctx.font = `18px ${FONT}`;
      ctx.strokeText("HITS", cx, 214);
      ctx.fillStyle = "#fff";
      ctx.fillText("HITS", cx, 214);
      ctx.font = `13px ${FONT}`;
      ctx.strokeText(`${cs.dmg} DMG`, cx, 234);
      ctx.fillStyle = "#fca5a5";
      ctx.fillText(`${cs.dmg} DMG`, cx, 234);
      ctx.globalAlpha = 1;
    }
  }

  // Timer.
  ctx.save();
  ctx.fillStyle = "rgba(10,10,20,0.8)";
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(VIEW_W / 2 - 34, 14, 68, 50, 8);
  ctx.fill();
  ctx.stroke();
  ctx.font = `34px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillStyle = s.timer <= 10 ? "#f87171" : "#fff";
  ctx.fillText(String(Math.max(0, s.timer)).padStart(2, "0"), VIEW_W / 2, 54);
  ctx.restore();
}

function drawAnnounce(ctx: CanvasRenderingContext2D, s: GameState) {
  const a = s.announce;
  if (!a) return;
  const t = a.t;
  const pop = Math.min(1, t / 8);
  const scale = 1.6 - 0.6 * pop;
  ctx.save();
  ctx.translate(VIEW_W / 2, VIEW_H / 2 - 30);
  ctx.scale(scale, scale);
  ctx.globalAlpha = pop;
  ctx.textAlign = "center";
  ctx.font = `76px ${FONT}`;
  ctx.lineWidth = 12;
  ctx.strokeStyle = "rgba(0,0,0,0.9)";
  ctx.strokeText(a.text, 0, 0);
  const g = ctx.createLinearGradient(0, -60, 0, 10);
  g.addColorStop(0, "#fff7ad");
  g.addColorStop(1, a.text === "K.O." ? "#ef4444" : "#f59e0b");
  ctx.fillStyle = g;
  ctx.fillText(a.text, 0, 0);
  if (a.sub) {
    ctx.font = `34px ${FONT}`;
    ctx.lineWidth = 8;
    ctx.strokeText(a.sub, 0, 56);
    ctx.fillStyle = "#38bdf8";
    ctx.fillText(a.sub, 0, 56);
  }
  ctx.restore();
}

function drawSuperFlash(ctx: CanvasRenderingContext2D, s: GameState, rs: RenderState, camX: number) {
  if (s.freeze <= 0) return;
  const k = s.freeze / 46;
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${0.55 * Math.min(1, (1 - k) * 4)})`;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  const f = s.f[rs.superOwner];
  const x = f.x - camX;
  const y = GROUND_Y - f.y - 130;
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(x, y, 5, x, y, 260);
  g.addColorStop(0, `${rs.superColor}cc`);
  g.addColorStop(1, `${rs.superColor}00`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.globalCompositeOperation = "source-over";
  // Redraw the super user on top of the darkening.
  drawSprite(ctx, f, poseOf(f), x, GROUND_Y - f.y, f.facing, { glow: rs.superColor });
  // Banner.
  const slide = Math.min(1, (1 - k) * 5);
  const by = VIEW_H / 2 + 60;
  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.fillRect(0, by - 38, VIEW_W, 64);
  ctx.fillStyle = rs.superColor;
  ctx.fillRect(0, by - 38, VIEW_W, 4);
  ctx.fillRect(0, by + 22, VIEW_W, 4);
  ctx.font = `46px ${FONT}`;
  ctx.textAlign = "center";
  ctx.fillStyle = "#fff";
  const off = (1 - slide) * (rs.superOwner === 0 ? -VIEW_W : VIEW_W);
  ctx.fillText(rs.superName, VIEW_W / 2 + off, by + 10);
  ctx.restore();
}

export function render(ctx: CanvasRenderingContext2D, s: GameState, rs: RenderState, now: number) {
  const [a, b] = s.f;
  const mid = (a.x + b.x) / 2;
  const target = Math.max(0, Math.min(ARENA_W - VIEW_W, mid - VIEW_W / 2));
  rs.camX += (target - rs.camX) * 0.2;
  const shakeX = s.shake ? rand(-s.shake, s.shake) : 0;
  const shakeY = s.shake ? rand(-s.shake, s.shake) * 0.6 : 0;
  const camX = rs.camX;

  ctx.save();
  ctx.translate(shakeX, shakeY);
  drawStage(ctx, s, rs, camX, now);

  // Draw the attacking fighter on top.
  const order: (0 | 1)[] = s.f[0].state === "attack" && s.f[1].state !== "attack" ? [1, 0] : [0, 1];
  for (const i of order) drawFighter(ctx, s, rs, i, camX, now);
  for (const p of s.proj) drawProjectile(ctx, p, camX, now);
  drawParticles(ctx, rs, camX, s.hitstop > 0);
  ctx.restore();

  drawSuperFlash(ctx, s, rs, camX);
  drawHud(ctx, s, rs, now);
  drawAnnounce(ctx, s);

  if (rs.flashT > 0) {
    ctx.fillStyle = rs.flashColor;
    ctx.globalAlpha = rs.flashT / 14;
    ctx.fillRect(0, 0, VIEW_W, VIEW_H);
    ctx.globalAlpha = 1;
    rs.flashT--;
  }
  if (rs.superT > 0) rs.superT--;
}

export const stageTint = (s: StageId) => STAGES[s].tint;
