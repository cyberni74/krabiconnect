import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { type ListingKind, type OfferType } from "@/lib/constants";
import {
  applyFeedFilters,
  feedLimitFor,
  type FeedFilters,
} from "@/lib/feed-query";
import { ensureProfile, fetchPublicServices, fetchServices, getDb } from "./helpers";
import { writeListing } from "./listing-write";

export type { FeedFilters };

export const listFeed = createServerFn({ method: "POST" })
  .validator((input: FeedFilters = {}) => input ?? {})
  .handler(async ({ data }) => {
    const filters = data ?? {};
    const sql = await getDb();
    const services = await fetchPublicServices(sql, {
      kind: filters.kind,
      category: filters.category,
      district: filters.district,
      limit: feedLimitFor(filters),
    });
    return applyFeedFilters(services, filters);
  });

export const getListing = createServerFn({ method: "GET" })
  .validator((input: { kind?: string; id: string }) => input)
  .handler(async ({ data }) => {
    const sql = await getDb();
    const rows = await fetchServices(sql, { id: data.id });
    return rows[0] ?? null;
  });

export const myListings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getDb();
    await ensureProfile(sql, context.userId);
    const all = await fetchServices(sql, { userId: context.userId });
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
