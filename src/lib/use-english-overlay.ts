import { useEffect } from "react";
import { create } from "zustand";
import { needsEnglishOverlay, useT } from "@/lib/i18n";
import { fillEnglishOverlays } from "@/lib/server/translate";

export type ListingOverlay = { titleEn: string; descriptionEn: string };

export type OverlayCard = {
  id: string;
  titleTh: string;
  titleEn: string;
  descriptionTh: string;
  descriptionEn: string;
};

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

const queued = new Map<string, OverlayCard>();
const retries = new Map<string, number>();
let flushTimer: ReturnType<typeof setTimeout> | null = null;
let inFlight = false;

function scheduleFlush(delay = 80) {
  if (flushTimer) clearTimeout(flushTimer);
  flushTimer = setTimeout(() => void flushOverlays(), delay);
}

function enqueue(card: OverlayCard) {
  const { attempted, byId } = useListingOverlayStore.getState();
  if (attempted[card.id]) return;
  const titleEn = byId[card.id]?.titleEn ?? card.titleEn;
  const descriptionEn = byId[card.id]?.descriptionEn ?? card.descriptionEn;
  if (!needsEnglishOverlay(card.titleTh, titleEn) && !needsEnglishOverlay(card.descriptionTh, descriptionEn)) {
    return;
  }
  queued.set(card.id, card);
  scheduleFlush();
}

async function flushOverlays() {
  if (inFlight) return;
  const batch = [...queued.values()].slice(0, 12);
  if (!batch.length) return;
  for (const card of batch) queued.delete(card.id);
  inFlight = true;
  const ids = batch.map((c) => c.id);
  try {
    const rows = await fillEnglishOverlays({ data: { ids, listings: batch } });
    const hit = new Set(rows.map((r) => r.id));
    if (rows.length) useListingOverlayStore.getState().merge(rows);
    const done: string[] = [];
    for (const id of ids) {
      if (hit.has(id)) {
        done.push(id);
        retries.delete(id);
        continue;
      }
      const n = (retries.get(id) ?? 0) + 1;
      retries.set(id, n);
      const card = batch.find((c) => c.id === id);
      if (n < 2 && card) queued.set(id, card);
      else done.push(id);
    }
    if (done.length) useListingOverlayStore.getState().markAttempted(done);
  } catch {
    for (const card of batch) {
      const n = (retries.get(card.id) ?? 0) + 1;
      retries.set(card.id, n);
      if (n < 2) queued.set(card.id, card);
      else useListingOverlayStore.getState().markAttempted([card.id]);
    }
  } finally {
    inFlight = false;
    if (queued.size) scheduleFlush(400);
  }
}

export function useEnsureEnglishOverlays(cards: OverlayCard[]) {
  const lang = useT().locale;
  useEffect(() => {
    if (lang !== "en") return;
    for (const card of cards) enqueue(card);
  }, [lang, cards]);
}

export function useEnsureEnglishOverlay(card: OverlayCard): ListingOverlay | undefined {
  const lang = useT().locale;
  const overlay = useListingOverlayStore((s) => s.byId[card.id]);
  const attempted = useListingOverlayStore((s) => s.attempted[card.id]);

  useEffect(() => {
    if (lang !== "en" || attempted) return;
    enqueue(card);
  }, [
    lang,
    attempted,
    card.id,
    card.titleTh,
    card.titleEn,
    card.descriptionTh,
    card.descriptionEn,
  ]);

  return overlay;
}
