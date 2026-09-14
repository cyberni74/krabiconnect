/**
 * Same-origin owned URLs for listing photos that browsers cannot load
 * directly (Facebook CDN hotlink protection). Safe to import from client or server.
 *
 * Listing `<img src>` uses a relative `/api/img?u=` so photos load on the
 * Vercel host even when SITE_URL points at a parked custom domain.
 * Public Vercel Blob HTTPS URLs are valid covers (same allowlist as Facebook CDN).
 * Listing cards may use the Blob URL directly or `/api/img?u=` (same-origin).
 */

import { isFacebookFbidHtmlUrl, parseImages } from "./utils.ts";

export { isFacebookFbidHtmlUrl };

export const IMAGE_PROXY_PATH = "/api/img";

function readEnv(key: string): string {
  try {
    return (typeof process !== "undefined" ? process.env[key] : undefined)?.trim() || "";
  } catch {
    return "";
  }
}

/** Public site origin with no trailing slash, or "" for relative proxy URLs. */
export function publicSiteUrl(): string {
  const site = readEnv("SITE_URL").replace(/\/+$/, "");
  if (site) return /^https?:\/\//i.test(site) ? site : `https://${site}`;
  const host = readEnv("VITE_PUBLIC_HOSTNAME") || readEnv("VERCEL_PROJECT_PRODUCTION_URL") || readEnv("VERCEL_URL");
  if (!host) return "";
  if (/^https?:\/\//i.test(host)) return host.replace(/\/+$/, "");
  return `https://${host.replace(/\/+$/, "")}`;
}

function hostnameOf(url: URL): string {
  return url.hostname.replace(/\.$/, "").replace(/^www\./i, "").toLowerCase();
}

function normalizeHost(hostname: string): string {
  return hostname.replace(/\.$/, "").toLowerCase();
}

/**
 * Public Vercel Blob hosts. Production listing-card previously only allowlisted
 * fbcdn/scontent — Blob heroes were treated as invalid covers.
 */
export function isVercelBlobHost(hostname: string): boolean {
  const host = normalizeHost(hostname);
  if (!host) return false;
  return (
    host === "blob.vercel-storage.com" ||
    host.endsWith(".blob.vercel-storage.com") ||
    host === "public.blob.vercel-storage.com" ||
    host.includes("public.blob.vercel-storage.com")
  );
}

/**
 * Cover-host allowlist compiled into listing-card (production `D()` was this check).
 * Facebook CDN + public Vercel Blob. Same-origin `/api/img` paths are handled separately.
 */
export function isHotlinkCdnHost(hostname: string): boolean {
  const host = normalizeHost(hostname);
  if (!host) return false;
  if (host === "fbcdn.net" || host.endsWith(".fbcdn.net")) return true;
  if (host.startsWith("scontent")) return true;
  if (host === "cdninstagram.com" || host.endsWith(".cdninstagram.com")) return true;
  if (host === "fbsbx.com" || host.endsWith(".fbsbx.com")) return true;
  if (host === "blob.vercel-storage.com" || host.endsWith(".blob.vercel-storage.com")) return true;
  if (host === "public.blob.vercel-storage.com" || host.includes("public.blob.vercel-storage.com")) {
    return true;
  }
  return false;
}

/**
 * Hosts allowed as listing covers and `/api/img` proxy targets.
 * Facebook CDN + Vercel Blob (`*.blob.vercel-storage.com` / `public.blob.vercel-storage.com`).
 */
export function isAllowedImageHost(hostname: string): boolean {
  return isHotlinkCdnHost(hostname);
}

function proxyPathname(pathname: string): boolean {
  return pathname === IMAGE_PROXY_PATH || pathname === `${IMAGE_PROXY_PATH}/`;
}

/**
 * If `raw` is already an owned proxy URL, return the inner https target.
 * Otherwise return `raw` trimmed.
 */
export function unwrapOwnedImageUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  try {
    const url = trimmed.startsWith("/") ? new URL(trimmed, "https://owned.invalid") : new URL(trimmed);
    if (proxyPathname(url.pathname)) {
      const inner = url.searchParams.get("u") ?? url.searchParams.get("url");
      if (inner?.trim()) return inner.trim();
    }
    if (url.pathname.startsWith(`${IMAGE_PROXY_PATH}/`)) {
      const rest = url.pathname.slice(IMAGE_PROXY_PATH.length + 1);
      if (rest) {
        try {
          return decodeURIComponent(rest);
        } catch {
          return rest;
        }
      }
    }
  } catch {
    return trimmed;
  }
  return trimmed;
}

