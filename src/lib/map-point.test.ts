import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AO_NANG, asCoord, districtCentroid, listingsToGeoJSON, pointFor } from "./map-point.ts";
import type { MappableListing } from "./map-point.ts";

function listing(partial: Partial<MappableListing>): MappableListing {
  return {
    id: partial.id ?? "1",
    kind: partial.kind ?? "market",
    lat: partial.lat ?? null,
    lng: partial.lng ?? null,
    district: partial.district ?? "",
  };
}

describe("asCoord", () => {
  it("accepts numbers and numeric strings", () => {
    assert.equal(asCoord(8.03), 8.03);
    assert.equal(asCoord("98.82"), 98.82);
    assert.equal(asCoord(""), null);
    assert.equal(asCoord(null), null);
    assert.equal(asCoord(Number.NaN), null);
  });
});

describe("districtCentroid", () => {
  it("resolves ids and English names", () => {
    assert.deepEqual(districtCentroid("ao-nang"), [98.8222, 8.0363]);
    assert.deepEqual(districtCentroid("Ao Nang"), [98.8222, 8.0363]);
  });
  it("returns null when district is missing", () => {
    assert.equal(districtCentroid(""), null);
    assert.equal(districtCentroid(null), null);
    assert.equal(districtCentroid("   "), null);
  });
});

describe("pointFor / listingsToGeoJSON", () => {
  it("keeps explicit coordinates as [lng, lat]", () => {
    assert.deepEqual(pointFor(listing({ lat: 8.1, lng: 98.9 })), [98.9, 8.1]);
    assert.deepEqual(pointFor(listing({ lat: "8.1" as unknown as number, lng: "98.9" as unknown as number })), [
      98.9,
      8.1,
    ]);
  });

  it("falls back to district centroid when lat/lng are null", () => {
    assert.deepEqual(pointFor(listing({ lat: null, lng: null, district: "railay" })), [98.8374, 8.0069]);
  });

  it("uses Ao Nang when both coords and district are missing", () => {
    assert.deepEqual(pointFor(listing({ district: "" })), AO_NANG);
  });

  it("emits one feature per listing and never filters null coords", () => {
    const items = [
      listing({ id: "a", lat: 8.04, lng: 98.82, district: "ao-nang" }),
      listing({ id: "b", lat: null, lng: null, district: "krabi-town" }),
      listing({ id: "c", lat: null, lng: null, district: "" }),
    ];
    const geo = listingsToGeoJSON(items);
    assert.equal(geo.features.length, 3);
    assert.deepEqual(
      geo.features.map((f) => f.properties.id),
      ["a", "b", "c"],
    );
    assert.deepEqual(geo.features[1]?.geometry.coordinates, [98.9063, 8.0863]);
    assert.deepEqual(geo.features[2]?.geometry.coordinates, AO_NANG);
  });

  it("returns no features for an empty feed, not a dummy pin", () => {
    assert.equal(listingsToGeoJSON([]).features.length, 0);
    assert.equal(listingsToGeoJSON(undefined).features.length, 0);
  });
});
