import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toOwnedImageUrl } from "../owned-image.ts";
import {
  assertPublicImageUrl,
  blobWriteReady,
  isOwnedBlobUrl,
  makeReadableBlobUrl,
  needsRehost,
  processListingImages,
  putListingBlob,
  rehostFromRequest,
  rehostRemoteUrl,
  RehostError,
  sniffImageContentType,
  uploadImageBytes,
  type RehostDeps,
} from "./image-rehost.ts";

const FBCDN =
  "https://scontent.xx.fbcdn.net/v/t39.30808-6/123_n.jpg?_nc_cat=1&oh=abc&oe=def";
const OWNED = "https://abc123.public.blob.vercel-storage.com/listings/a.jpg";
const PRIVATE = "https://abc123.private.blob.vercel-storage.com/listings/a.jpg";
const SIGNED = `${PRIVATE}?vercel-blob-delegation=tok`;
const JPEG = Uint8Array.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);

function deps(over: Partial<RehostDeps> = {}): RehostDeps {
  return {
    token: "vercel_blob_rw_test",
    put: async () => ({ url: OWNED }),
    fetch: async () => new Response(JPEG, { status: 200, headers: { "content-type": "image/jpeg" } }),
    ...over,
  };
}

describe("isOwnedBlobUrl", () => {
  it("detects Vercel Blob public URLs", () => {
    assert.equal(isOwnedBlobUrl(OWNED), true);
    assert.equal(isOwnedBlobUrl("https://store.public.blob.vercel-storage.com/x.webp"), true);
    assert.equal(isOwnedBlobUrl(FBCDN), false);
  });

  it("detects private blob and /api/img URLs as owned", () => {
    assert.equal(isOwnedBlobUrl(PRIVATE), true);
    assert.equal(isOwnedBlobUrl(SIGNED), true);
    assert.equal(isOwnedBlobUrl(`/api/img?u=${encodeURIComponent(PRIVATE)}`), true);
  });
});

describe("assertPublicImageUrl", () => {
  it("accepts fbcdn HTTPS URLs", () => {
    assert.equal(assertPublicImageUrl(FBCDN).hostname, "scontent.xx.fbcdn.net");
  });

  it("rejects Facebook HTML pages", () => {
    assert.throws(
      () => assertPublicImageUrl("https://www.facebook.com/photo.php?fbid=1"),
      (err: unknown) => err instanceof RehostError && err.code === "unusable_url",
    );
  });

  it("rejects loopback and private hosts", () => {
    for (const url of [
      "http://127.0.0.1/x.jpg",
      "http://localhost/x.jpg",
      "http://10.0.0.4/x.jpg",
      "http://192.168.1.9/photo.jpg",
      "http://169.254.169.254/latest/meta-data",
      "http://[::1]/x.jpg",
    ]) {
      assert.throws(
        () => assertPublicImageUrl(url),
        (err: unknown) => err instanceof RehostError && err.code === "blocked_host",
        url,
      );
    }
  });
});

describe("sniffImageContentType", () => {
  it("sniffs jpeg/png magic bytes", () => {
    assert.equal(sniffImageContentType(JPEG), "image/jpeg");
    assert.equal(
      sniffImageContentType(Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
      "image/png",
    );
  });

  it("rejects HTML bytes even if declared as jpeg", () => {
    const html = new TextEncoder().encode("<!doctype html>");
    assert.equal(sniffImageContentType(html, "image/jpeg"), null);
  });
});

describe("blobWriteReady", () => {
  it("is true only when a token is provided", () => {
    assert.equal(blobWriteReady({ token: "vercel_blob_rw_x" }), true);
    assert.equal(blobWriteReady({ token: "" }), false);
    assert.equal(blobWriteReady({ token: null }), false);
  });
});

describe("rehostRemoteUrl", () => {
  it("returns owned blob URLs without uploading", async () => {
    let putCalls = 0;
    const result = await rehostRemoteUrl(OWNED, deps({ put: async () => {
      putCalls += 1;
      return { url: OWNED };
    } }));
    assert.equal(result.url, OWNED);
    assert.equal(putCalls, 0);
  });

  it("downloads fbcdn and uploads to blob", async () => {
    const seen: string[] = [];
    const result = await rehostRemoteUrl(
      FBCDN,
      deps({
        fetch: async (input) => {
          seen.push(String(input));
          return new Response(JPEG, { status: 200, headers: { "content-type": "image/jpeg" } });
        },
        put: async (pathname, body, contentType) => {
          assert.match(pathname, /^listings\/[a-f0-9]+\.jpg$/);
          assert.equal(contentType, "image/jpeg");
          assert.equal(body[0], 0xff);
          return { url: OWNED };
        },
      }),
    );
    assert.equal(result.ok, true);
    assert.equal(result.url, OWNED);
    assert.equal(seen[0], FBCDN);
  });

  it("follows redirects only to public hosts", async () => {
    let hops = 0;
    await assert.rejects(
      () =>
        rehostRemoteUrl(
          FBCDN,
          deps({
            fetch: async () => {
              hops += 1;
              return new Response(null, {
                status: 302,
                headers: { location: "http://127.0.0.1/secret.jpg" },
              });
            },
          }),
        ),
      (err: unknown) => err instanceof RehostError && err.code === "blocked_host",
    );
    assert.equal(hops, 1);
  });

  it("fails with 503 when Blob is not configured", async () => {
    await assert.rejects(
      () => rehostRemoteUrl(FBCDN, deps({ token: "" })),
      (err: unknown) => err instanceof RehostError && err.status === 503 && err.code === "blob_not_configured",
    );
  });
});

describe("uploadImageBytes", () => {
  it("uploads multipart bytes", async () => {
    const result = await uploadImageBytes(JPEG, "image/jpeg", deps());
    assert.deepEqual(result, { ok: true, url: OWNED });
  });
});

describe("processListingImages", () => {
  it("rehosts remote URLs and keeps owned ones", async () => {
    const result = await processListingImages([OWNED, FBCDN], deps());
    assert.deepEqual(result.images, [OWNED, OWNED]);
    assert.equal(result.rehosted, 1);
    assert.equal(result.failed.length, 0);
  });

  it("returns proxy URLs when Blob is not configured", async () => {
    const result = await processListingImages([FBCDN], deps({ token: "" }));
    assert.deepEqual(result.images, [toOwnedImageUrl(FBCDN)]);
    assert.equal(result.rehosted, 0);
    assert.equal(result.skipped, 1);
  });

  it("keeps the original URL when a download fails", async () => {
    const result = await processListingImages(
      [FBCDN],
      deps({
        fetch: async () => new Response("nope", { status: 403 }),
      }),
    );
    assert.deepEqual(result.images, [toOwnedImageUrl(FBCDN)]);
    assert.equal(result.rehosted, 0);
    assert.deepEqual(result.failed, [toOwnedImageUrl(FBCDN)]);
  });
});

describe("needsRehost", () => {
  it("is true for fbcdn and false for owned blob URLs", () => {
    assert.equal(needsRehost(FBCDN), true);
    assert.equal(needsRehost(OWNED), false);
    assert.equal(needsRehost("https://www.facebook.com/photo.php?fbid=1"), false);
  });
});

describe("rehostFromRequest", () => {
  it("accepts JSON { url }", async () => {
    const req = new Request("https://krabimarketplace.vercel.app/api/agent/listings/rehost-image", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: FBCDN }),
    });
    const result = await rehostFromRequest(req, deps());
    assert.deepEqual(result, { ok: true, url: OWNED });
  });

  it("accepts a multipart file", async () => {
    const form = new FormData();
    form.set("file", new File([JPEG], "photo.jpg", { type: "image/jpeg" }));
    const req = new Request("https://krabimarketplace.vercel.app/api/agent/listings/rehost-image", {
      method: "POST",
      body: form,
    });
    const result = await rehostFromRequest(req, deps());
    assert.deepEqual(result, { ok: true, url: OWNED });
  });

  it("rejects JSON without url", async () => {
    const req = new Request("https://example.com/rehost", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    await assert.rejects(
      () => rehostFromRequest(req, deps()),
      (err: unknown) => err instanceof RehostError && err.code === "missing_url",
    );
  });
});

