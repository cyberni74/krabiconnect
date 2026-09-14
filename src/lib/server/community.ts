import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { listingCoverSrc, toOwnedImageUrl } from "@/lib/owned-image";
import { detectLang, parseFacebookUrl, parseImages, uid } from "@/lib/utils";
import type { Booking, ChatMessage, Conversation, Profile, Review } from "@/lib/types";
import { ensureProfile, getDb } from "./helpers";
import { translateListing, translateText } from "./translate";

export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getDb();
    await ensureProfile(sql, context.userId);
    const { ensureAdmin } = await import("./admin-boot.server");
    await ensureAdmin();
    return loadProfile(sql, context.userId);
  });

export const getPublicProfile = createServerFn({ method: "GET" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const sql = await getDb();
    return loadProfile(sql, id);
  });

type SqlClient = Awaited<ReturnType<typeof getDb>>;

async function loadProfile(sql: SqlClient, id: string): Promise<Profile | null> {
  const rows = await sql<{
    id: string;
    name: string;
    phone: string | null;
    location: string | null;
    avatar_url: string | null;
    preferred_language: string;
    is_verified: boolean;
    bio_th: string | null;
    bio_en: string | null;
    created_at: string;
    facebook_url: string | null;
    facebook_id: string | null;
    facebook_name: string | null;
    facebook_photo: string | null;
  }>`select * from profiles where id = ${id}`;
  const p = rows[0];
  if (!p) return null;
  const stats = await sql<{ avg: number | null; n: number; items: number; services: number; is_admin: boolean | null }>`
    select
      (select avg(rating)::float from reviews where target_user_id = ${id}) as avg,
      (select count(*)::int from reviews where target_user_id = ${id}) as n,
      (select count(*)::int from items where user_id = ${id}) as items,
      (select count(*)::int from services where user_id = ${id}) as services,
      (select is_admin from profiles where id = ${id}) as is_admin
  `;
  const s = stats[0];
  return {
    id: p.id,
    name: p.name,
    phone: p.phone,
    location: p.location,
    avatarUrl: p.avatar_url,
    preferredLanguage: p.preferred_language === "th" ? "th" : "en",
    isVerified: Boolean(p.is_verified),
    bioTh: p.bio_th,
    bioEn: p.bio_en,
    createdAt: String(p.created_at),
    ratingAvg: s?.avg != null ? Number(s.avg) : null,
    reviewCount: Number(s?.n ?? 0),
    itemCount: Number(s?.items ?? 0),
    serviceCount: Number(s?.services ?? 0),
    isAdmin: Boolean(s?.is_admin),
    facebookUrl: p.facebook_url ?? null,
    facebookName: p.facebook_name ?? null,
    facebookPhoto: p.facebook_photo ? toOwnedImageUrl(p.facebook_photo) : null,
  };
}

export const updateMyProfile = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      name: string;
      phone?: string;
      location?: string;
      preferredLanguage?: "en" | "th";
      bio?: string;
      avatarUrl?: string | null;
      verify?: boolean;
      facebookUrl?: string | null;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await getDb();
    await ensureProfile(sql, context.userId, data.name, data.preferredLanguage);
    const source = data.bio ? detectLang(data.bio) : "en";
    let bioTh: string | null = null;
    let bioEn: string | null = null;
    if (data.bio?.trim()) {
      const tr = await translateListing(data.name, data.bio, source);
      bioTh = source === "th" ? data.bio : tr.descriptionTh;
      bioEn = source === "en" ? data.bio : tr.descriptionEn;
    }
    const facebookUrl = data.facebookUrl ? parseFacebookUrl(data.facebookUrl) : null;
    if (data.facebookUrl?.trim() && !facebookUrl) throw new Error("Invalid Facebook profile");
    let facebookId: string | null = null;
    let facebookName: string | null = null;
    let facebookPhoto: string | null = null;
    if (facebookUrl) {
      const { resolveFacebookProfile } = await import("./facebook.server");
      const fb = await resolveFacebookProfile(facebookUrl).catch(() => null);
      if (fb) {
        facebookId = fb.id;
        facebookName = fb.name;
        facebookPhoto = fb.photo;
      }
    }
    const verified =
      Boolean(data.verify) &&
      Boolean(data.name.trim()) &&
      Boolean(data.phone?.trim()) &&
      Boolean(data.location);
    await sql`
      update profiles set
        name = ${data.name.trim()},
        phone = ${data.phone?.trim() || null},
        location = ${data.location || null},
        preferred_language = ${data.preferredLanguage ?? "en"},
        bio_th = coalesce(${bioTh}, bio_th),
        bio_en = coalesce(${bioEn}, bio_en),
        avatar_url = coalesce(${data.avatarUrl ?? null}, avatar_url),
        is_verified = ${verified},
        facebook_url = ${facebookUrl},
        facebook_id = ${facebookId},
        facebook_name = ${facebookName},
        facebook_photo = ${facebookPhoto}
      where id = ${context.userId}
    `;
    return loadProfile(sql, context.userId);
  });

