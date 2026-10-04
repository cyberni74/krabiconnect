import { createFileRoute } from "@tanstack/react-router";
import { ARTICLES, GUIDE_UPDATED } from "@/components/krabi-guide/articles";
import { LANGS, type Lang } from "@/components/secret-islands/content";
import { GUIDE_PATH, LANDING_PATH, htmlLang, pageUrl } from "@/components/secret-islands/seo";

/**
 * XML sitemap for /secret-islands and the Krabi Insider Guide (all language URLs + hreflang alternates).
 * Marketplace pages are not listed here – add them (or a sitemap index) when they should be submitted.
 * TODO(owner): bump LANDING_UPDATED when the landing page content changes materially (lastmod must be truthful).
 */
const LANDING_UPDATED = "2026-10-04";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function entries(path: string, langs: readonly Lang[], lastmod: string) {
  const alternates = [
    ...langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${htmlLang(l)}" href="${esc(pageUrl(path, l))}"/>`),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(pageUrl(path, "de"))}"/>`,
  ].join("\n");
  return langs.map(
    (l) => `  <url>\n    <loc>${esc(pageUrl(path, l))}</loc>\n    <lastmod>${lastmod}</lastmod>\n${alternates}\n  </url>`,
  );
}

function buildSitemap() {
  const urls = [
    ...entries(LANDING_PATH, LANGS.map((l) => l.id), LANDING_UPDATED),
    ...entries(GUIDE_PATH, ["de", "en"], GUIDE_UPDATED),
    ...ARTICLES.flatMap((a) => entries(`${GUIDE_PATH}/${a.slug}`, ["de", "en"], a.updated)),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
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
