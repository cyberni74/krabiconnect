import { createServerFn } from "@tanstack/react-start";
import { fetchServices, getDb } from "./helpers";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string | null;
  location: string | null;
  isVerified: boolean;
  isAdmin: boolean;
  listingCount: number;
  createdAt: string;
};

async function boot() {
  const { ensureAdmin } = await import("./admin-boot.server");
  await ensureAdmin();
}

export const getAdminOverview = createServerFn({ method: "GET" }).handler(async () => {
  await boot();
  const sql = await getDb();
  const listings = await fetchServices(sql);
  const users = await sql<{
    id: string;
    name: string;
    email: string | null;
    location: string | null;
    is_verified: boolean;
    is_admin: boolean;
    listing_count: number;
    created_at: string;
  }>`
    select
      p.id, p.name, u.email, p.location, p.is_verified, p.is_admin, p.created_at,
      (select count(*)::int from services s where s.user_id = p.id) as listing_count
    from profiles p
    left join "user" u on u.id = p.id
    order by p.created_at desc
  `;
  const reviews = await sql<{
    id: string;
    rating: number;
    comment_th: string | null;
    comment_en: string | null;
    created_at: string;
    reviewer_name: string | null;
    target_name: string | null;
  }>`
    select r.id, r.rating, r.comment_th, r.comment_en, r.created_at,
      rp.name as reviewer_name, tp.name as target_name
    from reviews r
    left join profiles rp on rp.id = r.reviewer_id
    left join profiles tp on tp.id = r.target_user_id
    order by r.created_at desc
  `;
  return {
    listings,
    users: users.map(
      (u): AdminUserRow => ({
        id: u.id,
        name: u.name,
        email: u.email,
        location: u.location,
        isVerified: Boolean(u.is_verified),
        isAdmin: Boolean(u.is_admin),
        listingCount: Number(u.listing_count),
        createdAt: String(u.created_at),
      }),
    ),
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: Number(r.rating),
      commentTh: r.comment_th,
      commentEn: r.comment_en,
      createdAt: String(r.created_at),
      reviewerName: r.reviewer_name ?? "Neighbour",
      targetName: r.target_name ?? "Neighbour",
    })),
  };
});

export const adminSetListingStatus = createServerFn({ method: "POST" })
  .validator((input: { id: string; status: string }) => input)
  .handler(async ({ data }) => {
    await boot();
    const sql = await getDb();
    await sql`update services set status = ${data.status} where id = ${data.id}`;
    return { ok: true };
  });

export const adminDeleteListing = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await boot();
    const sql = await getDb();
    await sql`delete from services where id = ${data.id}`;
    return { ok: true };
  });

export const adminSetUserFlags = createServerFn({ method: "POST" })
  .validator((input: { id: string; isVerified?: boolean; isAdmin?: boolean }) => input)
  .handler(async ({ data }) => {
    await boot();
    const sql = await getDb();
    if (data.isVerified != null) {
      await sql`update profiles set is_verified = ${data.isVerified} where id = ${data.id}`;
    }
    if (data.isAdmin != null) {
      await sql`update profiles set is_admin = ${data.isAdmin} where id = ${data.id}`;
    }
    return { ok: true };
  });

export const adminDeleteReview = createServerFn({ method: "POST" })
  .validator((input: { id: string }) => input)
  .handler(async ({ data }) => {
    await boot();
    const sql = await getDb();
    await sql`delete from reviews where id = ${data.id}`;
    return { ok: true };
  });
