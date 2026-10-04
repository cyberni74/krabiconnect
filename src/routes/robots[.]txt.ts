import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL } from "@/components/secret-islands/seo";

/**
 * robots.txt – everything public stays crawlable (incl. marketplace pages and /api/img images);
 * only auth / agent APIs and private account areas are excluded.
 */
const BODY = [
  "User-agent: *",
  "Allow: /",
  "Disallow: /api/auth/",
  "Disallow: /api/agent",
  "Disallow: /admin",
  "Disallow: /account",
  "Disallow: /chats",
  "",
  `Sitemap: ${SITE_URL}/sitemap.xml`,
  "",
].join("\n");

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(BODY, {
          headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" },
        }),
    },
  },
});
