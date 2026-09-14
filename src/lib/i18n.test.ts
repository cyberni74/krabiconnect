import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { LOCALES, loc, localeFromLanguageTags, needsEnglishOverlay, parseStoredLocale, t } from "./i18n.ts";

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

  it("keeps Thai original when columns were stored swapped", () => {
    assert.equal(loc("th", "Hello", "สวัสดี"), "สวัสดี");
    assert.equal(loc("en", "Hello", "สวัสดี"), "Hello");
  });

  it("flags missing English overlay when only Thai exists", () => {
    assert.equal(needsEnglishOverlay("ล้างแอร์บ้าน", "ล้างแอร์บ้าน"), true);
    assert.equal(needsEnglishOverlay("ล้างแอร์บ้าน", ""), true);
    assert.equal(needsEnglishOverlay("ล้างแอร์บ้าน", "Home air-con cleaning"), false);
  });
});

describe("km_locale persistence", () => {
  it("reads a plain th/en value", () => {
    assert.equal(parseStoredLocale("th"), "th");
    assert.equal(parseStoredLocale("en"), "en");
    assert.equal(parseStoredLocale("de"), null);
    assert.equal(parseStoredLocale(null), null);
  });

  it("migrates the legacy zustand persist blob", () => {
    assert.equal(parseStoredLocale(JSON.stringify({ state: { lang: "th", locked: true }, version: 0 })), "th");
    assert.equal(parseStoredLocale(JSON.stringify({ lang: "en" })), "en");
  });
});
