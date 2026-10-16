import sprites from "./sprites.json";

export type CharId = "kai" | "rin" | "brutus" | "nova";
export type StageId = "bahnhof" | "berlin" | "reeperbahn" | "koeln" | "wiesn" | "zeche";
export type PoseId =
  | "idle"
  | "punch"
  | "kick"
  | "block"
  | "hit"
  | "crouch"
  | "jump"
  | "ko"
  | "special";

export interface SpriteMeta {
  w: number;
  h: number;
  /** Horizontal anchor (body centre) as a fraction of the sprite width. */
  ax: number;
  /** Drawn height relative to the standing height. */
  hr?: number;
  /** Drawn width relative to the standing height (lying poses). */
  wr?: number;
}

export const SPRITES = sprites as Record<CharId, Record<PoseId, SpriteMeta>>;

export type Guard = "mid" | "low" | "high";

export interface Box {
  /** Forward offset from the fighter centre. */
  x: number;
  /** Bottom of the box, height above the fighter's feet. */
  y: number;
  w: number;
  h: number;
}

export type ProjKind = "volt" | "blaze" | "quake" | "beam" | "inferno" | "titan";

export interface ProjDef {
  kind: ProjKind;
  vx: number;
  w: number;
  h: number;
  /** Height of the box bottom above the ground at spawn. */
  y: number;
  /** Spawn offset in front of the fighter. */
  x: number;
  dmg: number;
  hits: number;
  /** Frames between re-hits for multi-hit projectiles. */
  rehit: number;
  life: number;
  guard: Guard;
  hitstun: number;
  blockstun: number;
  kd?: boolean;
  /** Beams stay attached to their owner. */
  attached?: boolean;
}

export interface MoveDef {
  id: string;
  name: string;
  pose: PoseId;
  /** Render hint: the crouch-attack swoosh, low sweep or air variant. */
  fx?: "lowPunch" | "sweep";
  startup: number;
  active: number;
  recovery: number;
  dmg: number;
  hitstun: number;
  blockstun: number;
  guard: Guard;
  hb: Box;
  push: number;
  kd?: boolean;
  /** Launches the defender upward (juggle). */
  launch?: number;
  /** Can be cancelled into specials / heavy on hit or block. */
  cancel?: boolean;
  air?: boolean;
  /** Absorbs one hit during startup. */
  armor?: boolean;
  /** Invulnerable from frame 0 up to this frame. */
  invuln?: number;
  /** Forward velocity while active (rush moves). */
  dashV?: number;
  /** Frames between re-hits during the active window (multi-hit rush). */
  rehit?: number;
  proj?: ProjDef;
  isThrow?: boolean;
  isSpecial?: boolean;
  isSuper?: boolean;
  meter: number;
}

export interface CharDef {
  id: CharId;
  name: string;
  title: string;
  origin: string;
  color: string;
  color2: string;
  /** Sprite height multiplier. */
  size: number;
  hp: number;
  speed: number;
  power: number;
  jump: number;
  passive: string;
  passiveDesc: string;
  stats: { power: number; speed: number; defense: number; range: number };
  special: MoveDef;
  superMove: MoveDef;
}

/** Standing height of a size-1.0 fighter in world units. */
export const BASE_H = 250;

const jab: MoveDef = {
  id: "jab",
  name: "Jab",
  pose: "punch",
  startup: 4,
  active: 3,
  recovery: 9,
  dmg: 42,
  hitstun: 16,
  blockstun: 10,
  guard: "mid",
  hb: { x: 25, y: 150, w: 95, h: 50 },
  push: 5,
  cancel: true,
  meter: 5,
};

const heavy: MoveDef = {
  id: "heavy",
  name: "Roundhouse",
  pose: "kick",
  startup: 8,
  active: 4,
  recovery: 18,
  dmg: 92,
  hitstun: 22,
  blockstun: 15,
  guard: "mid",
  hb: { x: 30, y: 135, w: 125, h: 85 },
  push: 10,
  meter: 9,
};

