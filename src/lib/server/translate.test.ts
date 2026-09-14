import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { translateListing } from "./translate.ts";

const originalFetch = globalThis.fetch;
const originalKey = process.env.XAI_API_KEY;

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalKey === undefined) delete process.env.XAI_API_KEY;
  else process.env.XAI_API_KEY = originalKey;
});

describe("translateListing fallback without XAI", () => {
  it("seeds English overlay from MyMemory and keeps Thai originals", async () => {
    delete process.env.XAI_API_KEY;
    globalThis.fetch = async (input) => {
      const url = String(input);
      assert.doesNotMatch(url, /api\.x\.ai/);
      assert.match(url, /mymemory/);
      const q = new URL(url).searchParams.get("q") ?? "";
      const en = q.includes("ล้างแอร์") ? "Home AC cleaning" : "We clean home air-con units in Ao Nang.";
      return Response.json({
        responseStatus: 200,
        responseData: { translatedText: en },
      });
    };

    const out = await translateListing("ล้างแอร์บ้าน", "รับล้างแอร์บ้านที่อ่าวนาง", "th");
    assert.equal(out.titleTh, "ล้างแอร์บ้าน");
    assert.equal(out.descriptionTh, "รับล้างแอร์บ้านที่อ่าวนาง");
    assert.equal(out.titleEn, "Home AC cleaning");
    assert.match(out.descriptionEn, /air-con/i);
    assert.equal(/[\u0E00-\u0E7F]/.test(out.titleEn), false);
  });

  it("does not copy Thai into title_en when public MT fails", async () => {
    delete process.env.XAI_API_KEY;
    globalThis.fetch = async () => new Response("down", { status: 503 });
    const out = await translateListing("ขายมอเตอร์ไซค์", "ฮอนด้า 2019", "th");
    assert.equal(out.titleTh, "ขายมอเตอร์ไซค์");
    assert.equal(out.titleEn, "");
    assert.equal(out.descriptionTh, "ฮอนด้า 2019");
  });
});
