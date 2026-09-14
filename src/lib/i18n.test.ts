import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { LOCALES, loc, t } from "./i18n.ts";

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

describe("loc", () => {
  it("selects the Thai field when locale is th, English when locale is en", () => {
    assert.equal(loc("th", "สวัสดี", "Hello"), "สวัสดี");
    assert.equal(loc("en", "สวัสดี", "Hello"), "Hello");
  });

  it("unswaps columns when Thai copy was stored in the English field", () => {
    assert.equal(loc("th", "Hello", "สวัสดี"), "สวัสดี");
    assert.equal(loc("en", "Hello", "สวัสดี"), "Hello");
  });
});
