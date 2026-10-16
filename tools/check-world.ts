/* Static checker for the adventure world. Run: npm run check:world  (bundles with esbuild, runs in node) */
import { hasAsset } from "../src/adventure/assets";
import { inside, nearestOnPoly } from "../src/adventure/path";
import { Game } from "../src/adventure/engine";
import { world } from "../src/adventure/world";
import { ITEMS } from "../src/adventure/world/items";
import { H, W } from "../src/adventure/types";
import type { Pt, Thing } from "../src/adventure/types";

const errs: string[] = [];
const warns: string[] = [];
const err = (s: string) => errs.push(s);
const warn = (s: string) => warns.push(s);

const g = new Game(world);
const ids = new Set<string>();
for (const [sid, sc] of Object.entries(world.scenes)) {
  if (sc.id !== sid) err(`${sid}: id mismatch`);
  if (!hasAsset("bg", sc.bg)) err(`${sid}: missing bg ${sc.bg}`);
  g.flags = {};
  g.scene = sc;
  const poly = typeof sc.walk === "function" ? sc.walk(g) : sc.walk;
  const near = (p: Pt) => inside(p, poly) || Math.hypot(nearestOnPoly(p, poly).x - p.x, nearestOnPoly(p, poly).y - p.y) < 30;
  const seen = new Set<string>();
  const hasExit = sc.things.some((t) => t.exit);
  if (!hasExit) warn(`${sid}: no exit at all`);
  for (const t of sc.things as Thing[]) {
    const where = `${sid}/${t.id}`;
    if (seen.has(t.id)) err(`${where}: duplicate thing id`);
    seen.add(t.id);
    // sprites
    const spriteKeys: string[] = [];
    if (t.npc) for (const k of Object.values(t.npc.frames)) if (!hasAsset("chars", k)) err(`${where}: missing char frame ${k}`);
    if (typeof t.sprite === "string" && !hasAsset(t.dir ?? "props", t.sprite)) err(`${where}: missing sprite ${t.sprite}`);
    if (typeof t.sprite === "function") {
      // probe a few flag states to find missing keys
      for (const probe of [{}, { open: 1 }]) {
        g.flags = probe;
        const s = t.sprite(g);
        if (s) spriteKeys.push(s);
      }
      g.flags = {};
      for (const k of spriteKeys) if (!hasAsset(t.dir ?? "props", k)) err(`${where}: missing sprite ${k}`);
    }
    // geometry
    const hit = t.hit;
    if (hit && (hit[0] < -2 || hit[1] < -2 || hit[0] + hit[2] > W + 2 || hit[1] + hit[3] > H + 2)) warn(`${where}: hit rect outside scene ${JSON.stringify(hit)}`);
    if (!t.decor && !hit && !t.sprite && !t.npc) err(`${where}: no sprite and no hit rect`);
    const at = t.at ?? (t.npc ? { x: t.x, y: t.y } : { x: t.x, y: t.y + 10 });
    if (!t.decor && !near(at)) warn(`${where}: approach point ${Math.round(at.x)},${Math.round(at.y)} is not on the floor`);
    if (t.npc && !inside({ x: t.x, y: t.y }, poly)) warn(`${where}: npc stands outside the walk area (${t.x},${t.y})`);
    if (t.exit) {
      if (!world.scenes[t.exit.to]) err(`${where}: exit to unknown scene ${t.exit.to}`);
      else if (t.exit.x !== undefined && t.exit.y !== undefined) {
        const tgt = world.scenes[t.exit.to];
        const tp = typeof tgt.walk === "function" ? tgt.walk(g) : tgt.walk;
        if (!inside({ x: t.exit.x, y: t.exit.y }, tp)) warn(`${where}: arrival point ${t.exit.x},${t.exit.y} is outside the walk area of ${t.exit.to}`);
      }
    }
    if (!t.decor && !t.look && !t.exit && !t.npc) warn(`${where}: no look text`);
    if (typeof t.name === "string" && !t.decor && !t.name) err(`${where}: empty name`);
    ids.add(`${sid}/${t.id}`);
  }
  // overlapping hit rects between non-decor things (info only for the same-size case)
}
for (const [id, def] of Object.entries(world.items)) {
  if (!hasAsset("items", id)) err(`item ${id}: missing icon`);
  if (!def.look) err(`item ${id}: no look`);
}
for (const k of Object.keys(world.combos)) {
  const [a, b] = k.split("+");
  if (!world.items[a] || !world.items[b]) err(`combo ${k}: unknown item`);
  if (a > b) err(`combo ${k}: ids must be sorted`);
}
for (const [n, s] of Object.entries(world.starts)) {
  if (!world.scenes[s.scene]) warn(`chapter ${n} start scene "${s.scene}" does not exist yet`);
  for (const i of s.inv) if (!world.items[i]) err(`chapter ${n} start inventory has unknown item ${i}`);
}
console.log(`scenes: ${Object.keys(world.scenes).length}, things: ${ids.size}, items: ${Object.keys(world.items).length}`);
for (const w of warns) console.log("WARN ", w);
for (const e of errs) console.log("ERROR", e);
console.log(errs.length ? `${errs.length} errors` : "world OK");
process.exit(errs.length ? 1 : 0);
