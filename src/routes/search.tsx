import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";
import { useState } from "react";
import { ListingCard } from "@/components/listings/listing-card";
import { Input } from "@/components/ui/input";
import { JOB_CATEGORIES, MARKET_CATEGORIES, SERVICE_CATEGORIES, categoryName } from "@/lib/constants";
import { useT } from "@/lib/i18n";
import { listFeed } from "@/lib/server/listings";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/search")({
  validateSearch: (search: Record<string, unknown>) => ({
    q: typeof search.q === "string" ? search.q : "",
  }),
  component: SearchPage,
});

const KINDS = ["all", "services", "jobs", "market"] as const;

function SearchPage() {
  const { lang, t } = useT();
  const initial = Route.useSearch();
  const [q, setQ] = useState(initial.q);
  const [kind, setKind] = useState<(typeof KINDS)[number]>("all");
  const [category, setCategory] = useState("");

  const feed = useQuery({
    queryKey: ["search", q, kind, category],
    queryFn: () =>
      listFeed({
        data: {
          q: q || undefined,
          kind: kind === "all" ? undefined : kind,
          category: category || undefined,
        },
      }),
  });

  const cats =
    kind === "jobs" ? JOB_CATEGORIES : kind === "market" ? MARKET_CATEGORIES : SERVICE_CATEGORIES;

  return (
    <main className="px-4 py-2">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight">{t("search")}</h1>
      <div className="relative mb-4">
        <SearchIcon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-faint" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t("portalSearch")}
          className="rounded-full pl-10 shadow-card"
        />
      </div>
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1 hide-scroll">
        {KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => {
              setKind(k);
              setCategory("");
            }}
            className={cn(
              "h-9 shrink-0 rounded-full px-3.5 text-sm font-medium",
              kind === k ? "bg-primary text-primary-fg" : "bg-surface text-muted shadow-card",
            )}
          >
            {k === "all" ? t("all") : t(k)}
          </button>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {cats.map((c) => {
          const active = category === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setCategory(active ? "" : c.id)}
              className={cn(
                "h-9 rounded-full px-3.5 text-sm font-medium",
                active ? "bg-fg text-primary-fg" : "bg-surface text-muted shadow-card",
              )}
            >
              {categoryName(kind === "jobs" ? "job" : kind === "market" ? "market" : "service", c.id, lang)}
            </button>
          );
        })}
      </div>
      <div className="grid gap-4">
        {(feed.data ?? []).map((c) => (
          <ListingCard key={`${c.kind}-${c.id}`} card={c} />
        ))}
        {feed.data?.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">{t("emptyFeed")}</p>
        ) : null}
      </div>
    </main>
  );
}