const lowPunch: MoveDef = {
  id: "lowPunch",
  name: "Tiefschlag",
  pose: "crouch",
  fx: "lowPunch",
  startup: 5,
  active: 3,
  recovery: 9,
  dmg: 34,
  hitstun: 15,
  blockstun: 9,
  guard: "low",
  hb: { x: 20, y: 30, w: 100, h: 55 },
  push: 5,
  cancel: true,
  meter: 4,
};

const sweep: MoveDef = {
  id: "sweep",
  name: "Feger",
  pose: "crouch",
  fx: "sweep",
  startup: 9,
  active: 4,
  recovery: 22,
  dmg: 78,
  hitstun: 20,
  blockstun: 14,
  guard: "low",
  hb: { x: 15, y: 0, w: 145, h: 45 },
  push: 6,
  kd: true,
  meter: 8,
};

const airPunch: MoveDef = {
  id: "airPunch",
  name: "Sprungschlag",
  pose: "punch",
  startup: 4,
  active: 7,
  recovery: 4,
  dmg: 50,
  hitstun: 17,
  blockstun: 11,
  guard: "high",
  hb: { x: 10, y: 80, w: 90, h: 80 },
  push: 5,
  air: true,
  meter: 5,
};

const airKick: MoveDef = {
  id: "airKick",
  name: "Sprungkick",
  pose: "kick",
  startup: 6,
  active: 9,
  recovery: 4,
  dmg: 80,
  hitstun: 20,
  blockstun: 13,
  guard: "high",
  hb: { x: 15, y: 40, w: 115, h: 100 },
  push: 7,
  air: true,
  meter: 7,
};

const upper: MoveDef = {
  id: "upper",
  name: "Aufwärtshaken",
  pose: "punch",
  startup: 6,
  active: 5,
  recovery: 20,
  dmg: 70,
  hitstun: 24,
  blockstun: 12,
  guard: "mid",
  hb: { x: 10, y: 170, w: 85, h: 110 },
  push: 3,
  launch: 15,
  invuln: 5,
  meter: 7,
};

const throwMove: MoveDef = {
  id: "throw",
  name: "Wurf",
  pose: "punch",
  startup: 3,
  active: 2,
  recovery: 24,
  dmg: 125,
  hitstun: 0,
  blockstun: 0,
  guard: "mid",
  hb: { x: 0, y: 40, w: 70, h: 160 },
  push: 14,
  kd: true,
  isThrow: true,
  meter: 10,
};

export const COMMON_MOVES = { jab, heavy, lowPunch, sweep, airPunch, airKick, upper, throwMove };

