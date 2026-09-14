import {
  DISTRICTS,
  JOB_CATEGORIES,
  MARKET_CATEGORIES,
  SERVICE_CATEGORIES,
  districtById,
  type ListingKind,
  type OfferType,
} from "@/lib/constants";
import type { Sql } from "@/lib/db";
import { detectLang, parseFacebookUrl, uid } from "@/lib/utils";
import { ensureProfile, getDb } from "./helpers";
import { translateListing } from "./translate";

export const AGENT_USER_ID = "grok-agent";

export type ListingWriteInput = {
  userId: string;
  title: string;
  description: string;
  kind?: string | null;
  category?: string | null;
  offerType?: string | null;
  pricingType?: string | null;
  rateThb?: number | null;
  images?: string[] | null;
  tasks?: string[] | null;
  district?: string | null;
  facebookUrl?: string | null;
  facebookName?: string | null;
  sourceUrl?: string | null;
};

export type ListingWriteResult = {
  id: string;
  kind: ListingKind;
  duplicate: boolean;
  warning?: string;
};

export function resolveDistrict(raw?: string | null): string {
  const s = (raw ?? "").trim().toLowerCase();
  if (!s) return "krabi-town";
  const exact = DISTRICTS.find(
    (d) => d.id === s || d.nameEn.toLowerCase() === s || d.nameTh === raw,
  );
  if (exact) return exact.id;
  if (s.includes("ao nang") || s.includes("อ่าวนาง") || s.includes("ao-nang")) return "ao-nang";
  if (s.includes("railay") || s.includes("ไร่เลย์")) return "railay";
  if (s.includes("klong") || s.includes("khlong") || s.includes("คลองม่วง")) return "klong-muang";
  if (s.includes("nong thale") || s.includes("หนองทะเล")) return "nong-thale";
  if (s.includes("noi") || s.includes("กระบี่น้อย")) return "krabi-noi";
  return "krabi-town";
}

export function resolveKind(raw?: string | null): ListingKind {
  const s = (raw ?? "").toLowerCase();
  if (s === "job" || s === "jobs") return "job";
  if (s === "service" || s === "services") return "service";
  return "market";
}

export function resolveCategory(kind: ListingKind, raw?: string | null): string {
  const list =
    kind === "job" ? JOB_CATEGORIES : kind === "service" ? SERVICE_CATEGORIES : MARKET_CATEGORIES;
  const s = (raw ?? "").trim().toLowerCase();
  const hit = list.find((c) => c.id === s || c.nameEn.toLowerCase() === s || c.nameTh === raw);
  if (hit) return hit.id;
  if (kind === "market") {
    if (/car|moto|scooter|bike|van|truck|vehicle|รถยนต์|มอเตอร์/.test(s)) return "vehicles";
    if (/boat|kayak|yacht|เรือ/.test(s)) return "boats";
    if (/house|condo|land|villa|rent|property|บ้าน|ที่ดิน/.test(s)) return "property";
    if (/phone|laptop|computer|tv|อิเล็ก|มือถือ/.test(s)) return "electronics";
    if (/sofa|table|chair|furniture|เฟอร์/.test(s)) return "furniture";
    if (/cloth|shirt|dress|fashion|เสื้อผ้า/.test(s)) return "fashion";
    return "other";
  }
  return list[0]?.id ?? "other";
}

function cleanImages(raw?: string[] | null): string[] {
  return (raw ?? [])
    .filter((u): u is string => typeof u === "string")
    .map((u) => u.trim())
    .filter((u) => /^https?:\/\//i.test(u) || u.startsWith("data:image/"))
    .slice(0, 8);
}

export async function ensureAgentProfile(sql: Sql) {
  await sql`
    insert into profiles (id, name, preferred_language, is_verified, location)
    values (${AGENT_USER_ID}, ${"Marketplace import"}, ${"en"}, ${false}, ${"krabi-town"})
    on conflict (id) do nothing
  `;
}

export async function writeListing(data: ListingWriteInput): Promise<ListingWriteResult> {
  const title = data.title.trim();
  const description = (data.description ?? "").trim();
  if (!title) throw new Error("Title required");
  const sql = await getDb();
  await ensureProfile(sql, data.userId);
  if (data.userId === AGENT_USER_ID) await ensureAgentProfile(sql);

  const sourceUrl = data.sourceUrl?.trim() || null;
  if (sourceUrl) {
    const existing = await sql<{ id: string; kind: string | null }>`
      select id, kind from services where source_url = ${sourceUrl} limit 1
    `;
    if (existing[0]) {
      return {
        id: existing[0].id,
        kind: resolveKind(existing[0].kind),
        duplicate: true,
      };
    }
  }

  const kind = resolveKind(data.kind);
  const category = resolveCategory(kind, data.category ?? title);
  const offerType: OfferType = data.offerType === "wanted" ? "wanted" : "offer";
  const pricingType =
    data.pricingType === "hourly" ||
    data.pricingType === "daily" ||
    data.pricingType === "monthly" ||
    data.pricingType === "flat"
      ? data.pricingType
      : kind === "market"
        ? "sale"
        : "flat";
  const district = resolveDistrict(data.district);
  const d = districtById(district);
  const jitter = () => (Math.random() - 0.5) * 0.012;
  const source = detectLang(`${title} ${description}`);
  const tr = await translateListing(title, description || title, source);
  const facebookUrl = data.facebookUrl ? parseFacebookUrl(data.facebookUrl) : null;
  let facebookId: string | null = null;
  let facebookName: string | null = data.facebookName?.trim() || null;
  let facebookPhoto: string | null = null;
  if (facebookUrl) {
    const { resolveFacebookProfile } = await import("./facebook.server");
    const fb = await resolveFacebookProfile(facebookUrl).catch(() => null);
    if (fb) {
      facebookId = fb.id;
      facebookName = facebookName && facebookName !== "Facebook" ? facebookName : fb.name;
      facebookPhoto = fb.photo;
    }
  }
  const id = uid();
  const images = JSON.stringify(cleanImages(data.images));
  const tasks = JSON.stringify((data.tasks ?? []).slice(0, 12));
  await sql`
    insert into services (
      id, user_id, title_th, title_en, description_th, description_en,
      category, offer_type, pricing_type, rate_thb, location_radius, status,
      images, district, lat, lng, available_times, source_language, kind, tasks,
      facebook_url, facebook_id, facebook_name, facebook_photo, source_url
    ) values (
      ${id}, ${data.userId}, ${tr.titleTh}, ${tr.titleEn},
      ${tr.descriptionTh}, ${tr.descriptionEn}, ${category}, ${offerType},
      ${pricingType}, ${data.rateThb ?? null}, ${8},
      ${"active"}, ${images}, ${district}, ${d.lat + jitter()}, ${d.lng + jitter()},
      ${null}, ${source}, ${kind}, ${tasks},
      ${facebookUrl}, ${facebookId}, ${facebookName}, ${facebookPhoto}, ${sourceUrl}
    )
  `;
  return {
    id,
    kind,
    duplicate: false,
    warning: facebookUrl ? undefined : "No Facebook profile — buyers cannot contact the seller",
  };
}
