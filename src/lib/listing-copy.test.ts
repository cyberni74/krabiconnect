import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  listingDescription,
  listingDescriptionEn,
  listingDescriptionTh,
  listingTitle,
  listingTitleEn,
  listingTitleTh,
} from "./listing-copy.ts";

describe("listing copy field pickers", () => {
  it("prefers camelCase titleEn / titleTh", () => {
    const row = { titleTh: "ขายมอเตอร์ไซค์", titleEn: "Motorcycle for sale" };
    assert.equal(listingTitleTh(row), "ขายมอเตอร์ไซค์");
    assert.equal(listingTitleEn(row), "Motorcycle for sale");
    assert.equal(listingTitle("en", row), "Motorcycle for sale");
    assert.equal(listingTitle("th", row), "ขายมอเตอร์ไซค์");
  });

  it("reads snake_case title_en / description_en when camelCase is empty", () => {
    const row = {
      title_th: "ล้างแอร์บ้าน",
      title_en: "Home air-con cleaning",
      description_th: "บริการล้างแอร์",
      description_en: "Air-con cleaning service",
    };
    assert.equal(listingTitle("en", row), "Home air-con cleaning");
    assert.equal(listingDescription("en", row), "Air-con cleaning service");
    assert.equal(listingTitle("th", row), "ล้างแอร์บ้าน");
    assert.equal(listingDescription("th", row), "บริการล้างแอร์");
  });

  it("falls back to Thai when the English field is missing or blank", () => {
    assert.equal(listingTitle("en", { titleTh: "ล้างแอร์บ้าน", titleEn: "" }), "ล้างแอร์บ้าน");
    assert.equal(listingTitle("en", { title_th: "ล้างแอร์บ้าน" }), "ล้างแอร์บ้าน");
    assert.equal(listingDescription("en", { descriptionTh: "รายละเอียด", descriptionEn: "   " }), "รายละเอียด");
  });

  it("keeps mixed English overlays that include Thai place names", () => {
    const row = {
      titleTh: "ล้างแอร์อ่าวนาง",
      titleEn: "Air-con cleaning in อ่าวนาง",
    };
    assert.equal(listingTitle("en", row), "Air-con cleaning in อ่าวนาง");
    assert.equal(listingTitle("th", row), "ล้างแอร์อ่าวนาง");
  });

  it("reads conversation listingTitleEn", () => {
    const row = { listingTitleTh: "บ้านเช่า", listingTitleEn: "House for rent" };
    assert.equal(listingTitleEn(row), "House for rent");
    assert.equal(listingTitle("en", row), "House for rent");
  });
});
