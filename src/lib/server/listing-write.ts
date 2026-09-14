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
import { pickCoverImage } from "@/lib/owned-image";
import { ensureProfile, getDb } from "./helpers";
import { cleanImages, imagesToApplyOnDuplicate } from "./listing-images";
import { translateListing } from "./translate";

export const AGENT_USER_ID = "grok-agent";

export type ListingWriteInput = {
  userId: string;
  /** When set, match an existing row by primary key (after sourceUrl). */
  id?: string | null;
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
  /** English overlay only — never written to title_th / description_th. */
  titleEn?: string | null;
  descriptionEn?: string | null;
};

export type ListingWriteResult = {
  id: string;
  kind: ListingKind;
  duplicate: boolean;
  imagesUpdated?: boolean;
  overlayUpdated?: boolean;
  titleEn?: string;
  descriptionEn?: string;
  cover?: string | null;
  rehosted?: number;
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

type ExistingListingRow = { id: string; kind: string | null; images: unknown };

async function findExistingListing(
  sql: Sql,
  opts: { sourceUrl: string | null; id?: string | null },
): Promise<ExistingListingRow | null> {
  if (opts.sourceUrl) {
    const rows = await sql<ExistingListingRow>`
      select id, kind, images from services where source_url = ${opts.sourceUrl} limit 1
    `;
    if (rows[0]) return rows[0];
  }
  const id = opts.id?.trim();
  if (id) {
    const rows = await sql<ExistingListingRow>`
      select id, kind, images from services where id = ${id} limit 1
    `;
    if (rows[0]) return rows[0];
  }
  return null;
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
  const existing = await findExistingListing(sql, { sourceUrl, id: data.id });
  if (existing) {
    const nextImages = imagesToApplyOnDuplicate(data.images, existing.images);
    let imagesUpdated = false;
    let cover: string | null | undefined;
    let rehosted: number | undefined;
    if (nextImages) {
      const { processListingImages } = await import("./image-rehost");
      const processed = await processListingImages(nextImages);
      await sql`
        update services set images = ${JSON.stringify(processed.images)} where id = ${existing.id}
      `;
      imagesUpdated = true;
      cover = pickCoverImage({ images: processed.images }) ?? processed.images[0] ?? null;
      rehosted = processed.rehosted;
    }
    const { englishOverlayFromFields } = await import("./listing-overlay");
    const overlay = englishOverlayFromFields(data);
    let overlayUpdated = false;
    let titleEn: string | undefined;
    let descriptionEn: string | undefined;
    if (overlay) {
      const seeded = await patchListingEnglish(existing.id, overlay);
      overlayUpdated = true;
      titleEn = seeded.titleEn;
      descriptionEn = seeded.descriptionEn;
    }
    return {
      id: existing.id,
      kind: resolveKind(existing.kind),
      duplicate: true,
      imagesUpdated,
      overlayUpdated,
      cover,
      rehosted,
      titleEn,
      descriptionEn,
    };
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
  const { processListingImages } = await import("./image-rehost");
  const processed = await processListingImages(cleanImages(data.images));
  const images = JSON.stringify(processed.images);
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
    cover: pickCoverImage({ images: processed.images }) ?? processed.images[0] ?? null,
    rehosted: processed.rehosted,
    warning: facebookUrl ? undefined : "No Facebook profile — buyers cannot contact the seller",
  };
}

export async function patchListingImages(
  id: string,
  imagesRaw: unknown,
): Promise<{
  ok: true;
  id: string;
  images: string[];
  cover: string | null;
  rehosted: number;
}> {
  const listingId = id.trim();
  if (!listingId) throw new Error("Listing id required");
  if (!Array.isArray(imagesRaw)) throw new Error("Body must include images: string[]");
  const cleaned = cleanImages(imagesRaw.filter((u): u is string => typeof u === "string"));
  if (imagesRaw.length > 0 && cleaned.length === 0) {
    throw new Error("No usable HTTPS image URLs (Facebook photo.php/fbid HTML is ignored)");
  }
  const { processListingImages } = await import("./image-rehost");
  const processed = await processListingImages(cleaned);
  const images = processed.images;
  const sql = await getDb();
  const rows = await sql<{ id: string }>`select id from services where id = ${listingId} limit 1`;
  if (!rows[0]) {
    const err = new Error("Listing not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }
  await sql`update services set images = ${JSON.stringify(images)} where id = ${listingId}`;
  return { ok: true, id: listingId, images, cover: pickCoverImage({ images }) ?? images[0] ?? null, rehosted: processed.rehosted };
}

/** Write English overlay only. Never touches title_th / description_th. */
export async function patchListingEnglish(
  id: string,
  overlay: { titleEn?: string; descriptionEn?: string },
): Promise<{ ok: true; id: string; titleEn: string; descriptionEn: string }> {
  const { assertEnglishOverlayField } = await import("./listing-overlay");
  const listingId = id.trim();
  if (!listingId) throw new Error("Listing id required");
  const titleEn = overlay.titleEn?.trim();
  const descriptionEn = overlay.descriptionEn?.trim();
  if (!titleEn && !descriptionEn) throw new Error("titleEn or descriptionEn required");
  if (titleEn) assertEnglishOverlayField("titleEn", titleEn);
  if (descriptionEn) assertEnglishOverlayField("descriptionEn", descriptionEn);
  const sql = await getDb();
  const rows = await sql<{
    id: string;
    title_en: string;
    description_en: string;
  }>`select id, title_en, description_en from services where id = ${listingId} limit 1`;
  if (!rows[0]) {
    const err = new Error("Listing not found") as Error & { status: number };
    err.status = 404;
    throw err;
  }
  const nextTitle = titleEn ?? rows[0].title_en;
  const nextDesc = descriptionEn ?? rows[0].description_en;
  await sql`
    update services set
      title_en = ${nextTitle},
      description_en = ${nextDesc}
    where id = ${listingId}
  `;
  return { ok: true, id: listingId, titleEn: nextTitle, descriptionEn: nextDesc };
}
