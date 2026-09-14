/** Snake_case DB columns and camelCase DTO keys for listing copy. */
export type ListingCopyRow = {
  titleTh?: string | null;
  titleEn?: string | null;
  title_th?: string | null;
  title_en?: string | null;
  descriptionTh?: string | null;
  descriptionEn?: string | null;
  description_th?: string | null;
  description_en?: string | null;
};

function asText(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (value == null) return undefined;
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function firstCopy(...vals: unknown[]): string {
  let blank = "";
  for (const v of vals) {
    const s = asText(v);
    if (s === undefined) continue;
    if (s.trim()) return s;
    blank = s;
  }
  return blank;
}

function readCopy(row: object, ...keys: string[]): unknown[] {
  const rec = row as Record<string, unknown>;
  return keys.map((k) => rec[k]);
}

/**
 * Always-defined listing copy for JSON to the client.
 * Discover feed maps Neon `title_en`/`description_en` onto `titleEn`/`descriptionEn`
 * (camelCase aliases accepted). DB snake_case wins when both are nonempty.
 */
export function listingCopyFields(row: ListingCopyRow | Record<string, unknown> | null | undefined): {
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
} {
  const r = row ?? {};
  return {
    titleTh: firstCopy(...readCopy(r, "title_th", "titleTh")),
    titleEn: firstCopy(...readCopy(r, "title_en", "titleEn")),
    descriptionTh: firstCopy(...readCopy(r, "description_th", "descriptionTh")),
    descriptionEn: firstCopy(...readCopy(r, "description_en", "descriptionEn")),
  };
}

/** Prefer a live overlay only when it is nonempty; otherwise keep mapped card copy. */
export function overlayOrMapped(
  overlay: { titleEn?: string | null; descriptionEn?: string | null } | null | undefined,
  card: ListingCopyRow,
): { titleTh: string; titleEn: string; descriptionTh: string; descriptionEn: string } {
  const copy = listingCopyFields(card);
  return {
    titleTh: copy.titleTh,
    descriptionTh: copy.descriptionTh,
    titleEn: firstCopy(overlay?.titleEn, copy.titleEn),
    descriptionEn: firstCopy(overlay?.descriptionEn, copy.descriptionEn),
  };
}

export function withListingCopy<T extends ListingCopyRow>(card: T): T & {
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
} {
  return { ...card, ...listingCopyFields(card) };
}
