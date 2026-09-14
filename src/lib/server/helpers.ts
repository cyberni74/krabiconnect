import { getSql, type Sql } from "@/lib/db";
import type { ListingKind } from "@/lib/constants";
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
  if (raw === "job" || raw === "market") return raw;
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
    district: row.district,
    lat: row.lat,
    lng: row.lng,
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

export async function getDb() {
  return getSql();
}

export type { ListingKind };
