import { create } from "zustand";
import { BRAND, type L, type Lang } from "./content";

type State = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  inquiry: { open: boolean; tourId: string | null };
  openInquiry: (tourId?: string | null) => void;
  closeInquiry: () => void;
  lightbox: { items: { src: string; title: string; video?: string }[]; index: number } | null;
  openLightbox: (items: { src: string; title: string; video?: string }[], index: number) => void;
  setLightboxIndex: (index: number) => void;
  closeLightbox: () => void;
  articleId: string | null;
  openArticle: (id: string) => void;
  closeArticle: () => void;
  tourId: string | null;
  openTour: (id: string) => void;
  closeTour: () => void;
};

const LANG_KEY = "ksi-lang";

export const useSI = create<State>((set) => ({
  lang: "de",
  setLang: (lang) => {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      /* storage unavailable */
    }
    set({ lang });
  },
  inquiry: { open: false, tourId: null },
  openInquiry: (tourId = null) => set({ inquiry: { open: true, tourId }, tourId: null, articleId: null }),
  closeInquiry: () => set((s) => ({ inquiry: { ...s.inquiry, open: false } })),
  lightbox: null,
  openLightbox: (items, index) => set({ lightbox: { items, index } }),
  setLightboxIndex: (index) => set((s) => (s.lightbox ? { lightbox: { ...s.lightbox, index } } : s)),
  closeLightbox: () => set({ lightbox: null }),
  articleId: null,
  openArticle: (id) => set({ articleId: id }),
  closeArticle: () => set({ articleId: null }),
  tourId: null,
  openTour: (id) => set({ tourId: id }),
  closeTour: () => set({ tourId: null }),
}));

export function loadStoredLang() {
  try {
    const v = localStorage.getItem(LANG_KEY);
    if (v === "de" || v === "en") return v;
    return "de";
  } catch {
    return "de";
  }
}

export function useTx() {
  const lang = useSI((s) => s.lang);
  return { lang, t: (l: L) => l[lang] };
}

export function waLink(text: string) {
  return `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(text)}`;
}

export function formatTHB(n: number) {
  return `฿${n.toLocaleString("en-US")}`;
}

export function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}
