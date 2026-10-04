/**
 * Krabi Insider Guide – article index.
 * Article bodies live in ./data-*.ts (split for maintainability); this file merges them,
 * adds reading time / anchor ids and exports the keyword map used for SEO planning.
 */
import { ISLAND_ARTICLES_A } from "./data-islands-a";
import { ISLAND_ARTICLES_B } from "./data-islands-b";
import { INSIDER_ARTICLES_A } from "./data-insider-a";
import { INSIDER_ARTICLES_B } from "./data-insider-b";
import { PILLAR_ARTICLES } from "./data-pillar";
import { SNORKEL_RELAX } from "./data-snorkel-relax";
import { EXTRA_SECTIONS } from "./data-extra";
import { EXTRA_SECTIONS_2 } from "./data-extra2";
import type { Bi, GuideArticle, GuideArticleInput, GuideCategory, GuideSection } from "./types";

export type { Bi, GuideArticle, GuideCategory, GuideImage, GuideSection } from "./types";

export const GUIDE_UPDATED = "2026-10-04";
export const SITE_URL = "https://krabi-secret-islands.com";

/* ───────────────────────── Keyword map ─────────────────────────
 * Research basis: SERP review (DE + EN) of Krabi island / tour queries, Oct 2026.
 * No volume data available in this environment → priority = judgement of commercial value × intent fit.
 * intent: info = informational, comm = commercial investigation, trans = transactional (booking).
 */
