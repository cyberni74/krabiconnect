import {
  BASE_H,
  CHARS,
  COMMON_MOVES,
  type Box,
  type CharId,
  type Guard,
  type MoveDef,
  type PoseId,
  type ProjDef,
  type ProjKind,
  type StageId,
} from "./data";

// ── input bits ──────────────────────────────────────────────────────────────
export const IN = {
  L: 1,
  R: 2,
  U: 4,
  D: 8,
  P: 16,
  K: 32,
  S: 64,
} as const;

// ── world constants ─────────────────────────────────────────────────────────
export const ARENA_W = 1320;
export const VIEW_W = 960;
export const VIEW_H = 540;
export const GROUND_Y = 488;
const GRAVITY = 0.95;
const JUMP_V = 18;
const MAX_SEPARATION = VIEW_W - 120;
const ROUND_TIME = 99;
const WINS_NEEDED = 2;
const MAX_ROUNDS = 5;
const PARRY_WINDOW = 6;
const THROW_RANGE = 115;
const THROW_TECH_WINDOW = 8;
const MAX_METER = 100;

export type FState =
  | "idle"
  | "walk"
  | "crouch"
  | "jump"
  | "land"
  | "dash"
  | "backdash"
  | "attack"
  | "hitstun"
  | "blockstun"
  | "guardbreak"
  | "down"
  | "getup"
  | "ko"
  | "win";

export interface Fighter {
  char: CharId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1;
  hp: number;
  maxHp: number;
  meter: number;
  guard: number;
  state: FState;
  t: number;
  move: string | null;
  moveHit: boolean;
  lastRehit: number;
  armorUsed: boolean;
  airMoveUsed: boolean;
  doubleJumpUsed: boolean;
  crouching: boolean;
  /** Holding back while threatened (proximity guard pose). */
  guarding: boolean;
  /** Air hits taken in the current juggle. */
  juggle: number;
  stunLen: number;
  invuln: number;
  combo: number;
  comboDmg: number;
  burn: number;
  flash: number;
  /** Frames the back direction has been held (parry timing). */
  backHeld: number;
  /** Frames since punch+kick were pressed together (throw tech). */
  techAge: number;
  prev: number;
  /** Buttons pressed recently but not yet consumed (input buffer). */
  buf: number;
  bufAge: number;
  /** Last frames of direction input for motion commands (newest last). */
  dirHist: number[];
  /** Frame numbers of the last two forward/back taps for dashing. */
  lastFwdTap: number;
  lastBackTap: number;
  wins: number;
}

export interface Projectile {
  id: number;
  owner: 0 | 1;
  kind: ProjKind;
  x: number;
  y: number;
  vx: number;
  w: number;
  h: number;
  dir: 1 | -1;
  life: number;
  age: number;
  hitsLeft: number;
  lastHit: number;
  def: ProjDef;
  burn: boolean;
}

export type GameEventType =
  | "hit"
  | "heavyHit"
  | "block"
  | "parry"
  | "armor"
  | "throw"
  | "tech"
  | "whiff"
  | "jump"
  | "land"
  | "dash"
  | "special"
  | "super"
  | "projClash"
  | "guardBreak"
  | "ko"
  | "round"
  | "fight"
  | "burn";

export interface GameEvent {
  type: GameEventType;
  x: number;
  y: number;
  who: 0 | 1;
  power?: number;
  text?: string;
  color?: string;
}

export type Phase = "intro" | "fight" | "ko" | "matchEnd";

export interface GameState {
  frame: number;
  phase: Phase;
  phaseT: number;
  round: number;
  timer: number;
  stage: StageId;
  f: [Fighter, Fighter];
  proj: Projectile[];
  nextProjId: number;
  hitstop: number;
  freeze: number;
  freezeOwner: 0 | 1 | -1;
  shake: number;
  announce: { text: string; sub?: string; t: number; color?: string } | null;
  roundWinner: 0 | 1 | -1 | null;
  matchWinner: 0 | 1 | -1 | null;
  /** Events produced by the last step (renderer / audio consume them). */
  events: GameEvent[];
}

function makeFighter(char: CharId, x: number, facing: 1 | -1): Fighter {
  const c = CHARS[char];
  return {
    char,
    x,
    y: 0,
    vx: 0,
    vy: 0,
    facing,
    hp: c.hp,
    maxHp: c.hp,
    meter: 0,
    guard: 100,
    state: "idle",
    t: 0,
    move: null,
    moveHit: false,
    lastRehit: -99,
    armorUsed: false,
    airMoveUsed: false,
    doubleJumpUsed: false,
    crouching: false,
    guarding: false,
    juggle: 0,
    stunLen: 0,
    invuln: 0,
    combo: 0,
    comboDmg: 0,
    burn: 0,
    flash: 0,
    backHeld: 99,
    techAge: 99,
    prev: 0,
    buf: 0,
    bufAge: 0,
    dirHist: [],
    lastFwdTap: -99,
    lastBackTap: -99,
    wins: 0,
  };
}

