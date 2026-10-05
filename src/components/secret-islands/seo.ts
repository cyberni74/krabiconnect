/**
 * SEO helpers for /secret-islands and the Krabi Insider Guide: absolute URLs, hreflang alternates,
 * social meta and schema.org JSON-LD (rendered by TanStack <HeadContent> via `{ "script:ld+json": … }`).
 *
 * Rules (Google structured-data policies):
 * - Only mark up content that is visible on the same URL.
 * - No AggregateRating/Review markup: the reviews on the page are placeholders, not verified customer reviews.
 * - Business facts come from BRAND only. Missing facts are left out (not invented) and flagged with TODO below.
 */
import { BRAND, FAQ, LANGS, LOGO_URL, SEO_META, TOURS, UI, type L, type Lang } from "./content";
import { LONGTAIL_FAQ, longtailAnswerText } from "./longtail-faq";
import { translate } from "./store";

export const SITE_URL = "https://krabi-secret-islands.com";
export const LANDING_PATH = "/secret-islands";
export const GUIDE_PATH = "/krabi-guide";
export const BUSINESS_ID = `${SITE_URL}${LANDING_PATH}#business`;

/** Absolute URL for an image/asset path (structured data, sitemaps and og:image need absolute URLs). */
export function absUrl(src: string) {
  return src.startsWith("/") ? `${SITE_URL}${src}` : src;
}

/**
 * Allow large image previews in Search/Discover (Google robots meta `max-image-preview:large`).
 * Indexing defaults (index, follow) stay implicit.
 */
export const ROBOTS_LARGE_IMAGES = { name: "robots", content: "max-image-preview:large" } as const;

/** Absolute, language-addressable URL. German is the default (no parameter). */
export function pageUrl(path: string, lang: Lang = "de") {
  return lang === "de" ? `${SITE_URL}${path}` : `${SITE_URL}${path}?lang=${lang}`;
}

const HTML_LANG: Record<Lang, string> = Object.fromEntries(LANGS.map((l) => [l.id, l.html])) as Record<Lang, string>;
const OG_LOCALE: Record<Lang, string> = { de: "de_DE", en: "en_US", zh: "zh_CN", ko: "ko_KR", ja: "ja_JP" };

export function htmlLang(lang: Lang) {
  return HTML_LANG[lang];
}

/** canonical (self-referencing) + hreflang for every available language + x-default (German default URL). */
export function langLinks(path: string, lang: Lang, available: readonly Lang[]) {
  return [
    { rel: "canonical", href: pageUrl(path, lang) },
    ...available.map((l) => ({ rel: "alternate", hrefLang: HTML_LANG[l], href: pageUrl(path, l) })),
    { rel: "alternate", hrefLang: "x-default", href: pageUrl(path, "de") },
  ];
}

/** Shared <head> links of the Secret Islands / Insider Guide pages. */
export const BRAND_HEAD_LINKS = [
  { rel: "icon", type: "image/png", href: LOGO_URL },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap",
  },
];

/**
 * Open Graph / Twitter tags. NOTE: on HTML responses the platform's PWA injector (scripts/grok-pwa-shared.mjs)
 * strips og:* / twitter:* and re-adds its own share card (og:title = <title>). These route-level tags therefore
 * only survive where the injector does not run; the per-page title still reaches og:title via <title>.
 */
export function socialMeta(o: { title: string; description: string; url: string; image?: string; type: "website" | "article"; lang: Lang }) {
  return [
    { property: "og:type", content: o.type },
    { property: "og:site_name", content: BRAND.name },
    { property: "og:title", content: o.title },
    { property: "og:description", content: o.description },
    { property: "og:url", content: o.url },
    { property: "og:locale", content: OG_LOCALE[o.lang] },
    ...(o.image ? [{ property: "og:image", content: absUrl(o.image) }] : []),
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: o.title },
    { name: "twitter:description", content: o.description },
    ...(o.image ? [{ name: "twitter:image", content: absUrl(o.image) }] : []),
  ];
}

/* ───────────────────────── JSON-LD ───────────────────────── */

type Json = Record<string, unknown>;

const prices = TOURS.map((t) => t.price);

/** The business (TravelAgency ⊂ LocalBusiness). */
export function businessNode(lang: Lang): Json {
  return {
    "@type": "TravelAgency",
    "@id": BUSINESS_ID,
    name: BRAND.name,
    url: `${SITE_URL}${LANDING_PATH}`,
    logo: `${SITE_URL}${LOGO_URL}`,
    image: `${SITE_URL}/images/krabi-secret-islands-privates-speedboat.jpg`,
    email: BRAND.email,
    // TODO(owner): `telephone` omitted on purpose – BRAND.whatsapp is still a placeholder number.
    // TODO(owner): add streetAddress / postalCode (and `geo`) of the pier or office once confirmed.
    address: { "@type": "PostalAddress", addressLocality: "Ao Nang", addressRegion: "Krabi", addressCountry: "TH" },
    areaServed: [
      { "@type": "AdministrativeArea", name: "Krabi" },
      { "@type": "Place", name: "Ao Nang" },
      { "@type": "Place", name: "Phang Nga Bay" },
    ],
    priceRange: `฿${Math.min(...prices).toLocaleString("en-US")}–฿${Math.max(...prices).toLocaleString("en-US")}`,
    description: translate(SEO_META.description, lang),
    // TODO(owner): add `sameAs` (Instagram, Facebook, TripAdvisor, Google Business Profile) once the profiles exist.
  };
}