export type KeywordIntent = "info" | "comm" | "trans";
export const KEYWORD_MAP: {
  slug: string;
  primary: { de: string; en: string };
  secondary: string[];
  intent: KeywordIntent[];
  note: string;
}[] = [
  { slug: "krabi-islands-insider-guide", primary: { de: "Krabi Inseln", en: "Krabi islands" }, secondary: ["Inseln bei Krabi", "best islands Krabi", "Krabi Geheimtipps", "Ao Nang Inseln", "Schnorcheln Krabi"], intent: ["info", "comm"], note: "Pillar/hub – links to every island page." },
  { slug: "best-time-to-visit-krabi", primary: { de: "Krabi beste Reisezeit", en: "best time to visit Krabi" }, secondary: ["Krabi Regenzeit", "Krabi Monsun", "Krabi Wetter", "Krabi weather by month", "Maya Bay closure"], intent: ["info"], note: "Pillar – seasonal planning; feeds tour bookings by month." },
  { slug: "krabi-island-hopping-planner", primary: { de: "Krabi Insel-Hopping", en: "Krabi island hopping" }, secondary: ["Krabi private boat tour", "Speedboat Krabi", "Longtail Boot Krabi", "Ao Nang Bootstour"], intent: ["comm", "trans"], note: "Pillar – closest to booking intent (boat choice)." },
  { slug: "koh-poda-guide", primary: { de: "Koh Poda", en: "Koh Poda" }, secondary: ["Poda Island", "Koh Poda Schnorcheln", "Poda Island sunset"], intent: ["info"], note: "Island page." },
  { slug: "chicken-island-tup-sandbar", primary: { de: "Tup Sandbank Ebbe", en: "Tup Island sandbar" }, secondary: ["Chicken Island Krabi", "Koh Tup", "Thale Waek", "Krabi snorkeling"], intent: ["info"], note: "Island page – tide-driven query." },
  { slug: "railay-phra-nang-cave", primary: { de: "Railay Phra Nang Cave", en: "Phra Nang Cave Beach" }, secondary: ["Railay Beach Krabi", "Phra Nang Lagoon", "Railay Viewpoint"], intent: ["info"], note: "Island page." },
  { slug: "hong-island-krabi", primary: { de: "Hong Island Krabi", en: "Hong Island Krabi" }, secondary: ["Koh Hong Krabi", "Hong Lagune", "Hong Island Viewpoint", "Hong Island Tour"], intent: ["info", "comm"], note: "Island page – disambiguate from Koh Hong (Phang Nga)." },
  { slug: "koh-lao-lading-koh-pakbia", primary: { de: "Koh Lao Lading", en: "Koh Lao Lading" }, secondary: ["Koh Pakbia", "Hong Archipel", "Pakbia snorkeling"], intent: ["info"], note: "Island page – long tail." },
  { slug: "koh-roi-hidden-lagoon", primary: { de: "Koh Roi", en: "Koh Roi lagoon" }, secondary: ["Koh Roi Lagune", "secret lagoon Krabi", "Phang Nga Bucht Geheimtipp"], intent: ["info", "comm"], note: "Island page – core USP destination." },
  { slug: "koh-kudu-koh-nok", primary: { de: "Koh Kudu", en: "Koh Kudu" }, secondary: ["Koh Kudu Yai", "Koh Nok", "ruhige Inseln Krabi"], intent: ["info", "comm"], note: "Island page – core USP destination." },
  { slug: "phi-phi-maya-bay-early-morning", primary: { de: "Phi Phi früh morgens", en: "Phi Phi early morning" }, secondary: ["Maya Bay Regeln", "Phi Phi Tour ab Krabi", "Pileh Lagoon", "Bamboo Island"], intent: ["info", "comm"], note: "Island page – timing angle." },
  { slug: "koh-rok-koh-haa", primary: { de: "Koh Rok Schnorcheln", en: "Koh Rok snorkeling" }, secondary: ["Koh Haa", "Koh Rok Nai", "Mu Ko Lanta Nationalpark"], intent: ["info", "comm"], note: "Island page – seasonal." },
  { slug: "james-bond-island-phang-nga-bay", primary: { de: "James Bond Island ab Krabi", en: "James Bond Island tour from Krabi" }, secondary: ["Phang Nga Bay", "Khao Phing Kan", "Koh Panyee", "Koh Tapu"], intent: ["comm", "trans"], note: "Island page." },
  { slug: "avoid-crowds-krabi-timing", primary: { de: "Krabi ohne Touristenmassen", en: "Krabi avoid crowds" }, secondary: ["beste Uhrzeit Inseltour Krabi", "Krabi quiet islands", "Krabi Geheimtipps"], intent: ["info"], note: "Insider – supports private-boat USP." },
  { slug: "krabi-tides-guide", primary: { de: "Krabi Gezeiten", en: "Krabi tide table" }, secondary: ["Ebbe und Flut Krabi", "Springtide Krabi", "Tup Sandbank Ebbe"], intent: ["info"], note: "Insider." },
  { slug: "krabi-bioluminescent-plankton-night-boat-tour", primary: { de: "leuchtendes Plankton Krabi", en: "Krabi bioluminescent plankton" }, secondary: ["Biolumineszenz Krabi", "Krabi night boat tour", "Plankton Tour Ao Nang"], intent: ["info", "trans"], note: "Insider – private speedboat only (no kayak). Tours: plankton-night, sunset-glow-combo." },
  { slug: "krabi-fishing-guide", primary: { de: "Angeln Krabi", en: "Krabi fishing trip" }, secondary: ["Krabi Angeltour", "deep sea fishing Krabi", "squid fishing Krabi", "catch and cook Krabi"], intent: ["comm", "trans"], note: "Insider – links all 4 fishing tours." },
  { slug: "krabi-with-kids", primary: { de: "Krabi mit Kindern", en: "Krabi with kids" }, secondary: ["Krabi Familienurlaub", "family boat tour Krabi", "Ao Nang mit Kindern"], intent: ["info", "comm"], note: "Insider." },
  { slug: "boat-day-packing-list-etiquette", primary: { de: "Packliste Bootstour Thailand", en: "what to bring boat trip Krabi" }, secondary: ["riffschonende Sonnencreme Thailand", "Nationalpark Regeln Krabi"], intent: ["info"], note: "Insider." },
  { slug: "krabi-photo-drone-spots", primary: { de: "Krabi Fotospots", en: "Krabi photo spots" }, secondary: ["Krabi drone spots", "Drohne Thailand Regeln", "Instagram Spots Krabi"], intent: ["info", "comm"], note: "Insider – drone package upsell." },
  { slug: "secret-beaches-lagoons-krabi", primary: { de: "Krabi Geheimtipps Strände", en: "secret beaches Krabi" }, secondary: ["hidden lagoon Krabi", "Krabi Lagunen", "Krabi hidden gems"], intent: ["info", "comm"], note: "Insider – real places only." },
  { slug: "best-snorkeling-spots-krabi", primary: { de: "Schnorcheln Krabi", en: "Krabi snorkeling" }, secondary: ["beste Schnorchelspots Krabi", "best snorkeling Krabi", "Koh Rok snorkeling"], intent: ["info", "comm"], note: "Insider – owner priority (snorkel/swim/relax)." },
];

