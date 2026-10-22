import { Game, type World } from "./engine";
import type { Verb } from "./types";

/** Headless test harness: plays scripts instantly. Used by tools/*.ts, never by the app. */
export class Harness {
  g: Game;
  log: string[] = [];
  picks: string[] = [];
  constructor(world: World) {
    const g = (this.g = new Game(world));
    g.screen = "play";
    g.say = async (text, who = "hero") => {
      this.log.push(`${who}: ${text}`);
    };
    g.fade = async () => {};
    g.wait = async () => {};
    g.pose = async () => {};
    g.card = async (t, s) => {
      this.log.push(`[CARD] ${t}${s ? " – " + s : ""}`);
    };
    g.flash = () => {};
    g.shake = () => {};
    g.walk = async (x, y) => {
      g.hero.x = x;
      g.hero.y = y;
    };
    g.walkTo = async (x, y) => {
      g.hero.x = x;
      g.hero.y = y;
      return true;
    };
    g.moveNpc = async (id, x, y) => {
      const n = g.npc(id);
      if (n) {
        n.x = x;
        n.y = y;
      }
    };
    g.choose = async (opts) => {
      const want = this.picks.shift();
      let i = -1;
      if (want !== undefined) {
        i = opts.findIndex((o) => o.toLowerCase().includes(want.toLowerCase()));
        if (i < 0) throw new Error(`choice "${want}" not in ${JSON.stringify(opts)}`);
      } else {
        i = opts.findIndex((o) => /^(auf wiedersehen|tschüss|genug|bis bald|ich gehe)/i.test(o));
        if (i < 0) throw new Error(`unscripted choice ${JSON.stringify(opts)}`);
      }
      this.log.push(`> ${opts[i]}`);
      return i;
    };
    g.openPanel = async (title, id, contents) => {
      this.log.push(`[PANEL ${id}] ${g.panelLeft(id, contents).join(",") || "(empty)"}`);
    };
  }

  /** Make sure we are in a scene (runs its enter script if we have to travel). */
  async at(sceneId: string) {
    if (this.g.scene.id !== sceneId) await this.g.goto(sceneId);
  }

  /** Perform a verb on a thing of the given scene. `picks` answers dialogue choices (substring match, in order). */
  async act(sceneId: string, thingId: string, verb: Verb, item?: string, picks: string[] = []) {
    await this.at(sceneId);
    const t = this.g.scene.things.find((x) => x.id === thingId);
    if (!t) throw new Error(`no thing ${thingId} in ${sceneId}`);
    if (t.hidden?.(this.g)) throw new Error(`thing ${thingId} is hidden in ${sceneId}`);
    if (item && !this.g.has(item)) throw new Error(`item ${item} not in inventory (${this.g.inv.join(",")})`);
    this.picks = [...picks];
    this.log.push(`## ${verb} ${thingId}${item ? " with " + item : ""}`);
    await this.g.act(t, verb, item ?? null);
    if (this.picks.length) throw new Error("unused picks " + this.picks.join("|"));
  }

  /** Take an item out of an opened container panel. */
  take(panelId: string, item: string) {
    const g = this.g;
    g.panel = { title: "", id: panelId, contents: [item], resolve: () => {} };
    g.panelTake(item);
    g.panel = null;
    this.log.push(`[TAKE ${item}]`);
  }

  /** Combine two inventory items. */
  async combine(a: string, b: string) {
    const r = this.g.world.combos[[a, b].sort().join("+")];
    if (!r) throw new Error(`no combo ${a}+${b}`);
    await this.g.run(r);
  }

  expectInv(...items: string[]) {
    for (const i of items) if (!this.g.has(i)) throw new Error(`expected ${i} in inventory: ${this.g.inv.join(",")}`);
  }
  expectNoInv(...items: string[]) {
    for (const i of items) if (this.g.has(i)) throw new Error(`did not expect ${i} in inventory`);
  }
  expectFlag(k: string, v: unknown = true) {
    if (this.g.flag(k) !== v) throw new Error(`expected flag ${k}=${String(v)}, got ${String(this.g.flag(k))}`);
  }
  expectScene(id: string) {
    if (this.g.scene.id !== id) throw new Error(`expected scene ${id}, in ${this.g.scene.id}`);
  }
}
