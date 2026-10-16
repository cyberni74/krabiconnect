// Collects German story strings from the world files (superset; ids/flags are filtered out) -> stdout JSON array.
import ts from "typescript";
import { readFileSync, readdirSync } from "node:fs";
const dir = "src/adventure/world/";
const out = new Set<string>();
for (const f of readdirSync(dir).filter((x) => x.endsWith(".ts"))) {
  const sf = ts.createSourceFile(f, readFileSync(dir + f, "utf8"), ts.ScriptTarget.Latest, true);
  const visit = (n: ts.Node) => {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      const t = n.text;
      if (/^[a-z0-9_:.\-/]+$/.test(t) || /^(#|rgb|\/)/.test(t)) return;
      if (!/[A-Za-zÄÖÜäöüß]{2}/.test(t)) return;
      if (!/\s/.test(t) && !/^[A-ZÄÖÜ]/.test(t)) return;
      out.add(t);
    }
    ts.forEachChild(n, visit);
  };
  visit(sf);
}
console.log(JSON.stringify([...out], null, 0));
