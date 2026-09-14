import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(): string {
  return crypto.randomUUID();
}

const IMAGE_OBJECT_KEYS = ["url", "src", "href", "cover", "coverUrl", "image"] as const;

function asStoredUrl(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const rec = value as Record<string, unknown>;
    for (const key of IMAGE_OBJECT_KEYS) {
      const inner = rec[key];
      if (typeof inner === "string" && inner.trim()) return inner.trim();
    }
  }
  return null;
}

function extractHttpUrls(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s"'<>\\]+/gi) ?? [];
  return matches.map((u) => u.replace(/[),.;}\]]+$/g, ""));
}

function hostnameOfLoose(url: URL): string {
  return url.hostname.replace(/\.$/, "").replace(/^www\./i, "").toLowerCase();
}

function proxyInnerTargets(raw: string): string[] {
  const trimmed = raw.trim();
  const out = [trimmed];
  try {
    const url = trimmed.startsWith("/") ? new URL(trimmed, "https://owned.invalid") : new URL(trimmed);
    const path = url.pathname.replace(/\/+$/, "") || "/";
    if (path === "/api/img") {
      const inner = url.searchParams.get("u") ?? url.searchParams.get("url");
      if (inner?.trim()) out.push(inner.trim());
    }
    if (url.pathname.startsWith("/api/img/")) {
      const rest = url.pathname.slice("/api/img/".length);
      if (rest) {
        try {
          out.push(decodeURIComponent(rest));
        } catch {
          out.push(rest);
        }
      }
    }
  } catch {
    // keep the raw string only
  }
  return out;
}

function looksLikeFacebookHtmlPage(target: string): boolean {
  const trimmed = target.trim();
  if (!trimmed) return false;
  if (/facebook\.com\/photo(?:\.php|\/|\?|$)/i.test(trimmed)) return true;
  if (
    /[?&]fbid=/i.test(trimmed) &&
    /(?:^https?:\/\/|\/\/)(?:www\.|m\.|web\.)?(?:facebook\.com|fb\.com|fb\.me)\b/i.test(trimmed) &&
    !/\.fbcdn\.net/i.test(trimmed)
  ) {
    return true;
  }
  try {
    const url = new URL(trimmed);
    const host = hostnameOfLoose(url);
    if (host === "graph.facebook.com" || host.endsWith(".graph.facebook.com")) return false;
    const isFb =
      host === "facebook.com" ||
      host.endsWith(".facebook.com") ||
      host === "fb.com" ||
      host === "fb.me";
    if (!isFb) return false;
    if (url.pathname.includes("/picture")) return false;
    return true;
  } catch {
    return /(?:facebook\.com|fb\.com)\/(?:photo|permalink|marketplace|share|posts|videos)/i.test(
      trimmed,
    );
  }
}

/**
 * Facebook HTML photo/permalink/marketplace pages. These are not image bytes
 * (`<img>` naturalWidth 0). Includes `/api/img?u=` wrappers around the same URLs.
 */
export function isFacebookFbidHtmlUrl(raw: string): boolean {
  const trimmed = raw.trim();
  if (!trimmed) return false;
  return proxyInnerTargets(trimmed).some(looksLikeFacebookHtmlPage);
}

function keepParsedToken(value: string): boolean {
  return !isFacebookFbidHtmlUrl(value);
}

/**
 * Normalize listing `images` from Neon (JSON text, jsonb, object rows, or a lone URL).
 * Task ID arrays also flow through here — non-URL strings are kept as-is.
 * Facebook `photo/?fbid=` HTML pages are never returned as covers.
 */
export function parseImages(raw: unknown): string[] {
  return parseImagesUnfiltered(raw).filter(keepParsedToken);
}

function parseImagesUnfiltered(raw: unknown): string[] {
  if (raw == null || raw === "") return [];
  if (Array.isArray(raw)) {
    const out: string[] = [];
    for (const item of raw) {
      if (Array.isArray(item)) {
        out.push(...parseImagesUnfiltered(item));
        continue;
      }
      const url = asStoredUrl(item);
      if (url) out.push(url);
    }
    if (out.length) return out;
    return [];
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed !== trimmed) {
        const nested = parseImagesUnfiltered(parsed);
        if (nested.length) return nested;
      }
    } catch {
      // not JSON — a lone URL, postgres array, or opaque token
    }
    if (
      /^https?:\/\//i.test(trimmed) ||
      trimmed.startsWith("data:image/") ||
      trimmed.startsWith("/api/img")
    ) {
      return [trimmed];
    }
    const found = extractHttpUrls(trimmed);
    if (found.length) return found;
    return [trimmed];
  }
  const single = asStoredUrl(raw);
  return single ? [single] : [];
}

export function detectLang(text: string): "en" | "th" {
  return /[\u0E00-\u0E7F]/.test(text) ? "th" : "en";
}

export function hasThaiScript(text: string): boolean {
  return /[\u0E00-\u0E7F]/.test(text);
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function formatThb(n: number | null | undefined): string {
  if (n == null) return "";
  return `฿${n.toLocaleString("th-TH")}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p.charAt(0).toUpperCase()).join("") || "?";
}

export function parseFacebookUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (!/[/\s:]/.test(trimmed) && /^@?[A-Za-z0-9.]{3,50}$/.test(trimmed)) {
    return `https://www.facebook.com/${trimmed.replace(/^@/, "")}`;
  }
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const url = new URL(withProto);
    const host = url.hostname.replace(/^www\./i, "").toLowerCase();
    const allowed =
      host === "facebook.com" ||
      host === "m.facebook.com" ||
      host === "web.facebook.com" ||
      host === "fb.com" ||
      host === "fb.me" ||
      host.endsWith(".facebook.com");
    if (!allowed) return null;
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    const id = url.searchParams.get("id");
    if (url.pathname.includes("profile.php") && id && /^\d+$/.test(id)) {
      return `https://www.facebook.com/profile.php?id=${id}`;
    }
    const path = url.pathname.replace(/\/+$/, "");
    if (!path || path === "/") return null;
    const reserved = new Set([
      "marketplace",
      "watch",
      "reels",
      "reel",
      "groups",
      "events",
      "login",
      "share",
      "sharer",
      "dialog",
      "plugins",
      "stories",
      "videos",
      "photo.php",
      "permalink.php",
    ]);
    const first = path.split("/").filter(Boolean)[0]?.toLowerCase();
    if (first && reserved.has(first) && first !== "people" && first !== "profile.php") return null;
    return `https://www.facebook.com${path}${id ? `?id=${id}` : ""}`;
  } catch {
    return null;
  }
}

export function facebookGraphId(raw: string): string | null {
  const url = parseFacebookUrl(raw);
  if (!url) return null;
  try {
    const u = new URL(url);
    const qid = u.searchParams.get("id");
    if (qid && /^\d+$/.test(qid)) return qid;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts[0] === "people" && parts.length >= 2) {
      const last = parts[parts.length - 1];
      if (/^\d+$/.test(last)) return last;
    }
    if (parts[0] && parts[0] !== "profile.php") return decodeURIComponent(parts[0]);
  } catch {
    return null;
  }
  return null;
}

export function facebookHandleLabel(id: string): string {
  if (/^\d+$/.test(id)) return "Facebook";
  return id.replace(/[._]/g, " ");
}
