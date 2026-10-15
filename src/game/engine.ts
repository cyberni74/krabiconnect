import { audio } from "./audio";
import { COMBOS, comboKey, itemName, ITEMS } from "./items";
import { drawPerson, FINN } from "./people";
import { CHAPTERS, SCENES, type ChapterDef } from "./scenes/index";
import type { ActorRuntime, Facing, Flags, G, Hotspot, Pt, Reaction, SceneDef, Verb } from "./types";
import { H, W } from "./types";


export interface SaveState {
  scene: string;
  x: number;
  y: number;
  facing: Facing;
  inv: string[];
  flags: Flags;
}

interface Speech {
  who: string;
  text: string;
  until: number;
  resolve: () => void;
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
  exits: ExitZone[];
  endText: string;
}

/** Big transparent tap target for a scene exit, in percent of the frame. */
export interface ExitZone {
  id: string;
  name: string;
  left: number;
  top: number;
  width: number;
  height: number;
  arrow: string;
}

const DEFAULTS: Record<Verb, string[]> = {
  walk: [""],
  look: ["Nichts Besonderes.", "Sieht genau so aus, wie es aussieht.", "Hm. Interessant. Nicht wirklich."],
  take: ["Das bekomme ich nicht.", "Das lasse ich lieber hier.", "Meine Taschen sind voll genug."],
  use: ["Das funktioniert so nicht.", "Wie soll das gehen?", "Netter Versuch, Finn."],
  talk: ["Es antwortet nicht. Vermutlich besser so.", "Ich glaube, das hört mir nicht zu."],
  give: ["Das will ich nicht hergeben.", "Ich glaube nicht, dass das hilft."],
};

const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];

/* ---------- geometry ---------- */
function inside(p: Pt, poly: Pt[]) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}
function nearestOnPoly(p: Pt, poly: Pt[]): Pt {
  let best = poly[0];
  let bd = Infinity;
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l));
    const q = { x: a.x + dx * t, y: a.y + dy * t };
    const d = (q.x - p.x) ** 2 + (q.y - p.y) ** 2;
    if (d < bd) {
      bd = d;
      best = q;
    }
  }
  // nudge inward
  for (const [dx, dy] of [[0, 0], [0, 2], [0, -2], [2, 0], [-2, 0], [2, 2], [-2, -2], [2, -2], [-2, 2], [0, 4], [0, -4]]) {
    const q = { x: best.x + dx, y: best.y + dy };
    if (inside(q, poly)) return q;
  }
  return best;
}
function clear(a: Pt, b: Pt, poly: Pt[]) {
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  const n = Math.max(2, Math.ceil(d / 5));
  for (let i = 1; i < n; i++) {
    const t = i / n;
    if (!inside({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }, poly)) return false;
  }
  return true;
}
function findPath(from: Pt, to: Pt, poly: Pt[]): Pt[] {
  const end = inside(to, poly) ? to : nearestOnPoly(to, poly);
  const start = inside(from, poly) ? from : nearestOnPoly(from, poly);
  if (clear(start, end, poly)) return [end];
  // inner-nudged vertices as graph nodes
  const nodes: Pt[] = [];
  for (const v of poly) {
    for (const [dx, dy] of [[3, 3], [-3, 3], [3, -3], [-3, -3], [0, 4], [0, -4], [4, 0], [-4, 0]]) {
      const q = { x: v.x + dx, y: v.y + dy };
      if (inside(q, poly)) {
        nodes.push(q);
        break;
      }
    }
  }
  const all = [start, ...nodes, end];
  const n = all.length;
  const dist = new Array(n).fill(Infinity);
  const prev = new Array<number>(n).fill(-1);
  const done = new Array(n).fill(false);
  dist[0] = 0;
  for (;;) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!done[i] && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0 || dist[u] === Infinity) break;
    if (u === n - 1) break;
    done[u] = true;
    for (let v = 0; v < n; v++) {
      if (done[v] || v === u) continue;
      if (!clear(all[u], all[v], poly)) continue;
      const nd = dist[u] + Math.hypot(all[v].x - all[u].x, all[v].y - all[u].y);
      if (nd < dist[v]) {
        dist[v] = nd;
        prev[v] = u;
      }
    }
  }
  if (prev[n - 1] < 0) return [end];
  const path: Pt[] = [];
  for (let c = n - 1; c > 0; c = prev[c]) path.unshift(all[c]);
  return path;
}

