/** Shared types of the RABENSCHWUR adventure engine. */
export const W = 960;
export const H = 440;

export type Pt = { x: number; y: number };
export type Facing = 1 | -1;
export type Verb = "walk" | "look" | "take" | "use" | "talk" | "give";

export const VERBS: { id: Verb; label: string }[] = [
  { id: "walk", label: "Gehe zu" },
  { id: "look", label: "Schau an" },
  { id: "take", label: "Nimm" },
  { id: "use", label: "Benutze" },
  { id: "talk", label: "Rede mit" },
  { id: "give", label: "Gib" },
];

export type Flags = Record<string, number | boolean | string | undefined>;

export type Sfx = "pickup" | "coin" | "dig" | "door" | "magic" | "wrong" | "fanfare" | "clank" | "hammer" | "splash" | "creak" | "fire" | "roar" | "bell" | "unlock" | "drawer";
export type Pose = "pick" | "use" | "swing" | "dig";

export interface NpcRuntime {
  id: string;
  x: number;
  y: number;
  facing: Facing;
  talking: boolean;
  /** Seconds since start, used for idle animation. */
  t: number;
  /** Current extra pose frame key (see NpcSpec.frames), reset to "idle" by script. */
  frame: string;
}

/** Script API available to scene content. All async methods resolve when finished. */
export interface G {
  flags: Flags;
  hero: { x: number; y: number; facing: Facing };
  flag(k: string): number | boolean | string | undefined;
  set(k: string, v?: number | boolean | string): void;
  inc(k: string, n?: number): number;
  has(item: string): boolean;
  add(item: string): void;
  remove(item: string): void;
  /** Ehre (honor) points, see docs/game-design.md */
  honor(n?: number): number;
  say(text: string, who?: string): Promise<void>;
  choose(options: string[]): Promise<number>;
  walk(x: number, y: number): Promise<void>;
  face(dir: Facing): void;
  pose(p: Pose, ms?: number): Promise<void>;
  goto(scene: string, x?: number, y?: number, facing?: Facing): Promise<void>;
  wait(ms: number): Promise<void>;
  fade(to: 0 | 1, ms?: number): Promise<void>;
  card(title: string, sub?: string): Promise<void>;
  npc(id: string): NpcRuntime | undefined;
  moveNpc(id: string, x: number, y: number, ms?: number): Promise<void>;
  /** Switch the pose frame of an npc, e.g. g.frame("skelett","wach"). Frame names come from NpcSpec.frames. */
  frame(id: string, frame: string): void;
  sfx(name: Sfx): void;
  flash(color: string, ms?: number): void;
  shake(ms?: number): void;
  /** Open a container panel (drawer, chest) listing item ids; the player takes items out of it. */
  openPanel(title: string, panelId: string, contents: string[]): Promise<void>;
  /** Items still left in a panel container. */
  panelLeft(panelId: string, contents: string[]): string[];
  refresh(): void;
  /** Ends the game: shows the ending screen. */
  end(title: string, text: string): void;
  /** Current scene id. */
  sceneId(): string;
}

export type Script = (g: G) => Promise<void> | void;
export type Reaction = Script | string;

export interface ExitSpec {
  to: string;
  x?: number;
  y?: number;
  facing?: Facing;
  /** Extra condition, e.g. door locked: return a message to refuse. */
  guard?: (g: G) => string | null | undefined | Promise<string | null | undefined>;
}

export interface NpcSpec {
  /** Frame name -> sprite key (public/g/chars/<key>.webp). "idle" is required, "talk" optional. */
  frames: Record<string, string>;
  /** Called every frame, returns the frame name to show (default idle/talk logic). */
  pick?: (n: NpcRuntime, g: G) => string | null;
  /** If true the npc turns toward the hero when talked to (default true). */
  faceHero?: boolean;
  /** Natural facing of the art is right; start facing. */
  facing?: Facing;
}

export interface Thing {
  id: string;
  name: string | ((g: G) => string);
  /** Sprite key under public/g/props, or a function choosing it from state. null/undefined = invisible (hit area only). */
  sprite?: string | null | ((g: G) => string | null);
  /** Optional folder for the sprite: props (default), items or chars. */
  dir?: "props" | "items" | "chars";
  /** Bottom-center anchor of the sprite in scene coordinates. */
  x: number;
  y: number;
  /** Fixed scale multiplier (default 1). Depth scaling is NOT applied to props, only to npcs. */
  scale?: number;
  /** Mirror horizontally. */
  flip?: boolean;
  /** Absolute hit rect [x,y,w,h]; default = sprite box. */
  hit?: [number, number, number, number];
  /** Where the hero walks to (default: just in front of the anchor). */
  at?: Pt;
  face?: Facing;
  hidden?: (g: G) => boolean;
  /** Decoration only: drawn but never hit-tested. */
  decor?: boolean;
  /** Draw order override (default = y). Use -1 for decor behind everything, 9999 for foreground. */
  z?: number;
  npc?: NpcSpec;
  exit?: ExitSpec;
  /** Soft light glow drawn additively; also lights dark scenes. */
  light?: { r: number; color: string; flicker?: number; dy?: number };
  look?: Reaction;
  take?: Reaction;
  use?: Reaction;
  talk?: Reaction;
  walk?: Script;
  /** item id -> reaction when using that item on this thing. */
  useWith?: Record<string, Reaction>;
  /** item id -> reaction when giving that item to this thing. */
  give?: Record<string, Reaction>;
  /** Verb performed when the thing is tapped with the automatic verb (default derived). */
  primary?: Verb;
}

export type FxKind = "fog" | "embers" | "dust" | "rain" | "ash" | "fireflies" | "drips" | "smoke";
export interface FxDef {
  kind: FxKind;
  /** Region [x,y,w,h] where the effect is emitted (default full scene). */
  area?: [number, number, number, number];
  /** Density multiplier (default 1). */
  n?: number;
  color?: string;
}

export interface SceneDef {
  id: string;
  title: string;
  /** Background key under public/g/bg (webp). */
  bg: string;
  /** Walkable polygon (feet position). May depend on state (e.g. blocked lava). */
  walk: Pt[] | ((g: G) => Pt[]);
  /** Hero/npc depth scale: linear in y. */
  scale: { y0: number; s0: number; y1: number; s1: number };
  ambient: Ambient;
  fx?: FxDef[];
  /** Darkness: returns undefined for fully lit, else darkness 0..1 and hero light radius. */
  dark?: (g: G) => { amount: number; radius: number } | undefined;
  things: Thing[];
  enter?: Script;
}

export type Ambient = "village" | "forge" | "church" | "crypt" | "forest" | "swamp" | "hut" | "castle" | "hall" | "dungeon" | "volcano" | "library" | "wind";

export interface ItemDef {
  name: string | ((g: G) => string);
  /** Text for "Schau an" on the inventory item. */
  look: string;
}

export interface ChapterStart {
  scene: string;
  x: number;
  y: number;
  facing: Facing;
  inv: string[];
  flags: Flags;
  intro: (g: G) => Promise<void>;
}

/** What a chapter module exports. */
export interface ChapterModule {
  scenes: SceneDef[];
  /** Extra items of this chapter (the shared catalog lives in world/items.ts). */
  items?: Record<string, ItemDef>;
  combos?: Record<string, Reaction>;
  start: ChapterStart;
  hint: (g: G) => string;
}
