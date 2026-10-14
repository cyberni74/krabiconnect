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

export interface ActorRuntime {
  id: string;
  x: number;
  y: number;
  facing: Facing;
  talking: boolean;
  t: number;
  scale: number;
}

/** Script API available to scenes. */
export interface G {
  flags: Flags;
  t: number;
  hero: ActorRuntime;
  flag(k: string): number | boolean | string | undefined;
  set(k: string, v?: number | boolean | string): void;
  has(item: string): boolean;
  add(item: string): void;
  remove(item: string): void;
  coins(): number;
  addCoins(n: number): void;
  say(text: string, who?: string): Promise<void>;
  walk(x: number, y: number): Promise<void>;
  face(dir: Facing): void;
  goto(scene: string, x?: number, y?: number, facing?: Facing): Promise<void>;
  choose(options: string[]): Promise<number>;
  wait(ms: number): Promise<void>;
  card(title: string, sub?: string): Promise<void>;
  fade(to: 0 | 1, ms?: number): Promise<void>;
  actor(id: string): ActorRuntime | undefined;
  moveActor(id: string, x: number, y: number, ms: number): Promise<void>;
  flash(color: string, ms?: number): void;
  refresh(): void;
  sfx(name: "pickup" | "coin" | "dig" | "door" | "magic" | "splash" | "fanfare" | "wrong" | "horn"): void;
  finish(): void;
}

export type Script = (g: G) => Promise<void> | void;
export type Reaction = Script | string;

export interface Hotspot {
  id: string;
  name: string | ((g: G) => string);
  rect?: [number, number, number, number];
  poly?: Pt[];
  /** Hotspot follows a scene actor (hit box around it). */
  actor?: string;
  at?: Pt;
  face?: Facing;
  exit?: boolean;
  hidden?: (g: G) => boolean;
  look?: Reaction;
  take?: Reaction;
  talk?: Reaction;
  use?: Reaction;
  walk?: Script;
  useWith?: Record<string, Reaction>;
  give?: Record<string, Reaction>;
}

export interface ActorDef {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  facing?: Facing;
  /** Fixed scale; otherwise the scene's depth scale. */
  scale?: number;
  box?: [number, number];
  pos?: (g: G) => Pt;
  hidden?: (g: G) => boolean;
  draw: (ctx: CanvasRenderingContext2D, a: ActorRuntime, g: G) => void;
}

export type Ambient = "sea" | "tavern" | "jungle" | "cave" | "wind" | "ship";

export interface SceneDef {
  id: string;
  title: string;
  ambient: Ambient;
  walk: Pt[];
  scale: (y: number) => number;
  paintStatic: (ctx: CanvasRenderingContext2D, g: G) => void;
  staticKey?: (g: G) => string;
  paintAnim?: (ctx: CanvasRenderingContext2D, t: number, g: G) => void;
  paintFront?: (ctx: CanvasRenderingContext2D, t: number, g: G) => void;
  hotspots: Hotspot[];
  actors?: ActorDef[];
  enter?: Script;
}
