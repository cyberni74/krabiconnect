import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import assert from "node:assert/strict";

describe("listing image CSP", () => {
  it("allows public Vercel Blob hosts on img-src", () => {
    const vercel = readFileSync(new URL("../../vercel.json", import.meta.url), "utf8");
    const root = readFileSync(new URL("../routes/__root.tsx", import.meta.url), "utf8");
    for (const src of [vercel, root]) {
      assert.match(src, /img-src/);
      assert.match(src, /https:\/\/\*\.public\.blob\.vercel-storage\.com/);
      assert.match(src, /https:\/\/\*\.blob\.vercel-storage\.com/);
    }
  });
});