export const CHARS: Record<CharId, CharDef> = {
  kai: {
    id: "kai",
    name: "KAI",
    title: "Der Gezeitenbrecher",
    origin: "Krabi, Thailand",
    color: "#e5383b",
    color2: "#ffd166",
    size: 1,
    hp: 1000,
    speed: 1.1,
    power: 1,
    jump: 1,
    passive: "Flow",
    passiveDesc: "Jeder Treffer in Combo lädt +50 % Super-Energie.",
    stats: { power: 4, speed: 4, defense: 3, range: 3 },
    special: {
      id: "tidalKnee",
      name: "Tidal Knee",
      pose: "special",
      startup: 7,
      active: 14,
      recovery: 18,
      dmg: 115,
      hitstun: 26,
      blockstun: 16,
      guard: "mid",
      hb: { x: 0, y: 70, w: 90, h: 130 },
      push: 12,
      kd: true,
      invuln: 9,
      dashV: 15,
      isSpecial: true,
      meter: 10,
    },
    superMove: {
      id: "monsoonRush",
      name: "MONSUN-STURM",
      pose: "special",
      startup: 6,
      active: 34,
      recovery: 22,
      dmg: 62,
      hitstun: 30,
      blockstun: 18,
      guard: "mid",
      hb: { x: -10, y: 30, w: 120, h: 200 },
      push: 4,
      kd: true,
      invuln: 16,
      dashV: 12,
      rehit: 7,
      isSuper: true,
      meter: 0,
    },
  },
  rin: {
    id: "rin",
    name: "RIN",
    title: "Die Volt-Kunoichi",
    origin: "Neo-Bangkok",
    color: "#22d3ee",
    color2: "#3b82f6",
    size: 0.97,
    hp: 900,
    speed: 1.22,
    power: 0.92,
    jump: 1.05,
    passive: "Doppelsprung",
    passiveDesc: "Kann in der Luft ein zweites Mal springen.",
    stats: { power: 3, speed: 5, defense: 2, range: 4 },
    special: {
      id: "voltShot",
      name: "Volt Shot",
      pose: "special",
      startup: 11,
      active: 2,
      recovery: 22,
      dmg: 0,
      hitstun: 0,
      blockstun: 0,
      guard: "mid",
      hb: { x: 0, y: 0, w: 0, h: 0 },
      push: 0,
      isSpecial: true,
      meter: 8,
      proj: {
        kind: "volt",
        vx: 11,
        w: 70,
        h: 50,
        y: 140,
        x: 90,
        dmg: 82,
        hits: 1,
        rehit: 0,
        life: 120,
        guard: "mid",
        hitstun: 22,
        blockstun: 14,
      },
    },
    superMove: {
      id: "thunderLance",
      name: "DONNERLANZE",
      pose: "special",
      startup: 10,
      active: 40,
      recovery: 20,
      dmg: 0,
      hitstun: 0,
      blockstun: 0,
      guard: "mid",
      hb: { x: 0, y: 0, w: 0, h: 0 },
      push: 0,
      invuln: 10,
      isSuper: true,
      meter: 0,
      proj: {
        kind: "beam",
        vx: 0,
        w: 1100,
        h: 80,
        y: 120,
        x: 70,
        dmg: 50,
        hits: 6,
        rehit: 6,
        life: 40,
        guard: "mid",
        hitstun: 24,
        blockstun: 14,
        kd: true,
        attached: true,
      },
    },
  },
  brutus: {
    id: "brutus",
    name: "BRUTUS",
    title: "Der Eisenbär",
    origin: "Phuket Underground",
    color: "#22c55e",
    color2: "#a3e635",
    size: 1.12,
    hp: 1120,
    speed: 0.82,
    power: 1.12,
    jump: 0.9,
    passive: "Eisenhaut",
    passiveDesc: "Roundhouse & Quake Slam absorbieren einen Treffer (Super-Armor).",
    stats: { power: 5, speed: 2, defense: 5, range: 3 },
    special: {
      id: "quakeSlam",
      name: "Quake Slam",
      pose: "special",
      startup: 17,
      active: 3,
      recovery: 26,
      dmg: 60,
      hitstun: 20,
      blockstun: 12,
      guard: "low",
      hb: { x: -20, y: 0, w: 130, h: 60 },
      push: 8,
      kd: true,
      armor: true,
      isSpecial: true,
      meter: 10,
      proj: {
        kind: "quake",
        vx: 8.5,
        w: 80,
        h: 55,
        y: 0,
        x: 90,
        dmg: 95,
        hits: 1,
        rehit: 0,
        life: 90,
        guard: "low",
        hitstun: 22,
        blockstun: 14,
        kd: true,
      },
    },
    superMove: {
      id: "titanQuake",
      name: "TITANEN-BEBEN",
      pose: "special",
      startup: 14,
      active: 3,
      recovery: 30,
      dmg: 0,
      hitstun: 0,
      blockstun: 0,
      guard: "mid",
      hb: { x: 0, y: 0, w: 0, h: 0 },
      push: 0,
      invuln: 14,
      armor: true,
      isSuper: true,
      meter: 0,
      proj: {
        kind: "titan",
        vx: 10,
        w: 140,
        h: 170,
        y: 0,
        x: 80,
        dmg: 95,
        hits: 3,
        rehit: 5,
        life: 100,
        guard: "mid",
        hitstun: 30,
        blockstun: 16,
        kd: true,
      },
    },
  },
  nova: {
    id: "nova",
    name: "NOVA",
    title: "Die Feuermönchin",
    origin: "Tempel von Tiger Cave",
    color: "#f97316",
    color2: "#facc15",
    size: 0.95,
    hp: 950,
    speed: 1,
    power: 1,
    jump: 1,
    passive: "Glut",
    passiveDesc: "Ihre Spezialangriffe setzen den Gegner in Brand (Schaden über Zeit).",
    stats: { power: 4, speed: 3, defense: 3, range: 5 },
    special: {
      id: "blazeOrb",
      name: "Blaze Orb",
      pose: "special",
      startup: 12,
      active: 2,
      recovery: 24,
      dmg: 0,
      hitstun: 0,
      blockstun: 0,
      guard: "mid",
      hb: { x: 0, y: 0, w: 0, h: 0 },
      push: 0,
      isSpecial: true,
      meter: 8,
      proj: {
        kind: "blaze",
        vx: 7.5,
        w: 80,
        h: 70,
        y: 120,
        x: 95,
        dmg: 92,
        hits: 1,
        rehit: 0,
        life: 160,
        guard: "mid",
        hitstun: 24,
        blockstun: 15,
      },
    },
    superMove: {
      id: "phoenixInferno",
      name: "PHÖNIX-INFERNO",
      pose: "special",
      startup: 12,
      active: 2,
      recovery: 26,
      dmg: 0,
      hitstun: 0,
      blockstun: 0,
      guard: "mid",
      hb: { x: 0, y: 0, w: 0, h: 0 },
      push: 0,
      invuln: 12,
      isSuper: true,
      meter: 0,
      proj: {
        kind: "inferno",
        vx: 8.5,
        w: 170,
        h: 170,
        y: 50,
        x: 110,
        dmg: 70,
        hits: 4,
        rehit: 5,
        life: 140,
        guard: "mid",
        hitstun: 30,
        blockstun: 16,
        kd: true,
      },
    },
  },
};

