import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  blobAccessOrder,
  canonicalizeBlobUrl,
  innerUrlFromProxy,
  isImageProxyUrl,
  isOwnedBlobUrl,
  isPrivateBlobUrl,
  isPrivateStorePublicAccessError,
  isVercelBlobHost,
  toHeroSrc,
} from "./blob-url.ts";

const PUBLIC = "https://abc123.public.blob.vercel-storage.com/listings/a.jpg";
const PRIVATE = "https://abc123.private.blob.vercel-storage.com/listings/a.jpg";
const SIGNED = `${PRIVATE}?vercel-blob-delegation=eyJ&vercel-blob-signature=Qm9`;
const PROXY = `/api/img?u=${encodeURIComponent(PRIVATE)}`;

describe("blobAccessOrder", () => {
  it("defaults to public then private", () => {
    assert.deepEqual(blobAccessOrder(""), ["public", "private"]);
    assert.deepEqual(blobAccessOrder("auto"), ["public", "private"]);
  });

  it("honors BLOB_ACCESS public|private", () => {
    assert.deepEqual(blobAccessOrder("public"), ["public"]);
    assert.deepEqual(blobAccessOrder("PRIVATE"), ["private"]);
  });
});

describe("isPrivateStorePublicAccessError", () => {
  it("matches the Vercel Blob private-store error", () => {
    assert.equal(
      isPrivateStorePublicAccessError(new Error("Vercel Blob: Cannot use public access on a private store")),
      true,
    );
    assert.equal(isPrivateStorePublicAccessError(new Error("network")), false);
  });
});

describe("blob url helpers", () => {
  it("detects public and private blob hosts", () => {
    assert.equal(isVercelBlobHost(PUBLIC), true);
    assert.equal(isVercelBlobHost(PRIVATE), true);
    assert.equal(isPrivateBlobUrl(PUBLIC), false);
    assert.equal(isPrivateBlobUrl(PRIVATE), true);
    assert.equal(isPrivateBlobUrl(SIGNED), true);
    assert.equal(isOwnedBlobUrl(PUBLIC), true);
    assert.equal(isOwnedBlobUrl(PRIVATE), true);
    assert.equal(isOwnedBlobUrl(SIGNED), true);
    assert.equal(isOwnedBlobUrl(PROXY), true);
  });

  it("canonicalizes signed and proxied private URLs", () => {
    assert.equal(canonicalizeBlobUrl(SIGNED), PRIVATE);
    assert.equal(canonicalizeBlobUrl(PROXY), PRIVATE);
    assert.equal(innerUrlFromProxy(PROXY), PRIVATE);
    assert.equal(isImageProxyUrl(PROXY), true);
  });

  it("rewrites private blobs to /api/img for <img src>", () => {
    assert.equal(toHeroSrc(PRIVATE), PROXY);
    assert.equal(toHeroSrc(SIGNED), PROXY);
    assert.equal(toHeroSrc(PUBLIC), PUBLIC);
    assert.equal(
      toHeroSrc(PRIVATE, "https://krabimarketplace.vercel.app"),
      `https://krabimarketplace.vercel.app${PROXY}`,
    );
  });
});
