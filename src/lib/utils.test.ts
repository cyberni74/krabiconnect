import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseImages } from "./utils.ts";

const BLOB = "https://abc123.public.blob.vercel-storage.com/listings/photo.jpg";

describe("parseImages", () => {
  it("keeps JSON string arrays of Blob HTTPS URLs", () => {
    assert.deepEqual(parseImages(JSON.stringify([BLOB])), [BLOB]);
    assert.deepEqual(parseImages([BLOB]), [BLOB]);
  });

  it("accepts a JSON-encoded lone URL string (not an array)", () => {
    assert.deepEqual(parseImages(JSON.stringify(BLOB)), [BLOB]);
  });

  it("extracts url/src from object rows instead of dropping them", () => {
    assert.deepEqual(parseImages([{ url: BLOB }]), [BLOB]);
    assert.deepEqual(parseImages([{ src: BLOB, alt: "hero" }]), [BLOB]);
  });

  it("recovers Blob URLs from postgres-array-like text", () => {
    assert.deepEqual(parseImages(`{${BLOB}}`), [BLOB]);
  });

  it("still returns task id tokens", () => {
    assert.deepEqual(parseImages('["cleaning","plumbing"]'), ["cleaning", "plumbing"]);
    assert.deepEqual(parseImages(["cleaning"]), ["cleaning"]);
  });
});
