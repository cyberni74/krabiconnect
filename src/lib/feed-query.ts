import { DISTRICTS } from "./constants.ts";
import type { FeedCard } from "./types.ts";

/** Newest public listings on Discover list + map. */
export const HOME_FEED_LIMIT = 15;
/** Broader cap when the caller is searching by text. */
export const SEARCH_FEED_LIMIT = 80;

/**
 * Live catalog statuses. Agent/market writes use `active`; older item-style
 * rows used `available`. Do **not** require `published` — that is not a DB value.
 */
export const PUBLIC_LISTING_STATUSES = ["active", "available", "published"] as const;

export type FeedKindFilter = "all" | "services" | "jobs" | "market" | "looking";

export type FeedFilters = {
  q?: string;
  kind?: FeedKindFilter;
  category?: string;
  district?: string;
  freeOnly?: boolean;
  task?: string;
};

export function isPublicListingStatus(status: string | null | undefined): boolean {
  const s = (status ?? "active").trim().toLowerCase();
  return (PUBLIC_LISTING_STATUSES as readonly string[]).includes(s || "active");
}

/** Only real district ids (or names) filter the feed — junk persist values must not empty Discover. */
export function knownDistrictId(raw?: string | null): string | undefined {
  const s = (raw ?? "").trim();
  if (!s) return undefined;
  const lower = s.toLowerCase();
  const hit = DISTRICTS.find(
    (d) => d.id === lower || d.nameEn.toLowerCase() === lower || d.nameTh === s,
  );
  return hit?.id;
}

export function feedLimitFor(filters: FeedFilters): number {
  return filters.q?.trim() ? SEARCH_FEED_LIMIT : HOME_FEED_LIMIT;
}

/** Merge `services` + `items` rows, newest first, de-dupe by id, cap the homepage. */
export function mergeNewest(groups: FeedCard[][], limit: number): FeedCard[] {
  const cap = Math.min(Math.max(limit, 1), SEARCH_FEED_LIMIT);
  const seen = new Set<string>();
  return groups
    .flat()
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0))
    .filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    })
    .slice(0, cap);
}

export function applyFeedFilters(cards: FeedCard[], f: FeedFilters): FeedCard[] {
  const q = f.q?.trim().toLowerCase();
  const district = knownDistrictId(f.district);
  const kind = f.kind && f.kind !== "all" ? f.kind : undefined;
  return cards.filter((c) => {
    if (!isPublicListingStatus(c.status)) return false;
    if (kind === "services" && (c.kind !== "service" || c.type === "wanted")) return false;
    if (kind === "jobs" && (c.kind !== "job" || c.type === "wanted")) return false;
    if (kind === "market" && (c.kind !== "market" || c.type === "wanted")) return false;
    if (kind === "looking" && c.type !== "wanted") return false;
    if (f.category && c.category !== f.category) return false;
    if (district && c.district !== district) return false;
    if (f.task && !c.tasks.includes(f.task)) return false;
    if (f.freeOnly) {
      const isFree = (c.price ?? 0) === 0;
      if (!isFree) return false;
    }
    if (q) {
      const hay =
        `${c.titleTh} ${c.titleEn} ${c.descriptionTh} ${c.descriptionEn} ${c.ownerName} ${c.tasks.join(" ")}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
