/**
 * Server-only logic for Krabi Secret Islands booking requests: storage, rate limit, e-mail notification.
 * Env (set in Vercel, never in a .env file):
 *   RESEND_API_KEY        – Resend API key (optional; without it no e-mail is sent, the request is still stored)
 *   BOOKING_NOTIFY_EMAIL  – where new requests are sent (comma-separated allowed)
 *   BOOKING_FROM_EMAIL    – verified sender, e.g. "Krabi Secret Islands <anfragen@krabi-secret-islands.com>"
 */
import { createHash, randomUUID } from "node:crypto";
import { getRequest } from "@tanstack/react-start/server";
import { getSql } from "@/lib/db";
import { buildMessage, currentTour, durationOf, priceBreakdown, routeNames, type Draft } from "@/components/secret-islands/booking-model";
import { translate } from "@/components/secret-islands/store";
import type { Lang } from "@/components/secret-islands/content";
import type { BookingSubmission } from "./booking-requests";

const MAX_PER_IP_PER_HOUR = 8;

function clientIpHash(): string | null {
  try {
    const h = getRequest().headers;
    const ip = (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "").split(",")[0]?.trim();
    if (!ip) return null;
    // Salted hash – we never store raw IP addresses.
    return createHash("sha256").update(`ksi:${ip}`).digest("hex").slice(0, 32);
  } catch {
    return null;
  }
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

async function notifyByEmail(ref: string, subject: string, text: string, replyTo: string | null) {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_NOTIFY_EMAIL;
  const from = process.env.BOOKING_FROM_EMAIL ?? "Krabi Secret Islands <onboarding@resend.dev>";
  if (!key || !to) return { sent: false as const, reason: "not-configured" };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "Idempotency-Key": `booking-${ref}` },
    body: JSON.stringify({
      from,
      to: to.split(",").map((s) => s.trim()).filter(Boolean),
      subject,
      text,
      html: `<pre style="font:14px/1.5 system-ui,sans-serif;white-space:pre-wrap">${escapeHtml(text)}</pre>`,
      ...(replyTo ? { reply_to: replyTo } : {}),
    }),
  });
  if (!res.ok) {
    console.error("[booking] Resend error", res.status, await res.text().catch(() => ""));
    return { sent: false as const, reason: `resend-${res.status}` };
  }
  return { sent: true as const };
}

export async function storeBookingRequest(input: BookingSubmission) {
  const sql = await getSql();
  const ipHash = clientIpHash();
  if (ipHash) {
    const recent = await sql<{ n: number }>`
      select count(*)::int as n from booking_requests
      where ip_hash = ${ipHash} and created_at > now() - interval '1 hour'
    `;
    if ((recent[0]?.n ?? 0) >= MAX_PER_IP_PER_HOUR) return { ok: false as const, error: "rate-limited" };
  }

  const draft = input.draft as Draft;
  const lang = input.lang as Lang;
  // Recompute on the server – never trust a client-side total.
  const price = priceBreakdown(draft);
  const tour = currentTour(draft);
  const tourTitle =
    draft.mode === "preset"
      ? tour
        ? translate(tour.title, "de")
        : "?"
      : `Eigene Tour (${translate(durationOf(draft.duration).label, "de")}): ${routeNames(draft).join(", ")}`;
  const opT = (l: { de: string; en: string }) => l.de;
  const message = `Anfrage-Nr. ${input.ref}\n\n${buildMessage(draft, lang, opT).replace(/\*/g, "")}`;

  const inserted = await sql<{ ref: string }>`
    insert into booking_requests (
      id, ref, lang, channel, tour_id, tour_title, tour_date, slot, guests, kids, total_thb,
      name, email, phone, hotel, occasion, wishes, draft, message, ip_hash
    ) values (
      ${randomUUID()}, ${input.ref}, ${lang}, ${input.channel}, ${draft.mode === "preset" ? draft.tourId : null}, ${tourTitle},
      ${draft.date}, ${draft.slot}, ${draft.guests}, ${draft.kids}, ${price.total},
      ${draft.name.trim()}, ${draft.email.trim() || null}, ${draft.phone.trim() || null}, ${draft.hotel.trim() || null},
      ${draft.occasion}, ${draft.wishes.trim() || null}, ${JSON.stringify(draft)}::jsonb, ${message}, ${ipHash}
    )
    on conflict (ref) do nothing
    returning ref
  `;
  if (!inserted[0]) return { ok: true as const, ref: input.ref, duplicate: true };

  const mail = await notifyByEmail(
    input.ref,
    `Neue Anfrage ${input.ref}: ${tourTitle} · ${draft.date ?? "–"} · ${draft.guests} Pers. · ฿${price.total.toLocaleString("de-DE")}`,
    message,
    draft.email.trim() || null,
  ).catch((err) => {
    console.error("[booking] e-mail failed", err);
    return { sent: false as const, reason: "exception" };
  });
  return { ok: true as const, ref: input.ref, emailed: mail.sent };
}

export type BookingRow = {
  id: string;
  ref: string;
  status: string;
  created_at: string;
  lang: string;
  channel: string;
  tour_title: string;
  tour_date: string | null;
  slot: string | null;
  guests: number;
  kids: number;
  total_thb: number;
  name: string;
  email: string | null;
  phone: string | null;
  hotel: string | null;
  occasion: string | null;
  wishes: string | null;
  message: string;
  admin_note: string | null;
};

export async function listBookingRows(): Promise<BookingRow[]> {
  const sql = await getSql();
  return sql<BookingRow>`
    select id, ref, status, created_at::text as created_at, lang, channel, tour_title, tour_date, slot, guests, kids,
      total_thb, name, email, phone, hotel, occasion, wishes, message, admin_note
    from booking_requests
    order by created_at desc
    limit 500
  `;
}

export async function updateBookingRow(id: string, status: string, note: string | null) {
  const sql = await getSql();
  await sql`update booking_requests set status = ${status}, admin_note = ${note}, updated_at = now() where id = ${id}`;
}
