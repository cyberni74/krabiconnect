import { randomBytes } from "node:crypto";
import { issueSignedToken, presignUrl, put, type IssuedSignedToken } from "@vercel/blob";
import { unwrapOwnedImageUrl } from "../owned-image.ts";
import { parseImages } from "../utils.ts";
import {
  type BlobAccess,
  blobAccessMode,
  blobAccessOrder,
  blobPathnameFromUrl,
  canonicalizeBlobUrl,
  isOwnedBlobUrl,
  isPrivateBlobUrl,
  isPrivateStorePublicAccessError,
  siteOrigin,
  toHeroSrc,
} from "./blob-url.ts";
import { cleanImages, isUsableListingImage } from "./listing-images.ts";

export {
  IMAGE_PROXY_PATH,
  isOwnedBlobUrl,
  isPrivateBlobUrl,
  toHeroSrc,
} from "./blob-url.ts";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
export const MAX_REHOST_IMAGES = 8;
const FETCH_TIMEOUT_MS = 12_000;
const MAX_REDIRECTS = 4;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const BROWSER_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

export class RehostError extends Error {
  status: number;
  code: string;
  constructor(message: string, status: number, code: string) {
    super(message);
    this.name = "RehostError";
    this.status = status;
    this.code = code;
  }
}

export type BlobPutFn = (
  pathname: string,
  body: Buffer,
  contentType: string,
) => Promise<{ url: string }>;

export type SdkPutFn = (
  pathname: string,
  body: Buffer,
  opts: { access: BlobAccess; contentType: string },
) => Promise<{ url: string; pathname?: string }>;

export type SignGetUrlFn = (pathname: string, blobUrl: string) => Promise<string>;

export type RehostDeps = {
  fetch?: typeof fetch;
  put?: BlobPutFn;
  sdkPut?: SdkPutFn;
  signGetUrl?: SignGetUrlFn;
  token?: string | null;
  now?: () => number;
  /** public | private | auto — defaults to env BLOB_ACCESS (auto). */
  blobAccess?: string | null;
  /** Public site origin for /api/img fallback URLs. */
  origin?: string | null;
};

export type RehostOk = { ok: true; url: string };

export function blobWriteReady(deps?: RehostDeps): boolean {
  if (deps) {
    if (deps.token !== undefined) return Boolean(deps.token?.trim());
    return Boolean(deps.put || deps.sdkPut);
  }
  if (process.env.BLOB_READ_WRITE_TOKEN?.trim()) return true;
  if (process.env.BLOB_STORE_ID?.trim() && process.env.VERCEL_OIDC_TOKEN?.trim()) return true;
  return false;
}

export function blobStatus() {
  const access = blobAccessMode();
  return {
    env: "BLOB_READ_WRITE_TOKEN",
    access,
    configured: blobWriteReady(),
    note:
      "Set BLOB_READ_WRITE_TOKEN on Vercel Production. BLOB_ACCESS=public|private (default auto: try public, then private if the store is private). Private blobs are not hotlinkable — listing heroes use a 7-day signed GET URL, with GET /api/img?u=… as a cookie-free fallback. A public store is still the simplest setup. Never commit the token.",
  };
}

export function needsRehost(url: string): boolean {
  const inner = unwrapOwnedImageUrl(url);
  if (isOwnedBlobUrl(url) || isOwnedBlobUrl(inner)) return false;
  return isUsableListingImage(inner);
}

function hostnameOf(url: URL): string {
  return url.hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "").toLowerCase();
}

function ipv4Parts(host: string): number[] | null {
  if (/^\d+$/.test(host)) {
    const n = Number(host);
    if (!Number.isFinite(n) || n < 0 || n > 0xffffffff) return null;
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  }
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (!m) return null;
  const parts = m.slice(1).map(Number);
  if (parts.some((p) => p > 255)) return null;
  return parts;
}

function isBlockedHost(host: string): boolean {
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "0.0.0.0" ||
    host === "::" ||
    host === "::1" ||
    host === "metadata.google.internal" ||
    host.endsWith(".internal")
  ) {
    return true;
  }
  if (host.includes(":")) {
    const h = host.replace(/^::ffff:/, "");
    if (h === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")) {
      return true;
    }
    const mapped = ipv4Parts(h);
    if (mapped && isPrivateIPv4(mapped)) return true;
  }
  const v4 = ipv4Parts(host);
  return v4 ? isPrivateIPv4(v4) : false;
}

