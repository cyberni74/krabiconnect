import type { Pt } from "./types";

/* ---------- geometry (walk polygon + shortest path) ---------- */
export function inside(p: Pt, poly: Pt[]) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}
export function nearestOnPoly(p: Pt, poly: Pt[]): Pt {
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
export function clear(a: Pt, b: Pt, poly: Pt[]) {
  const d = Math.hypot(b.x - a.x, b.y - a.y);
  const n = Math.max(2, Math.ceil(d / 5));
  for (let i = 1; i < n; i++) {
    const t = i / n;
    if (!inside({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }, poly)) return false;
  }
  return true;
}
export function findPath(from: Pt, to: Pt, poly: Pt[]): Pt[] {
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
