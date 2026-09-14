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

/**
 * Always-defined listing copy for JSON to the client.
 * Reads `titleEn`/`title_en` and `descriptionEn`/`description_en` so a
 * snake_case Neon row or an already-mapped DTO both serialize the EN fields.
 */
export function listingCopyFields(row: ListingCopyRow | null | undefined): {
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
} {
  const r = row ?? {};
  return {
    titleTh: firstCopy(r.titleTh, r.title_th),
    titleEn: firstCopy(r.titleEn, r.title_en),
    descriptionTh: firstCopy(r.descriptionTh, r.description_th),
    descriptionEn: firstCopy(r.descriptionEn, r.description_en),
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
