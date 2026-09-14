/**
 * Same-origin owned URLs for listing photos that browsers cannot load
 * directly (Facebook CDN hotlink protection). Safe to import from client or server.
 *
 * Listing `<img src>` uses a relative `/api/img?u=` so photos load on the
 * Vercel host even when SITE_URL points at a parked custom domain.
 * Public Vercel Blob HTTPS URLs are valid covers (same allowlist as Facebook CDN).
 * Listing cards may use the Blob URL directly or `/api/img?u=` (same-origin).
 */

import { parseImages } from "./utils.ts";

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

/** Hosts listing-card may use as covers / proxy (fbcdn, scontent, instagram, fbsbx, Vercel Blob). */
export function isHotlinkCdnHost(hostname: string): boolean {
  const host = normalizeHost(hostname);
  if (!host) return false;
  if (host === "fbcdn.net" || host.endsWith(".fbcdn.net")) return true;
  if (host.startsWith("scontent")) return true;
  if (host === "cdninstagram.com" || host.endsWith(".cdninstagram.com")) return true;
  if (host === "fbsbx.com" || host.endsWith(".fbsbx.com")) return true;
  return isVercelBlobHost(host);
}

/**
 * Hosts allowed as listing covers and `/api/img` proxy targets.
 * Facebook CDN + Vercel Blob. Same-origin `/api/img` paths are handled separately.
 */
export function isAllowedImageHost(hostname: string): boolean {
  const host = normalizeHost(hostname);
  if (!host) return false;
  return isHotlinkCdnHost(host) || isVercelBlobHost(host);
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
    return isAllowedImageHost(hostnameOf(new URL(inner)));
  } catch {
    return false;
  }
}

/**
 * Map a stored listing photo to a same-origin owned URL.
 * Facebook CDN and Vercel Blob (and already-proxied URLs on any host, e.g. a
 * parked SITE_URL) → `/api/img?u=…` so Discover `<img src>` stays allowlisted.
 * Pass `origin` only when an absolute URL is required (emails, agent payloads).
 */
export function toOwnedImageUrl(raw: string, origin = ""): string {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith("data:image/")) return trimmed;
  const inner = unwrapOwnedImageUrl(trimmed);
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

/** True when `raw` can be used as an `<img src>` cover (blob, proxy, https, data URI). */
export function isDisplayableCoverUrl(raw: unknown): raw is string {
  if (typeof raw !== "string") return false;
  const trimmed = raw.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("data:image/")) return true;
  if (isVercelBlobImageUrl(trimmed)) return true;
  try {
    const url = trimmed.startsWith("/")
      ? new URL(trimmed, "https://owned.invalid")
      : new URL(trimmed);
    if (proxyPathname(url.pathname) || url.pathname.startsWith(`${IMAGE_PROXY_PATH}/`)) {
      return true;
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

/**
 * First usable listing hero. Accepts coverUrl/cover/image/images[], including
 * public `*.public.blob.vercel-storage.com` HTTPS URLs and `/api/img` paths.
 */
export function pickCoverImage(source: CoverSource): string | undefined {
  const candidates: unknown[] = [source.coverUrl, source.cover, source.image, ...parseImages(source.images)];
  for (const candidate of candidates) {
    if (typeof candidate !== "string") continue;
    const trimmed = candidate.trim();
    if (!trimmed) continue;
    if (isVercelBlobImageUrl(trimmed) || isDisplayableCoverUrl(trimmed)) return trimmed;
  }
  return undefined;
}

/** Cover URL for `<img src>`: Blob + Facebook CDN go through `/api/img` (allowlisted). */
export function listingCoverSrc(source: CoverSource, origin = ""): string | undefined {
  const picked = pickCoverImage(source);
  if (!picked) return undefined;
  return toOwnedImageUrl(picked, origin);
}
