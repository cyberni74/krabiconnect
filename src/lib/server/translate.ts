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
