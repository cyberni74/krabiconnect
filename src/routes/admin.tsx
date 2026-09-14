import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { loc, useT } from "@/lib/i18n";
import {
  adminDeleteListing,
  adminDeleteReview,
  adminSetListingStatus,
  adminSetUserFlags,
  getAdminOverview,
} from "@/lib/server/admin";
import { getAgentAccess, rotateAgentToken } from "@/lib/server/agent";
import { districtName, kindLabel } from "@/lib/constants";
import { priceLabel } from "@/components/listings/listing-card";

export const Route = createFileRoute("/admin")({ component: AdminDashboard });

function AdminDashboard() {
  const { lang, t } = useT();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"listings" | "users" | "reviews" | "agents">("listings");

  const data = useQuery({
    queryKey: ["admin"],
    queryFn: () => getAdminOverview(),
  });

  const listings = data.data?.listings ?? [];
  const users = data.data?.users ?? [];
  const reviews = data.data?.reviews ?? [];

  const delListing = useMutation({
    mutationFn: (id: string) => adminDeleteListing({ data: { id } }),
    onSuccess: () => {
      toast.success(t("delete"));
      void qc.invalidateQueries({ queryKey: ["admin"] });
      void qc.invalidateQueries({ queryKey: ["feed"] });
    },
  });
  const pause = useMutation({
    mutationFn: (input: { id: string; status: string }) => adminSetListingStatus({ data: input }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin"] }),
  });
  const flags = useMutation({
    mutationFn: (input: { id: string; isVerified?: boolean; isAdmin?: boolean }) =>
      adminSetUserFlags({ data: input }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["admin"] }),
    onError: (err) => toast.error(err instanceof Error ? err.message : t("loadError")),
  });
  const delReview = useMutation({
    mutationFn: (id: string) => adminDeleteReview({ data: { id } }),
    onSuccess: () => {
      toast.success(t("delete"));
      void qc.invalidateQueries({ queryKey: ["admin"] });
    },
  });

  return (
    <main className="px-4 py-5">
      <div className="mb-4 flex items-center gap-2">
        <Shield className="size-5 text-primary" />
        <h1 className="text-2xl font-semibold tracking-tight">{t("admin")}</h1>
      </div>
      <p className="mb-4 text-sm text-muted">{t("adminIntro")}</p>

      <div className="mb-5 grid grid-cols-3 gap-2">
        <Stat label={t("listings")} value={String(listings.length)} />
        <Stat label={t("users")} value={String(users.length)} />
        <Stat label={t("reviews")} value={String(reviews.length)} />
      </div>

      <div className="mb-4 flex gap-2 overflow-x-auto hide-scroll">
        {(
          [
            ["listings", t("listings")],
            ["users", t("users")],
            ["reviews", t("reviews")],
            ["agents", t("agents")],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={
              tab === id
                ? "h-9 shrink-0 rounded-full bg-fg px-3 text-sm font-medium text-primary-fg"
                : "h-9 shrink-0 rounded-full bg-surface px-3 text-sm font-medium text-muted shadow-card"
            }
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "listings" ? (
        <ul className="space-y-3">
          {listings.length === 0 ? (
            <p className="rounded-2xl bg-surface px-4 py-8 text-center text-sm text-muted shadow-card">
              {t("emptyFeed")}
            </p>
          ) : (
            listings.map((card) => {
              const on = card.status === "active" || card.status === "available";
              return (
                <li key={card.id} className="rounded-2xl bg-surface p-3 shadow-card">
                  <p className="font-medium">{loc(lang, card.titleTh, card.titleEn)}</p>
                  <p className="mt-0.5 text-xs text-muted">
                    {kindLabel(card.kind, lang)} · {card.ownerName} · {districtName(card.district, lang)} ·{" "}
                    {priceLabel(card, lang, t)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge tone={on ? "success" : "muted"}>{on ? t("active") : t("paused")}</Badge>
                    <button
                      type="button"
                      className="text-xs font-medium text-primary"
                      onClick={() => pause.mutate({ id: card.id, status: on ? "paused" : "active" })}
                    >
                      {on ? t("paused") : t("toggleAvail")}
                    </button>
                    <button
                      type="button"
                      className="ml-auto text-xs text-danger"
                      onClick={() => delListing.mutate(card.id)}
                    >
                      {t("delete")}
                    </button>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      ) : null}

      {tab === "users" ? (
        <ul className="space-y-3">
          {users.map((u) => (
            <li key={u.id} className="rounded-2xl bg-surface p-3 shadow-card">
              <p className="font-medium">{u.name}</p>
              <p className="text-xs text-muted">
                {u.email ?? "—"} · {u.listingCount} {t("listings")}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {u.isAdmin ? <Badge tone="primary">{t("admin")}</Badge> : null}
                {u.isVerified ? <Badge tone="success">{t("verified")}</Badge> : null}
                <button
                  type="button"
                  className="text-xs font-medium text-primary"
                  onClick={() => flags.mutate({ id: u.id, isVerified: !u.isVerified })}
                >
                  {u.isVerified ? t("verified") : t("verify")}
                </button>
                <button
                  type="button"
                  className="text-xs font-medium text-primary"
                  onClick={() => flags.mutate({ id: u.id, isAdmin: !u.isAdmin })}
                >
                  {u.isAdmin ? t("removeAdmin") : t("makeAdmin")}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {tab === "reviews" ? (
        <ul className="space-y-3">
          {reviews.length === 0 ? (
            <p className="rounded-2xl bg-surface px-4 py-8 text-center text-sm text-muted shadow-card">
              {t("noReviews")}
            </p>
          ) : (
            reviews.map((r) => (
              <li key={r.id} className="rounded-2xl bg-surface p-3 shadow-card">
                <p className="text-sm font-medium">
                  {r.reviewerName} → {r.targetName} · {r.rating}
                </p>
                <p className="mt-1 text-sm text-muted">{loc(lang, r.commentTh ?? "", r.commentEn ?? "")}</p>
                <button
                  type="button"
                  className="mt-2 text-xs text-danger"
                  onClick={() => delReview.mutate(r.id)}
                >
                  {t("delete")}
                </button>
              </li>
            ))
          )}
        </ul>
      ) : null}

      {tab === "agents" ? <AgentPanel /> : null}

      <Link to="/" className="mt-8 inline-block text-sm text-muted">
        {t("back")}
      </Link>
    </main>
  );
}

function agentBrief(origin: string, token: string) {
  return `You are the KrabiMarketplace import bot.

Your job: copy Facebook Marketplace listings (Krabi / Ao Nang area) into KrabiMarketplace.

API
GET   ${origin}/api/agent/listings   (validate key first)
POST  ${origin}/api/agent/listings
PATCH ${origin}/api/agent/listings/:id
Authorization: Bearer ${token}
Content-Type: application/json

Send one object or { "listings": [ ... ] } — max 20 per request.

{
  "title": "Honda PCX 160",
  "description": "2022, 12,000 km, Ao Nang",
  "priceThb": 65000,
  "kind": "market",
  "category": "vehicles",
  "district": "ao-nang",
  "images": ["https://scontent.xx.fbcdn.net/v/…"],
  "facebookUrl": "https://www.facebook.com/seller.profile",
  "facebookName": "Seller name",
  "sourceUrl": "https://www.facebook.com/marketplace/item/123"
}

Duplicates: matching sourceUrl or id does not create a second row.
If the existing row has no usable photos (blank, or only Facebook photo.php?fbid= HTML)
and images[] has HTTPS/fbcdn URLs, those images are merged onto the existing row
(cover = images[0]). fbcdn photos are rewritten to ${origin}/api/img?u=… so Discover
heroes render without a Blob token. PATCH /api/agent/listings/:id with { "images": ["https://…"] }
replaces photos on a known id.
POST ${origin}/api/agent/rehost { "url": "https://scontent…/photo.jpg" } copies to Vercel Blob
when BLOB_READ_WRITE_TOKEN is set (503 if missing). GET ${origin}/api/img?u=… is public.

kind: market | service | job
category (market): vehicles | boats | property | electronics | furniture | fashion | other
district: ao-nang | krabi-town | nong-thale | klong-muang | krabi-noi | railay

Rules
- facebookUrl = seller PROFILE, not only the Marketplace item
- sourceUrl = Marketplace item link (prevents duplicates)
- Re-POST the same sourceUrl with images[] to attach photos onto blank listings
- Do not translate. Send original Thai or English.

401 Unauthorized
Do not retry the same key. Stop importing.
Tell the operator: open /admin → Grok agents → Create new key, then replace Authorization: Bearer …
codes: missing_token (no header), invalid_token (not Bearer kc_live_ + 48 hex), unknown_token (key rotated or never created).
Always GET the endpoint first. Only POST after { "ok": true, "valid": true }.`;
}

function AgentPanel() {
  const { t } = useT();
  const qc = useQueryClient();
  const [fresh, setFresh] = useState<string | null>(null);
  const access = useQuery({ queryKey: ["agent-access"], queryFn: () => getAgentAccess() });
  const rotate = useMutation({
    mutationFn: () => rotateAgentToken(),
    onSuccess: (res) => {
      setFresh(res.token);
      void qc.invalidateQueries({ queryKey: ["agent-access"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : t("loadError")),
  });

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const token = fresh ?? "kc_live_YOUR_KEY";
  const brief = agentBrief(origin, token);

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(t("agentCopied"));
    } catch {
      toast.error(t("loadError"));
    }
  }

  const status = access.data;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-surface p-4 shadow-card">
        <h2 className="text-lg font-semibold">{t("agentGuideTitle")}</h2>
        <ol className="mt-3 space-y-1.5 text-sm text-muted">
          <li>{t("agentStep1")}</li>
          <li>{t("agentStep2")}</li>
          <li>{t("agentStep3")}</li>
        </ol>
      </section>

      <section className="rounded-2xl bg-surface p-4 shadow-card">
        <p className="font-medium">{status?.hasToken ? t("agentActive") : t("agentNone")}</p>
        <button
          type="button"
          className="mt-3 h-10 rounded-full bg-primary px-4 text-sm font-medium text-primary-fg"
          disabled={rotate.isPending}
          onClick={() => rotate.mutate()}
        >
          {t("agentRotate")}
        </button>
        {fresh ? (
          <div className="mt-4">
            <p className="text-xs text-muted">{t("agentWarn")}</p>
            <p className="mt-2 break-all rounded-xl bg-surface-2 px-3 py-2 font-mono text-xs">{fresh}</p>
            <button
              type="button"
              className="mt-3 h-9 rounded-full bg-fg px-3 text-sm font-medium text-primary-fg"
              onClick={() => void copy(fresh)}
            >
              {t("agentCopy")}
            </button>
          </div>
        ) : null}
      </section>

      <section className="rounded-2xl bg-surface p-4 shadow-card">
        <div className="mb-2 flex items-center justify-between gap-2">
          <h2 className="font-medium">{t("agentBrief")}</h2>
          <button
            type="button"
            className="h-9 shrink-0 rounded-full bg-surface-2 px-3 text-sm font-medium"
            onClick={() => void copy(brief)}
          >
            {t("agentCopy")}
          </button>
        </div>
        <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all rounded-xl bg-surface-2 p-3 text-2xs leading-relaxed text-fg">
          {brief}
        </pre>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-surface px-3 py-3 text-center shadow-card">
      <p className="text-lg font-semibold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
