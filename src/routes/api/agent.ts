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
                "Replace images (cover = images[0]). fbcdn → /api/img?u=…; Blob rehost when the token is set. Bearer token required.",
              "GET /api/img?u=": "Public image proxy for listing heroes (fbcdn). No agent token.",
              "POST /api/agent/rehost":
                "Bearer token. { url } → Vercel Blob { ok, url }. 503 if BLOB_READ_WRITE_TOKEN is unset.",
              "POST /api/agent/listings/rehost-image":
                'Body { "url": "https://…" } or multipart file → { ok: true, url }. Requires BLOB_READ_WRITE_TOKEN. Private stores: auto-fallback from public put; returned URL is signed or /api/img so <img> works without cookies.',
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
