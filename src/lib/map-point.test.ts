import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { AO_NANG, asCoord, clusterPins, districtCentroid, listingPins, listingsToGeoJSON, pointFor } from "./map-point.ts";
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

  it("swaps inverted lat/lng columns (lng stored in lat)", () => {
    assert.deepEqual(pointFor(listing({ lat: 98.9, lng: 8.1 })), [98.9, 8.1]);
  });
});

describe("listingPins / clusterPins", () => {
  it("emits one pin per listing including missing coords", () => {
    const items = [
      listing({ id: "a", lat: 8.04, lng: 98.82 }),
      listing({ id: "b", lat: null, lng: null, district: "krabi-town" }),
      listing({ id: "c", lat: null, lng: null, district: "" }),
    ];
    const pins = listingPins(items);
    assert.equal(pins.length, 3);
    assert.equal(pins[0]?.listingIds[0], "a");
  });

  it("clusters nearby pins at city zoom and splits at street zoom", () => {
    const pins = listingPins([
      listing({ id: "a", lat: 8.0363, lng: 98.8222 }),
      listing({ id: "b", lat: 8.0364, lng: 98.8223 }),
      listing({ id: "c", lat: 8.0863, lng: 98.9063 }),
    ]);
    const city = clusterPins(pins, 11);
    assert.ok(city.length <= 3);
    assert.equal(
      city.reduce((s, p) => s + p.count, 0),
      3,
    );
    const street = clusterPins(pins, 14);
    assert.equal(street.length, 3);
  });
});
