import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { detectLang } from "@/lib/utils";
import { isUsableEnglish, translateTextPublic } from "./th-en-fallback";
import {
  overlayRowFromClient,
  overlaySource,
  type ListingOverlayInput,
  type OverlayRow,
} from "./listing-overlay";

type Pair = { title: string; description: string };

function extractJson(text: string): Record<string, string> | null {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, string>;
  } catch {
    return null;
  }
}

async function grokJson(prompt: string, system: string): Promise<string | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      max_tokens: 700,
      temperature: 0.2,
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
    }),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return body.choices?.[0]?.message?.content ?? null;
}

async function pairFromGrok(title: string, description: string, source: "en" | "th"): Promise<Pair | null> {
  const target = source === "en" ? "Thai" : "English";
  const raw = await grokJson(
    `Title: ${title}\n\nDescription: ${description}`,
    `Translate this KrabiMarketplace listing into ${target}. Keep Thai place names (Ao Nang, Krabi, Railay). Return ONLY JSON {"title":"...","description":"..."}.`,
  );
  const parsed = raw ? extractJson(raw) : null;
  const tTitle = parsed?.title?.trim();
  const tDesc = parsed?.description?.trim();
  if (!tTitle && !tDesc) return null;
  return { title: tTitle || title, description: tDesc || description };
}

async function pairFromPublicApi(
  title: string,
  description: string,
  source: "en" | "th",
): Promise<Pair | null> {
  const tTitle = await translateTextPublic(title, source);
  const tDesc = description.trim()
    ? await translateTextPublic(description, source)
    : tTitle;
  if (!tTitle && !tDesc) return null;
  return { title: tTitle || title, description: tDesc || description || tTitle || title };
}

function usableForTarget(text: string, source: "en" | "th"): boolean {
  if (source === "th") return isUsableEnglish(text);
  return /[\u0E00-\u0E7F]/.test(text);
}

/**
 * Translate a listing pair. Prefers xAI when XAI_API_KEY is set, otherwise
 * MyMemory / LibreTranslate. Never copies Thai into the English overlay.
 */
export async function translateListing(
  title: string,
  description: string,
  source: "en" | "th",
): Promise<{ titleTh: string; titleEn: string; descriptionTh: string; descriptionEn: string }> {
  let pair = await pairFromGrok(title, description, source);
  if (!pair || !usableForTarget(pair.title, source)) {
    pair = (await pairFromPublicApi(title, description, source)) ?? pair;
  }
  if (source === "th") {
    const titleEn = pair && isUsableEnglish(pair.title) ? pair.title : "";
    const descriptionEn =
      pair && isUsableEnglish(pair.description) ? pair.description : titleEn;
    return { titleTh: title, titleEn, descriptionTh: description, descriptionEn };
  }
  const titleTh = pair?.title?.trim() || "";
  const descriptionTh = pair?.description?.trim() || titleTh;
  return { titleTh, titleEn: title, descriptionTh, descriptionEn: description };
}

export async function translateText(
  text: string,
  source: "en" | "th",
): Promise<string> {
  const target = source === "en" ? "Thai" : "English";
  const raw = await grokJson(
    text,
    `Translate this chat message into ${target} for people in Krabi. Return ONLY JSON {"text":"..."}. Keep names and place names.`,
  );
  const parsed = raw ? extractJson(raw) : null;
  const fromGrok = parsed?.text?.trim();
  if (fromGrok && (source === "th" ? isUsableEnglish(fromGrok) : true)) return fromGrok;
  const fallback = await translateTextPublic(text, source);
  return fallback?.trim() || text;
}

export const previewTranslation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { title: string; description: string }) => input)
  .handler(async ({ data }) => {
    const source = detectLang(`${data.title} ${data.description}`);
    const pair = await translateListing(data.title, data.description, source);
    return { source, ...pair };
  });

export type EnglishOverlay = {
  id: string;
  titleEn: string;
  descriptionEn: string;
};

const OVERLAY_CAP = 12;

export async function persistEnglishOverlay(
  row: OverlayRow,
  overlay: { titleEn: string; descriptionEn: string },
  restoreThaiSource: boolean,
): Promise<void> {
  const { getDb } = await import("./helpers");
  const sql = await getDb();
  const { hasThaiScript } = await import("@/lib/utils");
  if (restoreThaiSource) {
    await sql`
      update services set
        title_th = ${row.title_en},
        description_th = ${hasThaiScript(row.description_en) ? row.description_en : row.description_th},
        title_en = ${overlay.titleEn},
        description_en = ${overlay.descriptionEn}
      where id = ${row.id}
    `;
    return;
  }
  await sql`
    update services set
      title_en = ${overlay.titleEn},
      description_en = ${overlay.descriptionEn}
    where id = ${row.id}
  `;
}

export async function fillEnglishOverlaysForIds(
  ids: string[],
  listings: ListingOverlayInput[] = [],
): Promise<EnglishOverlay[]> {
  const unique = [...new Set(ids.map((id) => id.trim()).filter(Boolean))].slice(0, OVERLAY_CAP);
  if (unique.length === 0) return [];
  const { getDb } = await import("./helpers");
  const sql = await getDb();
  const placeholders = unique.map((_, i) => `$${i + 1}`).join(", ");
  let rows: OverlayRow[] = [];
  try {
    rows = await sql.query<OverlayRow>(
      `select id, title_th, title_en, description_th, description_en from services where id in (${placeholders})`,
      unique,
    );
  } catch {
    rows = [];
  }
  const byId = new Map(rows.map((row) => [row.id, row]));
  for (const listing of listings) {
    if (!listing.id || byId.has(listing.id)) continue;
    byId.set(listing.id, overlayRowFromClient(listing));
  }

  const out: EnglishOverlay[] = [];
  for (const id of unique) {
    const row = byId.get(id);
    if (!row) continue;
    const plan = overlaySource(row);
    if (plan.alreadyEnglish) {
      out.push({
        id: row.id,
        titleEn: row.title_en,
        descriptionEn: isUsableEnglish(row.description_en) ? row.description_en : row.title_en,
      });
      continue;
    }
    if (plan.skip) continue;
    const translated = await translateListing(plan.thaiTitle, plan.thaiDesc || plan.thaiTitle, "th");
    if (!isUsableEnglish(translated.titleEn)) continue;
    const overlay = {
      titleEn: translated.titleEn,
      descriptionEn: isUsableEnglish(translated.descriptionEn)
        ? translated.descriptionEn
        : translated.titleEn,
    };
    try {
      await persistEnglishOverlay(row, overlay, plan.restoreThaiSource);
    } catch {
      /* still return overlay so Discover can render English this session */
    }
    out.push({ id: row.id, ...overlay });
  }
  return out;
}

/**
 * Fill English overlay columns for Thai originals. Never writes title_th / description_th
 * except to restore Thai source into title_th when it was stored in the English column.
 * Works without XAI_API_KEY via MyMemory / LibreTranslate.
 */
export const fillEnglishOverlays = createServerFn({ method: "POST" })
  .validator((input: { ids: string[]; listings?: ListingOverlayInput[] }) => ({
    ids: (input?.ids ?? []).filter((id) => typeof id === "string" && id.trim()).slice(0, OVERLAY_CAP),
    listings: Array.isArray(input?.listings) ? input.listings.slice(0, OVERLAY_CAP) : [],
  }))
  .handler(async ({ data }): Promise<EnglishOverlay[]> => {
    return fillEnglishOverlaysForIds(data.ids, data.listings);
  });
