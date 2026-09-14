import { useT } from "@/lib/i18n";
import {
  listingDescription,
  listingDescriptionEn,
  listingDescriptionTh,
  listingTitle,
  listingTitleEn,
  listingTitleTh,
  type ListingCopySource,
} from "@/lib/listing-copy";
import { useEnsureEnglishOverlay } from "@/lib/use-english-overlay";

/** Discover / detail / inventory: same locale as chrome, overlay filled when EN is missing. */
export function useLocalizedListing(card: ListingCopySource & { id: string }) {
  const { lang } = useT();
  const picked = {
    id: card.id,
    titleTh: listingTitleTh(card),
    titleEn: listingTitleEn(card),
    descriptionTh: listingDescriptionTh(card),
    descriptionEn: listingDescriptionEn(card),
  };
  const overlay = useEnsureEnglishOverlay(picked);
  return {
    lang,
    title: listingTitle(lang, card, overlay.titleEn),
    description: listingDescription(lang, card, overlay.descriptionEn),
    titleTh: picked.titleTh,
    titleEn: overlay.titleEn,
    descriptionTh: picked.descriptionTh,
    descriptionEn: overlay.descriptionEn,
  };
}