export const listReviews = createServerFn({ method: "GET" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const sql = await getDb();
    const rows = await sql<{
      id: string;
      reviewer_id: string;
      target_user_id: string;
      rating: number;
      comment_th: string | null;
      comment_en: string | null;
      source_language: string;
      created_at: string;
      reviewer_name: string | null;
    }>`
      select r.*, p.name as reviewer_name
      from reviews r
      left join profiles p on p.id = r.reviewer_id
      where r.target_user_id = ${userId}
      order by r.created_at desc
    `;
    return rows.map(
      (r): Review => ({
        id: r.id,
        reviewerId: r.reviewer_id,
        targetUserId: r.target_user_id,
        rating: Number(r.rating),
        commentTh: r.comment_th,
        commentEn: r.comment_en,
        sourceLanguage: r.source_language === "th" ? "th" : "en",
        createdAt: String(r.created_at),
        reviewerName: r.reviewer_name ?? "Neighbour",
      }),
    );
  });

export const addReview = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { targetUserId: string; rating: number; comment: string }) => input)
  .handler(async ({ context, data }) => {
    if (data.targetUserId === context.userId) throw new Error("Cannot review yourself");
    const sql = await getDb();
    await ensureProfile(sql, context.userId);
    const source = detectLang(data.comment);
    const tr = data.comment.trim()
      ? await translateListing("review", data.comment, source)
      : { descriptionTh: "", descriptionEn: "" };
    const id = uid();
    await sql`
      insert into reviews (id, reviewer_id, target_user_id, rating, comment_th, comment_en, source_language)
      values (
        ${id}, ${context.userId}, ${data.targetUserId}, ${Math.min(5, Math.max(1, data.rating))},
        ${tr.descriptionTh || data.comment}, ${tr.descriptionEn || data.comment}, ${source}
      )
    `;
    return { id };
  });

export const listConversations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getDb();
    await ensureProfile(sql, context.userId);
    const rows = await sql.query<{
      id: string;
      requester_id: string;
      provider_id: string;
      item_id: string | null;
      service_id: string | null;
      created_at: string;
      item_title_th: string | null;
      item_title_en: string | null;
      item_images: string | null;
      svc_title_th: string | null;
      svc_title_en: string | null;
      svc_images: string | null;
      requester_name: string | null;
      requester_avatar: string | null;
      provider_name: string | null;
      provider_avatar: string | null;
      last_text: string | null;
      last_at: string | null;
    }>(
      `select c.*,
        i.title_th as item_title_th, i.title_en as item_title_en, i.images as item_images,
        s.title_th as svc_title_th, s.title_en as svc_title_en, s.images as svc_images,
        rp.name as requester_name, rp.avatar_url as requester_avatar,
        pp.name as provider_name, pp.avatar_url as provider_avatar,
        (select m.text_original from messages m where m.conversation_id = c.id order by m.created_at desc limit 1) as last_text,
        (select m.created_at from messages m where m.conversation_id = c.id order by m.created_at desc limit 1) as last_at
       from conversations c
       left join items i on i.id = c.item_id
       left join services s on s.id = c.service_id
       left join profiles rp on rp.id = c.requester_id
       left join profiles pp on pp.id = c.provider_id
       where c.requester_id = $1 or c.provider_id = $1
       order by coalesce(
         (select m.created_at from messages m where m.conversation_id = c.id order by m.created_at desc limit 1),
         c.created_at
       ) desc`,
      [context.userId],
    );
    return rows.map((r): Conversation => {
      const isRequester = r.requester_id === context.userId;
      const imgs = parseImages(r.item_images ?? r.svc_images);
      return {
        id: r.id,
        requesterId: r.requester_id,
        providerId: r.provider_id,
        itemId: r.item_id,
        serviceId: r.service_id,
        createdAt: String(r.created_at),
        listingTitleTh: r.item_title_th ?? r.svc_title_th ?? "",
        listingTitleEn: r.item_title_en ?? r.svc_title_en ?? "",
        listingImage: listingCoverSrc({ images: imgs }) ?? null,
        listingKind: r.service_id ? "service" : null,
        otherName: (isRequester ? r.provider_name : r.requester_name) ?? "Neighbour",
        otherAvatar: isRequester ? r.provider_avatar : r.requester_avatar,
        lastText: r.last_text,
        lastAt: r.last_at ? String(r.last_at) : null,
        unread: 0,
      };
    });
  });

