import { create } from "zustand";
import { BRAND, LANGS, type L, type Lang } from "./content";
import { DICTS } from "./i18n";

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

const SUPPORTED = new Set<Lang>(LANGS.map((l) => l.id));

/** Map a BCP-47 tag (e.g. "zh-TW", "ko-KR", "de-AT") to a supported language. */
export function matchLang(tag: string): Lang | null {
  const base = tag.toLowerCase().split(/[-_]/)[0] as Lang;
  return SUPPORTED.has(base) ? base : null;
}

/** Saved choice first, then the browser's language list, else English. */
export function detectLang(): Lang {
  try {
    const v = localStorage.getItem(LANG_KEY) as Lang | null;
    if (v && SUPPORTED.has(v)) return v;
  } catch {
    /* storage unavailable */
  }
  try {
    const list = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const tag of list) {
      const m = tag ? matchLang(tag) : null;
      if (m) return m;
    }
  } catch {
    /* navigator unavailable */
  }
  return "en";
}

/** Translate a source string. zh/ko/ja are keyed by the German text and fall back to English. */
export function translate(l: L, lang: Lang): string {
  if (lang === "de" || lang === "en") return l[lang];
  return DICTS[lang][l.de] ?? l.en;
}

export function translateList(list: { de: string[]; en: string[] }, lang: Lang): string[] {
  return list.de.map((de, i) => translate({ de, en: list.en[i] ?? de }, lang));
}

export function useTx() {
  const lang = useSI((s) => s.lang);
  return {
    lang,
    t: (l: L) => translate(l, lang),
    tl: (list: { de: string[]; en: string[] }) => translateList(list, lang),
    /** Text sent to the operator (WhatsApp / e-mail): German for German visitors, otherwise English. */
    tOp: (l: L) => l[lang === "de" ? "de" : "en"],
  };
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
