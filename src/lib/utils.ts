import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid(): string {
  return crypto.randomUUID();
}

export function parseImages(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.filter((x): x is string => typeof x === "string");
  if (typeof raw === "string") {
    try {
      const v = JSON.parse(raw) as unknown;
      return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
    } catch {
      return raw ? [raw] : [];
    }
  }
  return [];
}

export function detectLang(text: string): "en" | "th" {
  return /[\u0E00-\u0E7F]/.test(text) ? "th" : "en";
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
