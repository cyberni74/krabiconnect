import { hasThaiScript } from "@/lib/utils";

export type FetchLike = (input: string | URL, init?: RequestInit) => Promise<Response>;

const MYMEMORY = "https://api.mymemory.translated.net/get";
const LIBRE_ENDPOINTS = [
  "https://libretranslate.de/translate",
  "https://translate.argosopentech.com/translate",
];
const CHUNK = 450;

export function isUsableEnglish(text: string): boolean {
  const s = text.trim();
  if (!s) return false;
  if (hasThaiScript(s)) return false;
  if (/^MYMEMORY WARNING/i.test(s)) return false;
  return true;
}

function splitChunks(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= CHUNK) return [trimmed];
  const parts: string[] = [];
  let rest = trimmed;
  while (rest.length > CHUNK) {
    let cut = rest.lastIndexOf("\n", CHUNK);
    if (cut < CHUNK * 0.4) cut = rest.lastIndexOf(" ", CHUNK);
    if (cut < CHUNK * 0.4) cut = CHUNK;
    parts.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }
  if (rest) parts.push(rest);
  return parts;
}

function readMyMemory(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const data = body as {
    responseStatus?: number | string;
    responseData?: { translatedText?: string };
  };
  const status = Number(data.responseStatus);
  if (status && status !== 200) return null;
  const text = data.responseData?.translatedText?.trim();
  return text ? text.replace(/^["']|["']$/g, "") : null;
}

function readLibre(body: unknown): string | null {
  if (!body || typeof body !== "object") return null;
  const text = (body as { translatedText?: string }).translatedText?.trim();
  return text || null;
}

async function translateChunkMyMemory(
  text: string,
  pair: string,
  fetchImpl: FetchLike,
): Promise<string | null> {
  const url = `${MYMEMORY}?q=${encodeURIComponent(text)}&langpair=${encodeURIComponent(pair)}`;
  const res = await fetchImpl(url, { method: "GET", signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  return readMyMemory(await res.json());
}

async function translateChunkLibre(
  text: string,
  source: string,
  target: string,
  fetchImpl: FetchLike,
): Promise<string | null> {
  for (const endpoint of LIBRE_ENDPOINTS) {
    try {
      const res = await fetchImpl(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ q: text, source, target, format: "text" }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const out = readLibre(await res.json());
      if (out) return out;
    } catch {
      /* try the next public instance */
    }
  }
  return null;
}

export async function translateTextPublic(
  text: string,
  source: "th" | "en",
  fetchImpl: FetchLike = fetch,
): Promise<string | null> {
  const trimmed = text.trim();
  if (!trimmed) return "";
  if (source === "th" && isUsableEnglish(trimmed)) return trimmed;
  if (source === "en" && hasThaiScript(trimmed)) return trimmed;

  const target = source === "th" ? "en" : "th";
  const pair = `${source}|${target}`;
  const chunks = splitChunks(trimmed);
  const out: string[] = [];
  for (const chunk of chunks) {
    let next: string | null = null;
    try {
      next = await translateChunkMyMemory(chunk, pair, fetchImpl);
    } catch {
      next = null;
    }
    if (next && source === "th" && !isUsableEnglish(next)) next = null;
    if (next && source === "en" && !/[\u0E00-\u0E7F]/.test(next)) next = null;
    if (!next) {
      try {
        next = await translateChunkLibre(chunk, source, target, fetchImpl);
      } catch {
        next = null;
      }
    }
    if (!next) return null;
    out.push(next);
  }
  const joined = out.join(" ").trim();
  if (source === "th") return isUsableEnglish(joined) ? joined : null;
  return hasThaiScript(joined) ? joined : null;
}

export async function translateThaiToEnglish(
  text: string,
  fetchImpl: FetchLike = fetch,
): Promise<string | null> {
  return translateTextPublic(text, "th", fetchImpl);
}