export function createGame(p1: CharId, p2: CharId, stage: StageId): GameState {
  const s: GameState = {
    frame: 0,
    phase: "intro",
    phaseT: 0,
    round: 1,
    timer: ROUND_TIME,
    stage,
    f: [makeFighter(p1, ARENA_W / 2 - 200, 1), makeFighter(p2, ARENA_W / 2 + 200, -1)],
    proj: [],
    nextProjId: 1,
    hitstop: 0,
    freeze: 0,
    freezeOwner: -1,
    shake: 0,
    announce: null,
    roundWinner: null,
    matchWinner: null,
    events: [],
  };
  startRound(s);
  return s;
}

function startRound(s: GameState) {
  const [a, b] = s.f;
  for (const [i, f] of [a, b].entries()) {
    const keepMeter = f.meter;
    const wins = f.wins;
    Object.assign(f, makeFighter(f.char, ARENA_W / 2 + (i === 0 ? -200 : 200), i === 0 ? 1 : -1));
    f.meter = Math.min(MAX_METER, keepMeter);
    f.wins = wins;
  }
  s.proj = [];
  s.timer = ROUND_TIME;
  s.phase = "intro";
  s.phaseT = 0;
  s.roundWinner = null;
  const last = a.wins === WINS_NEEDED - 1 && b.wins === WINS_NEEDED - 1;
  s.announce = { text: last ? "FINALE RUNDE" : `RUNDE ${s.round}`, t: 0 };
  s.events.push({ type: "round", x: ARENA_W / 2, y: 200, who: 0, text: s.announce.text });
}

// ── helpers ─────────────────────────────────────────────────────────────────

const MOVE_BY_ID: Record<string, MoveDef> = Object.fromEntries(
  Object.values(COMMON_MOVES).map((m) => [m.id, m]),
);

export function moveOf(f: Fighter): MoveDef | null {
  if (!f.move) return null;
  const c = CHARS[f.char];
  if (f.move === c.special.id) return c.special;
  if (f.move === c.superMove.id) return c.superMove;
  return MOVE_BY_ID[f.move] ?? null;
}

const heightOf = (f: Fighter) => BASE_H * CHARS[f.char].size;
const halfWidth = (f: Fighter) => 52 * CHARS[f.char].size;

