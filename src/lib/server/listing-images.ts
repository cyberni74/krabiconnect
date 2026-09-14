import { parseImages } from "../utils.ts";
import { toOwnedImageUrl, unwrapOwnedImageUrl } from "../owned-image.ts";

const MAX_IMAGES = 8;

/** Facebook HTML pages (photo.php?fbid=, marketplace items) — not renderable in <img>. */
const FACEBOOK_HTML_HOSTS = new Set([
  "facebook.com",
  "m.facebook.com",
  "web.facebook.com",
  "mbasic.facebook.com",
  "business.facebook.com",
  "l.facebook.com",
  "lm.facebook.com",
  "fb.com",
  "fb.me",
]);

function hostnameOf(url: URL): string {
  return url.hostname.replace(/^www\./i, "").toLowerCase();
}

function isFacebookHtmlHost(host: string): boolean {
  if (FACEBOOK_HTML_HOSTS.has(host)) return true;
  return host.endsWith(".facebook.com") && !host.includes("graph.facebook.com");
}

function isFacebookCdnHost(host: string): boolean {
  return (
    host === "fbcdn.net" ||
    host.endsWith(".fbcdn.net") ||
    host === "cdninstagram.com" ||
    host.endsWith(".cdninstagram.com") ||
    host === "fbsbx.com" ||
    host.endsWith(".fbsbx.com")
  );
}

function isGraphPicture(url: URL, host: string): boolean {
  if (host !== "graph.facebook.com" && !host.endsWith(".graph.facebook.com")) return false;
  return url.pathname.includes("/picture");
}

/**
 * True when `url` can be used as a listing photo (HTTPS/HTTP image or data URI).
 * Facebook `photo.php?fbid=` / marketplace HTML pages are not usable.
 */
export function isUsableListingImage(url: string): boolean {
  const u = unwrapOwnedImageUrl(url.trim());
  if (!u) return false;
  if (u.startsWith("data:image/")) return true;
  if (!/^https?:\/\//i.test(u)) return false;
  let parsed: URL;
  try {
    parsed = new URL(u);
  } catch {
    return false;
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
  const host = hostnameOf(parsed);
  if (isFacebookCdnHost(host)) return true;
  if (isGraphPicture(parsed, host)) return true;
  if (isFacebookHtmlHost(host)) return false;
  return true;
}

export function cleanImages(raw?: string[] | null): string[] {
  return (raw ?? [])
    .filter((u): u is string => typeof u === "string")
    .map((u) => u.trim())
    .filter(isUsableListingImage)
    .map((u) => toOwnedImageUrl(u))
    .slice(0, MAX_IMAGES);
}

export function hasUsableImages(stored: unknown): boolean {
  return parseImages(stored).some(isUsableListingImage);
}

/**
 * On a duplicate POST: apply incoming images only when they are usable and the
 * existing row has none (empty, missing, or only Facebook fbid HTML).
 * Returns the images to persist, or null when the row should be left as-is.
 */
export function imagesToApplyOnDuplicate(
  incomingRaw: string[] | null | undefined,
  existingStored: unknown,
): string[] | null {
  const incoming = cleanImages(incomingRaw);
  if (incoming.length === 0) return null;
  if (hasUsableImages(existingStored)) return null;
  return incoming;
}
