import { getSql, type Sql } from "@/lib/db";
import type { ListingKind } from "@/lib/constants";
import {
  HOME_FEED_LIMIT,
  SEARCH_FEED_LIMIT,
  knownDistrictId,
  mergeNewest,
  type FeedKindFilter,
} from "@/lib/feed-query";
import { parseImages } from "@/lib/utils";
import type { FeedCard } from "@/lib/types";

export async function ensureProfile(
  sql: Sql,
  userId: string,
  name?: string | null,
  lang?: "en" | "th",
) {
  await sql`
    insert into profiles (id, name, preferred_language)
    values (${userId}, ${name?.trim() || "Neighbour"}, ${lang ?? "en"})
    on conflict (id) do nothing
  `;
}

type ServiceJoin = {
  id: string;
  user_id: string;
  title_th: string;
  title_en: string;
  description_th: string;
  description_en: string;
  category: string;
  offer_type: string;
  pricing_type: string;
  rate_thb: number | null;
  location_radius: number | null;
  status: string;
  images: string;
  tasks: string | null;
  district: string;
  lat: number | null;
  lng: number | null;
  available_times: string | null;
  source_language: string;
  created_at: string;
  kind: string | null;
  facebook_url: string | null;
  facebook_id: string | null;
  facebook_name: string | null;
  facebook_photo: string | null;
  owner_name: string | null;
  owner_avatar: string | null;
  owner_verified: boolean | null;
  owner_location: string | null;
  rating_avg: number | null;
  review_count: number | null;
};

const SERVICE_SELECT = `
  s.id, s.user_id, s.title_th, s.title_en, s.description_th, s.description_en,
  s.category, s.offer_type, s.pricing_type, s.rate_thb, s.location_radius, s.status,
  s.images, s.tasks, s.district, s.lat, s.lng, s.available_times, s.source_language,
  s.created_at, s.kind, s.facebook_url, s.facebook_id, s.facebook_name, s.facebook_photo,
  p.name as owner_name, p.avatar_url as owner_avatar, p.is_verified as owner_verified,
  p.location as owner_location,
  (select avg(rating)::float from reviews r where r.target_user_id = s.user_id) as rating_avg,
  (select count(*)::int from reviews r where r.target_user_id = s.user_id) as review_count
`;

function asKind(raw: string | null): ListingKind {
  const s = (raw ?? "").toLowerCase();
  if (s === "job" || s === "jobs") return "job";
  if (s === "market" || s === "item" || s === "items") return "market";
  return "service";
}

export function mapService(row: ServiceJoin): FeedCard {
  return {
    kind: asKind(row.kind),
    id: row.id,
    userId: row.user_id,
    titleTh: row.title_th,
    titleEn: row.title_en,
    descriptionTh: row.description_th,
    descriptionEn: row.description_en,
    category: row.category,
    type: row.offer_type,
    pricingType: row.pricing_type,
    price: row.rate_thb,
    deposit: null,
    status: row.status,
    images: parseImages(row.images),
    tasks: parseImages(row.tasks),
    district: row.district ?? "",
    lat: row.lat == null ? null : Number(row.lat),
    lng: row.lng == null ? null : Number(row.lng),
    condition: null,
    sourceLanguage: row.source_language === "th" ? "th" : "en",
    availableTimes: row.available_times,
    locationRadius: row.location_radius,
    createdAt: String(row.created_at),
    ownerName: row.owner_name ?? "Neighbour",
    ownerAvatar: row.owner_avatar,
    ownerVerified: Boolean(row.owner_verified),
    ownerLocation: row.owner_location,
    ratingAvg: row.rating_avg != null ? Number(row.rating_avg) : null,
    reviewCount: Number(row.review_count ?? 0),
    facebookUrl: row.facebook_url ?? null,
    facebookId: row.facebook_id ?? null,
    facebookName: row.facebook_name ?? null,
    facebookPhoto: row.facebook_photo ?? null,
  };
}

