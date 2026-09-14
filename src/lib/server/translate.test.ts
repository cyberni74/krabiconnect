import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { listingPairFromTranslation, translateListingFallback } from "./th-en-fallback.ts";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("listingPairFromTranslation without XAI", () => {
  it("keeps Thai originals and writes English overlay only", () => {
    const out = listingPairFromTranslation("ล้างแอร์บ้าน", "รับล้างแอร์", "th", {
      title: "Home AC cleaning",
      description: "We clean air-con units",
    });
    assert.equal(out.titleTh, "ล้างแอร์บ้าน");
    assert.equal(out.descriptionTh, "รับล้างแอร์");
    assert.equal(out.titleEn, "Home AC cleaning");
    assert.equal(out.descriptionEn, "We clean air-con units");
  });

  it("does not copy Thai into title_en when translation is missing", () => {
    const out = listingPairFromTranslation("ขายมอเตอร์ไซค์", "ฮอนด้า 2019", "th", null);
    assert.equal(out.titleTh, "ขายมอเตอร์ไซค์");
    assert.equal(out.titleEn, "");
    assert.equal(out.descriptionTh, "ฮอนด้า 2019");
    assert.equal(out.descriptionEn, "");
  });
});

describe("translateListingFallback without XAI", () => {
  it("seeds English overlay from MyMemory and keeps Thai originals", async () => {
    globalThis.fetch = async (input) => {
      const url = String(input);
      assert.doesNotMatch(url, /api\.x\.ai/);
      assert.match(url, /mymemory/);
      const q = new URL(url).searchParams.get("q") ?? "";
      const en = q.includes("ล้างแอร์")
        ? "Home AC cleaning"
        : "We clean home air-con units in Ao Nang.";
      return Response.json({
        responseStatus: 200,
        responseData: { translatedText: en },
      });
    };

    const out = await translateListingFallback("ล้างแอร์บ้าน", "รับล้างแอร์บ้านที่อ่าวนาง", "th");
    assert.equal(out.titleTh, "ล้างแอร์บ้าน");
    assert.equal(out.descriptionTh, "รับล้างแอร์บ้านที่อ่าวนาง");
    assert.equal(out.titleEn, "Home AC cleaning");
    assert.equal(/[\u0E00-\u0E7F]/.test(out.titleEn), false);
    assert.equal(/[\u0E00-\u0E7F]/.test(out.descriptionEn), false);
    assert.ok(out.descriptionEn.length > 0);
  });

  it("does not copy Thai into title_en when public MT fails", async () => {
    globalThis.fetch = async () => new Response("down", { status: 503 });
    const out = await translateListingFallback("ขายมอเตอร์ไซค์", "ฮอนด้า 2019", "th");
    assert.equal(out.titleTh, "ขายมอเตอร์ไซค์");
    assert.equal(out.titleEn, "");
    assert.equal(out.descriptionTh, "ฮอนด้า 2019");
  });
});
