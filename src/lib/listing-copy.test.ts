import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { listingDescription, listingTitle } from "./listing-copy.ts";

describe("listing copy field pickers", () => {
  it("prefers camelCase titleEn on EN and Thai original on TH", () => {
    const row = { titleTh: "ขายมอเตอร์ไซค์", titleEn: "Motorcycle for sale" };
    assert.equal(listingTitle("en", row), "Motorcycle for sale");
    assert.equal(listingTitle("th", row), "ขายมอเตอร์ไซค์");
  });

  it("reads snake_case title_en when camelCase is empty", () => {
    const row = {
      title_th: "ล้างแอร์บ้าน",
      title_en: "Home air-con cleaning",
      description_th: "บริการล้างแอร์",
      description_en: "Air-con cleaning service",
    };
    assert.equal(listingTitle("en", row), "Home air-con cleaning");
    assert.equal(listingDescription("th", row), "บริการล้างแอร์");
  });

  it("falls back to Thai when English is blank", () => {
    assert.equal(listingTitle("en", { titleTh: "ล้างแอร์บ้าน", titleEn: "" }), "ล้างแอร์บ้าน");
  });
});