export const CHAR_IDS: CharId[] = ["kai", "rin", "brutus", "nova"];

export type Ambient = "rain" | "embers" | "confetti" | "dust" | "none";

export interface StageDef {
  id: StageId;
  name: string;
  place: string;
  tint: string;
  ambient: Ambient;
  /** Moves the backdrop down (view px) so its floor meets the fighters' feet. */
  shift: number;
}

export const STAGES: Record<StageId, StageDef> = {
  bahnhof: { id: "bahnhof", name: "Hauptbahnhof", place: "Gleis 9¾ des Grauens", tint: "#64748b", ambient: "dust", shift: 45 },
  berlin: { id: "berlin", name: "Brandenburger Tor", place: "Berlin", tint: "#f97316", ambient: "none", shift: 0 },
  reeperbahn: { id: "reeperbahn", name: "Reeperbahn", place: "Hamburg", tint: "#e11d48", ambient: "rain", shift: 0 },
  koeln: { id: "koeln", name: "Domplatte", place: "Köln", tint: "#fb923c", ambient: "none", shift: 0 },
  wiesn: { id: "wiesn", name: "Festzelt", place: "München", tint: "#3b82f6", ambient: "confetti", shift: 0 },
  zeche: { id: "zeche", name: "Zeche", place: "Ruhrpott", tint: "#ea580c", ambient: "embers", shift: 0 },
};

export const STAGE_IDS: StageId[] = ["bahnhof", "berlin", "reeperbahn", "koeln", "wiesn", "zeche"];

export const spriteUrl = (c: CharId, p: PoseId) => `/fight/${c}_${p}.webp`;
export const stageUrl = (s: StageId) => `/fight/stage_${s}.webp`;

export type FxId = "hit" | "heavy" | "block" | "fire" | "volt" | "quake" | "water" | "ko" | "dust" | "aura";
export const FX_IDS: FxId[] = ["hit", "heavy", "block", "fire", "volt", "quake", "water", "ko", "dust", "aura"];
export const fxUrl = (f: FxId) => `/fight/fx_${f}.webp`;