export const openConversation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      providerId: string;
      itemId?: string | null;
      serviceId?: string | null;
      name?: string | null;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    if (data.providerId === context.userId) throw new Error("Cannot message yourself");
    const sql = await getDb();
    await ensureProfile(sql, context.userId, data.name);
    const existing = await sql<{ id: string }>`
      select id from conversations
      where requester_id = ${context.userId}
        and provider_id = ${data.providerId}
        and coalesce(item_id, '') = ${data.itemId ?? ""}
        and coalesce(service_id, '') = ${data.serviceId ?? ""}
      limit 1
    `;
    if (existing[0]) return { id: existing[0].id };
    const id = uid();
    await sql`
      insert into conversations (id, requester_id, provider_id, item_id, service_id)
      values (${id}, ${context.userId}, ${data.providerId}, ${data.itemId ?? null}, ${data.serviceId ?? null})
    `;
    return { id };
  });

export const getMessages = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((conversationId: string) => conversationId)
  .handler(async ({ context, data: conversationId }) => {
    const sql = await getDb();
    const conv = await sql<{
      id: string;
      requester_id: string;
      provider_id: string;
      item_id: string | null;
      service_id: string | null;
    }>`select * from conversations where id = ${conversationId}`;
    const c = conv[0];
    if (!c || (c.requester_id !== context.userId && c.provider_id !== context.userId)) {
      return { conversation: null, messages: [] as ChatMessage[], bookings: [] as Booking[] };
    }
    const msgs = await sql<{
      id: string;
      conversation_id: string;
      sender_id: string;
      text_original: string;
      text_translated: string | null;
      original_language: string;
      created_at: string;
    }>`select * from messages where conversation_id = ${conversationId} order by created_at asc`;
    const bookings = await loadBookings(sql, { conversationId });
    const otherId = c.requester_id === context.userId ? c.provider_id : c.requester_id;
    const other = await sql<{ name: string | null; avatar_url: string | null }>`
      select name, avatar_url from profiles where id = ${otherId}
    `;
    const listing = c.item_id
      ? await sql<{ title_th: string; title_en: string; images: string }>`
          select title_th, title_en, images from items where id = ${c.item_id}
        `
      : c.service_id
        ? await sql<{ title_th: string; title_en: string; images: string }>`
            select title_th, title_en, images from services where id = ${c.service_id}
          `
        : [];
    const imgs = listing[0] ? parseImages(listing[0].images) : [];
    const summary: Conversation = {
      id: c.id,
      requesterId: c.requester_id,
      providerId: c.provider_id,
      itemId: c.item_id,
      serviceId: c.service_id,
      createdAt: "",
      listingTitleTh: listing[0]?.title_th ?? "",
      listingTitleEn: listing[0]?.title_en ?? "",
      listingImage: listingCoverSrc({ images: imgs }) ?? null,
      listingKind: c.service_id ? "service" : null,
      otherName: other[0]?.name ?? "Neighbour",
      otherAvatar: other[0]?.avatar_url ?? null,
      lastText: null,
      lastAt: null,
      unread: 0,
    };
    return {
      conversation: summary,
      messages: msgs.map(
        (m): ChatMessage => ({
          id: m.id,
          conversationId: m.conversation_id,
          senderId: m.sender_id,
          textOriginal: m.text_original,
          textTranslated: m.text_translated,
          originalLanguage: m.original_language === "th" ? "th" : "en",
          createdAt: String(m.created_at),
        }),
      ),
      bookings,
    };
  });

export const sendMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { conversationId: string; text: string }) => input)
  .handler(async ({ context, data }) => {
    const text = data.text.trim();
    if (!text) return { ok: false };
    const sql = await getDb();
    const conv = await sql<{ requester_id: string; provider_id: string }>`
      select requester_id, provider_id from conversations where id = ${data.conversationId}
    `;
    const c = conv[0];
    if (!c || (c.requester_id !== context.userId && c.provider_id !== context.userId)) {
      throw new Error("Unauthorized");
    }
    const source = detectLang(text);
    const translated = await translateText(text, source);
    const id = uid();
    await sql`
      insert into messages (id, conversation_id, sender_id, text_original, text_translated, original_language)
      values (${id}, ${data.conversationId}, ${context.userId}, ${text}, ${translated}, ${source})
    `;
    return { id };
  });

export const createBooking = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(
    (input: {
      conversationId: string;
      providerId: string;
      itemId?: string | null;
      serviceId?: string | null;
      startDate: string;
      endDate: string;
      totalPrice?: number | null;
    }) => input,
  )
  .handler(async ({ context, data }) => {
    const sql = await getDb();
    const id = uid();
    await sql`
      insert into bookings_and_rentals (
        id, requester_id, provider_id, item_id, service_id, conversation_id,
        start_date, end_date, status, total_price
      ) values (
        ${id}, ${context.userId}, ${data.providerId}, ${data.itemId ?? null},
        ${data.serviceId ?? null}, ${data.conversationId}, ${data.startDate},
        ${data.endDate}, ${"pending"}, ${data.totalPrice ?? null}
      )
    `;
    const note = `Booking request ${data.startDate} → ${data.endDate}`;
    await sql`
      insert into messages (id, conversation_id, booking_id, sender_id, text_original, text_translated, original_language)
      values (${uid()}, ${data.conversationId}, ${id}, ${context.userId}, ${note}, ${note}, ${"en"})
    `;
    return { id };
  });

