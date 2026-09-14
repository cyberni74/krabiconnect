import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { englishOverlayPatch, listingNeedsEnglish, mergeOverlay } from "./english-overlay.ts";
import { listingDescription, listingTitle } from "./listing-copy.ts";
import { loc, needsEnglishOverlay } from "./i18n.ts";

describe("forced EN overlay cache patch", () => {
  it("uses existing nonempty English and does not request a fill", () => {
    const row = {
      titleTh: "ขายมอเตอร์ไซค์",
      titleEn: "Motorcycle for sale",
      descriptionTh: "รถสภาพดี",
      descriptionEn: "Good condition",
    };
    assert.equal(listingNeedsEnglish(row), false);
    assert.equal(englishOverlayPatch(row, { titleEn: "Other", descriptionEn: "Other" }), null);
  });

  it("fills English when the EN field is missing or a Thai duplicate", () => {
    const missing = {
      titleTh: "ล้างแอร์บ้าน",
      titleEn: "",
      descriptionTh: "บริการล้างแอร์",
      descriptionEn: "บริการล้างแอร์",
    };
    assert.equal(listingNeedsEnglish(missing), true);
    const patch = englishOverlayPatch(missing, {
      titleEn: "Home air-con cleaning",
      descriptionEn: "Air-con cleaning service",
    });
    assert.deepEqual(patch, {
      titleEn: "Home air-con cleaning",
      descriptionEn: "Air-con cleaning service",
    });
  });

  it("rejects a Thai-only translation so Thai columns are not used as EN cache", () => {
    const row = {
      titleTh: "ล้างแอร์บ้าน",
      titleEn: "",
      descriptionTh: "บริการล้างแอร์",
      descriptionEn: "",
    };
    assert.equal(
      englishOverlayPatch(row, { titleEn: "ล้างแอร์บ้าน", descriptionEn: "บริการล้างแอร์" }),
      null,
    );
  });

  it("keeps mixed English with Thai place names as a cached overlay", () => {
    const row = {
      titleTh: "ล้างแอร์อ่าวนาง",
      titleEn: "",
      descriptionTh: "",
      descriptionEn: "",
    };
    const patch = englishOverlayPatch(row, {
      titleEn: "Air-con cleaning in อ่าวนาง",
      descriptionEn: "Service in Ao Nang",
    });
    assert.equal(patch?.titleEn, "Air-con cleaning in อ่าวนาง");
  });

  it("never implies a Thai-column write — patch only has EN fields", () => {
    const patch = englishOverlayPatch(
      { titleTh: "บ้านเช่า", titleEn: "", descriptionTh: "ใกล้ทะเล", descriptionEn: "" },
      { titleEn: "House for rent", descriptionEn: "Near the sea" },
    );
    assert.deepEqual(Object.keys(patch ?? {}).sort(), ["descriptionEn", "titleEn"]);
  });

  it("merges cached overlay onto a feed card without touching Thai", () => {
    const card = {
      titleTh: "บ้านเช่า",
      titleEn: "",
      descriptionTh: "ใกล้ทะเล",
      descriptionEn: "",
    };
    const merged = mergeOverlay(card, { titleEn: "House for rent", descriptionEn: "Near the sea" });
    assert.equal(merged.titleTh, "บ้านเช่า");
    assert.equal(merged.descriptionTh, "ใกล้ทะเล");
    assert.equal(merged.titleEn, "House for rent");
    assert.equal(loc("en", merged.titleTh, merged.titleEn), "House for rent");
    assert.equal(loc("th", merged.titleTh, merged.titleEn), "บ้านเช่า");
    assert.equal(listingTitle("en", merged), "House for rent");
    assert.equal(listingDescription("th", merged), "ใกล้ทะเล");
  });
});

describe("needsEnglishOverlay", () => {
  it("is true only when Thai exists and EN is empty or a copy", () => {
    assert.equal(needsEnglishOverlay("ล้างแอร์บ้าน", "ล้างแอร์บ้าน"), true);
    assert.equal(needsEnglishOverlay("ล้างแอร์บ้าน", ""), true);
    assert.equal(needsEnglishOverlay("ล้างแอร์บ้าน", "Home air-con cleaning"), false);
    assert.equal(needsEnglishOverlay("ล้างแอร์อ่าวนาง", "Air-con cleaning in อ่าวนาง"), false);
  });
});
