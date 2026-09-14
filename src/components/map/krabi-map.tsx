import { useMemo, useState } from "react";
import { DISTRICTS, districtName, projectMap } from "@/lib/constants";
import { loc, useT } from "@/lib/i18n";
import type { FeedCard } from "@/lib/types";
import { ListingCard } from "@/components/listings/listing-card";
import { cn } from "@/lib/utils";

export function KrabiMap({ items }: { items: FeedCard[] }) {
  const { lang, t } = useT();
  const [selected, setSelected] = useState<string | null>(null);
  const pins = useMemo(
    () =>
      items
        .filter((i) => i.lat != null && i.lng != null)
        .map((i) => ({ card: i, ...projectMap(i.lat as number, i.lng as number) })),
    [items],
  );
  const active = pins.find((p) => p.card.id === selected);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-sea/25 shadow-card">
      <svg viewBox="0 0 360 420" className="h-[28rem] w-full" role="img" aria-label="Krabi">
        <defs>
          <linearGradient id="sea" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7ec8d4" />
            <stop offset="100%" stopColor="#0088A3" />
          </linearGradient>
        </defs>
        <rect width="360" height="420" fill="url(#sea)" />
        <path
          d="M210 12 C240 18 300 30 338 48 L350 400 L210 408 C190 360 200 300 186 250 C170 200 150 180 158 140 C168 90 188 40 210 12 Z"
          fill="#e8e0d0"
        />
        <path
          d="M210 12 C188 40 168 90 158 140 C150 180 170 200 186 250 C200 300 190 360 210 408"
          fill="none"
          stroke="#0088A3"
          strokeWidth="3"
          opacity="0.7"
        />
        <ellipse cx="92" cy="250" rx="18" ry="11" fill="#d5efe9" opacity="0.9" />
        <ellipse cx="124" cy="288" rx="12" ry="8" fill="#d5efe9" opacity="0.85" />
        <ellipse cx="70" cy="310" rx="10" ry="7" fill="#fffbf6" opacity="0.7" />
        <ellipse cx="148" cy="200" rx="9" ry="6" fill="#d5efe9" opacity="0.8" />
        {DISTRICTS.map((d) => {
          const p = projectMap(d.lat, d.lng);
          return (
            <text
              key={d.id}
              x={(p.x / 100) * 360}
              y={(p.y / 100) * 420 - 10}
              textAnchor="middle"
              fontSize="9"
              fill="#142e2b"
              opacity="0.55"
            >
              {districtName(d.id, lang)}
            </text>
          );
        })}
      </svg>
      <div className="absolute inset-0">
        {pins.map((p) => (
          <button
            key={p.card.id}
            type="button"
            onClick={() => setSelected(p.card.id)}
            className="absolute -translate-x-1/2 -translate-y-full"
            style={{ left: `${p.x}%`, top: `${p.y}%` }}
            aria-label={loc(lang, p.card.titleTh, p.card.titleEn)}
          >
            <span
              className={cn(
                "block size-3.5 rounded-full border-2 border-surface shadow-float",
                p.card.kind === "job" ? "bg-accent" : p.card.kind === "market" ? "bg-fg" : "bg-primary",
                selected === p.card.id && "size-4 ring-2 ring-primary-soft",
              )}
            />
          </button>
        ))}
      </div>
      <p className="pointer-events-none absolute left-3 top-3 rounded-full bg-surface/90 px-3 py-1 text-xs font-medium text-muted shadow-card">
        {t("coast")} · {pins.length}
      </p>
      {active ? (
        <div className="absolute inset-x-3 bottom-3 max-w-sm">
          <ListingCard card={active.card} compact />
        </div>
      ) : null}
    </div>
  );
}
