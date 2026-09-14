import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { loc, t } from "./i18n.ts";

describe("i18n locale mapping", () => {
  it("TH locale returns Thai chrome copy", () => {
    assert.equal(t("th", "discover"), "ค้นพบ");
    assert.equal(t("th", "search"), "ค้นหา");
    assert.equal(t("th", "create"), "ลงประกาศ");
    assert.equal(t("th", "allAreas"), "กระบี่ทั้งหมด");
  });

  it("EN locale returns English chrome copy", () => {
    assert.equal(t("en", "discover"), "Discover");
    assert.equal(t("en", "search"), "Search");
    assert.equal(t("en", "create"), "Post");
    assert.equal(t("en", "allAreas"), "All of Krabi");
  });

  it("loc picks Thai text when locale is th and English when locale is en", () => {
    assert.equal(loc("th", "ไทย", "English"), "ไทย");
    assert.equal(loc("en", "ไทย", "English"), "English");
  });
});