export async function fetchServices(
  sql: Sql,
  opts: { userId?: string; id?: string } = {},
): Promise<FeedCard[]> {
  let rows: ServiceJoin[];
  if (opts.id) {
    rows = await sql.query<ServiceJoin>(
      `select ${SERVICE_SELECT} from services s left join profiles p on p.id = s.user_id where s.id = $1`,
      [opts.id],
    );
  } else if (opts.userId) {
    rows = await sql.query<ServiceJoin>(
      `select ${SERVICE_SELECT} from services s left join profiles p on p.id = s.user_id where s.user_id = $1 order by s.created_at desc`,
      [opts.userId],
    );
  } else {
    rows = await sql.query<ServiceJoin>(
      `select ${SERVICE_SELECT} from services s left join profiles p on p.id = s.user_id order by s.created_at desc`,
    );
  }
  return rows.map(mapService);
}

type ItemJoin = {
  id: string;
  user_id: string;
  title_th: string;
  title_en: string;
  description_th: string;
  description_en: string;
  category: string;
  type: string;
  price_per_day: number | null;
  deposit: number | null;
  status: string;
  images: string;
  district: string;
  lat: number | null;
  lng: number | null;
  condition: string | null;
  source_language: string;
  created_at: string;
  owner_name: string | null;
  owner_avatar: string | null;
  owner_verified: boolean | null;
  owner_location: string | null;
  rating_avg: number | null;
  review_count: number | null;
};

const ITEM_SELECT = `
  i.id, i.user_id, i.title_th, i.title_en, i.description_th, i.description_en,
  i.category, i.type, i.price_per_day, i.deposit, i.status, i.images, i.district,
  i.lat, i.lng, i.condition, i.source_language, i.created_at,
  p.name as owner_name, p.avatar_url as owner_avatar, p.is_verified as owner_verified,
  p.location as owner_location,
  (select avg(rating)::float from reviews r where r.target_user_id = i.user_id) as rating_avg,
  (select count(*)::int from reviews r where r.target_user_id = i.user_id) as review_count
`;

export function mapItem(row: ItemJoin): FeedCard {
  const type = (row.type ?? "offer").toLowerCase();
  return {
    kind: "market",
    id: row.id,
    userId: row.user_id,
    titleTh: row.title_th,
    titleEn: row.title_en,
    descriptionTh: row.description_th,
    descriptionEn: row.description_en,
    category: row.category,
    type: type === "wanted" ? "wanted" : "offer",
    pricingType: type === "sale" ? "sale" : "daily",
    price: row.price_per_day,
    deposit: row.deposit,
    status: row.status,
    images: parseImages(row.images),
    tasks: [],
    district: row.district ?? "",
    lat: row.lat == null ? null : Number(row.lat),
    lng: row.lng == null ? null : Number(row.lng),
    condition: row.condition,
    sourceLanguage: row.source_language === "th" ? "th" : "en",
    availableTimes: null,
    locationRadius: null,
    createdAt: String(row.created_at),
    ownerName: row.owner_name ?? "Neighbour",
    ownerAvatar: row.owner_avatar,
    ownerVerified: Boolean(row.owner_verified),
    ownerLocation: row.owner_location,
    ratingAvg: row.rating_avg != null ? Number(row.rating_avg) : null,
    reviewCount: Number(row.review_count ?? 0),
    facebookUrl: null,
    facebookId: null,
    facebookName: null,
    facebookPhoto: null,
  };
}

export async function fetchItems(
  sql: Sql,
  opts: { userId?: string; id?: string } = {},
): Promise<FeedCard[]> {
  let rows: ItemJoin[];
  if (opts.id) {
    rows = await sql.query<ItemJoin>(
      `select ${ITEM_SELECT} from items i left join profiles p on p.id = i.user_id where i.id = $1`,
      [opts.id],
    );
  } else if (opts.userId) {
    rows = await sql.query<ItemJoin>(
      `select ${ITEM_SELECT} from items i left join profiles p on p.id = i.user_id where i.user_id = $1 order by i.created_at desc`,
      [opts.userId],
    );
  } else {
    rows = await sql.query<ItemJoin>(
      `select ${ITEM_SELECT} from items i left join profiles p on p.id = i.user_id order by i.created_at desc`,
    );
  }
  return rows.map(mapItem);
}

type PublicFeedOpts = {
  kind?: FeedKindFilter;
  category?: string;
  district?: string;
  limit?: number;
};

