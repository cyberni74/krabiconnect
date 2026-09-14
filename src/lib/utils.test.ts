import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseImages, isFacebookFbidHtmlUrl } from "./utils.ts";

const BLOB = "https://abc123.public.blob.vercel-storage.com/listings/photo.jpg";
const FB_PHOTO = "https://www.facebook.com/photo/?fbid=1029384756";
const FBID_HTML = "https://www.facebook.com/photo.php?fbid=1029384756&set=a.1";

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

  it("soft-strips facebook.com/photo and fbid HTML so they cannot be covers", () => {
    assert.equal(isFacebookFbidHtmlUrl(FB_PHOTO), true);
    assert.equal(isFacebookFbidHtmlUrl(FBID_HTML), true);
    assert.equal(isFacebookFbidHtmlUrl(BLOB), false);
    assert.deepEqual(parseImages([FB_PHOTO, BLOB, FBID_HTML]), [BLOB]);
    assert.deepEqual(parseImages(JSON.stringify([FB_PHOTO, BLOB])), [BLOB]);
    assert.deepEqual(
      parseImages([`/api/img?u=${encodeURIComponent(FB_PHOTO)}`, BLOB]),
      [BLOB],
    );
  });
});
