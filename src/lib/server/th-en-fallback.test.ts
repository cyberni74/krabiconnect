import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isUsableEnglish, translateTextPublic } from "./th-en-fallback.ts";

describe("isUsableEnglish", () => {
  it("rejects empty, Thai script, and MyMemory quota warnings", () => {
    assert.equal(isUsableEnglish(""), false);
    assert.equal(isUsableEnglish("ล้างแอร์บ้าน"), false);
    assert.equal(isUsableEnglish("MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY"), false);
  });

  it("accepts English overlay copy", () => {
    assert.equal(isUsableEnglish("Home air-con cleaning"), true);
    assert.equal(isUsableEnglish("Honda PCX 160, Ao Nang"), true);
  });
});

describe("translateTextPublic without XAI", () => {
  it("uses MyMemory for Thai → English", async () => {
    const calls: string[] = [];
    const fetchImpl: typeof fetch = async (input) => {
      const url = String(input);
      calls.push(url);
      assert.match(url, /api\.mymemory\.translated\.net\/get/);
      assert.match(url, /langpair=th%7Cen/);
      return Response.json({
        responseStatus: 200,
        responseData: { translatedText: "Home AC cleaning" },
      });
    };
    const out = await translateTextPublic("ล้างแอร์บ้าน", "th", fetchImpl);
    assert.equal(out, "Home AC cleaning");
    assert.equal(calls.length, 1);
  });

  it("falls back to LibreTranslate when MyMemory fails", async () => {
    const hosts: string[] = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const url = String(input);
      hosts.push(url);
      if (url.includes("mymemory")) {
        return new Response("quota", { status: 429 });
      }
      assert.equal(init?.method, "POST");
      const body = JSON.parse(String(init?.body));
      assert.equal(body.source, "th");
      assert.equal(body.target, "en");
      return Response.json({ translatedText: "Motorbike for sale" });
    };
    const out = await translateTextPublic("ขายมอเตอร์ไซค์", "th", fetchImpl);
    assert.equal(out, "Motorbike for sale");
    assert.ok(hosts.some((h) => h.includes("mymemory")));
    assert.ok(hosts.some((h) => h.includes("libretranslate") || h.includes("argosopentech")));
  });

  it("returns null when public APIs echo Thai back", async () => {
    const fetchImpl: typeof fetch = async () =>
      Response.json({
        responseStatus: 200,
        responseData: { translatedText: "ขายมอเตอร์ไซค์" },
      });
    const out = await translateTextPublic("ขายมอเตอร์ไซค์", "th", fetchImpl);
    assert.equal(out, null);
  });

  it("passes through text that is already English", async () => {
    let called = 0;
    const fetchImpl: typeof fetch = async () => {
      called += 1;
      return new Response("nope", { status: 500 });
    };
    const out = await translateTextPublic("Honda Wave 110i", "th", fetchImpl);
    assert.equal(out, "Honda Wave 110i");
    assert.equal(called, 0);
  });
});
