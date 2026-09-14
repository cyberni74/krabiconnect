import { hasThaiScript, isUsableEnglish } from "./th-en-fallback.ts";

export type OverlayRow = {
  id: string;
  title_th: string;
  title_en: string;
  description_th: string;
  description_en: string;
};

export type ListingOverlayInput = {
  id: string;
  titleTh?: string;
  titleEn?: string;
  descriptionTh?: string;
  descriptionEn?: string;
};

export type OverlayPlan = {
  skip: boolean;
  alreadyEnglish: boolean;
  thaiTitle: string;
  thaiDesc: string;
  restoreThaiSource: boolean;
};

/** Decide whether a services row needs an English overlay write. */
export function overlaySource(row: OverlayRow): OverlayPlan {
  const thaiTitle = hasThaiScript(row.title_th)
    ? row.title_th
    : hasThaiScript(row.title_en)
      ? row.title_en
      : "";
  const thaiDesc = hasThaiScript(row.description_th)
    ? row.description_th
    : hasThaiScript(row.description_en)
      ? row.description_en
      : (row.description_th ?? "");
  const alreadyEnglish = isUsableEnglish(row.title_en);
  const skip = !thaiTitle || alreadyEnglish;
  const restoreThaiSource = !hasThaiScript(row.title_th) && hasThaiScript(row.title_en);
  return { skip, alreadyEnglish, thaiTitle, thaiDesc, restoreThaiSource };
}

export function overlayRowFromClient(listing: ListingOverlayInput): OverlayRow {
  return {
    id: listing.id,
    title_th: listing.titleTh ?? "",
    title_en: listing.titleEn ?? "",
    description_th: listing.descriptionTh ?? "",
    description_en: listing.descriptionEn ?? "",
  };
}

export type AgentListingPatch = {
  images?: unknown;
  titleEn?: string;
  descriptionEn?: string;
  translate?: boolean;
};

function readString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

/** PATCH body: images and/or English overlay fields. Thai columns stay untouched. */
export function parseAgentListingPatch(body: unknown): AgentListingPatch {
  if (!body || typeof body !== "object") return {};
  const rec = body as Record<string, unknown>;
  const titleEn = readString(rec.titleEn) ?? readString(rec.title_en);
  const descriptionEn = readString(rec.descriptionEn) ?? readString(rec.description_en);
  const images = "images" in rec ? rec.images : undefined;
  const translate = rec.translate === true || rec.seedTranslation === true;
  return { images, titleEn, descriptionEn, translate };
}

export function assertEnglishOverlayField(name: string, value: string) {
  if (!isUsableEnglish(value)) {
    const err = new Error(`${name} must be English (no Thai script)`);
    throw err;
  }
}

export function hasAgentListingPatch(patch: AgentListingPatch): boolean {
  if (patch.translate) return true;
  if (patch.titleEn || patch.descriptionEn) return true;
  return patch.images !== undefined;
}
