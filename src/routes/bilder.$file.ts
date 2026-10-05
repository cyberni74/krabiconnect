import { createFileRoute } from "@tanstack/react-router";
import { upstreamFor } from "@/components/secret-islands/image-map";

/**
 * /bilder/<seo-name>.webp – same-origin, SEO-named image URLs for the generated scene photos.
 * Proxies the Higgsfield CDN once; Vercel's edge then serves it from cache for a year.
 */
export const Route = createFileRoute("/bilder/$file")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const upstream = upstreamFor(params.file);
        if (!upstream) return new Response("Not found", { status: 404 });
        const res = await fetch(upstream);
        if (!res.ok || !res.body) return new Response("Upstream error", { status: 502 });
        return new Response(res.body, {
          headers: {
            "content-type": res.headers.get("content-type") ?? (params.file.endsWith(".png") ? "image/png" : "image/webp"),
            "cache-control": "public, max-age=31536000, s-maxage=31536000, immutable",
          },
        });
      },
    },
  },
});
