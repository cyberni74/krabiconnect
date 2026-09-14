import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BadgeCheck, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUser, useCurrentUserState } from "@/lib/auth/use-current-user";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { DISTRICTS, districtName } from "@/lib/constants";
import { loc, useT } from "@/lib/i18n";
import { getMyProfile, listReviews, myBookings, updateMyProfile } from "@/lib/server/community";
import { deleteListing, myListings, updateListingStatus } from "@/lib/server/listings";
import type { FeedCard } from "@/lib/types";
import { initials } from "@/lib/utils";
import { priceLabel } from "@/components/listings/listing-card";

export const Route = createFileRoute("/account")({ component: AccountPage });

function AccountPage() {
  const { user, isPending } = useCurrentUserState();
  if (isPending) return <div className="h-40 animate-pulse bg-surface-2" />;
  if (!user) return <RedirectToSignIn />;
  return <Dashboard />;
}

function Dashboard() {
  const { lang, t, setLang } = useT();
  const user = useCurrentUser();
  const qc = useQueryClient();
  const [tab, setTab] = useState<"services" | "jobs" | "market" | "looking" | "reviews">("services");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.displayName ?? "");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [facebook, setFacebook] = useState("");

  const profile = useQuery({ queryKey: ["me"], queryFn: () => getMyProfile() });
  const mine = useQuery({ queryKey: ["mine"], queryFn: () => myListings() });
  const reviews = useQuery({
    queryKey: ["reviews", user?.id],
    queryFn: () => listReviews({ data: user!.id }),
    enabled: Boolean(user?.id),
  });
  const bookings = useQuery({ queryKey: ["bookings"], queryFn: () => myBookings() });

  const save = useMutation({
    mutationFn: () =>
      updateMyProfile({
        data: {
          name: name || user?.displayName || "Neighbour",
          phone,
          location,
          preferredLanguage: lang,
          bio,
          verify: true,
          facebookUrl: facebook || null,
        },
      }),
    onSuccess: () => {
      toast.success(t("save"));
      setEditing(false);
      void qc.invalidateQueries({ queryKey: ["me"] });
    },
  });

  const p = profile.data;
  const tabs = [
    { id: "services" as const, label: t("myServices"), n: mine.data?.services.length ?? 0 },
    { id: "jobs" as const, label: t("myJobs"), n: mine.data?.jobs.length ?? 0 },
    { id: "market" as const, label: t("myMarket"), n: mine.data?.market.length ?? 0 },
    { id: "looking" as const, label: t("myRequests"), n: mine.data?.looking.length ?? 0 },
    { id: "reviews" as const, label: t("reviews"), n: reviews.data?.length ?? 0 },
  ];

  return (
    <main className="px-4 py-5">
      <div className="mb-5 flex items-start justify-between gap-3 rounded-2xl bg-surface p-4 shadow-card">
        <div className="flex items-center gap-3">
          <span className="grid size-14 place-items-center rounded-full bg-primary-soft text-lg font-semibold text-primary">
            {p?.avatarUrl ? (
              <img src={p.avatarUrl} alt="" className="size-14 rounded-full object-cover" />
            ) : (
              initials(p?.name || user?.displayName || "N")
            )}
          </span>
          <div>
            <h1 className="flex items-center gap-1 text-xl font-semibold">
              {p?.name || user?.displayName}
              {p?.isVerified ? <BadgeCheck className="size-4 text-primary" /> : null}
            </h1>
            <p className="text-sm text-muted">
              {p?.location ? districtName(p.location, lang) : t("pickArea")}
            </p>
          </div>
        </div>
        <UserButton />
      </div>

      <p className="mb-4 text-sm text-muted">{t("accountIntro")}</p>

      <div className="mb-5 grid grid-cols-3 gap-2">
        <Stat label={t("stars")} value={p?.ratingAvg ? p.ratingAvg.toFixed(1) : "—"} />
        <Stat label={t("reviews")} value={String(p?.reviewCount ?? 0)} />
        <Stat label={t("listings")} value={String(p?.serviceCount ?? 0)} />
      </div>

      {editing ? (
        <form
          className="mb-6 space-y-3 rounded-2xl bg-surface p-4 shadow-card"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          <div>
            <Label>{t("name")}</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label>{t("phone")}</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08x" />
          </div>
          <div>
            <Label>{t("district")}</Label>
            <div className="flex flex-wrap gap-2">
              {DISTRICTS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setLocation(d.id)}
                  className={
                    location === d.id
                      ? "h-8 rounded-full bg-primary px-3 text-xs font-medium text-primary-fg"
                      : "h-8 rounded-full bg-surface-2 px-3 text-xs font-medium text-muted"
                  }
                >
                  {districtName(d.id, lang)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label>{t("facebook")}</Label>
            <Input
              value={facebook}
              onChange={(e) => setFacebook(e.target.value)}
              placeholder="facebook.com/your.profile"
              inputMode="url"
            />
            <p className="mt-1.5 text-xs text-muted">{t("facebookHint")}</p>
          </div>
          <div>
            <Label>{t("bio")}</Label>
            <Textarea value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <p className="text-xs text-muted">{t("verifiedHint")}</p>
          <div className="flex gap-2">
            <Button type="submit" disabled={save.isPending}>
              {t("verify")}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
              {t("cancel")}
            </Button>
          </div>
        </form>
      ) : (
        <>
          {p?.facebookUrl ? (
            <a
              href={p.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-4 flex items-center justify-center rounded-2xl bg-surface px-4 py-3 text-sm font-medium text-primary shadow-card"
            >
              {t("openFacebook")}
            </a>
          ) : null}
        <Button
          variant="secondary"
          className="mb-6"
          onClick={() => {
            setName(p?.name ?? "");
            setPhone(p?.phone ?? "");
            setLocation(p?.location ?? "");
            setBio(loc(lang, p?.bioTh ?? "", p?.bioEn ?? ""));
            setFacebook(p?.facebookUrl ?? "");
            setEditing(true);
          }}
        >
          {t("editProfile")}
        </Button>
        </>
      )}

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((tb) => (
          <button
            key={tb.id}
            type="button"
            onClick={() => setTab(tb.id)}
            className={
              tab === tb.id
                ? "h-9 shrink-0 rounded-full bg-fg px-3 text-sm font-medium text-primary-fg"
                : "h-9 shrink-0 rounded-full bg-surface px-3 text-sm font-medium text-muted shadow-card"
            }
          >
            {tb.label} {tb.n}
          </button>
        ))}
      </div>

      {tab === "reviews" ? (
        <div className="space-y-3">
          {(reviews.data ?? []).map((r) => (
            <div key={r.id} className="rounded-2xl bg-surface p-4 shadow-card">
              <p className="flex items-center gap-1 font-medium">
                {r.reviewerName}
                <span className="ml-auto inline-flex items-center gap-0.5 text-sm text-primary">
                  <Star className="size-3.5 fill-primary" /> {r.rating}
                </span>
              </p>
              <p className="mt-1 text-sm leading-relaxed">
                {loc(lang, r.commentTh ?? "", r.commentEn ?? "")}
              </p>
            </div>
          ))}
          {(reviews.data ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">{t("noReviews")}</p>
          ) : null}
        </div>
      ) : (
        <InventoryList
          items={
            tab === "services"
              ? mine.data?.services ?? []
              : tab === "jobs"
                ? mine.data?.jobs ?? []
                : tab === "market"
                  ? mine.data?.market ?? []
                  : mine.data?.looking ?? []
          }
        />
      )}

      <section className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-muted">{t("bookings")}</h2>
        <BookingList
          title={t("incoming")}
          rows={bookings.data?.incoming ?? []}
        />
        <BookingList
          title={t("outgoing")}
          rows={bookings.data?.outgoing ?? []}
        />
      </section>
      <button type="button" className="sr-only" onClick={() => setLang(lang === "en" ? "th" : "en")}>
        lang
      </button>
    </main>
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

function InventoryList({ items }: { items: FeedCard[] }) {
  const { lang, t } = useT();
  const qc = useQueryClient();
  const nav = useNavigate();

  const toggle = useMutation({
    mutationFn: async (card: FeedCard) => {
      const next = card.status === "active" || card.status === "available" ? "paused" : "active";
      await updateListingStatus({ data: { id: card.id, status: next } });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mine"] }),
  });

  const remove = useMutation({
    mutationFn: (card: FeedCard) => deleteListing({ data: { kind: card.kind, id: card.id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mine"] }),
  });

  if (!items.length) {
    return (
      <div className="rounded-2xl bg-surface px-4 py-8 text-center shadow-card">
        <p className="mb-3 text-sm text-muted">{t("emptyInventory")}</p>
        <Button onClick={() => nav({ to: "/create" })}>{t("create")}</Button>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((card) => {
        const on = card.status === "available" || card.status === "active";
        const href = `/service/${card.id}`;
        return (
          <li key={card.id} className="flex gap-3 rounded-2xl bg-surface p-3 shadow-card">
            <Link to={href} className="size-16 shrink-0 overflow-hidden rounded-xl bg-surface-2">
              {card.images[0] ? (
                <img src={card.images[0]} alt="" className="size-full object-cover" />
              ) : null}
            </Link>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{loc(lang, card.titleTh, card.titleEn)}</p>
              <p className="text-sm text-muted">{priceLabel(card, lang, t)}</p>
              <div className="mt-2 flex items-center gap-2">
                <Switch checked={on} onCheckedChange={() => toggle.mutate(card)} />
                <span className="text-xs text-muted">{on ? t("toggleAvail") : t("paused")}</span>
                <button
                  type="button"
                  className="ml-auto text-xs text-danger"
                  onClick={() => remove.mutate(card)}
                >
                  {t("delete")}
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function BookingList({
  title,
  rows,
}: {
  title: string;
  rows: { id: string; status: string; startDate: string | null; endDate: string | null; listingTitleEn: string; listingTitleTh: string; otherName: string }[];
}) {
  const { lang, t } = useT();
  if (!rows.length) return null;
  return (
    <div className="mb-4">
      <h3 className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">{title}</h3>
      <ul className="space-y-2">
        {rows.map((b) => (
          <li key={b.id} className="rounded-xl bg-surface px-3 py-2 shadow-card">
            <p className="text-sm font-medium">{loc(lang, b.listingTitleTh, b.listingTitleEn)}</p>
            <p className="text-xs text-muted">
              {b.otherName} · {b.startDate} → {b.endDate}{" "}
              <Badge tone={b.status === "confirmed" ? "success" : "muted"}>{b.status}</Badge>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
