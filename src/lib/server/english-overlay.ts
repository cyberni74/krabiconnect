import type { Sql } from "@/lib/db";
import { englishOverlayPatch, listingNeedsEnglish, mergeOverlay } from "@/lib/english-overlay";
import type { FeedCard } from "@/lib/types";

export type CachedEnglish = { id: string; titleEn: string; descriptionEn: string };

const TRANSLATE_CONCURRENCY = 4;

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  if (items.length === 0) return [];
  const out: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]!);
    }
  }
  const n = Math.min(limit, items.length);
  await Promise.all(Array.from({ length: n }, () => worker()));
  return out;
}

type OverlayRow = {
  id: string;
  title_th: string;
  title_en: string;
  description_th: string;
  description_en: string;
};

function asFields(row: OverlayRow) {
  return {
    titleTh: row.title_th ?? "",
    titleEn: row.title_en ?? "",
    descriptionTh: row.description_th ?? "",
    descriptionEn: row.description_en ?? "",
  };
}

/**
 * Translate Thai-only listings into English and cache on title_en / description_en.
 * Never writes title_th / description_th.
 */
export async function cacheEnglishOverlays(sql: Sql, ids: string[]): Promise<CachedEnglish[]> {
  const unique = [...new Set(ids.filter((id) => typeof id === "string" && id.trim()))];
  if (unique.length === 0 || !process.env.XAI_API_KEY) return [];
  const placeholders = unique.map((_, i) => `$${i + 1}`).join(", ");
  const rows = await sql.query<OverlayRow>(
    `select id, title_th, title_en, description_th, description_en from services where id in (${placeholders})`,
    unique,
  );
  const todo = rows.filter((row) => listingNeedsEnglish(asFields(row)));
  if (todo.length === 0) return [];

  const results = await mapPool(todo, TRANSLATE_CONCURRENCY, async (row) => {
    const fields = asFields(row);
    const thaiTitle = fields.titleTh || fields.titleEn;
    const thaiDesc = fields.descriptionTh || fields.descriptionEn || thaiTitle;
    try {
      const { translateListing } = await import("./translate");
      const overlay = await translateListing(thaiTitle, thaiDesc, "th");
      const patch = englishOverlayPatch(fields, overlay);
      if (!patch) return null;
      await sql`
        update services set
          title_en = ${patch.titleEn},
          description_en = ${patch.descriptionEn}
        where id = ${row.id}
      `;
      return { id: row.id, titleEn: patch.titleEn, descriptionEn: patch.descriptionEn };
    } catch {
      return null;
    }
  });

  return results.filter((row): row is CachedEnglish => Boolean(row));
}

/** When locale is English, fill missing overlays for every returned card and merge into the payload. */
export async function withEnglishOverlays<T extends FeedCard>(
  cards: T[],
  locale?: string | null,
): Promise<T[]> {
  if (locale !== "en" || cards.length === 0) return cards;
  const needed = cards.filter((c) =>
    listingNeedsEnglish({
      titleTh: c.titleTh,
      titleEn: c.titleEn,
      descriptionTh: c.descriptionTh,
      descriptionEn: c.descriptionEn,
    }),
  );
  if (needed.length === 0) return cards;
  const { getDb } = await import("./helpers");
  const sql = await getDb();
  const filled = await cacheEnglishOverlays(
    sql,
    needed.map((c) => c.id),
  );
  if (filled.length === 0) return cards;
  const byId = new Map(filled.map((row) => [row.id, row]));
  return cards.map((card) => mergeOverlay(card, byId.get(card.id)));
}
