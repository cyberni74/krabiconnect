import { Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  ExternalLink,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Star,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { LocalizedText, TranslationBanner } from "@/components/translated";
import { categoryName, districtName, kindLabel, taskName } from "@/lib/constants";
import { useT, type I18nKey } from "@/lib/i18n";
import { toOwnedImageUrl } from "@/lib/owned-image";
import { useEnsureEnglishOverlay } from "@/lib/use-english-overlay";
import { createBooking, openConversation, sendMessage } from "@/lib/server/community";
import type { FeedCard } from "@/lib/types";
import { initials } from "@/lib/utils";
import { useCurrentUser, useCurrentUserState } from "@/lib/auth/use-current-user";
import { priceLabel } from "@/components/listings/listing-card";
import { LanguagePill } from "@/components/layout/language-pill";
import { SignInGate } from "@/lib/auth/gates";

function ctaKey(card: FeedCard): I18nKey {
  if (card.kind === "job") return card.type === "wanted" ? "openChat" : "applyNow";
  if (card.kind === "market") return card.type === "wanted" ? "iCanDoThis" : "contactSeller";
  return card.type === "wanted" ? "iCanDoThis" : "requestService";
}

export function ListingDetail({ card }: { card: FeedCard }) {
  const { lang, t } = useT();
  const overlay = useEnsureEnglishOverlay(card);
  const titleEn = overlay?.titleEn ?? card.titleEn;
  const descriptionEn = overlay?.descriptionEn ?? card.descriptionEn;
  const nav = useNavigate();
  const user = useCurrentUser();
  const { isPending } = useCurrentUserState();
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [note, setNote] = useState("");
  const [showBook, setShowBook] = useState(false);

  const ask = useMutation({
    mutationFn: async () => {
      const conv = await openConversation({
        data: {
          providerId: card.userId,
          itemId: null,
          serviceId: card.id,
          name: user?.displayName,
        },
      });
      if (note.trim()) {
        await sendMessage({ data: { conversationId: conv.id, text: note.trim() } });
      }
      if (start && end) {
        await createBooking({
          data: {
            conversationId: conv.id,
            providerId: card.userId,
            itemId: null,
            serviceId: card.id,
            startDate: start,
            endDate: end,
            totalPrice: card.price,
          },
        });
      }
      return conv.id;
    },
    onSuccess: (id) => {
      toast.success(t("bookingSent"));
      nav({ to: "/chats/$id", params: { id } });
    },
    onError: () => nav({ to: "/login", search: { next: "" } }),
  });

  const isMine = user?.id === card.userId;
  const img = card.images[0] ? toOwnedImageUrl(card.images[0]) : undefined;
  const sellerName = card.facebookName || card.ownerName;
  const sellerPhotoRaw = card.facebookPhoto || card.ownerAvatar;
  const sellerPhoto = sellerPhotoRaw ? toOwnedImageUrl(sellerPhotoRaw) : null;

  return (
    <article>
      <div className="relative">
        {img ? (
          <img src={img} alt="" className="aspect-[5/3] w-full object-cover" />
        ) : (
          <div className="aspect-[5/3] bg-primary-soft" />
        )}
        <Link
          to="/"
          className="absolute left-3 top-3 grid size-11 place-items-center rounded-full bg-surface/90 text-fg shadow-card"
        >
          <ArrowLeft className="size-5" />
          <span className="sr-only">{t("back")}</span>
        </Link>
        <div className="absolute right-3 top-3">
          <LanguagePill />
        </div>
      </div>
      <div className="space-y-5 px-4 py-5">
        <div className="flex flex-wrap gap-2">
          <Badge tone="primary">{kindLabel(card.kind, lang)}</Badge>
          <Badge>{categoryName(card.kind, card.category, lang)}</Badge>
          {card.type === "wanted" ? (
            <Badge>{t("seeking")}</Badge>
          ) : card.kind === "job" ? (
            <Badge tone="success">{t("hiring")}</Badge>
          ) : null}
        </div>
        <div>
          <LocalizedText
            as="h1"
            className="text-2xl font-semibold leading-tight tracking-tight"
            lang={lang}
            th={card.titleTh}
            en={titleEn}
            sourceLanguage={card.sourceLanguage}
          />
          <TranslationBanner sourceLanguage={card.sourceLanguage} className="mt-1" />
        </div>
        <p className="text-lg font-medium tabular-nums text-primary">
          {priceLabel(card, lang, t)}
        </p>
        {card.tasks.length ? (
          <div className="flex flex-wrap gap-1.5">
            {card.tasks.map((id) => (
              <Badge key={id} tone="muted">
                {taskName(id, lang)}
              </Badge>
            ))}
          </div>
        ) : null}
        <div className="flex items-center gap-3 rounded-2xl bg-surface p-3 shadow-card">
          <span className="grid size-12 place-items-center overflow-hidden rounded-full bg-primary-soft text-sm font-semibold text-primary">
            {sellerPhoto ? (
              <img src={sellerPhoto} alt="" className="size-12 object-cover" />
            ) : (
              initials(sellerName)
            )}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1 font-medium">
              {sellerName}
              {card.ownerVerified && !card.facebookName ? <BadgeCheck className="size-4 text-primary" /> : null}
            </p>
            <p className="flex items-center gap-1 text-sm text-muted">
              <MapPin className="size-3.5" />
              {districtName(card.district, lang)}
              {card.ratingAvg != null ? (
                <span className="ml-2 inline-flex items-center gap-0.5">
                  <Star className="size-3.5 fill-primary text-primary" />
                  {card.ratingAvg.toFixed(1)}
                </span>
              ) : null}
            </p>
          </div>
        </div>
        <LocalizedText
          as="p"
          className="leading-relaxed text-fg"
          lang={lang}
          th={card.descriptionTh}
          en={descriptionEn}
          sourceLanguage={card.sourceLanguage}
        />
        <ul className="grid grid-cols-2 gap-2 text-sm">
          {card.availableTimes ? (
            <li className="rounded-xl bg-surface-2 px-3 py-2">
              <p className="text-muted">{t("times")}</p>
              <p className="font-medium">{card.availableTimes}</p>
            </li>
          ) : null}
          {card.locationRadius ? (
            <li className="rounded-xl bg-surface-2 px-3 py-2">
              <p className="text-muted">{t("radius")}</p>
              <p className="font-medium">
                {card.locationRadius} {t("kmAway")}
              </p>
            </li>
          ) : null}
          <li className="rounded-xl bg-surface-2 px-3 py-2">
            <p className="text-muted">{t("status")}</p>
            <p className="font-medium">
              {card.status === "available" || card.status === "active" ? t("available") : t("paused")}
            </p>
          </li>
        </ul>

        {card.facebookUrl ? (
          <a
            href={card.facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-medium text-primary-fg shadow-card"
          >
            <ExternalLink className="size-4" />
            {t("openFacebook")}
          </a>
        ) : null}

        {isMine || isPending ? null : (
          <SignInGate
            fallback={
              <Button className="w-full" onClick={() => nav({ to: "/login", search: { next: "" } })}>
                {t("signIn")}
              </Button>
            }
          >
            <div className="space-y-3">
              <Button className="w-full" onClick={() => setShowBook((v) => !v)}>
                <CalendarDays className="size-4" />
                {t(ctaKey(card))}
              </Button>
              {showBook ? (
                <div className="space-y-3 rounded-2xl bg-surface p-4 shadow-card">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>{t("startDate")}</Label>
                      <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
                    </div>
                    <div>
                      <Label>{t("endDate")}</Label>
                      <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <Label>{t("sendMessage")}</Label>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder={t("messagePlaceholder")}
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={ask.isPending}
                    onClick={() => ask.mutate()}
                  >
                    <MessageCircle className="size-4" />
                    {ask.isPending ? t("posting") : t("confirmBooking")}
                  </Button>
                </div>
              ) : (
                <Button
                  variant="secondary"
                  className="w-full"
                  disabled={ask.isPending}
                  onClick={() => ask.mutate()}
                >
                  <MessageCircle className="size-4" />
                  {t("openChat")}
                </Button>
              )}
              <p className="flex items-center justify-center gap-1 text-xs text-muted">
                <ShieldCheck className="size-3.5" />
                {t("noMessages")}
              </p>
            </div>
          </SignInGate>
        )}
      </div>
    </article>
  );
}