export function isOwnedProxyUrl(raw: string): boolean {
  return unwrapOwnedImageUrl(raw) !== raw.trim();
}

export function needsOwnedProxy(raw: string): boolean {
  const inner = unwrapOwnedImageUrl(raw);
  if (!inner || inner.startsWith("data:")) return false;
  try {
    const host = hostnameOf(new URL(inner));
    // Public Blob is a valid <img src> (HEAD 200). Only Facebook CDN needs /api/img.
    if (isVercelBlobHost(host)) return false;
    return isHotlinkCdnHost(host);
  } catch {
    return false;
  }
}

/**
 * Map a stored listing photo to a display URL.
 * Facebook CDN → `/api/img?u=…`. Public Vercel Blob HTTPS stays as-is (allowlisted).
 * Pass `origin` only when an absolute URL is required (emails, agent payloads).
 */
export function toOwnedImageUrl(raw: string, origin = ""): string {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith("data:image/")) return trimmed;
  if (isFacebookFbidHtmlUrl(trimmed)) return trimmed;
  const inner = unwrapOwnedImageUrl(trimmed);
  if (isFacebookFbidHtmlUrl(inner)) return inner;
  // Public Blob is a valid <img src> — never wrap it through /api/img.
  if (isVercelBlobImageUrl(inner) || isVercelBlobImageUrl(trimmed)) {
    return isVercelBlobImageUrl(inner) ? inner : trimmed;
  }
  if (!needsOwnedProxy(inner)) return isOwnedProxyUrl(trimmed) ? inner : trimmed;
  const path = `${IMAGE_PROXY_PATH}?u=${encodeURIComponent(inner)}`;
  const base = origin.replace(/\/+$/, "");
  return base ? `${base}${path}` : path;
}

export function toOwnedImageUrls(urls: string[]): string[] {
  return urls.map((u) => toOwnedImageUrl(u));
}

/** Public Vercel Blob HTTPS URLs that are valid listing covers. */
export function isVercelBlobImageUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    return url.protocol === "https:" && isVercelBlobHost(hostnameOf(url));
  } catch {
    return false;
  }
}

function isFacebookHtmlCoverHost(host: string): boolean {
  if (host === "fb.com" || host === "fb.me") return true;
  if (host === "graph.facebook.com" || host.endsWith(".graph.facebook.com")) return false;
  return host === "facebook.com" || host.endsWith(".facebook.com");
}

function coverTarget(raw: string): string {
  return unwrapOwnedImageUrl(raw.trim());
}

/**
 * Cover preference: 1 Blob, 2 https scontent/fbcdn, 3 working /api/img, 4 other https.
 * 0 = never use as a cover (Facebook fbid HTML, empty, unparseable).
 */
