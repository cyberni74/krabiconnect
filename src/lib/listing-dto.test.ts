import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { listingCopyFields, withListingCopy } from "./listing-dto.ts";

describe("listingCopyFields", () => {
  it("maps Neon snake_case title_en / description_en onto the client DTO", () => {
    const copy = listingCopyFields({
      title_th: "ล้างแอร์บ้าน",
      title_en: "Home air-con cleaning",
      description_th: "ล้างคอยล์",
      description_en: "Coil clean in Ao Nang",
    });
    assert.equal(copy.titleTh, "ล้างแอร์บ้าน");
    assert.equal(copy.titleEn, "Home air-con cleaning");
    assert.equal(copy.descriptionTh, "ล้างคอยล์");
    assert.equal(copy.descriptionEn, "Coil clean in Ao Nang");
  });

  it("keeps camelCase titleEn when already mapped", () => {
    const copy = listingCopyFields({
      titleTh: "สอนไทย",
      titleEn: "Thai lessons",
      descriptionTh: "คาเฟ่",
      descriptionEn: "At a cafe",
    });
    assert.equal(copy.titleEn, "Thai lessons");
    assert.equal(copy.descriptionEn, "At a cafe");
  });

  it("prefers nonempty camelCase over empty snake_case", () => {
    const copy = listingCopyFields({
      titleTh: "ล้างแอร์",
      title_th: "ล้างแอร์",
      titleEn: "Air-con cleaning in อ่าวนาง",
      title_en: "",
      descriptionTh: "รายละเอียด",
      description_th: "รายละเอียด",
      descriptionEn: "Weekly service",
      description_en: null,
    });
    assert.equal(copy.titleEn, "Air-con cleaning in อ่าวนาง");
    assert.equal(copy.descriptionEn, "Weekly service");
  });

  it("always emits string fields so JSON.stringify keeps the keys", () => {
    const json = JSON.stringify(listingCopyFields({ title_th: "สวัสดี" }));
    const parsed = JSON.parse(json) as Record<string, unknown>;
    assert.equal(parsed.titleTh, "สวัสดี");
    assert.equal(parsed.titleEn, "");
    assert.equal(parsed.descriptionTh, "");
    assert.equal(parsed.descriptionEn, "");
    assert.ok("titleEn" in parsed);
    assert.ok("descriptionEn" in parsed);
  });
});

describe("withListingCopy", () => {
  it("passes titleEn/descriptionEn through a feed card for Discover JSON", () => {
    const card = withListingCopy({
      id: "svc-ac",
      title_th: "ล้างแอร์บ้าน",
      title_en: "Home air-con cleaning",
      description_th: "ล้างคอยล์",
      description_en: "Coil clean",
    });
    const json = JSON.stringify(card);
    const parsed = JSON.parse(json) as Record<string, unknown>;
    assert.equal(parsed.titleEn, "Home air-con cleaning");
    assert.equal(parsed.descriptionEn, "Coil clean");
    assert.equal(parsed.titleTh, "ล้างแอร์บ้าน");
  });
});
