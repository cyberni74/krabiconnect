import { createFileRoute } from "@tanstack/react-router";
import { ARTICLES, GUIDE_UPDATED, readyGuideImages, type GuideArticle } from "@/components/krabi-guide/articles";
import { AERIAL_SHOTS, GALLERY, IMG, LANGS, TOURS, type Lang } from "@/components/secret-islands/content";
import { GUIDE_PATH, LANDING_PATH, absUrl, htmlLang, pageUrl } from "@/components/secret-islands/seo";

/**
 * XML sitemap for /secret-islands and the Krabi Insider Guide (all language URLs + hreflang alternates).
 * Marketplace pages are not listed here – add them (or a sitemap index) when they should be submitted.
 * TODO(owner): bump LANDING_UPDATED when the landing page content changes materially (lastmod must be truthful).
 */
const LANDING_UPDATED = "2026-10-04";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Image sitemap: only <image:loc> is still used by Google (caption/title/geo/license were deprecated in 2022). */
function imageTags(images: readonly string[]) {
  return [...new Set(images.map(absUrl))]
    .map((src) => `    <image:image>\n      <image:loc>${esc(src)}</image:loc>\n    </image:image>`)
    .join("\n");
}

const tourImages = (ids?: readonly string[]) => TOURS.filter((t) => !ids || ids.includes(t.id)).map((t) => t.image);

/** Images visible on the landing page (hero, tour cards, aerial shots, gallery). */
const LANDING_IMAGES = [IMG.hero, ...tourImages(), ...AERIAL_SHOTS.map((s) => s.src), ...GALLERY.map((g) => g.src)];
/** Hub: the article card images. */
const HUB_IMAGES = ARTICLES.map((a) => a.image);
/** Article: hero, uploaded gallery photos, tour cards. */
const articleImages = (a: GuideArticle) => [a.image, ...readyGuideImages(a).map((i) => i.src), ...tourImages(a.tourIds)];

function entries(path: string, langs: readonly Lang[], lastmod: string, images: readonly string[] = []) {
  const alternates = [
    ...langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${htmlLang(l)}" href="${esc(pageUrl(path, l))}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(pageUrl(path, "de"))}"/>`,
  ].join("\n");
  const imgs = images.length ? `\n${imageTags(images)}` : "";
  return langs.map(
    (l) => `  <url>\n    <loc>${esc(pageUrl(path, l))}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alternates}${imgs}\n  </url>`,
  );
}

function buildSitemap() {
  const urls = [
    ...entries(LANDING_PATH, LANGS.map((l) => l.id), LANDING_UPDATED, LANDING_IMAGES),
    ...entries(GUIDE_PATH, ["de", "en"], GUIDE_UPDATED, HUB_IMAGES),
    ...ARTICLES.flatMap((a) => entries(`${GUIDE_PATH}/${a.slug}`, ["de", "en"], a.updated, articleImages(a))),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join("\n")}
</urlset>
`;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(buildSitemap(), {
          headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" },
        }),
    },
  },
});