/* ---------- Game ---------- */
export class Game implements G {
  flags: Flags = {};
  inv: string[] = [];
  t = 0;
  hero: ActorRuntime = { id: "hero", x: 480, y: 380, facing: 1, talking: false, t: 0, scale: 1 };
  scene: SceneDef = SCENES.pier;
  chapter: ChapterDef = CHAPTERS.ch1;
  saveKey = CHAPTERS.ch1.key;
  actors = new Map<string, ActorRuntime>();
  private tweens: { a: ActorRuntime; x0: number; y0: number; x1: number; y1: number; t0: number; ms: number; done: () => void }[] = [];
  path: Pt[] = [];
  private walkDone: (() => void) | null = null;
  walkPhase = 0;
  verb: Verb = "walk";
  sel: string | null = null;
  hover: Hotspot | null = null;
  hoverItem: string | null = null;
  speech: Speech | null = null;
  choices: { options: string[]; resolve: (i: number) => void } | null = null;
  busy = 0;
  screen: "title" | "play" | "end" = "title";
  cardState: { title: string; sub?: string; t0: number; resolve: () => void } | null = null;
  fadeA = 0;
  private fadeTween: { from: number; to: number; t0: number; ms: number; done: () => void } | null = null;
  flashState: { color: string; t0: number; ms: number } | null = null;
  bg: HTMLCanvasElement | null = null;
  private bgKey = "";
  renderScale = 2;
  private listeners = new Set<() => void>();
  private ver = 0;
  private snap: UiSnapshot | null = null;
  mouse: Pt = { x: -1, y: -1 };
  /** Touch device: smart default verb, larger speech text. */
  touch = false;
  textScale = 1;
  revealUntil = 0;

