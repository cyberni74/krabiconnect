import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { type ListingKind, type OfferType } from "@/lib/constants";
import type { FeedCard } from "@/lib/types";
import { withListingCopy } from "@/lib/listing-dto";
import { ensureProfile, fetchServices, getDb } from "./helpers";
import { writeListing } from "./listing-write";

export type FeedFilters = {
  q?: string;
  kind?: "all" | "services" | "jobs" | "market" | "looking";
  category?: string;
  district?: string;
  freeOnly?: boolean;
  task?: string;
};

function applyFilters(cards: FeedCard[], f: FeedFilters): FeedCard[] {
  const q = f.q?.trim().toLowerCase();
  return cards.filter((c) => {
    if (f.kind === "services" && (c.kind !== "service" || c.type === "wanted")) return false;
    if (f.kind === "jobs" && (c.kind !== "job" || c.type === "wanted")) return false;
    if (f.kind === "market" && (c.kind !== "market" || c.type === "wanted")) return false;
    if (f.kind === "looking" && c.type !== "wanted") return false;
    if (f.category && c.category !== f.category) return false;
    if (f.district && c.district !== f.district) return false;
    if (f.task && !c.tasks.includes(f.task)) return false;
    if (f.freeOnly) {
      const isFree = (c.price ?? 0) === 0;
      if (!isFree) return false;
    }
    if (q) {
      const hay = `${c.titleTh} ${c.titleEn} ${c.descriptionTh} ${c.descriptionEn} ${c.ownerName} ${c.tasks.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export const listFeed = createServerFn({ method: "GET" })
  .validator((input: FeedFilters = {}) => input ?? {})
  .handler(async ({ data }) => {
    const sql = await getDb();
    const { ensureAdmin } = await import("./admin-boot.server");
    await ensureAdmin();
    const services = await fetchServices(sql);
    return applyFilters(services, data ?? {})
      .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
      .map(withListingCopy);
  });

export const getListing = createServerFn({ method: "GET" })
  .validator((input: { kind?: string; id: string }) => input)
  .handler(async ({ data }) => {
    const sql = await getDb();
    const rows = await fetchServices(sql, { id: data.id });
    const row = rows[0];
    return row ? withListingCopy(row) : null;
  });

export const myListings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getDb();
    await ensureProfile(sql, context.userId);
    const all = await fetchServices(sql, { userId: context.userId }).then((rows) =>
      rows.map(withListingCopy),
    );
    return {
      services: all.filter((s) => s.kind === "service" && s.type !== "wanted"),
      jobs: all.filter((s) => s.kind === "job" && s.type !== "wanted"),
      market: all.filter((s) => s.kind === "market" && s.type !== "wanted"),
      looking: all.filter((s) => s.type === "wanted"),
    };
  });

type CreateListingInput = {
  title: string;
  description: string;
  kind: ListingKind;
  category: string;
  offerType: OfferType;
  pricingType: "hourly" | "daily" | "monthly" | "flat" | "sale";
  rateThb?: number | null;
  locationRadius?: number | null;
  images: string[];
  tasks: string[];
  district: string;
  availableTimes?: string | null;
  name?: string | null;
  lang?: "en" | "th";
  facebookUrl?: string | null;
};

export const createListing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: CreateListingInput) => input)
  .handler(async ({ context, data }) => {
    const result = await writeListing({
      userId: context.userId,
      title: data.title,
      description: data.description,
      kind: data.kind,
      category: data.category,
      offerType: data.offerType,
      pricingType: data.pricingType,
      rateThb: data.rateThb,
      images: data.images,
      tasks: data.tasks,
      district: data.district,
      facebookUrl: data.facebookUrl,
    });
    return { id: result.id, kind: result.kind };
  });

export const updateListingStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; status: string; rateThb?: number | null }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getDb();
    await sql`
      update services set
        status = ${data.status},
        rate_thb = coalesce(${data.rateThb ?? null}, rate_thb)
      where id = ${data.id} and user_id = ${context.userId}
    `;
    return { ok: true };
  });

export const deleteListing = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { kind?: string; id: string }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getDb();
    await sql`delete from services where id = ${data.id} and user_id = ${context.userId}`;
    return { ok: true };
  });
