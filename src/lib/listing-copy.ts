import { loc, type Lang } from "./i18n.ts";

/** Fields that may appear on a listing, service, or conversation row. */
export type ListingCopySource = {
  id?: string;
  titleTh?: string | null;
  titleEn?: string | null;
  title_th?: string | null;
  title_en?: string | null;
  descriptionTh?: string | null;
  descriptionEn?: string | null;
  description_th?: string | null;
  description_en?: string | null;
  listingTitleTh?: string | null;
  listingTitleEn?: string | null;
};

function firstNonEmpty(...vals: Array<string | null | undefined>): string {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
}

export function listingTitleTh(row: ListingCopySource): string {
  return firstNonEmpty(row.titleTh, row.title_th, row.listingTitleTh);
}

export function listingTitleEn(row: ListingCopySource): string {
  return firstNonEmpty(row.titleEn, row.title_en, row.listingTitleEn);
}

export function listingDescriptionTh(row: ListingCopySource): string {
  return firstNonEmpty(row.descriptionTh, row.description_th);
}

export function listingDescriptionEn(row: ListingCopySource): string {
  return firstNonEmpty(row.descriptionEn, row.description_en);
}

export function listingTitle(lang: Lang, row: ListingCopySource, overlayEn?: string): string {
  return loc(lang, listingTitleTh(row), firstNonEmpty(overlayEn, listingTitleEn(row)));
}

export function listingDescription(lang: Lang, row: ListingCopySource, overlayEn?: string): string {
  return loc(lang, listingDescriptionTh(row), firstNonEmpty(overlayEn, listingDescriptionEn(row)));
}