function isPrivateIPv4(p: number[]): boolean {
  const [a, b] = p;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

/** Reject non-http(s), unusable listing URLs, and private/loopback hosts (SSRF). */
export function assertPublicImageUrl(raw: string): URL {
  const u = raw.trim();
  if (!u) throw new RehostError("url is required", 400, "missing_url");
  if (u.startsWith("data:image/")) {
    throw new RehostError("Pass data URIs as a multipart file, not url", 400, "data_uri");
  }
  let parsed: URL;
  try {
    parsed = new URL(u);
  } catch {
    throw new RehostError("Invalid url", 400, "invalid_url");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new RehostError("url must be http or https", 400, "invalid_protocol");
  }
  if (isBlockedHost(hostnameOf(parsed))) {
    throw new RehostError("url host is not allowed", 400, "blocked_host");
  }
  if (!isUsableListingImage(u)) {
    throw new RehostError(
      "Not a usable image URL (Facebook photo.php/fbid HTML is ignored)",
      400,
      "unusable_url",
    );
  }
  return parsed;
}

function looksLikeHtml(bytes: Uint8Array): boolean {
  const head = new TextDecoder("utf-8", { fatal: false })
    .decode(bytes.slice(0, 80))
    .trimStart()
    .toLowerCase();
  return head.startsWith("<!doctype html") || head.startsWith("<html") || head.startsWith("<?xml");
}

export function sniffImageContentType(bytes: Uint8Array, declared?: string | null): string | null {
  if (looksLikeHtml(bytes)) return null;
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (bytes.length >= 6 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    return "image/gif";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  const declaredType = (declared ?? "").split(";")[0]?.trim().toLowerCase() ?? "";
  if (declaredType === "image/jpg") return "image/jpeg";
  if (ALLOWED_TYPES.has(declaredType)) return declaredType;
  return null;
}

function extFor(contentType: string): string {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  if (contentType.includes("gif")) return "gif";
  if (contentType.includes("avif")) return "avif";
  return "jpg";
}

function requireBlobReady(deps?: RehostDeps) {
  if (blobWriteReady(deps)) return;
  throw new RehostError(
    "BLOB_READ_WRITE_TOKEN is not set. Connect a Blob store on Vercel Production (public or private) and add the token. Private stores: leave BLOB_ACCESS unset (auto) or set BLOB_ACCESS=private.",
    503,
    "blob_not_configured",
  );
}

function rwToken(deps?: RehostDeps): string | undefined {
  if (deps && deps.token !== undefined) return deps.token?.trim() || undefined;
  return process.env.BLOB_READ_WRITE_TOKEN?.trim() || undefined;
}

async function defaultSdkPut(
  pathname: string,
  body: Buffer,
  opts: { access: BlobAccess; contentType: string },
): Promise<{ url: string; pathname?: string }> {
  const token = process.env.BLOB_READ_WRITE_TOKEN?.trim();
  const result = await put(pathname, body, {
    access: opts.access,
    contentType: opts.contentType,
    addRandomSuffix: true,
    ...(token ? { token } : {}),
  });
  return { url: result.url, pathname: result.pathname };
}

const SIGNED_GET_MS = 7 * 24 * 60 * 60 * 1000 - 60_000;

let cachedGetToken: { token: IssuedSignedToken; exp: number } | null = null;

async function defaultSignGetUrl(pathname: string, blobUrl: string, deps?: RehostDeps): Promise<string> {
  const now = deps?.now?.() ?? Date.now();
  const token = rwToken(deps);
  if (!cachedGetToken || cachedGetToken.exp <= now + 60_000) {
    const issued = await issueSignedToken({
      pathname: "*",
      operations: ["get"],
      validUntil: now + SIGNED_GET_MS,
      ...(token ? { token } : {}),
    });
    cachedGetToken = { token: issued, exp: issued.validUntil };
  }
  const { presignedUrl } = await presignUrl(cachedGetToken.token, {
    pathname,
    operation: "get",
    access: "private",
    validUntil: Math.min(now + SIGNED_GET_MS, cachedGetToken.exp),
  });
  return presignedUrl || blobUrl;
}

export async function putListingBlob(
  pathname: string,
  body: Buffer,
  contentType: string,
  deps?: RehostDeps,
): Promise<{ url: string; access: BlobAccess }> {
  const order = blobAccessOrder(deps?.blobAccess);
  const sdkPut = deps?.sdkPut ?? defaultSdkPut;
  let lastErr: unknown;
  for (let i = 0; i < order.length; i++) {
    const access = order[i]!;
    try {
      const result = await sdkPut(pathname, body, { access, contentType });
      if (!result?.url) throw new RehostError("Blob upload returned no URL", 502, "blob_failed");
      return { url: result.url, access };
    } catch (err) {
      lastErr = err;
      const canFallback =
        access === "public" &&
        order[i + 1] === "private" &&
        isPrivateStorePublicAccessError(err);
      if (canFallback) continue;
      if (err instanceof RehostError) throw err;
      throw new RehostError(
        err instanceof Error ? err.message : "Blob upload failed",
        502,
        "blob_failed",
      );
    }
  }
  throw lastErr instanceof RehostError
    ? lastErr
    : new RehostError(
        lastErr instanceof Error ? lastErr.message : "Blob upload failed",
        502,
        "blob_failed",
      );
}

/** Private blob → signed GET URL (7d, works in <img>) or /api/img fallback. */
export async function makeReadableBlobUrl(url: string, deps?: RehostDeps): Promise<string> {
  const canonical = canonicalizeBlobUrl(url);
  if (!isPrivateBlobUrl(canonical)) return toHeroSrc(url, deps?.origin);
  const pathname = blobPathnameFromUrl(canonical);
  if (pathname) {
    try {
      const sign = deps?.signGetUrl ?? ((p, blobUrl) => defaultSignGetUrl(p, blobUrl, deps));
      return await sign(pathname, canonical);
    } catch {
      // Signed URLs are best-effort; /api/img still loads in <img> without cookies.
    }
  }
  return toHeroSrc(canonical, deps?.origin);
}

export async function uploadImageBytes(
  bytes: Uint8Array,
  declaredType?: string | null,
  deps?: RehostDeps,
): Promise<RehostOk> {
  requireBlobReady(deps);
  if (bytes.byteLength === 0) throw new RehostError("Empty file", 400, "empty_file");
  if (bytes.byteLength > MAX_IMAGE_BYTES) {
    throw new RehostError("Image too large (max 8MB)", 413, "too_large");
  }
  const contentType = sniffImageContentType(bytes, declaredType);
  if (!contentType) {
    throw new RehostError("Unsupported image type (jpeg, png, webp, gif, avif)", 415, "unsupported_type");
  }
  const pathname = `listings/${randomBytes(16).toString("hex")}.${extFor(contentType)}`;
  let uploaded: { url: string };
  if (deps?.put) {
    uploaded = await deps.put(pathname, Buffer.from(bytes), contentType);
  } else {
    uploaded = await putListingBlob(pathname, Buffer.from(bytes), contentType, deps);
  }
  if (!uploaded?.url) throw new RehostError("Blob upload returned no URL", 502, "blob_failed");
  return { ok: true, url: await makeReadableBlobUrl(uploaded.url, deps) };
}

async function fetchPublicImage(url: string, deps?: RehostDeps): Promise<Response> {
  const doFetch = deps?.fetch ?? fetch;
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    assertPublicImageUrl(current);
    let res: Response;
    try {
      res = await doFetch(current, {
        method: "GET",
        redirect: "manual",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        headers: {
          Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
          "User-Agent": BROWSER_UA,
          Referer: "https://www.facebook.com/",
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Download failed";
      throw new RehostError(`Failed to download image: ${message}`, 502, "download_failed");
    }
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) throw new RehostError("Redirect missing Location", 502, "download_failed");
      current = new URL(loc, current).toString();
      continue;
    }
    if (!res.ok) {
      throw new RehostError(`Failed to download image (${res.status})`, 502, "download_failed");
    }
    return res;
  }
  throw new RehostError("Too many redirects", 502, "download_failed");
}

export async function rehostRemoteUrl(url: string, deps?: RehostDeps): Promise<RehostOk> {
  const trimmed = unwrapOwnedImageUrl(url.trim());
  if (isOwnedBlobUrl(trimmed)) return { ok: true, url: await makeReadableBlobUrl(trimmed, deps) };
  assertPublicImageUrl(trimmed);
  requireBlobReady(deps);
  const res = await fetchPublicImage(trimmed, deps);
  const len = Number(res.headers.get("content-length") || 0);
  if (len > MAX_IMAGE_BYTES) throw new RehostError("Image too large (max 8MB)", 413, "too_large");
  const buf = new Uint8Array(await res.arrayBuffer());
  return uploadImageBytes(buf, res.headers.get("content-type"), deps);
}

export type ProcessListingImagesResult = {
  images: string[];
  rehosted: number;
  failed: string[];
  skipped: number;
};

/**
 * Rehost usable listing image URLs to Vercel Blob.
 * Already-owned blob URLs are kept. If Blob env is missing, URLs are returned as-is.
 */
export async function processListingImages(
  raw: string[] | null | undefined,
  deps?: RehostDeps,
): Promise<ProcessListingImagesResult> {
  const incoming = cleanImages(raw);
  const failed: string[] = [];
  if (!blobWriteReady(deps)) {
    return { images: incoming, rehosted: 0, failed, skipped: incoming.filter(needsRehost).length };
  }
  const images: string[] = [];
  let rehosted = 0;
  for (const url of incoming) {
    if (isOwnedBlobUrl(url)) {
      images.push(await makeReadableBlobUrl(url, deps));
      continue;
    }
    try {
      if (url.startsWith("data:image/")) {
        const comma = url.indexOf(",");
        if (comma < 0) throw new RehostError("Invalid data URI", 400, "invalid_data_uri");
        const meta = url.slice(5, comma);
        const b64 = url.slice(comma + 1);
        const bytes = Buffer.from(b64, "base64");
        const declared = meta.split(";")[0] ?? "image/jpeg";
        const out = await uploadImageBytes(bytes, declared, deps);
        images.push(out.url);
        rehosted += 1;
        continue;
      }
      const out = await rehostRemoteUrl(url, deps);
      images.push(out.url);
      if (out.url !== url) rehosted += 1;
    } catch {
      failed.push(url);
      images.push(url);
    }
  }
  return { images, rehosted, failed, skipped: 0 };
}

export async function rehostFromRequest(request: Request, deps?: RehostDeps): Promise<RehostOk> {
  const origin = deps?.origin ?? siteOrigin(new URL(request.url).origin);
  const resolved: RehostDeps = { ...deps, origin };
  const ct = request.headers.get("content-type") ?? "";
  if (ct.includes("multipart/form-data")) {
    const form = await request.formData();
    const file = form.get("file") ?? form.get("image");
    const urlField = form.get("url");
    if (file instanceof Blob && file.size > 0) {
      return uploadImageBytes(new Uint8Array(await file.arrayBuffer()), file.type, resolved);
    }
    if (typeof urlField === "string" && urlField.trim()) {
      return rehostRemoteUrl(urlField.trim(), resolved);
    }
    throw new RehostError('Provide multipart field "file"/"image" or "url"', 400, "missing_input");
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new RehostError("Invalid JSON", 400, "invalid_json");
  }
  if (!body || typeof body !== "object") {
    throw new RehostError('Body must be { "url": "https://…" } or a multipart file', 400, "invalid_body");
  }
  const url = (body as { url?: unknown }).url;
  if (typeof url !== "string" || !url.trim()) {
    throw new RehostError('Body must include url: "https://…"', 400, "missing_url");
  }
  return rehostRemoteUrl(url.trim(), resolved);
}

export async function rehostBackfill(opts: { id?: string; limit?: number } = {}, deps?: RehostDeps) {
  requireBlobReady(deps);
  const { getDb } = await import("./helpers.ts");
  const sql = await getDb();
  const id = opts.id?.trim();
  const limit = Math.min(Math.max(opts.limit ?? 25, 1), 50);
  const rows = id
    ? await sql<{ id: string; images: string }>`select id, images from services where id = ${id} limit 1`
    : await sql<{ id: string; images: string }>`
        select id, images from services
        where status = 'active'
        order by created_at desc
        limit ${limit}
      `;
  if (id && !rows[0]) {
    const err = new RehostError("Listing not found", 404, "not_found");
    throw err;
  }
  const updated: { id: string; images: string[]; cover: string | null; rehosted: number }[] = [];
  for (const row of rows) {
    const current = parseImages(row.images);
    if (!current.some(needsRehost)) continue;
    const processed = await processListingImages(current, deps);
    if (processed.rehosted === 0) continue;
    await sql`update services set images = ${JSON.stringify(processed.images)} where id = ${row.id}`;
    updated.push({
      id: row.id,
      images: processed.images,
      cover: processed.images[0] ?? null,
      rehosted: processed.rehosted,
    });
  }
  return { ok: true as const, updated, scanned: rows.length };
}

/** Alias used by POST /api/agent/rehost. */
export async function rehostRemoteImage(raw: string, deps?: RehostDeps): Promise<RehostOk> {
  return rehostRemoteUrl(raw, deps);
}
