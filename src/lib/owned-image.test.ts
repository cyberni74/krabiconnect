import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  IMAGE_PROXY_PATH,
  isAllowedImageHost,
  isHotlinkCdnHost,
  isOwnedProxyUrl,
  needsOwnedProxy,
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

  it("passes through public Blob, ordinary HTTPS, and data URIs", () => {
    assert.equal(toOwnedImageUrl(BLOB), BLOB);
    assert.equal(toOwnedImageUrl(CDN), CDN);
    assert.equal(toOwnedImageUrl("data:image/jpeg;base64,aa"), "data:image/jpeg;base64,aa");
    assert.equal(needsOwnedProxy(BLOB), false);
  });

  it("wraps private Blob URLs so listing heroes load without cookies", () => {
    const privateBlob = "https://abc123.private.blob.vercel-storage.com/listings/a.jpg";
    const signed = `${privateBlob}?vercel-blob-delegation=tok`;
    assert.equal(needsOwnedProxy(privateBlob), true);
    assert.equal(toOwnedImageUrl(privateBlob, ""), `${IMAGE_PROXY_PATH}?u=${encodeURIComponent(privateBlob)}`);
    assert.equal(toOwnedImageUrl(signed, ""), `${IMAGE_PROXY_PATH}?u=${encodeURIComponent(privateBlob)}`);
  });
});
