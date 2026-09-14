import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toOwnedImageUrl } from "../owned-image.ts";
import {
  cleanImages,
  hasUsableImages,
  imagesToApplyOnDuplicate,
  isUsableListingImage,
} from "./listing-images.ts";

const FBCDN =
  "https://scontent.xx.fbcdn.net/v/t39.30808-6/123_n.jpg?_nc_cat=1&oh=abc&oe=def";
const FBID_HTML = "https://www.facebook.com/photo.php?fbid=1029384756&set=a.1";
const FB_PHOTO = "https://www.facebook.com/photo/?fbid=1029384756";
const MARKET = "https://www.facebook.com/marketplace/item/1234567890";
const GRAPH = "https://graph.facebook.com/100012345/picture?type=large";
const DATA = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/";

describe("isUsableListingImage", () => {
  it("accepts Facebook CDN image URLs", () => {
    assert.equal(isUsableListingImage(FBCDN), true);
    assert.equal(
      isUsableListingImage("https://scontent-bkk1-1.xx.fbcdn.net/v/t1/photo.jpg"),
      true,
    );
  });

  it("rejects Facebook fbid / marketplace HTML pages", () => {
    assert.equal(isUsableListingImage(FBID_HTML), false);
    assert.equal(isUsableListingImage(FB_PHOTO), false);
    assert.equal(isUsableListingImage(MARKET), false);
    assert.equal(isUsableListingImage("https://facebook.com/foo"), false);
  });

  it("accepts Graph picture endpoints, data URIs, ordinary HTTPS, and owned proxy URLs", () => {
    assert.equal(isUsableListingImage(GRAPH), true);
    assert.equal(isUsableListingImage(DATA), true);
    assert.equal(isUsableListingImage("https://cdn.example.com/listing.webp"), true);
    assert.equal(isUsableListingImage(toOwnedImageUrl(FBCDN)), true);
    assert.equal(
      isUsableListingImage("/api/img?u=https://abc123.private.blob.vercel-storage.com/listings/a.jpg"),
      true,
    );
  });

  it("rejects empty and non-URL values", () => {
    assert.equal(isUsableListingImage(""), false);
    assert.equal(isUsableListingImage("  "), false);
    assert.equal(isUsableListingImage("not-a-url"), false);
  });
});

describe("cleanImages", () => {
  it("keeps fbcdn URLs as owned /api/img URLs and drops fbid HTML", () => {
    assert.deepEqual(cleanImages([FBID_HTML, FBCDN, MARKET]), [toOwnedImageUrl(FBCDN)]);
  });

  it("caps at 8 images", () => {
    const urls = Array.from({ length: 10 }, (_, i) => `https://cdn.example.com/${i}.jpg`);
    assert.equal(cleanImages(urls).length, 8);
  });
});

describe("imagesToApplyOnDuplicate", () => {
  it("fills an empty existing row from incoming fbcdn URLs", () => {
    assert.deepEqual(imagesToApplyOnDuplicate([FBCDN], "[]"), [toOwnedImageUrl(FBCDN)]);
    assert.deepEqual(imagesToApplyOnDuplicate([FBCDN], null), [toOwnedImageUrl(FBCDN)]);
  });

  it("upgrades a row that only has fbid HTML", () => {
    assert.deepEqual(
      imagesToApplyOnDuplicate([FBCDN], JSON.stringify([FBID_HTML])),
      [toOwnedImageUrl(FBCDN)],
    );
  });

  it("does not overwrite a row that already has usable images", () => {
    assert.equal(
      imagesToApplyOnDuplicate(["https://cdn.example.com/new.jpg"], JSON.stringify([FBCDN])),
      null,
    );
  });

  it("does not apply when incoming images are empty or only fbid HTML", () => {
    assert.equal(imagesToApplyOnDuplicate([], "[]"), null);
    assert.equal(imagesToApplyOnDuplicate([FBID_HTML], "[]"), null);
    assert.equal(imagesToApplyOnDuplicate(undefined, "[]"), null);
  });

  it("treats parsed arrays the same as JSON strings", () => {
    assert.deepEqual(imagesToApplyOnDuplicate([FBCDN], [FBID_HTML]), [toOwnedImageUrl(FBCDN)]);
    assert.equal(hasUsableImages([FBCDN]), true);
    assert.equal(hasUsableImages([FBID_HTML]), false);
  });
});
