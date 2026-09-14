import { createFileRoute } from "@tanstack/react-router";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
};

export const Route = createFileRoute("/api/agent")({
  server: {
    handlers: {
      OPTIONS: () => new Response(null, { status: 204, headers: cors }),
      GET: async () => {
        const { AGENT_SCHEMA, agentBlobStatus } = await import("@/lib/server/agent.server");
        const blob = await agentBlobStatus();
        return Response.json(
          {
            name: "KrabiMarketplace agent API",
            schema: AGENT_SCHEMA,
            blob,
            endpoints: {
              "GET /api/agent/listings": "Validate Bearer token → { ok, valid }",
              "POST /api/agent/listings":
                "Create listings. Duplicate sourceUrl/id is not a second row; empty/fbid-HTML images are upgraded from incoming images[]. fbcdn is rewritten to /api/img?u=…; rehosted to Vercel Blob when BLOB_READ_WRITE_TOKEN is set.",
              "PATCH /api/agent/listings/:id":
                "Replace images and/or seed English overlay { titleEn, descriptionEn }. Thai columns stay untouched. translate: true fills English via public MT when XAI_API_KEY is unset. Bearer token required.",
              "POST /api/agent/listings/:id/translate-seed":
                "Seed title_en/description_en from Thai originals (xAI or MyMemory/LibreTranslate). Does not change title_th.",
              "GET /api/img?u=": "Public image proxy for listing heroes (fbcdn). No agent token.",
              "POST /api/agent/rehost":
                "Bearer token. { url } → Vercel Blob { ok, url }. 503 if BLOB_READ_WRITE_TOKEN is unset.",
              "POST /api/agent/listings/rehost-image":
                'Body { "url": "https://…" } or multipart file → { ok: true, url: "https://….public.blob.vercel-storage.com/…" }. Requires BLOB_READ_WRITE_TOKEN.',
              "POST /api/agent/listings/rehost-backfill":
                "Rehost stored listing images onto owned Blob URLs. Optional { id, limit }. Requires BLOB_READ_WRITE_TOKEN.",
            },
          },
          { headers: cors },
        );
      },
    },
  },
});
