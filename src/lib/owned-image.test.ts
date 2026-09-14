import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  IMAGE_PROXY_PATH,
  isAllowedImageHost,
  isDisplayableCoverUrl,
  isHotlinkCdnHost,
  isOwnedProxyUrl,
  isVercelBlobHost,
  isVercelBlobImageUrl,
  listingCoverSrc,
  needsOwnedProxy,
  pickCoverImage,
  toOwnedImageUrl,
  unwrapOwnedImageUrl,
} from "./owned-image.ts";

const FBCDN =
  "https://scontent.xx.fbcdn.net/v/t39.30808-6/123_n.jpg?_nc_cat=1&oh=abc&oe=def";
const BLOB = "https://abc123.public.blob.vercel-storage.com/listings/photo.jpg";
const CDN = "https://cdn.example.com/listing.webp";

describe("isAllowedImageHost", () => {
  it("allows Facebook CDN, scontent*, and Vercel Blob", () => {
    assert.equal(isAllowedImageHost("scontent.xx.fbcdn.net"), true);
    assert.equal(isAllowedImageHost("scontent-bkk1-1.xx.fbcdn.net"), true);
    assert.equal(isAllowedImageHost("fbcdn.net"), true);
    assert.equal(isAllowedImageHost("scontent.cdninstagram.com"), true);
    assert.equal(isAllowedImageHost("abc.public.blob.vercel-storage.com"), true);
    assert.equal(isAllowedImageHost("blob.vercel-storage.com"), true);
    assert.equal(isAllowedImageHost("store.blob.vercel-storage.com"), true);
    assert.equal(isVercelBlobHost("abc.public.blob.vercel-storage.com"), true);
    assert.equal(isVercelBlobHost("scontent.xx.fbcdn.net"), false);
    assert.equal(isHotlinkCdnHost("abc.public.blob.vercel-storage.com"), true);
    assert.equal(isHotlinkCdnHost("blob.vercel-storage.com"), true);
    assert.equal(isHotlinkCdnHost("store.blob.vercel-storage.com"), true);
  });

  it("rejects unrelated hosts", () => {
    assert.equal(isAllowedImageHost("facebook.com"), false);
    assert.equal(isAllowedImageHost("evil.example"), false);
    assert.equal(isAllowedImageHost("localhost"), false);
  });
});

describe("toOwnedImageUrl", () => {
  it("wraps fbcdn URLs with /api/img?u=", () => {
    const owned = toOwnedImageUrl(FBCDN, "");
    assert.equal(owned, `${IMAGE_PROXY_PATH}?u=${encodeURIComponent(FBCDN)}`);
    assert.equal(needsOwnedProxy(FBCDN), true);
    assert.equal(isHotlinkCdnHost("scontent.xx.fbcdn.net"), true);
  });

  it("prefixes SITE_URL when provided", () => {
    const owned = toOwnedImageUrl(FBCDN, "https://market.example");
    assert.equal(
      owned,
      `https://market.example${IMAGE_PROXY_PATH}?u=${encodeURIComponent(FBCDN)}`,
    );
  });

  it("does not double-wrap an owned proxy URL", () => {
    const once = toOwnedImageUrl(FBCDN, "https://market.example");
    assert.equal(toOwnedImageUrl(once, "https://market.example"), once);
    assert.equal(isOwnedProxyUrl(once), true);
    assert.equal(unwrapOwnedImageUrl(once), FBCDN);
  });

  it("rewrites absolute /api/img URLs on a parked host to same-origin", () => {
    const parked = `https://krabiconnect.com${IMAGE_PROXY_PATH}?u=${encodeURIComponent(FBCDN)}`;
    assert.equal(toOwnedImageUrl(parked), `${IMAGE_PROXY_PATH}?u=${encodeURIComponent(FBCDN)}`);
    assert.equal(toOwnedImageUrl(FBCDN), `${IMAGE_PROXY_PATH}?u=${encodeURIComponent(FBCDN)}`);
  });

  it("allowlists Blob hosts and uses them as direct <img src>", () => {
    assert.equal(isHotlinkCdnHost("abc.public.blob.vercel-storage.com"), true);
    assert.equal(isAllowedImageHost("abc.public.blob.vercel-storage.com"), true);
    assert.equal(needsOwnedProxy(BLOB), false);
    assert.equal(toOwnedImageUrl(BLOB), BLOB);
    assert.equal(listingCoverSrc({ images: [BLOB] }), BLOB);
    assert.equal(toOwnedImageUrl(CDN), CDN);
    assert.equal(toOwnedImageUrl("data:image/jpeg;base64,aa"), "data:image/jpeg;base64,aa");
    assert.equal(isVercelBlobImageUrl(BLOB), true);
    assert.equal(isVercelBlobImageUrl("https://store.blob.vercel-storage.com/x.webp"), true);
    assert.equal(isDisplayableCoverUrl(BLOB), true);
  });
});

describe("pickCoverImage", () => {
  it("accepts public Vercel Blob HTTPS URLs without requiring coverUrl", () => {
    assert.equal(pickCoverImage({ images: [BLOB] }), BLOB);
    assert.equal(pickCoverImage({ coverUrl: BLOB }), BLOB);
    assert.equal(pickCoverImage({ cover: BLOB }), BLOB);
    assert.equal(listingCoverSrc({ images: [BLOB] }), BLOB);
  });

  it("pulls Blob URLs out of object rows and JSON text", () => {
    assert.equal(pickCoverImage({ images: [{ url: BLOB }] }), BLOB);
    assert.equal(pickCoverImage({ images: JSON.stringify([BLOB]) }), BLOB);
    assert.equal(pickCoverImage({ images: JSON.stringify({ src: BLOB }) }), BLOB);
  });

  it("skips Facebook HTML pages and uses the Blob URL in the list", () => {
    const html = "https://www.facebook.com/photo.php?fbid=1";
    assert.equal(pickCoverImage({ images: [html, BLOB] }), BLOB);
  });

  it("does not reject Blob URLs that are not on an owned /api/img host", () => {
    assert.equal(listingCoverSrc({ images: [BLOB, CDN] }), BLOB);
    assert.equal(listingCoverSrc({ images: [BLOB] }), BLOB);
  });
});
