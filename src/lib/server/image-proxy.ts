import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { get } from "@vercel/blob";
import {
  IMAGE_PROXY_PATH,
  isAllowedImageHost,
  unwrapOwnedImageUrl,
} from "../owned-image.ts";

const FETCH_MS = 12_000;
const MAX_BYTES = 8 * 1024 * 1024;
const MAX_REDIRECTS = 4;
const CACHE_CONTROL = "public, max-age=604800";

const BLOCKED_HOSTS = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata",
  "metadata.google.internal",
  "metadata.internal",
]);

export type ImageTargetOk = { ok: true; url: URL };
export type ImageTargetErr = { ok: false; status: 400 | 502; error: string };

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

function hostnameOf(url: URL): string {
  return url.hostname.replace(/\.$/, "").toLowerCase();
}

export function isBlockedIp(ip: string): boolean {
  const raw = ip.trim().toLowerCase();
  if (!raw) return true;
  if (raw === "::1" || raw === "::" || raw === "0:0:0:0:0:0:0:1") return true;
  if (raw.startsWith("::ffff:")) return isBlockedIp(raw.slice("::ffff:".length));
  if (raw.includes(":")) {
    const first = raw.split(":", 1)[0] ?? "";
    const n = Number.parseInt(first.padEnd(4, "0").slice(0, 4), 16);
    if (!Number.isFinite(n)) return true;
    if ((n & 0xfe00) === 0xfc00) return true; // fc00::/7 unique local
    if ((n & 0xffc0) === 0xfe80) return true; // fe80::/10 link-local
    if ((n & 0xff00) === 0xff00) return true; // ff00::/8 multicast
    if (n === 0) return true; // ::/128 and IPv4-mapped handled above
    return false;
  }
  const parts = raw.split(".").map((p) => Number(p));
  if (parts.length !== 4 || parts.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return true;
  }
  const [a, b] = parts as [number, number, number, number];
  if (a === 0 || a === 127 || a === 10 || a >= 224) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 198 && (b === 18 || b === 19)) return true;
  return false;
}

function isBlockedHostname(host: string): boolean {
  if (BLOCKED_HOSTS.has(host)) return true;
  if (host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) return true;
  if (host.endsWith(".lan") || host.endsWith(".home") || host.endsWith(".localdomain")) return true;
  return false;
}

function fail(status: 400 | 502, error: string): ImageTargetErr {
  return { ok: false, status, error };
}

/** Sync SSRF + allowlist checks. Does not resolve DNS. */
export function inspectImageUrl(raw: string): ImageTargetOk | ImageTargetErr {
  const trimmed = raw.trim();
  if (!trimmed) return fail(400, "Missing image url");
  const inner = unwrapOwnedImageUrl(trimmed);
  if (!inner) return fail(400, "Missing image url");
  if (inner !== trimmed && unwrapOwnedImageUrl(inner) !== inner) {
    return fail(400, "Nested image proxy urls are not allowed");
  }
  let url: URL;
  try {
    url = new URL(inner);
  } catch {
    return fail(400, "Invalid image url");
  }
  if (url.protocol !== "https:") return fail(400, "Only https image urls are allowed");
  if (url.username || url.password) return fail(400, "Image url must not include credentials");
  if (url.port && url.port !== "443") return fail(400, "Image url must use https port 443");
  const host = hostnameOf(url);
  if (!host) return fail(400, "Invalid image url");
  if (isBlockedHostname(host)) return fail(400, "Image host is not allowed");
  if (isIP(host)) return fail(400, "Image host is not allowed");
  if (!isAllowedImageHost(host)) return fail(400, "Image host is not allowlisted");
  return { ok: true, url };
}

export async function assertSafeImageUrl(url: URL): Promise<ImageTargetOk | ImageTargetErr> {
  const inspected = inspectImageUrl(url.href);
  if (!inspected.ok) return inspected;
  const host = hostnameOf(url);
  // Allowlisted Blob hostnames are not SSRF targets; skip DNS so private-store
  // reads work in tests and don't depend on extra lookups.
  if (host === "blob.vercel-storage.com" || host.endsWith(".blob.vercel-storage.com")) {
    return inspected;
  }
  let records: { address: string }[];
  try {
    records = await lookup(url.hostname, { all: true });
  } catch {
    return fail(502, "Could not resolve image host");
  }
  if (!records.length) return fail(502, "Could not resolve image host");
  if (records.some((r) => isBlockedIp(r.address))) {
    return fail(400, "Image host resolves to a private address");
  }
  return inspected;
}

function fetchHeaders(url: URL): HeadersInit {
  const host = hostnameOf(url);
  const facebookish =
    host.includes("fbcdn") ||
    host.startsWith("scontent") ||
    host.includes("cdninstagram") ||
    host.includes("fbsbx");
  return {
    Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "User-Agent": BROWSER_UA,
    ...(facebookish ? { Referer: "https://www.facebook.com/" } : {}),
  };
}