export const setBookingStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; status: "confirmed" | "cancelled" | "completed" }) => input)
  .handler(async ({ context, data }) => {
    const sql = await getDb();
    await sql`
      update bookings_and_rentals
      set status = ${data.status}
      where id = ${data.id} and (provider_id = ${context.userId} or requester_id = ${context.userId})
    `;
    if (data.status === "confirmed") {
      const b = await sql<{ item_id: string | null }>`
        select item_id from bookings_and_rentals where id = ${data.id} and provider_id = ${context.userId}
      `;
      if (b[0]?.item_id) {
        await sql`update items set status = ${"lent"} where id = ${b[0].item_id} and user_id = ${context.userId}`;
      }
    }
    if (data.status === "completed" || data.status === "cancelled") {
      const b = await sql<{ item_id: string | null }>`
        select item_id from bookings_and_rentals where id = ${data.id} and provider_id = ${context.userId}
      `;
      if (b[0]?.item_id) {
        await sql`update items set status = ${"available"} where id = ${b[0].item_id} and user_id = ${context.userId}`;
      }
    }
    return { ok: true };
  });

export const myBookings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const sql = await getDb();
    const all = await loadBookings(sql, { userId: context.userId });
    return {
      incoming: all.filter((b) => b.providerId === context.userId),
      outgoing: all.filter((b) => b.requesterId === context.userId),
    };
  });

async function loadBookings(
  sql: SqlClient,
  opts: { userId?: string; conversationId?: string },
): Promise<Booking[]> {
  const rows = opts.conversationId
    ? await sql.query<{
        id: string;
        requester_id: string;
        provider_id: string;
        item_id: string | null;
        service_id: string | null;
        conversation_id: string | null;
        start_date: string | null;
        end_date: string | null;
        status: string;
        total_price: number | null;
        created_at: string;
        item_title_th: string | null;
        item_title_en: string | null;
        svc_title_th: string | null;
        svc_title_en: string | null;
        requester_name: string | null;
        provider_name: string | null;
      }>(
        `select b.*,
          i.title_th as item_title_th, i.title_en as item_title_en,
          s.title_th as svc_title_th, s.title_en as svc_title_en,
          rp.name as requester_name, pp.name as provider_name
         from bookings_and_rentals b
         left join items i on i.id = b.item_id
         left join services s on s.id = b.service_id
         left join profiles rp on rp.id = b.requester_id
         left join profiles pp on pp.id = b.provider_id
         where b.conversation_id = $1
         order by b.created_at desc`,
        [opts.conversationId],
      )
    : await sql.query<{
        id: string;
        requester_id: string;
        provider_id: string;
        item_id: string | null;
        service_id: string | null;
        conversation_id: string | null;
        start_date: string | null;
        end_date: string | null;
        status: string;
        total_price: number | null;
        created_at: string;
        item_title_th: string | null;
        item_title_en: string | null;
        svc_title_th: string | null;
        svc_title_en: string | null;
        requester_name: string | null;
        provider_name: string | null;
      }>(
        `select b.*,
          i.title_th as item_title_th, i.title_en as item_title_en,
          s.title_th as svc_title_th, s.title_en as svc_title_en,
          rp.name as requester_name, pp.name as provider_name
         from bookings_and_rentals b
         left join items i on i.id = b.item_id
         left join services s on s.id = b.service_id
         left join profiles rp on rp.id = b.requester_id
         left join profiles pp on pp.id = b.provider_id
         where b.requester_id = $1 or b.provider_id = $1
         order by b.created_at desc`,
        [opts.userId],
      );
  return rows.map((r) => ({
    id: r.id,
    requesterId: r.requester_id,
    providerId: r.provider_id,
    itemId: r.item_id,
    serviceId: r.service_id,
    conversationId: r.conversation_id,
    startDate: r.start_date,
    endDate: r.end_date,
    status: r.status,
    totalPrice: r.total_price,
    createdAt: String(r.created_at),
    listingTitleTh: r.item_title_th ?? r.svc_title_th ?? "",
    listingTitleEn: r.item_title_en ?? r.svc_title_en ?? "",
    otherName: r.requester_id === opts.userId ? (r.provider_name ?? "") : (r.requester_name ?? ""),
  }));
}
