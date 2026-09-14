import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { imageUrlFromRequest, inspectImageUrl, isBlockedIp, proxyRemoteImage } from "./image-proxy.ts";

const FBCDN =
  "https://scontent.xx.fbcdn.net/v/t39.30808-6/123_n.jpg?_nc_cat=1&oh=abc&oe=def";

describe("isBlockedIp", () => {
  it("blocks loopback, private, and metadata ranges", () => {
    assert.equal(isBlockedIp("127.0.0.1"), true);
    assert.equal(isBlockedIp("10.0.0.8"), true);
    assert.equal(isBlockedIp("192.168.1.1"), true);
    assert.equal(isBlockedIp("172.16.0.1"), true);
    assert.equal(isBlockedIp("169.254.169.254"), true);
    assert.equal(isBlockedIp("::1"), true);
    assert.equal(isBlockedIp("fc00::1"), true);
    assert.equal(isBlockedIp("fe80::1"), true);
  });

  it("allows public unicast", () => {
    assert.equal(isBlockedIp("1.1.1.1"), false);
    assert.equal(isBlockedIp("8.8.8.8"), false);
    assert.equal(isBlockedIp("157.240.3.35"), false);
  });
});

describe("inspectImageUrl", () => {
  it("accepts https Facebook CDN urls", () => {
    const result = inspectImageUrl(FBCDN);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.url.hostname, "scontent.xx.fbcdn.net");
  });

  it("rejects http, credentials, localhost, and off-allowlist hosts", () => {
    assert.equal(inspectImageUrl("http://scontent.xx.fbcdn.net/a.jpg").ok, false);
    assert.equal(inspectImageUrl("https://user:pass@scontent.xx.fbcdn.net/a.jpg").ok, false);
    assert.equal(inspectImageUrl("https://localhost/a.jpg").ok, false);
    assert.equal(inspectImageUrl("https://127.0.0.1/a.jpg").ok, false);
    assert.equal(inspectImageUrl("https://169.254.169.254/latest/meta-data").ok, false);
    assert.equal(inspectImageUrl("https://evil.example/secret.png").ok, false);
    assert.equal(inspectImageUrl("not a url").ok, false);
    assert.equal(inspectImageUrl("").ok, false);
    const bad = inspectImageUrl("https://evil.example/x");
    assert.equal(bad.ok, false);
    if (!bad.ok) assert.equal(bad.status, 400);
  });

  it("rejects nested proxy urls", () => {
    const inner = `/api/img?u=${encodeURIComponent(FBCDN)}`;
    const nested = `/api/img?u=${encodeURIComponent(inner)}`;
    const result = inspectImageUrl(nested);
    assert.equal(result.ok, false);
  });

  it("unwraps a single owned proxy url", () => {
    const owned = `/api/img?u=${encodeURIComponent(FBCDN)}`;
    const result = inspectImageUrl(owned);
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.url.href, FBCDN);
  });
});

describe("imageUrlFromRequest", () => {
  it("reads u= query and path splat", () => {
    const q = new Request(`https://market.example/api/img?u=${encodeURIComponent(FBCDN)}`);
    assert.equal(imageUrlFromRequest(q), FBCDN);
    const path = new Request("https://market.example/api/img/");
    assert.equal(imageUrlFromRequest(path, encodeURIComponent(FBCDN)), FBCDN);
  });
});

describe("proxyRemoteImage", () => {
  it("streams allowlisted image bytes with a week-long cache", async () => {
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const original = globalThis.fetch;
    globalThis.fetch = async () =>
      new Response(png, { status: 200, headers: { "content-type": "image/png" } });
    try {
      const res = await proxyRemoteImage(FBCDN);
      assert.equal(res.status, 200);
      assert.equal(res.headers.get("content-type"), "image/png");
      assert.equal(res.headers.get("cache-control"), "public, max-age=604800");
      const body = Buffer.from(await res.arrayBuffer());
      assert.equal(body.equals(png), true);
    } finally {
      globalThis.fetch = original;
    }
  });

  it("returns 502 when upstream fails", async () => {
    const original = globalThis.fetch;
    globalThis.fetch = async () => new Response("nope", { status: 403 });
    try {
      const res = await proxyRemoteImage(FBCDN);
      assert.equal(res.status, 502);
    } finally {
      globalThis.fetch = original;
    }
  });
});