function publicWhere(
  alias: string,
  opts: PublicFeedOpts,
  params: unknown[],
  extra: string[] = [],
): string {
  const where = [
    `lower(coalesce(nullif(trim(${alias}.status), ''), 'active')) in ('active', 'available', 'published')`,
    ...extra,
  ];
  const category = opts.category?.trim();
  if (category) {
    params.push(category);
    where.push(`${alias}.category = $${params.length}`);
  }
  const district = knownDistrictId(opts.district);
  if (district) {
    params.push(district);
    where.push(`${alias}.district = $${params.length}`);
  }
  return where.join(" and ");
}

/**
 * Public Discover/search catalog from `services` (agent/market/jobs live here).
 */
export async function fetchPublicServices(
  sql: Sql,
  opts: PublicFeedOpts = {},
): Promise<FeedCard[]> {
  const params: unknown[] = [];
  const extra: string[] = [];
  const kind = opts.kind && opts.kind !== "all" ? opts.kind : undefined;
  if (kind === "services") {
    extra.push(`(s.kind is null or lower(s.kind) in ('service', 'services', 'help', ''))`);
    extra.push(`lower(coalesce(s.offer_type, 'offer')) <> 'wanted'`);
  } else if (kind === "jobs") {
    extra.push(`lower(coalesce(s.kind, '')) in ('job', 'jobs')`);
    extra.push(`lower(coalesce(s.offer_type, 'offer')) <> 'wanted'`);
  } else if (kind === "market") {
    extra.push(`lower(coalesce(s.kind, '')) in ('market', 'item', 'items')`);
    extra.push(`lower(coalesce(s.offer_type, 'offer')) <> 'wanted'`);
  } else if (kind === "looking") {
    extra.push(`lower(coalesce(s.offer_type, 'offer')) = 'wanted'`);
  }

  const where = publicWhere("s", opts, params, extra);
  const limit = Math.min(Math.max(opts.limit ?? HOME_FEED_LIMIT, 1), SEARCH_FEED_LIMIT);
  params.push(limit);

  const rows = await sql.query<ServiceJoin>(
    `select ${SERVICE_SELECT}
     from services s
     left join profiles p on p.id = s.user_id
     where ${where}
     order by s.created_at desc
     limit $${params.length}`,
    params,
  );
  return rows.map(mapService);
}

/**
 * Legacy classifieds in `items` (status `available`). Empty on production today;
 * still unioned so Discover cannot miss a table.
 */
export async function fetchPublicItems(
  sql: Sql,
  opts: PublicFeedOpts = {},
): Promise<FeedCard[]> {
  const kind = opts.kind && opts.kind !== "all" ? opts.kind : undefined;
  if (kind === "services" || kind === "jobs") return [];

  const params: unknown[] = [];
  const extra: string[] = [];
  if (kind === "looking") extra.push(`lower(coalesce(i.type, '')) = 'wanted'`);

  const where = publicWhere("i", opts, params, extra);
  const limit = Math.min(Math.max(opts.limit ?? HOME_FEED_LIMIT, 1), SEARCH_FEED_LIMIT);
  params.push(limit);

  const rows = await sql.query<ItemJoin>(
    `select ${ITEM_SELECT}
     from items i
     left join profiles p on p.id = i.user_id
     where ${where}
     order by i.created_at desc
     limit $${params.length}`,
    params,
  );
  return rows.map(mapItem);
}

/** Newest public listings from **both** `services` and `items`. */
export async function fetchPublicFeed(
  sql: Sql,
  opts: PublicFeedOpts = {},
): Promise<FeedCard[]> {
  const limit = Math.min(Math.max(opts.limit ?? HOME_FEED_LIMIT, 1), SEARCH_FEED_LIMIT);
  const settled = await Promise.allSettled([
    fetchPublicServices(sql, { ...opts, limit }),
    fetchPublicItems(sql, { ...opts, limit }),
  ]);
  const groups = settled.map((r) => (r.status === "fulfilled" ? r.value : []));
  return mergeNewest(groups, limit);
}

export async function getDb() {
  return getSql();
}

export type { ListingKind };