  /* ---- UI subscription ---- */
  subscribe = (fn: () => void) => {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  };
  emit() {
    this.ver++;
    this.snap = null;
    for (const l of this.listeners) l();
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
      sceneTitle: this.scene.title,
      hasSave: hasSave(this.saveKey),
      muted: audio.muted,
      exits: this.exitZones(),
      endText: this.chapter.endText,
    };
    return this.snap;
  };

  private exitZones(): ExitZone[] {
    if (this.screen !== "play") return [];
    const out: ExitZone[] = [];
    for (const h of this.scene.hotspots) {
      if (!h.exit || h.hidden?.(this)) continue;
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      if (h.rect) {
        [x0, y0] = [h.rect[0], h.rect[1]];
        [x1, y1] = [x0 + h.rect[2], y0 + h.rect[3]];
      } else if (h.poly) {
        for (const p of h.poly) {
          x0 = Math.min(x0, p.x);
          y0 = Math.min(y0, p.y);
          x1 = Math.max(x1, p.x);
          y1 = Math.max(y1, p.y);
        }
      } else continue;
      // at least 90×90 logical px so it is easy to hit with a thumb
      const w = Math.min(W, Math.max(x1 - x0, 90));
      const hh = Math.min(H, Math.max(y1 - y0, 90));
      const cx = (x0 + x1) / 2;
      const cy = (y0 + y1) / 2;
      const x = Math.max(0, Math.min(W - w, cx - w / 2));
      const y = Math.max(0, Math.min(H - hh, cy - hh / 2));
      const arrow = cx < W * 0.2 ? "←" : cx > W * 0.8 ? "→" : "↑";
      out.push({ id: h.id, name: this.hsName(h), left: (x / W) * 100, top: (y / H) * 100, width: (w / W) * 100, height: (hh / H) * 100, arrow });
    }
    return out;
  }

  /** One tap on an exit zone walks there and changes the scene. */
  useExit(id: string) {
    audio.unlock();
    if (this.screen !== "play" || this.busy > 0 || this.choices || this.cardState) return;
    if (this.skip()) return;
    const h = this.scene.hotspots.find((x) => x.id === id && x.exit && !x.hidden?.(this));
    if (!h) return;
    this.verb = "walk";
    this.sel = null;
    this.hover = null;
    this.emit();
    void this.act(h, "walk", null);
  }

  sentence() {
    if (this.busy > 0 && !this.choices) return "";
    let v = this.verb;
    if (this.touch && v === "walk" && this.hover && !this.hover.exit) v = this.hover.actor ? "talk" : "look";
    const verbLabel = { walk: "Gehe zu", look: "Schau an", take: "Nimm", use: "Benutze", talk: "Rede mit", give: "Gib" }[v];
    const target = this.hover ? this.hsName(this.hover) : this.hoverItem && this.hoverItem !== this.sel ? itemName(this.hoverItem, this) : "";
    if (this.sel) {
      const prep = this.verb === "give" ? "an" : "mit";
      return `${verbLabel} ${itemName(this.sel, this)} ${prep} ${target}`.trim();
    }
    return `${verbLabel} ${target}`.trim();
  }

  hsName(h: Hotspot) {
    return typeof h.name === "function" ? h.name(this) : h.name;
  }

  /* ---- state API ---- */
  flag(k: string) {
    return this.flags[k];
  }
  set(k: string, v: number | boolean | string = true) {
    this.flags[k] = v;
    this.emit();
  }
  has(i: string) {
    return this.inv.includes(i);
  }
  add(i: string) {
    if (!this.inv.includes(i)) this.inv.push(i);
    this.emit();
  }
  remove(i: string) {
    this.inv = this.inv.filter((x) => x !== i);
    if (this.sel === i) this.sel = null;
    this.emit();
  }
  coins() {
    return Number(this.flags.coins ?? 0);
  }
  addCoins(n: number) {
    const c = Math.max(0, this.coins() + n);
    this.flags.coins = c;
    if (c > 0) this.add("muenzen");
    else this.remove("muenzen");
    this.emit();
  }

  /* ---- scripting primitives ---- */
  say(text: string, who = "hero"): Promise<void> {
    return new Promise((resolve) => {
      const ms = Math.max(1500, text.length * 55 + 900);
      this.speech = { who, text, until: performance.now() + ms, resolve };
      audio.blip(who);
    });
  }
  walk(x: number, y: number): Promise<void> {
    this.walkDone?.();
    this.path = findPath(this.hero, { x, y }, this.scene.walk);
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
  wait(ms: number) {
    return new Promise<void>((r) => setTimeout(r, ms));
  }
  choose(options: string[]): Promise<number> {
    return new Promise((resolve) => {
      this.choices = { options, resolve };
      this.emit();
    });
  }
  card(title: string, sub?: string): Promise<void> {
    return new Promise((resolve) => {
      this.cardState = { title, sub, t0: performance.now(), resolve };
    });
  }
  fade(to: 0 | 1, ms = 450): Promise<void> {
    return new Promise((done) => {
      this.fadeTween = { from: this.fadeA, to, t0: performance.now(), ms, done };
    });
  }
  flash(color: string, ms = 600) {
    this.flashState = { color, t0: performance.now(), ms };
  }
  actor(id: string) {
    return id === "hero" ? this.hero : this.actors.get(id);
  }
  moveActor(id: string, x: number, y: number, ms: number): Promise<void> {
    const a = this.actor(id);
    if (!a) return Promise.resolve();
    return new Promise((done) => {
      this.tweens.push({ a, x0: a.x, y0: a.y, x1: x, y1: y, t0: performance.now(), ms, done });
    });
  }
  refresh() {
    this.bgKey = "";
    this.emit();
  }
  sfx(name: Parameters<G["sfx"]>[0]) {
    audio.sfx(name);
    const buzz = { pickup: 20, coin: 15, fanfare: [30, 60, 30], magic: 40, wrong: [20, 40, 20], dig: 25, door: 0, splash: 10, horn: 80 }[name];
    try {
      if (buzz && typeof navigator !== "undefined") navigator.vibrate?.(buzz);
    } catch {
      /* unsupported */
    }
  }
  finish() {
    this.screen = "end";
    clearSave(this.saveKey);
    this.emit();
  }

  async goto(id: string, x?: number, y?: number, facing?: Facing) {
    const sc = SCENES[id];
    if (!sc) return;
    if (this.screen === "play") await this.fade(1, 350);
    this.enterScene(sc, x, y, facing);
    this.save();
    await this.fade(0, 400);
    if (sc.enter) await this.run(sc.enter);
  }

  enterScene(sc: SceneDef, x?: number, y?: number, facing?: Facing) {
    this.scene = sc;
    this.path = [];
    this.walkDone?.();
    this.walkDone = null;
    this.hover = null;
    this.actors.clear();
    for (const d of sc.actors ?? []) {
      const p = d.pos ? d.pos(this) : { x: d.x, y: d.y };
      this.actors.set(d.id, { id: d.id, x: p.x, y: p.y, facing: d.facing ?? 1, talking: false, t: 0, scale: d.scale ?? sc.scale(p.y) });
    }
    if (x !== undefined && y !== undefined) {
      this.hero.x = x;
      this.hero.y = y;
    }
    if (facing) this.hero.facing = facing;
    this.bgKey = "";
    audio.setAmbient(sc.ambient);
    this.emit();
  }

  async run(r: Reaction | undefined) {
    if (!r) return;
    this.busy++;
    this.emit();
    try {
      if (typeof r === "string") await this.say(r);
      else await r(this);
    } finally {
      this.busy--;
      this.emit();
    }
  }

  /* ---- save ---- */
  save() {
    if (this.screen !== "play") return;
    const s: SaveState = { scene: this.scene.id, x: this.hero.x, y: this.hero.y, facing: this.hero.facing, inv: this.inv, flags: this.flags };
    try {
      localStorage.setItem(this.saveKey, JSON.stringify(s));
    } catch {
      /* storage unavailable */
    }
  }
  /** Starts a chapter from its beginning (intro card, then the start scene). */
  setChapter(c: ChapterDef) {
    this.chapter = c;
    this.saveKey = c.key;
  }
  newGame() {
    this.flags = {};
    this.inv = [...this.chapter.inv];
    this.sel = null;
    this.verb = "walk";
    this.screen = "play";
    const c = this.chapter;
    this.enterScene(SCENES[c.start], c.x, c.y, c.facing);
    this.fadeA = 1;
    void this.run(async (g) => {
      await g.fade(0, 700);
      await c.intro(g);
    });
    this.save();
  }
  continueGame() {
    const s = loadSave(this.saveKey);
    if (!s || !SCENES[s.scene]) return this.newGame();
    this.flags = s.flags ?? {};
    this.inv = s.inv ?? [];
    this.sel = null;
    this.verb = "walk";
    this.screen = "play";
    this.enterScene(SCENES[s.scene], s.x, s.y, s.facing);
    this.fadeA = 1;
    void this.fade(0, 500);
  }
  toTitle() {
    this.save();
    this.screen = "title";
    this.speech?.resolve();
    this.speech = null;
    this.enterScene(SCENES[this.chapter.start], -200, 380);
    this.emit();
  }

  /* ---- input ---- */
  setVerb(v: Verb) {
    this.verb = v;
    this.sel = null;
    this.emit();
  }

  /** Smallest hotspot under the point wins, so details on top of big areas stay reachable. */
  hitTest(p: Pt): Hotspot | null {
    let best: Hotspot | null = null;
    let bestArea = Infinity;
    for (const h of this.scene.hotspots) {
      if (h.hidden?.(this)) continue;
      let area = Infinity;
      if (h.actor) {
        const a = this.actors.get(h.actor);
        const def = this.scene.actors?.find((d) => d.id === h.actor);
        if (!a || !def || def.hidden?.(this)) continue;
        const [bw, bh] = def.box ?? [56, 120];
        const w = bw * a.scale;
        const hh = bh * a.scale;
        if (p.x > a.x - w / 2 && p.x < a.x + w / 2 && p.y > a.y - hh && p.y < a.y + 4) area = w * hh;
      } else if (h.rect) {
        const [x, y, w, hh] = h.rect;
        if (p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + hh) area = w * hh;
      } else if (h.poly && inside(p, h.poly)) {
        const xs = h.poly.map((q) => q.x);
        const ys = h.poly.map((q) => q.y);
        area = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
      }
      if (area < bestArea) {
        bestArea = area;
        best = h;
      }
    }
    return best;
  }

  pointerMove(p: Pt) {
    this.mouse = p;
    const h = this.screen === "play" ? this.hitTest(p) : null;
    if (h !== this.hover) {
      this.hover = h;
      this.emit();
    }
  }

  reveal(ms = 2600) {
    this.revealUntil = performance.now() + ms;
  }

  private hotspotCenter(h: Hotspot): Pt | null {
    if (h.actor) {
      const a = this.actors.get(h.actor);
      const def = this.scene.actors?.find((d) => d.id === h.actor);
      if (!a || !def || def.hidden?.(this)) return null;
      return { x: a.x, y: a.y - ((def.box?.[1] ?? 120) * a.scale) / 2 };
    }
    if (h.rect) return { x: h.rect[0] + h.rect[2] / 2, y: h.rect[1] + h.rect[3] / 2 };
    if (h.poly) return { x: h.poly.reduce((s, p) => s + p.x, 0) / h.poly.length, y: h.poly.reduce((s, p) => s + p.y, 0) / h.poly.length };
    return null;
  }

  private drawReveal(ctx: CanvasRenderingContext2D) {
    const left = this.revealUntil - performance.now();
    if (left <= 0 || this.screen !== "play") return;
    const a = Math.min(1, left / 400);
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.font = `600 ${Math.round(13 * this.textScale)}px "Kanit", sans-serif`;
    const pulse = 1 + Math.sin(this.t * 6) * 0.15;
    for (const h of this.scene.hotspots) {
      if (h.hidden?.(this)) continue;
      const c = this.hotspotCenter(h);
      if (!c) continue;
      const x = Math.max(24, Math.min(W - 24, c.x));
      const y = Math.max(16, Math.min(H - 30, c.y));
      ctx.beginPath();
      ctx.arc(x, y, 9 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = h.exit ? "rgba(120,220,255,0.35)" : "rgba(255,220,120,0.35)";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = h.exit ? "#9fe0ff" : "#ffe08a";
      ctx.stroke();
      const label = (h.exit ? "➜ " : "") + this.hsName(h);
      ctx.lineWidth = 4;
      ctx.strokeStyle = "rgba(0,0,0,0.85)";
      ctx.strokeText(label, x, y + 12);
      ctx.fillStyle = "#fff";
      ctx.fillText(label, x, y + 12);
    }
    ctx.restore();
  }

  hoverInv(id: string | null) {
    if (this.hoverItem !== id) {
      this.hoverItem = id;
      this.emit();
    }
  }

  skip() {
    if (this.cardState && performance.now() - this.cardState.t0 > 600) {
      const c = this.cardState;
      this.cardState = null;
      c.resolve();
      return true;
    }
    if (this.speech) {
      const s = this.speech;
      this.speech = null;
      s.resolve();
      return true;
    }
    return false;
  }

  click(p: Pt, alt = false) {
    audio.unlock();
    if (this.screen !== "play") return;
    if (this.skip()) return;
    if (this.cardState || this.busy > 0) return;
    const h = this.hitTest(p);
    this.hover = h;
    if (!h) {
      this.sel = null;
      if (this.verb !== "walk") this.verb = "walk";
      this.emit();
      void this.walk(p.x, p.y);
      return;
    }
    let verb = this.verb;
    if (alt) verb = h.exit ? "walk" : h.actor ? "talk" : "look";
    else if (this.touch && verb === "walk" && !h.exit) verb = h.actor ? "talk" : "look";
    const sel = this.sel;
    this.verb = "walk";
    this.sel = null;
    this.emit();
    void this.act(h, verb, sel);
  }

  private async act(h: Hotspot, verb: Verb, sel: string | null) {
    this.busy++;
    this.emit();
    try {
      const needsWalk = verb !== "look" || h.exit;
      if (h.at && needsWalk) {
        await this.walk(h.at.x, h.at.y);
        if (h.face) this.hero.facing = h.face;
        else if (h.actor) {
          const a = this.actors.get(h.actor);
          if (a) this.hero.facing = a.x >= this.hero.x ? 1 : -1;
        }
      } else if (verb === "look") {
        const cx = h.rect ? h.rect[0] + h.rect[2] / 2 : h.actor ? this.actors.get(h.actor)?.x ?? this.hero.x : this.hero.x;
        this.hero.facing = cx >= this.hero.x ? 1 : -1;
      }
      let r: Reaction | undefined;
      if (verb === "walk") {
        r = h.walk;
      } else if ((verb === "use" || verb === "give") && sel) {
        r = verb === "give" ? h.give?.[sel] ?? h.useWith?.[sel] : h.useWith?.[sel] ?? h.give?.[sel];
        if (!r) r = verb === "give" ? (h.actor ? "Ich glaube nicht, dass das hier gebraucht wird." : pick(DEFAULTS.give)) : pick(DEFAULTS.use);
      } else if (verb === "give") {
        r = "Was soll ich denn geben? Erst einen Gegenstand wählen.";
      } else {
        r = h[verb];
        if (!r) r = pick(DEFAULTS[verb]);
      }
      this.busy--;
      if (r) await this.run(r);
      this.busy++;
    } finally {
      this.busy--;
      this.emit();
    }
  }

  clickItem(id: string) {
    audio.unlock();
    if (this.busy > 0 || this.screen !== "play") return;
    if ((this.verb === "use" || this.verb === "give") && this.sel && this.sel !== id) {
      if (this.verb === "give") {
        this.verb = "walk";
        this.sel = null;
        void this.run("Ich gebe mir selbst etwas? Wie großzügig.");
        return;
      }
      const key = comboKey(this.sel, id);
      this.verb = "walk";
      this.sel = null;
      void this.run(COMBOS[key] ?? pick(DEFAULTS.use));
      return;
    }
    if (this.verb === "use" || this.verb === "give") {
      this.sel = this.sel === id ? null : id;
      this.emit();
      return;
    }
    if (this.verb === "look" || this.verb === "walk") {
      this.verb = "walk";
      void this.run(itemLook(id));
      return;
    }
    const v = this.verb;
    this.verb = "walk";
    void this.run(v === "take" ? "Hab ich doch schon." : v === "talk" ? "Ich rede nicht mit Gegenständen. Nicht mehr." : pick(DEFAULTS.use));
  }

  choose_(i: number) {
    if (!this.choices) return;
    const c = this.choices;
    this.choices = null;
    this.emit();
    c.resolve(i);
  }

  /* ---- loop ---- */
  update(dt: number, now: number) {
    this.t += dt;
    this.hero.t = this.t;
    // tweens
    for (const tw of [...this.tweens]) {
      const k = Math.min(1, (now - tw.t0) / tw.ms);
      tw.a.x = tw.x0 + (tw.x1 - tw.x0) * k;
      tw.a.y = tw.y0 + (tw.y1 - tw.y0) * k;
      if (k >= 1) {
        this.tweens.splice(this.tweens.indexOf(tw), 1);
        tw.done();
      }
    }
    for (const a of this.actors.values()) {
      a.t = this.t;
      a.talking = this.speech?.who === a.id;
    }
    this.hero.talking = this.speech?.who === "hero";
    if (this.speech && now > this.speech.until) {
      const s = this.speech;
      this.speech = null;
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
    // walking
    if (this.path.length) {
      const target = this.path[0];
      const s = this.scene.scale(this.hero.y);
      const speed = 150 * s;
      const dx = target.x - this.hero.x;
      const dy = target.y - this.hero.y;
      const d = Math.hypot(dx, dy * 1.4);
      const step = speed * dt;
      if (Math.abs(dx) > 0.5) this.hero.facing = dx > 0 ? 1 : -1;
      if (d <= step) {
        this.hero.x = target.x;
        this.hero.y = target.y;
        this.path.shift();
        if (!this.path.length) {
          const r = this.walkDone;
          this.walkDone = null;
          r?.();
        }
      } else {
        this.hero.x += (dx / d) * step;
        this.hero.y += ((dy * 1.4) / d) * step / 1.4;
      }
      this.walkPhase = (this.walkPhase + dt * 1.6) % 1;
    }
    this.hero.scale = this.scene.scale(this.hero.y);
  }

  ensureBg() {
    const key = this.scene.id + "|" + (this.scene.staticKey?.(this) ?? "") + "|" + this.renderScale;
    if (this.bg && key === this.bgKey) return;
    if (typeof document === "undefined") return;
    const c = this.bg ?? document.createElement("canvas");
    c.width = W * this.renderScale;
    c.height = H * this.renderScale;
    const ctx = c.getContext("2d")!;
    ctx.setTransform(this.renderScale, 0, 0, this.renderScale, 0, 0);
    ctx.clearRect(0, 0, W, H);
    this.scene.paintStatic(ctx, this);
    this.bg = c;
    this.bgKey = key;
  }

  /** "world" = scenery and characters (goes through the pixel pass), "ui" = text and fades (kept sharp), "all" = both. */
  draw(ctx: CanvasRenderingContext2D, scale: number, layer: "world" | "ui" | "all" = "all") {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    if (layer !== "ui") this.drawWorld(ctx);
    if (layer !== "world") this.drawUi(ctx);
  }

  private drawWorld(ctx: CanvasRenderingContext2D) {
    this.ensureBg();
    if (this.bg) ctx.drawImage(this.bg, 0, 0, W, H);
    const t = this.t;
    this.scene.paintAnim?.(ctx, t, this);
    // actors sorted by depth
    const list: { y: number; draw: () => void }[] = [];
    for (const d of this.scene.actors ?? []) {
      if (d.hidden?.(this)) continue;
      const a = this.actors.get(d.id);
      if (!a) continue;
      if (!d.scale) a.scale = this.scene.scale(a.y);
      list.push({ y: a.y, draw: () => d.draw(ctx, a, this) });
    }
    if (this.screen === "play" && !this.flags.heroHidden) {
      list.push({
        y: this.hero.y,
        draw: () =>
          this.scene.hero
            ? this.scene.hero(ctx, this.hero, { walking: this.path.length > 0, phase: this.walkPhase, t }, this)
            : drawPerson(ctx, FINN, this.hero, { walk: this.path.length ? this.walkPhase : undefined, talking: this.hero.talking, t }),
      });
    }
    list.sort((a, b) => a.y - b.y);
    for (const l of list) l.draw();
    this.scene.paintFront?.(ctx, t, this);

    if (this.flashState) {
      const k = (performance.now() - this.flashState.t0) / this.flashState.ms;
      if (k >= 1) this.flashState = null;
      else {
        ctx.globalAlpha = 1 - k;
        ctx.fillStyle = this.flashState.color;
        ctx.fillRect(0, 0, W, H);
        ctx.globalAlpha = 1;
      }
    }
  }

  private drawUi(ctx: CanvasRenderingContext2D) {
    this.drawReveal(ctx);
    if (this.speech) this.drawSpeech(ctx, this.speech);
    if (this.fadeA > 0) {
      ctx.fillStyle = `rgba(4,6,10,${this.fadeA})`;
      ctx.fillRect(0, 0, W, H);
    }
    if (this.cardState) this.drawCard(ctx, this.cardState);
  }

  private speakerColor(who: string) {
    if (who === "hero") return "#ffffff";
    return this.scene.actors?.find((a) => a.id === who)?.color ?? "#ffd27a";
  }

  private drawSpeech(ctx: CanvasRenderingContext2D, s: Speech) {
    const a = this.actor(s.who);
    const def = this.scene.actors?.find((d) => d.id === s.who);
    const headH = def?.box?.[1] ?? 128;
    const x = a ? a.x : 480;
    const y = a ? a.y - headH * a.scale - 14 : 60;
    ctx.save();
    const ts = this.textScale;
    ctx.font = `600 ${Math.round(19 * ts)}px "Kanit", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    const words = s.text.split(" ");
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? cur + " " + w : w;
      if (ctx.measureText(test).width > Math.min(W - 40, 380 * ts) && cur) {
        lines.push(cur);
        cur = w;
      } else cur = test;
    }
    if (cur) lines.push(cur);
    const lh = Math.round(23 * ts);
    let maxW = 0;
    for (const l of lines) maxW = Math.max(maxW, ctx.measureText(l).width);
    const cx = Math.max(maxW / 2 + 12, Math.min(W - maxW / 2 - 12, x));
    const top = Math.max(lines.length * lh + 8, y);
    ctx.lineJoin = "round";
    for (let i = 0; i < lines.length; i++) {
      const ly = top - (lines.length - 1 - i) * lh;
      ctx.strokeStyle = "rgba(0,0,0,0.92)";
      ctx.lineWidth = 5 * ts;
      ctx.strokeText(lines[i], cx, ly);
      ctx.fillStyle = this.speakerColor(s.who);
      ctx.fillText(lines[i], cx, ly);
    }
    ctx.restore();
  }

  private drawCard(ctx: CanvasRenderingContext2D, c: NonNullable<Game["cardState"]>) {
    const k = Math.min(1, (performance.now() - c.t0) / 700);
    ctx.fillStyle = `rgba(5,7,12,${0.88 * k})`;
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.globalAlpha = k;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `64px "Pirata One", serif`;
    ctx.fillStyle = "#f2c76b";
    ctx.shadowColor = "rgba(255,170,60,0.6)";
    ctx.shadowBlur = 24;
    ctx.fillText(c.title, W / 2, H / 2 - 24);
    ctx.shadowBlur = 0;
    if (c.sub) {
      ctx.font = `italic 400 24px "Kanit", sans-serif`;
      ctx.fillStyle = "#e9dcc0";
      ctx.fillText(c.sub, W / 2, H / 2 + 34);
    }
    ctx.font = `400 14px "Kanit", sans-serif`;
    ctx.fillStyle = `rgba(233,220,192,${0.4 + 0.3 * Math.sin(this.t * 3)})`;
    ctx.fillText(this.touch ? "Tippen zum Fortfahren" : "Klicken zum Fortfahren", W / 2, H - 40);
    ctx.restore();
  }
}

function itemLook(id: string): Reaction {
  return async (g) => {
    const it = ITEMS[id];
    if (!it) return;
    if (id === "flasche") {
      g.remove("flasche");
      g.add("karteB");
      g.sfx("pickup");
      await g.say("Ich ziehe den Korken… Plopp! Ein Stück Papier.");
      await g.say("Die rechte Hälfte einer Schatzkarte! Ganz schön feucht, aber lesbar.");
      return;
    }
    if (id === "karte") g.set("readMap");
    await g.say(it.look);
  };
}

export function hasSave(key: string) {
  try {
    return !!localStorage.getItem(key);
  } catch {
    return false;
  }
}
function loadSave(key: string): SaveState | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as SaveState) : null;
  } catch {
    return null;
  }
}
function clearSave(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}
