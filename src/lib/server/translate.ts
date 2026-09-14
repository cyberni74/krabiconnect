import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { detectLang } from "@/lib/utils";

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

export async function translateListing(
  title: string,
  description: string,
  source: "en" | "th",
): Promise<{ titleTh: string; titleEn: string; descriptionTh: string; descriptionEn: string }> {
  const target = source === "en" ? "Thai" : "English";
  const raw = await grokJson(
    `Title: ${title}\n\nDescription: ${description}`,
    `Translate this KrabiMarketplace listing into ${target}. Keep Thai place names (Ao Nang, Krabi, Railay). Return ONLY JSON {"title":"...","description":"..."}.`,
  );
  const parsed = raw ? extractJson(raw) : null;
  const tTitle = parsed?.title?.trim() || title;
  const tDesc = parsed?.description?.trim() || description;
  if (source === "th") {
    return { titleTh: title, titleEn: tTitle, descriptionTh: description, descriptionEn: tDesc };
  }
  return { titleTh: tTitle, titleEn: title, descriptionTh: tDesc, descriptionEn: description };
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
  return parsed?.text?.trim() || text;
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

/**
 * Fill English overlay columns for Thai originals. Never writes title_th / description_th
 * except to restore Thai source into title_th when it was stored in the English column.
 * English overlays may keep Thai place names — those are still saved to *_en only.
 */
export const fillEnglishOverlays = createServerFn({ method: "POST" })
  .validator((input: { ids: string[] }) => ({
    ids: (input?.ids ?? []).filter((id) => typeof id === "string" && id.trim()).slice(0, OVERLAY_CAP),
  }))
  .handler(async ({ data }): Promise<EnglishOverlay[]> => {
    if (data.ids.length === 0 || !process.env.XAI_API_KEY) return [];
    const { getDb } = await import("./helpers");
    const { hasThaiScript, isUsableEnglish } = await import("@/lib/utils");
    const { needsEnglishOverlay } = await import("@/lib/i18n");
    const sql = await getDb();
    const placeholders = data.ids.map((_, i) => `$${i + 1}`).join(", ");
    const rows = await sql.query<{
      id: string;
      title_th: string;
      title_en: string;
      description_th: string;
      description_en: string;
    }>(
      `select id, title_th, title_en, description_th, description_en from services where id in (${placeholders})`,
      data.ids,
    );
    const out: EnglishOverlay[] = [];
    for (const row of rows) {
      const titleNeeds = needsEnglishOverlay(row.title_th, row.title_en);
      const descNeeds = needsEnglishOverlay(row.description_th, row.description_en);
      if (!titleNeeds && !descNeeds) continue;
      const thaiTitle = hasThaiScript(row.title_th)
        ? row.title_th
        : hasThaiScript(row.title_en)
          ? row.title_en
          : row.title_th;
      const thaiDesc = hasThaiScript(row.description_th)
        ? row.description_th
        : hasThaiScript(row.description_en)
          ? row.description_en
          : row.description_th;
      if (!thaiTitle.trim()) continue;
      const overlay = await translateListing(thaiTitle, thaiDesc || thaiTitle, "th");
      const nextTitleEn =
        titleNeeds && isUsableEnglish(overlay.titleEn) ? overlay.titleEn.trim() : (row.title_en ?? "").trim();
      const nextDescEn =
        descNeeds && isUsableEnglish(overlay.descriptionEn)
          ? overlay.descriptionEn.trim()
          : (row.description_en ?? "").trim();
      if (nextTitleEn === (row.title_en ?? "").trim() && nextDescEn === (row.description_en ?? "").trim()) {
        continue;
      }
      const restoreThaiSource = !hasThaiScript(row.title_th) && hasThaiScript(row.title_en);
      if (restoreThaiSource) {
        await sql`
          update services set
            title_th = ${row.title_en},
            description_th = ${hasThaiScript(row.description_en) ? row.description_en : row.description_th},
            title_en = ${nextTitleEn},
            description_en = ${nextDescEn}
          where id = ${row.id}
        `;
      } else {
        await sql`
          update services set
            title_en = ${nextTitleEn},
            description_en = ${nextDescEn}
          where id = ${row.id}
        `;
      }
      out.push({ id: row.id, titleEn: nextTitleEn, descriptionEn: nextDescEn });
    }
    return out;
  });
