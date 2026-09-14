import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, List, Map as MapIcon, Search as SearchIcon, Store, Wrench } from "lucide-react";
import { lazy, Suspense, useState, type FormEvent, type ReactNode } from "react";
import { ListingCard } from "@/components/listings/listing-card";
import { listFeed } from "@/lib/server/listings";
import { useT, type I18nKey } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  JOB_CATEGORIES,
  MARKET_CATEGORIES,
  SERVICE_CATEGORIES,
  categoryName,
} from "@/lib/constants";
import { useAreaStore } from "@/lib/area";

const KrabiMap = lazy(() =>
  import("@/components/map/krabi-map").then((m) => ({ default: m.KrabiMap })),
);

export const Route = createFileRoute("/")({ component: Home });

const MODULES = [
  {
    id: "services" as const,
    icon: Wrench,
    title: "services" as const,
    hint: "moduleServices" as const,
  },
  {
    id: "jobs" as const,
    icon: Briefcase,
    title: "jobs" as const,
    hint: "moduleJobs" as const,
  },
  {
    id: "market" as const,
    icon: Store,
    title: "market" as const,
    hint: "moduleMarket" as const,
  },
];

function Home() {
  const { lang, t } = useT();
  const nav = useNavigate();
  const [view, setView] = useState<"list" | "map">("list");
  const [kind, setKind] = useState<"all" | "services" | "jobs" | "market">("all");
  const [category, setCategory] = useState("");
  const [q, setQ] = useState("");
  const district = useAreaStore((s) => s.district);

  const feed = useQuery({
    queryKey: ["feed", kind, district, category],
    queryFn: () =>
      listFeed({
        data: {
          kind,
          district: district || undefined,
          category: category || undefined,
        },
      }),
  });

  const cards = feed.data ?? [];
  const cats =
    kind === "jobs"
      ? JOB_CATEGORIES
      : kind === "market"
        ? MARKET_CATEGORIES
        : kind === "services"
          ? SERVICE_CATEGORIES
          : [];

  function onSearch(e: FormEvent) {
    e.preventDefault();
    void nav({ to: "/search", search: { q: q.trim() } });
  }

  return (
    <main className="px-4 pb-8">
      <section className="relative mb-6">
        <div className="relative overflow-hidden rounded-3xl shadow-card">
          <img src="/brand/hero.jpg" alt="" className="h-56 w-full object-cover" />
          <div className="absolute inset-0 bg-linear-to-t from-fg/90 via-fg/40 to-fg/15" />
          <div className="absolute inset-x-0 bottom-0 px-5 pb-11">
            <p className="text-2xs font-medium uppercase tracking-wider text-primary-fg/75">
              {t("coast")}
            </p>
            <h1 className="mt-1 text-2xl font-semibold leading-tight text-primary-fg">
              {t("heroHeadline")}
            </h1>
            <p className="mt-1 text-sm leading-snug text-primary-fg/90">{t("heroSub")}</p>
          </div>
        </div>
        <form
          onSubmit={onSearch}
          className="relative z-10 mx-3 -mt-6 flex items-center gap-1 rounded-full bg-surface p-1.5 shadow-float"
        >
          <SearchIcon className="ml-3 size-4 shrink-0 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("portalSearch")}
            className="h-10 min-w-0 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-faint"
            aria-label={t("search")}
          />
          <button
            type="submit"
            className="h-10 shrink-0 rounded-full bg-primary px-4 text-sm font-semibold text-primary-fg"
          >
            {t("search")}
          </button>
        </form>
      </section>

      <div className="mb-5 grid grid-cols-3 gap-2">
        {MODULES.map((m) => {
          const Icon = m.icon;
          const active = kind === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setKind(active ? "all" : m.id);
                setCategory("");
              }}
              className={cn(
                "flex flex-col items-start gap-1 rounded-2xl px-3 py-3 text-left shadow-card",
                active ? "bg-primary text-primary-fg" : "bg-surface text-fg",
              )}
            >
              <Icon className="size-5" />
              <span className="text-sm font-semibold">{t(m.title)}</span>
              <span className={cn("text-2xs leading-snug", active ? "text-primary-fg/80" : "text-muted")}>
                {t(m.hint)}
              </span>
            </button>
          );
        })}
      </div>

      {cats.length ? (
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1 hide-scroll">
          <Chip active={!category} onClick={() => setCategory("")}>
            {t("all")}
          </Chip>
          {cats.map((c) => (
            <Chip
              key={c.id}
              active={category === c.id}
              onClick={() => setCategory(category === c.id ? "" : c.id)}
            >
              {categoryName(
                kind === "jobs" ? "job" : kind === "market" ? "market" : "service",
                c.id,
                lang,
              )}
            </Chip>
          ))}
        </div>
      ) : null}

      {cards.length > 0 && view === "list" ? (
        <h2 className="mb-3 text-sm font-semibold text-muted">{t("latest")}</h2>
      ) : null}

      {feed.isLoading ? (
        <div className="grid gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-surface-2" />
          ))}
        </div>
      ) : view === "map" ? (
        <Suspense fallback={<div className="h-[28rem] animate-pulse rounded-2xl bg-surface-2" />}>
          <KrabiMap items={cards} />
        </Suspense>
      ) : cards.length === 0 ? (
        <EmptyHome t={t} />
      ) : (
        <div className="grid gap-4">
          {cards.map((c) => (
            <ListingCard key={`${c.kind}-${c.id}`} card={c} />
          ))}
        </div>
      )}

      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 mx-auto flex max-w-lg justify-end px-4">
        <button
          type="button"
          onClick={() => setView((v) => (v === "map" ? "list" : "map"))}
          className="pointer-events-auto inline-flex h-12 items-center gap-2 rounded-full bg-fg px-4 text-sm font-medium text-primary-fg shadow-float"
        >
          {view === "map" ? <List className="size-4" /> : <MapIcon className="size-4" />}
          {view === "map" ? t("showList") : t("showMap")}
        </button>
      </div>
    </main>
  );
}

function EmptyHome({ t }: { t: (k: I18nKey) => string }) {
  const steps = [
    { n: "1", title: t("how1"), body: t("how1b") },
    { n: "2", title: t("how2"), body: t("how2b") },
    { n: "3", title: t("how3"), body: t("how3b") },
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-surface px-4 py-6 shadow-card">
        <h2 className="text-center text-base font-semibold">{t("howTitle")}</h2>
        <ol className="mt-4 grid grid-cols-3 gap-2">
          {steps.map((s) => (
            <li key={s.n} className="text-center">
              <span className="mx-auto grid size-8 place-items-center rounded-full bg-primary-soft text-sm font-semibold text-primary">
                {s.n}
              </span>
              <p className="mt-2 text-sm font-semibold">{s.title}</p>
              <p className="mt-0.5 text-2xs leading-snug text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-2xl bg-surface px-4 py-8 text-center shadow-card">
        <p className="mb-4 text-sm text-muted">{t("emptyFeed")}</p>
        <Link
          to="/create"
          className="inline-flex h-11 items-center rounded-full bg-primary px-5 text-sm font-medium text-primary-fg"
        >
          {t("create")}
        </Link>
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "h-8 shrink-0 rounded-full px-3 text-xs font-medium",
        active ? "bg-fg text-primary-fg" : "bg-surface text-muted shadow-card",
      )}
    >
      {children}
    </button>
  );
}