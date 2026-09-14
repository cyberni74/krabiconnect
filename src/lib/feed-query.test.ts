import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { FeedCard } from "./types.ts";
import {
  HOME_FEED_LIMIT,
  applyFeedFilters,
  feedLimitFor,
  isPublicListingStatus,
  knownDistrictId,
  mergeNewest,
} from "./feed-query.ts";

function card(partial: Partial<FeedCard> & Pick<FeedCard, "id" | "kind">): FeedCard {
  return {
    userId: "u1",
    titleTh: partial.titleTh ?? "ชื่อ",
    titleEn: partial.titleEn ?? "Title",
    descriptionTh: "",
    descriptionEn: "",
    category: partial.category ?? "other",
    type: partial.type ?? "offer",
    pricingType: "sale",
    price: 100,
    deposit: null,
    status: partial.status ?? "active",
    images: [],
    tasks: [],
    district: partial.district ?? "krabi-town",
    lat: 8.08,
    lng: 98.9,
    condition: null,
    sourceLanguage: "en",
    availableTimes: null,
    locationRadius: null,
    createdAt: partial.createdAt ?? "2026-09-14T00:00:00.000Z",
    ownerName: "Seller",
    ownerAvatar: null,
    ownerVerified: false,
    ownerLocation: null,
    ratingAvg: null,
    reviewCount: 0,
    facebookUrl: null,
    facebookId: null,
    facebookName: null,
    facebookPhoto: null,
    ...partial,
  };
}

describe("isPublicListingStatus", () => {
  it("treats active (agent writes) as public, not published-only", () => {
    assert.equal(isPublicListingStatus("active"), true);
    assert.equal(isPublicListingStatus("available"), true);
    assert.equal(isPublicListingStatus("published"), true);
    assert.equal(isPublicListingStatus(""), true);
    assert.equal(isPublicListingStatus(null), true);
    assert.equal(isPublicListingStatus("paused"), false);
    assert.equal(isPublicListingStatus("draft"), false);
  });
});

describe("knownDistrictId", () => {
  it("accepts ids and names, ignores empty or junk (sticky persist)", () => {
    assert.equal(knownDistrictId("ao-nang"), "ao-nang");
    assert.equal(knownDistrictId("Ao Nang"), "ao-nang");
    assert.equal(knownDistrictId(""), undefined);
    assert.equal(knownDistrictId("all"), undefined);
    assert.equal(knownDistrictId("undefined"), undefined);
  });
});

describe("applyFeedFilters", () => {
  const catalog = [
    card({ id: "m1", kind: "market", status: "active", district: "krabi-town" }),
    card({ id: "s1", kind: "service", status: "active", district: "ao-nang" }),
    card({ id: "j1", kind: "job", status: "active", district: "krabi-town" }),
    card({ id: "paused", kind: "market", status: "paused", district: "krabi-town" }),
    card({ id: "want", kind: "service", type: "wanted", status: "active", district: "krabi-town" }),
  ];

  it("kind all / omitted keeps mixed active services (not items-only, not published-only)", () => {
    const all = applyFeedFilters(catalog, { kind: "all" });
    assert.deepEqual(
      all.map((c) => c.id).sort(),
      ["j1", "m1", "s1", "want"],
    );
    assert.deepEqual(
      applyFeedFilters(catalog, {}).map((c) => c.id).sort(),
      ["j1", "m1", "s1", "want"],
    );
  });

  it("does not empty the catalog on an unknown sticky district", () => {
    const rows = applyFeedFilters(catalog, { district: "not-a-place" });
    assert.equal(rows.length, 4);
  });

  it("filters a known district without dropping other public kinds", () => {
    const rows = applyFeedFilters(catalog, { district: "ao-nang" });
    assert.deepEqual(
      rows.map((c) => c.id),
      ["s1"],
    );
  });

  it("kind=services excludes jobs, market, and wanted", () => {
    const rows = applyFeedFilters(catalog, { kind: "services" });
    assert.deepEqual(
      rows.map((c) => c.id),
      ["s1"],
    );
  });
});

describe("feedLimitFor", () => {
  it("caps Discover at 15 newest and allows a wider search window", () => {
    assert.equal(HOME_FEED_LIMIT, 15);
    assert.equal(feedLimitFor({}), 15);
    assert.equal(feedLimitFor({ q: "scooter" }), 80);
  });
});

describe("mergeNewest", () => {
  it("unions services and items, newest first, capped at 15", () => {
    const services = [
      card({ id: "svc-old", kind: "service", createdAt: "2026-01-01T00:00:00.000Z" }),
      card({ id: "svc-new", kind: "job", createdAt: "2026-09-14T12:00:00.000Z" }),
    ];
    const items = [
      card({ id: "item-1", kind: "market", createdAt: "2026-09-14T10:00:00.000Z" }),
      card({ id: "svc-new", kind: "market", createdAt: "2026-09-14T11:00:00.000Z" }),
    ];
    const merged = mergeNewest([services, items], 15);
    assert.deepEqual(
      merged.map((c) => c.id),
      ["svc-new", "item-1", "svc-old"],
    );
  });

  it("still returns services when items is empty", () => {
    const services = Array.from({ length: 20 }, (_, i) =>
      card({
        id: `s${i}`,
        kind: i % 3 === 0 ? "job" : i % 3 === 1 ? "market" : "service",
        createdAt: `2026-09-${String(10 + (i % 20)).padStart(2, "0")}T00:00:00.000Z`,
      }),
    );
    const merged = mergeNewest([services, []], 15);
    assert.equal(merged.length, 15);
    assert.ok(merged.some((c) => c.kind === "service"));
    assert.ok(merged.some((c) => c.kind === "market"));
    assert.ok(merged.some((c) => c.kind === "job"));
  });
});
