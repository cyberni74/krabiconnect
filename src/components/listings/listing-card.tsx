import { Link } from "@tanstack/react-router";
import { Globe, MapPin, Star } from "lucide-react";
import { categoryName, districtById, districtName, kindLabel, taskName } from "@/lib/constants";
import { useT, type I18nKey } from "@/lib/i18n";
import { useLocalizedListing } from "@/lib/use-localized-listing";
import { toOwnedImageUrl } from "@/lib/owned-image";
import type { FeedCard } from "@/lib/types";
import { cn, formatThb, haversineKm, initials } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAreaStore } from "@/lib/area";

export function priceLabel(card: FeedCard, lang: "en" | "th", t: (k: I18nKey) => string) {
  if (card.type === "wanted" && (card.price == null || card.price === 0) && card.pricingType !== "hourly") {
    return t("seeking");
  }
  if (card.pricingType === "free" || card.price === 0) return t("free");
  if (card.pricingType === "swap") return t("swap");
  if (card.pricingType === "sale") return formatThb(card.price);
  if (card.price == null) return card.type === "wanted" ? t("seeking") : "";
  if (card.pricingType === "hourly") return `${formatThb(card.price)} / ${t("hourly")}`;
  if (card.pricingType === "daily") return `${formatThb(card.price)} / ${t("daily")}`;
  if (card.pricingType === "monthly") return `${formatThb(card.price)} / ${t("monthly")}`;
  if (card.pricingType === "flat") return `${formatThb(card.price)} ${t("flat")}`;
  return formatThb(card.price);
}

function distanceLabel(card: FeedCard, originId: string) {
  if (card.lat == null || card.lng == null) return null;
  const origin = districtById(originId || "ao-nang");
  const km = haversineKm({ lat: origin.lat, lng: origin.lng }, { lat: card.lat, lng: card.lng });
  if (!Number.isFinite(km)) return null;
  return `${km < 10 ? km.toFixed(1) : Math.round(km)} km`;
}

export function ListingCard({ card, compact }: { card: FeedCard; compact?: boolean }) {
  const { lang, t } = useT();
  const { title } = useLocalizedListing(card);
  const origin = useAreaStore((s) => s.district);
  const href = `/service/${card.id}`;
  const img = card.images[0] ? toOwnedImageUrl(card.images[0]) : undefined;
  const price = priceLabel(card, lang, t);
  const chips = card.tasks.slice(0, compact ? 1 : 2);
  const translated = card.sourceLanguage !== lang;
  const sellerName = card.facebookName || card.ownerName;
  const sellerPhotoRaw = card.facebookPhoto || card.ownerAvatar;
  const sellerPhoto = sellerPhotoRaw ? toOwnedImageUrl(sellerPhotoRaw) : null;
  const open = card.status === "active" || card.status === "available";
  const dist = distanceLabel(card, origin);

  return (
    <Link
      to={href}
      className={cn(
        "block overflow-hidden bg-surface shadow-card transition-transform duration-150 active:scale-[0.99]",
        compact ? "rounded-xl" : "rounded-2xl",
      )}
    >
      <div className={cn("relative bg-surface-2", compact ? "aspect-[4/3]" : "aspect-[4/3]")}>
        {img ? (
          <img src={img} alt="" className="size-full object-cover" />
        ) : (
          <div className="grid size-full place-items-center bg-primary-soft text-primary">
            {categoryName(card.kind, card.category, lang)}
          </div>
        )}
        <div className="absolute left-2 top-2 flex items-center gap-1.5">
          <span
            className={cn(
              "size-2.5 rounded-full ring-2 ring-surface",
              open ? "bg-accent" : "bg-faint",
            )}
            aria-hidden
          />
          <Badge tone={card.kind === "job" ? "success" : "primary"}>
            {kindLabel(card.kind, lang)}
          </Badge>
          {card.type === "wanted" ? <Badge>{t("seeking")}</Badge> : null}
        </div>
        {price ? (
          <div className="absolute bottom-2 left-2 rounded-full bg-surface/95 px-2.5 py-1 text-xs font-semibold text-fg shadow-card">
            {price}
          </div>
        ) : null}
        {!compact ? (
          <span className="absolute bottom-2 right-2 grid size-9 place-items-center overflow-hidden rounded-full bg-surface text-2xs font-semibold text-primary shadow-card ring-2 ring-surface">
            {sellerPhoto ? (
              <img src={sellerPhoto} alt="" className="size-9 object-cover" />
            ) : (
              initials(sellerName)
            )}
          </span>
        ) : null}
      </div>
      <div className={cn("space-y-1.5", compact ? "p-2.5" : "p-3.5")}>
        <h3 className="flex items-start gap-1.5 text-base font-semibold leading-snug">
          <span className="line-clamp-2 min-w-0 flex-1">{title}</span>
          {translated ? (
            <Globe className="mt-0.5 size-3.5 shrink-0 text-primary" aria-label={t("autoTranslated")} />
          ) : null}
        </h3>
        {chips.length ? (
          <p className="line-clamp-1 text-xs text-muted">
            {chips.map((id) => taskName(id, lang)).join(" · ")}
          </p>
        ) : null}
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5 text-primary" />
            {dist ?? districtName(card.district, lang)}
          </span>
          {card.ratingAvg != null ? (
            <span className="ml-auto inline-flex items-center gap-0.5 font-medium text-fg">
              <Star className="size-3.5 fill-accent text-accent" />
              {card.ratingAvg.toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