describe("putListingBlob", () => {
  it("falls back to private when public access is rejected", async () => {
    const seen: string[] = [];
    const result = await putListingBlob("listings/a.jpg", Buffer.from(JPEG), "image/jpeg", {
      token: "vercel_blob_rw_test",
      sdkPut: async (_pathname, _body, opts) => {
        seen.push(opts.access);
        if (opts.access === "public") {
          throw new Error("Vercel Blob: Cannot use public access on a private store");
        }
        return { url: PRIVATE };
      },
    });
    assert.deepEqual(seen, ["public", "private"]);
    assert.equal(result.access, "private");
    assert.equal(result.url, PRIVATE);
  });

  it("does not fall back when BLOB_ACCESS=public", async () => {
    await assert.rejects(
      () =>
        putListingBlob("listings/a.jpg", Buffer.from(JPEG), "image/jpeg", {
          token: "t",
          blobAccess: "public",
          sdkPut: async () => {
            throw new Error("Vercel Blob: Cannot use public access on a private store");
          },
        }),
      (err: unknown) =>
        err instanceof RehostError &&
        err.code === "blob_failed" &&
        /private store/i.test(err.message),
    );
  });

  it("puts private first when BLOB_ACCESS=private", async () => {
    const seen: string[] = [];
    const result = await putListingBlob("listings/a.jpg", Buffer.from(JPEG), "image/jpeg", {
      token: "t",
      blobAccess: "private",
      sdkPut: async (_p, _b, opts) => {
        seen.push(opts.access);
        return { url: PRIVATE };
      },
    });
    assert.deepEqual(seen, ["private"]);
    assert.equal(result.access, "private");
  });
});

describe("uploadImageBytes private store", () => {
  it("returns a signed GET URL so <img src> works without cookies", async () => {
    const result = await uploadImageBytes(JPEG, "image/jpeg", {
      token: "t",
      sdkPut: async (_p, _b, opts) => {
        if (opts.access === "public") {
          throw new Error("Vercel Blob: Cannot use public access on a private store");
        }
        return { url: PRIVATE };
      },
      signGetUrl: async (pathname, blobUrl) => {
        assert.equal(pathname, "listings/a.jpg");
        assert.equal(blobUrl, PRIVATE);
        return SIGNED;
      },
    });
    assert.equal(result.ok, true);
    assert.equal(result.url, SIGNED);
  });

  it("falls back to /api/img when signing fails", async () => {
    const result = await uploadImageBytes(JPEG, "image/jpeg", {
      token: "t",
      origin: "https://krabimarketplace.vercel.app",
      blobAccess: "private",
      sdkPut: async () => ({ url: PRIVATE }),
      signGetUrl: async () => {
        throw new Error("signing unavailable");
      },
    });
    assert.equal(
      result.url,
      `https://krabimarketplace.vercel.app/api/img?u=${encodeURIComponent(PRIVATE)}`,
    );
  });
});

describe("makeReadableBlobUrl", () => {
  it("leaves public CDN URLs unchanged", async () => {
    assert.equal(await makeReadableBlobUrl(OWNED), OWNED);
  });
});

