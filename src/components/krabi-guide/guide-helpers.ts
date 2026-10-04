import { TOURS, type Tour } from "../secret-islands/content";
import { useLang } from "../secret-islands/store";

/* ───────── Language helpers ───────── */
export type GuideLang = "de" | "en";

/** Long article texts exist in DE + EN only: German for German visitors, English for everyone else. */
export function useGuideLang(): GuideLang {
  const lang = useLang();
  return lang === "de" ? "de" : "en";
}

const MONTHS: Record<GuideLang, string[]> = {
  de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
};
export function formatDate(iso: string, lang: GuideLang) {
  const [y, m, d] = iso.split("-").map(Number);
  return lang === "de" ? `${d}. ${MONTHS.de[m - 1]} ${y}` : `${MONTHS.en[m - 1]} ${d}, ${y}`;
}

export function toursByIds(ids: string[]): Tour[] {
  return ids.map((id) => TOURS.find((x) => x.id === id)).filter((x): x is Tour => !!x);
}