/* ───────────────────────── Categories ───────────────────────── */
export const GUIDE_CATEGORIES: { id: "all" | GuideCategory; label: Bi }[] = [
  { id: "all", label: { de: "Alle", en: "All" } },
  { id: "pillar", label: { de: "Grundlagen", en: "Essentials" } },
  { id: "island", label: { de: "Inseln", en: "Islands" } },
  { id: "insider", label: { de: "Insider-Wissen", en: "Insider know-how" } },
];

export const CATEGORY_LABEL: Record<GuideCategory, Bi> = {
  pillar: { de: "Grundlagen", en: "Essentials" },
  island: { de: "Insel-Guide", en: "Island guide" },
  insider: { de: "Insider-Wissen", en: "Insider know-how" },
};

/* ───────────────────────── Merge + derive ───────────────────────── */
export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function words(s: string) {
  return s.split(/\s+/).filter(Boolean).length;
}

/** Word count of one language version (intro + sections + faq). */
export function wordCount(a: GuideArticleInput, lang: "de" | "en") {
  let n = words(a.intro[lang]);
  for (const s of a.sections) {
    n += words(s.h2[lang]);
    for (const p of s.body[lang]) n += words(p);
    if (s.tip) n += words(s.tip[lang]);
    for (const li of s.list?.[lang] ?? []) n += words(li);
  }
  for (const f of a.faq) n += words(f.q[lang]) + words(f.a[lang]);
  return n;
}

function finalize(a: GuideArticleInput): GuideArticle {
  const extra: GuideSection[] = [...(EXTRA_SECTIONS[a.slug] ?? []),
    ...(EXTRA_SECTIONS_2[a.slug] ?? []),
    ...(SNORKEL_RELAX[a.slug] ? [SNORKEL_RELAX[a.slug]] : [])];
  const sections: GuideSection[] = extra.length ? [...a.sections.slice(0, -1), ...extra, ...a.sections.slice(-1)] : a.sections;
  const withSections = { ...a, sections };
  return {
    ...withSections,
    sections: sections.map((s) => ({ ...s, id: s.id ?? slugify(s.h2.en) })),
    readingMinutes: Math.max(3, Math.round(wordCount(withSections, "de") / 200)),
    updated: GUIDE_UPDATED,
  };
}

export const ARTICLES: GuideArticle[] = [
  ...PILLAR_ARTICLES,
  ...ISLAND_ARTICLES_A,
  ...ISLAND_ARTICLES_B,
  ...INSIDER_ARTICLES_A,
  ...INSIDER_ARTICLES_B,
].map(finalize);

const BY_SLUG = new Map(ARTICLES.map((a) => [a.slug, a]));

export function getArticle(slug: string): GuideArticle | undefined {
  return BY_SLUG.get(slug);
}

export function relatedArticles(a: GuideArticle): GuideArticle[] {
  return a.related.map((s) => BY_SLUG.get(s)).filter((x): x is GuideArticle => !!x);
}

/**
 * Licensed guide photos that are already uploaded to /public/images/guide/.
 * Add a file name here once the file exists; until then the article's IMG.* fallback is shown
 * (avoids 404 requests for photos that are still missing).
 */
export const GUIDE_IMAGES_READY = new Set<string>([
  // "krabi-leuchtendes-plankton-nacht-speedboat-1.webp",
]);

export function guideImageSrc(img: { src: string; fallback: string }) {
  const file = img.src.split("/").pop() ?? "";
  return GUIDE_IMAGES_READY.has(file) ? img.src : img.fallback;
}

export const FEATURED_SLUG = "krabi-islands-insider-guide";
export const ISLAND_ARTICLES = ARTICLES.filter((a) => a.category === "island");
