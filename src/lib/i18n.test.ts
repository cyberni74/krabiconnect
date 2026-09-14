import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { LOCALES, loc, localeFromLanguageTags, needsEnglishOverlay, t, isUsableEnglish } from "./i18n.ts";

describe("locale toggle mapping", () => {
  it("TH label is bound to locale th, EN to en", () => {
    assert.deepEqual(
      LOCALES.map((x) => [x.label, x.locale]),
      [
        ["TH", "th"],
        ["EN", "en"],
      ],
    );
  });

  it("Thai locale returns Thai chrome strings, English locale returns English", () => {
    assert.equal(t("th", "search"), "ค้นหา");
    assert.equal(t("en", "search"), "Search");
    assert.equal(t("th", "discover"), "ค้นพบ");
    assert.equal(t("en", "discover"), "Discover");
    assert.equal(t("th", "allAreas"), "กระบี่ทั้งหมด");
    assert.equal(t("en", "allAreas"), "All of Krabi");
  });
});

describe("default browser locale", () => {
  it("selects th when the primary language tag starts with th", () => {
    assert.equal(localeFromLanguageTags(["th"]), "th");
    assert.equal(localeFromLanguageTags(["th-TH"]), "th");
    assert.equal(localeFromLanguageTags(["th_TH"]), "th");
    assert.equal(localeFromLanguageTags(["th-TH", "en"]), "th");
  });

  it("selects en otherwise", () => {
    assert.equal(localeFromLanguageTags(["en"]), "en");
    assert.equal(localeFromLanguageTags(["en-US"]), "en");
    assert.equal(localeFromLanguageTags(["en-US", "th-TH"]), "en");
    assert.equal(localeFromLanguageTags(["de-DE"]), "en");
    assert.equal(localeFromLanguageTags([]), "en");
  });
});

describe("loc listing overlay", () => {
  it("TH shows Thai original, EN shows English overlay", () => {
    assert.equal(loc("th", "สวัสดี", "Hello"), "สวัสดี");
    assert.equal(loc("en", "สวัสดี", "Hello"), "Hello");
  });

  it("falls back to Thai when the English field is missing or blank", () => {
    assert.equal(loc("en", "ล้างแอร์บ้าน", ""), "ล้างแอร์บ้าน");
    assert.equal(loc("en", "ล้างแอร์บ้าน", "   "), "ล้างแอร์บ้าน");
    assert.equal(loc("th", "ล้างแอร์บ้าน", ""), "ล้างแอร์บ้าน");
    assert.equal(loc("th", "", "Hello"), "Hello");
  });

  it("shows titleEn on EN even when it includes Thai place names", () => {
    assert.equal(
      loc("en", "ล้างแอร์อ่าวนาง", "Air-con cleaning in อ่าวนาง"),
      "Air-con cleaning in อ่าวนาง",
    );
    assert.equal(loc("th", "ล้างแอร์อ่าวนาง", "Air-con cleaning in อ่าวนาง"), "ล้างแอร์อ่าวนาง");
  });

  it("flags missing English overlay when only Thai exists", () => {
    assert.equal(needsEnglishOverlay("ล้างแอร์บ้าน", "ล้างแอร์บ้าน"), true);
    assert.equal(needsEnglishOverlay("ล้างแอร์บ้าน", ""), true);
    assert.equal(needsEnglishOverlay("ล้างแอร์บ้าน", "Home air-con cleaning"), false);
    assert.equal(needsEnglishOverlay("ล้างแอร์อ่าวนาง", "Air-con cleaning in อ่าวนาง"), false);
  });

  it("treats mixed Latin + Thai place names as a usable English overlay", () => {
    assert.equal(isUsableEnglish("Air-con cleaning in อ่าวนาง"), true);
    assert.equal(isUsableEnglish("Home air-con cleaning"), true);
    assert.equal(isUsableEnglish("ล้างแอร์บ้าน"), false);
    assert.equal(isUsableEnglish(""), false);
  });
});
