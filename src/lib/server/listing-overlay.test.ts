import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  assertEnglishOverlayField,
  hasAgentListingPatch,
  overlayRowFromClient,
  overlaySource,
  parseAgentListingPatch,
} from "./listing-overlay.ts";

describe("overlaySource", () => {
  it("plans a fill when title_en is missing or still Thai", () => {
    const missing = overlaySource({
      id: "1",
      title_th: "ล้างแอร์บ้าน",
      title_en: "ล้างแอร์บ้าน",
      description_th: "บริการล้างแอร์",
      description_en: "บริการล้างแอร์",
    });
    assert.equal(missing.skip, false);
    assert.equal(missing.alreadyEnglish, false);
    assert.equal(missing.thaiTitle, "ล้างแอร์บ้าน");
    assert.equal(missing.restoreThaiSource, false);
  });

  it("skips when title_en is already English and restores swapped Thai", () => {
    const ready = overlaySource({
      id: "2",
      title_th: "ล้างแอร์บ้าน",
      title_en: "Home AC cleaning",
      description_th: "บริการล้างแอร์",
      description_en: "AC cleaning service",
    });
    assert.equal(ready.skip, true);
    assert.equal(ready.alreadyEnglish, true);

    const swapped = overlaySource({
      id: "3",
      title_th: "Home AC cleaning",
      title_en: "ล้างแอร์บ้าน",
      description_th: "AC cleaning",
      description_en: "บริการล้างแอร์",
    });
    assert.equal(swapped.skip, false);
    assert.equal(swapped.restoreThaiSource, true);
    assert.equal(swapped.thaiTitle, "ล้างแอร์บ้าน");
  });
});

describe("parseAgentListingPatch", () => {
  it("reads titleEn/descriptionEn without requiring images", () => {
    const patch = parseAgentListingPatch({
      titleEn: "Honda PCX 160",
      descriptionEn: "Ao Nang scooter",
    });
    assert.equal(patch.titleEn, "Honda PCX 160");
    assert.equal(patch.descriptionEn, "Ao Nang scooter");
    assert.equal(patch.images, undefined);
    assert.equal(hasAgentListingPatch(patch), true);
  });

  it("accepts snake_case aliases and translate: true", () => {
    const snake = parseAgentListingPatch({ title_en: "Hello", description_en: "There" });
    assert.equal(snake.titleEn, "Hello");
    assert.equal(parseAgentListingPatch({ translate: true }).translate, true);
    assert.equal(hasAgentListingPatch({}), false);
    assert.equal(hasAgentListingPatch({ images: ["https://cdn.example/a.jpg"] }), true);
  });

  it("rejects Thai script in English overlay fields", () => {
    assert.throws(() => assertEnglishOverlayField("titleEn", "ล้างแอร์บ้าน"), /must be English/);
    assert.doesNotThrow(() => assertEnglishOverlayField("titleEn", "Home AC cleaning"));
  });

  it("maps client listing text onto an overlay row without touching Thai later", () => {
    const row = overlayRowFromClient({
      id: "abc",
      titleTh: "ขายรถ",
      titleEn: "",
      descriptionTh: "รถบ้าน",
      descriptionEn: "",
    });
    assert.equal(row.title_th, "ขายรถ");
    assert.equal(row.title_en, "");
  });
});
