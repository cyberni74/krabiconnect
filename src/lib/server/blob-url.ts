/** Vercel Blob listing-image URLs. Private stores are not <img>-safe without a read URL. */

export const IMAGE_PROXY_PATH = "/api/img";
export const PRIVATE_STORE_PUBLIC_ACCESS_RE =
  /cannot use public access on a private store/i;

export type BlobAccess = "public" | "private";
export type BlobAccessMode = BlobAccess | "auto";

export function siteOrigin(explicit?: string | null): string | undefined {
  const fromArg = explicit?.trim();
  if (fromArg) return fromArg.replace(/\/$/, "");
  const site = process.env.SITE_URL?.trim();
  if (site) return site.replace(/\/$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//i, "").replace(/\/$/, "");
    if (host) return `https://${host}`;
  }
  return undefined;
}

export function blobAccessMode(explicit?: string | null): BlobAccessMode {
  const v = (explicit ?? process.env.BLOB_ACCESS ?? "").trim().toLowerCase();
  if (v === "private" || v === "public") return v;
  return "auto";
}

export function blobAccessOrder(explicit?: string | null): BlobAccess[] {
  const mode = blobAccessMode(explicit);
  if (mode === "private") return ["private"];
  if (mode === "public") return ["public"];
  return ["public", "private"];
}

export function isPrivateStorePublicAccessError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err ?? "");
  return PRIVATE_STORE_PUBLIC_ACCESS_RE.test(msg);
}

function hostnameOf(url: URL): string {
  return url.hostname.replace(/^\[|\]$/g, "").replace(/\.$/, "").toLowerCase();
}

export function isVercelBlobHost(url: string): boolean {
  try {
    const host = hostnameOf(new URL(url));
    return host === "blob.vercel-storage.com" || host.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function isPrivateBlobUrl(url: string): boolean {
  try {
    return hostnameOf(new URL(url)).includes(".private.blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function isImageProxyUrl(url: string): boolean {
  const trimmed = url.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith(`${IMAGE_PROXY_PATH}?`) || trimmed === IMAGE_PROXY_PATH) return true;
  try {
    const parsed = new URL(trimmed, "https://krabimarketplace.vercel.app");
    return parsed.pathname === IMAGE_PROXY_PATH || parsed.pathname.startsWith(`${IMAGE_PROXY_PATH}/`);
  } catch {
    return false;
  }
}

export function innerUrlFromProxy(url: string): string | null {
  if (!isImageProxyUrl(url)) return null;
  try {
    const parsed = new URL(url.trim(), "https://krabimarketplace.vercel.app");
    const fromQuery = parsed.searchParams.get("u") ?? parsed.searchParams.get("url");
    if (fromQuery?.trim()) return fromQuery.trim();
    if (parsed.pathname.startsWith(`${IMAGE_PROXY_PATH}/`)) {
      const rest = parsed.pathname.slice(IMAGE_PROXY_PATH.length + 1);
      if (!rest) return null;
      try {
        return decodeURIComponent(rest);
      } catch {
        return rest;
      }
    }
  } catch {
    return null;
  }
  return null;
}

/** Strip signed-url query params and unwrap /api/img so we persist a stable blob URL. */
export function canonicalizeBlobUrl(url: string): string {
  const trimmed = url.trim();
  const inner = innerUrlFromProxy(trimmed);
  if (inner && inner !== trimmed) return canonicalizeBlobUrl(inner);
  try {
    const parsed = new URL(trimmed);
    parsed.hash = "";
    for (const key of [...parsed.searchParams.keys()]) {
      if (key.startsWith("vercel-blob-") || key === "cache") parsed.searchParams.delete(key);
    }
    const qs = parsed.searchParams.toString();
    parsed.search = qs ? `?${qs}` : "";
    return parsed.toString();
  } catch {
    return trimmed;
  }
}

export function blobPathnameFromUrl(url: string): string | null {
  try {
    const parsed = new URL(canonicalizeBlobUrl(url));
    const path = decodeURIComponent(parsed.pathname.replace(/^\/+/, ""));
    return path || null;
  } catch {
    return null;
  }
}

export function isOwnedBlobUrl(url: string): boolean {
  const canonical = canonicalizeBlobUrl(url);
  if (isVercelBlobHost(canonical)) return true;
  if (isImageProxyUrl(url)) {
    const inner = innerUrlFromProxy(url);
    return inner ? isVercelBlobHost(inner) : false;
  }
  return false;
}

/**
 * <img src> for listing heroes. Public blob URLs stay on the CDN.
 * Private blob URLs go through GET /api/img (no cookies, does not expire).
 */
export function toHeroSrc(url: string, origin?: string | null): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  if (isImageProxyUrl(trimmed)) {
    const inner = innerUrlFromProxy(trimmed);
    if (inner && isPrivateBlobUrl(inner)) {
      return absoluteProxyUrl(canonicalizeBlobUrl(inner), origin);
    }
    if (inner && isVercelBlobHost(inner) && !isPrivateBlobUrl(inner)) {
      return canonicalizeBlobUrl(inner);
    }
    return trimmed;
  }
  const canonical = canonicalizeBlobUrl(trimmed);
  if (isPrivateBlobUrl(canonical)) return absoluteProxyUrl(canonical, origin);
  return canonical || trimmed;
}

function absoluteProxyUrl(canonicalBlobUrl: string, origin?: string | null): string {
  const path = `${IMAGE_PROXY_PATH}?u=${encodeURIComponent(canonicalBlobUrl)}`;
  const base = siteOrigin(origin);
  return base ? `${base}${path}` : path;
}
