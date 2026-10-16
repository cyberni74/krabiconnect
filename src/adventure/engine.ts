import { audio } from "./audio";
import { getImg, hasAsset, logicalSize, preload, type AssetKind } from "./assets";
import { Fx } from "./fx";
import { getLang, tr, words } from "./i18n";
import { findPath, inside, nearestOnPoly } from "./path";
import { H, W } from "./types";
import type { ChapterStart, Facing, Flags, G, ItemDef, NpcRuntime, Pose, Pt, Reaction, SceneDef, Sfx, Thing, Verb } from "./types";

export interface World {
  scenes: Record<string, SceneDef>;
  items: Record<string, ItemDef>;
  combos: Record<string, Reaction>;
  starts: Record<number, ChapterStart>;
  hint: (g: G) => string;
  titleScene: string;
}

export interface UiSnapshot {
  v: number;
  verb: Verb;
  sel: string | null;
  sentence: string;
  inv: string[];
  choices: string[] | null;
  busy: boolean;
  screen: "title" | "play" | "end";
  sceneTitle: string;
  hasSave: boolean;
  muted: boolean;
  endTitle: string;
  endText: string;
  panel: { title: string; items: string[] } | null;
  lang: string;
  honor: number;
}

const SAVE_KEY = "rabenschwur-save-v1";

const DEFAULTS: Record<Verb, string[]> = {
  walk: [""],
  look: ["Nichts Besonderes.", "Sieht aus, wie es aussieht. Alt und trostlos.", "Hm. Dafür habe ich keine Zeit."],
  take: ["Das lasse ich lieber hier.", "Das kann ich nicht mitnehmen.", "Meine Taschen sind nicht dafür gemacht."],
  use: ["Das funktioniert so nicht.", "Wie soll das gehen?", "Netter Versuch, Bran."],
  talk: ["Es antwortet nicht. Vermutlich besser so.", "Ich glaube, das hört mir nicht zu."],
  give: ["Das will ich nicht hergeben.", "Ich glaube nicht, dass das hilft."],
};
const pickOne = (a: string[]) => a[Math.floor(Math.random() * a.length)];

const WALK_CYCLE = ["bran_walk1", "bran_walk2", "bran_walk3", "bran_walk2"];
const SPEAKER_COLORS = ["#ffd98a", "#9fe0ff", "#c8b4ff", "#ffb08a", "#a8f0b0", "#ff9ab0", "#f0e68a", "#8ad8d8"];