/** All tours as TouristTrip items with THB offers (price per boat, as shown on the tour cards). */
function toursNode(lang: Lang, url: string): Json {
  return {
    "@type": "ItemList",
    "@id": `${url}#tours`,
    itemListElement: TOURS.map((tour, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "TouristTrip",
        name: translate(tour.title, lang),
        description: translate(tour.description, lang),
        image: absUrl(tour.image),
        tripOrigin: { "@type": "Place", name: "Ao Nang, Krabi" },
        itinerary: {
          "@type": "ItemList",
          itemListElement: tour.stops.map((s, j) => ({ "@type": "ListItem", position: j + 1, item: { "@type": "Place", name: s } })),
        },
        provider: { "@id": BUSINESS_ID },
        offers: {
          "@type": "Offer",
          price: tour.price,
          priceCurrency: "THB",
          url: `${url}#touren`,
          description: translate(UI.perBoat, lang),
        },
      },
    })),
  };
}

function faqNode(url: string, items: { q: string; a: string }[]): Json {
  return {
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

function breadcrumbNode(url: string, crumbs: { name: string; url: string }[]): Json {
  return {
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumb`,
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url })),
  };
}

const HOME_CRUMB: L = { de: "Startseite", en: "Home" };

/** /secret-islands: business + page + tours + ONE FAQPage (regular FAQ + Longtail-vs-Speedboat FAQ, both visible). */
export function landingJsonLd(lang: Lang): Json {
  const url = pageUrl(LANDING_PATH, lang);
  const tr = (l: L) => translate(l, lang);
  return {
    "@context": "https://schema.org",
    "@graph": [
      businessNode(lang),
      {
        "@type": "WebPage",
        "@id": url,
        url,
        name: tr(SEO_META.title),
        description: tr(SEO_META.description),
        inLanguage: HTML_LANG[lang],
        about: { "@id": BUSINESS_ID },
        mainEntity: { "@id": `${url}#tours` },
      },
      toursNode(lang, url),
      faqNode(url, [
        ...LONGTAIL_FAQ.map((f) => ({ q: tr(f.q), a: longtailAnswerText(f, tr) })),
        ...FAQ.map((f) => ({ q: tr(f.q), a: tr(f.a) })),
      ]),
    ],
  };
}

type GuideLang = "de" | "en";
type Bi = { de: string; en: string };

/** /krabi-guide hub: CollectionPage + ItemList of all articles + breadcrumb. */
export function guideHubJsonLd(
  lang: GuideLang,
  page: { title: string; description: string },
  articles: { slug: string; title: Bi }[],
): Json {
  const url = pageUrl(GUIDE_PATH, lang);
  return {
    "@context": "https://schema.org",
    "@graph": [
      businessNode(lang),
      {
        "@type": "CollectionPage",
        "@id": url,
        url,
        name: page.title,
        description: page.description,
        inLanguage: lang,
        publisher: { "@id": BUSINESS_ID },
        breadcrumb: { "@id": `${url}#breadcrumb` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: articles.length,
          itemListElement: articles.map((a, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: pageUrl(`${GUIDE_PATH}/${a.slug}`, lang),
            name: a.title[lang],
          })),
        },
      },
      breadcrumbNode(url, [
        { name: HOME_CRUMB[lang], url: pageUrl(LANDING_PATH, lang) },
        { name: "Insider Guide", url },
      ]),
    ],
  };
}

/** Guide article: BlogPosting + BreadcrumbList (matches the visible breadcrumb) + FAQPage (visible <details> FAQ). */
export function guideArticleJsonLd(
  lang: GuideLang,
  a: {
    slug: string;
    title: Bi;
    h1: Bi;
    short: Bi;
    metaDescription: Bi;
    image: string;
    /** Extra visible photos of the article (absolute URLs are built here). */
    gallery?: string[];
    updated: string;
    keywords: string[];
    readingMinutes: number;
    faq: { q: Bi; a: Bi }[];
  },
  section: string,
): Json {
  const url = pageUrl(`${GUIDE_PATH}/${a.slug}`, lang);
  return {
    "@context": "https://schema.org",
    "@graph": [
      businessNode(lang),
      {
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        headline: a.h1[lang],
        name: a.title[lang],
        description: a.metaDescription[lang],
        // TODO(images): add 16:9, 4:3 and 1:1 crops per article (Google Article image guidance) once files are local.
        image: [a.image, ...(a.gallery ?? [])].map(absUrl),
        // The guide went live with this revision; set datePublished per article once articles get individual dates.
        datePublished: a.updated,
        dateModified: a.updated,
        inLanguage: lang,
        articleSection: section,
        keywords: a.keywords.join(", "),
        timeRequired: `PT${a.readingMinutes}M`,
        // TODO(owner): if a named captain/author writes or reviews the guide, add a Person author with a profile URL (E-E-A-T).
        author: { "@type": "Organization", name: BRAND.name, url: `${SITE_URL}${LANDING_PATH}` },
        publisher: { "@id": BUSINESS_ID },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        isPartOf: { "@type": "Blog", "@id": pageUrl(GUIDE_PATH, lang), name: "Krabi Insider Guide" },
      },
      breadcrumbNode(url, [
        { name: HOME_CRUMB[lang], url: pageUrl(LANDING_PATH, lang) },
        { name: "Insider Guide", url: pageUrl(GUIDE_PATH, lang) },
        { name: a.short[lang], url },
      ]),
      faqNode(url, a.faq.map((f) => ({ q: f.q[lang], a: f.a[lang] }))),
    ],
  };
}