export function coverPreferenceRank(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed || isFacebookFbidHtmlUrl(trimmed)) return 0;
  const inner = coverTarget(trimmed);
  if (!inner || isFacebookFbidHtmlUrl(inner)) return 0;
  if (inner.startsWith("data:image/")) return 4;
  if (isVercelBlobImageUrl(inner) || isVercelBlobImageUrl(trimmed)) return 1;
  try {
    const url = inner.startsWith("/") ? new URL(inner, "https://owned.invalid") : new URL(inner);
    if (proxyPathname(url.pathname) || url.pathname.startsWith(`${IMAGE_PROXY_PATH}/`)) {
      return 0;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return 0;
    const host = hostnameOf(url);
    if (isVercelBlobHost(host)) return 1;
    if (isAllowedImageHost(host)) return 2;
    if (isFacebookHtmlCoverHost(host) && !url.pathname.includes("/picture")) return 0;
    if (isOwnedProxyUrl(trimmed) && isAllowedImageHost(host)) return 3;
    if (isDisplayableCoverUrl(inner) || isDisplayableCoverUrl(trimmed)) return 4;
    return 0;
  } catch {
    return 0;
  }
}

/** True when `raw` can be used as an `<img src>` cover (blob, proxy, https, data URI). */
export function isDisplayableCoverUrl(raw: unknown): raw is string {
  if (typeof raw !== "string") return false;
  const trimmed = raw.trim();
  if (!trimmed) return false;
  if (isFacebookFbidHtmlUrl(trimmed)) return false;
  if (trimmed.startsWith("data:image/")) return true;
  const inner = coverTarget(trimmed);
  if (!inner || isFacebookFbidHtmlUrl(inner)) return false;
  if (isVercelBlobImageUrl(inner) || isVercelBlobImageUrl(trimmed)) return true;
  try {
    const url = inner.startsWith("/")
      ? new URL(inner, "https://owned.invalid")
      : new URL(inner);
    if (proxyPathname(url.pathname) || url.pathname.startsWith(`${IMAGE_PROXY_PATH}/`)) {
      return false;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const host = hostnameOf(url);
    if (isAllowedImageHost(host)) return true;
    if (isFacebookHtmlCoverHost(host) && !url.pathname.includes("/picture")) return false;
    return true;
  } catch {
    return false;
  }
}

export type CoverSource = {
  coverUrl?: string | null;
  cover?: string | null;
  image?: string | null;
  images?: unknown;
};

function coverCandidates(source: CoverSource): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const candidate of [source.coverUrl, source.cover, source.image, ...parseImages(source.images)]) {
    if (typeof candidate !== "string") continue;
    const trimmed = candidate.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    if (isFacebookFbidHtmlUrl(trimmed)) continue;
    if (coverPreferenceRank(trimmed) === 0) continue;
    if (!isDisplayableCoverUrl(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  out.sort((a, b) => coverPreferenceRank(a) - coverPreferenceRank(b));
  return out;
}

/** Drop fbid HTML and put Blob / fbcdn heroes ahead of weaker URLs. */
export function preferCoverImages(urls: string[]): string[] {
  return coverCandidates({ images: urls });
}

/**
 * First usable listing hero. Skips facebook.com/photo and fbid HTML.
 * Prefers public Vercel Blob, then https scontent/fbcdn, then /api/img.
 */
export function pickCoverImage(source: CoverSource): string | undefined {
  const best = coverCandidates(source)[0];
  if (!best) return undefined;
  const inner = coverTarget(best);
  if (isVercelBlobImageUrl(inner)) return inner;
  return best;
}

/** Ranked display URLs for `<img src>` (Blob as-is; Facebook CDN through `/api/img`). */
export function listingCoverSrcs(source: CoverSource, origin = ""): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const candidate of coverCandidates(source)) {
    const src = toOwnedImageUrl(candidate, origin);
    if (!src || isFacebookFbidHtmlUrl(src) || !isDisplayableCoverUrl(src)) continue;
    if (seen.has(src)) continue;
    seen.add(src);
    out.push(src);
  }
  return out;
}

/** Cover URL for `<img src>`: Blob HTTPS as-is; Facebook CDN through `/api/img`. */
export function listingCoverSrc(source: CoverSource, origin = ""): string | undefined {
  return listingCoverSrcs(source, origin)[0];
}