function isImageContentType(value: string | null): boolean {
  if (!value) return true;
  const type = value.split(";", 1)[0]?.trim().toLowerCase() ?? "";
  if (!type) return true;
  if (type.startsWith("image/")) return true;
  if (type === "application/octet-stream") return true;
  if (type === "binary/octet-stream") return true;
  return false;
}

export type ImageProxyDeps = {
  fetch?: typeof fetch;
  getPrivate?: (
    urlOrPathname: string,
    token?: string,
  ) => Promise<{
    statusCode: number;
    stream: ReadableStream | null;
    blob?: { contentType?: string | null };
  } | null>;
  token?: string | null;
};

function blobToken(deps?: ImageProxyDeps): string | undefined {
  if (deps && deps.token !== undefined) return deps.token?.trim() || undefined;
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || undefined;
}

function isPrivateBlobHost(host: string): boolean {
  return host.includes(".private.blob.vercel-storage.com");
}

async function defaultPrivateGet(urlOrPathname: string, token?: string) {
  return get(urlOrPathname, {
    access: "private",
    ...(token ? { token } : {}),
  });
}

async function fetchPrivateBlob(url: URL, deps?: ImageProxyDeps): Promise<Response | ImageTargetErr> {
  try {
    const result = await (deps?.getPrivate ?? defaultPrivateGet)(url.href, blobToken(deps));
    if (!result || result.statusCode !== 200 || !result.stream) {
      return fail(502, "Private blob not found");
    }
    const contentType = result.blob?.contentType || "image/jpeg";
    return new Response(result.stream, {
      status: 200,
      headers: { "content-type": contentType },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "read failed";
    return fail(502, `Private blob read failed (${message})`);
  }
}

function jsonError(status: number, error: string): Response {
  return Response.json(
    { ok: false, error },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}

async function fetchFollowing(start: URL, deps?: ImageProxyDeps): Promise<Response | ImageTargetErr> {
  let current = start;
  for (let i = 0; i <= MAX_REDIRECTS; i++) {
    const guard = await assertSafeImageUrl(current);
    if (!guard.ok) return guard;
    if (isPrivateBlobHost(hostnameOf(current))) {
      return fetchPrivateBlob(current, deps);
    }
    const doFetch = deps?.fetch ?? fetch;
    let res: Response;
    try {
      res = await doFetch(current, {
        method: "GET",
        redirect: "manual",
        headers: fetchHeaders(current),
        signal: AbortSignal.timeout(FETCH_MS),
      });
    } catch {
      return fail(502, "Upstream image fetch failed");
    }
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) return fail(502, "Upstream image redirect missing location");
      try {
        current = new URL(location, current);
      } catch {
        return fail(502, "Upstream image redirect is invalid");
      }
      continue;
    }
    if (!res.ok) return fail(502, `Upstream image returned ${res.status}`);
    return res;
  }
  return fail(502, "Too many image redirects");
}

export async function proxyRemoteImage(raw: string, deps?: ImageProxyDeps): Promise<Response> {
  const inspected = inspectImageUrl(raw);
  if (!inspected.ok) return jsonError(inspected.status, inspected.error);
  const fetched = await fetchFollowing(inspected.url, deps);
  if (!(fetched instanceof Response)) return jsonError(fetched.status, fetched.error);
  const contentType = fetched.headers.get("content-type");
  if (!isImageContentType(contentType)) {
    return jsonError(502, "Upstream did not return an image");
  }
  const length = Number(fetched.headers.get("content-length") ?? "");
  if (Number.isFinite(length) && length > MAX_BYTES) {
    return jsonError(502, "Upstream image is too large");
  }
  const headers = new Headers();
  headers.set("Content-Type", contentType?.split(";")[0]?.trim() || "image/jpeg");
  headers.set("Cache-Control", CACHE_CONTROL);
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Access-Control-Allow-Origin", "*");
  const etag = fetched.headers.get("etag");
  if (etag) headers.set("ETag", etag);
  return new Response(fetched.body, { status: 200, headers });
}

export function imageUrlFromRequest(request: Request, splat?: string | null): string | null {
  const url = new URL(request.url);
  const query = url.searchParams.get("u") ?? url.searchParams.get("url");
  if (query?.trim()) return query.trim();
  const rest = splat?.trim();
  if (rest) {
    try {
      return decodeURIComponent(rest);
    } catch {
      return rest;
    }
  }
  const extra = url.pathname.startsWith(`${IMAGE_PROXY_PATH}/`)
    ? url.pathname.slice(IMAGE_PROXY_PATH.length + 1)
    : "";
  if (extra) {
    try {
      return decodeURIComponent(extra);
    } catch {
      return extra;
    }
  }
  return null;
}

export async function handleImageProxyRequest(
  request: Request,
  splat?: string | null,
): Promise<Response> {
  const target = imageUrlFromRequest(request, splat);
  if (!target) {
    return jsonError(400, "Missing image url. Use /api/img?u=<https url>");
  }
  return proxyRemoteImage(target);
}

export { isAllowedImageHost };
