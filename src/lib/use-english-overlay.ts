import { useEffect } from "react";
import { create } from "zustand";
import { needsEnglishOverlay, useT } from "@/lib/i18n";
import { fillEnglishOverlays } from "@/lib/server/translate";

export type ListingOverlay = { titleEn: string; descriptionEn: string };

export const useListingOverlayStore = create<{
  byId: Record<string, ListingOverlay>;
  attempted: Record<string, true>;
  merge: (rows: Array<{ id: string } & ListingOverlay>) => void;
  markAttempted: (ids: string[]) => void;
}>()((set) => ({
  byId: {},
  attempted: {},
  merge: (rows) =>
    set((s) => {
      const byId = { ...s.byId };
      for (const row of rows) {
        byId[row.id] = { titleEn: row.titleEn, descriptionEn: row.descriptionEn };
      }
      return { byId };
    }),
  markAttempted: (ids) =>
    set((s) => {
      const attempted = { ...s.attempted };
      for (const id of ids) attempted[id] = true;
      return { attempted };
    }),
}));

const queued = new Set<string>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let inFlight = false;

async function flushOverlays() {
  if (inFlight) return;
  const ids = [...queued].slice(0, 12);
  if (!ids.length) return;
  for (const id of ids) queued.delete(id);
  inFlight = true;
  useListingOverlayStore.getState().markAttempted(ids);
  try {
    const rows = await fillEnglishOverlays({ data: { ids } });
    if (rows.length) useListingOverlayStore.getState().merge(rows);
  } catch {
    /* overlay is best-effort — Thai original stays in DB */
  } finally {
    inFlight = false;
    if (queued.size) flushTimer = setTimeout(() => void flushOverlays(), 250);
  }
}

export function useEnsureEnglishOverlay(card: {
  id: string;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
}): ListingOverlay | undefined {
  const lang = useT().locale;
  const overlay = useListingOverlayStore((s) => s.byId[card.id]);
  const attempted = useListingOverlayStore((s) => s.attempted[card.id]);

  useEffect(() => {
    if (lang !== "en" || attempted) return;
    const titleEn = overlay?.titleEn ?? card.titleEn;
    const descriptionEn = overlay?.descriptionEn ?? card.descriptionEn;
    if (!needsEnglishOverlay(card.titleTh, titleEn) && !needsEnglishOverlay(card.descriptionTh, descriptionEn)) {
      return;
    }
    queued.add(card.id);
    if (flushTimer) clearTimeout(flushTimer);
    flushTimer = setTimeout(() => void flushOverlays(), 80);
  }, [
    lang,
    attempted,
    card.id,
    card.titleTh,
    card.titleEn,
    card.descriptionTh,
    card.descriptionEn,
    overlay,
  ]);

  return overlay;
}
