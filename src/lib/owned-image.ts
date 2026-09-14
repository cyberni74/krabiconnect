/**
 * Same-origin owned URLs for listing photos that browsers cannot load
 * directly (Facebook CDN hotlink protection). Safe to import from client or server.
 *
 * SITE_URL (optional): public origin, e.g. https://your-app.vercel.app
 * Falls back to VITE_PUBLIC_HOSTNAME / VERCEL_URL. Empty → relative `/api/img?u=`.
 */

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
 * Map a stored listing photo to an owned HTTPS (or same-origin) URL.
 * Facebook CDN → `${SITE_URL}/api/img?u=…`. Already-proxied and non-CDN URLs pass through.
 */
export function toOwnedImageUrl(raw: string, origin = publicSiteUrl()): string {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.startsWith("data:image/")) return trimmed;
  if (isOwnedProxyUrl(trimmed)) return trimmed;
  if (!needsOwnedProxy(trimmed)) return trimmed;
  const path = `${IMAGE_PROXY_PATH}?u=${encodeURIComponent(unwrapOwnedImageUrl(trimmed))}`;
  const base = origin.replace(/\/+$/, "");
  return base ? `${base}${path}` : path;
}

export function toOwnedImageUrls(urls: string[]): string[] {
  return urls.map((u) => toOwnedImageUrl(u));
}
