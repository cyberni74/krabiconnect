/**
 * Same-origin owned URLs for listing photos that browsers cannot load
 * directly (Facebook CDN hotlink protection). Safe to import from client or server.
 *
 * Listing `<img src>` uses a relative `/api/img?u=` so photos load on the
 * Vercel host even when SITE_URL points at a parked custom domain.
 * Public Vercel Blob HTTPS URLs are valid covers and are not rewritten.
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

/** Hosts the image proxy is allowed to fetch (Facebook CDN + Vercel Blob). */
export function isAllowedImageHost(hostname: string): boolean {
  const host = hostname.replace(/\.$/, "").toLowerCase();
  if (!host) return false;
  if (host === "fbcdn.net" || host.endsWith(".fbcdn.net")) return true;
  if (host.startsWith("scontent")) return true;
  if (host === "cdninstagram.com" || host.endsWith(".cdninstagram.com")) return true;
  if (host === "fbsbx.com" || host.endsWith(".fbsbx.com")) return true;
  if (host === "blob.vercel-storage.com" || host.endsWith(".blob.vercel-storage.com")) return true;
  if (host === "public.blob.vercel-storage.com" || host.endsWith(".public.blob.vercel-storage.com")) {
    return true;
  }
  return false;
}

/** Facebook / Instagram CDN hosts that blank out in <img> due to hotlink checks. */
export function isHotlinkCdnHost(hostname: string): boolean {
  const host = hostname.replace(/\.$/, "").toLowerCase();
  if (host === "fbcdn.net" || host.endsWith(".fbcdn.net")) return true;
  if (host.startsWith("scontent")) return true;
  if (host === "cdninstagram.com" || host.endsWith(".cdninstagram.com")) return true;
  if (host === "fbsbx.com" || host.endsWith(".fbsbx.com")) return true;
  return false;
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
    return isHotlinkCdnHost(hostnameOf(new URL(inner)));
  } catch {
    return false;
  }
}

/**
 * Map a stored listing photo to a same-origin owned URL.
 * Facebook CDN (and already-proxied URLs on any host, e.g. a parked SITE_URL)
 * → `/api/img?u=…` so the browser hits the Vercel app, not a foreign origin.
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

/** Public Vercel Blob HTTPS hosts that are valid listing covers (HEAD 200, no proxy). */
export function isVercelBlobImageUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:") return false;
    const host = hostnameOf(url);
    return (
      host === "blob.vercel-storage.com" ||
      host.endsWith(".blob.vercel-storage.com") ||
      host === "public.blob.vercel-storage.com" ||
      host.endsWith(".public.blob.vercel-storage.com")
    );
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
 * public `*.public.blob.vercel-storage.com` HTTPS URLs. Does not require an
 * owned `/api/img` host.
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

/** Cover URL for `<img src>`: Blob HTTPS stays as-is; Facebook CDN goes through `/api/img`. */
export function listingCoverSrc(source: CoverSource, origin = ""): string | undefined {
  const picked = pickCoverImage(source);
  if (!picked) return undefined;
  return toOwnedImageUrl(picked, origin);
}