interface Rect {
  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

function hurtbox(f: Fighter): Rect | null {
  if (f.state === "ko" || f.state === "down" || f.state === "getup" || f.invuln > 0) return null;
  if (f.state === "backdash" && f.t < 8) return null;
  if (f.y > 0 && f.state === "hitstun" && f.juggle >= 3) return null;
  const hw = halfWidth(f);
  let h = heightOf(f);
  if (f.crouching || f.state === "crouch") h *= 0.66;
  if (f.y > 0) h *= 0.85;
  const r: Rect = { x0: f.x - hw, x1: f.x + hw, y0: f.y, y1: f.y + h };
  // Extended limbs are vulnerable during active + recovery frames (whiff punish).
  const m = moveOf(f);
  if (m && !m.proj && m.hb.w > 0 && f.t >= m.startup) {
    const lim = boxRect(f, m.hb, 0.6);
    r.x0 = Math.min(r.x0, lim.x0);
    r.x1 = Math.max(r.x1, lim.x1);
  }
  return r;
}

function boxRect(f: Fighter, b: Box, scale = 1): Rect {
  const sz = CHARS[f.char].size;
  const w = b.w * sz * scale;
  const xNear = f.x + f.facing * b.x * sz;
  const xFar = xNear + f.facing * w;
  return {
    x0: Math.min(xNear, xFar),
    x1: Math.max(xNear, xFar),
    y0: f.y + b.y * sz,
    y1: f.y + (b.y + b.h) * sz,
  };
}

const overlap = (a: Rect, b: Rect) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

function actionable(f: Fighter) {
  return f.state === "idle" || f.state === "walk" || f.state === "crouch";
}

function setState(f: Fighter, st: FState) {
  f.state = st;
  f.t = 0;
  if (st !== "attack") {
    f.move = null;
    f.moveHit = false;
  }
}

function startMove(s: GameState, i: 0 | 1, m: MoveDef) {
  const f = s.f[i];
  f.buf = 0;
  f.state = "attack";
  f.t = 0;
  f.move = m.id;
  f.moveHit = false;
  f.lastRehit = -99;
  f.armorUsed = false;
  if (!m.air) f.vx = 0;
  if (m.isSpecial) s.events.push({ type: "special", x: f.x, y: f.y + 140, who: i, text: m.name });
  else s.events.push({ type: "whiff", x: f.x, y: f.y + 140, who: i, power: m.dmg });
}

function addMeter(f: Fighter, n: number) {
  f.meter = Math.min(MAX_METER, f.meter + n);
}

// ── motion input (↓ ↘ → + P or S) ────────────────────────────────────────────
function dirCode(bits: number, facing: 1 | -1): number {
  const fwd = facing === 1 ? IN.R : IN.L;
  const back = facing === 1 ? IN.L : IN.R;
  const f = bits & fwd ? 1 : 0;
  const b = bits & back ? 1 : 0;
  const d = bits & IN.D ? 1 : 0;
  if (d && f) return 3; // down-forward
  if (d && !b) return 2; // down
  if (f && !d) return 6; // forward
  return 0;
}

function hasQcf(f: Fighter): boolean {
  // Find 2 → 3 → 6 in order within the recent history.
  const h = f.dirHist;
  let stage = 0;
  for (const d of h) {
    if (stage === 0 && d === 2) stage = 1;
    else if (stage === 1 && d === 3) stage = 2;
    else if (stage === 2 && d === 6) return true;
  }
  return false;
}

// ── per-fighter input → action ───────────────────────────────────────────────
function handleInput(s: GameState, i: 0 | 1, input: number) {
  const f = s.f[i];
  const o = s.f[i === 0 ? 1 : 0];
  const c = CHARS[f.char];
  const raw = input & ~f.prev;
  if (raw & (IN.P | IN.K | IN.S)) {
    f.buf |= raw & (IN.P | IN.K | IN.S);
    f.bufAge = 0;
  } else if (++f.bufAge > 7) f.buf = 0;
  const pressed = raw | f.buf;
  const fwdBit = f.facing === 1 ? IN.R : IN.L;
  const backBit = f.facing === 1 ? IN.L : IN.R;

  f.backHeld = input & backBit ? f.backHeld + 1 : 0;
  if (pressed & (IN.P | IN.K) && input & IN.P && input & IN.K) f.techAge = 0;
  else f.techAge++;

  f.dirHist.push(dirCode(input, f.facing));
  if (f.dirHist.length > 16) f.dirHist.shift();

  if (s.phase !== "fight") return;

  // Cancels: a connected cancellable normal can chain into a special / super / heavy.
  const m = moveOf(f);
  const canCancel =
    f.state === "attack" && m?.cancel && f.moveHit && f.t >= m.startup && f.t < m.startup + m.active + 8;

  const grounded = f.y <= 0;
  const wantsSpecial = pressed & IN.S || (pressed & IN.P && hasQcf(f));
  const free = actionable(f) || f.state === "land";

  if ((free || canCancel) && grounded && wantsSpecial) {
    if (input & IN.D && f.meter >= MAX_METER) {
      f.meter = 0;
      startMove(s, i, c.superMove);
      f.invuln = c.superMove.invuln ?? 0;
      s.freeze = 46;
      s.freezeOwner = i;
      s.events.push({
        type: "super",
        x: f.x,
        y: f.y + 150,
        who: i,
        text: c.superMove.name,
        color: c.color,
      });
      f.dirHist = [];
      return;
    }
    const sp = c.special;
    if (sp.proj && s.proj.some((p) => p.owner === i && !p.def.attached)) {
      // One projectile per player on screen.
    } else {
      startMove(s, i, sp);
      if (sp.invuln) f.invuln = sp.invuln;
      f.dirHist = [];
      return;
    }
  }

  if (canCancel && pressed & IN.K) {
    startMove(s, i, COMMON_MOVES.heavy);
    return;
  }

  if (!grounded) {
    if ((f.state === "jump" || f.state === "idle") && !f.airMoveUsed) {
      if (pressed & IN.K) {
        f.airMoveUsed = true;
        startMove(s, i, COMMON_MOVES.airKick);
        return;
      }
      if (pressed & IN.P) {
        f.airMoveUsed = true;
        startMove(s, i, COMMON_MOVES.airPunch);
        return;
      }
    }
    if (f.state === "jump" && f.char === "streamer" && !f.doubleJumpUsed && pressed & IN.U) {
      f.doubleJumpUsed = true;
      f.vy = JUMP_V * 0.85;
      f.vx = input & IN.R ? 4.5 : input & IN.L ? -4.5 : f.vx * 0.5;
      s.events.push({ type: "jump", x: f.x, y: f.y, who: i });
    }
    return;
  }

  if (!free) {
    f.guarding = false;
    return;
  }

  // Throw: P+K close to a grounded opponent.
  const bothNow = input & IN.P && input & IN.K && pressed & (IN.P | IN.K);
  if (bothNow && Math.abs(o.x - f.x) < THROW_RANGE * CHARS[f.char].size && o.y <= 0) {
    startMove(s, i, COMMON_MOVES.throwMove);
    return;
  }

  if (pressed & IN.P) {
    if (input & IN.D) startMove(s, i, COMMON_MOVES.lowPunch);
    else if (input & fwdBit) {
      startMove(s, i, COMMON_MOVES.upper);
      f.invuln = COMMON_MOVES.upper.invuln ?? 0;
    } else startMove(s, i, COMMON_MOVES.jab);
    return;
  }
  if (pressed & IN.K) {
    if (input & IN.D) startMove(s, i, COMMON_MOVES.sweep);
    else startMove(s, i, COMMON_MOVES.heavy);
    return;
  }

  if (pressed & IN.U || (input & IN.U && f.state !== "land")) {
    setState(f, "jump");
    f.vy = JUMP_V * c.jump;
    const dir = input & IN.R ? 1 : input & IN.L ? -1 : 0;
    f.vx = dir * 4.8 * c.speed;
    f.airMoveUsed = false;
    f.doubleJumpUsed = false;
    s.events.push({ type: "jump", x: f.x, y: 0, who: i });
    return;
  }

  // Dash on double tap.
  if (pressed & fwdBit) {
    if (s.frame - f.lastFwdTap < 14) {
      setState(f, "dash");
      f.lastFwdTap = -99;
      s.events.push({ type: "dash", x: f.x, y: 0, who: i });
      return;
    }
    f.lastFwdTap = s.frame;
  }
  if (pressed & backBit) {
    if (s.frame - f.lastBackTap < 14) {
      setState(f, "backdash");
      f.lastBackTap = -99;
      s.events.push({ type: "dash", x: f.x, y: 0, who: i });
      return;
    }
    f.lastBackTap = s.frame;
  }

  f.guarding = false;
  if (input & IN.D) {
    if (f.state !== "crouch") setState(f, "crouch");
    f.crouching = true;
    f.vx = 0;
    return;
  }
  f.crouching = false;

  const threatened =
    o.state === "attack" && Math.abs(o.x - f.x) < 330
      ? true
      : s.proj.some((p) => p.owner !== i && Math.abs(p.x - f.x) < 380);
  f.guarding = (input & backBit) !== 0 && threatened;
  if (f.guarding) {
    if (f.state !== "idle") setState(f, "idle");
    f.vx = 0;
    return;
  }

  const dir = input & IN.R ? 1 : input & IN.L ? -1 : 0;
  if (dir !== 0) {
    if (f.state !== "walk") setState(f, "walk");
    const forward = dir === f.facing;
    f.vx = dir * (forward ? 4.4 : 3.3) * c.speed;
  } else {
    if (f.state !== "idle") setState(f, "idle");
    f.vx = 0;
  }
}

// ── hit resolution ──────────────────────────────────────────────────────────
interface HitSpec {
  dmg: number;
  hitstun: number;
  blockstun: number;
  guard: Guard;
  push: number;
  kd?: boolean;
  launch?: number;
  chip: boolean;
  isThrow?: boolean;
  burn?: boolean;
  meter: number;
  heavy: boolean;
}

function canBlock(d: Fighter, input: number, attackerX: number) {
  if (d.y > 0) return false;
  if (!(actionable(d) || d.state === "blockstun")) return false;
  const away = attackerX > d.x ? IN.L : IN.R;
  return (input & away) !== 0;
}

function resolveHit(
  s: GameState,
  ai: 0 | 1,
  di: 0 | 1,
  spec: HitSpec,
  hx: number,
  hy: number,
  defInput: number,
) {
  const a = s.f[ai];
  const d = s.f[di];
  const dir: 1 | -1 = d.x >= a.x ? 1 : -1;

  if (spec.isThrow) {
    if (d.techAge <= THROW_TECH_WINDOW) {
      a.vx = -dir * 9;
      d.vx = dir * 9;
      setState(a, "blockstun");
      a.stunLen = 14;
      setState(d, "blockstun");
      d.stunLen = 14;
      s.events.push({ type: "tech", x: hx, y: hy, who: di, text: "TECH!" });
      return;
    }
    applyDamage(s, ai, di, spec.dmg, false);
    s.events.push({ type: "throw", x: hx, y: hy, who: ai, text: "WURF!" });
    // Toss over: the defender lands behind the thrower.
    d.x = Math.max(60, Math.min(ARENA_W - 60, a.x - a.facing * 110));
    d.vx = -a.facing * 5;
    d.vy = 10;
    d.y = 1;
    setState(d, "hitstun");
    d.stunLen = 60;
    s.shake = 12;
    s.hitstop = 10;
    return;
  }

  const blocking = canBlock(d, defInput, a.x);
  const crouchBlock = blocking && (defInput & IN.D) !== 0;
  const blockOk =
    blocking &&
    (spec.guard === "mid" ||
      (spec.guard === "low" && crouchBlock) ||
      (spec.guard === "high" && !crouchBlock));

  // Super armor (Brutus).
  const dm = moveOf(d);
  const armored =
    d.state === "attack" &&
    dm &&
    !d.armorUsed &&
    d.t < dm.startup + dm.active &&
    (dm.armor || (d.char === "gymbro" && dm.id === "heavy"));
  if (!blockOk && armored && !spec.kd) {
    d.armorUsed = true;
    d.hp -= spec.dmg * 0.5;
    d.flash = 6;
    s.hitstop = 6;
    s.events.push({ type: "armor", x: hx, y: hy, who: di, text: "ARMOR" });
    checkKo(s, di, ai);
    return;
  }

  if (blockOk) {
    if (d.backHeld > 0 && d.backHeld <= PARRY_WINDOW) {
      // Parry: no damage, defender acts immediately, attacker loses time.
      setState(d, "idle");
      addMeter(d, 12);
      a.t = Math.max(0, a.t - 6);
      a.vx = 0;
      s.hitstop = 12;
      d.flash = 8;
      s.events.push({ type: "parry", x: hx, y: hy, who: di, text: "PARRY!" });
      return;
    }
    setState(d, "blockstun");
    d.stunLen = spec.blockstun;
    d.crouching = crouchBlock;
    d.vx = dir * spec.push * 0.8;
    d.guard -= spec.dmg * 0.4 + 4;
    addMeter(d, spec.dmg * 0.06);
    addMeter(a, spec.meter * 0.4);
    if (spec.chip) d.hp -= spec.dmg * 0.15;
    s.hitstop = 5;
    s.events.push({ type: "block", x: hx, y: hy, who: di });
    if (d.guard <= 0) {
      d.guard = 100;
      setState(d, "guardbreak");
      d.stunLen = 70;
      s.shake = 10;
      s.events.push({ type: "guardBreak", x: d.x, y: d.y + 180, who: di, text: "GUARD BREAK!" });
    }
    checkKo(s, di, ai);
    return;
  }

  // Clean hit.
  const inCombo = d.state === "hitstun" || d.state === "guardbreak" || (d.y > 0 && d.state !== "jump");
  a.combo = inCombo ? a.combo + 1 : 1;
  if (!inCombo) a.comboDmg = 0;
  const scale = Math.max(0.35, 1 - 0.1 * (a.combo - 1));
  const counter = d.state === "attack" && !!dm && d.t < dm.startup;
  const dmg = spec.dmg * CHARS[a.char].power * scale * (counter ? 1.2 : 1);
  applyDamage(s, ai, di, dmg, counter);
  a.comboDmg += dmg;
  addMeter(a, spec.meter * (a.char === "king" && a.combo > 1 ? 1.5 : 1));
  if (spec.burn) d.burn = 100;

  const airborne = d.y > 0;
  if (airborne) d.juggle++;
  setState(d, "hitstun");
  d.crouching = false;
  d.stunLen = spec.hitstun + (counter ? 6 : 0);
  d.vx = dir * spec.push;
  if (spec.launch) {
    d.vy = spec.launch;
    d.y = Math.max(d.y, 1);
  } else if (spec.kd || airborne) {
    d.vy = Math.max(d.vy, spec.kd ? 9 : 7);
    d.y = Math.max(d.y, 1);
    d.vx = dir * Math.max(spec.push, 5);
  }
  s.hitstop = spec.heavy ? 9 : 6;
  if (spec.heavy) s.shake = Math.max(s.shake, 7);
  s.events.push({
    type: spec.heavy ? "heavyHit" : "hit",
    x: hx,
    y: hy,
    who: ai,
    power: dmg,
    text: counter ? "KONTER!" : undefined,
  });
  checkKo(s, di, ai);
}

function applyDamage(s: GameState, ai: 0 | 1, di: 0 | 1, dmg: number, _counter: boolean) {
  const d = s.f[di];
  d.hp -= dmg;
  d.flash = 5;
  addMeter(d, dmg * 0.07);
  void ai;
  void s;
}

function checkKo(s: GameState, di: 0 | 1, ai: 0 | 1) {
  const d = s.f[di];
  if (d.hp > 0 || s.phase !== "fight") return;
  d.hp = 0;
  setState(d, "ko");
  d.vy = 11;
  d.y = Math.max(1, d.y);
  d.vx = (d.x >= s.f[ai].x ? 1 : -1) * 7;
  endRound(s, ai);
  s.events.push({ type: "ko", x: d.x, y: d.y + 150, who: ai, text: "K.O.!" });
}

function endRound(s: GameState, winner: 0 | 1 | -1) {
  s.phase = "ko";
  s.phaseT = 0;
  s.roundWinner = winner;
  if (winner !== -1) s.f[winner].wins++;
  const perfect = winner !== -1 && s.f[winner].hp >= s.f[winner].maxHp;
  s.announce =
    winner === -1
      ? { text: "UNENTSCHIEDEN", t: 0 }
      : { text: s.timer <= 0 ? "ZEIT UM" : "K.O.", sub: perfect ? "PERFECT!" : undefined, t: 0 };
}

// ── per-frame simulation ────────────────────────────────────────────────────
function physics(s: GameState, i: 0 | 1) {
  const f = s.f[i];
  const c = CHARS[f.char];
  const m = moveOf(f);

  if (f.state === "dash") {
    f.vx = f.facing * 10 * c.speed * (f.t < 10 ? 1 : 0.4);
    if (f.t > 14) setState(f, "idle");
  } else if (f.state === "backdash") {
    f.vx = -f.facing * 8.5 * c.speed * (f.t < 10 ? 1 : 0.4);
    if (f.t > 16) setState(f, "idle");
  }

  if (f.state === "attack" && m) {
    const total = m.startup + m.active + m.recovery;
    if (m.dashV && f.t >= m.startup && f.t < m.startup + m.active) f.vx = f.facing * m.dashV;
    else if (m.dashV && f.t >= m.startup + m.active) f.vx *= 0.75;
    if (m.proj && f.t === m.startup) spawnProj(s, i, m.proj, !!m.isSpecial || !!m.isSuper);
    if (f.t >= total && f.y <= 0) {
      setState(f, "idle");
      f.vx = 0;
    }
  }

  if (f.y > 0 || f.vy !== 0) {
    f.vy -= GRAVITY;
    f.y += f.vy;
    if (f.y <= 0) {
      f.y = 0;
      f.vy = 0;
      if (f.state === "ko") {
        f.vx = 0;
      } else if (f.state === "hitstun" || f.state === "guardbreak") {
        setState(f, "down");
        f.juggle = 0;
        f.vx = 0;
        s.events.push({ type: "land", x: f.x, y: 0, who: i, power: 2 });
      } else if (f.state === "jump" || (f.state === "attack" && m?.air)) {
        setState(f, "land");
        f.vx = 0;
        s.events.push({ type: "land", x: f.x, y: 0, who: i, power: 1 });
      }
    }
  }

  if (f.y <= 0 && (f.state === "hitstun" || f.state === "blockstun" || f.state === "guardbreak")) {
    f.vx *= 0.82;
  }
  if (f.state === "ko" && f.y <= 0) f.vx *= 0.85;

  f.x += f.vx;

  // State timers.
  if (f.state === "land" && f.t >= 4) setState(f, "idle");
  if ((f.state === "hitstun" || f.state === "blockstun" || f.state === "guardbreak") && f.y <= 0 && f.t >= f.stunLen) {
    setState(f, "idle");
  }
  if (f.state === "down" && f.t >= 46) {
    setState(f, "getup");
    f.invuln = 18;
  }
  if (f.state === "getup" && f.t >= 16) setState(f, "idle");

  if (f.state !== "hitstun" && f.state !== "guardbreak" && f.state !== "down" && f.y <= 0) {
    if (f.combo > 0 && s.f[i === 0 ? 1 : 0].state !== "hitstun") {
      f.combo = 0;
    }
  }

  if (f.invuln > 0) f.invuln--;
  if (f.flash > 0) f.flash--;
  if (f.state !== "blockstun" && f.state !== "guardbreak") f.guard = Math.min(100, f.guard + 0.25);
  if (f.burn > 0 && f.state !== "ko") {
    f.burn--;
    if (f.burn % 10 === 0 && s.phase === "fight") {
      f.hp -= 4;
      s.events.push({ type: "burn", x: f.x, y: f.y + 120, who: i });
      checkKo(s, i, i === 0 ? 1 : 0);
    }
  }
  f.t++;
}

function spawnProj(s: GameState, i: 0 | 1, def: ProjDef, _special: boolean) {
  const f = s.f[i];
  const sz = CHARS[f.char].size;
  s.proj.push({
    id: s.nextProjId++,
    owner: i,
    kind: def.kind,
    x: f.x + f.facing * def.x * sz,
    y: def.y * sz,
    vx: def.vx * f.facing,
    w: def.w,
    h: def.h,
    dir: f.facing,
    life: def.life,
    age: 0,
    hitsLeft: def.hits,
    lastHit: -99,
    def,
    burn: f.char === "queen",
  });
}

function projRect(p: Projectile): Rect {
  if (p.def.attached) {
    const x0 = p.x;
    const x1 = p.x + p.dir * p.w;
    return { x0: Math.min(x0, x1), x1: Math.max(x0, x1), y0: p.y, y1: p.y + p.h };
  }
  return { x0: p.x - p.w / 2, x1: p.x + p.w / 2, y0: p.y, y1: p.y + p.h };
}

function updateProjectiles(s: GameState, inputs: [number, number]) {
  for (const p of s.proj) {
    const owner = s.f[p.owner];
    if (p.def.attached) {
      const sz = CHARS[owner.char].size;
      p.x = owner.x + owner.facing * p.def.x * sz;
      p.dir = owner.facing;
    } else {
      p.x += p.vx;
    }
    p.age++;
    p.life--;
    if (!p.def.attached && (p.x < -100 || p.x > ARENA_W + 100)) p.life = 0;
  }

  // Projectile vs projectile clash.
  for (const a of s.proj) {
    for (const b of s.proj) {
      if (a.owner === b.owner || a.life <= 0 || b.life <= 0) continue;
      if (!overlap(projRect(a), projRect(b))) continue;
      const aBig = a.def.hits > 1;
      const bBig = b.def.hits > 1;
      if (!aBig) a.life = 0;
      if (!bBig) b.life = 0;
      s.events.push({ type: "projClash", x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + 30, who: a.owner });
    }
  }

  for (const p of s.proj) {
    if (p.life <= 0) continue;
    const di: 0 | 1 = p.owner === 0 ? 1 : 0;
    const d = s.f[di];
    const hb = hurtbox(d);
    if (!hb) continue;
    if (p.age - p.lastHit < p.def.rehit && p.lastHit >= 0) continue;
    const r = projRect(p);
    if (!overlap(r, hb)) continue;
    p.lastHit = p.age;
    p.hitsLeft--;
    const last = p.hitsLeft <= 0;
    resolveHit(
      s,
      p.owner,
      di,
      {
        dmg: p.def.dmg,
        hitstun: p.def.hitstun,
        blockstun: p.def.blockstun,
        guard: p.def.guard,
        push: last ? 7 : 2,
        kd: last && p.def.kd,
        chip: true,
        burn: p.burn,
        meter: 7,
        heavy: last,
      },
      (Math.max(r.x0, hb.x0) + Math.min(r.x1, hb.x1)) / 2,
      (Math.max(r.y0, hb.y0) + Math.min(r.y1, hb.y1)) / 2,
      inputs[di],
    );
    if (last) p.life = 0;
  }
  s.proj = s.proj.filter((p) => p.life > 0);
}

function checkMeleeHits(s: GameState, inputs: [number, number]) {
  for (const ai of [0, 1] as const) {
    const a = s.f[ai];
    const m = moveOf(a);
    if (a.state !== "attack" || !m || m.hb.w <= 0) continue;
    if (a.t < m.startup || a.t >= m.startup + m.active) continue;
    if (m.rehit) {
      if (a.t - a.lastRehit < m.rehit) continue;
    } else if (a.moveHit) continue;
    const di: 0 | 1 = ai === 0 ? 1 : 0;
    const d = s.f[di];
    const hb = hurtbox(d);
    if (!hb) continue;
    if (m.isThrow && (d.y > 0 || d.state === "hitstun" || d.state === "blockstun")) continue;
    const r = boxRect(a, m.hb);
    if (!overlap(r, hb)) continue;
    a.moveHit = true;
    a.lastRehit = a.t;
    const lastRehit = m.rehit ? a.t + m.rehit >= m.startup + m.active : true;
    resolveHit(
      s,
      ai,
      di,
      {
        dmg: m.dmg,
        hitstun: m.hitstun,
        blockstun: m.blockstun,
        guard: m.guard,
        push: m.rehit && !lastRehit ? 1 : m.push,
        kd: m.kd && lastRehit,
        launch: m.launch,
        chip: !!(m.isSpecial || m.isSuper),
        isThrow: m.isThrow,
        burn: a.char === "queen" && !!m.isSpecial,
        meter: m.meter,
        heavy: m.dmg >= 75 || !!m.isSuper,
      },
      (Math.max(r.x0, hb.x0) + Math.min(r.x1, hb.x1)) / 2,
      (Math.max(r.y0, hb.y0) + Math.min(r.y1, hb.y1)) / 2,
      inputs[di],
    );
    // Rush supers keep the defender close.
    if (m.rehit && !lastRehit) d.x = a.x + a.facing * 95 * CHARS[a.char].size;
  }
}

function separate(s: GameState) {
  const [a, b] = s.f;
  for (const f of s.f) f.x = Math.max(45, Math.min(ARENA_W - 45, f.x));
  // Camera leash.
  if (Math.abs(a.x - b.x) > MAX_SEPARATION) {
    const mid = (a.x + b.x) / 2;
    const half = MAX_SEPARATION / 2;
    if (a.x < b.x) {
      a.x = mid - half;
      b.x = mid + half;
    } else {
      a.x = mid + half;
      b.x = mid - half;
    }
  }
  if (a.state === "ko" || b.state === "ko") return;
  const minD = halfWidth(a) + halfWidth(b);
  const dx = b.x - a.x;
  const vertical = Math.abs(a.y - b.y) < 120;
  if (Math.abs(dx) < minD && vertical) {
    const push = (minD - Math.abs(dx)) / 2;
    const sign = dx === 0 ? (a.facing === 1 ? 1 : -1) : Math.sign(dx);
    a.x -= sign * push;
    b.x += sign * push;
    for (const f of s.f) {
      if (f.x < 45) {
        const over = 45 - f.x;
        a.x += over;
        b.x += over;
      } else if (f.x > ARENA_W - 45) {
        const over = f.x - (ARENA_W - 45);
        a.x -= over;
        b.x -= over;
      }
    }
  }
}

function updateFacing(s: GameState) {
  const [a, b] = s.f;
  for (const [f, o] of [
    [a, b],
    [b, a],
  ] as const) {
    if (f.y > 0 || f.state === "attack" || f.state === "ko" || f.state === "down") continue;
    if (f.state === "hitstun" || f.state === "blockstun") continue;
    if (Math.abs(o.x - f.x) < 4) continue;
    f.facing = o.x > f.x ? 1 : -1;
  }
}

function bufferOnly(f: Fighter, input: number) {
  const raw = input & ~f.prev & (IN.P | IN.K | IN.S);
  if (raw) {
    f.buf |= raw;
    f.bufAge = 0;
  }
  f.prev = input;
}

/** Advance the game by one 60 Hz frame. */
export function step(s: GameState, inputs: [number, number]): GameState {
  s.events = [];
  s.frame++;
  if (s.announce) s.announce.t++;
  if (s.shake > 0) s.shake *= 0.85;
  if (s.shake < 0.3) s.shake = 0;

  if (s.freeze > 0) {
    s.freeze--;
    for (const i of [0, 1] as const) bufferOnly(s.f[i], inputs[i]);
    return s;
  }
  if (s.hitstop > 0) {
    s.hitstop--;
    for (const i of [0, 1] as const) {
      // Keep the parry/tech timers honest during hitstop.
      const f = s.f[i];
      const back = f.facing === 1 ? IN.L : IN.R;
      f.backHeld = inputs[i] & back ? f.backHeld + 1 : 0;
      bufferOnly(f, inputs[i]);
    }
    return s;
  }

  s.phaseT++;
  if (s.phase === "intro") {
    if (s.phaseT === 70) {
      s.announce = { text: "FIGHT!", t: 0 };
      s.events.push({ type: "fight", x: ARENA_W / 2, y: 200, who: 0 });
    }
    if (s.phaseT >= 100) {
      s.phase = "fight";
      s.phaseT = 0;
    }
  } else if (s.phase === "fight") {
    if (s.phaseT % 60 === 0 && s.timer > 0) {
      s.timer--;
      if (s.timer <= 0) {
        const [a, b] = s.f;
        const ra = a.hp / a.maxHp;
        const rb = b.hp / b.maxHp;
        endRound(s, Math.abs(ra - rb) < 0.001 ? -1 : ra > rb ? 0 : 1);
      }
    }
    if (s.announce && s.announce.t > 50 && s.announce.text === "FIGHT!") s.announce = null;
  } else if (s.phase === "ko") {
    // Slow motion for the first second after a K.O.
    if (s.phaseT < 60 && s.phaseT % 3 !== 0) {
      for (const i of [0, 1] as const) s.f[i].prev = inputs[i];
      return s;
    }
    if (s.phaseT === 110) {
      const w = s.roundWinner;
      if (w !== null && w !== -1) {
        const wf = s.f[w];
        if (wf.state !== "ko") {
          setState(wf, "win");
          wf.vx = 0;
        }
      }
    }
    if (s.phaseT >= 200) {
      const [a, b] = s.f;
      if (a.wins >= WINS_NEEDED || b.wins >= WINS_NEEDED || s.round >= MAX_ROUNDS) {
        s.phase = "matchEnd";
        s.phaseT = 0;
        s.matchWinner = a.wins === b.wins ? -1 : a.wins > b.wins ? 0 : 1;
        s.announce = null;
      } else {
        s.round++;
        startRound(s);
      }
      return s;
    }
  }

  for (const i of [0, 1] as const) {
    const f = s.f[i];
    if (f.state === "ko" || f.state === "win") {
      f.prev = inputs[i];
      continue;
    }
    handleInput(s, i, s.phase === "fight" ? inputs[i] : 0);
    f.prev = inputs[i];
  }
  if (s.freeze > 0) return s;

  for (const i of [0, 1] as const) physics(s, i);
  separate(s);
  if (s.phase === "fight") {
    checkMeleeHits(s, inputs);
    updateProjectiles(s, inputs);
  } else {
    s.proj = s.proj.filter((p) => --p.life > 0);
  }
  updateFacing(s);
  return s;
}

/** Pose to draw for a fighter in its current state. */
export function poseOf(f: Fighter): PoseId {
  switch (f.state) {
    case "ko":
      return f.y > 40 ? "hit" : "ko";
    case "down":
      return "ko";
    case "getup":
      return "crouch";
    case "crouch":
      return "crouch";
    case "jump":
      return "jump";
    case "land":
      return "crouch";
    case "hitstun":
    case "guardbreak":
      return "hit";
    case "blockstun":
      return f.crouching ? "crouch" : "block";
    case "attack": {
      const m = moveOf(f);
      if (!m) return "idle";
      if (f.t < Math.min(3, m.startup) && m.pose !== "special" && m.pose !== "crouch") {
        return f.y > 0 ? "jump" : "idle";
      }
      if (m.air && f.t >= m.startup + m.active) return "jump";
      if (m.pose === "special" && m.proj && f.t < m.startup - 4) return "block";
      return m.pose;
    }
    default:
      return f.guarding ? "block" : "idle";
  }
}

export const isBusy = (f: Fighter) => !actionable(f);
export const fighterHeight = heightOf;