function hashColor(id: string) {
  if (id === "hero") return "#f4e6c4";
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return SPEAKER_COLORS[h % SPEAKER_COLORS.length];
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

type Hover = Thing | null;

export class Game implements G {
  flags: Flags = {};
  inv: string[] = [];
  t = 0;
  hero = { x: 480, y: 400, facing: 1 as Facing };
  scene: SceneDef;
  screen: "title" | "play" | "end" = "title";
  verb: Verb = "walk";
  sel: string | null = null;
  hover: Hover = null;
  hoverItem: string | null = null;
  touch = false;
  muted = audio.muted;
  endTitle = "";
  endText = "";
  panel: { title: string; id: string; contents: string[]; resolve: () => void } | null = null;
  choices: { options: string[]; resolve: (i: number) => void } | null = null;
  speech: { who: string; text: string; until: number; resolve: () => void } | null = null;
  cardState: { title: string; sub?: string; t0: number; resolve: () => void } | null = null;
  busy = 0;

  npcs = new Map<string, NpcRuntime>();
  private path: Pt[] = [];
  private walkDone: (() => void) | null = null;
  private walkPhase = 0;
  private walking = false;
  private heroPose: { key: Pose; until: number } | null = null;
  private tweens: { n: NpcRuntime; x0: number; y0: number; x1: number; y1: number; t0: number; ms: number; done: () => void }[] = [];
  private fadeA = 0;
  private fadeTween: { from: number; to: number; t0: number; ms: number; done: () => void } | null = null;
  private flashState: { color: string; t0: number; ms: number } | null = null;
  private shakeUntil = 0;
  private fx: Fx | null = null;
  private darkCanvas: HTMLCanvasElement | null = null;
  private revealUntil = 0;
  private ver = 0;
  private snap: UiSnapshot | null = null;
  private listeners = new Set<() => void>();
  private lastNow = 0;

  constructor(public world: World) {
    this.scene = world.scenes[world.titleScene];
    this.enterScene(this.scene, 480, 400, 1);
  }

  /* ------------------------------------------------------------ store */
  subscribe = (l: () => void) => {
    this.listeners.add(l);
    return () => void this.listeners.delete(l);
  };
  emit() {
    this.ver++;
    this.snap = null;
    for (const l of this.listeners) l();
  }
  refresh() {
    this.emit();
  }
  getSnapshot = (): UiSnapshot => {
    if (this.snap) return this.snap;
    this.snap = {
      v: this.ver,
      verb: this.verb,
      sel: this.sel,
      sentence: this.sentence(),
      inv: [...this.inv],
      choices: this.choices?.options ?? null,
      busy: this.busy > 0,
      screen: this.screen,
      sceneTitle: tr(this.scene.title),
      hasSave: hasSave(),
      muted: audio.muted,
      endTitle: tr(this.endTitle),
      endText: tr(this.endText),
      panel: this.panel ? { title: tr(this.panel.title), items: this.panelItems() } : null,
      lang: getLang(),
      honor: Number(this.flags.honor ?? 0),
    };
    return this.snap;
  };

  /* ------------------------------------------------------------ catalog */
  itemName(id: string): string {
    const d = this.world.items[id];
    if (!d) return id;
    return tr(typeof d.name === "function" ? d.name(this) : d.name);
  }
  thingName(t: Thing): string {
    return tr(typeof t.name === "function" ? t.name(this) : t.name);
  }

  /* ------------------------------------------------------------ state API */
  flag(k: string) {
    return this.flags[k];
  }
  set(k: string, v: number | boolean | string = true) {
    this.flags[k] = v;
    this.emit();
  }
  inc(k: string, n = 1) {
    const v = Number(this.flags[k] ?? 0) + n;
    this.flags[k] = v;
    this.emit();
    return v;
  }
  has(item: string) {
    return this.inv.includes(item);
  }
  add(item: string) {
    if (!this.inv.includes(item)) this.inv.push(item);
    this.emit();
  }
  remove(item: string) {
    this.inv = this.inv.filter((i) => i !== item);
    if (this.sel === item) this.sel = null;
    this.emit();
  }
  honor(n = 0) {
    if (n) this.flags.honor = Number(this.flags.honor ?? 0) + n;
    this.emit();
    return Number(this.flags.honor ?? 0);
  }
  sceneId() {
    return this.scene.id;
  }

  /* ------------------------------------------------------------ geometry */
  walkPoly(): Pt[] {
    const w = this.scene.walk;
    return typeof w === "function" ? w(this) : w;
  }
  scaleAt(y: number) {
    const s = this.scene.scale;
    const k = Math.max(0, Math.min(1, (y - s.y0) / (s.y1 - s.y0 || 1)));
    return s.s0 + (s.s1 - s.s0) * k;
  }
  private spriteOf(t: Thing): { kind: AssetKind; key: string } | null {
    if (t.npc) {
      const rt = this.npcs.get(t.id);
      const key = t.npc.frames[this.npcFrame(t, rt)] ?? t.npc.frames.idle;
      return key ? { kind: "chars", key } : null;
    }
    const s = typeof t.sprite === "function" ? t.sprite(this) : t.sprite;
    return s ? { kind: t.dir ?? "props", key: s } : null;
  }
  private npcFrame(t: Thing, rt?: NpcRuntime): string {
    if (!rt || !t.npc) return "idle";
    const custom = t.npc.pick?.(rt, this);
    if (custom && t.npc.frames[custom]) return custom;
    if (rt.frame !== "idle" && t.npc.frames[rt.frame]) return rt.frame;
    if (rt.talking && t.npc.frames.talk) return Math.floor(this.t * 6) % 2 === 0 ? "talk" : "idle";
    return "idle";
  }
  /** Scene-space box of a thing's sprite (null when invisible). */
  boxOf(t: Thing): Box | null {
    const sp = this.spriteOf(t);
    if (!sp) return null;
    const sz = logicalSize(sp.kind, sp.key);
    if (!sz) return null;
    const rt = t.npc ? this.npcs.get(t.id) : undefined;
    const ax = rt ? rt.x : t.x;
    const ay = rt ? rt.y : t.y;
    const s = (t.npc ? this.scaleAt(ay) : 1) * (t.scale ?? 1);
    const w = sz[0] * s;
    const h = sz[1] * s;
    return { x: ax - w / 2, y: ay - h, w, h };
  }
  hitOf(t: Thing): Box | null {
    if (t.hit) return { x: t.hit[0], y: t.hit[1], w: t.hit[2], h: t.hit[3] };
    const b = this.boxOf(t);
    if (!b) return null;
    const px = b.w * 0.06;
    return { x: b.x + px, y: b.y + b.h * 0.04, w: b.w - px * 2, h: b.h * 0.96 };
  }
  visible(): Thing[] {
    return this.scene.things.filter((t) => !t.hidden?.(this));
  }
  thingAt(p: Pt): Thing | null {
    let best: Thing | null = null;
    let ba = Infinity;
    for (const t of this.visible()) {
      if (t.decor) continue;
      const b = this.hitOf(t);
      if (!b || p.x < b.x || p.x > b.x + b.w || p.y < b.y || p.y > b.y + b.h) continue;
      const area = b.w * b.h;
      if (area < ba) {
        ba = area;
        best = t;
      }
    }
    return best;
  }
  /** Where the hero walks to for a thing. */
  approach(t: Thing): Pt {
    if (t.at) return t.at;
    const rt = t.npc ? this.npcs.get(t.id) : undefined;
    if (rt) {
      const side = this.hero.x <= rt.x ? -1 : 1;
      return { x: rt.x + side * 75, y: rt.y };
    }
    return { x: t.x, y: t.y + 10 };
  }

  /* ------------------------------------------------------------ scene flow */
  private enterScene(sc: SceneDef, x?: number, y?: number, facing?: Facing) {
    this.scene = sc;
    this.path = [];
    this.walkDone?.();
    this.walkDone = null;
    this.walking = false;
    this.hover = null;
    this.npcs.clear();
    for (const t of sc.things) {
      if (t.npc) this.npcs.set(t.id, { id: t.id, x: t.x, y: t.y, facing: t.npc.facing ?? (t.flip ? -1 : 1), talking: false, t: Math.random() * 6, frame: "idle" });
    }
    const poly = this.walkPoly();
    let p: Pt = { x: x ?? 480, y: y ?? 400 };
    if (!inside(p, poly)) p = nearestOnPoly(p, poly);
    this.hero.x = p.x;
    this.hero.y = p.y;
    this.hero.facing = facing ?? 1;
    this.fx = sc.fx?.length ? new Fx(sc.fx) : null;
    audio.setAmbient(sc.ambient);
    getImg("bg", sc.bg);
    this.emit();
  }

  private sceneAssets(sc: SceneDef): [AssetKind, string][] {
    const list: [AssetKind, string][] = [["bg", sc.bg]];
    for (const k of ["stand", "walk1", "walk2", "walk3", "pick", "use", "swing", "dig"]) list.push(["chars", "bran_" + k]);
    for (const t of sc.things) {
      if (t.npc) for (const k of Object.values(t.npc.frames)) list.push(["chars", k]);
      else if (typeof t.sprite === "string" && hasAsset(t.dir ?? "props", t.sprite)) list.push([t.dir ?? "props", t.sprite]);
    }
    return list;
  }

  async goto(sceneId: string, x?: number, y?: number, facing?: Facing) {
    const sc = this.world.scenes[sceneId];
    if (!sc) throw new Error("unknown scene " + sceneId);
    await this.fade(1, 320);
    this.speech?.resolve();
    this.speech = null;
    await preload(this.sceneAssets(sc));
    this.enterScene(sc, x, y, facing);
    this.save();
    await this.fade(0, 420);
    if (sc.enter) await this.run(sc.enter);
  }

  /* ------------------------------------------------------------ saving */
  save() {
    if (this.screen !== "play") return;
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ scene: this.scene.id, x: this.hero.x, y: this.hero.y, facing: this.hero.facing, inv: this.inv, flags: this.flags }));
    } catch {
      /* storage unavailable */
    }
  }
  newGame(from = 1) {
    const st = this.world.starts[from] ?? this.world.starts[1];
    this.flags = { ...st.flags, honor: 0 };
    this.inv = [...st.inv];
    this.sel = null;
    this.verb = "walk";
    this.screen = "play";
    this.speech = null;
    this.choices = null;
    this.panel = null;
    this.enterScene(this.world.scenes[st.scene], st.x, st.y, st.facing);
    this.fadeA = 1;
    void this.fade(0, 500);
    void st.intro(this);
    this.save();
  }
  continueGame() {
    const s = loadSave();
    if (!s || !this.world.scenes[s.scene]) return this.newGame();
    this.flags = s.flags ?? {};
    this.inv = s.inv ?? [];
    this.sel = null;
    this.verb = "walk";
    this.screen = "play";
    this.enterScene(this.world.scenes[s.scene], s.x, s.y, s.facing);
    this.fadeA = 1;
    void this.fade(0, 500);
  }
  toTitle() {
    this.save();
    this.screen = "title";
    this.speech?.resolve();
    this.speech = null;
    this.enterScene(this.world.scenes[this.world.titleScene], 480, 400, 1);
    this.emit();
  }
  end(title: string, text: string) {
    this.endTitle = title;
    this.endText = text;
    this.screen = "end";
    this.speech = null;
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      /* ignore */
    }
    this.emit();
  }

  /* ------------------------------------------------------------ scripting primitives */
  say(text: string, who = "hero"): Promise<void> {
    text = tr(text);
    return new Promise((resolve) => {
      const ms = Math.max(1600, text.length * 55 + 900);
      this.speech = { who, text, until: performance.now() + ms, resolve };
      const n = this.npcs.get(who);
      if (n) n.talking = true;
      audio.blip(who);
    });
  }
  choose(options: string[]): Promise<number> {
    return new Promise((resolve) => {
      this.choices = { options: options.map(tr), resolve };
      this.emit();
    });
  }
  choose_(i: number) {
    const c = this.choices;
    if (!c) return;
    this.choices = null;
    this.emit();
    c.resolve(i);
  }
  card(title: string, sub?: string): Promise<void> {
    return new Promise((resolve) => {
      this.cardState = { title: tr(title), sub: sub ? tr(sub) : sub, t0: performance.now(), resolve };
    });
  }
  fade(to: 0 | 1, ms = 450): Promise<void> {
    return new Promise((done) => {
      this.fadeTween = { from: this.fadeA, to, t0: performance.now(), ms, done };
    });
  }
  flash(color: string, ms = 500) {
    this.flashState = { color, t0: performance.now(), ms };
  }
  shake(ms = 500) {
    this.shakeUntil = performance.now() + ms;
  }
  wait(ms: number) {
    return new Promise<void>((r) => setTimeout(r, ms));
  }
  sfx(name: Sfx) {
    audio.sfx(name);
  }
  walk(x: number, y: number): Promise<void> {
    this.walkDone?.();
    const poly = this.walkPoly();
    this.path = findPath(this.hero, { x, y }, poly);
    return new Promise((r) => {
      this.walkDone = r;
      if (!this.path.length) {
        this.walkDone = null;
        r();
      }
    });
  }
  face(d: Facing) {
    this.hero.facing = d;
  }
  pose(p: Pose, ms = 650): Promise<void> {
    this.heroPose = { key: p, until: performance.now() + ms };
    return new Promise((r) => setTimeout(r, ms));
  }
  npc(id: string) {
    return this.npcs.get(id);
  }
  frame(id: string, frame: string) {
    const n = this.npcs.get(id);
    if (n) n.frame = frame;
  }
  moveNpc(id: string, x: number, y: number, ms = 800): Promise<void> {
    const n = this.npcs.get(id);
    if (!n) return Promise.resolve();
    return new Promise((done) => {
      if (x !== n.x) n.facing = x > n.x ? 1 : -1;
      this.tweens.push({ n, x0: n.x, y0: n.y, x1: x, y1: y, t0: performance.now(), ms, done });
    });
  }

  /* ------------------------------------------------------------ container panel */
  private panelItems(): string[] {
    const p = this.panel;
    if (!p) return [];
    return p.contents.filter((i) => !this.flags[`pn_${p.id}_${i}`]);
  }
  panelLeft(panelId: string, contents: string[]) {
    return contents.filter((i) => !this.flags[`pn_${panelId}_${i}`]);
  }
  openPanel(title: string, panelId: string, contents: string[]): Promise<void> {
    return new Promise((resolve) => {
      this.panel = { title, id: panelId, contents, resolve };
      this.emit();
    });
  }
  panelTake(item: string) {
    const p = this.panel;
    if (!p) return;
    this.flags[`pn_${p.id}_${item}`] = true;
    this.inv.push(item);
    audio.sfx("pickup");
    this.emit();
  }
  closePanel() {
    const p = this.panel;
    if (!p) return;
    this.panel = null;
    this.emit();
    p.resolve();
  }

  /* ------------------------------------------------------------ input */
  skip(): boolean {
    if (this.cardState && performance.now() - this.cardState.t0 > 500) {
      const c = this.cardState;
      this.cardState = null;
      c.resolve();
      return true;
    }
    if (this.speech) {
      const s = this.speech;
      this.speech = null;
      const n = this.npcs.get(s.who);
      if (n) n.talking = false;
      s.resolve();
      return true;
    }
    return false;
  }

  reveal(ms = 2600) {
    this.revealUntil = performance.now() + ms;
  }

  setVerb(v: Verb) {
    this.verb = v;
    this.sel = null;
    this.emit();
  }

  private primaryVerb(t: Thing): Verb {
    if (t.primary) return t.primary;
    if (t.exit) return "walk";
    if (t.npc) return "talk";
    return "look";
  }

  hoverAt(p: Pt | null) {
    const t = p ? this.thingAt(p) : null;
    if (t !== this.hover) {
      this.hover = t;
      this.emit();
    }
  }
  hoverInv(id: string | null) {
    if (this.hoverItem !== id) {
      this.hoverItem = id;
      this.emit();
    }
  }

  click(p: Pt, alt = false) {
    audio.unlock();
    if (this.screen !== "play") return;
    if (this.skip()) return;
    if (this.busy > 0 || this.choices || this.cardState || this.panel) return;
    const t = this.thingAt(p);
    if (!t) {
      this.sel = null;
      this.verb = "walk";
      this.emit();
      const poly = this.walkPoly();
      void this.walk(p.x, Math.max(p.y, poly.reduce((m, q) => Math.min(m, q.y), 9999)));
      return;
    }
    let verb = this.verb;
    if (alt) verb = t.npc ? "talk" : "look";
    else if (verb === "walk") verb = this.primaryVerb(t);
    const sel = this.sel;
    if (verb !== "use" && verb !== "give") this.sel = null;
    this.verb = "walk";
    this.hover = null;
    this.emit();
    void this.act(t, verb, verb === "use" || verb === "give" ? sel : null);
  }

  /** Perform a verb on a thing (public for tests). */
  async act(t: Thing, verb: Verb, sel: string | null) {
    this.busy++;
    this.emit();
    try {
      const needsWalk = verb !== "look" || !!t.exit;
      if (needsWalk) {
        const a = this.approach(t);
        await this.walk(a.x, a.y);
        const rt = t.npc ? this.npcs.get(t.id) : undefined;
        if (t.face) this.hero.facing = t.face;
        else {
          const tx = rt ? rt.x : t.hit ? t.hit[0] + t.hit[2] / 2 : t.x;
          this.hero.facing = tx >= this.hero.x ? 1 : -1;
        }
        if (rt && t.npc?.faceHero !== false && verb === "talk") rt.facing = this.hero.x >= rt.x ? 1 : -1;
      } else {
        const b = this.hitOf(t);
        const cx = b ? b.x + b.w / 2 : t.x;
        this.hero.facing = cx >= this.hero.x ? 1 : -1;
      }
      let r: Reaction | undefined;
      if (verb === "walk") {
        if (t.walk) r = t.walk;
        else if (t.exit) r = (g) => this.runExit(t, g);
      } else if ((verb === "use" || verb === "give") && sel) {
        r = verb === "give" ? t.give?.[sel] ?? t.useWith?.[sel] : t.useWith?.[sel] ?? t.give?.[sel];
        if (!r) r = verb === "give" ? (t.npc ? "Ich glaube nicht, dass das hier gebraucht wird." : pickOne(DEFAULTS.give)) : pickOne(DEFAULTS.use);
      } else if (verb === "give") {
        r = "Was soll ich denn geben? Erst einen Gegenstand wählen.";
      } else {
        r = t[verb as "look" | "take" | "use" | "talk"];
        if (!r) r = pickOne(DEFAULTS[verb]);
      }
      this.busy--;
      try {
        if (r) await this.run(r);
      } finally {
        this.busy++;
      }
    } finally {
      this.busy--;
      this.emit();
    }
  }

  private async runExit(t: Thing, _g: G) {
    const ex = t.exit!;
    const msg = await ex.guard?.(this);
    if (msg) {
      await this.say(msg);
      return;
    }
    audio.sfx("door");
    await this.goto(ex.to, ex.x, ex.y, ex.facing);
  }

  async run(r: Reaction) {
    if (typeof r === "string") {
      await this.say(r);
    } else {
      await r(this);
    }
  }

  clickItem(id: string) {
    audio.unlock();
    if (this.busy > 0 || this.screen !== "play" || this.panel) return;
    if ((this.verb === "use" || this.verb === "give") && this.sel && this.sel !== id) {
      if (this.verb === "give") {
        this.verb = "walk";
        this.sel = null;
        void this.run("Ich gebe mir selbst etwas? Wie großzügig.");
        return;
      }
      const key = [this.sel, id].sort().join("+");
      const r = this.world.combos[key];
      this.verb = "walk";
      this.sel = null;
      this.emit();
      void this.runBusy(r ?? "Das passt nicht zusammen.");
      return;
    }
    if (this.verb === "use" || this.verb === "give") {
      this.sel = id;
      this.emit();
      return;
    }
    if (this.verb === "look" || this.verb === "walk") {
      void this.runBusy(this.world.items[id]?.look ?? "Ein Gegenstand.");
      return;
    }
    this.sel = id;
    this.verb = "use";
    this.emit();
  }

  private async runBusy(r: Reaction) {
    this.busy++;
    this.emit();
    try {
      await this.run(r);
    } finally {
      this.busy--;
      this.emit();
    }
  }

  /** Speak the context hint for the current state. */
  showHint() {
    if (this.screen !== "play" || this.busy > 0 || this.choices || this.cardState || this.panel) return;
    audio.unlock();
    void this.runBusy(this.world.hint(this));
  }

  sentence() {
    if (this.busy > 0 && !this.choices) return "";
    let v = this.verb;
    const target = this.hover ? this.thingName(this.hover) : this.hoverItem && this.hoverItem !== this.sel ? this.itemName(this.hoverItem) : "";
    if (v === "walk" && this.hover) v = this.primaryVerb(this.hover);
    const label = tr({ walk: "Gehe zu", look: "Schau an", take: "Nimm", use: "Benutze", talk: "Rede mit", give: "Gib" }[v]);
    if (this.sel) {
      const prep = tr(this.verb === "give" ? "an" : "mit");
      return `${label} ${this.itemName(this.sel)} ${prep} ${target}`.trim();
    }
    return `${label} ${target}`.trim();
  }

  /* ------------------------------------------------------------ update */
  update(now: number) {
    const dt = Math.min(0.05, this.lastNow ? (now - this.lastNow) / 1000 : 0.016);
    this.lastNow = now;
    this.t += dt;
    for (const n of this.npcs.values()) n.t += dt;
    this.fx?.update(dt);
    // speech timeout
    if (this.speech && now > this.speech.until) {
      const s = this.speech;
      this.speech = null;
      const n = this.npcs.get(s.who);
      if (n) n.talking = false;
      s.resolve();
    }
    if (this.fadeTween) {
      const f = this.fadeTween;
      const k = Math.min(1, (now - f.t0) / f.ms);
      this.fadeA = f.from + (f.to - f.from) * k;
      if (k >= 1) {
        this.fadeTween = null;
        f.done();
      }
    }
    for (let i = this.tweens.length - 1; i >= 0; i--) {
      const tw = this.tweens[i];
      const k = Math.min(1, (now - tw.t0) / tw.ms);
      tw.n.x = tw.x0 + (tw.x1 - tw.x0) * k;
      tw.n.y = tw.y0 + (tw.y1 - tw.y0) * k;
      if (k >= 1) {
        this.tweens.splice(i, 1);
        tw.done();
      }
    }
    if (this.heroPose && now > this.heroPose.until) this.heroPose = null;
    // hero walking
    this.walking = false;
    if (this.path.length) {
      const target = this.path[0];
      const dx = target.x - this.hero.x;
      const dy = target.y - this.hero.y;
      const d = Math.hypot(dx, dy);
      const speed = 205 * this.scaleAt(this.hero.y);
      const step = speed * dt;
      if (d <= step) {
        this.hero.x = target.x;
        this.hero.y = target.y;
        this.path.shift();
        if (!this.path.length) {
          const done = this.walkDone;
          this.walkDone = null;
          done?.();
        }
      } else {
        this.hero.x += (dx / d) * step;
        this.hero.y += (dy / d) * step;
        if (Math.abs(dx) > 0.5) this.hero.facing = dx > 0 ? 1 : -1;
        this.walking = true;
        this.walkPhase += dt * 8.5;
      }
    }
  }

  /* ------------------------------------------------------------ drawing */
  private drawSprite(ctx: CanvasRenderingContext2D, kind: AssetKind, key: string, ax: number, ay: number, s: number, flip: boolean, alpha = 1) {
    const img = getImg(kind, key);
    const sz = logicalSize(kind, key);
    if (!img || !sz) return;
    const w = sz[0] * s;
    const h = sz[1] * s;
    ctx.save();
    if (alpha < 1) ctx.globalAlpha = alpha;
    ctx.translate(ax, ay);
    if (flip) ctx.scale(-1, 1);
    ctx.drawImage(img, -w / 2, -h, w, h);
    ctx.restore();
  }

  private heroFrame(): string {
    if (this.heroPose) return "bran_" + this.heroPose.key;
    if (this.walking) return WALK_CYCLE[Math.floor(this.walkPhase) % 4];
    return "bran_stand";
  }

  draw(ctx: CanvasRenderingContext2D, scale: number) {
    const now = performance.now();
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    if (now < this.shakeUntil) ctx.translate((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6);
    const bg = getImg("bg", this.scene.bg);
    if (bg) ctx.drawImage(bg, 0, 0, W, H);
    else {
      ctx.fillStyle = "#0a0808";
      ctx.fillRect(0, 0, W, H);
    }
    // world: things + hero sorted by depth
    type Item = { z: number; draw: () => void };
    const list: Item[] = [];
    const showHero = this.screen === "play" && !this.flags.heroHidden;
    for (const t of this.visible()) {
      const sp = this.spriteOf(t);
      if (!sp) continue;
      const rt = t.npc ? this.npcs.get(t.id) : undefined;
      const ay = rt ? rt.y : t.y;
      list.push({
        z: t.z ?? ay,
        draw: () => {
          const ax = rt ? rt.x : t.x;
          const s = (t.npc ? this.scaleAt(ay) : 1) * (t.scale ?? 1);
          const flip = rt ? rt.facing === -1 : !!t.flip;
          // ground shadow for npcs
          if (rt) {
            ctx.fillStyle = "rgba(0,0,0,0.32)";
            ctx.beginPath();
            ctx.ellipse(ax, ay - 1, 26 * s, 6 * s, 0, 0, Math.PI * 2);
            ctx.fill();
          }
          const bob = rt && !rt.talking && !t.npc?.pick ? Math.sin(rt.t * 1.7) * 0.8 : 0;
          this.drawSprite(ctx, sp.kind, sp.key, ax, ay + bob, s, flip);
        },
      });
    }
    if (showHero) {
      list.push({
        z: this.hero.y,
        draw: () => {
          const s = this.scaleAt(this.hero.y);
          ctx.fillStyle = "rgba(0,0,0,0.35)";
          ctx.beginPath();
          ctx.ellipse(this.hero.x, this.hero.y - 1, 30 * s, 7 * s, 0, 0, Math.PI * 2);
          ctx.fill();
          const talking = this.speech?.who === "hero";
          const bob = talking ? Math.sin(this.t * 14) * 0.8 : 0;
          this.drawSprite(ctx, "chars", this.heroFrame(), this.hero.x, this.hero.y + bob, s, this.hero.facing === -1);
        },
      });
    }
    list.sort((a, b) => a.z - b.z);
    for (const it of list) it.draw();
    // additive lights
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const t of this.visible()) {
      if (!t.light) continue;
      const rt = t.npc ? this.npcs.get(t.id) : undefined;
      const cx = rt ? rt.x : t.x;
      const cy = (rt ? rt.y : t.y) + (t.light.dy ?? -40);
      const fl = t.light.flicker ?? 0.12;
      const r = t.light.r * (1 + Math.sin(this.t * 9 + cx) * fl * 0.5 + Math.sin(this.t * 23 + cy) * fl * 0.5);
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, t.light.color);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    }
    ctx.restore();
    this.fx?.draw(ctx);
    ctx.restore();
    // darkness
    const dark = this.screen === "play" ? this.scene.dark?.(this) : undefined;
    if (dark && dark.amount > 0) this.drawDark(ctx, scale, dark.amount, dark.radius);
    this.drawUi(ctx, now);
  }

  private drawDark(ctx: CanvasRenderingContext2D, scale: number, amount: number, radius: number) {
    if (typeof document === "undefined") return;
    const c = (this.darkCanvas ??= document.createElement("canvas"));
    const cw = Math.round(W * scale);
    const ch = Math.round(H * scale);
    if (c.width !== cw || c.height !== ch) {
      c.width = cw;
      c.height = ch;
    }
    const d = c.getContext("2d")!;
    d.setTransform(scale, 0, 0, scale, 0, 0);
    d.globalCompositeOperation = "source-over";
    d.clearRect(0, 0, W, H);
    d.fillStyle = `rgba(2,4,10,${amount})`;
    d.fillRect(0, 0, W, H);
    d.globalCompositeOperation = "destination-out";
    const hole = (x: number, y: number, r: number, a = 1) => {
      const g = d.createRadialGradient(x, y, r * 0.15, x, y, r);
      g.addColorStop(0, `rgba(0,0,0,${a})`);
      g.addColorStop(0.6, `rgba(0,0,0,${a * 0.55})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      d.fillStyle = g;
      d.fillRect(x - r, y - r, r * 2, r * 2);
    };
    const fl = 1 + Math.sin(this.t * 11) * 0.04 + Math.sin(this.t * 27) * 0.03;
    hole(this.hero.x, this.hero.y - 70, radius * fl);
    for (const t of this.visible()) if (t.light) hole(t.x, t.y + (t.light.dy ?? -40), t.light.r * 1.1 * fl, 0.9);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(c, 0, 0);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
  }

  private drawUi(ctx: CanvasRenderingContext2D, now: number) {
    if (this.screen === "play") {
      this.drawGlints(ctx);
      this.drawExitHints(ctx);
      this.drawReveal(ctx, now);
      if (this.speech) this.drawSpeech(ctx, this.speech);
    }
    if (this.flashState) {
      const k = (now - this.flashState.t0) / this.flashState.ms;
      if (k >= 1) this.flashState = null;
      else {
        ctx.fillStyle = this.flashState.color;
        ctx.globalAlpha = (1 - k) * 0.7;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
    }
    if (this.fadeA > 0.001) {
      ctx.fillStyle = `rgba(4,3,6,${this.fadeA})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (this.cardState) this.drawCard(ctx, this.cardState, now);
  }

  private drawGlints(ctx: CanvasRenderingContext2D) {
    if (this.busy > 0 || this.cardState || this.panel) return;
    const k = (this.t % 4.4) / 1.2;
    if (k >= 1) return;
    const env = Math.sin(k * Math.PI);
    ctx.save();
    for (const t of this.visible()) {
      if (t.primary !== "take") continue;
      const b = this.boxOf(t) ?? this.hitOf(t);
      if (!b) continue;
      const cx = b.x + b.w / 2;
      const cy = b.y + b.h / 2;
      const r = 6 + 14 * env;
      ctx.globalAlpha = env;
      ctx.fillStyle = "#fff4c4";
      ctx.shadowColor = "#ffd75e";
      ctx.shadowBlur = 10;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const rr = i % 2 ? r * 0.22 : r;
        const a = (i * Math.PI) / 4;
        ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
      }
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  private drawExitHints(ctx: CanvasRenderingContext2D) {
    if (this.busy > 0) return;
    const pulse = 0.55 + Math.sin(this.t * 3) * 0.2;
    ctx.save();
    ctx.font = "600 22px Kanit, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const t of this.visible()) {
      if (!t.exit) continue;
      const b = this.hitOf(t);
      if (!b) continue;
      const cx = b.x + b.w / 2;
      const cy = Math.min(b.y + b.h - 38, b.y + b.h / 2 + 40);
      const arrow = cx < W * 0.2 ? "‹" : cx > W * 0.8 ? "›" : "⌃";
      ctx.globalAlpha = pulse * (this.hover === t ? 1.4 : 1);
      ctx.fillStyle = "#f4e6c4";
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 6;
      ctx.fillText(arrow, cx, cy);
    }
    ctx.restore();
  }

  private drawReveal(ctx: CanvasRenderingContext2D, now: number) {
    const left = this.revealUntil - now;
    if (left <= 0) return;
    ctx.save();
    ctx.globalAlpha = Math.min(1, left / 400);
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = "600 13px Kanit, sans-serif";
    const pulse = 1 + Math.sin(this.t * 6) * 0.15;
    for (const t of this.visible()) {
      if (t.decor || (t.z !== undefined && t.z < 0)) continue;
      const b = this.hitOf(t);
      if (!b) continue;
      const x = Math.max(24, Math.min(W - 24, b.x + b.w / 2));
      const y = Math.max(16, Math.min(H - 30, b.y + b.h / 2));
      ctx.beginPath();
      ctx.arc(x, y, 9 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = t.exit ? "rgba(120,220,255,0.35)" : "rgba(255,220,120,0.35)";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = t.exit ? "#9fe0ff" : "#ffe08a";
      ctx.stroke();
      const label = (t.exit ? "➜ " : "") + this.thingName(t);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(0,0,0,0.85)";
      ctx.strokeText(label, x, y + 12);
      ctx.fillStyle = "#fff";
      ctx.fillText(label, x, y + 12);
    }
    ctx.restore();
  }

  private speakerName(who: string) {
    if (who === "hero") return "Bran";
    const t = this.scene.things.find((x) => x.id === who);
    return t ? this.thingName(t) : "";
  }

  private drawSpeech(ctx: CanvasRenderingContext2D, s: NonNullable<Game["speech"]>) {
    let x = 480;
    let y = 70;
    if (s.who === "hero") {
      x = this.hero.x;
      y = this.hero.y - 131 * this.scaleAt(this.hero.y) - 14;
    } else {
      const t = this.scene.things.find((q) => q.id === s.who);
      const b = t ? this.boxOf(t) : null;
      if (b) {
        x = b.x + b.w / 2;
        y = b.y - 10;
      }
    }
    ctx.save();
    const fs = 19;
    ctx.font = `600 ${fs}px Kanit, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    const lines: string[] = [];
    let cur = "";
    const maxW = 400;
    for (const w of words(s.text)) {
      const test = cur + w;
      if (ctx.measureText(test.trimEnd()).width > maxW && cur) {
        lines.push(cur.trimEnd());
        cur = w.trimStart();
      } else cur = test;
    }
    if (cur) lines.push(cur.trimEnd());
    const lh = 24;
    let maxLine = 0;
    for (const l of lines) maxLine = Math.max(maxLine, ctx.measureText(l).width);
    const cx = Math.max(maxLine / 2 + 12, Math.min(W - maxLine / 2 - 12, x));
    const top = Math.max(lines.length * lh + 30, y);
    ctx.lineJoin = "round";
    const col = hashColor(s.who);
    const name = tr(this.speakerName(s.who));
    if (name) {
      ctx.font = `600 12px Kanit, sans-serif`;
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(0,0,0,0.92)";
      ctx.strokeText(name.toUpperCase(), cx, top - lines.length * lh - 2);
      ctx.fillStyle = col;
      ctx.globalAlpha = 0.75;
      ctx.fillText(name.toUpperCase(), cx, top - lines.length * lh - 2);
      ctx.globalAlpha = 1;
      ctx.font = `600 ${fs}px Kanit, sans-serif`;
    }
    for (let i = 0; i < lines.length; i++) {
      const ly = top - (lines.length - 1 - i) * lh;
      ctx.lineWidth = 5;
      ctx.strokeStyle = "rgba(0,0,0,0.94)";
      ctx.strokeText(lines[i], cx, ly);
      ctx.fillStyle = col;
      ctx.fillText(lines[i], cx, ly);
    }
    ctx.restore();
  }

  private drawCard(ctx: CanvasRenderingContext2D, c: NonNullable<Game["cardState"]>, now: number) {
    const k = Math.min(1, (now - c.t0) / 700);
    ctx.save();
    ctx.fillStyle = `rgba(4,3,6,${0.92 * k})`;
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = k;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const th = getLang() === "th";
    ctx.font = th ? `600 54px Kanit, sans-serif` : `64px "Pirata One", serif`;
    ctx.fillStyle = "#d8c08a";
    ctx.shadowColor = "rgba(200,60,30,0.55)";
    ctx.shadowBlur = 24;
    ctx.fillText(c.title, W / 2, H / 2 - 24, W - 60);
    ctx.shadowBlur = 0;
    if (c.sub) {
      ctx.font = `italic 400 24px Kanit, sans-serif`;
      ctx.fillStyle = "#b9a98a";
      ctx.fillText(c.sub, W / 2, H / 2 + 34, W - 80);
    }
    ctx.font = `400 14px Kanit, sans-serif`;
    ctx.fillStyle = `rgba(200,190,170,${0.4 + 0.3 * Math.sin(this.t * 3)})`;
    ctx.fillText(tr(this.touch ? "Tippen zum Fortfahren" : "Klicken zum Fortfahren"), W / 2, H - 40);
    ctx.restore();
  }
}

/* ------------------------------------------------------------ persistence helpers */
interface SaveState {
  scene: string;
  x: number;
  y: number;
  facing: Facing;
  inv: string[];
  flags: Flags;
}
export function loadSave(): SaveState | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? (JSON.parse(raw) as SaveState) : null;
  } catch {
    return null;
  }
}
export function hasSave() {
  return !!loadSave();
}
