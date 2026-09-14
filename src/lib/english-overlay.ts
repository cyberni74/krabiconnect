import { needsEnglishOverlay } from "./i18n.ts";
import { isUsableEnglish } from "./utils.ts";

export type OverlayFields = {
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
};

export function listingNeedsEnglish(row: OverlayFields): boolean {
  return (
    needsEnglishOverlay(row.titleTh, row.titleEn) || needsEnglishOverlay(row.descriptionTh, row.descriptionEn)
  );
}

/**
 * Decide cached English columns. Never returns Thai-column writes.
 * Existing nonempty English is kept; only missing/duplicate Thai EN fields are replaced.
 */
export function englishOverlayPatch(
  row: OverlayFields,
  overlay: { titleEn: string; descriptionEn: string },
): { titleEn: string; descriptionEn: string } | null {
  const titleTh = (row.titleTh ?? "").trim();
  const descTh = (row.descriptionTh ?? "").trim();
  let titleEn = (row.titleEn ?? "").trim();
  let descriptionEn = (row.descriptionEn ?? "").trim();
  let changed = false;
  const nextTitle = (overlay.titleEn ?? "").trim();
  const nextDesc = (overlay.descriptionEn ?? "").trim();
  if (
    needsEnglishOverlay(row.titleTh, row.titleEn) &&
    isUsableEnglish(nextTitle) &&
    nextTitle !== titleTh
  ) {
    titleEn = nextTitle;
    changed = true;
  }
  if (
    needsEnglishOverlay(row.descriptionTh, row.descriptionEn) &&
    isUsableEnglish(nextDesc) &&
    nextDesc !== descTh
  ) {
    descriptionEn = nextDesc;
    changed = true;
  }
  return changed ? { titleEn, descriptionEn } : null;
}

export function mergeOverlay<T extends OverlayFields>(
  card: T,
  overlay: { titleEn: string; descriptionEn: string } | undefined | null,
): T {
  if (!overlay) return card;
  return {
    ...card,
    titleEn: overlay.titleEn || card.titleEn,
    descriptionEn: overlay.descriptionEn || card.descriptionEn,
  };
}
