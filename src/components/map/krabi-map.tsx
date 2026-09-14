import { lazy, Suspense, useCallback, useState } from "react";
import type { FeedCard } from "@/lib/types";
import { ListingCard } from "@/components/listings/listing-card";
import { useT } from "@/lib/i18n";

const KrabiMapCanvas = lazy(() =>
  import("./krabi-map-canvas").then((m) => ({ default: m.KrabiMapCanvas })),
);

export type KrabiMapProps = {
  items: FeedCard[];
  onSelect?: (card: FeedCard) => void;
};

export function KrabiMap({ items, onSelect }: KrabiMapProps) {
  const { t } = useT();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = useCallback(
    (card: FeedCard) => {
      setSelectedId(card.id);
      onSelect?.(card);
    },
    [onSelect],
  );

  const active = items.find((c) => c.id === selectedId);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface shadow-card">
      <Suspense fallback={<MapSkeleton />}>
        <KrabiMapCanvas
          items={items}
          onSelect={handleSelect}
          onDeselect={() => setSelectedId(null)}
          selectedId={selectedId}
        />
      </Suspense>
      <p className="pointer-events-none absolute left-3 top-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-medium text-muted shadow-card">
        {t("coast")} · {items.filter((i) => i.lat != null && i.lng != null).length}
      </p>
      <ul className="pointer-events-none absolute right-3 top-3 flex flex-col gap-1 rounded-xl bg-surface/90 px-2.5 py-2 text-2xs font-medium text-fg shadow-card">
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-primary" />
          {t("services")}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-accent" />
          {t("jobs")}
        </li>
        <li className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-fg" />
          {t("market")}
        </li>
      </ul>
      {active ? (
        <div className="absolute bottom-3 left-3 right-16 z-10 max-w-sm">
          <ListingCard card={active} compact />
        </div>
      ) : null}
    </div>
  );
}

function MapSkeleton() {
  return <div className="h-[28rem] w-full animate-pulse bg-sea/20" aria-label="Loading map" />;
}
