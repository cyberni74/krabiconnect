import { parseImages } from "../utils.ts";
import { isDisplayableCoverUrl, toOwnedImageUrl } from "../owned-image.ts";

const MAX_IMAGES = 8;

/**
 * True when `url` can be used as a listing photo (HTTPS/HTTP image or data URI).
 * Facebook `photo.php?fbid=` / marketplace HTML pages are not usable.
 * Vercel Blob and same-origin `/api/img` share the listing-card cover allowlist.
 */
export function isUsableListingImage(url: string): boolean {
  return isDisplayableCoverUrl(url);
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
