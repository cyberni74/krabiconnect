// Lists every visitor-facing source string ({ de, en }) of the Secret Islands page.
// Run: node --experimental-strip-types src/components/secret-islands/i18n/extract.ts [--missing]
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as content from "../content.ts";
import ja from "./ja.ts";
import ko from "./ko.ts";
import zh from "./zh.ts";

type Pair = { de: string; en: string };
const pairs = new Map<string, string>();

function walk(v: unknown) {
  if (Array.isArray(v)) return v.forEach(walk);
  if (!v || typeof v !== "object") return;
  const o = v as Record<string, unknown>;
  if (typeof o.de === "string" && typeof o.en === "string") pairs.set(o.de, o.en);
  else if (Array.isArray(o.de) && Array.isArray(o.en)) o.de.forEach((d, i) => pairs.set(String(d), String((o.en as unknown[])[i])));
  Object.values(o).forEach(walk);
}
walk(Object.values(content));

// Inline t({ de, en }) literals in components (operator-only tOp(...) texts are skipped).
const dir = join(dirname(fileURLToPath(import.meta.url)), "..");
const re = /(tOp\(\s*)?\{\s*de:\s*("(?:[^"\\]|\\.)*"),\s*en:\s*("(?:[^"\\]|\\.)*"),?\s*\}/g;
for (const f of readdirSync(dir).filter((f) => f.endsWith(".tsx"))) {
  for (const m of readFileSync(join(dir, f), "utf8").matchAll(re)) {
    if (!m[1]) pairs.set(JSON.parse(m[2]), JSON.parse(m[3]));
  }
}

// Brand / proper names identical in all languages need no entry.
const list: Pair[] = [...pairs].map(([de, en]) => ({ de, en })).filter((p) => p.de !== p.en || /[a-zäöü]{3}/i.test(p.de) && !/^[A-Z0-9][\w&.\- ]*$/.test(p.de));

if (process.argv.includes("--missing")) {
  let bad = 0;
  for (const [name, dict] of Object.entries({ zh, ko, ja })) {
    const missing = list.filter((p) => !(p.de in dict));
    const extra = Object.keys(dict).filter((k) => !pairs.has(k));
    if (missing.length || extra.length) bad++;
    console.log(`${name}: ${list.length - missing.length}/${list.length} translated, ${missing.length} missing, ${extra.length} stale`);
    missing.slice(0, 5).forEach((p) => console.log("   missing:", p.de));
    extra.slice(0, 5).forEach((k) => console.log("   stale:", k));
  }
  process.exit(bad ? 1 : 0);
} else {
  console.log(JSON.stringify(list, null, 1));
}
